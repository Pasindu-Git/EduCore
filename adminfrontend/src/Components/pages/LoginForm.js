import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const API = "http://localhost:5000/api";

export default function LoginForm() {
  const [form, setForm] = useState({ email: "", password: "" });
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { data } = await axios.post(`${API}/auth/login`, form);

      // Expecting: { token, user: { _id, firstName, lastName, email, role, avatarUrl, ... } }
      const token = data?.token || "";
      const user = data?.user || {};

      // Derive a role string no matter how backend sends it (string or populated obj)
      const roleName = (user?.role?.name || user?.role || data?.role || "").toString();

      // Persist for header/other pages
      localStorage.setItem("token", token);
      localStorage.setItem("userId", user?._id || "");
      localStorage.setItem("email", user?.email || form.email || "");
      localStorage.setItem("role", roleName);
      localStorage.setItem("firstName", user?.firstName || "");
      localStorage.setItem("lastName", user?.lastName || "");
      localStorage.setItem("avatar", user?.avatarUrl || "");

      // Route by role
      switch (roleName.toLowerCase()) {
        case "admin":
          navigate("/dashboard");
          break;
        case "teacher":
          navigate("/classmanagement");
          break;
        case "class coordinator":
          navigate("/enrollment");
          break;
        case "it supporter":
          navigate("/settings");
          break;
        default:
          navigate("/feedback");
      }
    } catch (err) {
      const msg = err?.response?.data?.message || "Login failed";
      alert(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-form">
      <h2>Login</h2>
      <form onSubmit={handleSubmit}>
        <input
          type="email"
          name="email"
          placeholder="Email"
          value={form.email}
          onChange={(e) => setForm({ ...form, email: e.target.value })}
          required
        />
        <input
          type="password"
          name="password"
          placeholder="Password"
          value={form.password}
          onChange={(e) => setForm({ ...form, password: e.target.value })}
          required
        />
        <button type="submit" disabled={loading}>
          {loading ? "Logging in..." : "Login"}
        </button>
      </form>
    </div>
  );
}
