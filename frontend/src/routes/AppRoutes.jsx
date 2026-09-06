import { lazy, Suspense } from 'react';
import { Routes, Route } from 'react-router-dom';
import AppLayout from '../layout/AppLayout';
import ProtectedRoute from '../components/ProtectedRoute';
import LoadingScreen from '../components/LoadingScreen';
import { ROLES, INTERNAL_ROLES } from '../constants/roles';

// Auth
const Login = lazy(() => import('../pages/auth/Login'));
const SignUp = lazy(() => import('../pages/auth/SignUp'));
const CreateUser = lazy(() => import('../pages/auth/CreateUser'));

// Dashboard
const Dashboard = lazy(() => import('../pages/Dashboard'));

// Contacts
const ContactList = lazy(() => import('../pages/contacts/ContactList'));
const ContactForm = lazy(() => import('../pages/contacts/ContactForm'));

// Products
const ProductList = lazy(() => import('../pages/products/ProductList'));
const ProductForm = lazy(() => import('../pages/products/ProductForm'));
const ProductCategoryList = lazy(() => import('../pages/products/ProductCategoryList'));

// Purchase
const PurchaseOrderList = lazy(() => import('../pages/purchase/PurchaseOrderList'));
const PurchaseOrderForm = lazy(() => import('../pages/purchase/PurchaseOrderForm'));
const VendorBillList = lazy(() => import('../pages/purchase/VendorBillList'));
const VendorBillForm = lazy(() => import('../pages/purchase/VendorBillForm'));
const BillPaymentList = lazy(() => import('../pages/purchase/BillPaymentList'));
const BillPaymentForm = lazy(() => import('../pages/purchase/BillPaymentForm'));

// Sales
const SalesOrderList = lazy(() => import('../pages/sales/SalesOrderList'));
const SalesOrderForm = lazy(() => import('../pages/sales/SalesOrderForm'));
const CustomerInvoiceList = lazy(() => import('../pages/sales/CustomerInvoiceList'));
const CustomerInvoiceForm = lazy(() => import('../pages/sales/CustomerInvoiceForm'));
const InvoicePaymentList = lazy(() => import('../pages/sales/InvoicePaymentList'));
const InvoicePaymentForm = lazy(() => import('../pages/sales/InvoicePaymentForm'));

// Accounting
const ChartOfAccounts = lazy(() => import('../pages/accounting/ChartOfAccounts'));
const Journals = lazy(() => import('../pages/accounting/Journals'));
const JournalEntryList = lazy(() => import('../pages/accounting/JournalEntryList'));
const JournalEntryForm = lazy(() => import('../pages/accounting/JournalEntryForm'));

// Analytics & Budget
const AnalyticAccountList = lazy(() => import('../pages/analytics/AnalyticAccountList'));
const AnalyticAccountForm = lazy(() => import('../pages/analytics/AnalyticAccountForm'));
const BudgetList = lazy(() => import('../pages/budget/BudgetList'));
const BudgetForm = lazy(() => import('../pages/budget/BudgetForm'));
const BudgetReport = lazy(() => import('../pages/budget/BudgetReport'));

// Reports
const ProfitAndLoss = lazy(() => import('../pages/reports/ProfitAndLoss'));
const BalanceSheet = lazy(() => import('../pages/reports/BalanceSheet'));

// Settings
const CompanySettings = lazy(() => import('../pages/settings/CompanySettings'));

// Portal
const PortalDashboard = lazy(() => import('../pages/portal/PortalDashboard'));
const PortalInvoiceList = lazy(() => import('../pages/portal/PortalInvoiceList'));
const PortalBillList = lazy(() => import('../pages/portal/PortalBillList'));
const PortalPaymentForm = lazy(() => import('../pages/portal/PortalPaymentForm'));
const PortalStatement = lazy(() => import('../pages/portal/PortalStatement'));

function Internal({ children }) {
  return <ProtectedRoute roles={INTERNAL_ROLES}>{children}</ProtectedRoute>;
}

function Portal({ children }) {
  return <ProtectedRoute roles={[ROLES.USER]}>{children}</ProtectedRoute>;
}

