frontend/
├── src/
│   ├── pages/
│   │   ├── auth/
│   │   │   ├── Login.jsx
│   │   │   ├── SignUp.jsx
│   │   │   └── CreateUser.jsx              # Admin only
│   │   ├── Dashboard.jsx                    # KPI tiles, click-through, recent activity feed
│   │   ├── contacts/
│   │   │   ├── ContactList.jsx
│   │   │   ├── ContactKanban.jsx
│   │   │   └── ContactForm.jsx
│   │   ├── products/
│   │   │   ├── ProductList.jsx
│   │   │   ├── ProductKanban.jsx
│   │   │   └── ProductForm.jsx
│   │   ├── analytics/
│   │   │   ├── AnalyticAccountList.jsx      # ADDED
│   │   │   └── AnalyticAccountForm.jsx
│   │   ├── budget/
│   │   │   ├── BudgetList.jsx
│   │   │   ├── BudgetKanban.jsx
│   │   │   ├── BudgetForm.jsx
│   │   │   └── BudgetReport.jsx
│   │   ├── purchase/
│   │   │   ├── PurchaseOrderList.jsx        # ADDED
│   │   │   ├── PurchaseOrderForm.jsx
│   │   │   ├── VendorBillList.jsx           # ADDED
│   │   │   ├── VendorBillForm.jsx
│   │   │   ├── BillPaymentList.jsx          # ADDED
│   │   │   └── BillPaymentForm.jsx
│   │   ├── sales/
│   │   │   ├── SalesOrderList.jsx           # ADDED
│   │   │   ├── SalesOrderForm.jsx
│   │   │   ├── CustomerInvoiceList.jsx      # ADDED
│   │   │   ├── CustomerInvoiceForm.jsx
│   │   │   ├── InvoicePaymentList.jsx       # ADDED
│   │   │   └── InvoicePaymentForm.jsx
│   │   ├── accounting/
│   │   │   ├── ChartOfAccounts.jsx
│   │   │   ├── Journals.jsx
│   │   │   ├── JournalEntryList.jsx
│   │   │   └── JournalEntryForm.jsx
│   │   ├── reports/
│   │   │   ├── ProfitAndLoss.jsx
│   │   │   └── BalanceSheet.jsx
│   │   └── portal/                          # ADDED — Contact self-service
│   │       ├── PortalDashboard.jsx
│   │       ├── PortalInvoiceList.jsx
│   │       ├── PortalBillList.jsx
│   │       ├── PortalPaymentForm.jsx
│   │       └── PortalStatement.jsx
│   ├── layout/                              # ADDED
│   │   ├── AppLayout.jsx                    # shell wrapping sidebar + topbar + outlet
│   │   ├── Sidebar.jsx                      # role-filtered nav
│   │   └── Topbar.jsx
│   ├── components/
│   │   ├── DataTable.jsx
│   │   ├── KanbanBoard.jsx
│   │   ├── LineItemEditor.jsx
│   │   ├── StatusBadge.jsx
│   │   ├── AmountInput.jsx
│   │   ├── ImageUpload.jsx
│   │   └── ProtectedRoute.jsx               # ADDED — role gate wrapper
│   ├── api/
│   │   ├── axiosInstance.js                 # ADDED — base config + interceptors
│   │   ├── authApi.js                       # ADDED
│   │   ├── contactsApi.js                   # ADDED
│   │   ├── productsApi.js                   # ADDED
│   │   ├── accountingApi.js                 # ADDED (accounts, journals, entries)
│   │   ├── purchaseApi.js                   # ADDED
│   │   ├── salesApi.js                      # ADDED
│   │   ├── budgetApi.js                     # ADDED
│   │   └── reportsApi.js                    # ADDED
│   ├── hooks/                               # ADDED
│   │   ├── useAuth.js
│   │   ├── usePermission.js
│   │   └── useDebitCreditBalance.js
│   ├── utils/                               # ADDED
│   │   ├── currency.js                      # formatting, precision
│   │   ├── taxCalc.js
│   │   └── statusColors.js
│   ├── constants/                           # ADDED
│   │   ├── roles.js
│   │   └── statuses.js
│   ├── context/AuthContext.jsx
│   ├── routes/AppRoutes.jsx
│   └── App.jsx
