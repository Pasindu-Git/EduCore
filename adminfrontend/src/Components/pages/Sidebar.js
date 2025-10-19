import React, { Component } from "react";
import { Link } from "react-router-dom";
import "./Sidebar.css";

export default function Sidebar() {
  const user = JSON.parse(localStorage.getItem("user"));
  const role = user?.role?.name || "";

  return (
    <aside className="sidebar">
      <h2 className="logo">LMS</h2>
      <nav>
        <ul>
          {/* Admin menu */}
          {role === "Admin" ? (
            <>
              <li><Link to="/dashboard">Dashboard</Link></li>
              <li><Link to="/users">User Management</Link></li>
              <li><Link to="/roles">Roles & Permissions</Link></li>
              <li><Link to="/enrollment">Enrollment</Link></li>
              <li><Link to="/classmanagement">Class Management</Link></li>
              <li><Link to="/settings">System Settings</Link></li>
              <li><Link to="/reports">Reports</Link></li>
              <li><Link to="/analytics">Analytics</Link></li>
              <li><Link to="/feedback">Feedback</Link></li>
              
              <li><Link to="/admin/feedback">Feedback Management</Link></li>
            </>
          ) : (
            // Non-admin users → only Feedback page
            <li><Link to="/feedback">Feedback</Link></li>
          )}
        </ul>
      </nav>
    </aside>
  );
}
