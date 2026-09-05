import { api } from './client';

export const authApi = {
  login: (loginId, password) => api.post('/auth/login', { loginId, password }),
  signup: (data) => api.post('/auth/signup', data),
  createUser: (data) => api.post('/auth/users', data),
};

export const dashboardApi = {
  get: () => api.get('/dashboard'),
};

export const contactsApi = {
  getAll: () => api.get('/contacts'),
  getById: (id) => api.get(`/contacts/${id}`),
  create: (data) => api.post('/contacts', data),
  update: (id, data) => api.put(`/contacts/${id}`, data),
  remove: (id) => api.del(`/contacts/${id}`),
};

export const productCategoriesApi = {
  getAll: () => api.get('/product-categories'),
  getById: (id) => api.get(`/product-categories/${id}`),
  create: (data) => api.post('/product-categories', data),
  update: (id, data) => api.put(`/product-categories/${id}`, data),
  remove: (id) => api.del(`/product-categories/${id}`),
};

export const productsApi = {
  getAll: () => api.get('/products'),
  getById: (id) => api.get(`/products/${id}`),
  create: (data) => api.post('/products', data),
  update: (id, data) => api.put(`/products/${id}`, data),
  remove: (id) => api.del(`/products/${id}`),
};

export const analyticAccountsApi = {
  getAll: () => api.get('/analytic-accounts'),
  getById: (id) => api.get(`/analytic-accounts/${id}`),
  create: (data) => api.post('/analytic-accounts', data),
  update: (id, data) => api.put(`/analytic-accounts/${id}`, data),
  remove: (id) => api.del(`/analytic-accounts/${id}`),
};

export const accountsApi = {
  getAll: () => api.get('/accounts'),
  getById: (id) => api.get(`/accounts/${id}`),
  create: (data) => api.post('/accounts', data),
  update: (id, data) => api.put(`/accounts/${id}`, data),
  remove: (id) => api.del(`/accounts/${id}`),
};

export const journalsApi = {
  getAll: () => api.get('/journals'),
  getById: (id) => api.get(`/journals/${id}`),
  create: (data) => api.post('/journals', data),
  update: (id, data) => api.put(`/journals/${id}`, data),
  remove: (id) => api.del(`/journals/${id}`),
};

export const purchaseApi = {
  getOrders: () => api.get('/purchase/orders'),
  getOrder: (id) => api.get(`/purchase/orders/${id}`),
  createOrder: (data) => api.post('/purchase/orders', data),
  updateOrder: (id, data) => api.put(`/purchase/orders/${id}`, data),
  confirmOrder: (id) => api.post(`/purchase/orders/${id}/confirm`),
  createBill: (id, data) => api.post(`/purchase/orders/${id}/create-bill`, data),

  getBills: () => api.get('/purchase/bills'),
  getBill: (id) => api.get(`/purchase/bills/${id}`),
  confirmBill: (id) => api.post(`/purchase/bills/${id}/confirm`),
  cancelBill: (id) => api.post(`/purchase/bills/${id}/cancel`),
};

export const salesApi = {
  getOrders: () => api.get('/sales/orders'),
  getOrder: (id) => api.get(`/sales/orders/${id}`),
  createOrder: (data) => api.post('/sales/orders', data),
  updateOrder: (id, data) => api.put(`/sales/orders/${id}`, data),
  confirmOrder: (id) => api.post(`/sales/orders/${id}/confirm`),
  createInvoice: (id, data) => api.post(`/sales/orders/${id}/create-invoice`, data),

  getInvoices: () => api.get('/sales/invoices'),
  getInvoice: (id) => api.get(`/sales/invoices/${id}`),
  confirmInvoice: (id) => api.post(`/sales/invoices/${id}/confirm`),
  cancelInvoice: (id) => api.post(`/sales/invoices/${id}/cancel`),
};

export const paymentsApi = {
  getAll: (type) => api.get('/payments', type ? { type } : undefined),
  getForBill: (billId) => api.get(`/payments/bill/${billId}`),
  payBill: (billId, data) => api.post(`/payments/bill/${billId}`, data),
  getForInvoice: (invoiceId) => api.get(`/payments/invoice/${invoiceId}`),
  payInvoice: (invoiceId, data) => api.post(`/payments/invoice/${invoiceId}`, data),
};

export const journalEntriesApi = {
  getAll: () => api.get('/journal-entries'),
  getById: (id) => api.get(`/journal-entries/${id}`),
  create: (data) => api.post('/journal-entries', data),
  update: (id, data) => api.put(`/journal-entries/${id}`, data),
  post: (id) => api.post(`/journal-entries/${id}/post`),
  reset: (id) => api.post(`/journal-entries/${id}/reset`),
};

export const budgetsApi = {
  getAll: () => api.get('/budgets'),
  getById: (id) => api.get(`/budgets/${id}`),
  create: (data) => api.post('/budgets', data),
  confirm: (id) => api.post(`/budgets/${id}/confirm`),
  cancel: (id) => api.post(`/budgets/${id}/cancel`),
  revise: (id, data) => api.post(`/budgets/${id}/revise`, data),
};

export const reportsApi = {
  getProfitAndLoss: (params) => api.get('/reports/profit-loss', params),
  getBalanceSheet: (params) => api.get('/reports/balance-sheet', params),
  getBudgetReport: () => api.get('/reports/budget'),
};

export const portalApi = {
  getDashboard: () => api.get('/portal/dashboard'),
  getInvoices: () => api.get('/portal/invoices'),
  getInvoice: (id) => api.get(`/portal/invoices/${id}`),
  getBills: () => api.get('/portal/bills'),
  getBill: (id) => api.get(`/portal/bills/${id}`),
  payInvoice: (invoiceId, data) => api.post(`/portal/pay/invoice/${invoiceId}`, data),
  getStatement: () => api.get('/portal/statement'),
};
