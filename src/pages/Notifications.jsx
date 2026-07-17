import { useEffect, useState } from "react";

import { Link } from "react-router-dom";

import API from "../services/api";

import "./Notifications.css";

function Notifications() {

  const role = localStorage.getItem("role");
  const [notifications,
  setNotifications] =
    useState([]);

  // =========================
  // GET NOTIFICATIONS
  // =========================

  const getNotifications =
  async () => {

    try {

      const response =
        await API.get(
          "/notifications"
        );

      setNotifications(
        response.data
      );

    } catch (error) {

      console.log(error);
    }
  };

  // =========================
  // MARK AS READ
  // =========================

  const markAsRead =
  async (id) => {

    try {

      await API.put(
        `/notifications/${id}`
      );

      getNotifications();

    } catch (error) {

      console.log(error);
    }
  };

  useEffect(() => {

    getNotifications();

  }, []);

  return (

    <div className="notification-page">

      {/* =========================
          SIDEBAR
      ========================= */}

      <div className="sidebar">

        <h2>
          ERP System
        </h2>

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
              <li className="active"><Link to="/notifications">Notifications</Link></li>
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

      </div>

      {/* =========================
          MAIN
      ========================= */}

      <div className="notification-container">

        <div className="notification-header">

          <h1>
            Notifications
          </h1>

          <div className="count-box">

            Unread:
            {
              notifications.filter(
                (n) => !n.isRead
              ).length
            }

          </div>

        </div>

        {
          notifications.length === 0 ? (

            <p>
              No Notifications Found
            </p>

          ) : (

            notifications.map((item) => (

              <div
                key={item._id}

                className={`notification-card ${item.type} ${
                  item.isRead
                  ? "read"
                  : "unread"
                }`}
              >

                <div className="notification-top">

                  <div>

                    <h3>
                      {item.title}
                    </h3>

                    <p>
                      {item.message}
                    </p>

                  </div>

                  {
                    !item.isRead && (

                      <button
                        className="read-btn"

                        onClick={() =>
                          markAsRead(item._id)
                        }
                      >
                        Mark Read
                      </button>
                    )
                  }

                </div>

                <span>
                  {
                    new Date(
                      item.createdAt
                    ).toLocaleString()
                  }
                </span>

              </div>
            ))
          )
        }

      </div>

    </div>
  );
}

export default Notifications;