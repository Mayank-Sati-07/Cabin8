const express = require('express');
const prisma = require('../core/prismaClient');
const { authenticate, authorize } = require('../middleware/rbac');
const { nextSONumber, nextInvoiceNumber } = require('../core/sequence');
const { postCustomerInvoice } = require('./postingEngine');

const router = express.Router();

// ─── SALES ORDERS ────────────────────────────────────────────────────

// LIST
router.get('/orders', authenticate, authorize(['ADMIN', 'ACCOUNTANT']), async (req, res) => {
  try {
    const orders = await prisma.salesOrder.findMany({
      include: { customer: { select: { id: true, name: true } }, lines: true },
      orderBy: { createdAt: 'desc' }
    });
    res.json(orders);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET BY ID
router.get('/orders/:id', authenticate, authorize(['ADMIN', 'ACCOUNTANT']), async (req, res) => {
  try {
    const order = await prisma.salesOrder.findUnique({
      where: { id: parseInt(req.params.id) },
      include: {
        customer: true,
        lines: { include: { product: true, analyticAccount: true } },
        customerInvoices: true
      }
    });
    if (!order) return res.status(404).json({ error: 'Sales Order not found' });
    res.json(order);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// CREATE
router.post('/orders', authenticate, authorize(['ADMIN', 'ACCOUNTANT']), async (req, res) => {
  try {
    const { customerId, date, lines } = req.body;

    if (!customerId || !lines || lines.length === 0) {
      return res.status(400).json({ error: 'Customer and at least one line are required' });
    }

    const soNumber = await nextSONumber();

    const order = await prisma.salesOrder.create({
      data: {
        soNumber,
        customerId: parseInt(customerId),
        date:       date ? new Date(date) : new Date(),
        status:     'DRAFT',
        lines: {
          create: lines.map(l => ({
            productId:         parseInt(l.productId),
            analyticAccountId: l.analyticAccountId ? parseInt(l.analyticAccountId) : null,
            qty:               parseFloat(l.qty),
            unitPrice:         parseFloat(l.unitPrice),
            total:             parseFloat(l.qty) * parseFloat(l.unitPrice)
          }))
        }
      },
      include: { lines: true }
    });
    res.status(201).json(order);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// UPDATE (only DRAFT)
router.put('/orders/:id', authenticate, authorize(['ADMIN', 'ACCOUNTANT']), async (req, res) => {
  try {
    const order = await prisma.salesOrder.findUnique({ where: { id: parseInt(req.params.id) } });
    if (!order) return res.status(404).json({ error: 'Sales Order not found' });
    if (order.status !== 'DRAFT') return res.status(400).json({ error: 'Only draft orders can be edited' });

    const { customerId, date, lines } = req.body;

    await prisma.salesOrderLine.deleteMany({ where: { soId: order.id } });

    const updated = await prisma.salesOrder.update({
      where: { id: order.id },
      data: {
        customerId: customerId ? parseInt(customerId) : order.customerId,
        date:       date ? new Date(date) : order.date,
        lines: {
          create: lines.map(l => ({
            productId:         parseInt(l.productId),
            analyticAccountId: l.analyticAccountId ? parseInt(l.analyticAccountId) : null,
            qty:               parseFloat(l.qty),
            unitPrice:         parseFloat(l.unitPrice),
            total:             parseFloat(l.qty) * parseFloat(l.unitPrice)
          }))
        }
      },
      include: { lines: true }
    });
    res.json(updated);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// CONFIRM ORDER: DRAFT -> CONFIRMED
router.post('/orders/:id/confirm', authenticate, authorize(['ADMIN', 'ACCOUNTANT']), async (req, res) => {
  try {
    const order = await prisma.salesOrder.findUnique({ where: { id: parseInt(req.params.id) } });
    if (!order) return res.status(404).json({ error: 'Sales Order not found' });
    if (order.status !== 'DRAFT') return res.status(400).json({ error: 'Order is already confirmed' });

    const updated = await prisma.salesOrder.update({
      where: { id: order.id },
      data: { status: 'CONFIRMED' }
    });
    res.json(updated);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// CONVERT SO TO CUSTOMER INVOICE
router.post('/orders/:id/create-invoice', authenticate, authorize(['ADMIN', 'ACCOUNTANT']), async (req, res) => {
  try {
    const order = await prisma.salesOrder.findUnique({
      where: { id: parseInt(req.params.id) },
      include: { lines: true }
    });
    if (!order) return res.status(404).json({ error: 'Sales Order not found' });
    if (order.status !== 'CONFIRMED') return res.status(400).json({ error: 'Confirm the order before creating an invoice' });

    const existing = await prisma.customerInvoice.findFirst({ where: { soId: order.id } });
    if (existing) return res.status(400).json({ error: 'An invoice already exists for this order' });

    const invoiceNumber = await nextInvoiceNumber();
    const totalAmount   = order.lines.reduce((s, l) => s + l.total, 0);
    const { invoiceRef, dueDate } = req.body;

    const invoice = await prisma.customerInvoice.create({
      data: {
        invoiceNumber,
        invoiceRef:  invoiceRef || null,
        customerId:  order.customerId,
        soId:        order.id,
        dueDate:     dueDate ? new Date(dueDate) : null,
        totalAmount,
        status:      'DRAFT',
        lines: {
          create: order.lines.map(l => ({
            productId:         l.productId,
            analyticAccountId: l.analyticAccountId,
            qty:               l.qty,
            unitPrice:         l.unitPrice,
            total:             l.total
          }))
        }
      },
      include: { lines: true }
    });
    res.status(201).json(invoice);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ─── CUSTOMER INVOICES ───────────────────────────────────────────────

// LIST
router.get('/invoices', authenticate, authorize(['ADMIN', 'ACCOUNTANT']), async (req, res) => {
  try {
    const invoices = await prisma.customerInvoice.findMany({
      include: { customer: { select: { id: true, name: true } }, so: { select: { soNumber: true } } },
      orderBy: { createdAt: 'desc' }
    });
    res.json(invoices);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET BY ID
router.get('/invoices/:id', authenticate, authorize(['ADMIN', 'ACCOUNTANT']), async (req, res) => {
  try {
    const invoice = await prisma.customerInvoice.findUnique({
      where: { id: parseInt(req.params.id) },
      include: {
        customer: true,
        so:       { select: { soNumber: true } },
        lines:    { include: { product: true, analyticAccount: true } },
        payments: true
      }
    });
    if (!invoice) return res.status(404).json({ error: 'Customer Invoice not found' });
    res.json(invoice);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// CONFIRM INVOICE: DRAFT -> CONFIRMED + auto post journal entry
router.post('/invoices/:id/confirm', authenticate, authorize(['ADMIN', 'ACCOUNTANT']), async (req, res) => {
  try {
    const invoice = await prisma.customerInvoice.findUnique({ where: { id: parseInt(req.params.id) } });
    if (!invoice) return res.status(404).json({ error: 'Customer Invoice not found' });
    if (invoice.status !== 'DRAFT') return res.status(400).json({ error: 'Invoice is already confirmed or paid' });

    const updated = await prisma.customerInvoice.update({
      where: { id: invoice.id },
      data: { status: 'CONFIRMED' }
    });

    await postCustomerInvoice(updated);

    res.json(updated);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// CANCEL INVOICE
router.post('/invoices/:id/cancel', authenticate, authorize(['ADMIN']), async (req, res) => {
  try {
    const invoice = await prisma.customerInvoice.findUnique({ where: { id: parseInt(req.params.id) } });
    if (!invoice) return res.status(404).json({ error: 'Customer Invoice not found' });
    if (invoice.status === 'PAID') return res.status(400).json({ error: 'Paid invoices cannot be cancelled' });

    const updated = await prisma.customerInvoice.update({
      where: { id: invoice.id },
      data: { status: 'CANCELLED' }
    });
    res.json(updated);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;