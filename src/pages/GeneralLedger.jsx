import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { FaArrowLeft } from "react-icons/fa";
import API from "../services/api";
import "./GeneralLedger.css";
import Sidebar from "../components/Sidebar";

function GeneralLedger() {
  const navigate = useNavigate();

  const [accounts, setAccounts] = useState([]);
  const [entries, setEntries] = useState([]);
  const [activeTab, setActiveTab] = useState("accounts"); // 'accounts' or 'journals'
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  const getAccounts = async () => {
    try {
      const res = await API.get("/double-entry/accounts");
      setAccounts(res.data);
    } catch (err) {
      console.log(err);
    }
  };

  const getEntries = async () => {
    try {
      const res = await API.get("/double-entry/journals");
      setEntries(res.data);
    } catch (err) {
      console.log(err);
    }
  };

  useEffect(() => {
    getAccounts();
    getEntries();
  }, []);

  const filteredEntries = entries.filter(je => {
    if (!startDate && !endDate) return true;
    const entryDate = new Date(je.date || je.createdAt).toISOString().slice(0, 10);
    const start = startDate || "0000-00-00";
    const end = endDate || "9999-99-99";
    return entryDate >= start && entryDate <= end;
  });

  return (
    <div className="ledger-layout">
      {/* SIDEBAR */}
      <Sidebar activePage="general-ledger" />

      {/* MAIN CONTENT */}
      <div className="ledger-container">
        <button className="back-btn" onClick={() => navigate("/dashboard")}>
          <FaArrowLeft />
        </button>
        <h1>General Ledger & CoA</h1>
        <p className="subtitle">Track real-time double-entry balances and journal transactions</p>

        {/* TAB SWITCHER */}
        <div className="tab-switcher">
          <button
            className={`tab-btn ${activeTab === "accounts" ? "active" : ""}`}
            onClick={() => setActiveTab("accounts")}
          >
            Chart of Accounts (CoA)
          </button>
          <button
            className={`tab-btn ${activeTab === "journals" ? "active" : ""}`}
            onClick={() => setActiveTab("journals")}
          >
            Journal Entries (Logs)
          </button>
        </div>

        {/* TAB CONTENT: CHART OF ACCOUNTS */}
        {activeTab === "accounts" && (
          <div className="accounts-panel">
            <div className="accounts-card">
              <h3>Standard Accounts</h3>
              <table>
                <thead>
                  <tr>
                    <th>Account Code</th>
                    <th>Account Name</th>
                    <th>Category Type</th>
                    <th>Current Balance</th>
                  </tr>
                </thead>
                <tbody>
                  {accounts.map(acc => (
                    <tr key={acc._id}>
                      <td><strong>{acc.code}</strong></td>
                      <td>{acc.name}</td>
                      <td>
                        <span className={`category-badge ${acc.type.toLowerCase()}`}>
                          {acc.type}
                        </span>
                      </td>
                      <td className="balance-cell">₹{acc.balance.toLocaleString()}</td>
                    </tr>
                  ))}
                  {accounts.length === 0 && (
                    <tr>
                      <td colSpan="4">Seeding accounts...</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* TAB CONTENT: JOURNAL ENTRIES */}
        {activeTab === "journals" && (
          <div className="journals-panel">
            <h3>Recent Double-Entry Vouchers</h3>
            
            <div className="filter-row" style={{ display: 'flex', gap: '16px', marginBottom: '16px', alignItems: 'center' }}>
              <label style={{ display: 'flex', flexDirection: 'column', gap: '4px', fontSize: '0.85rem', fontWeight: 600, color: '#475569' }}>
                Start date:
                <input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} />
              </label>
              <label style={{ display: 'flex', flexDirection: 'column', gap: '4px', fontSize: '0.85rem', fontWeight: 600, color: '#475569' }}>
                End date:
                <input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} />
              </label>
            </div>

            <div className="journals-list">
              {filteredEntries.map(je => (
                <div key={je._id} className="je-voucher-card">
                  <div className="je-header">
                    <span className="je-num"><strong>{je.entryNumber}</strong></span>
                    <span className="je-date">{new Date(je.date).toLocaleDateString()}</span>
                    <span className={`je-ref-badge ${je.referenceType.toLowerCase()}`}>
                      Ref: {je.referenceType}
                    </span>
                  </div>
                  <p className="je-desc">{je.description || "Manual adjustment"}</p>
                  
                  {/* Line entries table */}
                  <table className="je-lines-table">
                    <thead>
                      <tr>
                        <th>Account</th>
                        <th>Debit</th>
                        <th>Credit</th>
                      </tr>
                    </thead>
                    <tbody>
                      {je.lines.map((line, idx) => (
                        <tr key={idx}>
                          <td>{line.account?.name || "N/A"}</td>
                          <td className="debit-col">
                            {line.type === "Debit" ? `₹${line.amount.toLocaleString()}` : "-"}
                          </td>
                          <td className="credit-col">
                            {line.type === "Credit" ? `₹${line.amount.toLocaleString()}` : "-"}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ))}
              {filteredEntries.length === 0 && (
                <p className="no-entries-text">No journal entries posted yet. Perform a sale or purchase to see automatically generated journals!</p>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default GeneralLedger;
