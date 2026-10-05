// =============================================================================
// SPANDANA — Express + Socket.io Server
// =============================================================================

require("dotenv").config();

const express   = require("express");
const http      = require("http");
const { Server } = require("socket.io");
const mongoose  = require("mongoose");
const cors      = require("cors");

const authRoutes     = require("./routes/auth");
const sessionRoutes  = require("./routes/sessions");
const { analyticsRouter, getSuggestions } = require("./routes/analytics");
const { startLiveSensorStream, stopLiveSensorStream } = require("./services/sensorStream");

// ---------------------------------------------------------------------------
// Express App
// ---------------------------------------------------------------------------
const app    = express();
const server = http.createServer(app);

// CORS — allow the Next.js dev origin
const corsOrigin = process.env.CORS_ORIGIN || "http://localhost:3000";
app.use(cors({
  origin: corsOrigin,
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
}));

app.use(express.json());

// ---------------------------------------------------------------------------
// REST Routes
// ---------------------------------------------------------------------------
app.use("/api/auth",      authRoutes);
app.use("/api/sessions",  sessionRoutes);
app.use("/api/analytics", analyticsRouter);
app.get("/api/suggestions", getSuggestions);

// Health check
app.get("/api/health", (_, res) => res.json({ status: "ok", ts: Date.now() }));

// ---------------------------------------------------------------------------
// Socket.io — real-time sensor feed
// ---------------------------------------------------------------------------
const io = new Server(server, {
  cors: {
    origin: corsOrigin,
    methods: ["GET", "POST"],
  },
});

io.on("connection", (socket) => {
  console.log(`[socket] client connected: ${socket.id}`);

  // Client emits "start-session" to begin a live sensor stream.
  // Payload: { exercise?: string }
  socket.on("start-session", async (payload) => {
    const exercise = payload?.exercise ?? "Barbell Squat";
    console.log(`[socket] start-session from ${socket.id} — exercise: ${exercise}`);
    await startLiveSensorStream(socket, io, { exercise });
  });

  // Client emits "stop-session" to end the stream manually
  socket.on("stop-session", async () => {
    console.log(`[socket] stop-session from ${socket.id}`);
    await stopLiveSensorStream(socket.id);
  });

  // Auto-cleanup on disconnect
  socket.on("disconnect", async () => {
    console.log(`[socket] client disconnected: ${socket.id}`);
    await stopLiveSensorStream(socket.id);
  });
});

// ---------------------------------------------------------------------------
// MongoDB + Server startup
// ---------------------------------------------------------------------------
const PORT       = process.env.PORT || 4000;
const MONGO_URI  = process.env.MONGODB_URI || "mongodb://localhost:27017/spandana";

mongoose
  .connect(MONGO_URI)
  .then(() => {
    console.log(`[db] Connected to MongoDB: ${MONGO_URI}`);
    server.listen(PORT, () => {
      console.log(`[server] SPANDANA backend running on http://localhost:${PORT}`);
      console.log(`[server] Socket.io ready — CORS origin: ${corsOrigin}`);
    });
  })
  .catch((err) => {
    console.error("[db] Connection failed:", err.message);
    process.exit(1);
  });
