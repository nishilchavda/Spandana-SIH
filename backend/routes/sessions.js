// =============================================================================
// SPANDANA — Sessions Routes
// =============================================================================

const router     = require("express").Router();
const { getSessions, getSessionById, createSession } = require("../controllers/sessionsController");

// GET  /api/sessions          → all sessions (newest first)
// POST /api/sessions          → create a session manually
// GET  /api/sessions/:id      → single session + reps
router.get("/",    getSessions);
router.post("/",   createSession);
router.get("/:id", getSessionById);

module.exports = router;
