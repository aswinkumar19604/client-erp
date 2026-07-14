import { useState } from "react";
import API from "../services/api";
import { Link, useNavigate } from "react-router-dom";
import "./Auth.css";

function Login() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    email: "",
    password: ""
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
      const response = await API.post(
        "/auth/login",
        formData
      );

      // =========================
      // STORE TOKEN
      // =========================
      localStorage.setItem(
        "token",
        response.data.token
      );

      // =========================
      // STORE USER INFO (NEW)
      // =========================
      localStorage.setItem(
        "user",
        JSON.stringify(response.data.user)
      );

      // =========================
      // STORE ROLE (IMPORTANT)
      // =========================
      localStorage.setItem(
        "role",
        response.data.user.role
      );

      alert("Login Successful");

      // =========================
      // ROLE BASED NAVIGATION
      // =========================
      if (response.data.user.role === "admin") {
        navigate("/dashboard");
      } else {
        navigate("/dashboard");
      }

    } catch (error) {
      alert(error.response.data.message);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-box">

        <h1>ERP Login</h1>

        <form onSubmit={handleSubmit}>

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

          <div className="forgot-link">
            <Link to="/forgot-password">
              Forgot Password?
            </Link>
          </div>

          <button type="submit">
            Login
          </button>

        </form>

        <p>
          Don't have an account?
          <Link to="/register">
            Register
          </Link>
        </p>

      </div>
    </div>
  );
}

export default Login;