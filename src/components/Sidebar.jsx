import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  FaTachometerAlt,
  FaUser,
  FaComments,
  FaUsers,
  FaBoxOpen,
  FaBoxes,
  FaHistory,
  FaIndustry,
  FaBell,
  FaDollarSign,
  FaFileInvoice,
  FaFileSignature,
  FaShoppingCart,
  FaFileContract,
  FaReceipt,
  FaBook,
  FaChartLine,
  FaCalculator,
  FaCreditCard,
  FaBriefcase,
  FaMoneyBillWave,
  FaTasks,
  FaHandshake,
  FaAddressBook,
  FaTruck,
  FaShieldAlt,
  FaBars,
  FaTimes,
  FaSignOutAlt
} from "react-icons/fa";

function Sidebar({ activePage }) {
  const navigate = useNavigate();
  const role = localStorage.getItem("role");
  const [isOpen, setIsOpen] = useState(false);

  const logout = () => {
    localStorage.clear();
    navigate("/");
  };

  const toggleSidebar = () => {
    setIsOpen(!isOpen);
  };

  const menuItems = [
    ...(role === "admin" ? [{ path: "/dashboard", label: "Dashboard", id: "dashboard", icon: <FaTachometerAlt /> }] : []),
    { path: "/ess-portal", label: "ESS Portal", id: "ess-portal", icon: <FaUser /> },
    { path: "/team-chat", label: "Team Chat", id: "team-chat", icon: <FaComments /> },
  ];

  const adminItems = [
    { path: "/employees", label: "Employees", id: "employees", icon: <FaUsers /> },
    { path: "/products", label: "Products", id: "products", icon: <FaBoxOpen /> },
    { path: "/inventory", label: "Inventory", id: "inventory", icon: <FaBoxes /> },
    { path: "/stock-history", label: "Stock History", id: "stock-history", icon: <FaHistory /> },
    { path: "/manufacturing", label: "Manufacturing", id: "manufacturing", icon: <FaIndustry /> },
    { path: "/notifications", label: "Notifications", id: "notifications", icon: <FaBell /> },
    { path: "/sales", label: "Sales", id: "sales", icon: <FaDollarSign /> },
    { path: "/quotations", label: "Quotations", id: "quotations", icon: <FaFileInvoice /> },
    { path: "/sales-orders", label: "Sales Orders", id: "sales-orders", icon: <FaFileSignature /> },
    { path: "/purchases", label: "Purchases", id: "purchases", icon: <FaShoppingCart /> },
    { path: "/purchase-orders", label: "Purchase Orders", id: "purchase-orders", icon: <FaFileContract /> },
    { path: "/goods-receipts", label: "Goods Receipts", id: "goods-receipts", icon: <FaReceipt /> },
    { path: "/general-ledger", label: "General Ledger", id: "general-ledger", icon: <FaBook /> },
    { path: "/financial-reports", label: "Financial Reports", id: "financial-reports", icon: <FaChartLine /> },
    { path: "/accounting", label: "Accounting", id: "accounting", icon: <FaCalculator /> },
    { path: "/expenses", label: "Expenses", id: "expenses", icon: <FaCreditCard /> },
    { path: "/hr", label: "HR", id: "hr", icon: <FaBriefcase /> },
    { path: "/payroll", label: "Payroll", id: "payroll", icon: <FaMoneyBillWave /> },
    { path: "/projects", label: "Projects", id: "projects", icon: <FaTasks /> },
    { path: "/leads", label: "CRM Leads", id: "leads", icon: <FaHandshake /> },
    { path: "/customers", label: "Customers", id: "customers", icon: <FaAddressBook /> },
    { path: "/suppliers", label: "Suppliers", id: "suppliers", icon: <FaTruck /> },
    { path: "/audit-logs", label: "Audit Logs", id: "audit-logs", icon: <FaShieldAlt /> },
  ];

  return (
    <>
      {/* Mobile Top Bar */}
      <div className="mobile-header no-print">
        <h2 className="mobile-logo">ERP System</h2>
        <button className="hamburger-btn" onClick={toggleSidebar} aria-label="Toggle Menu">
          <FaBars />
        </button>
      </div>

      {/* Backdrop Overlay when Sidebar is open on mobile */}
      {isOpen && <div className="sidebar-overlay no-print" onClick={toggleSidebar}></div>}

      <div className={`sidebar no-print ${isOpen ? "open" : ""}`}>
        <div className="sidebar-brand">
          <h2>ERP System</h2>
          <button className="close-btn" onClick={toggleSidebar} aria-label="Close Menu">
            <FaTimes />
          </button>
        </div>

        <ul>
          {menuItems.map((item) => (
            <li key={item.id} className={activePage === item.id ? "active" : ""}>
              <Link to={item.path} onClick={() => setIsOpen(false)}>
                {item.icon}
                <span>{item.label}</span>
              </Link>
            </li>
          ))}

          {role === "admin" && (
            <>
              <div className="sidebar-section-title">Admin Management</div>
              {adminItems.map((item) => (
                <li key={item.id} className={activePage === item.id ? "active" : ""}>
                  <Link to={item.path} onClick={() => setIsOpen(false)}>
                    {item.icon}
                    <span>{item.label}</span>
                  </Link>
                </li>
              ))}
            </>
          )}
        </ul>

        <button className="logout-btn" onClick={logout}>
          <FaSignOutAlt />
          <span>Logout</span>
        </button>
      </div>
    </>
  );
}

export default Sidebar;
