"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, ReferenceLine,
} from "recharts";
import { startSensorSimulation } from "@/lib/sensorSimulator";
import type { LiveSensorFrame } from "@/lib/mockData";
import {
  Activity, AlertTriangle, CheckCircle2, Pause, Play,
  RotateCcw, Wifi, Info, Lightbulb,
} from "lucide-react";
import ChartWrapper from "@/components/ChartWrapper";

const MAX_CHART_POINTS = 80;

function AngleGauge({ angle, max = 45 }: { angle: number; max?: number }) {
  const pct = Math.min(angle / max, 1);
  const radius = 54;
  const circ = 2 * Math.PI * radius;
  const offset = circ * (1 - pct * 0.75);
  const color = angle >= 32 ? "var(--accent-move)" : angle >= 22 ? "var(--accent-amber)" : "var(--accent-primary)";

  return (
    <div className="relative w-40 h-40 mx-auto flex items-center justify-center">
      <svg className="w-full h-full -rotate-[135deg]" viewBox="0 0 120 120">
        <circle cx="60" cy="60" r={radius} fill="none"
          stroke="var(--surface)" strokeWidth="8"
          strokeDasharray={`${circ * 0.75} ${circ * 0.25}`} strokeLinecap="round" />
        <motion.circle cx="60" cy="60" r={radius} fill="none"
          stroke={color} strokeWidth="8"
          strokeDasharray={`${circ * 0.75} ${circ * 0.25}`}
          strokeDashoffset={offset} strokeLinecap="round"
          animate={{ strokeDashoffset: offset, stroke: color }}
          transition={{ duration: 0.15 }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <motion.span
          key={Math.round(angle)}
          initial={{ opacity: 0, scale: 0.85 }}
          animate={{ opacity: 1, scale: 1 }}
          className="metric-display text-4xl"
          style={{ color: "var(--text-1)" }}
        >
          {Math.round(angle)}°
        </motion.span>
        <span className="text-[10px] uppercase tracking-widest mt-0.5 text-[var(--text-3)] font-semibold">
          Torso
        </span>
      </div>
    </div>
  );
}

function FormStatusBadge({ status, tip }: { status: LiveSensorFrame["status"]; tip: string | null }) {
  const cfg = {
    GOOD:    { label: "Good Form",         icon: <CheckCircle2 className="w-4 h-4" />, color: "var(--accent-primary)" },
    WARNING: { label: "Correction Needed", icon: <AlertTriangle className="w-4 h-4" />, color: "var(--accent-amber)"  },
    DANGER:  { label: "Form Error",        icon: <AlertTriangle className="w-4 h-4" />, color: "var(--accent-move)" },
  };
  const { label, icon, color } = cfg[status];

  return (
    <AnimatePresence mode="wait">
      <motion.div key={status}
        initial={{ opacity: 0, scale: 0.96 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.96 }}
        transition={{ duration: 0.2 }}
        className="flex flex-col gap-3"
      >
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded bg-[var(--surface)] self-start border border-[var(--border)]" style={{ color }}>
          {icon} 
          <span className="text-sm font-semibold tracking-tight">{label}</span>
        </div>

        {tip && (
          <div className="flex items-start gap-2 text-sm text-[var(--text-2)] p-3 rounded-lg bg-[var(--surface)]">
            <Lightbulb className="w-4 h-4 flex-shrink-0 mt-0.5" style={{ color: "var(--accent-amber)" }} />
            <span>{tip}</span>
          </div>
        )}
      </motion.div>
    </AnimatePresence>
  );
}

function CustomTooltip({ active, payload }: { active?: boolean; payload?: { value: number }[] }) {
  if (!active || !payload?.length) return null;
  const val = payload[0].value;
  return (
    <div className="fc-card px-3 py-2 text-xs font-semibold text-[var(--text-1)] shadow-sm">
      {val.toFixed(1)}°
    </div>
  );
}

export default function DemoPage() {
  const [frames, setFrames] = useState<{ torso: number; t: number }[]>([]);
  const [currentFrame, setCurrentFrame] = useState<LiveSensorFrame | null>(null);
  const [repCount, setRepCount] = useState(0);
  const [isRunning, setIsRunning] = useState(true);
  const [elapsed, setElapsed] = useState(0);
  const cleanupRef = useRef<(() => void) | null>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const frameIndex = useRef(0);

  const startSession = useCallback(() => {
    if (cleanupRef.current) cleanupRef.current();
    if (timerRef.current) clearInterval(timerRef.current);
    frameIndex.current = 0;
    setFrames([]); setRepCount(0); setElapsed(0);
    cleanupRef.current = startSensorSimulation({
      onFrame: (frame) => {
        setCurrentFrame(frame);
        setFrames((prev) => {
          const next = [...prev, { torso: frame.torsoAngle, t: frameIndex.current++ }];
          return next.length > MAX_CHART_POINTS ? next.slice(-MAX_CHART_POINTS) : next;
        });
      },
      onRepCount: setRepCount,
    });
    timerRef.current = setInterval(() => setElapsed((e) => e + 1), 1000);
  }, []);

  const stopSession = useCallback(() => {
    if (cleanupRef.current) { cleanupRef.current(); cleanupRef.current = null; }
    if (timerRef.current)   { clearInterval(timerRef.current); timerRef.current = null; }
  }, []);

  useEffect(() => {
    if (isRunning) startSession(); else stopSession();
    return stopSession;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isRunning]);

  const formatTime = (s: number) =>
    `${String(Math.floor(s / 60)).padStart(2, "0")}:${String(s % 60).padStart(2, "0")}`;

  return (
    <div className="pt-24 pb-16 px-6 lg:px-8 max-w-7xl mx-auto">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 mb-12">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className={`w-2 h-2 rounded-full ${isRunning ? "bg-[var(--accent-primary)] animate-pulse" : "bg-[var(--text-3)]"}`} />
            <span className="text-xs uppercase tracking-widest font-bold text-[var(--text-3)]">
              {isRunning ? "Live Sensor Feed" : "Paused"}
            </span>
            <span className="text-xs text-[var(--text-3)] mx-2">|</span>
            <span className="text-xs uppercase tracking-widest font-bold text-[var(--text-3)] flex items-center gap-1">
              <Wifi className="w-3 h-3" /> 10 Hz
            </span>
          </div>
          <h1 className="font-display font-black text-4xl text-[var(--text-1)] tracking-tight">
            Barbell Squat
          </h1>
        </div>

        <div className="flex items-center gap-4">
          <span className="metric-display text-3xl text-[var(--text-1)] w-24 text-right">
            {formatTime(elapsed)}
          </span>
          <button onClick={() => setIsRunning(!isRunning)}
            className="flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-semibold bg-[var(--surface)] hover:bg-[var(--border)] transition-colors border border-[var(--border)] text-[var(--text-1)]">
            {isRunning ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
            {isRunning ? "Pause" : "Resume"}
          </button>
          <button onClick={() => { setIsRunning(false); setTimeout(() => setIsRunning(true), 100); }}
            className="p-2.5 rounded-full bg-[var(--surface)] hover:bg-[var(--border)] transition-colors border border-[var(--border)] text-[var(--text-2)]">
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>
      </div>

      <div className="grid lg:grid-cols-12 gap-8">
        
        {/* Left Column */}
        <div className="lg:col-span-4 space-y-8">
          <div className="fc-card p-6 md:p-8">
            <div className="flex items-center justify-between mb-8">
              <h2 className="font-display font-semibold text-lg text-[var(--text-1)]">Angle</h2>
              <span className="text-[10px] font-bold text-[var(--text-3)] uppercase tracking-widest">0-45° Range</span>
            </div>
            <AngleGauge angle={currentFrame?.torsoAngle ?? 0} />
            
            <div className="grid grid-cols-2 gap-4 mt-8 pt-6 border-t border-[var(--border)]">
              <div>
                <div className="text-[10px] font-bold text-[var(--text-3)] uppercase tracking-widest mb-1">Knee</div>
                <div className="metric-display text-xl text-[var(--text-1)]">{currentFrame?.kneeAngle?.toFixed(1) ?? "0.0"}°</div>
              </div>
              <div>
                <div className="text-[10px] font-bold text-[var(--text-3)] uppercase tracking-widest mb-1">Hip</div>
                <div className="metric-display text-xl text-[var(--text-1)]">{currentFrame?.hipAngle?.toFixed(1) ?? "0.0"}°</div>
              </div>
            </div>
          </div>

          <div className="fc-card p-6 md:p-8">
            <h2 className="font-display font-semibold text-lg text-[var(--text-1)] mb-4">Status</h2>
            {currentFrame ? <FormStatusBadge status={currentFrame.status} tip={currentFrame.tip} /> : <div className="text-sm text-[var(--text-3)]">Awaiting data...</div>}
          </div>
        </div>

        {/* Right Column */}
        <div className="lg:col-span-8 space-y-8">
          <ChartWrapper title="Torso Angle" subtitle="Real-time timeline" badge="LIVE">
            <div className="h-64 mt-4">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={frames} margin={{ top: 10, right: 0, left: -20, bottom: 0 }}>
                  <XAxis dataKey="t" hide />
                  <YAxis domain={[0, 45]} tick={{ fontSize: 10, fill: "var(--text-3)", fontWeight: 600 }} axisLine={false} tickLine={false} />
                  <Tooltip content={<CustomTooltip />} cursor={{ stroke: 'var(--border)', strokeWidth: 1, strokeDasharray: '4 4' }} />
                  <ReferenceLine y={22} stroke="var(--border-strong)" strokeDasharray="2 2" />
                  <ReferenceLine y={32} stroke="var(--border-strong)" strokeDasharray="2 2" />
                  <Area type="monotone" dataKey="torso"
                    stroke="var(--text-1)" strokeWidth={2}
                    fill="var(--surface)" dot={false} isAnimationActive={false} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </ChartWrapper>

          <div className="grid sm:grid-cols-2 gap-8">
            <div className="fc-card p-6 md:p-8 flex items-center justify-between">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <Activity className="w-4 h-4 text-[var(--accent-primary)]" />
                  <span className="text-[10px] font-bold text-[var(--text-3)] uppercase tracking-widest">Reps</span>
                </div>
                <div className="metric-display text-5xl text-[var(--text-1)]">{repCount}</div>
              </div>
              <div className="text-right">
                <div className="text-sm font-semibold text-[var(--text-2)] mb-1">Target: 12</div>
                <div className="w-24 h-2 bg-[var(--surface)] rounded-full overflow-hidden border border-[var(--border)]">
                  <div className="h-full bg-[var(--text-1)] transition-all duration-300" style={{ width: `${Math.min((repCount / 12) * 100, 100)}%` }} />
                </div>
              </div>
            </div>

            <div className="fc-card p-6 text-sm text-[var(--text-2)] leading-relaxed flex flex-col justify-center">
              <div className="flex items-center gap-2 font-semibold text-[var(--text-1)] mb-2">
                <Info className="w-4 h-4" /> Simulated Data
              </div>
              This stream uses a physics-inspired waveform mirroring raw IMU output. Form degrades naturally over time based on rep fatigue algorithms.
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
