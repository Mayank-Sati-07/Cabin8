const express = require('express');
const prisma = require('../core/prismaClient');
const { authenticate, authorize } = require('../middleware/rbac');

const router = express.Router();

async function getAccountBreakdown(types, startDate, endDate) {
  const accounts = await prisma.account.findMany({
    where: { type: { in: types } },
    include: {
      journalItems: {
        where: {
          entry: {
            status: 'POSTED',
            ...(startDate && endDate && {
              accountingDate: { gte: new Date(startDate), lte: new Date(endDate) }
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

    const [assetAccountsRaw, liabilityAccountsRaw, capitalAccountsRaw] = await Promise.all([
      prisma.account.findMany({
        where: { type: { in: ['ASSET', 'BANK', 'CASH'] } },
        include: {
          journalItems: {
            where: { entry: { status: 'POSTED', accountingDate: { lte: new Date(asOfDate) } } },
            select: { debit: true, credit: true }
          }
        }
      }),
      prisma.account.findMany({
        where: { type: { in: ['LIABILITY'] } },
        include: {
          journalItems: {
            where: { entry: { status: 'POSTED', accountingDate: { lte: new Date(asOfDate) } } },
            select: { debit: true, credit: true }
          }
        }
      }),
      prisma.account.findMany({
        where: { type: { in: ['CAPITAL'] } },
        include: {
          journalItems: {
            where: { entry: { status: 'POSTED', accountingDate: { lte: new Date(asOfDate) } } },
            select: { debit: true, credit: true }
          }
        }
      })
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

    const totalAssets      = assets.reduce((s, a)      => s + a.balance,  0);
    const totalLiabilities = liabilities.reduce((s, a) => s + (-a.balance), 0);
    const totalCapital     = capital.reduce((s, a)     => s + (-a.balance), 0);

    res.json({
      asOfDate,
      assets:      { accounts: assets,                                           total: totalAssets },
      liabilities: { accounts: liabilities.map(a => ({ ...a, balance: -a.balance })), total: totalLiabilities },
      capital:     { accounts: capital.map(a => ({ ...a, balance: -a.balance })),      total: totalCapital },
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