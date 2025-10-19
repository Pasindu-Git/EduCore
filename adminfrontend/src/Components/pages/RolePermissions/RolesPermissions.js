// src/Roles/Roles.jsx
import React, { useEffect, useState } from "react";
import axios from "axios";
import Header from "../Header"; // ✅ adjust the path if needed
import "./Roles.css";

export default function Roles() {
  const [roles, setRoles] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [editingRole, setEditingRole] = useState(null);

  const [formData, setFormData] = useState({
    name: "",
    permissions: [],
  });

  useEffect(() => {
    fetchRoles();
  }, []);

  const fetchRoles = () => {
    axios
      .get("http://localhost:5000/api/roles")
      .then((res) => setRoles(res.data.roles || res.data))
      .catch((err) => console.error(err));
  };

  const handleChange = (e) => {
    setFormData({ ...formData, name: e.target.value });
  };

  const handlePermissionToggle = (perm) => {
    setFormData((prev) => {
      const exists = prev.permissions.includes(perm);
      return {
        ...prev,
        permissions: exists
          ? prev.permissions.filter((p) => p !== perm)
          : [...prev.permissions, perm],
      };
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const payload = {
      name: formData.name,
      permissions: formData.permissions,
    };

    if (editingRole) {
      axios
        .put(`http://localhost:5000/api/roles/${editingRole._id}`, payload)
        .then(() => {
          fetchRoles();
          resetForm();
        })
        .catch((err) => console.error(err));
    } else {
      axios
        .post("http://localhost:5000/api/roles", payload)
        .then(() => {
          fetchRoles();
          resetForm();
        })
        .catch((err) => console.error(err));
    }
  };

  const handleEdit = (role) => {
    setEditingRole(role);
    setFormData({ name: role.name, permissions: role.permissions || [] });
    setShowForm(true);
  };

  const handleDelete = (id) => {
    if (window.confirm("Are you sure you want to delete this role?")) {
      axios
        .delete(`http://localhost:5000/api/roles/${id}`)
        .then(() => fetchRoles())
        .catch((err) => console.error(err));
    }
  };

  const resetForm = () => {
    setFormData({ name: "", permissions: [] });
    setEditingRole(null);
    setShowForm(false);
  };

  const getPermissionIcon = (permission) => {
    if (permission.toLowerCase().includes("view")) return "👁️";
    if (permission.toLowerCase().includes("edit")) return "✏️";
    if (permission.toLowerCase().includes("manage")) return "⚙️";
    return "❔";
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

  const name = `${localStorage.getItem("firstName") || ""} ${
    localStorage.getItem("lastName") || ""
  }`.trim();
  const role = localStorage.getItem("role") || "";
  const email = localStorage.getItem("email") || "";
  const avatarUrl = localStorage.getItem("avatar") || "";

  return (
    <div className="roles-page-wrapper">
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

      <div className="roles-page">
        <div className="top-bar">
          <h1>Roles & Permissions</h1>
          <button className="add-btn" onClick={() => setShowForm(true)}>
            ➕ Add Role
          </button>
        </div>

        {/* Modal Form */}
        {showForm && (
          <div className="modal">
            <form className="role-form" onSubmit={handleSubmit}>
              <h2>{editingRole ? "Edit Role" : "Add New Role"}</h2>
              <input
                type="text"
                name="name"
                placeholder="Role Name"
                value={formData.name}
                onChange={handleChange}
                required
              />

              {/* Organized Checkbox Grid */}
              <div className="permission-checkboxes">
                <label>
                  <input
                    type="checkbox"
                    checked={formData.permissions.includes("view")}
                    onChange={() => handlePermissionToggle("view")}
                  />
                  {" "}View
                </label>
                <label>
                  <input
                    type="checkbox"
                    checked={formData.permissions.includes("edit")}
                    onChange={() => handlePermissionToggle("edit")}
                  />
                  {" "}Edit
                </label>
                <label>
                  <input
                    type="checkbox"
                    checked={formData.permissions.includes("manage")}
                    onChange={() => handlePermissionToggle("manage")}
                  />
                  {" "}Manage
                </label>
              </div>

              <div className="form-buttons">
                <button type="submit" className="submit-btn">Save</button>
                <button type="button" className="cancel-btn" onClick={resetForm}>
                  Cancel
                </button>
              </div>
            </form>
          </div>
        )}

        <div className="table-wrapper">
          <table className="roles-table">
            <thead>
              <tr>
                <th>Role</th>
                <th>Permissions</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {roles.map((r) => (
                <tr key={r._id}>
                  <td>{r.name}</td>
                  <td>
                    {(r.permissions || []).length > 0
                      ? r.permissions.map((p, idx) => (
                          <span
                            key={idx}
                            className={`permission-badge ${
                              p.toLowerCase().includes("view")
                                ? "view"
                                : p.toLowerCase().includes("edit")
                                ? "edit"
                                : p.toLowerCase().includes("manage")
                                ? "manage"
                                : "other"
                            }`}
                          >
                            {getPermissionIcon(p)} {p}
                          </span>
                        ))
                      : "None"}
                  </td>
                  <td>
                    <div className="actions">
                      <button className="action edit" onClick={() => handleEdit(r)}>
                        ✏️
                      </button>
                      <button className="action delete" onClick={() => handleDelete(r._id)}>
                        🗑️
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
