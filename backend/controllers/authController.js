// =============================================================================
// SPANDANA — Auth Controller (register / login)
// =============================================================================

const jwt  = require("jsonwebtoken");
const User = require("../models/User");

function signToken(user) {
  return jwt.sign(
    { id: user._id, email: user.email, name: user.name },
    process.env.JWT_SECRET,
    { expiresIn: "7d" }
  );
}

// POST /api/auth/register
async function register(req, res) {
  try {
    const { email, password, name } = req.body;
    if (!email || !password || !name) {
      return res.status(400).json({ error: "email, password, and name are required" });
    }
    const existing = await User.findOne({ email: email.toLowerCase() });
    if (existing) {
      return res.status(409).json({ error: "Email already registered" });
    }
    const user  = await User.create({ email, password, name });
    const token = signToken(user);
    res.status(201).json({ token, user });
  } catch (err) {
    console.error("[auth] register error:", err.message);
    res.status(500).json({ error: "Server error" });
  }
}

// POST /api/auth/login
async function login(req, res) {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ error: "email and password are required" });
    }
    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      return res.status(401).json({ error: "Invalid credentials" });
    }
    const match = await user.comparePassword(password);
    if (!match) {
      return res.status(401).json({ error: "Invalid credentials" });
    }
    const token = signToken(user);
    res.json({ token, user });
  } catch (err) {
    console.error("[auth] login error:", err.message);
    res.status(500).json({ error: "Server error" });
  }
}

// GET /api/auth/me  (protected)
async function me(req, res) {
  try {
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ error: "User not found" });
    res.json({ user });
  } catch (err) {
    res.status(500).json({ error: "Server error" });
  }
}

module.exports = { register, login, me };
