// src/Feedback/Feedback.jsx  (user-side page)
import React, { useState } from "react";
import axios from "axios";
import { FiSend, FiStar } from "react-icons/fi";
import Header from "../Header"; // <-- make sure Header.js is at: src/Header.js
import "./Feedback.css";

// Backend base URL (change if your API is elsewhere)
const API = "http://localhost:5000/api";

export default function Feedback() {
  // ---- values saved at login ----
  const storedEmail  = (localStorage.getItem("email") || "").trim();       // e.g., "you@domain.com"
  const storedRole   = (localStorage.getItem("role") || "Student").trim(); // e.g., "Student"
  const storedUserId = (localStorage.getItem("userId") || "").trim();      // Mongo _id (optional)
  const firstName    = (localStorage.getItem("firstName") || "").trim();
  const lastName     = (localStorage.getItem("lastName") || "").trim();
  const avatarUrl =
    (localStorage.getItem("avatar") ||
      localStorage.getItem("profilePic") ||
      localStorage.getItem("profile") ||
      "").trim();

  const displayName = [firstName, lastName].filter(Boolean).join(" ") || storedEmail;

  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState("");
  const [formData, setFormData] = useState({
    text: "",
    rating: 0,
    role: storedRole || "Student",
    isAnonymous: false,
  });

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

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("");

    if (!formData.text.trim() || !formData.rating) {
      setMessage("Please write feedback and select a rating.");
      return;
    }

    try {
      setSubmitting(true);

      // Build payload
      const payload = {
        text: formData.text.trim(),
        rating: formData.rating,
        // use the role from login unless anonymous
        role: formData.isAnonymous ? "Anonymous" : (formData.role || storedRole || "Student"),
        anonymous: formData.isAnonymous,
      };

      // include identifiers ONLY when not anonymous
      if (!formData.isAnonymous) {
        if (storedUserId) payload.userId = storedUserId;
        if (storedEmail)  payload.email  = storedEmail;
      }

      await axios.post(`${API}/feedback`, payload);

      setFormData({ text: "", rating: 0, role: storedRole || "Student", isAnonymous: false });
      setMessage("✅ Feedback submitted. Thank you!");
    } catch (err) {
      const msg = err?.response?.data?.message || err?.message || "Failed to submit feedback.";
      setMessage(`❌ ${msg}`);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="feedback-page">
      {/* ===== Header (separate component) ===== */}
      <Header
        title="Feedback"
        name={displayName}
        role={storedRole}
        email={storedEmail}
        avatarUrl={avatarUrl}
        onLogout={handleLogout}
        onBellClick={() => {}}
      />

      {/* ===== Form ===== */}
      <div className="feedback-form-card">
        <h2>Share Your Feedback</h2>

        {message ? (
          <div
            style={{
              marginBottom: 10,
              fontSize: 14,
              padding: "8px 10px",
              borderRadius: 8,
              background: message.startsWith("✅") ? "#e8fff0" : "#fff1f0",
              color: message.startsWith("✅") ? "#0e8a3a" : "#b00020",
            }}
          >
            {message}
          </div>
        ) : null}

        <form onSubmit={handleSubmit}>
          <textarea
            placeholder="Write your feedback..."
            value={formData.text}
            onChange={(e) => setFormData({ ...formData, text: e.target.value })}
            required
          />

          <div className="rating">
            {[1, 2, 3, 4, 5].map((star) => (
              <FiStar
                key={star}
                className={formData.rating >= star ? "star active" : "star"}
                onClick={() => setFormData({ ...formData, rating: star })}
                title={`${star} star${star > 1 ? "s" : ""}`}
              />
            ))}
          </div>

          {/* Anonymous toggle */}
          <label
            className="anon-row"
            style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 6 }}
          >
            <input
              type="checkbox"
              checked={formData.isAnonymous}
              onChange={(e) =>
                setFormData({ ...formData, isAnonymous: e.target.checked })
              }
            />
            Submit anonymously
          </label>

          {/* Info: who it will submit as when NOT anonymous */}
          {!formData.isAnonymous && storedEmail ? (
            <div style={{ fontSize: 12, opacity: 0.8, margin: "6px 0 10px" }}>
              Will submit as: <b>{storedEmail}</b> ({storedRole})
            </div>
          ) : null}

          <button type="submit" className="submit-btn" disabled={submitting}>
            <FiSend /> {submitting ? "Submitting..." : "Submit Feedback"}
          </button>
        </form>
      </div>
    </div>
  );
}
