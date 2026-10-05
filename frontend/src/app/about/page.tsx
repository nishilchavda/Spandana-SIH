"use client";

import { motion } from "framer-motion";
import {
  Cpu, Database, Brain, Zap, Target, ClipboardList, Settings2, Telescope, AlertTriangle, ArrowRight
} from "lucide-react";
import Link from "next/link";

const steps = [
  {
    icon: <Cpu className="w-5 h-5" />,
    num: "01",
    title: "IMU Hardware",
    desc: "A 6-DOF IMU (accelerometer + gyroscope) worn on the torso captures raw motion data at 10 Hz. Low-latency BLE transmission sends each frame to the companion app.",
    tech: ["MPU-6050", "Bluetooth LE", "10 Hz polling"],
  },
  {
    icon: <Database className="w-5 h-5" />,
    num: "02",
    title: "Dataset Assembly",
    desc: "Multiple athletes perform exercises while IMU data is collected and frame-by-frame labelled by certified trainers. This dataset trains the core classification model.",
    tech: ["Multi-user dataset", "Expert annotation", "Augmentation pipeline"],
  },
  {
    icon: <Brain className="w-5 h-5" />,
    num: "03",
    title: "Edge Inference",
    desc: "A lightweight time-series classification model (1D-CNN) distinguishes good form from common errors across a configurable angle threshold. Exported to TF Lite.",
    tech: ["1D-CNN", "TensorFlow Lite", "Quantised for edge"],
  },
  {
    icon: <Zap className="w-5 h-5" />,
    num: "04",
    title: "Real-time Feedback",
    desc: "Each inference frame triggers a form-status output with a human-readable tip. Sub-50 ms latency ensures athletes can act on feedback mid-rep.",
    tech: ["Socket.io stream", "<50 ms latency", "Haptic cues"],
  },
];

export default function AboutPage() {
  return (
    <div className="pt-24 pb-24 px-6 lg:px-8 max-w-7xl mx-auto">
      
      {/* Header */}
      <div className="grid lg:grid-cols-12 gap-12 lg:gap-8 mb-24">
        <div className="lg:col-span-8">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-[var(--surface)] border border-[var(--border)] rounded-full mb-6 text-[10px] font-bold text-[var(--text-3)] uppercase tracking-widest">
            System Architecture
          </div>
          <h1 className="font-display font-black text-4xl md:text-5xl lg:text-6xl text-[var(--text-1)] tracking-tight leading-[1.1] mb-6">
            Four stages.<br />
            <span className="text-[var(--text-3)]">One seamless experience.</span>
          </h1>
          <p className="text-lg text-[var(--text-2)] max-w-2xl leading-relaxed">
            SPANDANA is built on a tight hardware-to-AI pipeline designed specifically for low-latency feedback. From raw IMU capture to edge inference, every step is optimized for the athlete.
          </p>
        </div>

        <div className="lg:col-span-4 flex flex-col justify-end">
          <div className="fc-card p-6 border-l-4 border-l-[var(--text-1)] rounded-l-none bg-[var(--surface)] border-y-0 border-r-0 shadow-none rounded-r-2xl">
            <div className="flex items-center gap-2 mb-2">
              <AlertTriangle className="w-4 h-4 text-[var(--text-1)]" />
              <span className="text-xs font-bold uppercase tracking-widest text-[var(--text-1)]">Note</span>
            </div>
            <p className="text-sm text-[var(--text-2)] leading-relaxed">
              This demo utilizes a simulated sensor feed mirroring the physics of real IMU output. Backend integration is pending post-hackathon phase.
            </p>
          </div>
        </div>
      </div>

      {/* Asymmetrical Timeline */}
      <div className="grid md:grid-cols-2 gap-x-8 gap-y-16 lg:gap-y-24 mb-24 relative">
        {steps.map((step, i) => (
          <motion.div 
            key={step.num}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.6, delay: i * 0.1 }}
            className={`fc-card p-8 md:p-10 ${i % 2 !== 0 ? 'md:mt-24' : ''}`}
          >
            <div className="flex items-start justify-between mb-8">
              <div className="w-12 h-12 rounded-full bg-[var(--surface)] border border-[var(--border)] flex items-center justify-center text-[var(--text-1)]">
                {step.icon}
              </div>
              <div className="font-display font-black text-3xl text-[var(--border-strong)]">
                {step.num}
              </div>
            </div>
            
            <h3 className="font-display font-bold text-xl text-[var(--text-1)] mb-3">
              {step.title}
            </h3>
            
            <p className="text-sm text-[var(--text-2)] leading-relaxed mb-8">
              {step.desc}
            </p>
            
            <div className="flex flex-wrap gap-2">
              {step.tech.map(t => (
                <span key={t} className="px-3 py-1.5 bg-[var(--surface)] text-[var(--text-2)] text-xs font-semibold rounded-md border border-[var(--border)]">
                  {t}
                </span>
              ))}
            </div>
          </motion.div>
        ))}
      </div>

      {/* Project Context */}
      <div className="border-t border-[var(--border)] pt-16">
        <h2 className="font-display font-bold text-2xl text-[var(--text-1)] mb-8">Context</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { icon: <Target />, title: "Hackathon", value: "Smart India Hackathon 26" },
            { icon: <ClipboardList />, title: "Category", value: "Fitness & Sports" },
            { icon: <Settings2 />, title: "Stage", value: "UI Prototype" },
            { icon: <Telescope />, title: "Vision", value: "Scale to gym networks" },
          ].map((c, i) => (
            <div key={i} className="fc-card p-6 flex flex-col justify-between aspect-square">
              <div className="text-[var(--text-1)]">{c.icon}</div>
              <div>
                <div className="text-[10px] font-bold uppercase tracking-widest text-[var(--text-3)] mb-1">{c.title}</div>
                <div className="font-semibold text-sm text-[var(--text-1)]">{c.value}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
}
