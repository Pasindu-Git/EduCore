// Admin/Routes/AnalyticsRoutes.js
const express = require("express");
const router = express.Router();
const auth = require("../Middleware/auth"); // if you want to protect these
const analytics = require("../Controllers/AnalyticsControllers");

// Optionally add `auth` middleware if these should require a token
router.get("/analytics/overview", /*auth,*/ analytics.getOverview);
router.get("/analytics/engagement/dau", /*auth,*/ analytics.getDAU);
router.get("/analytics/feedback/avg", /*auth,*/ analytics.getFeedbackTrend);
router.get("/analytics/completion/by-class", /*auth,*/ analytics.getCompletionByClass);

module.exports = router;
