// =============================================================================
// SPANDANA — JWT Auth Middleware
// =============================================================================

const jwt = require("jsonwebtoken");

/**
 * Protects a route by verifying the Bearer token in the Authorization header.
 * On success: attaches req.user = { id, email, name }
 * On failure: returns 401 JSON error
 */
function authMiddleware(req, res, next) {
  const header = req.headers.authorization;
  if (!header || !header.startsWith("Bearer ")) {
    return res.status(401).json({ error: "No token provided" });
  }
  const token = header.slice(7);
  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    req.user = payload;
    next();
  } catch {
    return res.status(401).json({ error: "Invalid or expired token" });
  }
}

module.exports = authMiddleware;
