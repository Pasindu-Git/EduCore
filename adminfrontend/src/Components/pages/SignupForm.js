import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import "./SignupForm.css";

const API = "http://localhost:5000/api";

export default function SignupForm() {
  const [studentRoleId, setStudentRoleId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    password: "",
  });
  const navigate = useNavigate();

  // Fetch Student role id
  useEffect(() => {
    axios.get(`${API}/roles`)
      .then(res => {
        const list = res.data.roles || res.data;
        const studentRole = Array.isArray(list) ? list.find(r => r.name === "Student") : null;
        if (studentRole?._id) setStudentRoleId(studentRole._id);
      })
      .catch(err => console.error("Error fetching roles:", err));
  }, []);

  const handleChange = e => {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  // Save user profile to localStorage (so header can read it)
  const persistProfile = (token, user) => {
    const roleName = (user?.role?.name || user?.role || "").toString();
    localStorage.setItem("token", token || "");
    localStorage.setItem("userId", user?._id || "");
    localStorage.setItem("email", user?.email || form.email || "");
    localStorage.setItem("role", roleName || "Student");
    localStorage.setItem("firstName", user?.firstName || "");
    localStorage.setItem("lastName", user?.lastName || "");
    localStorage.setItem("avatar", user?.avatarUrl || "");
    return roleName || "Student";
  };

  const routeByRole = (roleName) => {
    switch ((roleName || "").toLowerCase()) {
      case "admin":
        navigate("/dashboard"); break;
      case "teacher":
        navigate("/classmanagement"); break;
      case "class coordinator":
        navigate("/enrollment"); break;
      case "it supporter":
        navigate("/settings"); break;
      default:
        navigate("/feedback");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!studentRoleId) {
      alert("Student role not found. Please contact admin.");
      return;
    }

    setLoading(true);
    try {
      const payload = { ...form, role: studentRoleId };
      const reg = await axios.post(`${API}/auth/register`, payload);

      // Some backends return { token, user } on register.
      // If not, we’ll do a login call right after.
      let token = reg?.data?.token;
      let user  = reg?.data?.user;

      if (!token || !user) {
        const login = await axios.post(`${API}/auth/login`, {
          email: form.email,
          password: form.password,
        });
        token = login?.data?.token;
        user  = login?.data?.user;
      }

      const roleName = persistProfile(token, user);
      routeByRole(roleName);
    } catch (err) {
      alert(err?.response?.data?.message || "Error occurred");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-form">
      <h2>Student Sign Up</h2>
      <form onSubmit={handleSubmit}>
        <input name="firstName" placeholder="First Name" onChange={handleChange} required />
        <input name="lastName"  placeholder="Last Name" onChange={handleChange} required />
        <input type="email" name="email" placeholder="Email" onChange={handleChange} required />
        <input name="phone" placeholder="Phone" onChange={handleChange} />
        <input type="password" name="password" placeholder="Password" onChange={handleChange} required />

        <button type="submit" disabled={loading}>
          {loading ? "Registering..." : "Register"}
        </button>

        <p className="signin-link">
          Already have an account?{" "}
          <span onClick={() => navigate("/login")}>Sign In</span>
        </p>
      </form>
    </div>
  );
}
