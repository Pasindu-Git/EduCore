// src/Enrollment/Enrollment.jsx
import React, { useEffect, useState } from "react";
import axios from "axios";
import Header from "../Header"; // ✅ adjust path if needed
import "./Enrollment.css";

export default function Enrollment() {
  const [enrollments, setEnrollments] = useState([]);
  const [students, setStudents] = useState([]);
  const [classes, setClasses] = useState([]);
  const [formData, setFormData] = useState({ student: "", class: "" });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [enRes, sRes, cRes] = await Promise.all([
        axios.get("http://localhost:5000/api/enrollments"),
        axios.get("http://localhost:5000/api/users?role=Student"), // only students
        axios.get("http://localhost:5000/api/classes"),
      ]);
      setEnrollments(enRes.data.enrollments || []);
      setStudents(sRes.data.users || []);
      setClasses(cRes.data.classes || []);
    } catch (err) {
      console.error(err);
    }
  };

  const handleChange = (e) =>
    setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post("http://localhost:5000/api/enrollments", formData);
      fetchData();
      setFormData({ student: "", class: "" });
    } catch (err) {
      console.error(err);
    }
  };

  const handleStatusChange = async (id, status) => {
    try {
      await axios.put(`http://localhost:5000/api/enrollments/${id}`, { status });
      fetchData();
    } catch (err) {
      console.error(err);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm("Delete this enrollment?")) {
      try {
        await axios.delete(`http://localhost:5000/api/enrollments/${id}`);
        fetchData();
      } catch (err) {
        console.error(err);
      }
    }
  };

  // ===== Header helpers =====
  const handleLogout = () => {
    [
      "token",
      "email",
      "role",
      "userId",
      "firstName",
      "lastName",
      "avatar",
      "profilePic",
      "profile",
    ].forEach((k) => localStorage.removeItem(k));
    window.location.replace("/login");
  };

  const name = `${localStorage.getItem("firstName") || ""} ${localStorage.getItem("lastName") || ""}`.trim();
  const role = localStorage.getItem("role") || "";
  const email = localStorage.getItem("email") || "";
  const avatarUrl = localStorage.getItem("avatar") || "";

  return (
    <div className="enrollment-page">
      {/* ✅ Modern EDUCORE header */}
      <Header
        title="EDUCORE"
        name={name || email}
        role={role}
        email={email}
        avatarUrl={avatarUrl}
        onLogout={handleLogout}
        onBellClick={() => console.log("🔔 Notifications clicked")}
      />

      <h1>Enrollment Management</h1>

      <form className="enrollment-form" onSubmit={handleSubmit}>
        <select name="student" value={formData.student} onChange={handleChange} required>
          <option value="">Select Student</option>
          {students.map((s) => (
            <option key={s._id} value={s._id}>
              {s.firstName} {s.lastName}
            </option>
          ))}
        </select>

        <select name="class" value={formData.class} onChange={handleChange} required>
          <option value="">Select Class</option>
          {classes.map((c) => (
            <option key={c._id} value={c._id}>
              {c.name}
            </option>
          ))}
        </select>

        <button type="submit" className="submit-btn">Enroll</button>
      </form>

      <table className="enrollment-table">
        <thead>
          <tr>
            <th>Student</th>
            <th>Class</th>
            <th>Status</th>
            <th>Enrolled At</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {enrollments.map((e) => (
            <tr key={e._id}>
              <td>{e.student?.firstName} {e.student?.lastName}</td>
              <td>{e.class?.name}</td>
              <td>
                <select
                  value={e.status}
                  onChange={(ev) => handleStatusChange(e._id, ev.target.value)}
                >
                  <option value="enrolled">Enrolled</option>
                  <option value="completed">Completed</option>
                  <option value="dropped">Dropped</option>
                </select>
              </td>
              <td>{e.enrolledAt ? new Date(e.enrolledAt).toLocaleDateString() : "-"}</td>
              <td>
                <button className="action delete" onClick={() => handleDelete(e._id)}>🗑️</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
