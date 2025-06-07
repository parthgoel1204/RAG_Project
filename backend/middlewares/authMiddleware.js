// backend/middleware/authMiddleware.js
const jwt = require("jsonwebtoken");
const config = require("../config");

module.exports = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ message: "Authentication token missing or invalid." });
  }
  const token = authHeader.split(" ")[1];
  try {
    const decoded = jwt.verify(token, config.JWT_SECRET);
    req.user = { id: decoded.id, email: decoded.email };
    next();
  } catch (err) {
    console.error("JWT verification error:", err);
    return res.status(401).json({ message: "Invalid or expired token." });
  }
};
