// Admin/Controllers/AnalyticsControllers.js
const User = require("../Model/UserModel");
const Enrollment = require("../Model/EnrollmentModel");
const Feedback = require("../Model/FeedbackModel");
const ClassModel = require("../Model/ClassModel");

// helpers
function startOfDay(d) { const x = new Date(d); x.setHours(0,0,0,0); return x; }
function parseRange(range = "7d") {
  const now = new Date();
  const m = String(range || "").match(/^(\d+)\s*([dwm])$/i);
  if (!m) return startOfDay(new Date(now.getTime() - 7*24*3600*1000));
  const n = +m[1], u = m[2].toLowerCase();
  const dt = new Date(now);
  if (u === "d") dt.setDate(now.getDate() - n);
  if (u === "w") dt.setDate(now.getDate() - n*7);
  if (u === "m") dt.setMonth(now.getMonth() - n);
  return startOfDay(dt);
}
function buildContinuousDays(fromDate, days = 7) {
  const arr = [], labels = [];
  const start = startOfDay(fromDate);
  const names = ["Sun","Mon","Tue","Wed","Thu","Fri","Sat"];
  for (let i=0;i<days;i++){
    const d = new Date(start.getTime() + i*24*3600*1000);
    arr.push(d); labels.push(names[d.getDay()]);
  }
  return { dates: arr, labels };
}

// GET /api/analytics/overview?range=7d
exports.getOverview = async (req, res) => {
  try {
    const range = req.query.range || "7d";
    const from = parseRange(range), to = new Date();

    // Active users (visible immediately): users with status "active"
    const activeUsers = await User.countDocuments({ status: /active/i });

    // Completion rate in range: use activityDate = updatedAt || enrolledAt || createdAt
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
      { $match: { activityDate: { $gte: from, $lte: to }, status: /completed/i } },
      { $group: { _id: null, total: { $sum: 1 } } }
    ]);
    const totalEnroll = totals?.[0]?.total || 0;
    const completedEnroll = completed?.[0]?.total || 0;
    const completionRate = totalEnroll ? Math.round((completedEnroll / totalEnroll) * 100) : 0;

    // Avg feedback rating in range
    const avgAgg = await Feedback.aggregate([
      { $match: { createdAt: { $gte: from, $lte: to } } },
      { $group: { _id: null, avg: { $avg: "$rating" } } }
    ]);
    const avgFeedback = avgAgg?.[0]?.avg ? Number(avgAgg[0].avg.toFixed(2)) : 0;

    // Placeholder uptime
    const systemUptime = 99.9;

    return res.json({ activeUsers, completionRate, avgFeedback, systemUptime, from, to });
  } catch (e) {
    console.error("overview error:", e);
    res.status(500).json({ message: "Failed to load overview." });
  }
};

// GET /api/analytics/engagement/dau?range=7d
exports.getDAU = async (req, res) => {
  try {
    const range = req.query.range || "7d";
    const from = parseRange(range), to = new Date();

    // distinct learners per day by activityDate
    const agg = await Enrollment.aggregate([
      { $addFields: {
          activityDate: { $ifNull: ["$updatedAt", { $ifNull: ["$enrolledAt", "$createdAt"] }] }
        }
      },
      { $match: { activityDate: { $gte: from, $lte: to } } },
      { $group: {
          _id: { day: { $dateToString: { format: "%Y-%m-%d", date: "$activityDate" } } },
          users: { $addToSet: "$student" }
        }
      },
      { $project: { _id: 0, day: "$_id.day", count: { $size: "$users" } } },
      { $sort: { day: 1 } }
    ]);

    const days = 7; // or derive from range
    const { dates, labels } = buildContinuousDays(from, days);
    const map = new Map(agg.map(r => [r.day, r.count]));
    const values = dates.map(d => map.get(d.toISOString().slice(0,10)) || 0);

    return res.json({ labels, values, from, to });
  } catch (e) {
    console.error("dau error:", e);
    res.status(500).json({ message: "Failed to load DAU." });
  }
};

// GET /api/analytics/feedback/avg?range=7d
exports.getFeedbackTrend = async (req, res) => {
  try {
    const range = req.query.range || "7d";
    const from = parseRange(range), to = new Date();

    const agg = await Feedback.aggregate([
      { $match: { createdAt: { $gte: from, $lte: to } } },
      { $group: {
          _id: { day: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } } },
          avg: { $avg: "$rating" }
        }
      },
      { $project: { _id: 0, day: "$_id.day", value: { $round: ["$avg", 2] } } },
      { $sort: { day: 1 } }
    ]);

    const days = 7;
    const { dates, labels } = buildContinuousDays(from, days);
    const map = new Map(agg.map(r => [r.day, r.value]));
    const values = dates.map(d => map.get(d.toISOString().slice(0,10)) ?? 0);

    return res.json({ labels, values, from, to });
  } catch (e) {
    console.error("feedback trend error:", e);
    res.status(500).json({ message: "Failed to load feedback trend." });
  }
};

// GET /api/analytics/completion/by-class?range=30d
exports.getCompletionByClass = async (req, res) => {
  try {
    const range = req.query.range || "30d";
    const from = parseRange(range), to = new Date();

    const totals = await Enrollment.aggregate([
      { $addFields: {
          activityDate: { $ifNull: ["$updatedAt", { $ifNull: ["$enrolledAt", "$createdAt"] }] }
        }
      },
      { $match: { activityDate: { $gte: from, $lte: to } } },
      { $group: { _id: "$class", total: { $sum: 1 } } }
    ]);

    const completed = await Enrollment.aggregate([
      { $addFields: {
          activityDate: { $ifNull: ["$updatedAt", { $ifNull: ["$enrolledAt", "$createdAt"] }] }
        }
      },
      { $match: { activityDate: { $gte: from, $lte: to }, status: /completed/i } },
      { $group: { _id: "$class", completed: { $sum: 1 } } }
    ]);

    const compMap = new Map(completed.map(r => [String(r._id), r.completed]));
    const classIds = totals.map(t => t._id).filter(Boolean);
    const classes = await ClassModel.find({ _id: { $in: classIds } }, { name: 1 });

    const nameMap = new Map(classes.map(c => [String(c._id), c.name]));
    const labels = [], values = [];
    totals.forEach(t => {
      const id = String(t._id);
      const name = nameMap.get(id) || "Unknown";
      const c = compMap.get(id) || 0;
      labels.push(name);
      values.push(t.total ? Math.round((c / t.total) * 100) : 0);
    });

    return res.json({ labels, values, from, to });
  } catch (e) {
    console.error("completion by class error:", e);
    res.status(500).json({ message: "Failed to load completion by class." });
  }
};
