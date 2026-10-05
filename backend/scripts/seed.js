// =============================================================================
// SPANDANA — Seed Script
// =============================================================================
// Populates MongoDB with a realistic set of past sessions so the dashboard
// looks populated on first run.
//
// Usage:  node scripts/seed.js
//         (from the /server directory, with .env configured)
// =============================================================================

require("dotenv").config({ path: require("path").join(__dirname, "../.env") });

const mongoose = require("mongoose");
const Session  = require("../models/Session");
const Rep      = require("../models/Rep");

const MONGO_URI = process.env.MONGODB_URI || "mongodb://localhost:27017/spandana";

// ---------------------------------------------------------------------------
// Seed Data — mirrors the mockSessions array from mockData.ts but uses
// dates relative to "today" so the streak / trend logic stays current.
// ---------------------------------------------------------------------------
const EXERCISES   = ["Barbell Squat", "Romanian Deadlift", "Overhead Press"];
const ERROR_POOL  = [
  "Excessive Forward Lean",
  "Inconsistent Depth",
  "Too Fast — Concentric Phase",
  "Knee Cave",
];

function daysAgo(n) {
  const d = new Date();
  d.setDate(d.getDate() - n);
  return d.toISOString().slice(0, 10);
}

function rand(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function pick(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

// Build 15 varied sessions across the last 3 weeks
const SESSION_TEMPLATES = [
  // Day offset, exercise, totalReps, formAccuracy, duration, errors
  [19, "Barbell Squat",     32, 74, 1240, ["Excessive Forward Lean", "Inconsistent Depth"]],
  [17, "Barbell Squat",     28, 81, 1080, ["Excessive Forward Lean"]],
  [16, "Romanian Deadlift", 24, 88,  900, ["Too Fast — Concentric Phase"]],
  [14, "Barbell Squat",     36, 79, 1380, ["Inconsistent Depth", "Knee Cave"]],
  [13, "Overhead Press",    20, 91,  720, []],
  [11, "Barbell Squat",     40, 83, 1500, ["Excessive Forward Lean"]],
  [10, "Romanian Deadlift", 28, 85, 1020, ["Too Fast — Concentric Phase"]],
  [ 9, "Barbell Squat",     44, 89, 1620, ["Inconsistent Depth"]],
  [ 8, "Overhead Press",    24, 93,  840, []],
  [ 7, "Barbell Squat",     40, 87, 1440, ["Excessive Forward Lean"]],
  [ 6, "Romanian Deadlift", 32, 92, 1200, []],
  [ 5, "Barbell Squat",     36, 85, 1320, ["Inconsistent Depth"]],
  [ 3, "Overhead Press",    22, 95,  780, []],
  [ 2, "Barbell Squat",     44, 90, 1560, ["Excessive Forward Lean"]],
  [ 1, "Romanian Deadlift", 28, 94, 1080, []],
];

async function buildRepDocs(sessionId, totalReps, formAccuracy, errors) {
  const reps = [];
  for (let i = 1; i <= totalReps; i++) {
    // Distribute errors roughly proportional to the session's accuracy
    const errorChance = 1 - formAccuracy / 100;
    const hasError    = Math.random() < errorChance && errors.length > 0;
    const errorType   = hasError ? pick(errors) : null;
    const formStatus  = !hasError ? "GOOD" : errorChance > 0.3 ? "DANGER" : "WARNING";

    reps.push({
      sessionId,
      repNumber:  i,
      torsoAngle: rand(8, hasError ? 38 : 22),
      kneeAngle:  rand(20, 85),
      hipAngle:   rand(15, 70),
      timestamp:  i * 3000, // ~3s per rep
      formStatus,
      errorType,
    });
  }
  return reps;
}

async function seed() {
  await mongoose.connect(MONGO_URI);
  console.log("[seed] Connected to MongoDB");

  // Clear existing data
  await Session.deleteMany({});
  await Rep.deleteMany({});
  console.log("[seed] Cleared existing sessions and reps");

  for (const [daysOffset, exercise, totalReps, formAccuracy, duration, errors] of SESSION_TEMPLATES) {
    // Build error counts map
    const errorCounts = {};
    for (const e of errors) errorCounts[e] = (errorCounts[e] ?? 0) + 1;

    const session = await Session.create({
      date:         daysAgo(daysOffset),
      exercise,
      totalReps,
      formAccuracy,
      duration,
      errors,
      errorCounts,
      isLive:       false,
    });

    const repDocs = await buildRepDocs(session._id, totalReps, formAccuracy, errors);
    await Rep.insertMany(repDocs);

    console.log(`[seed]  ✓ ${exercise} on ${daysAgo(daysOffset)} — ${totalReps} reps, ${formAccuracy}% accuracy`);
  }

  console.log(`\n[seed] Done — ${SESSION_TEMPLATES.length} sessions, ${SESSION_TEMPLATES.reduce((a, t) => a + t[2], 0)} total reps seeded.\n`);
  await mongoose.disconnect();
}

seed().catch((err) => {
  console.error("[seed] Error:", err.message);
  process.exit(1);
});
