import React, { useEffect, useState } from "react";
import axios from "axios";
import { FiSettings, FiMail, FiBell, FiMessageSquare, FiShield, FiUsers, FiCpu } from "react-icons/fi";
import "./SystemSettings.css";

export default function SystemSettings() {
  const [settings, setSettings] = useState({
    siteName: "",
    siteDescription: "",
    maxFileSize: 50,
    emailNotifications: true,
    pushNotifications: true,
    smsNotifications: false,
    maintenanceMode: false,
    userRegistration: true
  });

  useEffect(() => {
    axios.get("http://localhost:5000/api/settings")
      .then(res => {
        const dbSettings = {};
        res.data.settings.forEach(s => dbSettings[s.key] = s.value);
        setSettings(prev => ({ ...prev, ...dbSettings }));
      })
      .catch(err => console.error(err));
  }, []);

  const handleChange = (key, value) => {
    setSettings({ ...settings, [key]: value });
  };

  const saveSettings = () => {
    const entries = Object.entries(settings);
    Promise.all(
      entries.map(([key, value]) =>
        axios.post("http://localhost:5000/api/settings", { key, value })
      )
    )
      .then(() => alert("✅ Settings saved"))
      .catch(err => console.error(err.response?.data || err));
  };

  return (
    <div className="system-settings">
      <div className="header">
        <h1><FiSettings className="icon" /> System Settings</h1>
        <button className="save-btn" onClick={saveSettings}>💾 Save Changes</button>
      </div>

      <div className="settings-grid">
        {/* General Settings */}
        <div className="card animate-fade">
          <h2><FiCpu className="icon" /> General Settings</h2>
          <label>Site Name</label>
          <input
            type="text"
            value={settings.siteName}
            onChange={e => handleChange("siteName", e.target.value)}
          />
          <label>Site Description</label>
          <textarea
            value={settings.siteDescription}
            onChange={e => handleChange("siteDescription", e.target.value)}
          />
          <label>Maximum File Size (MB)</label>
          <input
            type="number"
            value={settings.maxFileSize}
            onChange={e => handleChange("maxFileSize", e.target.value)}
          />
        </div>

        {/* Notification Settings */}
        <div className="card animate-fade">
          <h2><FiBell className="icon" /> Notification Settings</h2>
          <div className="toggle email">
            <span><FiMail className="icon-sm" /> Email Notifications</span>
            <input
              type="checkbox"
              checked={settings.emailNotifications}
              onChange={e => handleChange("emailNotifications", e.target.checked)}
            />
          </div>
          <div className="toggle push">
            <span><FiBell className="icon-sm" /> Push Notifications</span>
            <input
              type="checkbox"
              checked={settings.pushNotifications}
              onChange={e => handleChange("pushNotifications", e.target.checked)}
            />
          </div>
          <div className="toggle sms">
            <span><FiMessageSquare className="icon-sm" /> SMS Notifications</span>
            <input
              type="checkbox"
              checked={settings.smsNotifications}
              onChange={e => handleChange("smsNotifications", e.target.checked)}
            />
          </div>
        </div>

        {/* System Control */}
        <div className="card animate-fade">
          <h2><FiCpu className="icon" /> System Control</h2>
          <div className="toggle">
            <span>🛠 Maintenance Mode</span>
            <input
              type="checkbox"
              checked={settings.maintenanceMode}
              onChange={e => handleChange("maintenanceMode", e.target.checked)}
            />
          </div>
          <div className="toggle">
            <span><FiUsers className="icon-sm" /> User Registration</span>
            <input
              type="checkbox"
              checked={settings.userRegistration}
              onChange={e => handleChange("userRegistration", e.target.checked)}
            />
          </div>
        </div>

        {/* Security Settings */}
        <div className="card warning animate-fade">
          <h2><FiShield className="icon" /> Security Settings</h2>
          <p>
            Advanced security settings like password policies, session timeouts,
            and two-factor authentication would be configured here in a production system.
          </p>
          <button className="configure-btn"><FiShield className="icon-sm" /> Configure Security</button>
        </div>
      </div>
    </div>
  );
}



