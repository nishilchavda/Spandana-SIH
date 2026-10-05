// =============================================================================
// SPANDANA — Mock Data Module
// =============================================================================
// All data in this file is PLACEHOLDER / MOCK data for the UI demo.
// To replace with real data:
//   - Historical session data → fetch from GET /api/sessions
//   - Real-time sensor data   → subscribe to Socket.io "sensor-frame" events
//   - AI suggestions          → fetch from GET /api/suggestions
// =============================================================================

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export type FormStatus = "GOOD" | "WARNING" | "DANGER";

export interface WorkoutSession {
  id: string;
  date: string;          // ISO date string
  exercise: string;
  totalReps: number;
  formAccuracy: number;  // 0-100%
  duration: number;      // seconds
  errors: string[];
}

export interface ErrorBreakdown {
  name: string;
  count: number;
  color: string;
}

export interface AISuggestion {
  id: string;
  iconKey: string;  // Mapped to a Lucide icon in the UI component (was: emoji string)
  text: string;
  priority: "high" | "medium" | "low";
}

export interface LiveSensorFrame {
  timestamp: number;
  torsoAngle: number;  // degrees from vertical
  kneeAngle: number;
  hipAngle: number;
  status: FormStatus;
  tip: string | null;
}

// ---------------------------------------------------------------------------
// Historical Session Data  (mock: replace with GET /api/sessions)
// ---------------------------------------------------------------------------

export const mockSessions: WorkoutSession[] = [
  {
    id: "s-001",
    date: "2026-09-16",
    exercise: "Barbell Squat",
    totalReps: 32,
    formAccuracy: 74,
    duration: 1240,
    errors: ["Excessive Forward Lean", "Inconsistent Depth"],
  },
  {
    id: "s-002",
    date: "2026-09-18",
    exercise: "Barbell Squat",
    totalReps: 28,
    formAccuracy: 81,
    duration: 1080,
    errors: ["Excessive Forward Lean"],
  },
  {
    id: "s-003",
    date: "2026-09-19",
    exercise: "Romanian Deadlift",
    totalReps: 24,
    formAccuracy: 88,
    duration: 900,
    errors: ["Too Fast — Concentric Phase"],
  },
  {
    id: "s-004",
    date: "2026-09-21",
    exercise: "Barbell Squat",
    totalReps: 36,
    formAccuracy: 79,
    duration: 1380,
    errors: ["Inconsistent Depth", "Knee Cave"],
  },
  {
    id: "s-005",
    date: "2026-09-22",
    exercise: "Overhead Press",
    totalReps: 20,
    formAccuracy: 91,
    duration: 720,
    errors: [],
  },
  {
    id: "s-006",
    date: "2026-09-24",
    exercise: "Barbell Squat",
    totalReps: 40,
    formAccuracy: 83,
    duration: 1500,
    errors: ["Excessive Forward Lean"],
  },
  {
    id: "s-007",
    date: "2026-09-25",
    exercise: "Romanian Deadlift",
    totalReps: 28,
    formAccuracy: 85,
    duration: 1020,
    errors: ["Too Fast — Concentric Phase"],
  },
  {
    id: "s-008",
    date: "2026-09-26",
    exercise: "Barbell Squat",
    totalReps: 44,
    formAccuracy: 89,
    duration: 1620,
    errors: ["Inconsistent Depth"],
  },
  {
    id: "s-009",
    date: "2026-09-27",
    exercise: "Overhead Press",
    totalReps: 24,
    formAccuracy: 93,
    duration: 840,
    errors: [],
  },
  {
    id: "s-010",
    date: "2026-09-28",
    exercise: "Barbell Squat",
    totalReps: 40,
    formAccuracy: 87,
    duration: 1440,
    errors: ["Excessive Forward Lean"],
  },
  {
    id: "s-011",
    date: "2026-09-29",
    exercise: "Romanian Deadlift",
    totalReps: 32,
    formAccuracy: 92,
    duration: 1200,
    errors: [],
  },
];

// ---------------------------------------------------------------------------
// Form Accuracy Trend  (for line/area chart)
// ---------------------------------------------------------------------------

export const formAccuracyTrend = mockSessions.map((s, i) => ({
  session: `S${i + 1}`,
  date: s.date.slice(5),
  accuracy: s.formAccuracy,
  exercise: s.exercise,
}));

// ---------------------------------------------------------------------------
// Error Breakdown  (mock: replace with GET /api/analytics/errors)
// ---------------------------------------------------------------------------

export const errorBreakdown: ErrorBreakdown[] = [
  { name: "Excessive Lean",     count: 5, color: "#ef4444" },
  { name: "Inconsistent Depth", count: 3, color: "#f59e0b" },
  { name: "Too Fast",           count: 2, color: "#8b5cf6" },
  { name: "Knee Cave",          count: 1, color: "#ec4899" },
  { name: "Good Form",          count: 2, color: "#22c55e" },
];

// ---------------------------------------------------------------------------
// Summary Stats  (mock: replace with GET /api/analytics/summary)
// ---------------------------------------------------------------------------

export const summaryStats = {
  totalSessions: mockSessions.length,
  totalReps: mockSessions.reduce((acc, s) => acc + s.totalReps, 0),
  avgFormAccuracy: Math.round(
    mockSessions.reduce((acc, s) => acc + s.formAccuracy, 0) / mockSessions.length
  ),
  bestSession: mockSessions.reduce((best, s) =>
    s.formAccuracy > best.formAccuracy ? s : best
  ),
  streak: 5,
};

// ---------------------------------------------------------------------------
// AI Suggestions  (mock: replace with GET /api/suggestions)
// ---------------------------------------------------------------------------

export const aiSuggestions: AISuggestion[] = [
  {
    id: "ai-001",
    iconKey: "target",
    text: "Your form degrades after rep 8 — try reducing set length to 6–7 reps until torso stability improves.",
    priority: "high",
  },
  {
    id: "ai-002",
    iconKey: "zap",
    text: "Concentric phase is 34% faster than optimal. Slowing down will increase time-under-tension and reduce injury risk.",
    priority: "medium",
  },
  {
    id: "ai-003",
    iconKey: "trending-up",
    text: "You've improved form accuracy by 13% over the last 7 sessions. Keep consistent rest between sets (≥90s).",
    priority: "low",
  },
  {
    id: "ai-004",
    iconKey: "activity",
    text: "Inconsistent squat depth detected — focus on ankle mobility. Consider heel elevation until flexibility improves.",
    priority: "medium",
  },
];

// ---------------------------------------------------------------------------
// Form Correction Tips  (used by the live sensor simulator)
// ---------------------------------------------------------------------------

export const correctionTips: Record<string, string> = {
  forwardLean: "Reduce forward lean — chest up, brace core",
  depth:        "Squat deeper — break parallel on descent",
  speed:        "Slow down — control the eccentric phase",
  kneeCave:     "Push knees out — track over pinky toe",
  neutral:      "Neutral spine — avoid lower-back rounding",
};
