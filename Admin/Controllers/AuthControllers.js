// Controllers/AuthControllers.js
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const User = require("../Model/UserModel"); // adjust path to your User model

function sign(userId) {
  return jwt.sign({ sub: userId }, process.env.JWT_SECRET, { expiresIn: "7d" });
}

function shapeUser(u) {
  return {
    _id: u._id,
    firstName: u.firstName || "",
    lastName: u.lastName || "",
    email: u.email || "",
    role: u.role?.name || u.role || "",
    avatarUrl: u.avatarUrl || "",
    status: u.status || "",
  };
}

// POST /api/auth/register
exports.register = async (req, res) => {
  try {
    const { firstName, lastName, email, password, role, status = "Active" } = req.body;

    if (!firstName || !lastName || !email || !password) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    const exists = await User.findOne({ email });
    if (exists) return res.status(400).json({ message: "Email already in use" });

    const hash = await bcrypt.hash(password, 10);
    const user = await User.create({ firstName, lastName, email, password: hash, role, status });

    const token = sign(user._id);
    res.status(201).json({ token, user: shapeUser(user) });
  } catch (err) {
    console.error("register error:", err);
    res.status(500).json({ message: "Registration failed" });
  }
};

// POST /api/auth/login
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body || {};
    if (!email || !password) return res.status(400).json({ message: "Email and password required" });

    const user = await User.findOne({ email }).populate("role"); // if role is a ref
    if (!user) return res.status(400).json({ message: "Invalid credentials" });

    const ok = await bcrypt.compare(password, user.password);
    if (!ok) return res.status(400).json({ message: "Invalid credentials" });

    const token = sign(user._id);
    res.json({ token, user: shapeUser(user) });
  } catch (err) {
    console.error("login error:", err);
    res.status(500).json({ message: "Login failed" });
  }
};

// GET /api/auth/me
exports.me = async (req, res) => {
  try {
    const user = await User.findById(req.userId).populate("role");
    if (!user) return res.status(404).json({ message: "User not found" });
    res.json(shapeUser(user));
  } catch (err) {
    console.error("me error:", err);
    res.status(500).json({ message: "Failed to fetch profile" });
  }
};
