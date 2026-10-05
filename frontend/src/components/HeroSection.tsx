"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { ArrowRight, Activity } from "lucide-react";

export default function HeroSection() {
  return (
    <section className="min-h-[90vh] flex flex-col justify-center pt-24 pb-12 px-6 lg:px-8 max-w-7xl mx-auto">
      <div className="grid lg:grid-cols-12 gap-16 lg:gap-8 items-center">
        
        {/* Left column: Editorial Typography */}
        <div className="lg:col-span-7">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
          >
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-[var(--surface)] border border-[var(--border)] rounded-full mb-8">
              <span className="w-2 h-2 rounded-full bg-[var(--accent-primary)] animate-pulse" />
              <span className="text-xs font-semibold text-[var(--text-2)] tracking-wide">
                Smart India Hackathon 2026
              </span>
            </div>

            <h1 className="font-display font-black text-[3.5rem] leading-[1.05] tracking-tighter text-[var(--text-1)] mb-6 md:text-[5rem]">
              Move better.
              <br />
              <span className="text-[var(--text-3)]">Train smarter.</span>
            </h1>

            <p className="font-body text-lg text-[var(--text-2)] max-w-xl leading-relaxed mb-10">
              SPANDANA corrects your form in real-time. Using advanced IMU sensors and an on-device ML model, it prevents injuries before they happen. Absolute precision, right on your wrist.
            </p>

            <div className="flex flex-col sm:flex-row gap-4">
              <Link
                href="/demo"
                className="inline-flex justify-center items-center gap-2 px-8 py-4 bg-[var(--text-1)] text-white font-semibold rounded-full hover:bg-black transition-colors"
              >
                Live Demo
                <ArrowRight className="w-4 h-4" />
              </Link>
              <Link
                href="/about"
                className="inline-flex justify-center items-center gap-2 px-8 py-4 bg-white text-[var(--text-1)] border border-[var(--border)] font-semibold rounded-full hover:bg-[var(--surface)] transition-colors"
              >
                How it works
              </Link>
            </div>
          </motion.div>
        </div>

        {/* Right column: Asymmetrical Graphic / Stat block */}
        <div className="lg:col-span-5 relative">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.9, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
            className="fc-card aspect-square flex flex-col items-center justify-center relative overflow-hidden"
          >
            <div className="absolute inset-0 bg-[var(--surface)] opacity-50" />
            
            <Activity className="w-16 h-16 text-[var(--accent-primary)] mb-6 relative z-10" strokeWidth={1.5} />
            
            <div className="text-center relative z-10">
              <div className="metric-display text-5xl text-[var(--text-1)] mb-2">94.2%</div>
              <div className="font-body text-sm font-medium text-[var(--text-3)] uppercase tracking-widest">
                Form Detection Accuracy
              </div>
            </div>

            {/* Asymmetrical Floating Elements */}
            <div className="absolute top-8 left-8 fc-card px-4 py-2 flex flex-col shadow-sm">
              <span className="text-[10px] text-[var(--text-3)] font-semibold uppercase">Latency</span>
              <span className="font-display font-bold text-sm">&lt;50ms</span>
            </div>
            <div className="absolute bottom-8 right-8 fc-card px-4 py-2 flex flex-col shadow-sm text-right">
              <span className="text-[10px] text-[var(--text-3)] font-semibold uppercase">Polling</span>
              <span className="font-display font-bold text-sm">10 Hz</span>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
