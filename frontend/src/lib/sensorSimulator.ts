// =============================================================================
// SPANDANA — Sensor Simulator Module
// =============================================================================
// This module generates semi-realistic IMU sensor data with gaussian noise
// to simulate a wearable device during a squat workout.
//
// HOW THE REAL BACKEND IS CONNECTED:
//   When NEXT_PUBLIC_SOCKET_URL is set in .env.local, this module
//   automatically connects to the Socket.io server and streams live data
//   from there instead of running the client-side simulation.
//
//   The backend emits the SAME "sensor-frame" event with the SAME
//   LiveSensorFrame shape, so the rest of the UI is unchanged.
//
//   Fallback: if NEXT_PUBLIC_SOCKET_URL is not set (or the server is
//   unreachable), the client-side simulation runs automatically —
//   keeping the demo safe even without a backend during judging.
// =============================================================================

import type { FormStatus, LiveSensorFrame } from "./mockData";
import { correctionTips } from "./mockData";

// ---------------------------------------------------------------------------
// Constants — tweak these to match real exercise parameters
// ---------------------------------------------------------------------------

const SQUAT_CYCLE_MS = 3000;          // full squat cycle duration
const NOISE_AMPLITUDE = 2.5;          // degrees of sensor noise
// Threshold values — kept in sync with server/services/formClassifier.js
const WARN_TORSO_MIN       = 22;      // ≥22° = WARNING zone
const DANGER_TORSO_THRESHOLD = 32;    // ≥32° = correction needed

// ---------------------------------------------------------------------------
// Utility: Box-Muller gaussian noise
// ---------------------------------------------------------------------------

function gaussianNoise(mean: number, stddev: number): number {
  const u1 = Math.random();
  const u2 = Math.random();
  const z = Math.sqrt(-2 * Math.log(u1)) * Math.cos(2 * Math.PI * u2);
  return mean + z * stddev;
}

// ---------------------------------------------------------------------------
// Simulated squat waveform — returns torso angle at a given time t (ms)
// Mimics real sensor by adding smooth sinusoidal motion + gaussian noise
// ---------------------------------------------------------------------------

function simulateTorsoAngle(t: number, setFatigue: number): number {
  // Base movement: squat down and up
  const cycle = (t % SQUAT_CYCLE_MS) / SQUAT_CYCLE_MS; // 0-1
  // Asymmetric curve: fast up, slow down
  const phase = cycle < 0.55
    ? Math.sin(cycle * Math.PI / 0.55)  // descend & bottom
    : Math.sin((1 - cycle) * Math.PI / 0.45);  // ascend

  // Base angle: 8° at top, peaks at 25° during squat
  const baseAngle = 8 + phase * 17;

  // Fatigue increases forward lean over time
  const fatigueOffset = setFatigue * 6;

  // Add sensor noise
  return gaussianNoise(baseAngle + fatigueOffset, NOISE_AMPLITUDE);
}

function simulateKneeAngle(t: number): number {
  const cycle = (t % SQUAT_CYCLE_MS) / SQUAT_CYCLE_MS;
  const phase = cycle < 0.55
    ? Math.sin(cycle * Math.PI / 0.55)
    : Math.sin((1 - cycle) * Math.PI / 0.45);
  return gaussianNoise(10 + phase * 80, 3);
}

function simulateHipAngle(t: number): number {
  const cycle = (t % SQUAT_CYCLE_MS) / SQUAT_CYCLE_MS;
  const phase = cycle < 0.55
    ? Math.sin(cycle * Math.PI / 0.55)
    : Math.sin((1 - cycle) * Math.PI / 0.45);
  return gaussianNoise(5 + phase * 65, 3);
}

// ---------------------------------------------------------------------------
// Determine form status from angle values
// ---------------------------------------------------------------------------

function getFormStatus(torso: number): { status: FormStatus; tip: string | null } {
  if (torso >= DANGER_TORSO_THRESHOLD) {
    // Pick a tip based on severity (deterministic from angle for stable display)
    const tips = [correctionTips.forwardLean, correctionTips.neutral];
    return { status: "DANGER", tip: tips[Math.floor(torso) % tips.length] };
  }
  if (torso >= WARN_TORSO_MIN) {
    return { status: "WARNING", tip: correctionTips.forwardLean };
  }
  return { status: "GOOD", tip: null };
}

// ---------------------------------------------------------------------------
// Rep detector — detects a full squat cycle
// ---------------------------------------------------------------------------

let _prevAngle = 0;
let _inDescent = false;
let _repCounter = 0;

