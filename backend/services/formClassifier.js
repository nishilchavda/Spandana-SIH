// =============================================================================
// SPANDANA — Form Classifier Service
// =============================================================================
//
// ⚠️  HACKATHON PLACEHOLDER — Rule-Based Classifier (Phase 1)
//
// This module uses hard-coded angle thresholds to flag form issues.
// It intentionally mirrors the threshold constants in the frontend's
// sensorSimulator.ts so the backend and frontend agree on "GOOD/WARNING/DANGER".
//
// Phase 2 (post data-collection) will replace this with a trained ML model
// served from a Python microservice (e.g. FastAPI + scikit-learn/TensorFlow).
// The contract: accept a sensor frame object, return { status, errorType, tip }.
// Swapping this module for a remote inference call is a contained change —
// nothing outside this file needs to change.
//
// Threshold sources:
//   GOOD_TORSO_RANGE    = [5, 22]   (from sensorSimulator.ts)
//   WARN_TORSO_RANGE    = [22, 32]  (from sensorSimulator.ts)
//   DANGER_THRESHOLD    = 32        (from sensorSimulator.ts)
//   KNEE_CAVE_THRESHOLD = 15        (assumption: knee-angle below 15° in peak
//                                    position suggests cave — Phase 2 to refine)
//   SPEED_THRESHOLD     = assessed via consecutive-frame tempo (not available
//                                    per-frame; carried as errorType from caller)
// =============================================================================

/** @typedef {"GOOD"|"WARNING"|"DANGER"} FormStatus */

// ---------------------------------------------------------------------------
// Correction tips — kept in sync with correctionTips in mockData.ts
// ---------------------------------------------------------------------------
const TIPS = {
  forwardLean: "Reduce forward lean — chest up, brace core",
  depth:       "Squat deeper — break parallel on descent",
  speed:       "Slow down — control the eccentric phase",
  kneeCave:    "Push knees out — track over pinky toe",
  neutral:     "Neutral spine — avoid lower-back rounding",
};

// Friendly display names that match the error strings in mockData.ts
const ERROR_NAMES = {
  forwardLean: "Excessive Forward Lean",
  depth:       "Inconsistent Depth",
  speed:       "Too Fast — Concentric Phase",
  kneeCave:    "Knee Cave",
};

// ---------------------------------------------------------------------------
// Thresholds (rule-based — Phase 2 will replace with ML inference)
// ---------------------------------------------------------------------------
// Thresholds derived empirically from Zenodo Squat_1_labeled.csv:
// Torso pitch angles range from ~1.3° (standing) to ~40.3° (deep squat).
const TORSO_GOOD_MAX   = 25; // degrees
const TORSO_WARN_MAX   = 35; // degrees — above this → DANGER
const KNEE_LOW_WARN    = 15; // degrees — very low value at squat peak = possible cave
const HIP_LOW_WARN     = 10; // degrees — very low hip flexion = shallow squat

/**
 * Classify a single sensor frame and return form status + correction tip.
 *
 * @param {{ torsoAngle: number, kneeAngle: number, hipAngle: number }} frame
 * @returns {{ status: FormStatus, errorType: string|null, tip: string|null }}
 */
function classifyFrame(frame) {
  const { torsoAngle, kneeAngle, hipAngle } = frame;

  // --- Forward lean (torso) ---
  if (torsoAngle >= TORSO_WARN_MAX) {
    const tip = Math.floor(torsoAngle) % 2 === 0
      ? TIPS.forwardLean
      : TIPS.neutral;
    return { status: "DANGER", errorType: ERROR_NAMES.forwardLean, tip };
  }
  if (torsoAngle >= TORSO_GOOD_MAX) {
    return { status: "WARNING", errorType: ERROR_NAMES.forwardLean, tip: TIPS.forwardLean };
  }

  // --- Knee cave (knee angle unusually low during a loaded position) ---
  // Only flag if hip angle indicates we're deep in the squat
  if (hipAngle > 30 && kneeAngle < KNEE_LOW_WARN) {
    return { status: "WARNING", errorType: ERROR_NAMES.kneeCave, tip: TIPS.kneeCave };
  }

  // --- Shallow depth (hip angle never goes past threshold) ---
  // Note: hipAngle peaks mid-squat; if it stays low even during descent,
  //       it suggests insufficient depth.
  if (hipAngle < HIP_LOW_WARN && torsoAngle > 10) {
    return { status: "WARNING", errorType: ERROR_NAMES.depth, tip: TIPS.depth };
  }

  // --- All clear ---
  return { status: "GOOD", errorType: null, tip: null };
}

/**
 * Given an array of per-rep error types, compute a formAccuracy score (0–100).
 * Errors weight: GOOD=100, WARNING=60, DANGER=20.
 *
 * @param {Array<{ formStatus: string }>} reps
 * @returns {number} rounded integer 0–100
 */
function computeFormAccuracy(reps) {
  if (!reps.length) return 100;
  const weights = { GOOD: 100, WARNING: 60, DANGER: 20 };
  const sum = reps.reduce((acc, r) => acc + (weights[r.formStatus] ?? 100), 0);
  return Math.round(sum / reps.length);
}

/**
 * Derive the unique error-type strings from an array of reps.
 * Returns the friendly display names, deduped, excluding nulls.
 *
 * @param {Array<{ errorType: string|null }>} reps
 * @returns {string[]}
 */
function extractErrors(reps) {
  const seen = new Set();
  for (const r of reps) {
    if (r.errorType) seen.add(r.errorType);
  }
  return [...seen];
}

module.exports = { classifyFrame, computeFormAccuracy, extractErrors };
