// =============================================================================
// SPANDANA — Auth Controller (signup / login / logout / me)
// JWT is set as an httpOnly cookie — never returned in the response body.
// =============================================================================

const jwt  = require("jsonwebtoken");
const User = require("../models/User");

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function signToken(user) {
  return jwt.sign(
    {
      id:              user._id,
      email:           user.email,
      name:            user.name,
      profileComplete: !!user.profile?.profileComplete,
    },
    process.env.JWT_SECRET,
    { expiresIn: "7d" }
  );
}

/** Set the JWT as a secure, httpOnly cookie — JS can never read this. */
function setTokenCookie(res, token, user) {
  res.cookie("token", token, {
    httpOnly: true,
    secure:   process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge:   7 * 24 * 60 * 60 * 1000,
    path:     "/",
  });
  // Secondary non-httpOnly cookie so Next.js edge middleware can check
  // profileComplete without a DB call on every request.
  res.cookie("pc", user.profile?.profileComplete ? "1" : "0", {
    httpOnly: false,
    secure:   process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge:   7 * 24 * 60 * 60 * 1000,
    path:     "/",
  });
}

/** Shape of user data returned to the client (no password, no token). */
function publicUser(user) {
  return {
    id:    user._id,
    name:  user.name,
    email: user.email,
    profile: user.profile ?? null,
  };
}

// ---------------------------------------------------------------------------
// POST /api/auth/signup
// ---------------------------------------------------------------------------
async function signup(req, res) {
  try {
    const { email, password, confirmPassword, name } = req.body;

    if (!email || !password || !confirmPassword || !name) {
      return res.status(400).json({ error: "email, password, confirmPassword, and name are required" });
    }
    if (password !== confirmPassword) {
      return res.status(400).json({ error: "Passwords do not match" });
    }

    const existing = await User.findOne({ email: email.toLowerCase() });
    if (existing) {
      return res.status(409).json({ error: "Email already registered" });
    }

    const user  = await User.create({ email, password, name });
    const token = signToken(user);
    setTokenCookie(res, token, user);
    res.status(201).json({ user: publicUser(user) });
  } catch (err) {
    console.error("[auth] signup error:", err.message);
    res.status(500).json({ error: "Server error" });
  }
}

// ---------------------------------------------------------------------------
// POST /api/auth/login
// ---------------------------------------------------------------------------
async function login(req, res) {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ error: "email and password are required" });
    }

    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      return res.status(401).json({ error: "Invalid email or password" });
    }
    const match = await user.comparePassword(password);
    if (!match) {
      return res.status(401).json({ error: "Invalid email or password" });
    }

    const token = signToken(user);
    setTokenCookie(res, token, user);
    res.json({ user: publicUser(user) });
  } catch (err) {
    console.error("[auth] login error:", err.message);
    res.status(500).json({ error: "Server error" });
  }
}

// ---------------------------------------------------------------------------
// POST /api/auth/logout
// ---------------------------------------------------------------------------
function logout(req, res) {
  res.clearCookie("token", { path: "/" });
  res.clearCookie("pc",    { path: "/" });
  res.json({ message: "Logged out" });
}

// ---------------------------------------------------------------------------
// GET /api/auth/me  (protected)
// ---------------------------------------------------------------------------
async function me(req, res) {
  try {
    const user = await User.findById(req.user.id).select("-password");
    if (!user) return res.status(404).json({ error: "User not found" });
    res.json({ user: publicUser(user) });
  } catch (err) {
    res.status(500).json({ error: "Server error" });
  }
}

module.exports = { signup, login, logout, me };
