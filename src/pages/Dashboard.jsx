import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import API from "../services/api";
import "./Dashboard.css";
import ChatBot from "./ChatBot";
import Sidebar from "../components/Sidebar";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ResponsiveContainer,
  Legend
} from "recharts";

function Dashboard() {

  const navigate = useNavigate();

  const [dashboard, setDashboard] = useState({});
  const [charts, setCharts] = useState({ sales: [], purchases: [] });

  const role = localStorage.getItem("role");

  const getDashboard = async () => {
    try {
      const res = await API.get("/dashboard");
      setDashboard(res.data);
    } catch (err) {
      console.log(err);
    }
  };

  const getCharts = async () => {
    try {
      const res = await API.get("/dashboard/charts");
      setCharts(res.data);
    } catch (err) {
      console.log("Chart API error:", err);
    }
  };

  useEffect(() => {
    getDashboard();
    getCharts();
  }, []);

  return (
  <>
    <div className="dashboard">

      {/* SIDEBAR */}
      <Sidebar activePage="dashboard" />

      {/* MAIN */}
      <div className="main-content">

        <div className="topbar">
          <h1>ERP Dashboard ({role})</h1>
        </div>

        {/* KPI CARDS */}
        <div className="card-container">

          <div className="card">
            <h3>Employees</h3>
            <p>{dashboard.totalEmployees}</p>
          </div>

          <div className="card">
            <h3>Products</h3>
            <p>{dashboard.totalProducts}</p>
          </div>

          <div className="card">
            <h3>Inventory</h3>
            <p>{dashboard.totalInventory}</p>
          </div>

          <div className="card">
            <h3>Low Stock</h3>
            <p>{dashboard.lowStock}</p>
          </div>

          <div className="card">
            <h3>Stock Value</h3>
            <p>₹ {dashboard.totalStockValue}</p>
          </div>

          <div className="card">
            <h3>Sales</h3>
            <p>₹ {dashboard.totalSalesAmount}</p>
          </div>

          <div className="card">
            <h3>Purchase</h3>
            <p>₹ {dashboard.totalPurchaseAmount}</p>
          </div>

          <div className="card">
            <h3>Profit</h3>
            <p>₹ {dashboard.profit}</p>
          </div>

        </div>

        {/* CHART SECTION */}
        <div className="chart-section">

          <h2 className="chart-title">
            Sales vs Purchase Trend
          </h2>

          <div className="chart-wrapper">

            <div className="chart-card">
              <h3>Sales Trend</h3>

              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={charts.sales}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="monthName" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Line type="monotone" dataKey="total" stroke="#4CAF50" />
                </LineChart>
              </ResponsiveContainer>

            </div>

            <div className="chart-card">
              <h3>Purchase Trend</h3>

              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={charts.purchases}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="monthName" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Line type="monotone" dataKey="total" stroke="#F44336" />
                </LineChart>
              </ResponsiveContainer>

            </div>

          </div>
        </div>

        {/* ========================= */}
        {/* LOW STOCK ALERT SECTION */}
        {/* ========================= */}

        {dashboard.recentInventory?.filter(
          (item) =>
            item.availableStock <= item.product?.minimum_record_qty
        ).length > 0 && (
          <div className="alert-box">
            <h3>⚠️ Low Stock Alerts</h3>

            {dashboard.recentInventory
              .filter(
                (item) =>
                  item.availableStock <= item.product?.minimum_record_qty
              )
              .map((item) => (
                <p key={item._id}>
                  {item.product?.name} → Stock: {item.availableStock} / Min: {item.product?.minimum_record_qty}
                </p>
              ))}
          </div>
        )}

        {/* RECENT INVENTORY */}
        <div className="recent-section">
          <h2>Recent Inventory</h2>

          <table>
            <thead>
              <tr>
                <th>Product</th>
                <th>Available</th>
                <th>Status</th>
              </tr>
            </thead>

            <tbody>
              {dashboard.recentInventory?.map((item) => (
                <tr key={item._id}>
                  <td>{item.product?.name}</td>
                  <td>{item.availableStock}</td>
                  <td className={item.status === "Low Stock" ? "low-stock" : "in-stock"}>
                    {item.status}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

        </div>

      </div>
    </div>
    <ChatBot />
    </>
  );
}
  
export default Dashboard; 