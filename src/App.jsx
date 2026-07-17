import {
  BrowserRouter,
  Routes,
  Route
} from "react-router-dom";

import Login from "./pages/Login";
import Register from "./pages/Register";
import ForgotPassword from "./pages/ForgotPassword";
import ResetPassword from "./pages/ResetPassword";
import Employees from "./pages/Employees";
import Sales
  from "./pages/Sales";
import Dashboard from "./pages/Dashboard";
import StockHistory from "./pages/StockHistory";
import Notifications from "./pages/Notifications";
import Suppliers
  from "./pages/Suppliers";
import Customers
  from "./pages/Customers";
import Purchases
  from "./pages/Purchases";
import Products
  from "./pages/Products";
import ProtectedRoute
  from "./components/ProtectedRoute";
import Inventory
  from "./pages/Inventory";
import Accounting from "./pages/Accounting";
import HR from "./pages/HR";
import Payroll from "./pages/Payroll";
import Projects from "./pages/Projects";
import Leads from "./pages/Leads";
import Expenses from "./pages/Expenses";
import PurchaseOrders from "./pages/PurchaseOrders";
import GoodsReceipts from "./pages/GoodsReceipts";
import GeneralLedger from "./pages/GeneralLedger";
import FinancialReports from "./pages/FinancialReports";
import ESSPortal from "./pages/ESSPortal";
import Manufacturing from "./pages/Manufacturing";
import Quotations from "./pages/Quotations";
import SalesOrders from "./pages/SalesOrders";
import AuditLogs from "./pages/AuditLogs";
import TeamChat from "./pages/TeamChat";
function App() {

  return (
    <BrowserRouter>

      <Routes>

        <Route
          path="/"
          element={<Login />}
        />

        <Route
          path="/register"
          element={<Register />}
        />

        <Route
          path="/forgot-password"
          element={<ForgotPassword />}
        />

        <Route
          path="/reset-password/:token"
          element={<ResetPassword />}
        />
        <Route
          path="/customers"
          element={
            <ProtectedRoute>
              <Customers />
            </ProtectedRoute>
          }
        />
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          }
        />

        <Route
          path="/employees"
          element={
            <ProtectedRoute>
              <Employees />
            </ProtectedRoute>
          }
        />
        <Route
          path="/products"
          element={
            <ProtectedRoute>
              <Products />
            </ProtectedRoute>
          }
        />
        <Route
          path="/inventory"
          element={
            <ProtectedRoute>
              <Inventory />
            </ProtectedRoute>
          }
        />
        <Route
          path="/sales"
          element={
            <ProtectedRoute>
              <Sales />
            </ProtectedRoute>
          }
        />
        <Route
          path="/purchases"
          element={
            <ProtectedRoute>
              <Purchases />
            </ProtectedRoute>
          }
        />
        <Route
          path="/purchase-orders"
          element={
            <ProtectedRoute>
              <PurchaseOrders />
            </ProtectedRoute>
          }
        />
        <Route
          path="/goods-receipts"
          element={
            <ProtectedRoute>
              <GoodsReceipts />
            </ProtectedRoute>
          }
        />
        <Route
          path="/general-ledger"
          element={
            <ProtectedRoute>
              <GeneralLedger />
            </ProtectedRoute>
          }
        />
        <Route
          path="/financial-reports"
          element={
            <ProtectedRoute adminOnly={true}>
              <FinancialReports />
            </ProtectedRoute>
          }
        />
        <Route
          path="/manufacturing"
          element={
            <ProtectedRoute adminOnly={true}>
              <Manufacturing />
            </ProtectedRoute>
          }
        />
        <Route
          path="/quotations"
          element={
            <ProtectedRoute adminOnly={true}>
              <Quotations />
            </ProtectedRoute>
          }
        />
        <Route
          path="/sales-orders"
          element={
            <ProtectedRoute adminOnly={true}>
              <SalesOrders />
            </ProtectedRoute>
          }
        />
        <Route
          path="/audit-logs"
          element={
            <ProtectedRoute adminOnly={true}>
              <AuditLogs />
            </ProtectedRoute>
          }
        />
        <Route
          path="/ess-portal"
          element={
            <ProtectedRoute>
              <ESSPortal />
            </ProtectedRoute>
          }
        />
        <Route
          path="/suppliers"
          element={
            <ProtectedRoute>
              <Suppliers />
            </ProtectedRoute>
          }
        />
        <Route
          path="/stock-history"
          element={
            <ProtectedRoute>
              <StockHistory />
            </ProtectedRoute>
          }
        />
        <Route
          path="/notifications"
          element={
            <ProtectedRoute>
              <Notifications />
            </ProtectedRoute>
          }
        />
        <Route
          path="/accounting"
          element={
            <ProtectedRoute>
              <Accounting />
            </ProtectedRoute>
          }
        />
        <Route
          path="/hr"
          element={
            <ProtectedRoute>
              <HR />
            </ProtectedRoute>
          }
        />
        <Route
          path="/payroll"
          element={
            <ProtectedRoute>
              <Payroll />
            </ProtectedRoute>
          }
        />
        <Route
          path="/projects"
          element={
            <ProtectedRoute>
              <Projects />
            </ProtectedRoute>
          }
        />
        <Route
          path="/leads"
          element={
            <ProtectedRoute>
              <Leads />
            </ProtectedRoute>
          }
        />
        <Route
          path="/expenses"
          element={
            <ProtectedRoute>
              <Expenses />
            </ProtectedRoute>
          }
        />
        <Route
          path="/team-chat"
          element={
            <ProtectedRoute>
              <TeamChat />
            </ProtectedRoute>
          }
        />
      </Routes>

    </BrowserRouter>
  );
}

export default App;