// =============================================================================
// SPANDANA — Analytics Routes
// =============================================================================

const router = require("express").Router();
const {
  getSummary, getErrors, getTrend, getSuggestions,
} = require("../controllers/analyticsController");

// GET /api/analytics/summary  → summaryStats shape
// GET /api/analytics/errors   → errorBreakdown[] shape
// GET /api/analytics/trend    → formAccuracyTrend[] shape
router.get("/summary", getSummary);
router.get("/errors",  getErrors);
router.get("/trend",   getTrend);

// GET /api/suggestions  (mounted at root level, not under /analytics)
// exported separately so the router can mount it at the right path.
module.exports = { analyticsRouter: router, getSuggestions };
