const express = require("express");
const router = express.Router();
const enrollCtrl = require("../Controllers/EnrollmentControllers");

router.get("/", enrollCtrl.getAll);
router.post("/", enrollCtrl.create);
router.put("/:id", enrollCtrl.update);
router.delete("/:id", enrollCtrl.remove);

module.exports = router;
