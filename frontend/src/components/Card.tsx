"use client";

import { motion } from "framer-motion";
import { ReactNode } from "react";

interface CardProps {
  children: ReactNode;
  className?: string;
  hover?: boolean;
  glow?: boolean;
  delay?: number;
}

/**
 * Reusable glass card component with optional Framer Motion reveal + hover effects.
 */
export default function Card({
  children,
  className = "",
  hover = true,
  glow = false,
  delay = 0,
}: CardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay, ease: "easeOut" }}
      whileHover={hover ? { y: -3, scale: 1.005 } : undefined}
      className={`
        glass-card rounded-2xl p-6
        ${hover ? "glass-card-hover cursor-default" : ""}
        ${glow ? "glow-blue" : ""}
        ${className}
      `}
    >
      {children}
    </motion.div>
  );
}
