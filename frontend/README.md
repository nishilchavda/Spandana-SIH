# SPANDANA — AI-Powered Fitness Form Correction Platform

> Smart India Hackathon 2026 · Problem Statement PS26213 (Fitness & Sports)

---

## What's Real vs. What's Simulated (Judges: Read This)

| Feature | Status |
|---|---|
| Frontend UI | ✅ Real (Next.js 16, TypeScript, Framer Motion) |
| Dashboard analytics | ✅ Real (served from MongoDB via Express REST API) |
| Session / rep persistence | ✅ Real (MongoDB — every live session is stored) |
| Sensor data stream | ⚠️ **Server-simulated** — physics-inspired waveform (identical to real IMU output shape). No physical ESP32/IMU hardware is connected yet. |
| Form detection | ⚠️ **Rule-based placeholder** — angle thresholds flag form errors. No trained ML model yet. |
| AI suggestions | ⚠️ **Rule-derived from session history** — not a trained language model. Phase 2 will replace with a Python/ML microservice. |

> **Why server-simulated?** The IMU firmware (ESP32 + MPU-6050) is in development. The backend simulation uses the same data shape and noise model as the planned real hardware, so swapping sources is a one-line config change.

---

## Overview

SPANDANA is a wearable AI system that corrects exercise form in real time, preventing injury before it happens.

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | Next.js 16 (App Router, TypeScript) |
| Styling | Tailwind CSS v4 |
| Animations | Framer Motion 13 |
| Charts | Recharts 3 |
| Icons | Lucide React |
| Backend | Node.js + Express 4 |
| Real-time | Socket.io 4 |
| Database | MongoDB + Mongoose 8 |
| Auth | JWT (bcryptjs) |

---

## Project Structure

```
SPANDANA/
├── src/                        # Next.js frontend
│   ├── app/
│   │   ├── layout.tsx
│   │   ├── page.tsx            # Home / Hero
│   │   ├── demo/page.tsx       # Live correction demo
│   │   ├── dashboard/page.tsx  # Analytics dashboard  ← now fetches from API
│   │   └── about/page.tsx
│   ├── components/
│   └── lib/
│       ├── mockData.ts         # Types + fallback mock data
│       ├── sensorSimulator.ts  # Dual-mode: Socket.io or mock fallback
│       └── apiClient.ts        # REST API fetch wrappers  ← NEW
│
└── server/                     # Express backend  ← NEW
    ├── index.js                # Entry point (Express + Socket.io)
    ├── models/
    │   ├── User.js
    │   ├── Session.js
    │   └── Rep.js
    ├── controllers/
    │   ├── authController.js
    │   ├── sessionsController.js
    │   └── analyticsController.js
    ├── routes/
    │   ├── auth.js
    │   ├── sessions.js
    │   └── analytics.js
    ├── services/
    │   ├── formClassifier.js   # Rule-based classifier (Phase 1 placeholder)
    │   └── sensorStream.js     # Server-side sensor simulation + DB persistence
    └── scripts/
        └── seed.js             # Populates DB with 15 realistic sessions
```

---

## Quick Start (Two Terminals)

### Prerequisites
- Node.js ≥ 18
- MongoDB running locally (`mongod`) **or** a MongoDB Atlas URI

---

### Terminal 1 — Backend

```bash
cd SPANDANA/server

# Copy and configure environment variables
cp .env.example .env
# Edit .env: set MONGODB_URI if using Atlas, otherwise default works for local MongoDB

# Start the backend (auto-restarts on file changes)
npm run dev
```

Server starts on **http://localhost:4000**

> **Seed the database first** (one-time, optional but recommended):
> ```bash
> npm run seed
> ```
> This populates 15 realistic past sessions so the dashboard looks populated immediately.

---

### Terminal 2 — Frontend

```bash
cd SPANDANA

# Copy and configure environment variables
cp .env.example .env.local
# Edit .env.local — both vars are pre-filled for local development

# Start Next.js dev server
npm run dev
```

Frontend starts on **http://localhost:3000**

---

## Environment Variables

### `/server/.env`
```
MONGODB_URI=mongodb://localhost:27017/spandana
JWT_SECRET=spandana_dev_secret_change_in_prod
PORT=4000
CORS_ORIGIN=http://localhost:3000
```

### `/.env.local` (Next.js root)
```
NEXT_PUBLIC_API_URL=http://localhost:4000/api
NEXT_PUBLIC_SOCKET_URL=http://localhost:4000
```

> **Demo safety:** Both environment variables are optional. If not set, the frontend falls back to mock data automatically — the demo will still look fully functional even without a running backend.

---

## API Reference

| Method | Endpoint | Description |
|---|---|---|
| POST | `/api/auth/register` | Register a new user |
| POST | `/api/auth/login` | Login, receive JWT |
| GET  | `/api/auth/me` | Get current user (protected) |
| GET  | `/api/sessions` | All sessions, newest first |
| POST | `/api/sessions` | Create a session manually |
| GET  | `/api/sessions/:id` | Single session + reps |
| GET  | `/api/analytics/summary` | Summary stats |
| GET  | `/api/analytics/errors` | Error breakdown |
| GET  | `/api/analytics/trend` | Accuracy trend data |
| GET  | `/api/suggestions` | AI insights (rule-derived) |
| GET  | `/api/health` | Health check |

### Socket.io Events

**Client → Server:**
- `start-session` `{ exercise?: string }` — begin sensor stream
- `stop-session` — end stream and finalise session in DB

**Server → Client:**
- `sensor-frame` `LiveSensorFrame` — 10 Hz sensor data
- `rep-count` `number` — updated rep counter

---

## Phase 2 Roadmap (Post-Hackathon)

1. **Real hardware:** ESP32 + MPU-6050 IMU → streams to `/server/services/sensorStream.js` via USB/BLE
2. **ML model:** Replace `server/services/formClassifier.js` with a FastAPI Python microservice serving a trained classifier (scikit-learn or TensorFlow Lite)
3. **Auth UI:** Full login/register flow in the frontend
4. **Multi-exercise:** Extend waveform models and classifiers for deadlifts, OHP, bench press
