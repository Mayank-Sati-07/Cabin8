// ═══════════════════════════════════════════════════════════════════════════
// Urban Furniture ERP — Mock Data Store
// Centralized reactive store using localStorage + in-memory state
// ═══════════════════════════════════════════════════════════════════════════

const STORAGE_KEY = 'uf_erp_data';

function generateId() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
}

// ── Seed Data ─────────────────────────────────────────────────────────────

const seedContacts = [
  { id: 'c1', name: 'Azure Furniture', type: 'VENDOR', email: 'azure@furniture.com', mobile: '9876543210', street: '45 Industrial Area', city: 'Mumbai', state: 'Maharashtra', pincode: '400001', profile_image_url: '', is_active: true },
  { id: 'c2', name: 'Nimesh Pathak', type: 'CUSTOMER', email: 'nimesh@email.com', mobile: '9876543211', street: '12 MG Road', city: 'Ahmedabad', state: 'Gujarat', pincode: '380001', profile_image_url: '', is_active: true },
  { id: 'c3', name: 'WoodCraft Industries', type: 'VENDOR', email: 'info@woodcraft.com', mobile: '9876543212', street: '78 MIDC', city: 'Pune', state: 'Maharashtra', pincode: '411001', profile_image_url: '', is_active: true },
  { id: 'c4', name: 'Priya Sharma', type: 'CUSTOMER', email: 'priya@email.com', mobile: '9876543213', street: '34 Park Street', city: 'Delhi', state: 'Delhi', pincode: '110001', profile_image_url: '', is_active: true },
  { id: 'c5', name: 'Furniture Mart Pvt Ltd', type: 'BOTH', email: 'contact@furnituremart.com', mobile: '9876543214', street: '90 Commerce Centre', city: 'Bangalore', state: 'Karnataka', pincode: '560001', profile_image_url: '', is_active: true },
  { id: 'c6', name: 'Rajesh Kumar', type: 'CUSTOMER', email: 'rajesh@email.com', mobile: '9876543215', street: '56 Lake Road', city: 'Kolkata', state: 'West Bengal', pincode: '700001', profile_image_url: '', is_active: true },
];

const seedProducts = [
  { id: 'p1', name: 'Wooden Chair', type: 'GOODS', sales_price: 120, cost_price: 70, category: 'Chairs', image_url: '', is_active: true },
  { id: 'p2', name: 'Office Desk', type: 'GOODS', sales_price: 450, cost_price: 280, category: 'Tables', image_url: '', is_active: true },
  { id: 'p3', name: 'Leather Sofa', type: 'GOODS', sales_price: 1200, cost_price: 750, category: 'Sofas', image_url: '', is_active: true },
  { id: 'p4', name: 'Bookshelf Unit', type: 'GOODS', sales_price: 350, cost_price: 200, category: 'Office Furniture', image_url: '', is_active: true },
  { id: 'p5', name: 'Dining Table (6-seater)', type: 'GOODS', sales_price: 800, cost_price: 480, category: 'Tables', image_url: '', is_active: true },
  { id: 'p6', name: 'Assembly Service', type: 'SERVICE', sales_price: 50, cost_price: 30, category: 'Services', image_url: '', is_active: true },
  { id: 'p7', name: 'Recliner Chair', type: 'GOODS', sales_price: 650, cost_price: 400, category: 'Chairs', image_url: '', is_active: true },
  { id: 'p8', name: 'Standing Desk Combo', type: 'COMBO', sales_price: 550, cost_price: 350, category: 'Office Furniture', image_url: '', is_active: true },
];

const seedAccounts = [
  { id: 'a1', account_code: '1010', account_name: 'Cash', type: 'ASSET' },
  { id: 'a2', account_code: '1020', account_name: 'Bank', type: 'ASSET' },
  { id: 'a3', account_code: '1100', account_name: 'Accounts Receivable', type: 'ASSET' },
  { id: 'a4', account_code: '1200', account_name: 'Inventory Asset', type: 'ASSET' },
  { id: 'a5', account_code: '2100', account_name: 'Accounts Payable', type: 'LIABILITY' },
  { id: 'a6', account_code: '2200', account_name: 'Sales Tax Payable', type: 'LIABILITY' },
  { id: 'a7', account_code: '3010', account_name: "Owner's Capital", type: 'EQUITY' },
  { id: 'a8', account_code: '3020', account_name: 'Retained Earnings', type: 'EQUITY' },
  { id: 'a9', account_code: '4010', account_name: 'Sales Income', type: 'INCOME' },
  { id: 'a10', account_code: '4020', account_name: 'Service Revenue', type: 'INCOME' },
  { id: 'a11', account_code: '5010', account_name: 'Purchase Expense', type: 'EXPENSE' },
  { id: 'a12', account_code: '5020', account_name: 'Operating Expenses', type: 'EXPENSE' },
];