export default function AppRoutes() {
  return (
    <Suspense fallback={<LoadingScreen />}>
      <Routes>
        {/* Auth pages (no layout shell) */}
        <Route path="/auth/login" element={<Login />} />
        <Route path="/auth/signup" element={<SignUp />} />

        {/* Main app with layout */}
        <Route element={<AppLayout />}>
          {/* Dashboard */}
          <Route path="/" element={<Internal><Dashboard /></Internal>} />

          {/* User Management */}
          <Route path="/auth/create-user" element={<ProtectedRoute roles={[ROLES.ADMIN]}><CreateUser /></ProtectedRoute>} />

          {/* Contacts */}
          <Route path="/contacts" element={<Internal><ContactList /></Internal>} />
          <Route path="/contacts/new" element={<Internal><ContactForm /></Internal>} />
          <Route path="/contacts/:id" element={<Internal><ContactForm /></Internal>} />

          {/* Products */}
          <Route path="/products" element={<Internal><ProductList /></Internal>} />
          <Route path="/products/categories" element={<Internal><ProductCategoryList /></Internal>} />
          <Route path="/products/new" element={<Internal><ProductForm /></Internal>} />
          <Route path="/products/:id" element={<Internal><ProductForm /></Internal>} />

          {/* Purchase */}
          <Route path="/purchase/orders" element={<Internal><PurchaseOrderList /></Internal>} />
          <Route path="/purchase/orders/new" element={<Internal><PurchaseOrderForm /></Internal>} />
          <Route path="/purchase/orders/:id" element={<Internal><PurchaseOrderForm /></Internal>} />
          <Route path="/purchase/bills" element={<Internal><VendorBillList /></Internal>} />
          <Route path="/purchase/bills/:id" element={<Internal><VendorBillForm /></Internal>} />
          <Route path="/purchase/payments" element={<Internal><BillPaymentList /></Internal>} />
          <Route path="/purchase/payments/new" element={<Internal><BillPaymentForm /></Internal>} />

          {/* Sales */}
          <Route path="/sales/orders" element={<Internal><SalesOrderList /></Internal>} />
          <Route path="/sales/orders/new" element={<Internal><SalesOrderForm /></Internal>} />
          <Route path="/sales/orders/:id" element={<Internal><SalesOrderForm /></Internal>} />
          <Route path="/sales/invoices" element={<Internal><CustomerInvoiceList /></Internal>} />
          <Route path="/sales/invoices/:id" element={<Internal><CustomerInvoiceForm /></Internal>} />
          <Route path="/sales/payments" element={<Internal><InvoicePaymentList /></Internal>} />
          <Route path="/sales/payments/new" element={<Internal><InvoicePaymentForm /></Internal>} />

          {/* Accounting */}
          <Route path="/accounting/chart" element={<Internal><ChartOfAccounts /></Internal>} />
          <Route path="/accounting/journals" element={<Internal><Journals /></Internal>} />
          <Route path="/accounting/entries" element={<Internal><JournalEntryList /></Internal>} />
          <Route path="/accounting/entries/new" element={<Internal><JournalEntryForm /></Internal>} />
          <Route path="/accounting/entries/:id" element={<Internal><JournalEntryForm /></Internal>} />

          {/* Analytics */}
          <Route path="/analytics" element={<Internal><AnalyticAccountList /></Internal>} />
          <Route path="/analytics/new" element={<Internal><AnalyticAccountForm /></Internal>} />
          <Route path="/analytics/:id" element={<Internal><AnalyticAccountForm /></Internal>} />

          {/* Budget */}
          <Route path="/budgets" element={<Internal><BudgetList /></Internal>} />
          <Route path="/budgets/new" element={<Internal><BudgetForm /></Internal>} />
          <Route path="/budgets/:id" element={<Internal><BudgetForm /></Internal>} />

          {/* Reports */}
          <Route path="/reports/profit-loss" element={<Internal><ProfitAndLoss /></Internal>} />
          <Route path="/reports/balance-sheet" element={<Internal><BalanceSheet /></Internal>} />
          <Route path="/reports/budget" element={<Internal><BudgetReport /></Internal>} />

          {/* Settings */}
          <Route path="/settings/company" element={<ProtectedRoute roles={[ROLES.ADMIN]}><CompanySettings /></ProtectedRoute>} />

          {/* Portal */}
          <Route path="/portal" element={<Portal><PortalDashboard /></Portal>} />
          <Route path="/portal/invoices" element={<Portal><PortalInvoiceList /></Portal>} />
          <Route path="/portal/bills" element={<Portal><PortalBillList /></Portal>} />
          <Route path="/portal/payment" element={<Portal><PortalPaymentForm /></Portal>} />
          <Route path="/portal/statement" element={<Portal><PortalStatement /></Portal>} />
        </Route>
      </Routes>
    </Suspense>
  );
}
