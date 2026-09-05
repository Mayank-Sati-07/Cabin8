const express = require('express');
const prisma = require('../core/prismaClient');
const { authenticate, authorize } = require('../middleware/rbac');
const { nextPONumber, nextBillNumber } = require('../core/sequence');
const { postVendorBill } = require('./postingEngine');

const router = express.Router();

// ─── PURCHASE ORDERS ────────────────────────────────────────────────

// LIST
router.get('/orders', authenticate, authorize(['ADMIN', 'ACCOUNTANT']), async (req, res) => {
  try {
    const orders = await prisma.purchaseOrder.findMany({
      include: { vendor: { select: { id: true, name: true } }, lines: true },
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
    const order = await prisma.purchaseOrder.findUnique({
      where: { id: parseInt(req.params.id) },
      include: {
        vendor: true,
        lines: { include: { product: true, analyticAccount: true } },
        vendorBills: true
      }
    });
    if (!order) return res.status(404).json({ error: 'Purchase Order not found' });
    res.json(order);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// CREATE
router.post('/orders', authenticate, authorize(['ADMIN', 'ACCOUNTANT']), async (req, res) => {
  try {
    const { vendorId, date, lines } = req.body;

    if (!vendorId || !lines || lines.length === 0) {
      return res.status(400).json({ error: 'Vendor and at least one line are required' });
    }

    const poNumber = await nextPONumber();

    const order = await prisma.purchaseOrder.create({
      data: {
        poNumber,
        vendorId:  parseInt(vendorId),
        date:      date ? new Date(date) : new Date(),
        status:    'DRAFT',
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
    const order = await prisma.purchaseOrder.findUnique({ where: { id: parseInt(req.params.id) } });
    if (!order) return res.status(404).json({ error: 'Purchase Order not found' });
    if (order.status !== 'DRAFT') return res.status(400).json({ error: 'Only draft orders can be edited' });

    const { vendorId, date, lines } = req.body;

    await prisma.purchaseOrderLine.deleteMany({ where: { poId: order.id } });

    const updated = await prisma.purchaseOrder.update({
      where: { id: order.id },
      data: {
        vendorId: vendorId ? parseInt(vendorId) : order.vendorId,
        date:     date ? new Date(date) : order.date,
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
    const order = await prisma.purchaseOrder.findUnique({ where: { id: parseInt(req.params.id) } });
    if (!order) return res.status(404).json({ error: 'Purchase Order not found' });
    if (order.status !== 'DRAFT') return res.status(400).json({ error: 'Order is already confirmed' });

    const updated = await prisma.purchaseOrder.update({
      where: { id: order.id },
      data: { status: 'CONFIRMED' }
    });
    res.json(updated);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// CONVERT PO TO VENDOR BILL
router.post('/orders/:id/create-bill', authenticate, authorize(['ADMIN', 'ACCOUNTANT']), async (req, res) => {
  try {
    const order = await prisma.purchaseOrder.findUnique({
      where: { id: parseInt(req.params.id) },
      include: { lines: true }
    });
    if (!order) return res.status(404).json({ error: 'Purchase Order not found' });
    if (order.status !== 'CONFIRMED') return res.status(400).json({ error: 'Confirm the order before creating a bill' });

    const existing = await prisma.vendorBill.findFirst({ where: { poId: order.id } });
    if (existing) return res.status(400).json({ error: 'A bill already exists for this order' });

    const billNumber  = await nextBillNumber();
    const totalAmount = order.lines.reduce((s, l) => s + l.total, 0);
    const { vendorBillNo, dueDate } = req.body;

    const bill = await prisma.vendorBill.create({
      data: {
        billNumber,
        vendorBillNo: vendorBillNo || null,
        vendorId:     order.vendorId,
        poId:         order.id,
        dueDate:      dueDate ? new Date(dueDate) : null,
        totalAmount,
        status:       'DRAFT',
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
    res.status(201).json(bill);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ─── VENDOR BILLS ─────────────────────────────────────────────────

// LIST
router.get('/bills', authenticate, authorize(['ADMIN', 'ACCOUNTANT']), async (req, res) => {
  try {
    const bills = await prisma.vendorBill.findMany({
      include: { vendor: { select: { id: true, name: true } }, po: { select: { poNumber: true } } },
      orderBy: { createdAt: 'desc' }
    });
    res.json(bills);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET BY ID
router.get('/bills/:id', authenticate, authorize(['ADMIN', 'ACCOUNTANT']), async (req, res) => {
  try {
    const bill = await prisma.vendorBill.findUnique({
      where: { id: parseInt(req.params.id) },
      include: {
        vendor: true,
        po:     { select: { poNumber: true } },
        lines:  { include: { product: true, analyticAccount: true } },
        payments: true
      }
    });
    if (!bill) return res.status(404).json({ error: 'Vendor Bill not found' });
    res.json(bill);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// CONFIRM BILL: DRAFT -> CONFIRMED + auto post journal entry
router.post('/bills/:id/confirm', authenticate, authorize(['ADMIN', 'ACCOUNTANT']), async (req, res) => {
  try {
    const bill = await prisma.vendorBill.findUnique({ where: { id: parseInt(req.params.id) } });
    if (!bill) return res.status(404).json({ error: 'Vendor Bill not found' });
    if (bill.status !== 'DRAFT') return res.status(400).json({ error: 'Bill is already confirmed or paid' });

    const updated = await prisma.vendorBill.update({
      where: { id: bill.id },
      data: { status: 'CONFIRMED' }
    });

    await postVendorBill(updated);

    res.json(updated);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// CANCEL BILL
router.post('/bills/:id/cancel', authenticate, authorize(['ADMIN']), async (req, res) => {
  try {
    const bill = await prisma.vendorBill.findUnique({ where: { id: parseInt(req.params.id) } });
    if (!bill) return res.status(404).json({ error: 'Vendor Bill not found' });
    if (bill.status === 'PAID') return res.status(400).json({ error: 'Paid bills cannot be cancelled' });

    const updated = await prisma.vendorBill.update({
      where: { id: bill.id },
      data: { status: 'CANCELLED' }
    });
    res.json(updated);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;