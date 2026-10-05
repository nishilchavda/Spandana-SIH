// =============================================================================
// SPANDANA — Analytics Controller
// =============================================================================
// Endpoints match the annotated mocks in mockData.ts:
//
//   GET /api/analytics/summary  → summaryStats shape
//   GET /api/analytics/errors   → errorBreakdown[] shape
//   GET /api/analytics/trend    → formAccuracyTrend[] shape
//   GET /api/suggestions        → aiSuggestions[] shape (static for Phase 1)
// =============================================================================

const Session = require("../models/Session");

// ---------------------------------------------------------------------------
// GET /api/analytics/summary
// Matches summaryStats from mockData.ts:
//   { totalSessions, totalReps, avgFormAccuracy, bestSession, streak }
// ---------------------------------------------------------------------------
async function getSummary(req, res) {
  try {
    const sessions = await Session.find().sort({ date: 1 });

    if (!sessions.length) {
      return res.json({
        totalSessions:   0,
        totalReps:       0,
        avgFormAccuracy: 0,
        bestSession:     null,
        streak:          0,
      });
    }

    const totalReps       = sessions.reduce((a, s) => a + s.totalReps, 0);
    const avgFormAccuracy = Math.round(
      sessions.reduce((a, s) => a + s.formAccuracy, 0) / sessions.length
    );
    const bestSession = sessions.reduce((best, s) =>
      s.formAccuracy > best.formAccuracy ? s : best
    );

    // Simple streak: count consecutive days up to today with at least 1 session
    const dateSet  = new Set(sessions.map((s) => s.date));
    let streak     = 0;
    const today    = new Date();
    for (let i = 0; i < 365; i++) {
      const d = new Date(today);
      d.setDate(today.getDate() - i);
      const key = d.toISOString().slice(0, 10);
      if (dateSet.has(key)) streak++;
      else if (i > 0) break; // gap — stop counting
    }

    res.json({
      totalSessions:   sessions.length,
      totalReps,
      avgFormAccuracy,
      bestSession:     bestSession.toJSON(),
      streak,
    });
  } catch (err) {
    console.error("[analytics] getSummary:", err.message);
    res.status(500).json({ error: "Server error" });
  }
}

// ---------------------------------------------------------------------------
// GET /api/analytics/errors
// Matches errorBreakdown[] from mockData.ts:
//   [{ name, count, color }]
// Colors are static — they're presentation concerns, kept consistent with mock.
// ---------------------------------------------------------------------------
const ERROR_COLORS = {
  "Excessive Forward Lean": "#ef4444",
  "Inconsistent Depth":     "#f59e0b",
  "Too Fast — Concentric Phase": "#8b5cf6",
  "Knee Cave":              "#ec4899",
  "Good Form":              "#22c55e",
};

async function getErrors(req, res) {
  try {
    const sessions = await Session.find();

    // Tally error counts across all sessions
    const counts = {};
    let goodSessions = 0;
    for (const s of sessions) {
      if (!s.errors.length) { goodSessions++; continue; }
      for (const err of s.errors) {
        counts[err] = (counts[err] ?? 0) + 1;
      }
    }

    const breakdown = Object.entries(counts).map(([name, count]) => ({
      name,
      count,
      color: ERROR_COLORS[name] ?? "#6b7280",
    }));

    if (goodSessions > 0) {
      breakdown.push({ name: "Good Form", count: goodSessions, color: "#22c55e" });
    }

    res.json(breakdown);
  } catch (err) {
    console.error("[analytics] getErrors:", err.message);
    res.status(500).json({ error: "Server error" });
  }
}

// ---------------------------------------------------------------------------
// GET /api/analytics/trend
// Matches formAccuracyTrend[] from mockData.ts:
//   [{ session, date, accuracy, exercise }]
// ---------------------------------------------------------------------------
async function getTrend(req, res) {
  try {
    const sessions = await Session.find().sort({ date: 1 });
    const trend = sessions.map((s, i) => ({
      session:  `S${i + 1}`,
      date:     s.date.slice(5), // MM-DD
      accuracy: s.formAccuracy,
      exercise: s.exercise,
    }));
    res.json(trend);
  } catch (err) {
    console.error("[analytics] getTrend:", err.message);
    res.status(500).json({ error: "Server error" });
  }
}

// ---------------------------------------------------------------------------
// GET /api/suggestions
// Matches aiSuggestions[] from mockData.ts.
// Phase 1: static rule-based suggestions derived from session analytics.
// Phase 2: replace with ML-generated suggestions from Python microservice.
// ---------------------------------------------------------------------------
async function getSuggestions(req, res) {
  try {
    const sessions = await Session.find().sort({ date: -1 }).limit(10);

    // Build dynamic suggestions from real data
    const suggestions = [];

    if (sessions.length > 0) {
      // Check for forward lean trend
      const leanSessions = sessions.filter((s) =>
        s.errors.includes("Excessive Forward Lean")
      );
      if (leanSessions.length >= 2) {
        suggestions.push({
          id:       "ai-001",
          iconKey:  "target",
          text:     `Your form degrades after rep 8 — try reducing set length to 6–7 reps until torso stability improves.`,
          priority: "high",
        });
      }

      // Check for speed errors
      const speedSessions = sessions.filter((s) =>
        s.errors.includes("Too Fast — Concentric Phase")
      );
      if (speedSessions.length >= 1) {
        suggestions.push({
          id:       "ai-002",
          iconKey:  "zap",
          text:     `Concentric phase is too fast. Slowing down increases time-under-tension and reduces injury risk.`,
          priority: "medium",
        });
      }

      // Accuracy improvement trend
      if (sessions.length >= 3) {
        const oldest = sessions[sessions.length - 1].formAccuracy;
        const newest = sessions[0].formAccuracy;
        if (newest > oldest) {
          suggestions.push({
            id:       "ai-003",
            iconKey:  "trending-up",
            text:     `You've improved form accuracy by ${newest - oldest}% over recent sessions. Keep consistent rest between sets (≥90s).`,
            priority: "low",
          });
        }
      }

      // Depth errors
      const depthSessions = sessions.filter((s) =>
        s.errors.includes("Inconsistent Depth")
      );
      if (depthSessions.length >= 1) {
        suggestions.push({
          id:       "ai-004",
          iconKey:  "activity",
          text:     `Inconsistent squat depth detected — focus on ankle mobility. Consider heel elevation until flexibility improves.`,
          priority: "medium",
        });
      }
    }

    // Always return at least the default static tips if no real data yet
    if (!suggestions.length) {
      suggestions.push(
        {
          id:       "ai-001",
          iconKey:  "target",
          text:     "Complete a few sessions so SPANDANA can personalise your insights.",
          priority: "low",
        }
      );
    }

    res.json(suggestions);
  } catch (err) {
    console.error("[analytics] getSuggestions:", err.message);
    res.status(500).json({ error: "Server error" });
  }
}

module.exports = { getSummary, getErrors, getTrend, getSuggestions };
