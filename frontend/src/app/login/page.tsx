"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Activity, ArrowRight, Mail, Lock, AlertCircle, Loader2 } from "lucide-react";
import { motion } from "framer-motion";
import { useAuth } from "@/lib/authContext";

export default function LoginPage() {
  const { login } = useAuth();
  const router     = useRouter();

  const emailRef    = useRef<HTMLInputElement>(null);
  const passwordRef = useRef<HTMLInputElement>(null);

  const [error,   setError]   = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    const email    = emailRef.current?.value.trim()    ?? "";
    const password = passwordRef.current?.value.trim() ?? "";

    if (!email || !password) {
      setError("Please fill in all fields.");
      return;
    }

    setLoading(true);
    try {
      await login(email, password);
      router.push("/dashboard");
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Login failed. Please try again.");
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
          className="max-w-md w-full mx-auto"
        >
          <h1 className="font-display font-black text-4xl text-[var(--text-1)] tracking-tight mb-2">
            Welcome back.
          </h1>
          <p className="font-body text-[var(--text-2)] mb-10">
            Log in to continue your form correction journey.
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
              <div className="flex items-center justify-between mb-2">
                <label className="block text-xs font-bold text-[var(--text-2)] uppercase tracking-widest" htmlFor="password">
                  Password
                </label>
              </div>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Lock className="w-4 h-4 text-[var(--text-3)]" />
                </div>
                <input
                  id="password"
                  ref={passwordRef}
                  type="password"
                  placeholder="••••••••"
                  className="w-full pl-11 pr-4 py-3 bg-[var(--surface)] border border-[var(--border)] rounded-xl text-[var(--text-1)] placeholder-[var(--text-3)] focus:outline-none focus:border-[var(--text-1)] focus:ring-1 focus:ring-[var(--text-1)] transition-all font-body text-sm"
                  required
                  autoComplete="current-password"
                />
              </div>
            </div>

            <button
              id="login-submit"
              type="submit"
              disabled={loading}
              className="w-full mt-8 flex justify-center items-center gap-2 px-8 py-4 bg-[var(--text-1)] text-white font-semibold rounded-full hover:bg-black transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {loading ? (
                <><Loader2 className="w-4 h-4 animate-spin" /> Logging in…</>
              ) : (
                <>Log In <ArrowRight className="w-4 h-4" /></>
              )}
            </button>
          </form>

          <p className="mt-8 text-center text-sm text-[var(--text-2)] font-body">
            Don&apos;t have an account?{" "}
            <Link href="/signup" className="font-semibold text-[var(--text-1)] hover:underline">
              Sign up
            </Link>
          </p>
        </motion.div>
      </div>

      {/* Right Column: Branding */}
      <div className="hidden lg:flex w-1/2 bg-[var(--surface)] p-12 relative overflow-hidden flex-col justify-between items-start">
        <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: "radial-gradient(circle at center, #0F172A 1px, transparent 1px)", backgroundSize: "24px 24px" }} />
        <div className="relative z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-white border border-[var(--border)] rounded-full mb-6">
            <span className="w-2 h-2 rounded-full bg-[var(--accent-primary)]" />
            <span className="text-xs font-semibold text-[var(--text-2)] tracking-wide">
              Performance Analytics
            </span>
          </div>
        </div>
        <div className="relative z-10">
          <h2 className="font-display font-black text-5xl text-[var(--text-1)] leading-[1.1] tracking-tight mb-6">
            &ldquo;Perfect form is not an accident. It&apos;s a habit.&rdquo;
          </h2>
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-[var(--text-1)] rounded-full flex items-center justify-center">
              <Activity className="w-5 h-5 text-white" />
            </div>
            <div>
              <p className="font-bold text-[var(--text-1)] text-sm">SPANDANA AI Coach</p>
              <p className="text-xs text-[var(--text-3)] uppercase tracking-widest font-semibold">System initialized</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