const seedJournals = [
  { id: 'j1', name: 'Sales Journal', type: 'SALES', default_debit_account_id: 'a3', default_credit_account_id: 'a9' },
  { id: 'j2', name: 'Purchase Journal', type: 'PURCHASE', default_debit_account_id: 'a11', default_credit_account_id: 'a5' },
  { id: 'j3', name: 'Bank Journal', type: 'BANK', default_debit_account_id: 'a2', default_credit_account_id: 'a2' },
  { id: 'j4', name: 'Cash Journal', type: 'CASH', default_debit_account_id: 'a1', default_credit_account_id: 'a1' },
  { id: 'j5', name: 'General Journal', type: 'GENERAL', default_debit_account_id: null, default_credit_account_id: null },
];

const seedAnalyticAccounts = [
  { id: 'aa1', name: 'Showroom Mumbai', code: 'SM-001', type: 'BOTH', description: 'Mumbai showroom operations' },
  { id: 'aa2', name: 'Wooden Furniture Project', code: 'WFP-001', type: 'EXPENSE', description: 'Custom wooden furniture manufacturing' },
  { id: 'aa3', name: 'Online Sales Channel', code: 'OSC-001', type: 'INCOME', description: 'E-commerce and online orders' },
];

const seedPurchaseOrders = [
  {
    id: 'po1', vendor_id: 'c1', order_date: '2026-01-15', expected_date: '2026-01-25', reference: 'PO-001',
    status: 'BILLED',
    lines: [
      { id: 'pol1', product_id: 'p1', description: 'Wooden Chair', quantity: 10, unit_price: 70, tax_rate: 18 },
    ],
  },
  {
    id: 'po2', vendor_id: 'c3', order_date: '2026-02-10', expected_date: '2026-02-20', reference: 'PO-002',
    status: 'CONFIRMED',
    lines: [
      { id: 'pol2', product_id: 'p2', description: 'Office Desk', quantity: 5, unit_price: 280, tax_rate: 18 },
      { id: 'pol3', product_id: 'p4', description: 'Bookshelf Unit', quantity: 8, unit_price: 200, tax_rate: 18 },
    ],
  },
];

const seedVendorBills = [
  {
    id: 'vb1', vendor_id: 'c1', po_id: 'po1', bill_date: '2026-01-20', due_date: '2026-02-20', vendor_ref: 'AZ-INV-001',
    status: 'PAID', journal_entry_id: 'je1',
    lines: [
      { id: 'vbl1', product_id: 'p1', description: 'Wooden Chair', quantity: 10, unit_price: 70, account_id: 'a11', tax_rate: 18 },
    ],
  },
];

const seedSalesOrders = [
  {
    id: 'so1', customer_id: 'c2', order_date: '2026-01-18', expiration_date: '2026-02-18', reference: 'SO-001',
    status: 'INVOICED',
    lines: [
      { id: 'sol1', product_id: 'p1', description: 'Wooden Chair', quantity: 5, unit_price: 120, tax_rate: 18 },
    ],
  },
  {
    id: 'so2', customer_id: 'c4', order_date: '2026-02-05', expiration_date: '2026-03-05', reference: 'SO-002',
    status: 'CONFIRMED',
    lines: [
      { id: 'sol2', product_id: 'p3', description: 'Leather Sofa', quantity: 2, unit_price: 1200, tax_rate: 18 },
      { id: 'sol3', product_id: 'p6', description: 'Assembly Service', quantity: 2, unit_price: 50, tax_rate: 18 },
    ],
  },
];

const seedCustomerInvoices = [
  {
    id: 'ci1', customer_id: 'c2', so_id: 'so1', invoice_date: '2026-01-20', due_date: '2026-02-20',
    status: 'PAID', journal_id: 'j1', journal_entry_id: 'je2',
    lines: [
      { id: 'cil1', product_id: 'p1', description: 'Wooden Chair', quantity: 5, unit_price: 120, account_id: 'a9', tax_rate: 18 },
    ],
  },
];

const seedPayments = [
  {
    id: 'pay1', payment_type: 'OUTBOUND', partner_id: 'c1', amount: 826, date: '2026-01-25',
    journal_id: 'j3', bill_id: 'vb1', invoice_id: null, journal_entry_id: 'je3', reference: 'Bank Transfer',
  },
  {
    id: 'pay2', payment_type: 'INBOUND', partner_id: 'c2', amount: 708, date: '2026-01-28',
    journal_id: 'j4', bill_id: null, invoice_id: 'ci1', journal_entry_id: 'je4', reference: 'Cash',
  },
];

