// src/Dashboard/Dashboard.jsx
import React from "react";
import { Link } from "react-router-dom";
import {
  FaUsers, FaUserGraduate, FaClipboardList, FaHeartbeat,
  FaArrowUp, FaArrowDown, FaUserPlus, FaFileAlt, FaCommentDots
} from "react-icons/fa";
import { Line } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Tooltip
} from "chart.js";
import Header from "../Header"; // ✅ make sure path is correct
import "./Dashboard.css";

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Tooltip);

// Sample data for charts
const statsData = {
  totalUsers: [1000, 1200, 1500, 1800, 2200, 2600, 2847],
  activeStudents: [900, 1000, 1200, 1600, 1900, 2100, 2156],
  pendingFeedback: [50, 45, 38, 30, 25, 20, 18],
  systemHealth: [98, 98.5, 99, 99.2, 99.5, 99.8, 99.9],
};

const generateChart = (data, color) => ({
  labels: Array(data.length).fill(""),
  datasets: [
    {
      data,
      borderColor: color,
      backgroundColor: "rgba(0,0,0,0)",
      tension: 0.3,
      pointRadius: 0,
    },
  ],
});

const options = {
  responsive: true,
  plugins: { legend: { display: false } },
  scales: { x: { display: false }, y: { display: false } },
  elements: { line: { borderWidth: 2 } },
  animation: { duration: 1500, easing: "easeOutQuart" },
};

export default function Dashboard() {
  // ✅ Header helpers
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
    <div className="dashboard-page">
      {/* ✅ Modern EDUCORE header */}
      <Header
        // title defaults to "EDUCORE" — can omit or set explicitly:
        title="EDUCORE"
        name={name || email}
        role={role}
        email={email}
        avatarUrl={avatarUrl}
        onLogout={handleLogout}
        onBellClick={() => console.log("🔔 Notifications clicked")}
      />

      <div className="dashboard">
        <header className="dashboard-header">
          <h1>Welcome Back!</h1>
          <p>Here’s what’s happening with your LMS today.</p>
        </header>

        {/* Stats Cards */}
        <section className="stats-grid">
          <div className="card">
            <div className="card-icon blue"><FaUsers /></div>
            <div className="card-content">
              <h4>Total Users</h4>
              <p className="number">2,847</p>
              <span className="trend positive"><FaArrowUp /> +12%</span>
              <div className="mini-chart">
                <Line data={generateChart(statsData.totalUsers, "#007bff")} options={options} />
              </div>
            </div>
          </div>

          <div className="card green">
            <div className="card-icon green"><FaUserGraduate /></div>
            <div className="card-content">
              <h4>Active Students</h4>
              <p className="number">2,156</p>
              <span className="trend positive"><FaArrowUp /> +8%</span>
              <div className="mini-chart">
                <Line data={generateChart(statsData.activeStudents, "#28a745")} options={options} />
              </div>
            </div>
          </div>

          <div className="card yellow">
            <div className="card-icon yellow"><FaClipboardList /></div>
            <div className="card-content">
              <h4>Pending Feedback</h4>
              <p className="number">18</p>
              <span className="trend negative"><FaArrowDown /> -23%</span>
              <div className="mini-chart">
                <Line data={generateChart(statsData.pendingFeedback, "#ffc107")} options={options} />
              </div>
            </div>
          </div>

          <div className="card purple">
            <div className="card-icon purple"><FaHeartbeat /></div>
            <div className="card-content">
              <h4>System Health</h4>
              <p className="number">99.9%</p>
              <span className="trend positive"><FaArrowUp /> +0.1%</span>
              <div className="mini-chart">
                <Line data={generateChart(statsData.systemHealth, "#6f42c1")} options={options} />
              </div>
            </div>
          </div>
        </section>

        {/* Activity & Quick Actions */}
        <section className="dashboard-panels">
          <div className="panel activity-panel">
            <h4><FaClipboardList style={{ marginRight: "8px" }} /> Recent Activity</h4>
            <ul className="activity-list">
              <li><FaUserPlus className="activity-icon blue" /> <strong>John Doe</strong> – New user registration <span>2 min ago</span></li>
              <li><FaUserPlus className="activity-icon green" /> <strong>Jane Smith</strong> – Password reset request <span>15 min ago</span></li>
              <li><FaClipboardList className="activity-icon purple" /> <strong>System</strong> – Daily backup completed <span>1 hr ago</span></li>
              <li><FaUserPlus className="activity-icon yellow" /> <strong>Bob Johnson</strong> – Profile updated <span>2 hrs ago</span></li>
              <li><FaCommentDots className="activity-icon green" /> <strong>Alice Williams</strong> – Feedback submitted <span>3 hrs ago</span></li>
            </ul>
          </div>

          <div className="panel actions-panel">
            <h4><FaUserPlus style={{ marginRight: "8px" }} /> Quick Actions</h4>
            <div className="quick-actions">
              <Link to="/users" className="action-btn blue"><FaUserPlus /> Add New User</Link>
              <Link to="/reports" className="action-btn green"><FaFileAlt /> Generate Report</Link>
              <Link to="/admin/feedback" className="action-btn purple"><FaCommentDots /> Review Feedback</Link>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
