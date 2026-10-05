// =============================================================================
// SPANDANA — JWT Auth Middleware
// Reads the JWT from the httpOnly cookie set by the auth controller.
// =============================================================================

const jwt = require("jsonwebtoken");

/**
 * Protects a route by verifying the 'token' httpOnly cookie.
 * On success: attaches req.user = { id, email, name, profileComplete }
 * On failure: returns 401 JSON error
 */
function authMiddleware(req, res, next) {
  const token = req.cookies?.token;

  if (!token) {
    return res.status(401).json({ error: "Not authenticated — please log in" });
  }

  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    req.user = payload;
    next();
  } catch {
    return res.status(401).json({ error: "Invalid or expired session — please log in again" });
  }
}

module.exports = authMiddleware;