const seedJournalEntries = [
  {
    id: 'je1', entry_number: 'BILL/2026/0001', journal_id: 'j2', date: '2026-01-20',
    reference: 'PO-001 / AZ-INV-001', state: 'POSTED',
    items: [
      { id: 'ji1', account_id: 'a11', contact_id: 'c1', label: 'Purchase - Wooden Chair x10', debit: 700, credit: 0 },
      { id: 'ji2', account_id: 'a6', contact_id: null, label: 'GST 18%', debit: 126, credit: 0 },
      { id: 'ji3', account_id: 'a5', contact_id: 'c1', label: 'Azure Furniture — Payable', debit: 0, credit: 826 },
    ],
  },
  {
    id: 'je2', entry_number: 'INV/2026/0001', journal_id: 'j1', date: '2026-01-20',
    reference: 'SO-001', state: 'POSTED',
    items: [
      { id: 'ji4', account_id: 'a3', contact_id: 'c2', label: 'Nimesh Pathak — Receivable', debit: 708, credit: 0 },
      { id: 'ji5', account_id: 'a9', contact_id: null, label: 'Sales Income - Wooden Chair x5', debit: 0, credit: 600 },
      { id: 'ji6', account_id: 'a6', contact_id: null, label: 'GST 18%', debit: 0, credit: 108 },
    ],
  },
  {
    id: 'je3', entry_number: 'PAY/2026/0001', journal_id: 'j3', date: '2026-01-25',
    reference: 'BILL/2026/0001 Payment', state: 'POSTED',
    items: [
      { id: 'ji7', account_id: 'a5', contact_id: 'c1', label: 'Clear AP — Azure Furniture', debit: 826, credit: 0 },
      { id: 'ji8', account_id: 'a2', contact_id: null, label: 'Bank Payment', debit: 0, credit: 826 },
    ],
  },
  {
    id: 'je4', entry_number: 'PAY/2026/0002', journal_id: 'j4', date: '2026-01-28',
    reference: 'INV/2026/0001 Payment', state: 'POSTED',
    items: [
      { id: 'ji9', account_id: 'a1', contact_id: null, label: 'Cash Receipt', debit: 708, credit: 0 },
      { id: 'ji10', account_id: 'a3', contact_id: 'c2', label: 'Clear AR — Nimesh Pathak', debit: 0, credit: 708 },
    ],
  },
];

const seedBudgets = [
  {
    id: 'b1', name: 'Q1 2026 — Furniture Procurement', start_date: '2026-01-01', end_date: '2026-03-31',
    period: 'Quarterly', responsible: 'Admin User', status: 'CONFIRMED',
    lines: [
      { id: 'bl1', analytic_account_id: 'aa1', planned_amount: 50000 },
      { id: 'bl2', analytic_account_id: 'aa2', planned_amount: 30000 },
    ],
  },
  {
    id: 'b2', name: 'Annual Marketing Budget', start_date: '2026-01-01', end_date: '2026-12-31',
    period: 'Annual', responsible: 'Admin User', status: 'DRAFT',
    lines: [
      { id: 'bl3', analytic_account_id: 'aa3', planned_amount: 100000 },
    ],
  },
];

// ── Store Class ───────────────────────────────────────────────────────────

class MockStore {
  constructor() {
    this._data = this._load();
  }

  _load() {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) return JSON.parse(saved);
    } catch (e) { /* ignore */ }
    return this._seed();
  }

  _seed() {
    const data = {
      contacts: seedContacts,
      products: seedProducts,
      accounts: seedAccounts,
      journals: seedJournals,
      analyticAccounts: seedAnalyticAccounts,
      purchaseOrders: seedPurchaseOrders,
      vendorBills: seedVendorBills,
      salesOrders: seedSalesOrders,
      customerInvoices: seedCustomerInvoices,
      payments: seedPayments,
      journalEntries: seedJournalEntries,
      budgets: seedBudgets,
    };
    this._save(data);
    return data;
  }

  _save(data) {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data || this._data));
    } catch (e) { /* ignore quota errors */ }
  }

  // Generic CRUD
  getAll(collection) {
    return [...(this._data[collection] || [])];
  }

  getById(collection, id) {
    return this._data[collection]?.find(item => item.id === id) || null;
  }

  create(collection, item) {
    const newItem = { ...item, id: item.id || generateId() };
    this._data[collection] = [...(this._data[collection] || []), newItem];
    this._save();
    return newItem;
  }

  update(collection, id, updates) {
    this._data[collection] = this._data[collection].map(item =>
      item.id === id ? { ...item, ...updates } : item
    );
    this._save();
    return this.getById(collection, id);
  }

  remove(collection, id) {
    this._data[collection] = this._data[collection].filter(item => item.id !== id);
    this._save();
  }

  reset() {
    this._data = this._seed();
  }
}

const store = new MockStore();
export default store;
export { generateId };
