const express = require("express");
const router = express.Router();
const ctrl = require("../Controllers/ReportControllers");

router.post("/", ctrl.createReport);
router.get("/", ctrl.getAll);

module.exports = router;
