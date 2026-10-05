// =============================================================================
// SPANDANA — Sessions Controller
// =============================================================================
// Endpoints must return data matching the WorkoutSession interface in
// mockData.ts so the frontend can drop in these calls with no type changes.
//
// WorkoutSession shape:
//   { id, date, exercise, totalReps, formAccuracy, duration, errors }
// =============================================================================

const Session = require("../models/Session");
const Rep     = require("../models/Rep");

// ---------------------------------------------------------------------------
// GET /api/sessions
// Returns all sessions, newest first.
// Optional query: ?limit=N
// ---------------------------------------------------------------------------
async function getSessions(req, res) {
  try {
    const limit = parseInt(req.query.limit) || 100;
    const sessions = await Session.find()
      .sort({ createdAt: -1 })
      .limit(limit);
    res.json(sessions);
  } catch (err) {
    console.error("[sessions] getSessions:", err.message);
    res.status(500).json({ error: "Server error" });
  }
}

// ---------------------------------------------------------------------------
// GET /api/sessions/:id
// Returns a single session with its reps array.
// ---------------------------------------------------------------------------
async function getSessionById(req, res) {
  try {
    const session = await Session.findById(req.params.id);
    if (!session) return res.status(404).json({ error: "Session not found" });

    const reps = await Rep.find({ sessionId: session._id }).sort({ repNumber: 1 });
    res.json({ ...session.toJSON(), reps });
  } catch (err) {
    console.error("[sessions] getSessionById:", err.message);
    res.status(500).json({ error: "Server error" });
  }
}

// ---------------------------------------------------------------------------
// POST /api/sessions
// Manually create a session (used by seed script / direct POST).
// Body matches WorkoutSession minus id.
// ---------------------------------------------------------------------------
async function createSession(req, res) {
  try {
    const { date, exercise, totalReps, formAccuracy, duration, errors } = req.body;
    if (!date || !exercise) {
      return res.status(400).json({ error: "date and exercise are required" });
    }
    const session = await Session.create({
      date, exercise,
      totalReps:    totalReps    ?? 0,
      formAccuracy: formAccuracy ?? 100,
      duration:     duration     ?? 0,
      errors:       errors       ?? [],
    });
    res.status(201).json(session);
  } catch (err) {
    console.error("[sessions] createSession:", err.message);
    res.status(500).json({ error: "Server error" });
  }
}

module.exports = { getSessions, getSessionById, createSession };
