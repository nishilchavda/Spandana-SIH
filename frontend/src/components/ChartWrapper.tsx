"use client";

import { ReactNode } from "react";
import { motion } from "framer-motion";

interface ChartWrapperProps {
  title: string;
  subtitle?: string;
  children: ReactNode;
  className?: string;
  delay?: number;
  badge?: string;
  badgeColor?: string;
  action?: ReactNode;
}

export default function ChartWrapper({
  title,
  subtitle,
  children,
  className = "",
  delay = 0,
  badge,
  badgeColor = "var(--accent-primary)",
  action,
}: ChartWrapperProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay, ease: [0.25, 0.46, 0.45, 0.94] }}
      className={`fc-card p-6 md:p-8 flex flex-col ${className}`}
    >
      <div className="flex items-start justify-between mb-8">
        <div>
          <div className="flex items-center gap-3 mb-1">
            <h3 className="font-semibold text-lg font-display text-[var(--text-1)] tracking-tight">
              {title}
            </h3>
            {badge && (
              <span
                className="text-[10px] font-bold tracking-widest uppercase px-2 py-0.5 rounded-sm bg-[var(--surface)]"
                style={{ color: badgeColor }}
              >
                {badge}
              </span>
            )}
          </div>
          {subtitle && (
            <p className="font-body text-sm text-[var(--text-3)]">
              {subtitle}
            </p>
          )}
        </div>
        {action && (
          <div className="text-[var(--text-2)]">
            {action}
          </div>
        )}
      </div>

      <div className="w-full flex-1">
        {children}
      </div>
    </motion.div>
  );
}
