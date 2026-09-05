const express = require('express');
const prisma = require('../core/prismaClient');
const { authenticate, authorize } = require('../middleware/rbac');

const router = express.Router();

router.get('/', authenticate, authorize(['ADMIN', 'ACCOUNTANT']), async (req, res) => {
  try {
    const [
      totalContacts,
      totalProducts,

      allSales,
      confirmedSales,
      draftSales,

      allPurchases,
      confirmedPurchases,
      draftPurchases,

      allBudgets,
      confirmedBudgets,
      draftBudgets,

      recentInvoices,
      recentBills,
      recentPayments
    ] = await Promise.all([
      prisma.contact.count(),
      prisma.product.count(),

      prisma.salesOrder.count(),
      prisma.salesOrder.count({ where: { status: 'CONFIRMED' } }),
      prisma.salesOrder.count({ where: { status: 'DRAFT' } }),

      prisma.purchaseOrder.count(),
      prisma.purchaseOrder.count({ where: { status: 'CONFIRMED' } }),
      prisma.purchaseOrder.count({ where: { status: 'DRAFT' } }),

      prisma.budget.count(),
      prisma.budget.count({ where: { status: 'CONFIRMED' } }),
      prisma.budget.count({ where: { status: 'DRAFT' } }),

      prisma.customerInvoice.findMany({
        take: 5,
        orderBy: { createdAt: 'desc' },
        include: { customer: { select: { name: true } } }
      }),
      prisma.vendorBill.findMany({
        take: 5,
        orderBy: { createdAt: 'desc' },
        include: { vendor: { select: { name: true } } }
      }),
      prisma.payment.findMany({
        take: 5,
        orderBy: { createdAt: 'desc' },
        include: { partner: { select: { name: true } } }
      })
    ]);

    // Total amounts
    const invoiceTotals = await prisma.customerInvoice.aggregate({
      _sum: { totalAmount: true, amountPaid: true }
    });
    const billTotals = await prisma.vendorBill.aggregate({
      _sum: { totalAmount: true, amountPaid: true }
    });

    // Budget committed total
    const budgetTotal = await prisma.budget.aggregate({
      _sum: { committedAmount: true },
      where: { status: 'CONFIRMED' }
    });

    res.json({
      tiles: {
        contacts: totalContacts,
        products: totalProducts,
        sales: { all: allSales, confirmed: confirmedSales, draft: draftSales },
        purchases: { all: allPurchases, confirmed: confirmedPurchases, draft: draftPurchases },
        budgets: { all: allBudgets, confirmed: confirmedBudgets, draft: draftBudgets }
      },
      amounts: {
        totalInvoiced:    invoiceTotals._sum.totalAmount || 0,
        totalReceived:    invoiceTotals._sum.amountPaid  || 0,
        totalBilled:      billTotals._sum.totalAmount    || 0,
        totalPaid:        billTotals._sum.amountPaid     || 0,
        budgetCommitted:  budgetTotal._sum.committedAmount || 0
      },
      recentActivity: {
        invoices: recentInvoices.map(i => ({
          id: i.id,
          number: i.invoiceNumber,
          customer: i.customer.name,
          amount: i.totalAmount,
          status: i.status,
          date: i.invoiceDate
        })),
        bills: recentBills.map(b => ({
          id: b.id,
          number: b.billNumber,
          vendor: b.vendor.name,
          amount: b.totalAmount,
          status: b.status,
          date: b.billDate
        })),
        payments: recentPayments.map(p => ({
          id: p.id,
          partner: p.partner.name,
          amount: p.amount,
          method: p.method,
          type: p.type,
          date: p.date
        }))
      }
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;