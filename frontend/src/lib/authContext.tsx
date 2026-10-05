// =============================================================================
// SPANDANA — Auth Context
// =============================================================================
// The JWT lives in an httpOnly cookie set by the backend — this file NEVER
// touches the token directly. Client JS can't read httpOnly cookies.
// All auth state is derived from the user object returned in response bodies.
// =============================================================================

"use client";

import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  type ReactNode,
} from "react";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface AuthUser {
  id:    string;
  email: string;
  name:  string;
  profile?: {
    profileComplete: boolean;
    weight?:         number;
    height?:         number;
    dateOfBirth?:    string;
    gender?:         string;
    fitnessGoal?:    string;
  };
}

interface AuthState {
  user:       AuthUser | null;
  loading:    boolean;
  login:      (email: string, password: string) => Promise<AuthUser>;
  signup:     (name: string, email: string, password: string, confirmPassword: string) => Promise<AuthUser>;
  logout:     () => Promise<void>;
  updateUser: (user: AuthUser) => void;
}

// ---------------------------------------------------------------------------
// Context
// ---------------------------------------------------------------------------

const AuthContext = createContext<AuthState | null>(null);

const API_URL  = process.env.NEXT_PUBLIC_API_URL ?? "";
const USER_KEY = "spandana_user"; // only non-sensitive user object; no token

/**
 * POST to auth endpoints with credentials:include so the browser attaches
 * and receives the httpOnly cookie automatically.
 */
async function authFetch(path: string, body: object): Promise<{ user: AuthUser }> {
  const res = await fetch(`${API_URL}${path}`, {
    method:      "POST",
    credentials: "include",           // ← critical: sends/receives cookies
    headers:     { "Content-Type": "application/json" },
    body:        JSON.stringify(body),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error ?? "Request failed");
  return data as { user: AuthUser };
}

// ---------------------------------------------------------------------------
// Provider
// ---------------------------------------------------------------------------

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user,    setUser]    = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);

  // On mount: try to restore user from localStorage (non-sensitive).
  // The httpOnly cookie will be validated server-side when a protected
  // API call is made — we just need user info for the UI.
  useEffect(() => {
    try {
      const saved = localStorage.getItem(USER_KEY);
      if (saved) setUser(JSON.parse(saved));
    } catch {
      /* ignore parse errors */
    } finally {
      setLoading(false);
    }
  }, []);

  const persistUser = useCallback((u: AuthUser) => {
    localStorage.setItem(USER_KEY, JSON.stringify(u));
    setUser(u);
  }, []);

  const updateUser = useCallback((u: AuthUser) => {
    localStorage.setItem(USER_KEY, JSON.stringify(u));
    setUser(u);
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    const { user: u } = await authFetch("/auth/login", { email, password });
    persistUser(u);
    return u;
  }, [persistUser]);

  const signup = useCallback(
    async (name: string, email: string, password: string, confirmPassword: string) => {
      const { user: u } = await authFetch("/auth/signup", { name, email, password, confirmPassword });
      persistUser(u);
      return u;
    },
    [persistUser]
  );

  /**
   * Logout calls the backend to clear the httpOnly cookie, then clears
   * local UI state. Client JS cannot clear an httpOnly cookie itself.
   */
  const logout = useCallback(async () => {
    try {
      await fetch(`${API_URL}/auth/logout`, {
        method:      "POST",
        credentials: "include",
      });
    } catch {
      /* best-effort — still clear local state */
    } finally {
      localStorage.removeItem(USER_KEY);
      setUser(null);
    }
  }, []);

  return (
    <AuthContext.Provider value={{ user, loading, login, signup, logout, updateUser }}>
      {children}
    </AuthContext.Provider>
  );
}

// ---------------------------------------------------------------------------
// Hook
// ---------------------------------------------------------------------------

export function useAuth(): AuthState {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside <AuthProvider>");
  return ctx;
}
