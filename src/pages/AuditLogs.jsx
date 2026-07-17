import { useEffect, useState, Fragment } from "react";
import { Link, useNavigate } from "react-router-dom";
import { FaArrowLeft, FaFilter, FaSearch, FaHistory, FaChevronDown, FaChevronUp } from "react-icons/fa";
import API from "../services/api";
import "./AuditLogs.css";

function AuditLogs() {
  const navigate = useNavigate();
  const role = localStorage.getItem("role");

  const [logs, setLogs] = useState([]);
  const [filteredLogs, setFilteredLogs] = useState([]);
  const [loading, setLoading] = useState(true);

  // Search & Filter state
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedModule, setSelectedModule] = useState("");
  const [selectedAction, setSelectedAction] = useState("");
  const [expandedLogId, setExpandedLogId] = useState(null);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  const logout = () => {
    localStorage.clear();
    navigate("/");
  };

  const fetchLogs = async () => {
    try {
      setLoading(true);
      const res = await API.get("/audit/audit-logs");
      setLogs(res.data);
      setFilteredLogs(res.data);
    } catch (err) {
      console.log("Failed to fetch audit logs:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
    window.scrollTo(0, 0);
  }, []);

  // Filter logic
  useEffect(() => {
    let result = [...logs];

    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      result = result.filter(
        log =>
          log.details.toLowerCase().includes(term) ||
          log.operator?.email?.toLowerCase().includes(term) ||
          log.operator?.name?.toLowerCase().includes(term)
      );
    }

    if (selectedModule) {
      result = result.filter(log => log.module === selectedModule);
    }

    if (selectedAction) {
      result = result.filter(log => log.action === selectedAction);
    }

    if (startDate) {
      result = result.filter(log => {
        const logDate = new Date(log.createdAt || log.date).toISOString().slice(0, 10);
        return logDate >= startDate;
      });
    }

    if (endDate) {
      result = result.filter(log => {
        const logDate = new Date(log.createdAt || log.date).toISOString().slice(0, 10);
        return logDate <= endDate;
      });
    }

    setFilteredLogs(result);
  }, [searchTerm, selectedModule, selectedAction, startDate, endDate, logs]);

  const toggleRow = (id) => {
    setExpandedLogId(expandedLogId === id ? null : id);
  };

  return (
    <div className="audit-layout">
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
              <li><Link to="/stock-history">Stock History</Link></li>
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
              <li className="active"><Link to="/audit-logs">Audit Logs</Link></li>
            </>
          )}
        </ul>
        <button className="logout-btn" onClick={logout}>
          Logout
        </button>
      </div>

      {/* MAIN CONTAINER */}
      <div className="audit-container">
        <button className="back-btn" onClick={() => navigate("/dashboard")}>
          <FaArrowLeft />
        </button>
        <h1>Immutable Audit Logs Ledger</h1>
        <p className="subtitle">Track system-wide modifications, checkouts, database changes, and HR submissions</p>

        {/* Filter controls row */}
        <div className="filter-card">
          <div className="filter-item search-bar">
            <FaSearch className="search-icon" />
            <input
              type="text"
              placeholder="Search by operator, email, or activity details..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <div className="filter-item">
            <FaFilter className="filter-icon" />
            <select
              value={selectedModule}
              onChange={(e) => setSelectedModule(e.target.value)}
            >
              <option value="">-- All Modules --</option>
              <option value="Sales">Sales</option>
              <option value="Purchases">Purchases</option>
              <option value="Accounting">Accounting</option>
              <option value="HR">HR</option>
              <option value="MRP">Manufacturing (MRP)</option>
            </select>
          </div>

          <div className="filter-item">
            <select
              value={selectedAction}
              onChange={(e) => setSelectedAction(e.target.value)}
            >
              <option value="">-- All Actions --</option>
              <option value="CREATE">CREATE</option>
              <option value="UPDATE">UPDATE</option>
              <option value="DELETE">DELETE</option>
            </select>
          </div>

          <div className="filter-item date-filters" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              title="Start Date"
            />
            <span style={{ color: '#64748b', fontSize: '0.85rem' }}>to</span>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              title="End Date"
            />
          </div>
        </div>

        {/* Audit Log Table */}
        <div className="table-card">
          {loading ? (
            <p className="loading-txt">Loading audit records database...</p>
          ) : (
            <table>
              <thead>
                <tr>
                  <th>Timestamp</th>
                  <th>Operator</th>
                  <th>Module</th>
                  <th>Action</th>
                  <th>Details</th>
                  <th className="amount-header">Data Diff</th>
                </tr>
              </thead>
              <tbody>
                {filteredLogs.map(log => (
                  <Fragment key={log._id}>
                    <tr className={expandedLogId === log._id ? "expanded-row-tr" : ""}>
                      <td>
                        <small>
                          {new Date(log.createdAt).toLocaleDateString()}
                          <br />
                          {new Date(log.createdAt).toLocaleTimeString()}
                        </small>
                      </td>
                      <td>
                        <strong>{log.operator?.name || "System"}</strong>
                        <br />
                        <small className="sub-txt">{log.operator?.email || "automated-trigger"}</small>
                      </td>
                      <td>
                        <span className={`module-badge ${log.module.toLowerCase()}`}>
                          {log.module}
                        </span>
                      </td>
                      <td>
                        <span className={`action-badge ${log.action.toLowerCase()}`}>
                          {log.action}
                        </span>
                      </td>
                      <td>
                        <span className="details-txt">{log.details}</span>
                      </td>
                      <td className="action-cell">
                        <button
                          className="btn-action view-diff"
                          onClick={() => toggleRow(log._id)}
                        >
                          {expandedLogId === log._id ? (
                            <>Hide <FaChevronUp /></>
                          ) : (
                            <>Inspect <FaChevronDown /></>
                          )}
                        </button>
                      </td>
                    </tr>
                    {expandedLogId === log._id && (
                      <tr className="collapsible-details-row">
                        <td colSpan="6">
                          <div className="diff-inspect-panel">
                            <h4>Database Payload Audit Diffs</h4>
                            <p><strong>Target Document reference ID:</strong> <code>{log.documentId}</code></p>
                            {log.changes ? (
                              <pre className="json-box">
                                {JSON.stringify(log.changes, null, 2)}
                              </pre>
                            ) : (
                              <p className="empty-diff-txt">No raw JSON state payload differences logged for this action.</p>
                            )}
                          </div>
                        </td>
                      </tr>
                    )}
                  </Fragment>
                ))}

                {filteredLogs.length === 0 && (
                  <tr>
                    <td colSpan="6" className="empty-row-txt">No audit logs match the current search filters.</td>
                  </tr>
                )}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}

export default AuditLogs;
