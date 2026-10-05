// =============================================================================
// SPANDANA — Rep Model
// =============================================================================
// A Rep represents a single detected repetition within a workout Session.
// Fields are derived from the LiveSensorFrame shape in sensorSimulator.ts plus
// additional classification metadata from the form-classifier service.
// =============================================================================

const mongoose = require("mongoose");

const repSchema = new mongoose.Schema(
  {
    sessionId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Session",
      required: true,
      index: true,
    },
    // Rep number within the session (1-based)
    repNumber: { type: Number, required: true },

    // Sensor readings at the point the rep was detected
    // (peak torso angle during the rep cycle — most meaningful reading)
    torsoAngle: { type: Number, required: true }, // degrees from vertical
    kneeAngle:  { type: Number, required: true }, // degrees
    hipAngle:   { type: Number, required: true }, // degrees

    // Elapsed ms since session start when rep was detected
    timestamp: { type: Number, required: true },

    // Form classification output
    formStatus: {
      type: String,
      enum: ["GOOD", "WARNING", "DANGER"],
      required: true,
    },
    // Human-readable correction tip (null when formStatus === "GOOD")
    errorType: { type: String, default: null },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Rep", repSchema);
