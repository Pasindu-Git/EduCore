import React from "react";
import "./RecentActivity.css";

function RecentActivity() {
  return (
    <div className="recent-activity">
      <h2>Recent Activity</h2>
      <ul>
        <li><b>John Doe</b> - New user registration <span>2 minutes ago</span></li>
        <li><b>Jane Smith</b> - Password reset request <span>15 minutes ago</span></li>
        <li><b>System</b> - Daily backup completed <span>1 hour ago</span></li>
      </ul>
    </div>
  );
}

export default RecentActivity;
