const express = require('express');
const prisma = require('../core/prismaClient');
const { authenticate, authorize } = require('../middleware/rbac');

const router = express.Router();

// Achieved Amount = sum of confirmed transaction lines tied to this budget's
// analytic account, within the budget period. Income analytics look at
// Customer Invoice lines, Expense analytics look at Vendor Bill lines.
async function computeAchieved(budget) {
  let achievedAmount = 0;

  if (budget.analyticAccount.type === 'INCOME') {
    const lines = await prisma.customerInvoiceLine.findMany({
      where: {
        analyticAccountId: budget.analyticAccountId,
        invoice: {
          status: 'CONFIRMED',
          invoiceDate: { gte: budget.startDate, lte: budget.endDate }
        }
      }
    });
    achievedAmount = lines.reduce((sum, l) => sum + l.total, 0);
  } else {
    const lines = await prisma.vendorBillLine.findMany({
      where: {
        analyticAccountId: budget.analyticAccountId,
        bill: {
          status: 'CONFIRMED',
          billDate: { gte: budget.startDate, lte: budget.endDate }
        }
      }
    });
    achievedAmount = lines.reduce((sum, l) => sum + l.total, 0);
  }

  const achievedPercent = budget.committedAmount
    ? Math.round((achievedAmount / budget.committedAmount) * 100)
    : 0;
  const amountToAchieve = budget.committedAmount - achievedAmount;

  return { achievedAmount, achievedPercent, amountToAchieve };
}

async function attachComputedFields(budget) {
  const computed = await computeAchieved(budget);
  return { ...budget, ...computed };
}

// LIST all budgets with computed fields
router.get('/', authenticate, authorize(['ADMIN', 'ACCOUNTANT']), async (req, res) => {
  try {
    const budgets = await prisma.budget.findMany({
      include: { analyticAccount: true, responsible: true, revisions: true },
      orderBy: { createdAt: 'desc' }
    });
    const result = await Promise.all(budgets.map(attachComputedFields));
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET single budget with computed fields
router.get('/:id', authenticate, authorize(['ADMIN', 'ACCOUNTANT']), async (req, res) => {
  try {
    const budget = await prisma.budget.findUnique({
      where: { id: parseInt(req.params.id) },
      include: { analyticAccount: true, responsible: true, revisions: true, originalBudget: true }
    });
    if (!budget) return res.status(404).json({ error: 'Budget not found' });
    res.json(await attachComputedFields(budget));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// CREATE budget (always starts as DRAFT)
router.post('/', authenticate, authorize(['ADMIN', 'ACCOUNTANT']), async (req, res) => {
  try {
    const { name, startDate, endDate, analyticAccountId, responsibleId, committedAmount } = req.body;

    if (!name || !startDate || !endDate || !analyticAccountId || !responsibleId || !committedAmount) {
      return res.status(400).json({ error: 'All fields are required' });
    }

    const budget = await prisma.budget.create({
      data: {
        name,
        startDate: new Date(startDate),
        endDate: new Date(endDate),
        analyticAccountId: parseInt(analyticAccountId),
        responsibleId: parseInt(responsibleId),
        committedAmount: parseFloat(committedAmount),
        status: 'DRAFT'
      }
    });
    res.status(201).json(budget);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// CONFIRM: DRAFT -> CONFIRMED
router.post('/:id/confirm', authenticate, authorize(['ADMIN', 'ACCOUNTANT']), async (req, res) => {
  try {
    const budget = await prisma.budget.findUnique({ where: { id: parseInt(req.params.id) } });
    if (!budget) return res.status(404).json({ error: 'Budget not found' });
    if (budget.status !== 'DRAFT') {
      return res.status(400).json({ error: 'Only draft budgets can be confirmed' });
    }

    const updated = await prisma.budget.update({
      where: { id: budget.id },
      data: { status: 'CONFIRMED' }
    });
    res.json(updated);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// CANCEL: DRAFT or CONFIRMED -> CANCELLED
router.post('/:id/cancel', authenticate, authorize(['ADMIN', 'ACCOUNTANT']), async (req, res) => {
  try {
    const budget = await prisma.budget.findUnique({ where: { id: parseInt(req.params.id) } });
    if (!budget) return res.status(404).json({ error: 'Budget not found' });
    if (budget.status === 'CANCELLED' || budget.status === 'REVISED') {
      return res.status(400).json({ error: 'Budget cannot be cancelled from its current status' });
    }

    const updated = await prisma.budget.update({
      where: { id: budget.id },
      data: { status: 'CANCELLED' }
    });
    res.json(updated);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// REVISE: creates a new linked budget in DRAFT, marks the original as REVISED
router.post('/:id/revise', authenticate, authorize(['ADMIN', 'ACCOUNTANT']), async (req, res) => {
  try {
    const original = await prisma.budget.findUnique({ where: { id: parseInt(req.params.id) } });
    if (!original) return res.status(404).json({ error: 'Budget not found' });
    if (original.status !== 'CONFIRMED') {
      return res.status(400).json({ error: 'Only confirmed budgets can be revised' });
    }

    const { committedAmount, startDate, endDate } = req.body;

    const revised = await prisma.budget.create({
      data: {
        name: original.name,
        startDate: startDate ? new Date(startDate) : original.startDate,
        endDate: endDate ? new Date(endDate) : original.endDate,
        analyticAccountId: original.analyticAccountId,
        responsibleId: original.responsibleId,
        committedAmount: committedAmount ? parseFloat(committedAmount) : original.committedAmount,
        status: 'DRAFT',
        originalBudgetId: original.id
      }
    });

    await prisma.budget.update({
      where: { id: original.id },
      data: { status: 'REVISED' }
    });

    res.status(201).json(revised);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;