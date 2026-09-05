import { Routes, Route } from 'react-router-dom';
import AppLayout from '../layout/AppLayout';

// Auth
import Login from '../pages/auth/Login';
import SignUp from '../pages/auth/SignUp';
import CreateUser from '../pages/auth/CreateUser';

// Dashboard
import Dashboard from '../pages/Dashboard';

// Contacts
import ContactList from '../pages/contacts/ContactList';
import ContactForm from '../pages/contacts/ContactForm';

// Products
import ProductList from '../pages/products/ProductList';
import ProductForm from '../pages/products/ProductForm';

// Purchase
import PurchaseOrderList from '../pages/purchase/PurchaseOrderList';
import PurchaseOrderForm from '../pages/purchase/PurchaseOrderForm';
import VendorBillList from '../pages/purchase/VendorBillList';
import VendorBillForm from '../pages/purchase/VendorBillForm';
import BillPaymentList from '../pages/purchase/BillPaymentList';
import BillPaymentForm from '../pages/purchase/BillPaymentForm';

// Sales
import SalesOrderList from '../pages/sales/SalesOrderList';
import SalesOrderForm from '../pages/sales/SalesOrderForm';
import CustomerInvoiceList from '../pages/sales/CustomerInvoiceList';
import CustomerInvoiceForm from '../pages/sales/CustomerInvoiceForm';
import InvoicePaymentList from '../pages/sales/InvoicePaymentList';
import InvoicePaymentForm from '../pages/sales/InvoicePaymentForm';

// Accounting
import ChartOfAccounts from '../pages/accounting/ChartOfAccounts';
import Journals from '../pages/accounting/Journals';
import JournalEntryList from '../pages/accounting/JournalEntryList';
import JournalEntryForm from '../pages/accounting/JournalEntryForm';

// Analytics & Budget
import AnalyticAccountList from '../pages/analytics/AnalyticAccountList';
import AnalyticAccountForm from '../pages/analytics/AnalyticAccountForm';
import BudgetList from '../pages/budget/BudgetList';
import BudgetForm from '../pages/budget/BudgetForm';
import BudgetReport from '../pages/budget/BudgetReport';

// Reports
import ProfitAndLoss from '../pages/reports/ProfitAndLoss';
import BalanceSheet from '../pages/reports/BalanceSheet';

// Portal
import PortalDashboard from '../pages/portal/PortalDashboard';
import PortalInvoiceList from '../pages/portal/PortalInvoiceList';
import PortalBillList from '../pages/portal/PortalBillList';
import PortalPaymentForm from '../pages/portal/PortalPaymentForm';
import PortalStatement from '../pages/portal/PortalStatement';

export default function AppRoutes() {
  return (
    <Routes>
      {/* Auth pages (no layout shell) */}
      <Route path="/auth/login" element={<Login />} />
      <Route path="/auth/signup" element={<SignUp />} />

      {/* Main app with layout */}
      <Route element={<AppLayout />}>
        {/* Dashboard */}
        <Route path="/" element={<Dashboard />} />

        {/* User Management */}
        <Route path="/auth/create-user" element={<CreateUser />} />

        {/* Contacts */}
        <Route path="/contacts" element={<ContactList />} />
        <Route path="/contacts/new" element={<ContactForm />} />
        <Route path="/contacts/:id" element={<ContactForm />} />

        {/* Products */}
        <Route path="/products" element={<ProductList />} />
        <Route path="/products/new" element={<ProductForm />} />
        <Route path="/products/:id" element={<ProductForm />} />

        {/* Purchase */}
        <Route path="/purchase/orders" element={<PurchaseOrderList />} />
        <Route path="/purchase/orders/new" element={<PurchaseOrderForm />} />
        <Route path="/purchase/orders/:id" element={<PurchaseOrderForm />} />
        <Route path="/purchase/bills" element={<VendorBillList />} />
        <Route path="/purchase/bills/:id" element={<VendorBillForm />} />
        <Route path="/purchase/payments" element={<BillPaymentList />} />
        <Route path="/purchase/payments/new" element={<BillPaymentForm />} />

        {/* Sales */}
        <Route path="/sales/orders" element={<SalesOrderList />} />
        <Route path="/sales/orders/new" element={<SalesOrderForm />} />
        <Route path="/sales/orders/:id" element={<SalesOrderForm />} />
        <Route path="/sales/invoices" element={<CustomerInvoiceList />} />
        <Route path="/sales/invoices/:id" element={<CustomerInvoiceForm />} />
        <Route path="/sales/payments" element={<InvoicePaymentList />} />
        <Route path="/sales/payments/new" element={<InvoicePaymentForm />} />

        {/* Accounting */}
        <Route path="/accounting/chart" element={<ChartOfAccounts />} />
        <Route path="/accounting/journals" element={<Journals />} />
        <Route path="/accounting/entries" element={<JournalEntryList />} />
        <Route path="/accounting/entries/new" element={<JournalEntryForm />} />
        <Route path="/accounting/entries/:id" element={<JournalEntryForm />} />

        {/* Analytics */}
        <Route path="/analytics" element={<AnalyticAccountList />} />
        <Route path="/analytics/new" element={<AnalyticAccountForm />} />
        <Route path="/analytics/:id" element={<AnalyticAccountForm />} />

        {/* Budget */}
        <Route path="/budgets" element={<BudgetList />} />
        <Route path="/budgets/new" element={<BudgetForm />} />
        <Route path="/budgets/:id" element={<BudgetForm />} />

        {/* Reports */}
        <Route path="/reports/profit-loss" element={<ProfitAndLoss />} />
        <Route path="/reports/balance-sheet" element={<BalanceSheet />} />
        <Route path="/reports/budget" element={<BudgetReport />} />

        {/* Portal */}
        <Route path="/portal" element={<PortalDashboard />} />
        <Route path="/portal/invoices" element={<PortalInvoiceList />} />
        <Route path="/portal/bills" element={<PortalBillList />} />
        <Route path="/portal/payment" element={<PortalPaymentForm />} />
        <Route path="/portal/statement" element={<PortalStatement />} />
      </Route>
    </Routes>
  );
}
