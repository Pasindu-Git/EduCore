const express = require("express");
const router = express.Router();
const ctrl = require("../Controllers/FeedbackControllers");

router.post("/", ctrl.createFeedback);
router.get("/", ctrl.getAll);
router.put("/:id/resolve", ctrl.resolve);

module.exports = router;
