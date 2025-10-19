// Routes/AuthRoutes.js
const express = require("express");
const router = express.Router();
const authController = require("../Controllers/AuthControllers");
const requireAuth = require("../Middleware/auth");

// Public
router.post("/register", authController.register);
router.post("/login", authController.login);

// Private
router.get("/me", requireAuth, authController.me);

module.exports = router;
