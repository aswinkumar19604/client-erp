import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { FaArrowLeft, FaEdit, FaTrash } from "react-icons/fa";
import API from "../services/api";
import "./Expenses.css";

function Expenses() {
  const navigate = useNavigate();

  const [expenses, setExpenses] = useState([]);
  const [summary, setSummary] = useState({});
  const [editingId, setEditingId] = useState(null);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [formData, setFormData] = useState({
    title: "",
    category: "General",
    vendor: "",
    amount: "",
    paymentMethod: "Cash",
    status: "Pending",
    date: "",
    notes: ""
  });

  const getExpenses = async () => {
    try {
      const [expensesRes, summaryRes] = await Promise.all([
        API.get("/expenses"),
        API.get("/expenses/summary")
      ]);
      setExpenses(expensesRes.data);
      setSummary(summaryRes.data);
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    getExpenses();
  }, []);

  const handleChange = (e) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const resetForm = () => {
    setFormData({
      title: "",
      category: "General",
      vendor: "",
      amount: "",
      paymentMethod: "Cash",
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
        await API.put(`/expenses/${editingId}`, formData);
      } else {
        await API.post("/expenses", formData);
      }
      resetForm();
      getExpenses();
    } catch (error) {
      alert(error.response?.data?.message || "Unable to save expense");
    }
  };

  const handleEdit = (expense) => {
    setEditingId(expense._id);
    setFormData({
      title: expense.title,
      category: expense.category || "General",
      vendor: expense.vendor || "",
      amount: expense.amount,
      paymentMethod: expense.paymentMethod || "Cash",
      status: expense.status,
      date: expense.date ? expense.date.slice(0, 10) : "",
      notes: expense.notes || ""
    });
  };

  const handleDelete = async (id) => {
    const confirmDelete = window.confirm("Delete this expense?");
    if (!confirmDelete) return;
    try {
      await API.delete(`/expenses/${id}`);
      getExpenses();
    } catch (error) {
      console.log(error);
    }
  };

  const filteredExpenses = expenses.filter((expense) => {
    if (!startDate && !endDate) return true;
    const expenseDate = new Date(expense.date).toISOString().slice(0, 10);
    const start = startDate || "0000-00-00";
    const end = endDate || "9999-99-99";
    return expenseDate >= start && expenseDate <= end;
  });

  return (
    <div className="expenses-container">
      <button className="back-btn" onClick={() => navigate("/dashboard")}>
        <FaArrowLeft />
      </button>

      <h1>Expense Management</h1>
      <p className="section-subtitle">Track day-to-day operating expenses and approvals.</p>

      <div className="summary-grid">
        <div className="summary-card">
          <h3>Total Expenses</h3>
          <p>₹ {summary.totalExpenses || 0}</p>
        </div>
        <div className="summary-card">
          <h3>Pending</h3>
          <p>₹ {summary.pending || 0}</p>
        </div>
        <div className="summary-card">
          <h3>Approved</h3>
          <p>₹ {summary.approved || 0}</p>
        </div>
        <div className="summary-card">
          <h3>Paid</h3>
          <p>₹ {summary.paid || 0}</p>
        </div>
      </div>

      <form className="expenses-form" onSubmit={handleSubmit}>
        <input type="text" name="title" placeholder="Expense title" value={formData.title} onChange={handleChange} required />
        <input type="text" name="category" placeholder="Category" value={formData.category} onChange={handleChange} />
        <input type="text" name="vendor" placeholder="Vendor" value={formData.vendor} onChange={handleChange} />
        <input type="number" name="amount" placeholder="Amount" value={formData.amount} onChange={handleChange} required />
        <select name="paymentMethod" value={formData.paymentMethod} onChange={handleChange}>
          <option value="Cash">Cash</option>
          <option value="Card">Card</option>
          <option value="UPI">UPI</option>
          <option value="Bank Transfer">Bank Transfer</option>
        </select>
        <select name="status" value={formData.status} onChange={handleChange}>
          <option value="Pending">Pending</option>
          <option value="Approved">Approved</option>
          <option value="Paid">Paid</option>
        </select>
        <input type="date" name="date" value={formData.date} onChange={handleChange} />
        <textarea name="notes" placeholder="Notes" value={formData.notes} onChange={handleChange} rows="3" />
        <button type="submit">{editingId ? "Update Expense" : "Add Expense"}</button>
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
            <th>Title</th>
            <th>Category</th>
            <th>Vendor</th>
            <th>Amount</th>
            <th>Status</th>
            <th>Date</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {filteredExpenses.map((expense) => (
            <tr key={expense._id}>
              <td>{expense.title}</td>
              <td>{expense.category || "-"}</td>
              <td>{expense.vendor || "-"}</td>
              <td>₹ {expense.amount}</td>
              <td>{expense.status}</td>
              <td>{new Date(expense.date).toLocaleDateString()}</td>
              <td>
                <button className="edit-btn" onClick={() => handleEdit(expense)}><FaEdit /></button>
                <button className="delete-btn" onClick={() => handleDelete(expense._id)}><FaTrash /></button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default Expenses;
