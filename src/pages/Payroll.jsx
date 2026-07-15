import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { FaArrowLeft } from "react-icons/fa";
import jsPDF from "jspdf";
import API from "../services/api";
import "./Payroll.css";

function Payroll() {
  const navigate = useNavigate();

  const [payrolls, setPayrolls] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [summary, setSummary] = useState({});
  const [startMonth, setStartMonth] = useState("");
  const [endMonth, setEndMonth] = useState("");
  const [formData, setFormData] = useState({
    employeeId: "",
    month: "",
    basicSalary: "",
    allowances: "",
    deductions: "",
    netSalary: "",
    status: "Pending"
  });

  const fetchData = async () => {
    try {
      const [payrollRes, employeesRes, dashboardRes] = await Promise.all([
        API.get("/hr/payroll"),
        API.get("/employees"),
        API.get("/hr/dashboard")
      ]);

      const records = payrollRes.data || [];
      const totalNet = records.reduce((sum, item) => sum + Number(item.netSalary || 0), 0);
      const pending = records.filter((item) => item.status === "Pending").length;
      const processed = records.filter((item) => item.status === "Processed").length;

      setPayrolls(records);
      setEmployees(employeesRes.data || []);
      setSummary({
        totalEmployees: dashboardRes.data?.totalEmployees || 0,
        totalRecords: records.length,
        totalNet,
        pending,
        processed
      });
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleChange = (e) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await API.post("/hr/payroll", formData);
      setFormData({
        employeeId: "",
        month: "",
        basicSalary: "",
        allowances: "",
        deductions: "",
        netSalary: "",
        status: "Pending"
      });
      fetchData();
    } catch (error) {
      alert(error.response?.data?.message || "Unable to save payroll entry");
    }
  };

  const filteredPayrolls = payrolls.filter((item) => {
    if (!startMonth && !endMonth) return true;
    const monthValue = item.month || "";
    const start = startMonth || "0000-00";
    const end = endMonth || "9999-99";
    return monthValue >= start && monthValue <= end;
  });

  const handleDownloadPdf = () => {
    const doc = new jsPDF();
    doc.setFontSize(16);
    doc.text("Payroll Report", 14, 16);
    doc.setFontSize(10);
    doc.text(`Generated: ${new Date().toLocaleDateString()}`, 14, 24);

    if (filteredPayrolls.length === 0) {
      doc.text("No payroll records available for the selected range.", 14, 36);
      doc.save("payroll-report.pdf");
      return;
    }

    let y = 36;
    doc.setFontSize(10);
    doc.text("Employee", 14, y);
    doc.text("Month", 54, y);
    doc.text("Net Salary", 90, y);
    doc.text("Status", 140, y);
    y += 6;

    filteredPayrolls.forEach((item) => {
      const name = item.employee?.name || item.employee || "-";
      doc.text(name, 14, y);
      doc.text(item.month || "-", 54, y);
      doc.text(`₹ ${item.netSalary || 0}`, 90, y);
      doc.text(item.status || "-", 140, y);
      y += 6;
    });

    doc.save("payroll-report.pdf");
  };

  return (
    <div className="payroll-container">
      <button className="back-btn" onClick={() => navigate("/dashboard")}>
        <FaArrowLeft />
      </button>

      <h1>Payroll Module</h1>
      <p className="section-subtitle">Manage salaries, deductions, and monthly payroll records.</p>

      <div className="summary-grid">
        <div className="summary-card">
          <h3>Total Employees</h3>
          <p>{summary.totalEmployees || 0}</p>
        </div>
        <div className="summary-card">
          <h3>Payroll Records</h3>
          <p>{summary.totalRecords || 0}</p>
        </div>
        <div className="summary-card">
          <h3>Total Net Pay</h3>
          <p>₹ {summary.totalNet || 0}</p>
        </div>
        <div className="summary-card">
          <h3>Pending / Processed</h3>
          <p>{summary.pending || 0} / {summary.processed || 0}</p>
        </div>
      </div>

      <form className="payroll-form" onSubmit={handleSubmit}>
        <select name="employeeId" value={formData.employeeId} onChange={handleChange} required>
          <option value="">Select employee</option>
          {employees.map((employee) => (
            <option key={employee._id} value={employee.employeeId}>
              {employee.name} ({employee.employeeId})
            </option>
          ))}
        </select>

        <input type="text" name="month" placeholder="Month (e.g. 2026-07)" value={formData.month} onChange={handleChange} required />
        <input type="number" name="basicSalary" placeholder="Basic Salary" value={formData.basicSalary} onChange={handleChange} required />
        <input type="number" name="allowances" placeholder="Allowances" value={formData.allowances} onChange={handleChange} />
        <input type="number" name="deductions" placeholder="Deductions" value={formData.deductions} onChange={handleChange} />
        <input type="number" name="netSalary" placeholder="Net Salary" value={formData.netSalary} onChange={handleChange} required />

        <select name="status" value={formData.status} onChange={handleChange}>
          <option value="Pending">Pending</option>
          <option value="Processed">Processed</option>
        </select>

        <button type="submit">Add Payroll</button>
      </form>

      <div className="toolbar-row">
        <div className="filter-row">
          <label>
            Start month
            <input type="date" value={startMonth} onChange={(e) => setStartMonth(e.target.value)} />
          </label>
          <label>
            End month
            <input type="date" value={endMonth} onChange={(e) => setEndMonth(e.target.value)} />
          </label>
        </div>
        <button type="button" className="pdf-btn" onClick={handleDownloadPdf}>Export PDF</button>
      </div>

      <table>
        <thead>
          <tr>
            <th>Employee</th>
            <th>Month</th>
            <th>Basic</th>
            <th>Allowances</th>
            <th>Deductions</th>
            <th>Net Salary</th>
            <th>Status</th>
          </tr>
        </thead>
        <tbody>
          {filteredPayrolls.map((item) => (
            <tr key={item._id}>
              <td>{item.employee?.name || item.employee}</td>
              <td>{item.month}</td>
              <td>₹ {item.basicSalary}</td>
              <td>₹ {item.allowances || 0}</td>
              <td>₹ {item.deductions || 0}</td>
              <td>₹ {item.netSalary}</td>
              <td>{item.status}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default Payroll;
