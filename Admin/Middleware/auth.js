// middleware/requireAuth.js
const jwt = require("jsonwebtoken");

module.exports = function requireAuth(req, res, next) {
  try {
    const hdr = req.headers.authorization || "";
    const token = hdr.startsWith("Bearer ") ? hdr.slice(7) : null;
    if (!token) return res.status(401).json({ message: "Missing token" });

    const payload = jwt.verify(token, process.env.JWT_SECRET);
    req.userId = payload.sub; // or payload.id
    next();
  } catch (err) {
    return res.status(401).json({ message: "Invalid or expired token" });
  }
};
