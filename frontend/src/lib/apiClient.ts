// =============================================================================
// SPANDANA — API Client
// =============================================================================
// Centralised fetch wrapper for all REST calls to the backend.
// Falls back gracefully to mock data when NEXT_PUBLIC_API_URL is not set.
// =============================================================================

import type {
  WorkoutSession,
  ErrorBreakdown,
  AISuggestion,
} from "./mockData";

// ---------------------------------------------------------------------------
// Derived types for analytics endpoints
// ---------------------------------------------------------------------------

export interface SummaryStats {
  totalSessions:   number;
  totalReps:       number;
  avgFormAccuracy: number;
  bestSession:     WorkoutSession | null;
  streak:          number;
}

export interface TrendPoint {
  session:  string;
  date:     string;
  accuracy: number;
  exercise: string;
}

// ---------------------------------------------------------------------------
// Base fetch helper
// ---------------------------------------------------------------------------

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "";

async function apiFetch<T>(path: string): Promise<T> {
  const res = await fetch(`${API_URL}${path}`, {
    headers: { "Content-Type": "application/json" },
    // Next.js 16 — no persistent cache for dynamic data
    cache: "no-store",
  });
  if (!res.ok) {
    const body = await res.text().catch(() => "");
    throw new Error(`API error ${res.status}: ${body}`);
  }
  return res.json() as Promise<T>;
}

// ---------------------------------------------------------------------------
// Sessions
// ---------------------------------------------------------------------------

/** GET /api/sessions — returns all sessions (newest first) */
export async function fetchSessions(): Promise<WorkoutSession[]> {
  return apiFetch<WorkoutSession[]>("/sessions");
}

/** GET /api/sessions/:id — returns a single session */
export async function fetchSession(id: string): Promise<WorkoutSession> {
  return apiFetch<WorkoutSession>(`/sessions/${id}`);
}

// ---------------------------------------------------------------------------
// Analytics
// ---------------------------------------------------------------------------

/** GET /api/analytics/summary */
export async function fetchSummary(): Promise<SummaryStats> {
  return apiFetch<SummaryStats>("/analytics/summary");
}

/** GET /api/analytics/errors */
export async function fetchErrors(): Promise<ErrorBreakdown[]> {
  return apiFetch<ErrorBreakdown[]>("/analytics/errors");
}

/** GET /api/analytics/trend */
export async function fetchTrend(): Promise<TrendPoint[]> {
  return apiFetch<TrendPoint[]>("/analytics/trend");
}

/** GET /api/suggestions */
export async function fetchSuggestions(): Promise<AISuggestion[]> {
  return apiFetch<AISuggestion[]>("/suggestions");
}
