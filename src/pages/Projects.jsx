import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { FaArrowLeft, FaEdit, FaTrash } from "react-icons/fa";
import API from "../services/api";
import "./Projects.css";

function Projects() {
  const navigate = useNavigate();

  const [projects, setProjects] = useState([]);
  const [summary, setSummary] = useState({});
  const [editingId, setEditingId] = useState(null);
  const [employees, setEmployees] = useState([]);
  
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    client: "",
    manager: "",
    status: "Planning",
    priority: "Medium",
    startDate: "",
    endDate: "",
    assignee: "" // Store the assigned employee email directly here
  });

  const getProjects = async () => {
    try {
      const [projectsRes, summaryRes, employeesRes] = await Promise.all([
        API.get("/projects"),
        API.get("/projects/summary"),
        API.get("/employees")
      ]);
      setProjects(projectsRes.data);
      setSummary(summaryRes.data);
      setEmployees(employeesRes.data);
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    getProjects();
  }, []);

  const handleChange = (e) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const resetForm = () => {
    setFormData({
      title: "",
      description: "",
      client: "",
      manager: "",
      status: "Planning",
      priority: "Medium",
      startDate: "",
      endDate: "",
      assignee: ""
    });
    setEditingId(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      // Build the tasks array containing one default task assigned to the selected employee
      const finalTasks = formData.assignee ? [{
        title: `Deliverable task for ${formData.title}`,
        assignee: formData.assignee.trim().toLowerCase(),
        dueDate: formData.endDate || null,
        status: "Pending"
      }] : [];

      const payload = {
        title: formData.title,
        description: formData.description,
        client: formData.client,
        manager: formData.manager,
        status: formData.status,
        priority: formData.priority,
        startDate: formData.startDate || null,
        endDate: formData.endDate || null,
        tasks: finalTasks
      };

      if (editingId) {
        await API.put(`/projects/${editingId}`, payload);
      } else {
        await API.post("/projects", payload);
      }
      
      resetForm();
      getProjects();
      alert("Project saved successfully!");
    } catch (error) {
      alert(error.response?.data?.message || "Unable to save project");
    }
  };

  const handleEdit = (project) => {
    setEditingId(project._id);
    // Find the assignee from the first task if it exists
    const assigneeEmail = project.tasks && project.tasks.length > 0 ? project.tasks[0].assignee : "";
    
    setFormData({
      title: project.title,
      description: project.description || "",
      client: project.client || "",
      manager: project.manager || "",
      status: project.status,
      priority: project.priority,
      startDate: project.startDate ? project.startDate.slice(0, 10) : "",
      endDate: project.endDate ? project.endDate.slice(0, 10) : "",
      assignee: assigneeEmail
    });
  };

  const handleDelete = async (id) => {
    const confirmDelete = window.confirm("Delete this project?");
    if (!confirmDelete) return;

    try {
      await API.delete(`/projects/${id}`);
      getProjects();
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <div className="projects-container">
      <button className="back-btn" onClick={() => navigate("/dashboard")}>
        <FaArrowLeft />
      </button>

      <h1>Project Management</h1>
      <p className="section-subtitle">Plan projects, assign team leads, and track status parameters.</p>

      <div className="summary-grid">
        <div className="summary-card">
          <h3>Total Projects</h3>
          <p>{summary.totalProjects || 0}</p>
        </div>
        <div className="summary-card">
          <h3>In Progress</h3>
          <p>{summary.progress || 0}</p>
        </div>
        <div className="summary-card">
          <h3>Completed</h3>
          <p>{summary.completed || 0}</p>
        </div>
        <div className="summary-card">
          <h3>On Hold</h3>
          <p>{summary.onHold || 0}</p>
        </div>
      </div>

      <form className="projects-form" onSubmit={handleSubmit}>
        <input type="text" name="title" placeholder="Project title" value={formData.title} onChange={handleChange} required />
        <input type="text" name="client" placeholder="Client" value={formData.client} onChange={handleChange} />
        <input type="text" name="manager" placeholder="Manager" value={formData.manager} onChange={handleChange} />
        

        <select name="priority" value={formData.priority} onChange={handleChange}>
          <option value="Low">Low</option>
          <option value="Medium">Medium</option>
          <option value="High">High</option>
        </select>

        {/* Dynamic Assignee Dropdown */}
        <select name="assignee" value={formData.assignee} onChange={handleChange} required>
          <option value="">Select Assignee Employee</option>
          {employees.map(emp => (
            <option key={emp._id} value={emp.email}>
              {emp.name} ({emp.email})
            </option>
          ))}
        </select>

        <input type="date" name="startDate" value={formData.startDate} onChange={handleChange} />
        <input type="date" name="endDate" value={formData.endDate} onChange={handleChange} />
        
        <textarea name="description" placeholder="Project description" value={formData.description} onChange={handleChange} rows="3" />
        
        <button type="submit">{editingId ? "Update Project" : "Add Project"}</button>
        {editingId ? <button type="button" className="secondary-btn" onClick={resetForm}>Cancel</button> : null}
      </form>

      <table>
        <thead>
          <tr>
            <th>Title</th>
            <th>Client</th>
            <th>Manager</th>
            <th>Assignee</th>
            <th>Status</th>
            <th>Priority</th>
            <th>Start</th>
            <th>End</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {projects.map((project) => {
            const assigneeEmail = project.tasks && project.tasks.length > 0 ? project.tasks[0].assignee : "Unassigned";
            return (
              <tr key={project._id}>
                <td>{project.title}</td>
                <td>{project.client || "-"}</td>
                <td>{project.manager || "-"}</td>
                <td><strong>{assigneeEmail}</strong></td>
                <td>{project.status}</td>
                <td>{project.priority}</td>
                <td>{project.startDate ? new Date(project.startDate).toLocaleDateString() : "-"}</td>
                <td>{project.endDate ? new Date(project.endDate).toLocaleDateString() : "-"}</td>
                <td>
                  <button className="edit-btn" onClick={() => handleEdit(project)}><FaEdit /></button>
                  <button className="delete-btn" onClick={() => handleDelete(project._id)}><FaTrash /></button>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

export default Projects;
