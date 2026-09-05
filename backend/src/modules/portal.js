const express = require('express');
const prisma = require('../core/prismaClient');
const { authenticate, authorize } = require('../middleware/rbac');
const { postInvoicePayment } = require('./postingEngine');

const router = express.Router();

// ─── PORTAL DASHBOARD ────────────────────────────────────────────────

router.get('/dashboard', authenticate, authorize(['USER']), async (req, res) => {
  try {
    const contactId = req.user.contactId;
    if (!contactId) return res.status(400).json({ error: 'No contact linked to this account' });

    const [invoices, bills] = await Promise.all([
      prisma.customerInvoice.findMany({
        where: { customerId: contactId },
        select: { id: true, invoiceNumber: true, totalAmount: true, amountPaid: true, status: true, invoiceDate: true, dueDate: true }
      }),
      prisma.vendorBill.findMany({
        where: { vendorId: contactId },
        select: { id: true, billNumber: true, totalAmount: true, amountPaid: true, status: true, billDate: true, dueDate: true }
      })
    ]);

    const totalInvoiced   = invoices.reduce((s, i) => s + i.totalAmount, 0);
    const totalReceived   = invoices.reduce((s, i) => s + i.amountPaid,  0);
    const totalBilled     = bills.reduce((s, b)   => s + b.totalAmount,  0);
    const totalPaid       = bills.reduce((s, b)   => s + b.amountPaid,   0);
    const overdueInvoices = invoices.filter(i =>
      i.status !== 'PAID' && i.dueDate && new Date(i.dueDate) < new Date()
    ).length;

    res.json({
      invoices: {
        total:          invoices.length,
        paid:           invoices.filter(i => i.status === 'PAID').length,
        pending:        invoices.filter(i => i.status === 'CONFIRMED').length,
        overdue:        overdueInvoices,
        totalAmount:    totalInvoiced,
        receivedAmount: totalReceived,
        outstanding:    totalInvoiced - totalReceived
      },
      bills: {
        total:       bills.length,
        paid:        bills.filter(b => b.status === 'PAID').length,
        pending:     bills.filter(b => b.status === 'CONFIRMED').length,
        totalAmount: totalBilled,
        paidAmount:  totalPaid,
        outstanding: totalBilled - totalPaid
      }
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ─── PORTAL INVOICES ─────────────────────────────────────────────────

router.get('/invoices', authenticate, authorize(['USER']), async (req, res) => {
  try {
    const contactId = req.user.contactId;
    if (!contactId) return res.status(400).json({ error: 'No contact linked to this account' });

    const invoices = await prisma.customerInvoice.findMany({
      where: { customerId: contactId },
      include: {
        lines:    { include: { product: { select: { id: true, name: true } } } },
        payments: { select: { id: true, amount: true, method: true, date: true } }
      },
      orderBy: { createdAt: 'desc' }
    });
    res.json(invoices);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/invoices/:id', authenticate, authorize(['USER']), async (req, res) => {
  try {
    const contactId = req.user.contactId;
    const invoice   = await prisma.customerInvoice.findUnique({
      where: { id: parseInt(req.params.id) },
      include: {
        lines:    { include: { product: { select: { id: true, name: true } } } },
        payments: true
      }
    });

    if (!invoice) return res.status(404).json({ error: 'Invoice not found' });
    if (invoice.customerId !== contactId) return res.status(403).json({ error: 'Access denied' });

    res.json(invoice);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ─── PORTAL BILLS ────────────────────────────────────────────────────

router.get('/bills', authenticate, authorize(['USER']), async (req, res) => {
  try {
    const contactId = req.user.contactId;
    if (!contactId) return res.status(400).json({ error: 'No contact linked to this account' });

    const bills = await prisma.vendorBill.findMany({
      where: { vendorId: contactId },
      include: {
        lines:    { include: { product: { select: { id: true, name: true } } } },
        payments: { select: { id: true, amount: true, method: true, date: true } }
      },
      orderBy: { createdAt: 'desc' }
    });
    res.json(bills);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/bills/:id', authenticate, authorize(['USER']), async (req, res) => {
  try {
    const contactId = req.user.contactId;
    const bill      = await prisma.vendorBill.findUnique({
      where: { id: parseInt(req.params.id) },
      include: {
        lines:    { include: { product: { select: { id: true, name: true } } } },
        payments: true
      }
    });

    if (!bill) return res.status(404).json({ error: 'Bill not found' });
    if (bill.vendorId !== contactId) return res.status(403).json({ error: 'Access denied' });

    res.json(bill);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ─── PORTAL PAYMENT ──────────────────────────────────────────────────

router.post('/pay/invoice/:invoiceId', authenticate, authorize(['USER']), async (req, res) => {
  try {
    const contactId = req.user.contactId;
    if (!contactId) return res.status(400).json({ error: 'No contact linked to this account' });

    const invoice = await prisma.customerInvoice.findUnique({
      where: { id: parseInt(req.params.invoiceId) }
    });

    if (!invoice)                        return res.status(404).json({ error: 'Invoice not found' });
    if (invoice.customerId !== contactId) return res.status(403).json({ error: 'Access denied' });
    if (invoice.status === 'DRAFT')      return res.status(400).json({ error: 'Invoice is not yet confirmed' });
    if (invoice.status === 'PAID')       return res.status(400).json({ error: 'Invoice is already fully paid' });
    if (invoice.status === 'CANCELLED')  return res.status(400).json({ error: 'Cannot pay a cancelled invoice' });

    const { amount, method, note } = req.body;

    if (!amount || !method) return res.status(400).json({ error: 'Amount and method are required' });
    if (!['CASH', 'BANK'].includes(method)) return res.status(400).json({ error: 'Method must be CASH or BANK' });

    const parsedAmount = parseFloat(amount);
    const amountDue    = invoice.totalAmount - invoice.amountPaid;

    if (parsedAmount <= 0)          return res.status(400).json({ error: 'Amount must be greater than zero' });
    if (parsedAmount > amountDue)   return res.status(400).json({ error: `Amount exceeds outstanding balance of ${amountDue}` });

    const payment = await prisma.payment.create({
      data: {
        type:      'RECEIVE',
        partnerId: contactId,
        invoiceId: invoice.id,
        amount:    parsedAmount,
        method,
        date:      new Date(),
        note:      note || null
      }
    });

    const newAmountPaid = invoice.amountPaid + parsedAmount;
    const isFullyPaid   = Math.abs(newAmountPaid - invoice.totalAmount) < 0.001;

    await prisma.customerInvoice.update({
      where: { id: invoice.id },
      data: {
        amountPaid: newAmountPaid,
        status:     isFullyPaid ? 'PAID' : 'CONFIRMED'
      }
    });

    await postInvoicePayment({ ...payment, partnerId: contactId, invoiceId: invoice.id });

    res.status(201).json({ payment, fullyPaid: isFullyPaid });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ─── PORTAL STATEMENT ────────────────────────────────────────────────

router.get('/statement', authenticate, authorize(['USER']), async (req, res) => {
  try {
    const contactId = req.user.contactId;
    if (!contactId) return res.status(400).json({ error: 'No contact linked to this account' });

    const [invoices, payments] = await Promise.all([
      prisma.customerInvoice.findMany({
        where:   { customerId: contactId },
        select:  { id: true, invoiceNumber: true, invoiceDate: true, dueDate: true, totalAmount: true, amountPaid: true, status: true },
        orderBy: { invoiceDate: 'asc' }
      }),
      prisma.payment.findMany({
        where:   { invoiceId: { not: null }, partnerId: contactId },
        select:  { id: true, amount: true, method: true, date: true, invoiceId: true },
        orderBy: { date: 'asc' }
      })
    ]);

    const totalInvoiced    = invoices.reduce((s, i) => s + i.totalAmount, 0);
    const totalPaid        = invoices.reduce((s, i) => s + i.amountPaid,  0);
    const totalOutstanding = totalInvoiced - totalPaid;

    res.json({
      contactId,
      invoices,
      payments,
      summary: { totalInvoiced, totalPaid, totalOutstanding }
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;