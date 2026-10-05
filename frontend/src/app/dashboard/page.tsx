"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip,
} from "recharts";
import {
  // Static mock data — used as fallback when API is unavailable
  formAccuracyTrend as mockTrend,
  errorBreakdown    as mockErrors,
  summaryStats      as mockSummary,
  aiSuggestions     as mockSuggestions,
  mockSessions,
} from "@/lib/mockData";
import type { WorkoutSession, ErrorBreakdown, AISuggestion } from "@/lib/mockData";
import type { SummaryStats, TrendPoint } from "@/lib/apiClient";
import {
  fetchSessions, fetchSummary, fetchErrors, fetchTrend, fetchSuggestions,
} from "@/lib/apiClient";
import StatCard from "@/components/StatCard";
import ChartWrapper from "@/components/ChartWrapper";
import {
  Activity, Award, Target, TrendingUp,
  Zap, CheckCircle2, Dumbbell, ArrowUpToLine, BarChart2,
} from "lucide-react";

const suggestionIcons: Record<string, React.ReactNode> = {
  "target":     <Target      className="w-4 h-4" />,
  "zap":        <Zap         className="w-4 h-4" />,
  "trending-up":<TrendingUp  className="w-4 h-4" />,
  "activity":   <Activity    className="w-4 h-4" />,
};

const exerciseIcons: Record<string, React.ReactNode> = {
  "Barbell Squat":     <Dumbbell       className="w-4 h-4" />,
  "Romanian Deadlift": <BarChart2      className="w-4 h-4" />,
  "Overhead Press":    <ArrowUpToLine  className="w-4 h-4" />,
};

function AccuracyTooltip({
  active, payload, label,
}: {
  active?: boolean;
  payload?: { value: number; payload: { exercise: string } }[];
  label?: string;
}) {
  if (!active || !payload?.length) return null;
  return (
    <div className="fc-card px-4 py-3 shadow-sm border border-[var(--border)]">
      <div className="text-[10px] font-bold text-[var(--text-3)] uppercase tracking-widest mb-1">
        {label} · {payload[0].payload.exercise}
      </div>
      <div className="metric-display text-xl text-[var(--text-1)]">
        {payload[0].value}%
      </div>
    </div>
  );
}

const API_URL = process.env.NEXT_PUBLIC_API_URL;

