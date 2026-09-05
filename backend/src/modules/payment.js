const express = require('express');
const prisma = require('../core/prismaClient');
const { authenticate, authorize } = require('../middleware/rbac');
const { postBillPayment, postInvoicePayment } = require('./postingEngine');

const router = express.Router();

// ─── BILL PAYMENTS (money going out) ────────────────────────────────

// LIST payments for a bill
router.get('/bill/:billId', authenticate, authorize(['ADMIN', 'ACCOUNTANT']), async (req, res) => {
  try {
    const payments = await prisma.payment.findMany({
      where: { billId: parseInt(req.params.billId) },
      include: { partner: { select: { id: true, name: true } } },
      orderBy: { createdAt: 'desc' }
    });
    res.json(payments);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PAY a vendor bill
router.post('/bill/:billId', authenticate, authorize(['ADMIN', 'ACCOUNTANT']), async (req, res) => {
  try {
    const bill = await prisma.vendorBill.findUnique({
      where: { id: parseInt(req.params.billId) }
    });
    if (!bill) return res.status(404).json({ error: 'Vendor Bill not found' });
    if (bill.status === 'DRAFT') return res.status(400).json({ error: 'Confirm the bill before registering a payment' });
    if (bill.status === 'PAID') return res.status(400).json({ error: 'Bill is already fully paid' });
    if (bill.status === 'CANCELLED') return res.status(400).json({ error: 'Cannot pay a cancelled bill' });

    const { amount, method, date, note } = req.body;

    if (!amount || !method) {
      return res.status(400).json({ error: 'Amount and method are required' });
    }
    if (!['CASH', 'BANK'].includes(method)) {
      return res.status(400).json({ error: 'Method must be CASH or BANK' });
    }

    const parsedAmount = parseFloat(amount);
    const amountDue    = bill.totalAmount - bill.amountPaid;

    if (parsedAmount <= 0) return res.status(400).json({ error: 'Amount must be greater than zero' });
    if (parsedAmount > amountDue) {
      return res.status(400).json({ error: `Amount exceeds the outstanding balance of ${amountDue}` });
    }

    const payment = await prisma.payment.create({
      data: {
        type:      'SEND',
        partnerId: bill.vendorId,
        billId:    bill.id,
        amount:    parsedAmount,
        method,
        date:      date ? new Date(date) : new Date(),
        note:      note || null
      }
    });

    const newAmountPaid = bill.amountPaid + parsedAmount;
    const isFullyPaid   = Math.abs(newAmountPaid - bill.totalAmount) < 0.001;

    await prisma.vendorBill.update({
      where: { id: bill.id },
      data: {
        amountPaid: newAmountPaid,
        status:     isFullyPaid ? 'PAID' : 'CONFIRMED'
      }
    });

    await postBillPayment({
      ...payment,
      partnerId: bill.vendorId,
      billId:    bill.id
    });

    res.status(201).json({ payment, fullyPaid: isFullyPaid });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ─── INVOICE PAYMENTS (money coming in) ─────────────────────────────

// LIST payments for an invoice
router.get('/invoice/:invoiceId', authenticate, authorize(['ADMIN', 'ACCOUNTANT']), async (req, res) => {
  try {
    const payments = await prisma.payment.findMany({
      where: { invoiceId: parseInt(req.params.invoiceId) },
      include: { partner: { select: { id: true, name: true } } },
      orderBy: { createdAt: 'desc' }
    });
    res.json(payments);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// RECEIVE payment against a customer invoice
router.post('/invoice/:invoiceId', authenticate, authorize(['ADMIN', 'ACCOUNTANT']), async (req, res) => {
  try {
    const invoice = await prisma.customerInvoice.findUnique({
      where: { id: parseInt(req.params.invoiceId) }
    });
    if (!invoice) return res.status(404).json({ error: 'Customer Invoice not found' });
    if (invoice.status === 'DRAFT') return res.status(400).json({ error: 'Confirm the invoice before registering a payment' });
    if (invoice.status === 'PAID') return res.status(400).json({ error: 'Invoice is already fully paid' });
    if (invoice.status === 'CANCELLED') return res.status(400).json({ error: 'Cannot pay a cancelled invoice' });

    const { amount, method, date, note } = req.body;

    if (!amount || !method) {
      return res.status(400).json({ error: 'Amount and method are required' });
    }
    if (!['CASH', 'BANK'].includes(method)) {
      return res.status(400).json({ error: 'Method must be CASH or BANK' });
    }

    const parsedAmount = parseFloat(amount);
    const amountDue    = invoice.totalAmount - invoice.amountPaid;

    if (parsedAmount <= 0) return res.status(400).json({ error: 'Amount must be greater than zero' });
    if (parsedAmount > amountDue) {
      return res.status(400).json({ error: `Amount exceeds the outstanding balance of ${amountDue}` });
    }

    const payment = await prisma.payment.create({
      data: {
        type:      'RECEIVE',
        partnerId: invoice.customerId,
        invoiceId: invoice.id,
        amount:    parsedAmount,
        method,
        date:      date ? new Date(date) : new Date(),
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

    await postInvoicePayment({
      ...payment,
      partnerId: invoice.customerId,
      invoiceId: invoice.id
    });

    res.status(201).json({ payment, fullyPaid: isFullyPaid });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// LIST all payments (global view — BillPaymentList and InvoicePaymentList)
router.get('/', authenticate, authorize(['ADMIN', 'ACCOUNTANT']), async (req, res) => {
  try {
    const { type } = req.query;
    const payments = await prisma.payment.findMany({
      where: type ? { type } : {},
      include: { partner: { select: { id: true, name: true } } },
      orderBy: { createdAt: 'desc' }
    });
    res.json(payments);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;