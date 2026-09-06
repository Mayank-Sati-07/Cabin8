const express = require('express');
const prisma = require('../core/prismaClient');
const { authenticate } = require('../middleware/rbac');

const router = express.Router();

const LIMIT = 5;
const MODE = 'insensitive';

function money(n) {
  return `Rs. ${Number(n || 0).toLocaleString('en-IN')}`;
}

// GET /api/search?q=...
// Available to any authenticated user. Internal roles (ADMIN/ACCOUNTANT) get a
// cross-module search; portal contacts (USER) only get results scoped to their
// own invoices/bills.
router.get('/', authenticate, async (req, res) => {
  try {
    const q = (req.query.q || '').trim();
    if (!q) return res.json({ results: [] });

    const isPortal = req.user.role === 'USER';
    const results = [];

    if (isPortal) {
      const contactId = req.user.contactId;
      if (!contactId) return res.json({ results: [] });

      const [invoices, bills] = await Promise.all([
        prisma.customerInvoice.findMany({
          where: {
            customerId: contactId,
            OR: [
              { invoiceNumber: { contains: q, mode: MODE } },
              { invoiceRef: { contains: q, mode: MODE } },
            ],
          },
          take: LIMIT,
          orderBy: { createdAt: 'desc' },
        }),
        prisma.vendorBill.findMany({
          where: {
            vendorId: contactId,
            OR: [
              { billNumber: { contains: q, mode: MODE } },
              { vendorBillNo: { contains: q, mode: MODE } },
            ],
          },
          take: LIMIT,
          orderBy: { createdAt: 'desc' },
        }),
      ]);

      invoices.forEach(i => results.push({
        type: 'Invoice',
        id: i.id,
        title: i.invoiceNumber,
        subtitle: `${money(i.totalAmount)} - ${i.status}`,
        route: '/portal/invoices',
      }));
      bills.forEach(b => results.push({
        type: 'Bill',
        id: b.id,
        title: b.billNumber,
        subtitle: `${money(b.totalAmount)} - ${b.status}`,
        route: '/portal/bills',
      }));

      return res.json({ results });
    }

    // Internal roles: search across masters + transactions
    const [
      contacts, products, salesOrders, purchaseOrders,
      invoices, bills, journalEntries, accounts, budgets,
    ] = await Promise.all([
      prisma.contact.findMany({
        where: {
          OR: [
            { name: { contains: q, mode: MODE } },
            { email: { contains: q, mode: MODE } },
            { phone: { contains: q, mode: MODE } },
          ],
        },
        take: LIMIT,
      }),
      prisma.product.findMany({
        where: { name: { contains: q, mode: MODE } },
        take: LIMIT,
      }),
      prisma.salesOrder.findMany({
        where: { soNumber: { contains: q, mode: MODE } },
        take: LIMIT,
        include: { customer: { select: { name: true } } },
      }),
      prisma.purchaseOrder.findMany({
        where: { poNumber: { contains: q, mode: MODE } },
        take: LIMIT,
        include: { vendor: { select: { name: true } } },
      }),
      prisma.customerInvoice.findMany({
        where: {
          OR: [
            { invoiceNumber: { contains: q, mode: MODE } },
            { invoiceRef: { contains: q, mode: MODE } },
          ],
        },
        take: LIMIT,
        include: { customer: { select: { name: true } } },
      }),
      prisma.vendorBill.findMany({
        where: {
          OR: [
            { billNumber: { contains: q, mode: MODE } },
            { vendorBillNo: { contains: q, mode: MODE } },
          ],
        },
        take: LIMIT,
        include: { vendor: { select: { name: true } } },
      }),
      prisma.journalEntry.findMany({
        where: { reference: { contains: q, mode: MODE } },
        take: LIMIT,
        include: { journal: { select: { name: true } } },
      }),
      prisma.account.findMany({
        where: { name: { contains: q, mode: MODE } },
        take: LIMIT,
      }),
      prisma.budget.findMany({
        where: { name: { contains: q, mode: MODE } },
        take: LIMIT,
      }),
    ]);

    contacts.forEach(c => results.push({
      type: 'Contact', id: c.id, title: c.name, subtitle: c.email, route: `/contacts/${c.id}`,
    }));
    products.forEach(p => results.push({
      type: 'Product', id: p.id, title: p.name, subtitle: p.type, route: `/products/${p.id}`,
    }));
    salesOrders.forEach(s => results.push({
      type: 'Sales Order', id: s.id, title: s.soNumber, subtitle: s.customer?.name, route: `/sales/orders/${s.id}`,
    }));
    purchaseOrders.forEach(p => results.push({
      type: 'Purchase Order', id: p.id, title: p.poNumber, subtitle: p.vendor?.name, route: `/purchase/orders/${p.id}`,
    }));
    invoices.forEach(i => results.push({
      type: 'Invoice', id: i.id, title: i.invoiceNumber, subtitle: i.customer?.name, route: `/sales/invoices/${i.id}`,
    }));
    bills.forEach(b => results.push({
      type: 'Vendor Bill', id: b.id, title: b.billNumber, subtitle: b.vendor?.name, route: `/purchase/bills/${b.id}`,
    }));
    journalEntries.forEach(j => results.push({
      type: 'Journal Entry', id: j.id, title: j.reference || `Entry #${j.id}`, subtitle: j.journal?.name, route: `/accounting/entries/${j.id}`,
    }));
    accounts.forEach(a => results.push({
      type: 'Account', id: a.id, title: a.name, subtitle: a.type, route: '/accounting/chart',
    }));
    budgets.forEach(b => results.push({
      type: 'Budget', id: b.id, title: b.name, subtitle: b.status, route: `/budgets/${b.id}`,
    }));

    res.json({ results });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
