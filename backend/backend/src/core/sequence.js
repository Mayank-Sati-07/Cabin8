const prisma = require('../core/prismaClient');

function pad(n, width = 4) {
  return String(n).padStart(width, '0');
}

function year() {
  return new Date().getFullYear();
}

async function nextNumber(model, field, prefix) {
  const last = await model.findFirst({
    where: { [field]: { startsWith: prefix } },
    orderBy: { [field]: 'desc' }
  });

  if (!last) return `${prefix}${pad(1)}`;

  const lastNum = parseInt(last[field].replace(prefix, '')) || 0;
  return `${prefix}${pad(lastNum + 1)}`;
}

// PO0001, PO0002 ...
async function nextPONumber() {
  return nextNumber(prisma.purchaseOrder, 'poNumber', 'PO');
}

// BILL/2026/0001, BILL/2026/0002 ...
async function nextBillNumber() {
  const prefix = `BILL/${year()}/`;
  return nextNumber(prisma.vendorBill, 'billNumber', prefix);
}

// SO0001, SO0002 ...
async function nextSONumber() {
  return nextNumber(prisma.salesOrder, 'soNumber', 'SO');
}

// INV/2026/0001, INV/2026/0002 ...
async function nextInvoiceNumber() {
  const prefix = `INV/${year()}/`;
  return nextNumber(prisma.customerInvoice, 'invoiceNumber', prefix);
}

module.exports = { nextPONumber, nextBillNumber, nextSONumber, nextInvoiceNumber };