import React, { useEffect, useState } from "react";
import axios from "axios";
import { FiCheckCircle, FiUser, FiStar, FiDownload, FiFilter } from "react-icons/fi";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import "./Feedback.css";

const API = "http://localhost:5000/api"; // change to 3000 if your server runs there

export default function AdminFeedback() {
  const [feedback, setFeedback] = useState([]);
  const [filter, setFilter] = useState("all");

  useEffect(() => {
    fetchFeedback();
  }, []);

  const fetchFeedback = () => {
    axios
      .get(`${API}/feedback`)
      .then((res) => setFeedback(res.data.feedback))
      .catch((err) => console.error(err));
  };

  const handleResolve = (id) => {
    axios
      .put(`${API}/feedback/${id}/resolve`)
      .then(() => fetchFeedback())
      .catch((err) => console.error(err));
  };

  const filteredFeedback = feedback.filter((fb) => {
    if (filter === "resolved") return fb.resolved;
    if (filter === "pending") return !fb.resolved;
    return true;
  });

  // --- helpers: correct anonymity handling + robust fallbacks
  const displayEmail = (fb) => (fb?.anonymous ? "" : (fb?.user?.email || fb?.email || ""));
  const displayName = (fb) => {
    if (fb?.anonymous) return "Anonymous";
    const first = fb?.user?.firstName || "";
    const last = fb?.user?.lastName || "";
    const full = `${first} ${last}`.trim();
    if (full) return full;
    const email = displayEmail(fb);
    if (email) return email; // fallback to email when not anonymous
    return "User";
  };

  const generatePDF = () => {
    const doc = new jsPDF({ orientation: "p", unit: "pt", format: "a4" });
    const margin = 40;
    let y = margin;

    doc.setFont("helvetica", "bold");
    doc.setFontSize(18);
    doc.text("User Feedback Report", margin, y);
    y += 22;

    const list = filteredFeedback;
    const total = list.length;
    const resolvedCount = list.filter((f) => f.resolved).length;
    const pendingCount = total - resolvedCount;
    const avgRating = total
      ? (list.reduce((s, f) => s + (Number(f.rating) || 0), 0) / total).toFixed(2)
      : "0.00";

    const now = new Date();
    const generatedAt = now.toLocaleString("en-GB", { timeZone: "Asia/Colombo" });
    const filterName = filter === "all" ? "All" : filter === "resolved" ? "Resolved" : "Pending";

    doc.setFont("helvetica", "normal");
    doc.setFontSize(11);
    doc.text(`Generated: ${generatedAt} (Asia/Colombo)`, margin, y); y += 16;
    doc.text(`Filter: ${filterName}`, margin, y); y += 16;
    doc.text(`Total: ${total}   Resolved: ${resolvedCount}   Pending: ${pendingCount}   Avg Rating: ${avgRating}`, margin, y);
    y += 20;

    const tableBody = list.map((fb) => [
      displayName(fb),
      displayEmail(fb) || "-",             // Email column (blank if anonymous)
      fb.role || "-",
      fb.text || "-",
      String(fb.rating ?? "-"),
      fb.resolved ? "Yes" : "No",
      fb.createdAt ? new Date(fb.createdAt).toLocaleDateString("en-GB") : "-"
    ]);

    autoTable(doc, {
      startY: y,
      head: [["User", "Email", "Role", "Feedback", "Rating", "Resolved", "Date"]],
      body: tableBody,
      styles: { fontSize: 10, cellPadding: 6, valign: "top" },
      headStyles: { fillColor: [52, 152, 219], textColor: 255 },
      columnStyles: {
        0: { cellWidth: 120 },
        1: { cellWidth: 160 },
        2: { cellWidth: 70 },
        3: { cellWidth: 200 },
        4: { cellWidth: 50, halign: "center" },
        5: { cellWidth: 65, halign: "center" },
        6: { cellWidth: 70 }
      }
    });

    const yyyy = now.getFullYear();
    const mm = String(now.getMonth() + 1).padStart(2, "0");
    const dd = String(now.getDate()).padStart(2, "0");
    doc.save(`feedback-report_${filterName.toLowerCase()}_${yyyy}-${mm}-${dd}.pdf`);
  };

  return (
    <div className="feedback-page">
      <div className="feedback-list">
        <div className="list-header">
          <h2>📊 Admin Feedback Management</h2>

          <div className="actions">
            <div className="filter">
              <FiFilter />
              <select value={filter} onChange={(e) => setFilter(e.target.value)}>
                <option value="all">All</option>
                <option value="pending">Pending</option>
                <option value="resolved">Resolved</option>
              </select>
            </div>

            <button className="download-btn" onClick={generatePDF}>
              <FiDownload /> Download Report
            </button>
          </div>
        </div>

        {filteredFeedback.length === 0 ? (
          <p className="empty">No feedback found.</p>
        ) : (
          filteredFeedback.map((fb) => {
            const name = displayName(fb);
            const email = displayEmail(fb);
            return (
              <div key={fb._id} className={`feedback-card ${fb.resolved ? "resolved" : ""}`}>
                <div className="feedback-header">
                  <FiUser className="icon" />
                  <span>
                    <strong>{name}</strong> ({fb.role || "-"})
                    {email ? <span className="email"> — {email}</span> : null}
                  </span>
                </div>

                <p className="feedback-text">{fb.text}</p>

                <div className="feedback-footer">
                  <div className="stars">
                    {[...Array(fb.rating)].map((_, i) => (
                      <FiStar key={i} className="star active" />
                    ))}
                  </div>

                  {fb.resolved ? (
                    <span className="resolved-badge"><FiCheckCircle /> Resolved</span>
                  ) : (
                    <button className="resolve-btn" onClick={() => handleResolve(fb._id)}>
                      <FiCheckCircle /> Mark Resolved
                    </button>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
