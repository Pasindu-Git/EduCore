const express = require("express");
const router = express.Router();
const ctrl = require("../Controllers/RoleControllers");

router.get("/", ctrl.getAllRoles);
router.post("/", ctrl.createRole);
router.put("/:id", ctrl.updateRole);
router.delete("/:id", ctrl.deleteRole);

module.exports = router;
