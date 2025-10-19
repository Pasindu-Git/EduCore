const express = require("express");
const router = express.Router();

const User = require("../Model/UserModel");

const Enrollment = require("../Model/EnrollmentModel");
const Feedback = require("../Model/FeedbackModel");

// --- helpers ---
function startOfDay(d) {
  const x = new Date(d);
  x.setHours(0, 0, 0, 0);
  return x;
}
function parseRange(range = "7d") {
  const now = new Date();
  const m = String(range || "").match(/^(\d+)\s*([dwm])$/i);
  if (!m) return startOfDay(new Date(now.getTime() - 7 * 24 * 3600 * 1000));
  const n = parseInt(m[1], 10);
  const u = m[2].toLowerCase();
  const dt = new Date(now);
  if (u === "d") dt.setDate(now.getDate() - n);
  if (u === "w") dt.setDate(now.getDate() - n * 7);
  if (u === "m") dt.setMonth(now.getMonth() - n);
  return startOfDay(dt);
}

async function computeOverview(range = "7d") {
  const from = parseRange(range);
  const to = new Date();

  // 1) Active users (shows immediately)
  const activeUsers = await User.countDocuments({ status: { $regex: /^active$/i } });

  // 2) Enrollment totals using a robust date field
  const totals = await Enrollment.aggregate([
    { $addFields: {
        activityDate: { $ifNull: ["$updatedAt", { $ifNull: ["$enrolledAt", "$createdAt"] }] }
      }
    },
    { $match: { activityDate: { $gte: from, $lte: to } } },
    { $group: { _id: null, total: { $sum: 1 } } }
  ]);

  const completed = await Enrollment.aggregate([
    { $addFields: {
        activityDate: { $ifNull: ["$updatedAt", { $ifNull: ["$enrolledAt", "$createdAt"] }] }
      }
    },
    { $match: { 
        activityDate: { $gte: from, $lte: to },
        status: { $regex: /^completed$/i }
      } 
    },
    { $group: { _id: null, total: { $sum: 1 } } }
  ]);

  const totalEnroll = totals?.[0]?.total || 0;
  const completedEnroll = completed?.[0]?.total || 0;
  const completionRate = totalEnroll ? Math.round((completedEnroll / totalEnroll) * 100) : 0;

  // 3) Avg feedback rating in range
  const agg = await Feedback.aggregate([
    { $match: { createdAt: { $gte: from, $lte: to } } },
    { $group: { _id: null, avg: { $avg: "$rating" } } },
  ]);
  const avgFeedback = agg?.[0]?.avg ? Number(agg[0].avg.toFixed(2)) : 0;

  // 4) Placeholder
  const systemUptime = 99.9;

  return { activeUsers, completionRate, avgFeedback, systemUptime, from, to };
}

module.exports = router; // export if you import it elsewhere
