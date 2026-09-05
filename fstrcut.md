frontend/
├── src/
│   ├── pages/
│   │   ├── auth/
│   │   │   ├── Login.jsx
│   │   │   ├── SignUp.jsx
│   │   │   └── CreateUser.jsx          # Admin only
│   │   ├── Dashboard.jsx                # tile counts, click-through
│   │   ├── contacts/
│   │   │   ├── ContactList.jsx
│   │   │   ├── ContactKanban.jsx
│   │   │   └── ContactForm.jsx
│   │   ├── products/
│   │   │   ├── ProductList.jsx
│   │   │   ├── ProductKanban.jsx
│   │   │   └── ProductForm.jsx
│   │   ├── analytics/
│   │   │   └── AnalyticAccountForm.jsx
│   │   ├── budget/
│   │   │   ├── BudgetList.jsx
│   │   │   ├── BudgetKanban.jsx
│   │   │   ├── BudgetForm.jsx           # Draft/Confirm/Revise/Cancel actions inline
│   │   │   └── BudgetReport.jsx         # list + pie chart
│   │   ├── purchase/
│   │   │   ├── PurchaseOrderForm.jsx    # has "Create Bill" action
│   │   │   ├── VendorBillForm.jsx       # shows PO link if converted
│   │   │   └── BillPaymentForm.jsx
│   │   ├── sales/
│   │   │   ├── SalesOrderForm.jsx       # has "Create Invoice" action
│   │   │   ├── CustomerInvoiceForm.jsx  # shows SO link if converted
│   │   │   └── InvoicePaymentForm.jsx
│   │   ├── accounting/
│   │   │   ├── ChartOfAccounts.jsx
│   │   │   ├── Journals.jsx
│   │   │   ├── JournalEntryList.jsx
│   │   │   └── JournalEntryForm.jsx     # balance validation shown live
│   │   └── reports/
│   │       ├── ProfitAndLoss.jsx        # year picker + PDF print
│   │       └── BalanceSheet.jsx         # year picker + PDF print
│   ├── components/
│   │   ├── DataTable.jsx                # generic list view (search, select)
│   │   ├── KanbanBoard.jsx              # generic kanban (reused: Contact/Product/Budget)
│   │   ├── LineItemEditor.jsx           # PO/Bill/SO/Invoice line table
│   │   ├── StatusBadge.jsx
│   │   ├── AmountInput.jsx
│   │   └── ImageUpload.jsx
│   ├── api/
│   │   └── client.js                    # one generic REST client + module-specific calls
│   ├── context/AuthContext.jsx          # role stored here, drives menu visibility
│   ├── routes/AppRoutes.jsx             # role-gated
│   └── App.jsx