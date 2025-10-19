const express = require("express");
const router = express.Router();
const ctrl = require("../Controllers/AuditLogControllers");

// Admin can view logs
router.get("/", ctrl.getAll);

module.exports = router;
