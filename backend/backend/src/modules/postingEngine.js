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
// Debit: Purchase Expense  Credit: Creditors
async function postVendorBill(bill) {
  const purchaseExpense = await getAccount('Purchase Expense');
  const creditors       = await getAccount('Creditors');

  return post({
    journalType: 'PURCHASE',
    reference:   bill.billNumber,
    partnerId:   bill.vendorId,
    billId:      bill.id,
    items: [
      { accountId: purchaseExpense.id, debit: bill.totalAmount, credit: 0 },
      { accountId: creditors.id,       debit: 0, credit: bill.totalAmount }
    ]
  });
}

// CUSTOMER INVOICE CONFIRMED
// Debit: Debtors  Credit: Sale Income
async function postCustomerInvoice(invoice) {
  const debtors    = await getAccount('Debtors');
  const saleIncome = await getAccount('Sale Income');

  return post({
    journalType: 'SALES',
    reference:   invoice.invoiceNumber,
    partnerId:   invoice.customerId,
    invoiceId:   invoice.id,
    items: [
      { accountId: debtors.id,    debit: invoice.totalAmount, credit: 0 },
      { accountId: saleIncome.id, debit: 0, credit: invoice.totalAmount }
    ]
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