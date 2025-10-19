import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  FiUsers, FiBarChart2, FiActivity, FiClock, FiSmile, FiDownload,
} from "react-icons/fi";
import { Line, Bar } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale, LinearScale, PointElement, LineElement, BarElement,
  Tooltip, Legend,
} from "chart.js";
import axios from "axios";
import Header from "../Header"; // ← adjust if your Header path differs


ChartJS.register(
  CategoryScale, LinearScale, PointElement, LineElement, BarElement, Tooltip, Legend
);

const API_BASE = "http://localhost:5000/api";   // ← change if needed
const USE_SSE  = true;                           // prefer SSE for overview live updates

export default function Analytics() {
  // ---- state ----
  const [overview, setOverview] = useState({
    activeUsers: 0,
    completionRate: 0,
    avgFeedback: 0,
    systemUptime: 0,
  });
  const [dauData, setDauData] = useState([]);          // [Mon..Sun]
  const [dauLabels, setDauLabels] = useState(["Mon","Tue","Wed","Thu","Fri","Sat","Sun"]);
  const [feedbackData, setFeedbackData] = useState([]); // [Mon..Sun]
  const [feedbackLabels, setFeedbackLabels] = useState(["Mon","Tue","Wed","Thu","Fri","Sat","Sun"]);
  const [completionData, setCompletionData] = useState([]); // per class
  const [completionLabels, setCompletionLabels] = useState([]);

  const pollingRef = useRef(null);
  const sseRef = useRef(null);

  // ---- axios instance with auth header ----
  const axiosAuth = useMemo(() => {
    const inst = axios.create({ baseURL: API_BASE });
    const token = localStorage.getItem("token");
    if (token) inst.defaults.headers.common.Authorization = `Bearer ${token}`;
    return inst;
  }, []);

  // ====================== SSE: Overview live updates ======================
  useEffect(() => {
    if (!USE_SSE) return;

    const token = localStorage.getItem("token"); // if you validate it on the backend
    const url = `${API_BASE}/analytics/stream?range=7d${token ? `&token=${encodeURIComponent(token)}` : ""}`;

    try {
      const sse = new EventSource(url, { withCredentials: false });
      sseRef.current = sse;

      sse.addEventListener("overview", (e) => {
        try {
          const data = JSON.parse(e.data);
          setOverview({
            activeUsers: data.activeUsers ?? 0,
            completionRate: data.completionRate ?? 0,
            avgFeedback: data.avgFeedback ?? 0,
            systemUptime: data.systemUptime ?? 0,
          });
        } catch { /* ignore JSON errors */ }
      });

      // on error: close; polling keeps running for safety
      sse.onerror = () => {
        sse.close();
      };
    } catch {
      // ignore; polling stays active
    }

    return () => sseRef.current?.close();
  }, []);

  // ====================== Polling: DAU, Feedback, Completion (+ overview fallback) ======================
  useEffect(() => {
    const fetchAll = async () => {
      try {
        const [ov, dau, fb, comp] = await Promise.all([
          // where you call the endpoints in Analytics.jsx
axiosAuth.get("/analytics/overview?range=90d"),
axiosAuth.get("/analytics/engagement/dau?range=90d"),
axiosAuth.get("/analytics/feedback/avg?range=90d"),
axiosAuth.get("/analytics/completion/by-class?range=90d"),

        ]);

        // Overview (fallback only if SSE is disabled)
        if (!USE_SSE) {
          setOverview({
            activeUsers: ov.data?.activeUsers ?? 0,
            completionRate: ov.data?.completionRate ?? 0,
            avgFeedback: ov.data?.avgFeedback ?? 0,
            systemUptime: ov.data?.systemUptime ?? 0,
          });
        }

        // DAU
        if (Array.isArray(dau.data?.values)) {
          setDauData(dau.data.values);
          if (Array.isArray(dau.data.labels) && dau.data.labels.length) {
            setDauLabels(dau.data.labels);
          }
        }

        // Feedback trend
        if (Array.isArray(fb.data?.values)) {
          setFeedbackData(fb.data.values);
          if (Array.isArray(fb.data.labels) && fb.data.labels.length) {
            setFeedbackLabels(fb.data.labels);
          }
        }

        // Completion per class
        if (Array.isArray(comp.data?.values)) {
          setCompletionData(comp.data.values);
          setCompletionLabels(Array.isArray(comp.data.labels) ? comp.data.labels : []);
        }
      } catch (e) {
        console.error("Analytics fetch error:", e?.response?.data || e.message);
      }
    };

    // initial fetch + polling
    fetchAll();
    pollingRef.current = setInterval(fetchAll, 30_000);
    return () => clearInterval(pollingRef.current);
  }, [axiosAuth]);

  // ====================== Charts ======================
  const chartOptions = {
    responsive: true,
    plugins: { legend: { display: false } },
    scales: { x: { grid: { display: false } }, y: { grid: { color: "#f1f1f1" } } },
    animation: { duration: 400 },
  };

  const dauChart = {
    labels: dauLabels,
    datasets: [{
      label: "Active Users",
      data: dauData,
      borderColor: "#2563eb",
      backgroundColor: "rgba(37,99,235,0.18)",
      tension: 0.3, fill: true, pointRadius: 0,
    }],
  };

  const feedbackChart = {
    labels: feedbackLabels,
    datasets: [{
      label: "Avg Feedback Rating",
      data: feedbackData,
      borderColor: "#22c55e",
      backgroundColor: "rgba(34,197,94,0.18)",
      tension: 0.3, fill: true, pointRadius: 0,
    }],
  };

  const completionBar = {
    labels: completionLabels.length ? completionLabels : ["IT","Math","Science","English","Design","Business"],
    datasets: [{
      label: "Completion Rate (%)",
      data: completionData.length ? completionData : [92,78,85,88,73,95],
      backgroundColor: "#6366f1",
    }],
  };

  // ====================== Header logout ======================
  const handleLogout = () => {
    ["token","email","role","userId","firstName","lastName","avatar","profilePic","profile"].forEach(k => localStorage.removeItem(k));
    window.location.replace("/login");
  };
  const name = `${localStorage.getItem("firstName") || ""} ${localStorage.getItem("lastName") || ""}`.trim();
  const role = localStorage.getItem("role") || "";
  const email = localStorage.getItem("email") || "";
  const avatarUrl = localStorage.getItem("avatar") || "";

  // ====================== Export stub (wire to your PDF/CSV later) ======================
  const handleExport = () => {
    // You can reuse your jsPDF logic or export CSV from the state here.
    alert("Export coming soon: plug in jsPDF/CSV with current state.");
  };

  return (
    <div className="analytics-page">
      <Header
        title="EDUCORE"
        name={name || email}
        role={role}
        email={email}
        avatarUrl={avatarUrl}
        onLogout={handleLogout}
        onBellClick={() => console.log("🔔 Notifications clicked")}
      />

      {/* KPI Cards */}
      <section className="analytics-cards">
        <div className="card blue">
          <FiUsers className="icon" />
          <div><h4>Active Users</h4><p>{overview.activeUsers}</p></div>
        </div>
        <div className="card green">
          <FiBarChart2 className="icon" />
          <div><h4>Completion Rate</h4><p>{overview.completionRate}%</p></div>
        </div>
        <div className="card orange">
          <FiSmile className="icon" />
          <div><h4>Avg Feedback</h4><p>{Number(overview.avgFeedback || 0).toFixed(1)} ⭐</p></div>
        </div>
        <div className="card purple">
          <FiClock className="icon" />
          <div><h4>System Uptime</h4><p>{overview.systemUptime}%</p></div>
        </div>
      </section>

      {/* Charts */}
      <section className="analytics-charts">
        <div className="chart-card">
          <h3><FiActivity /> Daily Active Users</h3>
          <Line data={dauChart} options={chartOptions} />
        </div>

        <div className="chart-card">
          <h3><FiSmile /> Feedback Rating Trend</h3>
          <Line data={feedbackChart} options={chartOptions} />
        </div>

        <div className="chart-card">
          <h3><FiBarChart2 /> Class Completion Rate</h3>
          <Bar data={completionBar} options={chartOptions} />
        </div>
      </section>

      <div className="export-row">
        <button className="export-btn" onClick={handleExport}>
          <FiDownload /> Export Analytics Report
        </button>
      </div>
    </div>
  );
}
