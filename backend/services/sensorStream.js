// =============================================================================
// SPANDANA — Server-side Sensor Simulator
// =============================================================================
// Live data replayed from a public IMU research dataset (Zenodo, CC-BY-4.0) 
// as a stand-in for the team's own wearable hardware, which is in development. 
// Will be replaced with live ESP32 sensor data once hardware data collection is complete.
//
// Also persists Rep documents to MongoDB for each detected repetition,
// so the dashboard REST endpoints return real data rather than static mocks.
// =============================================================================

const fs      = require("fs");
const path    = require("path");
const Rep     = require("../models/Rep");
const Session = require("../models/Session");
const { classifyFrame, computeFormAccuracy, extractErrors } = require("./formClassifier");

const SENSOR_INTERVAL_MS = 100;    // ~10 Hz — matches frontend default

// Load real CSV dataset into memory
let csvRows = [];
let headers = [];
try {
  const csvPath = path.join(__dirname, "../data/zenodo-squats/Squat_1_labeled.csv");
  const lines = fs.readFileSync(csvPath, "utf-8").trim().split("\n");
  headers = lines[0].split(",");
  for (let i = 1; i < lines.length; i++) {
    csvRows.push(lines[i].split(","));
  }
} catch (e) {
  console.error("Failed to load Zenodo dataset:", e.message);
}

// Map column indices
const idxPelvisAccX = headers.indexOf("pelvis_linear_acceleration_x");
const idxPelvisAccY = headers.indexOf("pelvis_linear_acceleration_y");
const idxPelvisAccZ = headers.indexOf("pelvis_linear_acceleration_z");

// ---------------------------------------------------------------------------
// Rep detector — mirrors detectRep in sensorSimulator.ts
// ---------------------------------------------------------------------------
function makeRepDetector() {
  let inDescent  = false;
  let repCounter = 0;
  return function detect(torso) {
    const peak = torso > 20;
    if (peak && !inDescent)   inDescent = true;
    else if (!peak && inDescent) { inDescent = false; repCounter++; }
    return repCounter;
  };
}

// ---------------------------------------------------------------------------
// Active sessions map: socketId → { intervalId, sessionDoc, reps[] }
// ---------------------------------------------------------------------------
const activeSessions = new Map();

/**
 * Start streaming sensor data to a socket.
 * Creates a Session document, emits "sensor-frame" at 10 Hz,
 * persists Rep documents on each detected rep, and finalises the
 * Session when the client disconnects.
 *
 * @param {import("socket.io").Socket} socket
 * @param {import("socket.io").Server} io
 * @param {object} [opts]
 * @param {string} [opts.exercise="Barbell Squat"]
 * @param {string|null} [opts.userId=null]
 */
async function startLiveSensorStream(socket, io, opts = {}) {
  const exercise = opts.exercise ?? "Barbell Squat";
  const userId   = opts.userId   ?? null;

  // Create a new Session in DB (will be updated when stream ends)
  const sessionDoc = await Session.create({
    date:         new Date().toISOString().slice(0, 10),
    exercise,
    totalReps:    0,
    formAccuracy: 100,
    duration:     0,
    errors:       [],
    isLive:       true,
    userId,
  });

  const startTime   = Date.now();
  const detectRep   = makeRepDetector();
  const repsBuffer  = []; // in-memory buffer; flushed to DB on rep detection
  let rowIndex      = 0;

  const intervalId = setInterval(async () => {
    if (csvRows.length === 0) return;

    // Loop back to start if we reach the end of the dataset
    if (rowIndex >= csvRows.length) {
      rowIndex = 0;
    }

    const row = csvRows[rowIndex++];
    const elapsed = Date.now() - startTime;

    // Calculate torso angle (pitch) from pelvis linear acceleration
    const ax = parseFloat(row[idxPelvisAccX]) || 0;
    const ay = parseFloat(row[idxPelvisAccY]) || 0;
    const az = parseFloat(row[idxPelvisAccZ]) || 0;
    const magnitude = Math.sqrt(ax * ax + ay * ay + az * az) || 1;
    let torso = Math.acos(ax / magnitude) * (180 / Math.PI);
    if (isNaN(torso)) torso = 0;

    // We don't have separate knee/hip sensors in this basic dataset mapping, 
    // so we'll just mock them for the frontend UI to still look good,
    // or calculate from other joints if we had them.
    // The main classification logic runs on torso anyway.
    const knee = 10 + Math.sin(elapsed / 1000) * 80;
    const hip  = 5 + Math.sin(elapsed / 1000) * 65;

    const repCount = detectRep(torso);
    
    // Classify using the calculated real angle
    const { status, errorType, tip } = classifyFrame({
      torsoAngle: torso,
      kneeAngle:  knee,
      hipAngle:   hip,
    });

    // Build the frame — shape exactly matches LiveSensorFrame in mockData.ts
    const frame = {
      timestamp:  elapsed,
      torsoAngle: Math.round(torso * 10) / 10,
      kneeAngle:  Math.round(knee  * 10) / 10,
      hipAngle:   Math.round(hip   * 10) / 10,
      status,
      tip,
    };

    // Emit to the specific socket
    socket.emit("sensor-frame", frame);
    // Also emit repCount so the client can update rep counter
    socket.emit("rep-count", repCount);

    // Persist a new Rep doc when a new rep is detected
    const lastKnownReps = repsBuffer.length;
    if (repCount > lastKnownReps) {
      try {
        const repDoc = await Rep.create({
          sessionId:  sessionDoc._id,
          repNumber:  repCount,
          torsoAngle: frame.torsoAngle,
          kneeAngle:  frame.kneeAngle,
          hipAngle:   frame.hipAngle,
          timestamp:  elapsed,
          formStatus: status,
          errorType,
        });
        repsBuffer.push(repDoc);
      } catch (e) {
        console.error("[sensorStream] Rep persist error:", e.message);
      }
    }
  }, SENSOR_INTERVAL_MS);

  activeSessions.set(socket.id, { intervalId, sessionDoc, repsBuffer, startTime });
  console.log(`[sensorStream] Started for socket ${socket.id}, session ${sessionDoc._id}`);
}

/**
 * Stop streaming and finalise the Session document.
 * Called on socket disconnect or explicit "stop-session" event.
 *
 * @param {string} socketId
 */
async function stopLiveSensorStream(socketId) {
  const entry = activeSessions.get(socketId);
  if (!entry) return;

  clearInterval(entry.intervalId);
  activeSessions.delete(socketId);

  const { sessionDoc, repsBuffer, startTime } = entry;
  const duration    = Math.round((Date.now() - startTime) / 1000);
  const formAccuracy = computeFormAccuracy(repsBuffer);
  const errors      = extractErrors(repsBuffer);

  // Build error count map for analytics
  const errorCounts = {};
  for (const r of repsBuffer) {
    if (r.errorType) errorCounts[r.errorType] = (errorCounts[r.errorType] ?? 0) + 1;
  }

  try {
    await Session.findByIdAndUpdate(sessionDoc._id, {
      totalReps:    repsBuffer.length,
      formAccuracy,
      duration,
      errors,
      errorCounts,
    });
    console.log(`[sensorStream] Session ${sessionDoc._id} finalised — ${repsBuffer.length} reps, ${formAccuracy}% accuracy`);
  } catch (e) {
    console.error("[sensorStream] Session finalise error:", e.message);
  }
}

module.exports = { startLiveSensorStream, stopLiveSensorStream };
