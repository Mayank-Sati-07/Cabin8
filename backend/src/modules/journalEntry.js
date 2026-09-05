const express = require('express');
const prisma = require('../core/prismaClient');
const { authenticate, authorize } = require('../middleware/rbac');

const router = express.Router();

// LIST all journal entries
router.get('/', authenticate, authorize(['ADMIN', 'ACCOUNTANT']), async (req, res) => {
  try {
    const entries = await prisma.journalEntry.findMany({
      include: {
        journal:  { select: { id: true, name: true } },
        partner:  { select: { id: true, name: true } },
        items:    { include: { account: { select: { id: true, name: true } } } }
      },
      orderBy: { createdAt: 'desc' }
    });
    res.json(entries);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET BY ID
router.get('/:id', authenticate, authorize(['ADMIN', 'ACCOUNTANT']), async (req, res) => {
  try {
    const entry = await prisma.journalEntry.findUnique({
      where: { id: parseInt(req.params.id) },
      include: {
        journal:  true,
        partner:  { select: { id: true, name: true } },
        items:    { include: { account: true } },
        bill:     { select: { id: true, billNumber: true } },
        invoice:  { select: { id: true, invoiceNumber: true } }
      }
    });
    if (!entry) return res.status(404).json({ error: 'Journal Entry not found' });
    res.json(entry);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// CREATE manual journal entry (starts as DRAFT)
router.post('/', authenticate, authorize(['ADMIN', 'ACCOUNTANT']), async (req, res) => {
  try {
    const { journalId, accountingDate, reference, partnerId, items } = req.body;

    if (!journalId || !items || items.length < 2) {
      return res.status(400).json({ error: 'Journal, and at least two line items are required' });
    }

    for (const item of items) {
      if (!item.accountId) {
        return res.status(400).json({ error: 'Each line must have an account' });
      }
      if ((item.debit || 0) === 0 && (item.credit || 0) === 0) {
        return res.status(400).json({ error: 'Each line must have a debit or credit amount' });
      }
    }

    const totalDebit  = items.reduce((s, i) => s + (parseFloat(i.debit)  || 0), 0);
    const totalCredit = items.reduce((s, i) => s + (parseFloat(i.credit) || 0), 0);

    if (Math.abs(totalDebit - totalCredit) > 0.001) {
      return res.status(400).json({
        error: `Entry does not balance. Debit: ${totalDebit.toFixed(2)}, Credit: ${totalCredit.toFixed(2)}`
      });
    }

    const entry = await prisma.journalEntry.create({
      data: {
        journalId:      parseInt(journalId),
        accountingDate: accountingDate ? new Date(accountingDate) : new Date(),
        reference:      reference  || null,
        partnerId:      partnerId  ? parseInt(partnerId) : null,
        status:         'DRAFT',
        items: {
          create: items.map(i => ({
            accountId: parseInt(i.accountId),
            partnerId: partnerId ? parseInt(partnerId) : null,
            debit:     parseFloat(i.debit)  || 0,
            credit:    parseFloat(i.credit) || 0
          }))
        }
      },
      include: { items: { include: { account: true } } }
    });

    res.status(201).json(entry);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// UPDATE manual entry (only DRAFT, cannot edit auto-posted entries)
router.put('/:id', authenticate, authorize(['ADMIN', 'ACCOUNTANT']), async (req, res) => {
  try {
    const entry = await prisma.journalEntry.findUnique({ where: { id: parseInt(req.params.id) } });
    if (!entry) return res.status(404).json({ error: 'Journal Entry not found' });
    if (entry.status === 'POSTED') {
      return res.status(400).json({ error: 'Posted entries cannot be edited. Reset to draft first.' });
    }
    if (entry.billId || entry.invoiceId) {
      return res.status(400).json({ error: 'Auto-generated entries cannot be edited manually' });
    }

    const { journalId, accountingDate, reference, partnerId, items } = req.body;

    if (!items || items.length < 2) {
      return res.status(400).json({ error: 'At least two line items are required' });
    }

    const totalDebit  = items.reduce((s, i) => s + (parseFloat(i.debit)  || 0), 0);
    const totalCredit = items.reduce((s, i) => s + (parseFloat(i.credit) || 0), 0);

    if (Math.abs(totalDebit - totalCredit) > 0.001) {
      return res.status(400).json({
        error: `Entry does not balance. Debit: ${totalDebit.toFixed(2)}, Credit: ${totalCredit.toFixed(2)}`
      });
    }

    await prisma.journalItem.deleteMany({ where: { entryId: entry.id } });

    const updated = await prisma.journalEntry.update({
      where: { id: entry.id },
      data: {
        journalId:      journalId      ? parseInt(journalId)      : entry.journalId,
        accountingDate: accountingDate ? new Date(accountingDate) : entry.accountingDate,
        reference:      reference      || entry.reference,
        partnerId:      partnerId      ? parseInt(partnerId)      : entry.partnerId,
        items: {
          create: items.map(i => ({
            accountId: parseInt(i.accountId),
            partnerId: partnerId ? parseInt(partnerId) : null,
            debit:     parseFloat(i.debit)  || 0,
            credit:    parseFloat(i.credit) || 0
          }))
        }
      },
      include: { items: { include: { account: true } } }
    });

    res.json(updated);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST entry: DRAFT -> POSTED
router.post('/:id/post', authenticate, authorize(['ADMIN', 'ACCOUNTANT']), async (req, res) => {
  try {
    const entry = await prisma.journalEntry.findUnique({
      where: { id: parseInt(req.params.id) },
      include: { items: true }
    });
    if (!entry) return res.status(404).json({ error: 'Journal Entry not found' });
    if (entry.status === 'POSTED') return res.status(400).json({ error: 'Entry is already posted' });

    const totalDebit  = entry.items.reduce((s, i) => s + i.debit,  0);
    const totalCredit = entry.items.reduce((s, i) => s + i.credit, 0);

    if (Math.abs(totalDebit - totalCredit) > 0.001) {
      return res.status(400).json({
        error: `Entry does not balance. Debit: ${totalDebit.toFixed(2)}, Credit: ${totalCredit.toFixed(2)}`
      });
    }

    const updated = await prisma.journalEntry.update({
      where: { id: entry.id },
      data:  { status: 'POSTED' }
    });
    res.json(updated);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// RESET TO DRAFT: POSTED -> DRAFT (manual entries only, Admin only)
router.post('/:id/reset', authenticate, authorize(['ADMIN']), async (req, res) => {
  try {
    const entry = await prisma.journalEntry.findUnique({ where: { id: parseInt(req.params.id) } });
    if (!entry) return res.status(404).json({ error: 'Journal Entry not found' });
    if (entry.status === 'DRAFT') return res.status(400).json({ error: 'Entry is already in draft' });
    if (entry.billId || entry.invoiceId) {
      return res.status(400).json({ error: 'Auto-generated entries cannot be reset' });
    }

    const updated = await prisma.journalEntry.update({
      where: { id: entry.id },
      data:  { status: 'DRAFT' }
    });
    res.json(updated);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;