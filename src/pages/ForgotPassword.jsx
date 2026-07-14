import { useState } from "react";

import { Link } from "react-router-dom";

import API from "../services/api";

import "./ForgotReset.css";

function ForgotPassword() {

  const [email, setEmail] =
    useState("");

  const handleSubmit = async (e) => {

    e.preventDefault();

    try {

      const response =
        await API.post(
          "/auth/forgot-password",
          { email }
        );

      alert(response.data.message);

    } catch (error) {

      alert(error.response.data.message);
    }
  };

  return (
    <div className="forgot-container">

      <div className="forgot-box">

        <h1>Forgot Password</h1>

        <p>
          Enter your email to receive
          reset link
        </p>

        <form onSubmit={handleSubmit}>

          <div className="forgot-input-group">

            <label>Email</label>

            <input
              type="email"
              placeholder="Enter Email"
              value={email}
              onChange={(e) =>
                setEmail(e.target.value)
              }
            />

          </div>

          <button
            type="submit"
            className="forgot-btn"
          >
            Send Reset Link
          </button>

        </form>

        <div className="back-login">

          <Link to="/">
            Back To Login
          </Link>

        </div>

      </div>

    </div>
  );
}

export default ForgotPassword;