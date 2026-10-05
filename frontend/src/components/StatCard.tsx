"use client";

import { ReactNode } from "react";
import { motion } from "framer-motion";

interface StatCardProps {
  label: string;
  value: string | number;
  unit?: string;
  icon?: ReactNode;
  accentColor?: string;
  sublabel?: string;
  trend?: string;
  trendUp?: boolean;
  delay?: number;
}

export default function StatCard({
  label,
  value,
  unit,
  icon,
  accentColor = "var(--text-1)",
  sublabel,
  trend,
  trendUp = true,
  delay = 0,
}: StatCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay, ease: [0.25, 0.46, 0.45, 0.94] }}
      className="fc-card p-6 flex flex-col justify-between h-full"
    >
      <div className="flex items-start justify-between mb-8">
        {icon && (
          <div className="text-[var(--text-2)]">
            {icon}
          </div>
        )}
        {trend && (
          <span
            className="text-[11px] font-semibold tracking-wide uppercase px-2 py-1 rounded bg-[var(--surface)]"
            style={{ color: trendUp ? "var(--accent-exercise)" : "var(--accent-move)" }}
          >
            {trendUp ? "↑" : "↓"} {trend}
          </span>
        )}
      </div>

      <div>
        <div className="flex items-baseline gap-1 mb-1">
          <span className="metric-display text-4xl text-[var(--text-1)]">
            {value}
          </span>
          {unit && (
            <span className="text-sm font-medium text-[var(--text-3)] font-body">
              {unit}
            </span>
          )}
        </div>

        <p className="text-sm font-medium text-[var(--text-2)] font-body">
          {label}
        </p>

        {sublabel && (
          <p className="text-xs text-[var(--text-3)] font-body mt-1">
            {sublabel}
          </p>
        )}
      </div>
    </motion.div>
  );
}
