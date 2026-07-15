import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { FaArrowLeft } from "react-icons/fa";
import API from "../services/api";
import "./HR.css";

function HR() {
  const navigate = useNavigate();
  const ITEMS_PER_PAGE = 5;

  const [summary, setSummary] = useState({});
  const [attendances, setAttendances] = useState([]);
  const [leaves, setLeaves] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [activeTab, setActiveTab] = useState("attendance");
  const [attendancePage, setAttendancePage] = useState(1);
  const [leavePage, setLeavePage] = useState(1);
  const [attendanceStartDate, setAttendanceStartDate] = useState("");
  const [attendanceEndDate, setAttendanceEndDate] = useState("");
  const [leaveStartDate, setLeaveStartDate] = useState("");
  const [leaveEndDate, setLeaveEndDate] = useState("");

  const [attendanceForm, setAttendanceForm] = useState({
    employeeId: "",
    date: "",
    status: "Present",
    notes: ""
  });

  const [leaveForm, setLeaveForm] = useState({
    employeeId: "",
    leaveType: "Casual",
    startDate: "",
    endDate: "",
    reason: "",
    status: "Pending"
  });

  const fetchData = async () => {
    try {
      const [summaryRes, attendanceRes, leaveRes, employeesRes] = await Promise.all([
        API.get("/hr/dashboard"),
        API.get("/hr/attendance"),
        API.get("/hr/leave"),
        API.get("/employees")
      ]);

      setSummary(summaryRes.data);
      setAttendances(attendanceRes.data);
      setLeaves(leaveRes.data);
      setEmployees(employeesRes.data);
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleAttendanceChange = (e) => {
    setAttendanceForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleLeaveChange = (e) => {
    setLeaveForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleAttendanceSubmit = async (e) => {
    e.preventDefault();
    try {
      await API.post("/hr/attendance", attendanceForm);
      setAttendanceForm({ employeeId: "", date: "", status: "Present", notes: "" });
      setAttendancePage(1);
      fetchData();
    } catch (error) {
      alert(error.response?.data?.message || "Unable to save attendance");
    }
  };

  const handleLeaveSubmit = async (e) => {
    e.preventDefault();
    try {
      await API.post("/hr/leave", leaveForm);
      setLeaveForm({ employeeId: "", leaveType: "Casual", startDate: "", endDate: "", reason: "", status: "Pending" });
      setLeavePage(1);
      fetchData();
    } catch (error) {
      alert(error.response?.data?.message || "Unable to save leave request");
    }
  };

  const getFilteredItems = (items, startValue, endValue, type) => {
    if (!startValue && !endValue) return items;

    return items.filter((item) => {
      if (type === "attendance") {
        const itemDate = new Date(item.date).toISOString().slice(0, 10);
        const start = startValue || "0000-00-00";
        const end = endValue || "9999-99-99";
        return itemDate >= start && itemDate <= end;
      }

      if (type === "leave") {
        const startDate = new Date(item.startDate).toISOString().slice(0, 10);
        const endDate = new Date(item.endDate).toISOString().slice(0, 10);
        const start = startValue || "0000-00-00";
        const end = endValue || "9999-99-99";
        return endDate >= start && startDate <= end;
      }

      return true;
    });
  };

  const filteredAttendances = getFilteredItems(attendances, attendanceStartDate, attendanceEndDate, "attendance");
  const filteredLeaves = getFilteredItems(leaves, leaveStartDate, leaveEndDate, "leave");

  const getPageItems = (items, currentPage) => {
    const start = (currentPage - 1) * ITEMS_PER_PAGE;
    return items.slice(start, start + ITEMS_PER_PAGE);
  };

  const attendanceItems = getPageItems(filteredAttendances, attendancePage);
  const leaveItems = getPageItems(filteredLeaves, leavePage);

  const attendancePages = Math.max(1, Math.ceil(filteredAttendances.length / ITEMS_PER_PAGE));
  const leavePages = Math.max(1, Math.ceil(filteredLeaves.length / ITEMS_PER_PAGE));

  const renderPagination = (currentPage, totalPages, setPage) => {
    if (totalPages <= 1) return null;

    return (
      <div className="pagination">
        <button type="button" onClick={() => setPage((prev) => Math.max(1, prev - 1))} disabled={currentPage === 1}>
          Previous
        </button>
        <span className="page-info">Page {currentPage} of {totalPages}</span>
        <button type="button" onClick={() => setPage((prev) => Math.min(totalPages, prev + 1))} disabled={currentPage === totalPages}>
          Next
        </button>
      </div>
    );
  };

  return (
    <div className="hr-container">
      <button className="back-btn" onClick={() => navigate("/dashboard")}>
        <FaArrowLeft />
      </button>

      <h1>HR Module</h1>
      <p className="section-subtitle">Track attendance and leave requests in one place.</p>

      <div className="summary-grid">
        <div className="summary-card">
          <h3>Total Employees</h3>
          <p>{summary.totalEmployees || 0}</p>
        </div>
        <div className="summary-card">
          <h3>Present Today</h3>
          <p>{summary.presentCount || 0}</p>
        </div>
        <div className="summary-card">
          <h3>Pending Leaves</h3>
          <p>{summary.leaveCount || 0}</p>
        </div>
      </div>

      <div className="hr-grid">
        <div className="tab-switcher">
          <button type="button" className={`tab-btn ${activeTab === "attendance" ? "active" : ""}`} onClick={() => setActiveTab("attendance")}>Attendance</button>
          <button type="button" className={`tab-btn ${activeTab === "leave" ? "active" : ""}`} onClick={() => setActiveTab("leave")}>Leave Request</button>
        </div>

        <div className="tab-content">
          {activeTab === "attendance" && (
            <section className="hr-panel">
              <h2>Attendance</h2>
              <form onSubmit={handleAttendanceSubmit} className="hr-form">
                <select name="employeeId" value={attendanceForm.employeeId} onChange={handleAttendanceChange} required>
                  <option value="">Select employee</option>
                  {employees.map((employee) => (
                    <option key={employee._id} value={employee.employeeId}>
                      {employee.name} ({employee.employeeId})
                    </option>
                  ))}
                </select>
                <input type="date" name="date" value={attendanceForm.date} onChange={handleAttendanceChange} required />
                <select name="status" value={attendanceForm.status} onChange={handleAttendanceChange}>
                  <option value="Present">Present</option>
                  <option value="Absent">Absent</option>
                  <option value="Leave">Leave</option>
                  <option value="Half Day">Half Day</option>
                </select>
                <input type="text" name="notes" placeholder="Notes" value={attendanceForm.notes} onChange={handleAttendanceChange} />
                <button type="submit">Save Attendance</button>
              </form>

              <div className="filter-row">
                <label>
                  Start date
                  <input type="date" value={attendanceStartDate} onChange={(e) => { setAttendanceStartDate(e.target.value); setAttendancePage(1); }} />
                </label>
                <label>
                  End date
                  <input type="date" value={attendanceEndDate} onChange={(e) => { setAttendanceEndDate(e.target.value); setAttendancePage(1); }} />
                </label>
              </div>

              <div className="table-wrapper">
                <table>
                  <thead>
                    <tr>
                      <th>Employee</th>
                      <th>Date</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {attendanceItems.length > 0 ? (
                      attendanceItems.map((item) => (
                        <tr key={item._id}>
                          <td>{item.employee?.name || item.employee}</td>
                          <td>{new Date(item.date).toLocaleDateString()}</td>
                          <td>{item.status}</td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan="3" className="empty-state">No attendance records yet.</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
              {renderPagination(attendancePage, attendancePages, setAttendancePage)}
            </section>
          )}

          {activeTab === "leave" && (
            <section className="hr-panel">
              <h2>Leave Requests</h2>
              <form onSubmit={handleLeaveSubmit} className="hr-form">
                <select name="employeeId" value={leaveForm.employeeId} onChange={handleLeaveChange} required>
                  <option value="">Select employee</option>
                  {employees.map((employee) => (
                    <option key={employee._id} value={employee.employeeId}>
                      {employee.name} ({employee.employeeId})
                    </option>
                  ))}
                </select>
                <select name="leaveType" value={leaveForm.leaveType} onChange={handleLeaveChange}>
                  <option value="Casual">Casual</option>
                  <option value="Sick">Sick</option>
                  <option value="Annual">Annual</option>
                  <option value="Other">Other</option>
                </select>
                <input type="date" name="startDate" value={leaveForm.startDate} onChange={handleLeaveChange} required />
                <input type="date" name="endDate" value={leaveForm.endDate} onChange={handleLeaveChange} required />
                <input type="text" name="reason" placeholder="Reason" value={leaveForm.reason} onChange={handleLeaveChange} />
                <select name="status" value={leaveForm.status} onChange={handleLeaveChange}>
                  <option value="Pending">Pending</option>
                  <option value="Approved">Approved</option>
                  <option value="Rejected">Rejected</option>
                </select>
                <button type="submit">Request Leave</button>
              </form>

              <div className="filter-row">
                <label>
                  Start date
                  <input type="date" value={leaveStartDate} onChange={(e) => { setLeaveStartDate(e.target.value); setLeavePage(1); }} />
                </label>
                <label>
                  End date
                  <input type="date" value={leaveEndDate} onChange={(e) => { setLeaveEndDate(e.target.value); setLeavePage(1); }} />
                </label>
              </div>

              <div className="table-wrapper">
                <table>
                  <thead>
                    <tr>
                      <th>Employee</th>
                      <th>Type</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {leaveItems.length > 0 ? (
                      leaveItems.map((item) => (
                        <tr key={item._id}>
                          <td>{item.employee?.name || item.employee}</td>
                          <td>{item.leaveType}</td>
                          <td>{item.status}</td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan="3" className="empty-state">No leave requests yet.</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
              {renderPagination(leavePage, leavePages, setLeavePage)}
            </section>
          )}

        </div>
      </div>
    </div>
  );
}

export default HR;
