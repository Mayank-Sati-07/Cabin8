const express = require('express');
const prisma = require('../core/prismaClient');
const { authenticate } = require('../middleware/rbac');

const router = express.Router();

const DAY_MS = 24 * 60 * 60 * 1000;
const DUE_SOON_DAYS = 5;   // surface a "due soon" warning this many days before the due date
const STALE_DRAFT_DAYS = 2; // a draft order older than this is flagged as awaiting confirmation

const SEVERITY_ORDER = { danger: 0, warning: 1, info: 2 };

function daysBetween(a, b) {
  return Math.round((new Date(a).getTime() - new Date(b).getTime()) / DAY_MS);
}

function sortNotifications(list) {
  return list.sort((a, b) => {
    if (SEVERITY_ORDER[a.severity] !== SEVERITY_ORDER[b.severity]) {
      return SEVERITY_ORDER[a.severity] - SEVERITY_ORDER[b.severity];
    }
    return new Date(b.date) - new Date(a.date);
  });
}

// GET /api/notifications
// Notifications are computed on the fly from live business data (overdue /
// due-soon bills & invoices, stale drafts) rather than stored, since read
// state is tracked client-side. Internal roles see org-wide alerts; portal
// contacts (USER) only see alerts about their own bills/invoices.
router.get('/', authenticate, async (req, res) => {
  try {
    const now = new Date();
    const notifications = [];
    const isPortal = req.user.role === 'USER';

    if (isPortal) {
      const contactId = req.user.contactId;
      if (!contactId) return res.json({ notifications: [] });

      const [bills, invoices] = await Promise.all([
        prisma.vendorBill.findMany({ where: { vendorId: contactId, status: 'CONFIRMED' } }),
        prisma.customerInvoice.findMany({ where: { customerId: contactId, status: 'CONFIRMED' } }),
      ]);

      bills.forEach(b => {
        if (!b.dueDate || b.amountPaid >= b.totalAmount) return;
        const diff = daysBetween(b.dueDate, now);
        if (diff < 0) {
          notifications.push({
            id: `mybill-overdue-${b.id}`, severity: 'danger',
            title: 'Bill overdue',
            message: `Bill ${b.billNumber} was due ${Math.abs(diff)} day(s) ago`,
            date: b.dueDate, route: '/portal/bills',
          });
        } else if (diff <= DUE_SOON_DAYS) {
          notifications.push({
            id: `mybill-duesoon-${b.id}`, severity: 'warning',
            title: 'Bill due soon',
            message: `Bill ${b.billNumber} is due in ${diff} day(s)`,
            date: b.dueDate, route: '/portal/bills',
          });
        }
      });

      invoices.forEach(i => {
        if (!i.dueDate || i.amountPaid >= i.totalAmount) return;
        const diff = daysBetween(i.dueDate, now);
        if (diff < 0) {
          notifications.push({
            id: `myinv-overdue-${i.id}`, severity: 'danger',
            title: 'Invoice overdue',
            message: `Invoice ${i.invoiceNumber} was due ${Math.abs(diff)} day(s) ago`,
            date: i.dueDate, route: '/portal/invoices',
          });
        } else if (diff <= DUE_SOON_DAYS) {
          notifications.push({
            id: `myinv-duesoon-${i.id}`, severity: 'warning',
            title: 'Invoice due soon',
            message: `Invoice ${i.invoiceNumber} is due in ${diff} day(s)`,
            date: i.dueDate, route: '/portal/invoices',
          });
        }
      });

      return res.json({ notifications: sortNotifications(notifications) });
    }

    // Internal roles (ADMIN / ACCOUNTANT): org-wide alerts
    const [bills, invoices, draftPOs, draftSOs, draftEntryCount] = await Promise.all([
      prisma.vendorBill.findMany({
        where: { status: 'CONFIRMED' },
        include: { vendor: { select: { name: true } } },
      }),
      prisma.customerInvoice.findMany({
        where: { status: 'CONFIRMED' },
        include: { customer: { select: { name: true } } },
      }),
      prisma.purchaseOrder.findMany({ where: { status: 'DRAFT' } }),
      prisma.salesOrder.findMany({ where: { status: 'DRAFT' } }),
      prisma.journalEntry.count({ where: { status: 'DRAFT' } }),
    ]);

    bills.forEach(b => {
      if (!b.dueDate || b.amountPaid >= b.totalAmount) return;
      const diff = daysBetween(b.dueDate, now);
      if (diff < 0) {
        notifications.push({
          id: `bill-overdue-${b.id}`, severity: 'danger',
          title: 'Vendor bill overdue',
          message: `${b.billNumber} from ${b.vendor.name} was due ${Math.abs(diff)} day(s) ago`,
          date: b.dueDate, route: `/purchase/bills/${b.id}`,
        });
      } else if (diff <= DUE_SOON_DAYS) {
        notifications.push({
          id: `bill-duesoon-${b.id}`, severity: 'warning',
          title: 'Vendor bill due soon',
          message: `${b.billNumber} from ${b.vendor.name} is due in ${diff} day(s)`,
          date: b.dueDate, route: `/purchase/bills/${b.id}`,
        });
      }
    });

    invoices.forEach(i => {
      if (!i.dueDate || i.amountPaid >= i.totalAmount) return;
      const diff = daysBetween(i.dueDate, now);
      if (diff < 0) {
        notifications.push({
          id: `invoice-overdue-${i.id}`, severity: 'danger',
          title: 'Customer invoice overdue',
          message: `${i.invoiceNumber} from ${i.customer.name} was due ${Math.abs(diff)} day(s) ago`,
          date: i.dueDate, route: `/sales/invoices/${i.id}`,
        });
      } else if (diff <= DUE_SOON_DAYS) {
        notifications.push({
          id: `invoice-duesoon-${i.id}`, severity: 'warning',
          title: 'Customer invoice due soon',
          message: `${i.invoiceNumber} from ${i.customer.name} is due in ${diff} day(s)`,
          date: i.dueDate, route: `/sales/invoices/${i.id}`,
        });
      }
    });

    const stalePOs = draftPOs.filter(po => daysBetween(now, po.createdAt) >= STALE_DRAFT_DAYS);
    if (stalePOs.length) {
      notifications.push({
        id: 'po-drafts-pending', severity: 'info',
        title: 'Purchase orders awaiting confirmation',
        message: `${stalePOs.length} purchase order(s) are still in draft`,
        date: now, route: '/purchase/orders',
      });
    }

    const staleSOs = draftSOs.filter(so => daysBetween(now, so.createdAt) >= STALE_DRAFT_DAYS);
    if (staleSOs.length) {
      notifications.push({
        id: 'so-drafts-pending', severity: 'info',
        title: 'Sales orders awaiting confirmation',
        message: `${staleSOs.length} sales order(s) are still in draft`,
        date: now, route: '/sales/orders',
      });
    }

    if (draftEntryCount > 0) {
      notifications.push({
        id: 'journal-drafts-pending', severity: 'info',
        title: 'Journal entries not posted',
        message: `${draftEntryCount} journal entr${draftEntryCount === 1 ? 'y is' : 'ies are'} still in draft`,
        date: now, route: '/accounting/entries',
      });
    }

    res.json({ notifications: sortNotifications(notifications) });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
