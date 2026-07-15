import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { FaArrowLeft, FaEdit, FaTrash } from "react-icons/fa";
import API from "../services/api";
import "./Leads.css";

function Leads() {
  const navigate = useNavigate();

  const [leads, setLeads] = useState([]);
  const [summary, setSummary] = useState({});
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    company: "",
    source: "Other",
    status: "New",
    value: "",
    nextFollowUp: "",
    notes: ""
  });

  const getLeads = async () => {
    try {
      const [leadsRes, summaryRes] = await Promise.all([
        API.get("/leads"),
        API.get("/leads/summary")
      ]);
      setLeads(leadsRes.data);
      setSummary(summaryRes.data);
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    getLeads();
  }, []);

  const handleChange = (e) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const resetForm = () => {
    setFormData({
      name: "",
      email: "",
      phone: "",
      company: "",
      source: "Other",
      status: "New",
      value: "",
      nextFollowUp: "",
      notes: ""
    });
    setEditingId(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingId) {
        await API.put(`/leads/${editingId}`, formData);
      } else {
        await API.post("/leads", formData);
      }
      resetForm();
      getLeads();
    } catch (error) {
      alert(error.response?.data?.message || "Unable to save lead");
    }
  };

  const handleEdit = (lead) => {
    setEditingId(lead._id);
    setFormData({
      name: lead.name,
      email: lead.email || "",
      phone: lead.phone || "",
      company: lead.company || "",
      source: lead.source,
      status: lead.status,
      value: lead.value || "",
      nextFollowUp: lead.nextFollowUp ? lead.nextFollowUp.slice(0, 10) : "",
      notes: lead.notes || ""
    });
  };

  const handleDelete = async (id) => {
    const confirmDelete = window.confirm("Delete this lead?");
    if (!confirmDelete) return;

    try {
      await API.delete(`/leads/${id}`);
      getLeads();
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <div className="leads-container">
      <button className="back-btn" onClick={() => navigate("/dashboard")}>
        <FaArrowLeft />
      </button>

      <h1>CRM Leads</h1>
      <p className="section-subtitle">Track leads, follow-ups, and sales opportunities.</p>

      <div className="summary-grid">
        <div className="summary-card">
          <h3>Total Leads</h3>
          <p>{summary.totalLeads || 0}</p>
        </div>
        <div className="summary-card">
          <h3>New Leads</h3>
          <p>{summary.newLeads || 0}</p>
        </div>
        <div className="summary-card">
          <h3>Won</h3>
          <p>{summary.wonLeads || 0}</p>
        </div>
        <div className="summary-card">
          <h3>Lost</h3>
          <p>{summary.lostLeads || 0}</p>
        </div>
      </div>

      <form className="leads-form" onSubmit={handleSubmit}>
        <input type="text" name="name" placeholder="Lead name" value={formData.name} onChange={handleChange} required />
        <input type="email" name="email" placeholder="Email" value={formData.email} onChange={handleChange} />
        <input type="text" name="phone" placeholder="Phone" value={formData.phone} onChange={handleChange} />
        <input type="text" name="company" placeholder="Company" value={formData.company} onChange={handleChange} />
        <select name="source" value={formData.source} onChange={handleChange}>
          <option value="Website">Website</option>
          <option value="Referral">Referral</option>
          <option value="Social">Social</option>
          <option value="Sales Call">Sales Call</option>
          <option value="Other">Other</option>
        </select>
        <select name="status" value={formData.status} onChange={handleChange}>
          <option value="New">New</option>
          <option value="Contacted">Contacted</option>
          <option value="Qualified">Qualified</option>
          <option value="Proposal">Proposal</option>
          <option value="Won">Won</option>
          <option value="Lost">Lost</option>
        </select>
        <input type="number" name="value" placeholder="Estimated value" value={formData.value} onChange={handleChange} />
        <input type="date" name="nextFollowUp" value={formData.nextFollowUp} onChange={handleChange} />
        <textarea name="notes" placeholder="Notes" value={formData.notes} onChange={handleChange} rows="3" />
        <button type="submit">{editingId ? "Update Lead" : "Add Lead"}</button>
        {editingId ? <button type="button" className="secondary-btn" onClick={resetForm}>Cancel</button> : null}
      </form>

      <table>
        <thead>
          <tr>
            <th>Name</th>
            <th>Company</th>
            <th>Phone</th>
            <th>Status</th>
            <th>Value</th>
            <th>Next Follow-up</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {leads.map((lead) => (
            <tr key={lead._id}>
              <td>{lead.name}</td>
              <td>{lead.company || "-"}</td>
              <td>{lead.phone || "-"}</td>
              <td>{lead.status}</td>
              <td>₹ {lead.value || 0}</td>
              <td>{lead.nextFollowUp ? new Date(lead.nextFollowUp).toLocaleDateString() : "-"}</td>
              <td>
                <button className="edit-btn" onClick={() => handleEdit(lead)}><FaEdit /></button>
                <button className="delete-btn" onClick={() => handleDelete(lead._id)}><FaTrash /></button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default Leads;
