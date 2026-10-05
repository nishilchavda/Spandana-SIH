"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Activity, ArrowRight, Mail, Lock, User, AlertCircle, Loader2, CheckCircle2 } from "lucide-react";
import { motion } from "framer-motion";
import { useAuth } from "@/lib/authContext";

export default function SignupPage() {
  const { signup } = useAuth();
  const router      = useRouter();

  const nameRef     = useRef<HTMLInputElement>(null);
  const emailRef    = useRef<HTMLInputElement>(null);
  const passwordRef = useRef<HTMLInputElement>(null);

  const confirmPasswordRef = useRef<HTMLInputElement>(null);

  const [error,   setError]   = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    const name     = nameRef.current?.value.trim()     ?? "";
    const email    = emailRef.current?.value.trim()    ?? "";
    const password = passwordRef.current?.value.trim() ?? "";
    const confirmPassword = confirmPasswordRef.current?.value.trim() ?? "";

    if (!name || !email || !password || !confirmPassword) {
      setError("Please fill in all fields.");
      return;
    }
    if (password.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }
    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setLoading(true);
    try {
      await signup(name, email, password, confirmPassword);
      router.push("/complete-profile");
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Sign up failed. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex bg-white">
      {/* Left Column: Form */}
      <div className="w-full lg:w-1/2 flex flex-col justify-center px-8 sm:px-16 lg:px-24 py-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          className="max-w-md w-full mx-auto mt-10"
        >
          <h1 className="font-display font-black text-4xl text-[var(--text-1)] tracking-tight mb-2">
            Join the elite.
          </h1>
          <p className="font-body text-[var(--text-2)] mb-8">
            Create an account to start correcting your form with AI.
          </p>

          {/* Error banner */}
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex items-center gap-2 mb-6 px-4 py-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-sm font-medium"
            >
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              {error}
            </motion.div>
          )}

          <form className="space-y-5" onSubmit={handleSubmit}>
            <div>
              <label className="block text-xs font-bold text-[var(--text-2)] uppercase tracking-widest mb-2" htmlFor="name">
                Full Name
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <User className="w-4 h-4 text-[var(--text-3)]" />
                </div>
                <input
                  id="name"
                  ref={nameRef}
                  type="text"
                  placeholder="Alex Athlete"
                  className="w-full pl-11 pr-4 py-3 bg-[var(--surface)] border border-[var(--border)] rounded-xl text-[var(--text-1)] placeholder-[var(--text-3)] focus:outline-none focus:border-[var(--text-1)] focus:ring-1 focus:ring-[var(--text-1)] transition-all font-body text-sm"
                  required
                  autoComplete="name"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-[var(--text-2)] uppercase tracking-widest mb-2" htmlFor="email">
                Email Address
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Mail className="w-4 h-4 text-[var(--text-3)]" />
                </div>
                <input
                  id="email"
                  ref={emailRef}
                  type="email"
                  placeholder="athlete@example.com"
                  className="w-full pl-11 pr-4 py-3 bg-[var(--surface)] border border-[var(--border)] rounded-xl text-[var(--text-1)] placeholder-[var(--text-3)] focus:outline-none focus:border-[var(--text-1)] focus:ring-1 focus:ring-[var(--text-1)] transition-all font-body text-sm"
                  required
                  autoComplete="email"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-[var(--text-2)] uppercase tracking-widest mb-2" htmlFor="password">
                Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Lock className="w-4 h-4 text-[var(--text-3)]" />
                </div>
                <input
                  id="password"
                  ref={passwordRef}
                  type="password"
                  placeholder="At least 6 characters"
                  className="w-full pl-11 pr-4 py-3 bg-[var(--surface)] border border-[var(--border)] rounded-xl text-[var(--text-1)] placeholder-[var(--text-3)] focus:outline-none focus:border-[var(--text-1)] focus:ring-1 focus:ring-[var(--text-1)] transition-all font-body text-sm"
                  required
                  autoComplete="new-password"
                  minLength={6}
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-[var(--text-2)] uppercase tracking-widest mb-2" htmlFor="confirmPassword">
                Confirm Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Lock className="w-4 h-4 text-[var(--text-3)]" />
                </div>
                <input
                  id="confirmPassword"
                  ref={confirmPasswordRef}
                  type="password"
                  placeholder="Repeat password"
                  className="w-full pl-11 pr-4 py-3 bg-[var(--surface)] border border-[var(--border)] rounded-xl text-[var(--text-1)] placeholder-[var(--text-3)] focus:outline-none focus:border-[var(--text-1)] focus:ring-1 focus:ring-[var(--text-1)] transition-all font-body text-sm"
                  required
                  autoComplete="new-password"
                  minLength={6}
                />
              </div>
            </div>

            {/* Benefits list */}
            <div className="pt-2 space-y-2">
              {[
                "Real-time form correction at 10 Hz",
                "Session history & accuracy trends",
                "AI-generated improvement insights",
              ].map((benefit) => (
                <div key={benefit} className="flex items-center gap-2 text-xs text-[var(--text-2)]">
                  <CheckCircle2 className="w-3.5 h-3.5 text-[var(--accent-primary)] flex-shrink-0" />
                  {benefit}
                </div>
              ))}
            </div>

            <button
              id="signup-submit"
              type="submit"
              disabled={loading}
              className="w-full mt-8 flex justify-center items-center gap-2 px-8 py-4 bg-[var(--accent-primary)] text-white font-semibold rounded-full hover:opacity-90 transition-opacity shadow-sm disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {loading ? (
                <><Loader2 className="w-4 h-4 animate-spin" /> Creating account…</>
              ) : (
                <>Create Account <ArrowRight className="w-4 h-4" /></>
              )}
            </button>
          </form>

          <p className="mt-8 text-center text-sm text-[var(--text-2)] font-body">
            Already have an account?{" "}
            <Link href="/login" className="font-semibold text-[var(--text-1)] hover:underline">
              Log in
            </Link>
          </p>
        </motion.div>
      </div>

      {/* Right Column: Branding */}
      <div className="hidden lg:flex w-1/2 bg-[var(--text-1)] p-12 relative overflow-hidden flex-col justify-between items-start">
        <div className="absolute inset-0 opacity-10" style={{ backgroundImage: "radial-gradient(circle at center, #FFFFFF 1px, transparent 1px)", backgroundSize: "24px 24px" }} />
        <div className="relative z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/10 border border-white/20 rounded-full mb-6 backdrop-blur-md">
            <span className="w-2 h-2 rounded-full bg-[var(--accent-primary)]" />
            <span className="text-xs font-semibold text-white tracking-wide">
              Early Access
            </span>
          </div>
        </div>
        <div className="relative z-10">
          <h2 className="font-display font-black text-5xl text-white leading-[1.1] tracking-tight mb-6">
            &ldquo;Your form is your foundation. Build it right.&rdquo;
          </h2>
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-[var(--accent-primary)] rounded-full flex items-center justify-center">
              <Activity className="w-5 h-5 text-white" />
            </div>
            <div>
              <p className="font-bold text-white text-sm">Join 10,000+ athletes</p>
              <p className="text-xs text-white/60 uppercase tracking-widest font-semibold">Scaling globally</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