function detectRep(torso: number): number {
  const peak = torso > 20;
  if (peak && !_inDescent) {
    _inDescent = true;
  } else if (!peak && _inDescent) {
    _inDescent = false;
    _repCounter++;
  }
  _prevAngle = torso;
  return _repCounter;
}

// ---------------------------------------------------------------------------
// Main: Start sensor simulation
// ---------------------------------------------------------------------------

export interface SensorCallbacks {
  onFrame: (frame: LiveSensorFrame) => void;
  onRepCount: (count: number) => void;
}

/**
 * Starts the sensor data stream.
 *
 * If NEXT_PUBLIC_SOCKET_URL is set, connects to the backend Socket.io server
 * and receives real (server-simulated) sensor frames.
 *
 * Falls back to the client-side simulation if the env var is not set or if
 * the socket.io-client package is unavailable (keeps the demo safe during
 * judging without a running backend).
 *
 * Returns a cleanup function — call it in useEffect's return.
 */
export function startSensorSimulation(
  callbacks: SensorCallbacks,
  intervalMs = 100  // ~10 Hz, matching real IMU polling rate
): () => void {
  const socketUrl = process.env.NEXT_PUBLIC_SOCKET_URL;

  // ---------------------------------------------------------------------------
  // REAL BACKEND PATH: connect to Socket.io server
  // ---------------------------------------------------------------------------
  if (socketUrl) {
    let socket: ReturnType<typeof import("socket.io-client").io> | null = null;
    let connected = false;

    // Dynamic import so the bundle doesn't fail if socket.io-client isn't installed
    import("socket.io-client")
      .then(({ io }) => {
        socket = io(socketUrl, {
          transports: ["websocket", "polling"],
          reconnectionAttempts: 3,
          timeout: 5000,
        });

        socket.on("connect", () => {
          connected = true;
          // Ask the server to start streaming
          socket!.emit("start-session", { exercise: "Barbell Squat" });
        });

        // Drop-in: same event name and LiveSensorFrame shape as backend emits
        socket.on("sensor-frame", (frame: LiveSensorFrame) => {
          callbacks.onFrame(frame);
        });

        socket.on("rep-count", (count: number) => {
          callbacks.onRepCount(count);
        });

        socket.on("connect_error", (err: Error) => {
          console.warn("[sensorSimulator] Socket.io connect error — falling back to mock:", err.message);
          if (socket) { socket.disconnect(); socket = null; }
          if (!connected) startMockSimulation(callbacks, intervalMs);
        });
      })
      .catch(() => {
        // socket.io-client not installed — fall back silently
        startMockSimulation(callbacks, intervalMs);
      });

    return () => {
      if (socket) {
        socket.emit("stop-session");
        socket.disconnect();
        socket = null;
      }
    };
  }

  // ---------------------------------------------------------------------------
  // FALLBACK PATH: client-side mock simulation (original behavior)
  // ---------------------------------------------------------------------------
  return startMockSimulation(callbacks, intervalMs);
}

/**
 * Original client-side simulation loop (fallback / offline mode).
 * Kept intact so the demo works without any backend.
 */
function startMockSimulation(
  callbacks: SensorCallbacks,
  intervalMs = 100
): () => void {
  const startTime = Date.now();

  // Reset rep state when new simulation starts
  _repCounter = 0;
  _inDescent = false;

  const intervalId = setInterval(() => {
    const elapsed = Date.now() - startTime;

    // Fatigue model: increases gradually after 45s, resets on a new "set"
    const setDuration = 45000; // 45-second mock set
    const setProgress = (elapsed % setDuration) / setDuration;
    const fatigue = Math.max(0, setProgress - 0.5) * 2; // 0 → 1 in the back half

    const torso = simulateTorsoAngle(elapsed, fatigue);
    const knee  = simulateKneeAngle(elapsed);
    const hip   = simulateHipAngle(elapsed);
    const reps  = detectRep(torso);
    const { status, tip } = getFormStatus(torso);

    const frame: LiveSensorFrame = {
      timestamp: elapsed,
      torsoAngle: Math.round(torso * 10) / 10,
      kneeAngle:  Math.round(knee * 10) / 10,
      hipAngle:   Math.round(hip * 10) / 10,
      status,
      tip,
    };

    callbacks.onFrame(frame);
    callbacks.onRepCount(reps);
  }, intervalMs);

  // Cleanup: clears interval. Replace with socket.disconnect() for real data.
  return () => clearInterval(intervalId);
}
