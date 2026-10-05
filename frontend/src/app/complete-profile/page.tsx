"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/authContext";
import { ArrowRight, Loader2, Save } from "lucide-react";
import { motion } from "framer-motion";

export default function CompleteProfilePage() {
  const { user, updateUser } = useAuth();
  const router = useRouter();

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const weightRef = useRef<HTMLInputElement>(null);
  const heightRef = useRef<HTMLInputElement>(null);
  const dobRef = useRef<HTMLInputElement>(null);
  const genderRef = useRef<HTMLSelectElement>(null);
  const goalRef = useRef<HTMLSelectElement>(null);

  const [age, setAge] = useState<number | null>(null);

  useEffect(() => {
    if (user?.profile) {
      if (weightRef.current) weightRef.current.value = user.profile.weight?.toString() || "";
      if (heightRef.current) heightRef.current.value = user.profile.height?.toString() || "";
      if (dobRef.current && user.profile.dateOfBirth) {
        dobRef.current.value = new Date(user.profile.dateOfBirth).toISOString().split('T')[0];
        calculateAge(dobRef.current.value);
      }
      if (genderRef.current) genderRef.current.value = user.profile.gender || "";
      if (goalRef.current) goalRef.current.value = user.profile.fitnessGoal || "";
    }
  }, [user]);

  function calculateAge(dobString: string) {
    if (!dobString) {
      setAge(null);
      return;
    }
    const dob = new Date(dobString);
    const diff = Date.now() - dob.getTime();
    const ageDate = new Date(diff);
    setAge(Math.abs(ageDate.getUTCFullYear() - 1970));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    const weight = parseFloat(weightRef.current?.value || "0");
    const height = parseFloat(heightRef.current?.value || "0");
    const dob = dobRef.current?.value;
    const gender = genderRef.current?.value;
    const fitnessGoal = goalRef.current?.value;

    if (!weight || !height || !dob) {
      setError("Weight, height, and date of birth are required.");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/profile`, {
        method:      "PUT",
        credentials: "include",
        headers:     { "Content-Type": "application/json" },
        body:        JSON.stringify({ weight, height, dateOfBirth: dob, gender, fitnessGoal })
      });
      
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to update profile");
      
      updateUser(data.user);
      router.push("/dashboard");
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-[var(--surface)] flex flex-col items-center py-20 px-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-2xl bg-white p-8 md:p-12 rounded-3xl shadow-sm border border-[var(--border)]"
      >
        <h1 className="font-display text-3xl font-black text-[var(--text-1)] mb-2">
          {user?.profile?.profileComplete ? "Edit Profile" : "Complete Your Profile"}
        </h1>
        <p className="text-[var(--text-2)] mb-8">
          We need a few details to accurately analyze your form and calculate metrics.
        </p>

        {error && (
          <div className="mb-6 px-4 py-3 bg-red-50 text-red-600 border border-red-200 rounded-xl text-sm font-medium">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-xs font-bold text-[var(--text-2)] uppercase tracking-widest mb-2">
                Weight (kg) <span className="text-red-500">*</span>
              </label>
              <input
                ref={weightRef}
                type="number"
                step="0.1"
                min="20"
                max="300"
                className="w-full px-4 py-3 bg-[var(--surface)] border border-[var(--border)] rounded-xl focus:border-[var(--text-1)] focus:ring-1 focus:ring-[var(--text-1)] outline-none transition-all"
                required
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-[var(--text-2)] uppercase tracking-widest mb-2">
                Height (cm) <span className="text-red-500">*</span>
              </label>
              <input
                ref={heightRef}
                type="number"
                min="100"
                max="250"
                className="w-full px-4 py-3 bg-[var(--surface)] border border-[var(--border)] rounded-xl focus:border-[var(--text-1)] focus:ring-1 focus:ring-[var(--text-1)] outline-none transition-all"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-xs font-bold text-[var(--text-2)] uppercase tracking-widest mb-2">
                Date of Birth <span className="text-red-500">*</span>
              </label>
              <input
                ref={dobRef}
                type="date"
                onChange={(e) => calculateAge(e.target.value)}
                className="w-full px-4 py-3 bg-[var(--surface)] border border-[var(--border)] rounded-xl focus:border-[var(--text-1)] focus:ring-1 focus:ring-[var(--text-1)] outline-none transition-all"
                required
              />
              {age !== null && (
                <p className="mt-2 text-xs font-medium text-[var(--text-3)]">
                  Calculated age: <span className="text-[var(--text-1)] font-bold">{age}</span> years
                </p>
              )}
            </div>
            <div>
              <label className="block text-xs font-bold text-[var(--text-2)] uppercase tracking-widest mb-2">
                Gender (Optional)
              </label>
              <select
                ref={genderRef}
                className="w-full px-4 py-3 bg-[var(--surface)] border border-[var(--border)] rounded-xl focus:border-[var(--text-1)] focus:ring-1 focus:ring-[var(--text-1)] outline-none transition-all appearance-none"
              >
                <option value="">Prefer not to say</option>
                <option value="Male">Male</option>
                <option value="Female">Female</option>
                <option value="Other">Other</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-[var(--text-2)] uppercase tracking-widest mb-2">
              Primary Fitness Goal (Optional)
            </label>
            <select
              ref={goalRef}
              className="w-full px-4 py-3 bg-[var(--surface)] border border-[var(--border)] rounded-xl focus:border-[var(--text-1)] focus:ring-1 focus:ring-[var(--text-1)] outline-none transition-all appearance-none"
            >
              <option value="">Select a goal</option>
              <option value="Build Muscle">Build Muscle</option>
              <option value="Lose Weight">Lose Weight</option>
              <option value="Improve Form & Technique">Improve Form & Technique</option>
              <option value="Injury Recovery / Prevention">Injury Recovery / Prevention</option>
              <option value="General Health">General Health</option>
            </select>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full mt-6 flex justify-center items-center gap-2 px-8 py-4 bg-[var(--text-1)] text-white font-semibold rounded-full hover:bg-black transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {loading ? (
              <><Loader2 className="w-4 h-4 animate-spin" /> Saving…</>
            ) : (
              <><Save className="w-4 h-4" /> Save Profile</>
            )}
          </button>
        </form>
      </motion.div>
    </div>
  );
}
