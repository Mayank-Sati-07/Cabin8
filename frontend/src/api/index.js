import store from '../data/mockStore';

const delay = (ms = 100) => new Promise(r => setTimeout(r, ms));

export const contactsApi = {
  async getAll(filters = {}) {
    await delay();
    let items = store.getAll('contacts');
    if (filters.type) items = items.filter(c => c.type === filters.type || c.type === 'BOTH');
    if (filters.search) {
      const q = filters.search.toLowerCase();
      items = items.filter(c => c.name.toLowerCase().includes(q) || c.email.toLowerCase().includes(q) || c.mobile?.includes(q));
    }
    if (filters.is_active !== undefined) items = items.filter(c => c.is_active === filters.is_active);
    return items;
  },
  async getById(id) { await delay(); return store.getById('contacts', id); },
  async create(data) { await delay(); return store.create('contacts', data); },
  async update(id, data) { await delay(); return store.update('contacts', id, data); },
  async archive(id) { await delay(); return store.update('contacts', id, { is_active: false }); },
};

export const productsApi = {
  async getAll(filters = {}) {
    await delay();
    let items = store.getAll('products');
    if (filters.type) items = items.filter(p => p.type === filters.type);
    if (filters.category) items = items.filter(p => p.category === filters.category);
    if (filters.search) {
      const q = filters.search.toLowerCase();
      items = items.filter(p => p.name.toLowerCase().includes(q) || p.category?.toLowerCase().includes(q));
    }
    return items.filter(p => p.is_active !== false);
  },
  async getById(id) { await delay(); return store.getById('products', id); },
  async create(data) { await delay(); return store.create('products', data); },
  async update(id, data) { await delay(); return store.update('products', id, data); },
};

export const accountingApi = {
  async getAccounts() { await delay(); return store.getAll('accounts'); },
  async createAccount(data) { await delay(); return store.create('accounts', data); },
  async getJournals() { await delay(); return store.getAll('journals'); },
  async createJournal(data) { await delay(); return store.create('journals', data); },
  async getJournalEntries() { await delay(); return store.getAll('journalEntries'); },
  async getJournalEntry(id) { await delay(); return store.getById('journalEntries', id); },
  async createJournalEntry(data) { await delay(); return store.create('journalEntries', data); },
  async updateJournalEntry(id, data) { await delay(); return store.update('journalEntries', id, data); },
};

export const purchaseApi = {
  async getOrders() { await delay(); return store.getAll('purchaseOrders'); },
  async getOrder(id) { await delay(); return store.getById('purchaseOrders', id); },
  async createOrder(data) { await delay(); return store.create('purchaseOrders', { ...data, status: 'DRAFT' }); },
  async updateOrder(id, data) { await delay(); return store.update('purchaseOrders', id, data); },
  async getBills() { await delay(); return store.getAll('vendorBills'); },
  async getBill(id) { await delay(); return store.getById('vendorBills', id); },
  async createBill(data) { await delay(); return store.create('vendorBills', { ...data, status: 'DRAFT' }); },
  async updateBill(id, data) { await delay(); return store.update('vendorBills', id, data); },
  async getPayments() { await delay(); return store.getAll('payments').filter(p => p.payment_type === 'OUTBOUND'); },
};

export const salesApi = {
  async getOrders() { await delay(); return store.getAll('salesOrders'); },
  async getOrder(id) { await delay(); return store.getById('salesOrders', id); },
  async createOrder(data) { await delay(); return store.create('salesOrders', { ...data, status: 'DRAFT' }); },
  async updateOrder(id, data) { await delay(); return store.update('salesOrders', id, data); },
  async getInvoices() { await delay(); return store.getAll('customerInvoices'); },
  async getInvoice(id) { await delay(); return store.getById('customerInvoices', id); },
  async createInvoice(data) { await delay(); return store.create('customerInvoices', { ...data, status: 'DRAFT' }); },
  async updateInvoice(id, data) { await delay(); return store.update('customerInvoices', id, data); },
  async getPayments() { await delay(); return store.getAll('payments').filter(p => p.payment_type === 'INBOUND'); },
};

export const budgetApi = {
  async getBudgets() { await delay(); return store.getAll('budgets'); },
  async getBudget(id) { await delay(); return store.getById('budgets', id); },
  async createBudget(data) { await delay(); return store.create('budgets', { ...data, status: 'DRAFT' }); },
  async updateBudget(id, data) { await delay(); return store.update('budgets', id, data); },
  async getAnalyticAccounts() { await delay(); return store.getAll('analyticAccounts'); },
  async createAnalyticAccount(data) { await delay(); return store.create('analyticAccounts', data); },
  async updateAnalyticAccount(id, data) { await delay(); return store.update('analyticAccounts', id, data); },
};

export const reportsApi = {
  async getProfitAndLoss(params = {}) {
    await delay();
    const entries = store.getAll('journalEntries').filter(e => e.state === 'POSTED');
    const accounts = store.getAll('accounts');
    let totalIncome = 0, totalExpenses = 0;
    entries.forEach(entry => {
      entry.items?.forEach(item => {
        const acct = accounts.find(a => a.id === item.account_id);
        if (acct?.type === 'INCOME') totalIncome += (item.credit - item.debit);
        if (acct?.type === 'EXPENSE') totalExpenses += (item.debit - item.credit);
      });
    });
    return {
      income: [{ name: 'Sales Income', amount: totalIncome }],
      expenses: [{ name: 'Purchase Expense / COGS', amount: totalExpenses }],
      totalIncome, totalExpenses,
      grossProfit: totalIncome - totalExpenses * 0.7,
      netProfit: totalIncome - totalExpenses,
    };
  },
  async getBalanceSheet(params = {}) {
    await delay();
    const entries = store.getAll('journalEntries').filter(e => e.state === 'POSTED');
    const accounts = store.getAll('accounts');
    const balances = {};
    accounts.forEach(a => { balances[a.id] = { ...a, balance: 0 }; });
    entries.forEach(entry => {
      entry.items?.forEach(item => {
        if (balances[item.account_id]) {
          balances[item.account_id].balance += (item.debit - item.credit);
        }
      });
    });
    const grouped = { ASSET: [], LIABILITY: [], EQUITY: [], INCOME: [], EXPENSE: [] };
    Object.values(balances).forEach(b => {
      if (grouped[b.type]) grouped[b.type].push(b);
    });
    const totalAssets = grouped.ASSET.reduce((s, a) => s + a.balance, 0);
    const totalLiabilities = Math.abs(grouped.LIABILITY.reduce((s, a) => s + a.balance, 0));
    const totalEquity = Math.abs(grouped.EQUITY.reduce((s, a) => s + a.balance, 0));
    const netIncome = Math.abs(grouped.INCOME.reduce((s, a) => s + a.balance, 0)) - grouped.EXPENSE.reduce((s, a) => s + a.balance, 0);
    return {
      assets: grouped.ASSET,
      liabilities: grouped.LIABILITY,
      equity: grouped.EQUITY,
      totalAssets, totalLiabilities, totalEquity, netIncome,
      isBalanced: Math.abs(totalAssets - (totalLiabilities + totalEquity + netIncome)) < 0.01,
    };
  },
};

export const paymentsApi = {
  async getAll() { await delay(); return store.getAll('payments'); },
  async create(data) { await delay(); return store.create('payments', data); },
};
