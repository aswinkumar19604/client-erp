import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { FaArrowLeft, FaPrint, FaCalculator, FaBalanceScale } from "react-icons/fa";
import API from "../services/api";
import "./FinancialReports.css";
import Sidebar from "../components/Sidebar";

function FinancialReports() {
  const navigate = useNavigate();
  const role = localStorage.getItem("role");

  const [profitLoss, setProfitLoss] = useState(null);
  const [balanceSheet, setBalanceSheet] = useState(null);
  const [activeReport, setActiveReport] = useState("pl"); // 'pl' or 'bs'


  const fetchReports = async () => {
    try {
      const res = await API.get("/double-entry/reports");
      setProfitLoss(res.data.profitLoss);
      setBalanceSheet(res.data.balanceSheet);
    } catch (err) {
      console.log("Failed to load financial reports:", err);
    }
  };

  useEffect(() => {
    fetchReports();
  }, []);

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="report-layout">
      {/* SIDEBAR */}
      <Sidebar activePage="financial-reports" />

      {/* MAIN CONTENT */}
      <div className="report-container">
        <div className="report-header-row no-print">
          <button className="back-btn" onClick={() => navigate("/dashboard")}>
            <FaArrowLeft />
          </button>
          <button className="print-btn" onClick={handlePrint}>
            <FaPrint /> Print Report
          </button>
        </div>

        <div className="print-header">
          <h2>ERP Corporation Limited</h2>
          <p>Financial Year: 2026-2027</p>
        </div>

        <h1>Financial Statements</h1>
        <p className="subtitle no-print">Generate dynamic Profit & Loss statements and Balance Sheets</p>

        {/* TAB SWITCHER */}
        <div className="tab-switcher no-print">
          <button
            className={`tab-btn ${activeReport === "pl" ? "active" : ""}`}
            onClick={() => setActiveReport("pl")}
          >
            <FaCalculator /> Profit & Loss Statement (P&L)
          </button>
          <button
            className={`tab-btn ${activeReport === "bs" ? "active" : ""}`}
            onClick={() => setActiveReport("bs")}
          >
            <FaBalanceScale /> Balance Sheet
          </button>
        </div>

        {/* PROFIT & LOSS STATEMENT */}
        {activeReport === "pl" && profitLoss && (
          <div className="report-sheet">
            <h2 className="report-title">Profit & Loss Statement</h2>
            <p className="report-date-range">For the period ended {new Date().toLocaleDateString()}</p>

            <table className="financial-table">
              <thead>
                <tr>
                  <th>Particulars / Account</th>
                  <th className="amount-header">Amount</th>
                </tr>
              </thead>
              <tbody>
                {/* Revenue Section */}
                <tr className="section-header-tr">
                  <td colSpan="2">Revenue</td>
                </tr>
                {profitLoss.revenues.map((rev, idx) => (
                  <tr key={idx} className="line-item-tr">
                    <td className="indent-td">{rev.name}</td>
                    <td className="amount-td">₹{rev.balance.toLocaleString()}</td>
                  </tr>
                ))}
                <tr className="subtotal-tr">
                  <td>Total Revenues (A)</td>
                  <td className="amount-td">₹{profitLoss.totalRevenue.toLocaleString()}</td>
                </tr>

                {/* Expenses Section */}
                <tr className="section-header-tr">
                  <td colSpan="2">Expenses</td>
                </tr>
                {profitLoss.expenses.map((exp, idx) => (
                  <tr key={idx} className="line-item-tr">
                    <td className="indent-td">{exp.name}</td>
                    <td className="amount-td">₹{exp.balance.toLocaleString()}</td>
                  </tr>
                ))}
                <tr className="subtotal-tr">
                  <td>Total Expenses (B)</td>
                  <td className="amount-td">₹{profitLoss.totalExpense.toLocaleString()}</td>
                </tr>

                {/* Net Profit Section */}
                <tr className={`grand-total-tr ${profitLoss.netIncome >= 0 ? "positive-net" : "negative-net"}`}>
                  <td>Net Income / Profit (A - B)</td>
                  <td className="amount-td">₹{profitLoss.netIncome.toLocaleString()}</td>
                </tr>
              </tbody>
            </table>
          </div>
        )}

        {/* BALANCE SHEET */}
        {activeReport === "bs" && balanceSheet && (
          <div className="report-sheet">
            <h2 className="report-title">Balance Sheet</h2>
            <p className="report-date-range">As of {new Date().toLocaleDateString()}</p>

            <div className="balance-check-badge">
              <span className="badge-icon">⚖</span>
              <strong>Statement Status:</strong> Balanced (Assets = Liabilities + Equity)
            </div>

            <table className="financial-table">
              <thead>
                <tr>
                  <th>Assets (Applications of Funds)</th>
                  <th className="amount-header">Amount</th>
                </tr>
              </thead>
              <tbody>
                {balanceSheet.assets.map((asset, idx) => (
                  <tr key={idx} className="line-item-tr">
                    <td>{asset.name}</td>
                    <td className="amount-td">₹{asset.balance.toLocaleString()}</td>
                  </tr>
                ))}
                <tr className="grand-total-tr">
                  <td>Total Assets (A)</td>
                  <td className="amount-td">₹{balanceSheet.totalAssets.toLocaleString()}</td>
                </tr>
              </tbody>
            </table>

            <table className="financial-table" style={{ marginTop: "24px" }}>
              <thead>
                <tr>
                  <th>Liabilities & Equity (Sources of Funds)</th>
                  <th className="amount-header">Amount</th>
                </tr>
              </thead>
              <tbody>
                {/* Liabilities */}
                <tr className="section-header-tr">
                  <td colSpan="2">Liabilities</td>
                </tr>
                {balanceSheet.liabilities.map((liab, idx) => (
                  <tr key={idx} className="line-item-tr">
                    <td className="indent-td">{liab.name}</td>
                    <td className="amount-td">₹{liab.balance.toLocaleString()}</td>
                  </tr>
                ))}
                <tr className="subtotal-tr">
                  <td>Total Liabilities</td>
                  <td className="amount-td">₹{balanceSheet.totalLiabilities.toLocaleString()}</td>
                </tr>

                {/* Equity */}
                <tr className="section-header-tr">
                  <td colSpan="2">Equity</td>
                </tr>
                {balanceSheet.equity.map((eq, idx) => (
                  <tr key={idx} className="line-item-tr">
                    <td className="indent-td">{eq.name}</td>
                    <td className="amount-td">₹{eq.balance.toLocaleString()}</td>
                  </tr>
                ))}
                <tr className="subtotal-tr">
                  <td>Total Equity</td>
                  <td className="amount-td">₹{balanceSheet.totalEquity.toLocaleString()}</td>
                </tr>

                {/* Balance check */}
                <tr className="grand-total-tr">
                  <td>Total Liabilities & Equity (B)</td>
                  <td className="amount-td">₹{balanceSheet.netLiabilitiesAndEquity.toLocaleString()}</td>
                </tr>
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

export default FinancialReports;
