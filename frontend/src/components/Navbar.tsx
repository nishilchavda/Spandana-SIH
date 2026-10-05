"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect } from "react";
import { Menu, X, Activity, LogOut, User } from "lucide-react";
import { useAuth } from "@/lib/authContext";

const navLinks = [
  { href: "/",          label: "Home"         },
  { href: "/demo",      label: "Live Demo",   protected: true },
  { href: "/dashboard", label: "Dashboard",   protected: true },
  { href: "/about",     label: "How It Works" },
];

export default function Navbar() {
  const pathname           = usePathname();
  const router             = useRouter();
  const { user, logout, loading } = useAuth();
  const [scrolled,    setScrolled]    = useState(false);
  const [mobileOpen,  setMobileOpen]  = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handler, { passive: true });
    return () => window.removeEventListener("scroll", handler);
  }, []);

  async function handleLogout() {
    await logout();
    setUserMenuOpen(false);
    router.push("/");
  }

  // First letter of name for avatar
  const initials = user?.name?.charAt(0).toUpperCase() ?? "?";

  return (
    <>
      <header
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          scrolled ? "bg-white/90 backdrop-blur-md border-b border-[var(--border)]" : "bg-white"
        }`}
      >
        <nav className="max-w-7xl mx-auto px-6 lg:px-8 h-[72px] flex items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 group flex-shrink-0">
            <Activity className="w-5 h-5 text-[var(--text-1)]" />
            <span className="text-lg font-black tracking-tight font-display text-[var(--text-1)]">
              SPAN<span className="text-[var(--accent-primary)]">DANA</span>
            </span>
          </Link>

          {/* Desktop nav */}
          <div className="hidden md:flex items-center gap-6">
            {navLinks.filter(l => !l.protected || user).map((link) => {
              const active = pathname === link.href;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`text-sm font-medium transition-colors ${
                    active ? "text-[var(--text-1)]" : "text-[var(--text-2)] hover:text-[var(--text-1)]"
                  }`}
                >
                  {link.label}
                </Link>
              );
            })}

            {/* Auth area */}
            <div className="flex items-center gap-4 ml-2 border-l border-[var(--border)] pl-6">
              {!loading && (
                user ? (
                  // ---- Logged-in state ----
                  <div className="relative">
                    <button
                      onClick={() => setUserMenuOpen((o) => !o)}
                      className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-[var(--surface)] border border-[var(--border)] hover:bg-[var(--border)] transition-colors text-sm font-semibold text-[var(--text-1)]"
                    >
                      <span className="w-6 h-6 rounded-full bg-[var(--text-1)] text-white text-xs font-bold flex items-center justify-center">
                        {initials}
                      </span>
                      <span className="max-w-[100px] truncate">{user.name}</span>
                    </button>

                    <AnimatePresence>
                      {userMenuOpen && (
                        <motion.div
                          initial={{ opacity: 0, y: 6 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: 6 }}
                          transition={{ duration: 0.15 }}
                          className="absolute right-0 top-full mt-2 w-52 bg-white border border-[var(--border)] rounded-xl shadow-lg py-1 z-50"
                        >
                          <div className="px-4 py-3 border-b border-[var(--border)]">
                            <p className="text-xs font-bold text-[var(--text-3)] uppercase tracking-widest">Signed in as</p>
                            <p className="text-sm font-semibold text-[var(--text-1)] truncate mt-0.5">{user.email}</p>
                          </div>
                          <Link
                            href="/profile"
                            onClick={() => setUserMenuOpen(false)}
                            className="flex items-center gap-2 px-4 py-2.5 text-sm text-[var(--text-2)] hover:text-[var(--text-1)] hover:bg-[var(--surface)] transition-colors"
                          >
                            <User className="w-4 h-4" /> Profile
                          </Link>
                          <button
                            onClick={handleLogout}
                            className="w-full flex items-center gap-2 px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 transition-colors"
                          >
                            <LogOut className="w-4 h-4" /> Log out
                          </button>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                ) : (
                  // ---- Logged-out state ----
                  <>
                    <Link
                      href="/login"
                      className="text-sm font-semibold text-[var(--text-1)] hover:text-[var(--accent-primary)] transition-colors"
                    >
                      Log in
                    </Link>
                    <Link
                      href="/signup"
                      className="px-5 py-2.5 text-sm font-semibold rounded-full bg-[var(--text-1)] text-white hover:bg-black transition-colors shadow-sm"
                    >
                      Sign up
                    </Link>
                  </>
                )
              )}
            </div>
          </div>

          {/* Mobile right */}
          <div className="flex md:hidden items-center gap-3">
            {!loading && user && (
              <span className="w-7 h-7 rounded-full bg-[var(--text-1)] text-white text-xs font-bold flex items-center justify-center">
                {initials}
              </span>
            )}
            <button
              onClick={() => setMobileOpen(!mobileOpen)}
              className="p-2 text-[var(--text-2)] hover:text-[var(--text-1)] transition-colors"
            >
              {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </nav>
      </header>

      {/* Mobile drawer */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
            className="fixed top-[72px] left-0 right-0 z-40 bg-white border-b border-[var(--border)] md:hidden"
          >
            <div className="px-6 py-6 flex flex-col gap-4">
              {navLinks.filter(l => !l.protected || user).map((link) => {
                const active = pathname === link.href;
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    onClick={() => setMobileOpen(false)}
                    className={`text-lg font-medium ${
                      active ? "text-[var(--text-1)]" : "text-[var(--text-2)]"
                    }`}
                  >
                    {link.label}
                  </Link>
                );
              })}

              <div className="pt-4 border-t border-[var(--border)] flex flex-col gap-3">
                {!loading && (
                  user ? (
                    <>
                      <p className="text-sm text-[var(--text-2)]">Signed in as <strong>{user.name}</strong></p>
                      <Link
                        href="/profile"
                        onClick={() => setMobileOpen(false)}
                        className="flex items-center gap-2 text-sm font-semibold text-[var(--text-1)]"
                      >
                        <User className="w-4 h-4" /> Profile
                      </Link>
                      <button
                        onClick={() => { handleLogout(); setMobileOpen(false); }}
                        className="flex items-center gap-2 text-sm font-semibold text-red-600"
                      >
                        <LogOut className="w-4 h-4" /> Log out
                      </button>
                    </>
                  ) : (
                    <>
                      <Link href="/login"  onClick={() => setMobileOpen(false)} className="text-lg font-medium text-[var(--text-2)]">Log in</Link>
                      <Link href="/signup" onClick={() => setMobileOpen(false)} className="text-lg font-medium text-[var(--text-2)]">Sign up</Link>
                    </>
                  )
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
