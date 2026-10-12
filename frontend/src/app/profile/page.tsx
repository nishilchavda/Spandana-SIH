"use client";

import { useAuth } from "@/lib/authContext";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { User, Mail, Activity, Calendar, Edit3, LogOut, Loader2 } from "lucide-react";
import { useEffect, useState } from "react";

export default function ProfilePage() {
  const { user, logout, updateUser } = useAuth();
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  // Fetch latest profile on mount
  useEffect(() => {
    async function fetchProfile() {
      try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/profile`, {
          credentials: "include",
        });
        if (res.ok) {
          const data = await res.json();
          updateUser(data.user);
        }
      } catch (err) {
        console.error("Failed to fetch profile", err);
      }
    }
    fetchProfile();
  }, [updateUser]);

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-[var(--text-3)]" />
      </div>
    );
  }

  const profile = user.profile || {};
  let age = null;
  if (profile.dateOfBirth) {
    const dob = new Date(profile.dateOfBirth);
    const diff = Date.now() - dob.getTime();
    age = Math.abs(new Date(diff).getUTCFullYear() - 1970);
  }

  const handleLogout = async () => {
    await logout();
    router.push("/");
  };

  return (
    <div className="min-h-screen bg-[var(--surface)] py-20 px-6">
      <div className="max-w-4xl mx-auto">
        <div className="flex flex-col md:flex-row items-center md:items-start justify-between mb-10 gap-4">
          <h1 className="font-display text-4xl font-black text-[var(--text-1)] tracking-tight">
            Athlete Profile
          </h1>
          <div className="flex items-center gap-3">
            <button
              onClick={() => router.push("/complete-profile")}
              className="flex items-center gap-2 px-5 py-2.5 bg-white border border-[var(--border)] rounded-full text-sm font-semibold hover:bg-gray-50 transition-colors shadow-sm"
            >
              <Edit3 className="w-4 h-4" /> Edit Profile
            </button>
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 px-5 py-2.5 bg-red-50 text-red-600 rounded-full text-sm font-semibold hover:bg-red-100 transition-colors shadow-sm"
            >
              <LogOut className="w-4 h-4" /> Log out
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Left Column: Account Details */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="md:col-span-1 space-y-6"
          >
            <div className="bg-white p-8 rounded-3xl shadow-sm border border-[var(--border)] text-center flex flex-col items-center">
              <div className="w-24 h-24 bg-[var(--text-1)] rounded-full flex items-center justify-center text-4xl font-black text-white mb-4">
                {user.name.charAt(0).toUpperCase()}
              </div>
              <h2 className="text-xl font-bold text-[var(--text-1)]">{user.name}</h2>
              <div className="flex items-center gap-1.5 text-[var(--text-3)] text-sm mt-1">
                <Mail className="w-3.5 h-3.5" />
                <span>{user.email}</span>
              </div>
              <div className="mt-6 px-4 py-2 bg-[var(--surface)] rounded-full text-xs font-bold tracking-wider uppercase text-[var(--text-2)] border border-[var(--border)]">
                SPANDANA Member
              </div>
            </div>
          </motion.div>

          {/* Right Column: Physical Profile */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="md:col-span-2"
          >
            <div className="bg-white p-8 rounded-3xl shadow-sm border border-[var(--border)] h-full">
              <h3 className="text-lg font-bold text-[var(--text-1)] mb-6 flex items-center gap-2">
                <Activity className="w-5 h-5 text-[var(--accent-primary)]" /> Physical Attributes
              </h3>
              
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-y-8 gap-x-4">
                <ProfileStat label="Weight" value={profile.weight ? `${profile.weight} kg` : "--"} />
                <ProfileStat label="Height" value={profile.height ? `${profile.height} cm` : "--"} />
                <ProfileStat label="Age" value={age !== null ? `${age} yrs` : "--"} />
                <ProfileStat label="Gender" value={profile.gender || "Unspecified"} />
                <ProfileStat label="Fitness Goal" value={profile.fitnessGoal || "Unspecified"} className="sm:col-span-2" />
              </div>
              
              {!profile.profileComplete && (
                <div className="mt-8 p-4 bg-amber-50 border border-amber-200 rounded-xl flex items-start gap-3">
                  <Activity className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <h4 className="font-bold text-amber-800 text-sm">Profile Incomplete</h4>
                    <p className="text-sm text-amber-700 mt-1">
                      Complete your profile to unlock full tracking and analytics features.
                    </p>
                    <button 
                      onClick={() => router.push("/complete-profile")}
                      className="mt-3 text-xs font-bold bg-amber-100 hover:bg-amber-200 text-amber-800 px-3 py-1.5 rounded-full transition-colors"
                    >
                      Complete Now
                    </button>
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}

function ProfileStat({ label, value, className = "" }: { label: string; value: string; className?: string }) {
  return (
    <div className={className}>
      <p className="text-xs font-bold text-[var(--text-3)] uppercase tracking-widest mb-1">{label}</p>
      <p className="font-semibold text-[var(--text-1)] text-lg">{value}</p>
    </div>
  );
}
