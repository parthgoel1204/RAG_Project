// backend/controllers/authController.js
const User = require("../models/User");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const config = require("../config");

// POST /api/auth/register
exports.register = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ message: "Email and password are required." });
    }
    // Check if user exists
    const existing = await User.findOne({ email });
    if (existing) {
      return res.status(400).json({ message: "Email already registered." });
    }
    // Hash password
    const saltRounds = 10;
    const passwordHash = await bcrypt.hash(password, saltRounds);
    // Create user
    const user = new User({ email, passwordHash });
    await user.save();
    return res.status(201).json({ message: "User registered successfully." });
  } catch (err) {
    console.error("Register error:", err);
    return res.status(500).json({ message: "Server error during registration." });
  }
};

// POST /api/auth/login
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ message: "Email and password are required." });
    }
    // Find user
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: "Invalid email or password." });
    }
    // Compare password
    const match = await bcrypt.compare(password, user.passwordHash);
    if (!match) {
      return res.status(400).json({ message: "Invalid email or password." });
    }
    // Issue JWT
    const payload = { id: user._id, email: user.email };
    const token = jwt.sign(payload, config.JWT_SECRET, { expiresIn: "24h" });
    return res.json({ token, user: { id: user._id, email: user.email } });
  } catch (err) {
    console.error("Login error:", err);
    return res.status(500).json({ message: "Server error during login." });
  }
};
