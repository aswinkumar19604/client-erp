import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { FaArrowLeft, FaHistory, FaBoxOpen } from "react-icons/fa";
import API from "../services/api";

function StockHistory() {
  const navigate = useNavigate();
  const role = localStorage.getItem("role");

  const [history, setHistory] = useState([]);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  const logout = () => {
    localStorage.clear();
    navigate("/");
  };

  const getHistory = async () => {
    try {
      const response = await API.get("/stock-history");
      setHistory(response.data);
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    getHistory();
  }, []);

  const filteredHistory = history.filter((item) => {
    if (!startDate && !endDate) return true;
    const itemDate = new Date(item.createdAt || item.date).toISOString().slice(0, 10);
    const start = startDate || "0000-00-00";
    const end = endDate || "9999-99-99";
    return itemDate >= start && itemDate <= end;
  });

  const getActionBadge = (actionType) => {
    const action = actionType || "Adjustment";
    let colorClass = "badge-blue";
    const actLower = action.toLowerCase();
    if (actLower.includes("receipt") || actLower.includes("add") || actLower.includes("in") || actLower.includes("purchase") || actLower.includes("received")) {
      colorClass = "badge-green";
    } else if (actLower.includes("dispatch") || actLower.includes("remove") || actLower.includes("out") || actLower.includes("sale") || actLower.includes("dispatched") || actLower.includes("cancel")) {
      colorClass = "badge-red";
    } else if (actLower.includes("production") || actLower.includes("manufacturing") || actLower.includes("mrp")) {
      colorClass = "badge-purple";
    }
    return (
      <span className={`status-pill ${colorClass}`} style={{ 
        padding: '6px 12px', 
        borderRadius: '20px', 
        fontSize: '0.75rem', 
        fontWeight: 'bold',
        textTransform: 'uppercase',
        letterSpacing: '0.03em',
        backgroundColor: colorClass === 'badge-green' ? '#dcfce7' : colorClass === 'badge-red' ? '#fee2e2' : colorClass === 'badge-purple' ? '#f3e8ff' : '#e0f2fe',
        color: colorClass === 'badge-green' ? '#15803d' : colorClass === 'badge-red' ? '#dc2626' : colorClass === 'badge-purple' ? '#7e22ce' : '#0369a1'
      }}>
        {action}
      </span>
    );
  };

  return (
    <div className="history-layout" style={{ display: 'flex', minHeight: '100vh' }}>
      {/* SIDEBAR */}
      <div className="sidebar">
        <h2>ERP System</h2>
        <ul>
          <li><Link to="/dashboard">Dashboard</Link></li>
          <li><Link to="/ess-portal">ESS Portal</Link></li>
          <li><Link to="/team-chat">Team Chat</Link></li>
          {role === "admin" && (
            <>
              <li><Link to="/employees">Employees</Link></li>
              <li><Link to="/products">Products</Link></li>
              <li><Link to="/inventory">Inventory</Link></li>
              <li className="active"><Link to="/stock-history">Stock History</Link></li>
              <li><Link to="/manufacturing">Manufacturing</Link></li>
              <li><Link to="/notifications">Notifications</Link></li>
              <li><Link to="/sales">Sales</Link></li>
              <li><Link to="/quotations">Quotations</Link></li>
              <li><Link to="/sales-orders">Sales Orders</Link></li>
              <li><Link to="/purchases">Purchases</Link></li>
              <li><Link to="/purchase-orders">Purchase Orders</Link></li>
              <li><Link to="/goods-receipts">Goods Receipts</Link></li>
              <li><Link to="/general-ledger">General Ledger</Link></li>
              <li><Link to="/financial-reports">Financial Reports</Link></li>
              <li><Link to="/accounting">Accounting</Link></li>
              <li><Link to="/expenses">Expenses</Link></li>
              <li><Link to="/hr">HR</Link></li>
              <li><Link to="/payroll">Payroll</Link></li>
              <li><Link to="/projects">Projects</Link></li>
              <li><Link to="/leads">CRM Leads</Link></li>
              <li><Link to="/customers">Customers</Link></li>
              <li><Link to="/suppliers">Suppliers</Link></li>
              <li><Link to="/audit-logs">Audit Logs</Link></li>
            </>
          )}
        </ul>
        <button className="logout-btn" onClick={logout}>
          Logout
        </button>
      </div>

      {/* MAIN CONTENT */}
      <div className="history-container">
        <button
          className="back-btn"
          onClick={() => navigate("/dashboard")}
        >
          <FaArrowLeft />
        </button>

        <h1>
          <FaHistory style={{ marginRight: '10px', verticalAlign: 'middle', color: '#3b82f6' }} />
          Stock History Ledger
        </h1>
        <p className="subtitle" style={{ color: '#64748b', marginBottom: '24px' }}>
          Track all historical stock level adjustments, incoming shipments, sales dispatches, and manufacturing runs.
        </p>

        {/* Filters */}
        <div className="filter-card" style={{ display: 'flex', gap: '16px', marginBottom: '24px', padding: '20px', background: '#ffffff', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
          <label style={{ display: 'flex', flexDirection: 'column', gap: '6px', fontSize: '0.85rem', fontWeight: 600, color: '#475569', flex: 1 }}>
            Start Date
            <input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} style={{ padding: '8px 12px', border: '1px solid #cbd5e1', borderRadius: '6px' }} />
          </label>
          <label style={{ display: 'flex', flexDirection: 'column', gap: '6px', fontSize: '0.85rem', fontWeight: 600, color: '#475569', flex: 1 }}>
            End Date
            <input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} style={{ padding: '8px 12px', border: '1px solid #cbd5e1', borderRadius: '6px' }} />
          </label>
        </div>

        {/* Ledger Table */}
        <div className="table-card" style={{ background: '#ffffff', borderRadius: '12px', border: '1px solid #e2e8f0', overflow: 'hidden' }}>
          <table>
            <thead>
              <tr>
                <th>Product</th>
                <th>Action Type</th>
                <th>Qty Transacted</th>
                <th>Previous Stock</th>
                <th>New Stock Balance</th>
                <th>Date & Time</th>
              </tr>
            </thead>
            <tbody>
              {filteredHistory.map((item) => (
                <tr key={item._id}>
                  <td style={{ fontWeight: '600', color: '#1e293b' }}>
                    <FaBoxOpen style={{ marginRight: '8px', color: '#64748b' }} />
                    {item.product?.name || "Deleted Product"}
                  </td>
                  <td>{getActionBadge(item.actionType)}</td>
                  <td style={{ fontWeight: 'bold', color: item.quantity > 0 ? '#16a34a' : '#dc2626' }}>
                    {item.quantity > 0 ? `+${item.quantity}` : item.quantity}
                  </td>
                  <td style={{ color: '#64748b' }}>{item.previousStock}</td>
                  <td style={{ fontWeight: '600', color: '#0f172a' }}>{item.newStock}</td>
                  <td style={{ color: '#64748b', fontSize: '0.85rem' }}>
                    {new Date(item.createdAt).toLocaleString()}
                  </td>
                </tr>
              ))}
              {filteredHistory.length === 0 && (
                <tr>
                  <td colSpan="6" style={{ textAlign: 'center', padding: '24px', color: '#64748b' }}>
                    No stock transaction records found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export default StockHistory;