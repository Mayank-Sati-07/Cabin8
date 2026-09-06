const prisma = require('../core/prismaClient');

async function getJournal(type) {
  const journal = await prisma.journal.findFirst({ where: { type } });
  if (!journal) throw new Error(`Journal of type "${type}" not found. Run seed first.`);
  return journal;
}

async function getAccount(name) {
  const account = await prisma.account.findFirst({ where: { name } });
  if (!account) throw new Error(`Account "${name}" not found. Run seed first.`);
  return account;
}

// GST accounts aren't part of the original seed, so create them on first use
// instead of forcing everyone to re-run the seed script after this feature.
async function getOrCreateAccount(name, type) {
  const existing = await prisma.account.findFirst({ where: { name } });
  if (existing) return existing;
  return prisma.account.create({ data: { name, type } });
}

async function post({ journalType, reference, partnerId, billId, invoiceId, items }) {
  const journal = await getJournal(journalType);

  const totalDebit  = items.reduce((s, i) => s + (i.debit  || 0), 0);
  const totalCredit = items.reduce((s, i) => s + (i.credit || 0), 0);

  if (Math.abs(totalDebit - totalCredit) > 0.001) {
    throw new Error(`Journal entry does not balance: debit ${totalDebit} != credit ${totalCredit}`);
  }

  const entry = await prisma.journalEntry.create({
    data: {
      journalId:      journal.id,
      reference:      reference || null,
      partnerId:      partnerId || null,
      billId:         billId    || null,
      invoiceId:      invoiceId || null,
      status:         'POSTED',
      accountingDate: new Date(),
      items: {
        create: items.map(i => ({
          accountId: i.accountId,
          partnerId: partnerId || null,
          debit:     i.debit  || 0,
          credit:    i.credit || 0
        }))
      }
    },
    include: { items: true }
  });

  return entry;
}

// VENDOR BILL CONFIRMED
// Debit: Purchase Expense + GST Input (recoverable)  Credit: Creditors (grand total)
async function postVendorBill(bill) {
  const purchaseExpense = await getAccount('Purchase Expense');
  const creditors       = await getAccount('Creditors');

  const items = [
    { accountId: purchaseExpense.id, debit: bill.subTotal ?? bill.totalAmount, credit: 0 }
  ];
  if (bill.cgstAmount) items.push({ accountId: (await getOrCreateAccount('CGST Input', 'ASSET')).id, debit: bill.cgstAmount, credit: 0 });
  if (bill.sgstAmount) items.push({ accountId: (await getOrCreateAccount('SGST Input', 'ASSET')).id, debit: bill.sgstAmount, credit: 0 });
  if (bill.igstAmount) items.push({ accountId: (await getOrCreateAccount('IGST Input', 'ASSET')).id, debit: bill.igstAmount, credit: 0 });
  items.push({ accountId: creditors.id, debit: 0, credit: bill.totalAmount });

  return post({
    journalType: 'PURCHASE',
    reference:   bill.billNumber,
    partnerId:   bill.vendorId,
    billId:      bill.id,
    items
  });
}

// CUSTOMER INVOICE CONFIRMED
// Debit: Debtors (grand total)  Credit: Sale Income + GST Output (payable)
async function postCustomerInvoice(invoice) {
  const debtors    = await getAccount('Debtors');
  const saleIncome = await getAccount('Sale Income');

  const items = [
    { accountId: debtors.id, debit: invoice.totalAmount, credit: 0 },
    { accountId: saleIncome.id, debit: 0, credit: invoice.subTotal ?? invoice.totalAmount }
  ];
  if (invoice.cgstAmount) items.push({ accountId: (await getOrCreateAccount('CGST Output', 'LIABILITY')).id, debit: 0, credit: invoice.cgstAmount });
  if (invoice.sgstAmount) items.push({ accountId: (await getOrCreateAccount('SGST Output', 'LIABILITY')).id, debit: 0, credit: invoice.sgstAmount });
  if (invoice.igstAmount) items.push({ accountId: (await getOrCreateAccount('IGST Output', 'LIABILITY')).id, debit: 0, credit: invoice.igstAmount });

  return post({
    journalType: 'SALES',
    reference:   invoice.invoiceNumber,
    partnerId:   invoice.customerId,
    invoiceId:   invoice.id,
    items
  });
}

// PAYMENT AGAINST VENDOR BILL (money going out)
// Debit: Creditors  Credit: Cash or Bank
async function postBillPayment(payment) {
  const creditors  = await getAccount('Creditors');
  const cashOrBank = await getAccount(payment.method === 'CASH' ? 'Cash' : 'Bank');

  return post({
    journalType: payment.method === 'CASH' ? 'CASH' : 'BANK',
    reference:   `PAY-BILL-${payment.billId}`,
    partnerId:   payment.partnerId,
    billId:      payment.billId,
    items: [
      { accountId: creditors.id,  debit: payment.amount, credit: 0 },
      { accountId: cashOrBank.id, debit: 0, credit: payment.amount }
    ]
  });
}

// PAYMENT AGAINST CUSTOMER INVOICE (money coming in)
// Debit: Cash or Bank  Credit: Debtors
async function postInvoicePayment(payment) {
  const cashOrBank = await getAccount(payment.method === 'CASH' ? 'Cash' : 'Bank');
  const debtors    = await getAccount('Debtors');

  return post({
    journalType: payment.method === 'CASH' ? 'CASH' : 'BANK',
    reference:   `PAY-INV-${payment.invoiceId}`,
    partnerId:   payment.partnerId,
    invoiceId:   payment.invoiceId,
    items: [
      { accountId: cashOrBank.id, debit: payment.amount, credit: 0 },
      { accountId: debtors.id,    debit: 0, credit: payment.amount }
    ]
  });
}

module.exports = { postVendorBill, postCustomerInvoice, postBillPayment, postInvoicePayment };