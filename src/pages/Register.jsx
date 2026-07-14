import { useState } from "react";
import API from "../services/api";
import { Link, useNavigate } from "react-router-dom";
import "./Auth.css";

function Register() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    role: "user"   // ✅ DEFAULT ROLE
  });

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      await API.post("/auth/register", formData);

      alert("Register Successful");

      navigate("/");

    } catch (error) {
      alert(error.response.data.message);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-box">
        <h1>ERP Register</h1>

        <form onSubmit={handleSubmit}>

          {/* NAME */}
          <div className="input-group">
            <label>Name</label>
            <input
              type="text"
              name="name"
              placeholder="Enter Name"
              onChange={handleChange}
              required
            />
          </div>

          {/* EMAIL */}
          <div className="input-group">
            <label>Email</label>
            <input
              type="email"
              name="email"
              placeholder="Enter Email"
              onChange={handleChange}
              required
            />
          </div>

          {/* PASSWORD */}
          <div className="input-group">
            <label>Password</label>
            <input
              type="password"
              name="password"
              placeholder="Enter Password"
              onChange={handleChange}
              required
            />
          </div>

          {/* ROLE DROPDOWN (NEW) */}
          <div className="input-group">
            <label>Role</label>

            <select
              name="role"
              value={formData.role}
              onChange={handleChange}
            >
              <option value="user">User</option>
              <option value="admin">Admin</option>
            </select>
          </div>

          <button type="submit">
            Register
          </button>
        </form>

        <p>
          Already have an account?
          <Link to="/">Login</Link>
        </p>

      </div>
    </div>
  );
}

export default Register;