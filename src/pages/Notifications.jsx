import { useEffect, useState } from "react";

import { Link } from "react-router-dom";

import API from "../services/api";

import "./Notifications.css";

function Notifications() {

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

          <li>
            <Link to="/dashboard">
              Dashboard
            </Link>
          </li>

          <li>
            <Link to="/notifications">
              Notifications
            </Link>
          </li>

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