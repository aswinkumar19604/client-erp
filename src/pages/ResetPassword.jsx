import { useState } from "react";

import {
  useParams,
  Link,
  useNavigate
} from "react-router-dom";

import API from "../services/api";

import "./ForgotReset.css";

function ResetPassword() {

  const { token } = useParams();

  const navigate = useNavigate();

  const [password, setPassword] =
    useState("");

  const handleSubmit = async (e) => {

    e.preventDefault();

    try {

      const response =
        await API.post(
          `/auth/reset-password/${token}`,
          { password }
        );

      alert(response.data.message);

      navigate("/");

    } catch (error) {

      alert(error.response.data.message);
    }
  };

  return (
    <div className="forgot-container">

      <div className="forgot-box">

        <h1>Reset Password</h1>

        <p>
          Enter your new password
        </p>

        <form onSubmit={handleSubmit}>

          <div className="forgot-input-group">

            <label>New Password</label>

            <input
              type="password"
              placeholder="Enter New Password"
              value={password}
              onChange={(e) =>
                setPassword(e.target.value)
              }
            />

          </div>

          <button
            type="submit"
            className="forgot-btn"
          >
            Reset Password
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

export default ResetPassword;