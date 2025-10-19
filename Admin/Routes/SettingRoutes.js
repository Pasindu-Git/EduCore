const express = require("express");
const router = express.Router();
const ctrl = require("../Controllers/SettingControllers");

router.get("/", ctrl.getAll);
router.post("/", ctrl.upsert);

module.exports = router;
