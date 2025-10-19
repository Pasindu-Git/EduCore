const express = require("express");
const router = express.Router();
const classCtrl = require("../Controllers/ClassControllers");

router.get("/", classCtrl.list);
router.post("/", classCtrl.create);
router.put("/:id", classCtrl.update);
router.delete("/:id", classCtrl.remove);

module.exports = router;