export default function DashboardPage() {
  const [idx, setIdx] = useState(0);

  // ---------------------------------------------------------------------------
  // State: real API data (null = not loaded yet; undefined = load failed/no API)
  // ---------------------------------------------------------------------------
  const [sessions,    setSessions]    = useState<WorkoutSession[] | null>(null);
  const [summary,     setSummary]     = useState<SummaryStats | null>(null);
  const [errors,      setErrors]      = useState<ErrorBreakdown[] | null>(null);
  const [trend,       setTrend]       = useState<TrendPoint[] | null>(null);
  const [suggestions, setSuggestions] = useState<AISuggestion[] | null>(null);
  const [usingApi,    setUsingApi]    = useState(false);

  useEffect(() => {
    if (!API_URL) return; // no backend configured — use mocks silently

    let cancelled = false;
    async function loadAll() {
      try {
        const [s, sum, err, tr, sug] = await Promise.all([
          fetchSessions(),
          fetchSummary(),
          fetchErrors(),
          fetchTrend(),
          fetchSuggestions(),
        ]);
        if (cancelled) return;
        setSessions(s);
        setSummary(sum);
        setErrors(err);
        setTrend(tr);
        setSuggestions(sug);
        setUsingApi(true);
      } catch (e) {
        console.warn("[dashboard] API fetch failed — using mock data:", e);
        // Fall through to mock data (state remains null → component uses mocks below)
      }
    }
    loadAll();
    return () => { cancelled = true; };
  }, []);

  // ---------------------------------------------------------------------------
  // Resolved data: API first, mock fallback
  // ---------------------------------------------------------------------------
  const resolvedSessions    = sessions    ?? mockSessions;
  const resolvedSummary     = summary     ?? mockSummary;
  const resolvedErrors      = errors      ?? mockErrors;
  const resolvedTrend       = trend       ?? mockTrend;
  const resolvedSuggestions = suggestions ?? mockSuggestions;

  const aiTip = resolvedSuggestions[idx % resolvedSuggestions.length];
  const recent = [...resolvedSessions].slice(0, 5); // already newest-first from API

  return (
    <div className="pt-24 pb-20 px-6 lg:px-8 max-w-7xl mx-auto">

      {/* Header - Editorial Asymmetry */}
      <div className="flex flex-col md:flex-row justify-between items-end mb-12 border-b border-[var(--border)] pb-8">
        <div>
          <h1 className="font-display font-black text-4xl text-[var(--text-1)] tracking-tight mb-2">
            Overview
          </h1>
          <p className="text-sm font-semibold text-[var(--text-3)]">
            {new Date().toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}
            {usingApi && (
              <span className="ml-2 text-[var(--accent-primary)]">· Live data</span>
            )}
          </p>
        </div>
        <div className="mt-6 md:mt-0 text-right">
          <div className="text-[10px] font-bold text-[var(--text-3)] uppercase tracking-widest mb-1">Overall Accuracy</div>
          <div className="metric-display text-5xl text-[var(--accent-primary)]">{resolvedSummary.avgFormAccuracy}%</div>
        </div>
      </div>

      {/* Primary Metrics Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
        <StatCard label="Total Sessions" value={resolvedSummary.totalSessions} icon={<Activity />} trend="3 this wk" trendUp />
        <StatCard label="Total Reps" value={resolvedSummary.totalReps} icon={<Dumbbell />} trend="12% up" trendUp />
        <StatCard label="Active Streak" value={resolvedSummary.streak} unit="days" icon={<Award />} trend="PB: 8" trendUp />
        <StatCard label="Avg Score" value={resolvedSummary.avgFormAccuracy} unit="%" icon={<Target />} trend="+13%" trendUp />
      </div>

      <div className="grid lg:grid-cols-12 gap-8 mb-8">
        
        {/* AI Insight Card - Editorial layout */}
        <div className="lg:col-span-5 flex">
          <div className="fc-card p-8 flex flex-col justify-between bg-[var(--text-1)] text-white w-full border-none">
            <div>
              <div className="flex items-center gap-2 mb-8">
                <Zap className="w-5 h-5 text-[var(--accent-primary)]" />
                <span className="text-[10px] font-bold uppercase tracking-widest text-[var(--text-3)]">Insight</span>
              </div>
              <AnimatePresence mode="wait">
                <motion.div key={aiTip.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                  <p className="font-display text-xl leading-snug font-medium">
                    &ldquo;{aiTip.text}&rdquo;
                  </p>
                </motion.div>
              </AnimatePresence>
            </div>
            
            <div className="flex items-center justify-between mt-12">
              <div className="flex gap-1.5">
                {resolvedSuggestions.map((_, i) => (
                  <div key={i} className={`h-1 rounded-full transition-all ${i === idx % resolvedSuggestions.length ? "w-4 bg-white" : "w-1 bg-white/30"}`} />
                ))}
              </div>
              <button onClick={() => setIdx(i => i + 1)} className="text-xs font-bold uppercase tracking-widest hover:text-[var(--accent-primary)] transition-colors">
                Next
              </button>
            </div>
          </div>
        </div>

        {/* Chart */}
        <div className="lg:col-span-7">
          <ChartWrapper title="Accuracy Trend" subtitle="Rolling average across sessions">
            <div className="h-64 mt-4">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={resolvedTrend} margin={{ top: 10, right: 0, left: -25, bottom: 0 }}>
                  <XAxis dataKey="session" tick={{ fill: "var(--text-3)", fontSize: 10, fontWeight: 600 }} axisLine={false} tickLine={false} />
                  <YAxis domain={[60, 100]} tick={{ fill: "var(--text-3)", fontSize: 10, fontWeight: 600 }} axisLine={false} tickLine={false} />
                  <Tooltip content={<AccuracyTooltip />} cursor={{ stroke: 'var(--border)', strokeWidth: 1, strokeDasharray: '4 4' }} />
                  <Area type="step" dataKey="accuracy" stroke="var(--text-1)" strokeWidth={2} fill="var(--surface)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </ChartWrapper>
        </div>

      </div>

      <div className="grid lg:grid-cols-12 gap-8">
        
        {/* Recent Sessions */}
        <div className="lg:col-span-8">
          <div className="fc-card">
            <div className="p-6 md:p-8 border-b border-[var(--border)]">
              <h3 className="font-display font-semibold text-lg text-[var(--text-1)]">History</h3>
            </div>
            <div className="divide-y divide-[var(--border)]">
              {recent.map((s) => (
                <div key={s.id} className="p-4 md:px-8 md:py-6 flex items-center justify-between hover:bg-[var(--surface-hover)] transition-colors">
                  <div className="flex items-center gap-4 md:gap-6">
                    <div className="w-10 h-10 rounded-full bg-[var(--surface)] border border-[var(--border)] flex items-center justify-center text-[var(--text-1)]">
                      {exerciseIcons[s.exercise] || <Activity className="w-4 h-4" />}
                    </div>
                    <div>
                      <div className="font-semibold text-sm text-[var(--text-1)] mb-0.5">{s.exercise}</div>
                      <div className="text-xs text-[var(--text-3)] font-medium">{s.date} · {s.totalReps} Reps</div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="metric-display text-xl text-[var(--text-1)]">{s.formAccuracy}%</div>
                    <div className="text-[10px] font-bold text-[var(--text-3)] uppercase tracking-widest flex items-center gap-1 justify-end mt-1">
                      {s.errors.length === 0 ? <><CheckCircle2 className="w-3 h-3 text-[var(--accent-primary)]" /> Clean</> : `${s.errors.length} Corrections`}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Errors Breakdown */}
        <div className="lg:col-span-4">
          <ChartWrapper title="Error Distribution">
            <div className="space-y-6 mt-4">
              {resolvedErrors.map((err) => {
                const total = resolvedErrors.reduce((a, b) => a + b.count, 0);
                const pct = (err.count / total) * 100;
                return (
                  <div key={err.name}>
                    <div className="flex justify-between text-xs font-semibold text-[var(--text-1)] mb-2">
                      <span>{err.name}</span>
                      <span className="text-[var(--text-3)]">{err.count}</span>
                    </div>
                    <div className="h-1 bg-[var(--surface)] w-full rounded-full overflow-hidden">
                      <div className="h-full bg-[var(--text-1)]" style={{ width: `${pct}%` }} />
                    </div>
                  </div>
                );
              })}
            </div>
          </ChartWrapper>
        </div>

      </div>

    </div>
  );
}
