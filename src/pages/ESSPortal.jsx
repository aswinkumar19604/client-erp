import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { FaClock, FaCalendarAlt, FaFileInvoiceDollar, FaSignOutAlt, FaCheckCircle, FaUserAlt, FaComments, FaTasks } from "react-icons/fa";
import API from "../services/api";
import "./ESSPortal.css";

function ESSPortal() {
  const navigate = useNavigate();
  const role = localStorage.getItem("role");
  const [profile, setProfile] = useState(null);
  const [attendance, setAttendance] = useState([]);
  const [leaves, setLeaves] = useState([]);
  const [payrolls, setPayrolls] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [activeTab, setActiveTab] = useState("dashboard"); // 'dashboard', 'leave', 'payroll', 'tasks'
  const [errorMsg, setErrorMsg] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  // Admin view simulator states
  const [employeeList, setEmployeeList] = useState([]);
  const [selectedEmployeeId, setSelectedEmployeeId] = useState("");

  // Leave Form state
  const [leaveForm, setLeaveForm] = useState({
    leaveType: "Casual",
    startDate: "",
    endDate: "",
    reason: ""
  });

  const logout = () => {
    localStorage.clear();
    navigate("/");
  };

  const getQueryStr = () => {
    return role === "admin" && selectedEmployeeId ? `?employeeId=${selectedEmployeeId}` : "";
  };

  const fetchProfile = async () => {
    try {
      const res = await API.get("/ess/profile" + getQueryStr());
      setProfile(res.data);
      setErrorMsg("");
    } catch (err) {
      if (role !== "admin") {
        setErrorMsg(err.response?.data?.message || "Failed to load profile. Are you registered as an Employee?");
      } else {
        setProfile(null);
        setErrorMsg("Admin Mode: Select an employee from the dropdown list to preview their portal.");
      }
    }
  };

  const fetchAttendance = async () => {
    try {
      const res = await API.get("/ess/attendance" + getQueryStr());
      setAttendance(res.data);
    } catch (err) {
      console.log(err);
    }
  };

  const fetchLeaves = async () => {
    try {
      const res = await API.get("/ess/leave" + getQueryStr());
      setLeaves(res.data);
    } catch (err) {
      console.log(err);
    }
  };

  const fetchPayrolls = async () => {
    try {
      const res = await API.get("/ess/payroll" + getQueryStr());
      setPayrolls(res.data);
    } catch (err) {
      console.log(err);
    }
  };

  const fetchTasks = async () => {
    try {
      const res = await API.get("/ess/tasks" + getQueryStr());
      setTasks(res.data);
    } catch (err) {
      console.log(err);
    }
  };

  const handleUpdateTaskStatus = async (projectId, taskTitle, newStatus) => {
    setErrorMsg("");
    setSuccessMsg("");
    try {
      const res = await API.put("/ess/tasks/status" + getQueryStr(), {
        projectId,
        taskTitle,
        status: newStatus
      });
      setSuccessMsg(res.data.message);
      fetchTasks();
    } catch (err) {
      setErrorMsg(err.response?.data?.message || "Failed to update task status");
    }
  };

  const fetchEmployeeList = async () => {
    try {
      const res = await API.get("/employees");
      setEmployeeList(res.data);
      if (res.data.length > 0) {
        setSelectedEmployeeId(res.data[0]._id);
      }
    } catch (err) {
      console.log("Failed to load employee list:", err);
    }
  };

  useEffect(() => {
    if (role === "admin") {
      fetchEmployeeList();
    } else {
      fetchProfile();
      fetchAttendance();
      fetchLeaves();
      fetchPayrolls();
      fetchTasks();
    }
  }, []);

  // Sync simulation values when admin dropdown changes
  useEffect(() => {
    if (role === "admin" && selectedEmployeeId) {
      fetchProfile();
      fetchAttendance();
      fetchLeaves();
      fetchPayrolls();
      fetchTasks();
    }
  }, [selectedEmployeeId]);

  const handleClockIn = async () => {
    setErrorMsg("");
    setSuccessMsg("");
    try {
      const res = await API.post("/ess/attendance/clock" + getQueryStr(), {});
      setSuccessMsg(res.data.message);
      fetchAttendance();
    } catch (err) {
      setErrorMsg(err.response?.data?.message || "Attendance clock-in failed");
    }
  };

  const handleLeaveSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg("");
    setSuccessMsg("");
    try {
      const res = await API.post("/ess/leave" + getQueryStr(), leaveForm);
      setSuccessMsg(res.data.message);
      setLeaveForm({ leaveType: "Casual", startDate: "", endDate: "", reason: "" });
      fetchLeaves();
    } catch (err) {
      setErrorMsg(err.response?.data?.message || "Failed to submit leave request");
    }
  };

  const isClockedInToday = () => {
    if (attendance.length === 0) return false;
    const latest = new Date(attendance[0].date);
    const today = new Date();
    return latest.toDateString() === today.toDateString();
  };

  return (
    <div className="ess-layout">
      {/* SIDE NAVIGATION */}
      <div className="ess-sidebar">
        <div className="brand-logo">
          <h2>ESS Portal</h2>
        </div>
        <ul>
          <li className={activeTab === "dashboard" ? "active" : ""} onClick={() => { setActiveTab("dashboard"); setErrorMsg(""); setSuccessMsg(""); }}>
            <FaClock /> Dashboard & Attendance
          </li>
          <li className={activeTab === "leave" ? "active" : ""} onClick={() => { setActiveTab("leave"); setErrorMsg(""); setSuccessMsg(""); }}>
            <FaCalendarAlt /> Apply Leave
          </li>
          <li className={activeTab === "payroll" ? "active" : ""} onClick={() => { setActiveTab("payroll"); setErrorMsg(""); setSuccessMsg(""); }}>
            <FaFileInvoiceDollar /> Payslips & Salary
          </li>
          <li className={activeTab === "tasks" ? "active" : ""} onClick={() => { setActiveTab("tasks"); setErrorMsg(""); setSuccessMsg(""); }}>
            <FaTasks /> Assigned Tasks
          </li>
          <li onClick={() => navigate("/team-chat")}>
            <FaComments /> Team Chat
          </li>
        </ul>
        <button className="logout-btn" onClick={logout}>
          <FaSignOutAlt /> Logout
        </button>
      </div>

      {/* PORTAL CONTENT */}
      <div className="ess-container">
        {/* Admin Selector Dropdown */}
        {role === "admin" && employeeList.length > 0 && (
          <div className="admin-selector-banner no-print">
            <label>View ESS Portal as Employee (Admin Mode):</label>
            <div className="selector-row">
              <select
                value={selectedEmployeeId}
                onChange={(e) => {
                  setSelectedEmployeeId(e.target.value);
                  setErrorMsg("");
                  setSuccessMsg("");
                }}
              >
                {employeeList.map((emp) => (
                  <option key={emp._id} value={emp._id}>
                    {emp.name} ({emp.email}) - {emp.designation}
                  </option>
                ))}
              </select>
              <button className="back-to-dashboard-btn" onClick={() => navigate("/dashboard")}>
                Go back to Admin Panel
              </button>
            </div>
          </div>
        )}

        {/* Profile Card Header */}
        {profile ? (
          <div className="profile-header-card">
            <div className="profile-icon">
              <FaUserAlt />
            </div>
            <div className="profile-meta">
              <h2>Welcome, {profile.name}</h2>
              <p>{profile.designation} &bull; {profile.department}</p>
            </div>
            <div className="profile-stats">
              <div className="stat-pill">Joined: {new Date(profile.joiningDate).toLocaleDateString()}</div>
              <div className="stat-pill">Salary: ₹{profile.salary.toLocaleString()}</div>
            </div>
          </div>
        ) : (
          !errorMsg && <p className="loading-txt">Loading employee profile...</p>
        )}

        {/* Messaging blocks */}
        {errorMsg && <div className="alert-banner error">{errorMsg}</div>}
        {successMsg && <div className="alert-banner success">{successMsg}</div>}

        {/* TAB content: Dashboard & Attendance */}
        {activeTab === "dashboard" && profile && (
          <div className="ess-tab-content">
            <div className="clockin-panel">
              <div className="clockin-card">
                <h3>Daily Attendance</h3>
                <p className="clock-helper">Record your attendance for today</p>
                <div className="time-display">{new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</div>

                {isClockedInToday() ? (
                  <button className="clockin-btn success-state" disabled>
                    <FaCheckCircle /> Already Clocked In Today
                  </button>
                ) : (
                  <button className="clockin-btn" onClick={handleClockIn}>
                    Clock In / Present
                  </button>
                )}
              </div>

              <div className="attendance-summary-card">
                <h3>Attendance Summary</h3>
                <div className="stat-row">
                  <span>Total Present Logs:</span>
                  <strong>{attendance.filter(a => a.status === "Present").length} days</strong>
                </div>
                <div className="stat-row">
                  <span>Last Clock-In:</span>
                  <strong>{attendance.length > 0 ? new Date(attendance[0].date).toLocaleString() : "No history"}</strong>
                </div>
              </div>
            </div>

            {/* Attendance list table */}
            <div className="ess-table-card">
              <h3>Attendance Log History</h3>
              <table>
                <thead>
                  <tr>
                    <th>Date</th>
                    <th>Time Status</th>
                    <th>Status</th>
                    <th>Notes</th>
                  </tr>
                </thead>
                <tbody>
                  {attendance.map(att => (
                    <tr key={att._id}>
                      <td><strong>{new Date(att.date).toLocaleDateString()}</strong></td>
                      <td>{new Date(att.date).toLocaleTimeString()}</td>
                      <td>
                        <span className={`status-pill ${att.status.toLowerCase()}`}>
                          {att.status}
                        </span>
                      </td>
                      <td>{att.notes}</td>
                    </tr>
                  ))}
                  {attendance.length === 0 && (
                    <tr>
                      <td colSpan="4" className="empty-row-txt">No attendance logs registered yet.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* TAB content: Apply Leave */}
        {activeTab === "leave" && profile && (
          <div className="ess-tab-content leave-tab-layout">
            <div className="leave-form-card">
              <h3>Submit Leave Request</h3>
              <form onSubmit={handleLeaveSubmit}>
                <div className="form-item">
                  <label>Leave Type</label>
                  <select
                    value={leaveForm.leaveType}
                    onChange={(e) => setLeaveForm({ ...leaveForm, leaveType: e.target.value })}
                  >
                    <option value="Casual">Casual Leave</option>
                    <option value="Sick">Sick Leave</option>
                    <option value="Annual">Annual Leave</option>
                    <option value="Other">Other Leave</option>
                  </select>
                </div>

                <div className="form-row-dates">
                  <div className="form-item">
                    <label>Start Date</label>
                    <input
                      type="date"
                      required
                      value={leaveForm.startDate}
                      onChange={(e) => setLeaveForm({ ...leaveForm, startDate: e.target.value })}
                    />
                  </div>
                  <div className="form-item">
                    <label>End Date</label>
                    <input
                      type="date"
                      required
                      value={leaveForm.endDate}
                      onChange={(e) => setLeaveForm({ ...leaveForm, endDate: e.target.value })}
                    />
                  </div>
                </div>

                <div className="form-item">
                  <label>Reason / Remarks</label>
                  <textarea
                    required
                    placeholder="Provide a brief explanation for leave..."
                    value={leaveForm.reason}
                    onChange={(e) => setLeaveForm({ ...leaveForm, reason: e.target.value })}
                  />
                </div>

                <button type="submit">Submit Leave Request</button>
              </form>
            </div>

            {/* Leave request history list */}
            <div className="ess-table-card leave-history-card">
              <h3>Leave Request History</h3>
              <table>
                <thead>
                  <tr>
                    <th>Dates</th>
                    <th>Type</th>
                    <th>Reason</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {leaves.map(lv => (
                    <tr key={lv._id}>
                      <td>
                        <strong>{new Date(lv.startDate).toLocaleDateString()}</strong> to <strong>{new Date(lv.endDate).toLocaleDateString()}</strong>
                      </td>
                      <td>{lv.leaveType}</td>
                      <td>{lv.reason}</td>
                      <td>
                        <span className={`status-pill ${lv.status.toLowerCase()}`}>
                          {lv.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                  {leaves.length === 0 && (
                    <tr>
                      <td colSpan="4" className="empty-row-txt">No leave requests logged yet.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* TAB content: Payslips & Salary */}
        {activeTab === "payroll" && profile && (
          <div className="ess-tab-content">
            <div className="ess-table-card">
              <h3>Processed Salary Slips</h3>
              <table>
                <thead>
                  <tr>
                    <th>Month</th>
                    <th>Basic Salary</th>
                    <th>Allowances</th>
                    <th>Deductions</th>
                    <th>Net Salary (Received)</th>
                    <th>Payment Status</th>
                  </tr>
                </thead>
                <tbody>
                  {payrolls.map(pay => (
                    <tr key={pay._id}>
                      <td><strong>{pay.month}</strong></td>
                      <td>₹{pay.basicSalary.toLocaleString()}</td>
                      <td>+ ₹{pay.allowances.toLocaleString()}</td>
                      <td>- ₹{pay.deductions.toLocaleString()}</td>
                      <td className="salary-highlight">₹{pay.netSalary.toLocaleString()}</td>
                      <td>
                        <span className={`status-pill ${pay.status.toLowerCase()}`}>
                          {pay.status === "Processed" ? "Paid" : "Pending"}
                        </span>
                      </td>
                    </tr>
                  ))}
                  {payrolls.length === 0 && (
                    <tr>
                      <td colSpan="6" className="empty-row-txt">No salary slips processed for this employee account yet.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}
        {/* TAB content: Assigned Tasks */}
        {activeTab === "tasks" && profile && (
          <div className="ess-tab-content">
            <div className="ess-table-card">
              <h3>My Assigned Project Tasks</h3>
              <table>
                <thead>
                  <tr>
                    <th>Project</th>
                    <th>Task Title</th>
                    <th>Due Date</th>
                    <th>Current Status</th>
                    <th style={{ width: "200px" }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {tasks.map(t => (
                    <tr key={t.projectId + "-" + t.title}>
                      <td><strong>{t.projectTitle}</strong></td>
                      <td>{t.title}</td>
                      <td>{t.dueDate ? new Date(t.dueDate).toLocaleDateString() : "No due date"}</td>
                      <td>
                        <span className={`status-pill badge-${t.status === "Completed" ? "green" : t.status === "In Progress" ? "blue" : "purple"}`} style={{ display: "inline-block", padding: "4px 10px", borderRadius: "12px", fontSize: "11px", fontWeight: "bold" }}>
                          {t.status}
                        </span>
                      </td>
                      <td>
                        <div style={{ display: "flex", gap: "8px" }}>
                          {t.status !== "In Progress" && t.status !== "Completed" && (
                            <button
                              onClick={() => handleUpdateTaskStatus(t.projectId, t.title, "In Progress")}
                              style={{ padding: "6px 12px", background: "#3b82f6", color: "#ffffff", border: "none", borderRadius: "6px", fontSize: "0.8rem", cursor: "pointer", fontWeight: 600 }}
                            >
                              Start
                            </button>
                          )}
                          {t.status !== "Completed" && (
                            <button
                              onClick={() => handleUpdateTaskStatus(t.projectId, t.title, "Completed")}
                              style={{ padding: "6px 12px", background: "#10b981", color: "#ffffff", border: "none", borderRadius: "6px", fontSize: "0.8rem", cursor: "pointer", fontWeight: 600 }}
                            >
                              Complete
                            </button>
                          )}
                          {t.status === "Completed" && (
                            <span style={{ fontSize: "0.85rem", color: "#10b981", fontWeight: 600 }}>✓ Done</span>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                  {tasks.length === 0 && (
                    <tr>
                      <td colSpan="5" className="empty-row-txt">No tasks assigned to your employee account.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default ESSPortal;
