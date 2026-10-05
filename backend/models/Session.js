// =============================================================================
// SPANDANA — Session Model
// =============================================================================
// A Session corresponds to one workout set / recording session.
// Field names exactly match the WorkoutSession interface in mockData.ts so
// REST responses are drop-in compatible with the frontend's existing types.
// =============================================================================

const mongoose = require("mongoose");

const sessionSchema = new mongoose.Schema(
  {
    // Optional link to authenticated user (null = anonymous / seeded demo data)
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
      index: true,
    },

    // ISO date string — matches WorkoutSession.date
    date: { type: String, required: true },

    // Exercise name — "Barbell Squat" | "Romanian Deadlift" | "Overhead Press" etc.
    exercise: { type: String, required: true },

    // Rep count — matches WorkoutSession.totalReps
    totalReps: { type: Number, default: 0 },

    // 0-100% — matches WorkoutSession.formAccuracy
    formAccuracy: { type: Number, default: 0 },

    // Session length in seconds — matches WorkoutSession.duration
    duration: { type: Number, default: 0 },

    // Array of error-type strings seen during the session
    // matches WorkoutSession.errors — e.g. ["Excessive Forward Lean", "Knee Cave"]
    errors: { type: [String], default: [] },

    // Denormalised error counts for quick analytics aggregation
    errorCounts: {
      type: Map,
      of: Number,
      default: {},
    },

    // Whether the session was recorded live (Socket.io stream) vs seeded
    isLive: { type: Boolean, default: false },
  },
  { timestamps: true }
);

// Virtual id: return string _id as "id" so response matches WorkoutSession.id
sessionSchema.virtual("id").get(function () {
  return this._id.toHexString();
});

sessionSchema.set("toJSON", {
  virtuals: true,
  transform: (_, ret) => {
    delete ret._id;
    delete ret.__v;
    // Convert errorCounts Map to plain object for JSON serialisation
    if (ret.errorCounts instanceof Map) {
      ret.errorCounts = Object.fromEntries(ret.errorCounts);
    }
    return ret;
  },
});

module.exports = mongoose.model("Session", sessionSchema);
