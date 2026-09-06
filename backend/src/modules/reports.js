const express = require('express');
const prisma = require('../core/prismaClient');
const { authenticate, authorize } = require('../middleware/rbac');

const router = express.Router();

// A date-only string like "2026-09-05" parses to midnight UTC. Used as an
// inclusive upper bound that excludes anything posted later that same day —
// entries carry a full timestamp, not just a date. Push the bound to the
// last instant of the day so "as of today" actually includes today.
function endOfDay(dateStr) {
  const d = new Date(dateStr);
  d.setUTCHours(23, 59, 59, 999);
  return d;
}

async function getAccountBreakdown(types, startDate, endDate) {
  const accounts = await prisma.account.findMany({
    where: { type: { in: types } },
    include: {
      journalItems: {
        where: {
          entry: {
            status: 'POSTED',
            ...(startDate && endDate && {
              accountingDate: { gte: new Date(startDate), lte: endOfDay(endDate) }
            })
          }
        },
        select: { debit: true, credit: true }
      }
    }
  });

  return accounts.map(account => {
    const totalDebit  = account.journalItems.reduce((s, i) => s + i.debit,  0);
    const totalCredit = account.journalItems.reduce((s, i) => s + i.credit, 0);
    return {
      id:      account.id,
      name:    account.name,
      type:    account.type,
      balance: totalDebit - totalCredit
    };
  }).filter(a => a.balance !== 0);
}

// ─── PROFIT & LOSS ───────────────────────────────────────────────────

router.get('/profit-loss', authenticate, authorize(['ADMIN', 'ACCOUNTANT']), async (req, res) => {
  try {
    const year      = req.query.year || new Date().getFullYear();
    const startDate = req.query.startDate || `${year}-01-01`;
    const endDate   = req.query.endDate   || `${year}-12-31`;

    const incomeAccounts  = await getAccountBreakdown(['INCOME'],                   startDate, endDate);
    const expenseAccounts = await getAccountBreakdown(['EXPENSE', 'OTHER_EXPENSE'], startDate, endDate);

    const totalIncome  = incomeAccounts.reduce((s, a)  => s + (-a.balance), 0);
    const totalExpense = expenseAccounts.reduce((s, a) => s + a.balance,    0);
    const netProfit    = totalIncome - totalExpense;

    res.json({
      period: { startDate, endDate },
      income: {
        accounts: incomeAccounts.map(a => ({ ...a, balance: -a.balance })),
        total:    totalIncome
      },
      expenses: {
        accounts: expenseAccounts,
        total:    totalExpense
      },
      netProfit
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ─── BALANCE SHEET ───────────────────────────────────────────────────

router.get('/balance-sheet', authenticate, authorize(['ADMIN', 'ACCOUNTANT']), async (req, res) => {
  try {
    const asOfDate = req.query.asOfDate || new Date().toISOString().split('T')[0];

    const journalItemsUpTo = (types) => prisma.account.findMany({
      where: { type: { in: types } },
      include: {
        journalItems: {
          where: { entry: { status: 'POSTED', accountingDate: { lte: endOfDay(asOfDate) } } },
          select: { debit: true, credit: true }
        }
      }
    });

    const [assetAccountsRaw, liabilityAccountsRaw, capitalAccountsRaw, incomeAccountsRaw, expenseAccountsRaw] = await Promise.all([
      journalItemsUpTo(['ASSET', 'BANK', 'CASH']),
      journalItemsUpTo(['LIABILITY']),
      journalItemsUpTo(['CAPITAL']),
      journalItemsUpTo(['INCOME']),
      journalItemsUpTo(['EXPENSE', 'OTHER_EXPENSE'])
    ]);

    function mapAccounts(accounts) {
      return accounts.map(a => {
        const debit  = a.journalItems.reduce((s, i) => s + i.debit,  0);
        const credit = a.journalItems.reduce((s, i) => s + i.credit, 0);
        return { id: a.id, name: a.name, type: a.type, balance: debit - credit };
      }).filter(a => a.balance !== 0);
    }

    const assets      = mapAccounts(assetAccountsRaw);
    const liabilities = mapAccounts(liabilityAccountsRaw);
    const capital     = mapAccounts(capitalAccountsRaw);

    // Income/expense accounts don't get closed into Capital by any journal
    // entry in this system, so the accounting equation (Assets = Liabilities
    // + Capital) only holds once retained earnings-to-date are folded in here.
    const netProfitToDate = -mapAccounts(incomeAccountsRaw).reduce((s, a) => s + a.balance, 0)
                           - mapAccounts(expenseAccountsRaw).reduce((s, a) => s + a.balance, 0);

    const capitalLines = capital.map(a => ({ ...a, balance: -a.balance }));
    if (Math.abs(netProfitToDate) > 0.001) {
      capitalLines.push({ id: null, name: 'Retained Earnings (Net Profit)', type: 'CAPITAL', balance: netProfitToDate });
    }

    const totalAssets      = assets.reduce((s, a)      => s + a.balance,  0);
    const totalLiabilities = liabilities.reduce((s, a) => s + (-a.balance), 0);
    const totalCapital     = capitalLines.reduce((s, a) => s + a.balance,  0);

    res.json({
      asOfDate,
      assets:      { accounts: assets,                                              total: totalAssets },
      liabilities: { accounts: liabilities.map(a => ({ ...a, balance: -a.balance })), total: totalLiabilities },
      capital:     { accounts: capitalLines,                                         total: totalCapital },
      balanced: Math.abs(totalAssets - (totalLiabilities + totalCapital)) < 0.001
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ─── BUDGET REPORT ───────────────────────────────────────────────────

router.get('/budget', authenticate, authorize(['ADMIN', 'ACCOUNTANT']), async (req, res) => {
  try {
    const budgets = await prisma.budget.findMany({
      where: { status: { in: ['CONFIRMED', 'REVISED'] } },
      include: { analyticAccount: true, responsible: { select: { id: true, name: true } } },
      orderBy: { createdAt: 'desc' }
    });

    const result = await Promise.all(budgets.map(async (budget) => {
      let achievedAmount = 0;

      if (budget.analyticAccount.type === 'INCOME') {
        const lines = await prisma.customerInvoiceLine.findMany({
          where: {
            analyticAccountId: budget.analyticAccountId,
            invoice: {
              status:      { in: ['CONFIRMED', 'PAID'] },
              invoiceDate: { gte: budget.startDate, lte: budget.endDate }
            }
          }
        });
        achievedAmount = lines.reduce((s, l) => s + l.total, 0);
      } else {
        const lines = await prisma.vendorBillLine.findMany({
          where: {
            analyticAccountId: budget.analyticAccountId,
            bill: {
              status:   { in: ['CONFIRMED', 'PAID'] },
              billDate: { gte: budget.startDate, lte: budget.endDate }
            }
          }
        });
        achievedAmount = lines.reduce((s, l) => s + l.total, 0);
      }

      const achievedPercent = budget.committedAmount
        ? Math.round((achievedAmount / budget.committedAmount) * 100) : 0;

      return {
        id:              budget.id,
        name:            budget.name,
        analyticAccount: budget.analyticAccount.name,
        responsible:     budget.responsible.name,
        period:          { start: budget.startDate, end: budget.endDate },
        committedAmount: budget.committedAmount,
        achievedAmount,
        achievedPercent,
        amountToAchieve: budget.committedAmount - achievedAmount,
        status:          budget.status
      };
    }));

    const totals = {
      committed: result.reduce((s, b) => s + b.committedAmount, 0),
      achieved:  result.reduce((s, b) => s + b.achievedAmount,  0)
    };

    res.json({ budgets: result, totals });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;