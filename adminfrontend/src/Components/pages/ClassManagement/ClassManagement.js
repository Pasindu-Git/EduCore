// src/ClassManagement/ClassManagement.jsx
import React, { useEffect, useState } from "react";
import axios from "axios";
import Header from "../Header"; // ✅ make sure path is correct
import "./ClassManagement.css";

export default function ClassManagement() {
  const [classes, setClasses] = useState([]);
  const [instructors, setInstructors] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [editingClass, setEditingClass] = useState(null);
  const [formData, setFormData] = useState({
    code: "",
    name: "",
    description: "",
    instructors: [],
  });

  // ✅ Load class and teacher data
  useEffect(() => {
    fetchClasses();
    fetchInstructors();
  }, []);

  const fetchClasses = async () => {
    try {
      const res = await axios.get("http://localhost:5000/api/classes");
      setClasses(res.data.classes || []);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchInstructors = async () => {
    try {
      const res = await axios.get("http://localhost:5000/api/users?role=Teacher");
      setInstructors(res.data.users || []);
    } catch (err) {
      console.error(err);
    }
  };

  // ✅ Handlers
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleInstructorChange = (e) => {
    const selectedOptions = Array.from(e.target.selectedOptions, (option) => option.value);
    setFormData({ ...formData, instructors: selectedOptions });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingClass) {
        await axios.put(`http://localhost:5000/api/classes/${editingClass._id}`, formData);
      } else {
        await axios.post("http://localhost:5000/api/classes", formData);
      }
      fetchClasses();
      resetForm();
    } catch (err) {
      console.error(err);
    }
  };

  const handleEdit = (cls) => {
    setEditingClass(cls);
    setFormData({
      code: cls.code,
      name: cls.name,
      description: cls.description || "",
      instructors: cls.instructors?.map((i) => i._id) || [],
    });
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm("Delete this class?")) {
      try {
        await axios.delete(`http://localhost:5000/api/classes/${id}`);
        fetchClasses();
      } catch (err) {
        console.error(err);
      }
    }
  };

  const resetForm = () => {
    setFormData({ code: "", name: "", description: "", instructors: [] });
    setEditingClass(null);
    setShowForm(false);
  };

  // ✅ Logout handler for header
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
    ].forEach((key) => localStorage.removeItem(key));
    window.location.replace("/login");
  };

  return (
    <div className="class-management-page">
      {/* ✅ Reusable Modern Header */}
      <Header
        title="EDUCORE"
        onLogout={handleLogout}
        onBellClick={() => console.log("🔔 Notifications clicked")}
        name={`${localStorage.getItem("firstName") || ""} ${
          localStorage.getItem("lastName") || ""
        }`}
        role={localStorage.getItem("role") || ""}
        email={localStorage.getItem("email") || ""}
        avatarUrl={localStorage.getItem("avatar") || ""}
      />

      <div className="class-management">
        <div className="top-bar">
          <h1>Class Management</h1>
          <button onClick={() => setShowForm(true)} className="add-btn">
            + Add Class
          </button>
        </div>

        {showForm && (
          <div className="modal">
            <form className="class-form" onSubmit={handleSubmit}>
              <h2>{editingClass ? "Edit Class" : "Add Class"}</h2>

              <div className="form-group">
                <label>Class Code</label>
                <input
                  type="text"
                  name="code"
                  value={formData.code}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="form-group">
                <label>Class Name</label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="form-group">
                <label>Description</label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                />
              </div>

              <div className="form-group">
                <label>Teachers</label>
                <select
                  multiple
                  value={formData.instructors}
                  onChange={handleInstructorChange}
                >
                  {instructors.map((inst) => (
                    <option key={inst._id} value={inst._id}>
                      {inst.firstName} {inst.lastName}
                    </option>
                  ))}
                </select>
                <small>Hold CTRL (Windows) or CMD (Mac) to select multiple</small>
              </div>

              <div className="form-buttons">
                <button type="submit" className="submit-btn">
                  Save
                </button>
                <button type="button" className="cancel-btn" onClick={resetForm}>
                  Cancel
                </button>
              </div>
            </form>
          </div>
        )}

        <table className="class-table">
          <thead>
            <tr>
              <th>Code</th>
              <th>Name</th>
              <th>Description</th>
              <th>Teachers</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {classes.map((cls) => (
              <tr key={cls._id}>
                <td>{cls.code}</td>
                <td>{cls.name}</td>
                <td>{cls.description}</td>
                <td>
                  {cls.instructors?.map((i) => (
                    <span key={i._id} className="tag">
                      {i.firstName} {i.lastName}
                    </span>
                  ))}
                </td>
                <td>
                  <button
                    className="action edit"
                    onClick={() => handleEdit(cls)}
                    title="Edit"
                  >
                    ✏️
                  </button>
                  <button
                    className="action delete"
                    onClick={() => handleDelete(cls._id)}
                    title="Delete"
                  >
                    🗑️
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
