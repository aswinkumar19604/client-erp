import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { FaArrowLeft, FaEdit, FaTrash } from "react-icons/fa";
import API from "../services/api";
import "./Accounting.css";

function Accounting() {
  const navigate = useNavigate();

  const [entries, setEntries] = useState([]);
  const [summary, setSummary] = useState({});
  const [editingId, setEditingId] = useState(null);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [formData, setFormData] = useState({
    type: "invoice",
    reference: "",
    party: "",
    amount: "",
    status: "Pending",
    date: "",
    notes: ""
  });

  const getEntries = async () => {
    try {
      const res = await API.get("/accounting");
      setEntries(res.data);
    } catch (error) {
      console.log(error);
    }
  };

  const getSummary = async () => {
    try {
      const res = await API.get("/accounting/summary");
      setSummary(res.data);
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    getEntries();
    getSummary();
  }, []);

  const handleChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  const resetForm = () => {
    setFormData({
      type: "invoice",
      reference: "",
      party: "",
      amount: "",
      status: "Pending",
      date: "",
      notes: ""
    });
    setEditingId(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      if (editingId) {
        await API.put(`/accounting/${editingId}`, formData);
      } else {
        await API.post("/accounting", formData);
      }

      resetForm();
      getEntries();
      getSummary();
    } catch (error) {
      alert(error.response?.data?.message || "Failed to save accounting entry");
    }
  };

  const handleEdit = (entry) => {
    setEditingId(entry._id);
    setFormData({
      type: entry.type,
      reference: entry.reference || "",
      party: entry.party,
      amount: entry.amount,
      status: entry.status,
      date: entry.date ? entry.date.slice(0, 10) : "",
      notes: entry.notes || ""
    });
  };

  const handleDelete = async (id) => {
    const confirmDelete = window.confirm("Delete this accounting entry?");
    if (!confirmDelete) return;

    try {
      await API.delete(`/accounting/${id}`);
      getEntries();
      getSummary();
    } catch (error) {
      console.log(error);
    }
  };

  const filteredEntries = entries.filter((entry) => {
    if (!startDate && !endDate) return true;

    const entryDate = new Date(entry.date).toISOString().slice(0, 10);
    const start = startDate || "0000-00-00";
    const end = endDate || "9999-99-99";

    return entryDate >= start && entryDate <= end;
  });

  return (
    <div className="accounting-container">
      <button className="back-btn" onClick={() => navigate("/dashboard")}>
        <FaArrowLeft />
      </button>

      <h1>Accounting Module</h1>
      <p className="section-subtitle">Track invoices, expenses, and payments in one place.</p>

      <div className="summary-grid">
        <div className="summary-card">
          <h3>Total Invoices</h3>
          <p>₹ {summary.totalInvoices || 0}</p>
        </div>
        <div className="summary-card">
          <h3>Total Expenses</h3>
          <p>₹ {summary.totalExpenses || 0}</p>
        </div>
        <div className="summary-card">
          <h3>Total Payments</h3>
          <p>₹ {summary.totalPayments || 0}</p>
        </div>
        <div className="summary-card">
          <h3>Net Balance</h3>
          <p>₹ {summary.netBalance || 0}</p>
        </div>
      </div>

      <form className="accounting-form" onSubmit={handleSubmit}>
        <select name="type" value={formData.type} onChange={handleChange} required>
          <option value="invoice">Invoice</option>
          <option value="expense">Expense</option>
          <option value="payment">Payment</option>
        </select>

        <input
          type="text"
          name="reference"
          placeholder="Reference"
          value={formData.reference}
          onChange={handleChange}
        />

        <input
          type="text"
          name="party"
          placeholder="Party / Customer / Vendor"
          value={formData.party}
          onChange={handleChange}
          required
        />

        <input
          type="number"
          name="amount"
          placeholder="Amount"
          value={formData.amount}
          onChange={handleChange}
          required
        />

        <select name="status" value={formData.status} onChange={handleChange}>
          <option value="Pending">Pending</option>
          <option value="Paid">Paid</option>
          <option value="Overdue">Overdue</option>
        </select>

        <input type="date" name="date" value={formData.date} onChange={handleChange} />

        <input type="text" name="notes" placeholder="Notes" value={formData.notes} onChange={handleChange} />

        <button type="submit">{editingId ? "Update Entry" : "Add Entry"}</button>
        {editingId ? <button type="button" className="secondary-btn" onClick={resetForm}>Cancel</button> : null}
      </form>

      <div className="filter-row">
        <label>
          Start date
          <input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} />
        </label>
        <label>
          End date
          <input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} />
        </label>
      </div>

      <table>
        <thead>
          <tr>
            <th>Type</th>
            <th>Reference</th>
            <th>Party</th>
            <th>Amount</th>
            <th>Status</th>
            <th>Date</th>
            <th>Notes</th>
            <th>Action</th>
          </tr>
        </thead>
        <tbody>
          {filteredEntries.map((entry) => (
            <tr key={entry._id}>
              <td>{entry.type}</td>
              <td>{entry.reference || "-"}</td>
              <td>{entry.party}</td>
              <td>₹ {entry.amount}</td>
              <td>{entry.status}</td>
              <td>{new Date(entry.date).toLocaleDateString()}</td>
              <td>{entry.notes || "-"}</td>
              <td>
                <button className="edit-btn" onClick={() => handleEdit(entry)}>
                  <FaEdit />
                </button>
                <button className="delete-btn" onClick={() => handleDelete(entry._id)}>
                  <FaTrash />
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default Accounting;
