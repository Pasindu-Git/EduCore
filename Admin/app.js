require("dotenv").config();
const express = require("express"); 
const mongoose = require("mongoose");
const cors = require("cors");


// import routes
const userRoutes = require("./Routes/UserRoutes");
const roleRoutes = require("./Routes/RoleRoutes");
const classRoutes = require("./Routes/ClassRoutes");
const enrollmentRoutes = require("./Routes/EnrollmentRoutes");
const settingRoutes = require("./Routes/SettingRoutes");
const feedbackRoutes = require("./Routes/FeedbackRoutes");
const reportRoutes = require("./Routes/ReportRoutes");
const authRoutes = require("./Routes/AuthRoutes");
const analyticsRoutes = require("./Routes/AnalyticsRoutes");
const analyticsStreamRoutes = require("./Routes/AnalyticsStreamRoutes");

const app = express();

// ✅ Hardcoded configuration
const MONGO_URI = "mongodb+srv://admin:vMlVpfShLff2bKZ0@cluster0.v9tonu6.mongodb.net/";
const JWT_SECRET = "super_long_random_secret_string_change_me"; // <-- Use this in AuthController
const PORT = 5000;

// middleware
app.use(cors());
app.use(express.json());

// routes
app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/roles", roleRoutes);
app.use("/api/classes", classRoutes);
app.use("/api/enrollments", enrollmentRoutes);
app.use("/api/settings", settingRoutes);
app.use("/api/feedback", feedbackRoutes);
app.use("/api/reports", reportRoutes);
app.use("/api/analytics", analyticsRoutes);
app.use("/api/analyticsStream", analyticsStreamRoutes);

// error handler
app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({ message: "Server error", error: err.message });
});

// connect to MongoDB
mongoose.connect(MONGO_URI)
  .then(() => {
    console.log("✅ Connected to MongoDB");
    app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
  })
  .catch(err => console.error("❌ MongoDB connection error:", err));
