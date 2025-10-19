import React, { useEffect, useMemo, useState } from "react";
import axios from "axios";
import "./UserManagement.css";
import Header from "../Header"; // ✅ Header file from same directory level

// Email validation helper
const isValidEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

export default function UserManagement() {
  // ========== HEADER DATA ==========
  const storedEmail  = (localStorage.getItem("email") || "").trim();
  const storedRole   = (localStorage.getItem("role") || "").trim();
  const firstName    = (localStorage.getItem("firstName") || "").trim();
  const lastName     = (localStorage.getItem("lastName") || "").trim();
  const avatarUrl =
    (localStorage.getItem("avatar") ||
      localStorage.getItem("profilePic") ||
      localStorage.getItem("profile") ||
      "").trim();
  const displayName = [firstName, lastName].filter(Boolean).join(" ") || storedEmail;

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

  // ========== STATES ==========
  const [users, setUsers] = useState([]);
  const [roles, setRoles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [editingUser, setEditingUser] = useState(null);
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    role: "",
    status: "",
  });
  const [newUser, setNewUser] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    role: "",
    status: "Active",
  });
  const [showForm, setShowForm] = useState(false);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [passwordUser, setPasswordUser] = useState(null);
  const [newPassword, setNewPassword] = useState("");
  const [formError, setFormError] = useState("");
  const [query, setQuery] = useState(""); // search query

  const token = localStorage.getItem("token");

  // ========== FETCH DATA ==========
  useEffect(() => {
    if (!token) {
      window.location.href = "/";
      return;
    }

    const fetchUsers = async () => {
      try {
        const res = await axios.get("http://localhost:5000/api/users", {
          headers: { Authorization: `Bearer ${token}` },
        });
        setUsers(res.data.users || res.data);
        setLoading(false);
      } catch (err) {
        setError(err.response?.data?.message || err.message);
        setLoading(false);
      }
    };

    const fetchRoles = async () => {
      try {
        const res = await axios.get("http://localhost:5000/api/roles", {
          headers: { Authorization: `Bearer ${token}` },
        });
        setRoles(res.data.roles || res.data);
      } catch (err) {
        console.error(err.response?.data?.message || err.message);
      }
    };

    fetchUsers();
    fetchRoles();
  }, [token]);

  // ========== CRUD ==========
  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this user?")) return;
    try {
      await axios.delete(`http://localhost:5000/api/users/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setUsers((prev) => prev.filter((u) => u._id !== id));
    } catch (err) {
      setFormError(err.response?.data?.message || err.message);
    }
  };

  const handleDisable = async (id) => {
    if (!window.confirm("Disable this user?")) return;
    try {
      const res = await axios.post(
        `http://localhost:5000/api/users/${id}/disable`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setUsers((prev) => prev.map((u) => (u._id === id ? res.data.user : u)));
    } catch (err) {
      setFormError(err.response?.data?.message || err.message);
    }
  };

  const startEdit = (user) => {
    setEditingUser(user._id);
    setFormData({
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      role: user.role?._id || "",
      status: user.status,
    });
    setFormError("");
  };

  const cancelEdit = () => {
    setEditingUser(null);
    setFormData({ firstName: "", lastName: "", email: "", role: "", status: "" });
    setFormError("");
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    setFormError("");

    if (
      !formData.firstName ||
      !formData.lastName ||
      !formData.email ||
      !formData.role ||
      !formData.status
    ) {
      setFormError("All fields are required");
      return;
    }
    if (!isValidEmail(formData.email)) {
      setFormError("Invalid email format");
      return;
    }

    try {
      const res = await axios.put(
        `http://localhost:5000/api/users/${editingUser}`,
        formData,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setUsers((prev) => prev.map((u) => (u._id === editingUser ? res.data.user : u)));
      cancelEdit();
    } catch (err) {
      setFormError(err.response?.data?.message || err.message);
    }
  };

  const handleCreateUser = async (e) => {
    e.preventDefault();
    setFormError("");

    if (
      !newUser.firstName ||
      !newUser.lastName ||
      !newUser.email ||
      !newUser.password ||
      !newUser.role
    ) {
      setFormError("All fields are required");
      return;
    }
    if (!isValidEmail(newUser.email)) {
      setFormError("Invalid email format");
      return;
    }
    if (newUser.password.length < 6) {
      setFormError("Password must be at least 6 characters");
      return;
    }

    try {
      const res = await axios.post("http://localhost:5000/api/users", newUser, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const createdUser = await axios.get(
        `http://localhost:5000/api/users/${res.data.userId}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setUsers((prev) => [...prev, createdUser.data.user]);
      setNewUser({
        firstName: "",
        lastName: "",
        email: "",
        password: "",
        role: "",
        status: "Active",
      });
      setShowForm(false);
    } catch (err) {
      setFormError(err.response?.data?.message || err.message);
    }
  };

  const openPasswordModal = (user) => {
    setPasswordUser(user);
    setNewPassword("");
    setShowPasswordModal(true);
  };

  const handlePasswordUpdate = async () => {
    if (!newPassword || newPassword.length < 6) {
      alert("Password must be at least 6 characters");
      return;
    }
    try {
      await axios.put(
        `http://localhost:5000/api/users/${passwordUser._id}`,
        { password: newPassword },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      alert("Password updated successfully");
      setShowPasswordModal(false);
    } catch (err) {
      alert(err.response?.data?.message || err.message);
    }
  };

  // ---------- FILTER ----------
  const filteredUsers = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return users;
    return users.filter((u) => {
      const fullName = `${u.firstName || ""} ${u.lastName || ""}`.toLowerCase();
      const email = (u.email || "").toLowerCase();
      const roleName = (u.role?.name || "").toLowerCase();
      const status = (u.status || "").toLowerCase();
      return (
        fullName.includes(q) ||
        email.includes(q) ||
        roleName.includes(q) ||
        status.includes(q)
      );
    });
  }, [users, query]);

  // ========== RENDER ==========
  if (loading) return <p>Loading users...</p>;
  if (error) return <p style={{ color: "red" }}>{error}</p>;

  return (
    <div className="user-management-container">
      {/* ✅ HEADER BAR */}
      <Header
        title="EDUCORE"
        name={displayName}
        role={storedRole}
        email={storedEmail}
        avatarUrl={avatarUrl}
        onLogout={handleLogout}
        onBellClick={() => console.log("Bell clicked")}
      />

      {/* SEARCH + ADD */}
      <div
        className="clearfix"
        style={{
          display: "flex",
          gap: 12,
          alignItems: "center",
          justifyContent: "space-between",
          flexWrap: "wrap",
          marginBottom: 12,
        }}
      >
        <h2 style={{ margin: 0 }}>Manage Users</h2>

        <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
          <input
            aria-label="Search users"
            className="search-input"
            placeholder="Search by name, email, role, status..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            style={{
              padding: "8px 12px",
              borderRadius: 8,
              border: "1px solid #d0d5dd",
              minWidth: 260,
            }}
          />
          <button className="add-user-btn" onClick={() => setShowForm(true)}>
            ➕ Add User
          </button>
        </div>
      </div>

      {/* CREATE USER MODAL */}
      {showForm && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h3>Create New User</h3>
            <input
              type="text"
              placeholder="First Name"
              value={newUser.firstName}
              onChange={(e) => setNewUser({ ...newUser, firstName: e.target.value })}
            />
            <input
              type="text"
              placeholder="Last Name"
              value={newUser.lastName}
              onChange={(e) => setNewUser({ ...newUser, lastName: e.target.value })}
            />
            <input
              type="email"
              placeholder="Email"
              value={newUser.email}
              onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
            />
            <input
              type="password"
              placeholder="Password"
              value={newUser.password}
              onChange={(e) => setNewUser({ ...newUser, password: e.target.value })}
            />
            <select
              value={newUser.role}
              onChange={(e) => setNewUser({ ...newUser, role: e.target.value })}
            >
              <option value="">Select Role</option>
              {roles.map((role) => (
                <option key={role._id} value={role._id}>
                  {role.name}
                </option>
              ))}
            </select>
            <select
              value={newUser.status}
              onChange={(e) => setNewUser({ ...newUser, status: e.target.value })}
            >
              <option value="Active">Active</option>
              <option value="Pending">Pending</option>
              <option value="Disabled">Disabled</option>
            </select>
            {formError && <p className="form-error">{formError}</p>}
            <div className="modal-actions">
              <button className="cancel-btn" onClick={() => setShowForm(false)}>
                Cancel
              </button>
              <button type="submit" onClick={handleCreateUser}>
                Create
              </button>
            </div>
          </div>
        </div>
      )}

      {/* PASSWORD MODAL */}
      {showPasswordModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h3>Reset Password for {passwordUser.firstName}</h3>
            <input
              type="password"
              placeholder="New Password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
            />
            <div className="modal-actions">
              <button className="cancel-btn" onClick={() => setShowPasswordModal(false)}>
                Cancel
              </button>
              <button type="submit" onClick={handlePasswordUpdate}>
                Update
              </button>
            </div>
          </div>
        </div>
      )}

      {/* USERS TABLE */}
      <table>
        <thead>
          <tr>
            <th>Name</th>
            <th>Email</th>
            <th style={{ minWidth: 140 }}>Role</th>
            <th style={{ minWidth: 120 }}>Status</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {(filteredUsers.length ? filteredUsers : []).map((user) => (
            <tr key={user._id}>
              <td>
                {editingUser === user._id ? (
                  <input
                    type="text"
                    value={formData.firstName}
                    onChange={(e) =>
                      setFormData({ ...formData, firstName: e.target.value })
                    }
                  />
                ) : (
                  `${user.firstName} ${user.lastName}`
                )}
              </td>
              <td>
                {editingUser === user._id ? (
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  />
                ) : (
                  user.email
                )}
              </td>
              <td>
                {editingUser === user._id ? (
                  <select
                    value={formData.role}
                    onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                  >
                    {roles.map((role) => (
                      <option key={role._id} value={role._id}>
                        {role.name}
                      </option>
                    ))}
                  </select>
                ) : (
                  user.role?.name
                )}
              </td>
              <td>
                {editingUser === user._id ? (
                  <select
                    value={formData.status}
                    onChange={(e) =>
                      setFormData({ ...formData, status: e.target.value })
                    }
                  >
                    <option value="Active">Active</option>
                    <option value="Pending">Pending</option>
                    <option value="Disabled">Disabled</option>
                  </select>
                ) : (
                  <span
                    className={`status-badge status-${String(user.status).toLowerCase()}`}
                  >
                    {user.status}
                  </span>
                )}
              </td>
              <td>
                <div className="action-buttons">
                  {editingUser === user._id ? (
                    <>
                      <button onClick={handleEditSubmit}>💾 Save</button>
                      <button onClick={cancelEdit}>❌ Cancel</button>
                    </>
                  ) : (
                    <>
                      <button onClick={() => startEdit(user)}>✏️ Edit</button>
                      <button onClick={() => handleDisable(user._id)}>🚫 Disable</button>
                      <button onClick={() => handleDelete(user._id)}>🗑️ Delete</button>
                      <button onClick={() => openPasswordModal(user)}>🔑 Password</button>
                    </>
                  )}
                </div>
              </td>
            </tr>
          ))}
          {filteredUsers.length === 0 && (
            <tr>
              <td colSpan={5} style={{ textAlign: "center", padding: 16 }}>
                No users found for “{query}”.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
