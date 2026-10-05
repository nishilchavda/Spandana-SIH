// =============================================================================
// SPANDANA — Auth Context
// =============================================================================
// Provides login / signup / logout + persists the JWT token in localStorage.
// Wrap the app in <AuthProvider> to use useAuth() in any client component.
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
}

interface AuthState {
  user:    AuthUser | null;
  token:   string | null;
  loading: boolean;
  login:   (email: string, password: string) => Promise<void>;
  signup:  (name: string, email: string, password: string) => Promise<void>;
  logout:  () => void;
}

// ---------------------------------------------------------------------------
// Context
// ---------------------------------------------------------------------------

const AuthContext = createContext<AuthState | null>(null);

const API_URL    = process.env.NEXT_PUBLIC_API_URL ?? "";
const TOKEN_KEY  = "spandana_token";
const USER_KEY   = "spandana_user";

async function authFetch(path: string, body: object) {
  const res = await fetch(`${API_URL}${path}`, {
    method:  "POST",
    headers: { "Content-Type": "application/json" },
    body:    JSON.stringify(body),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error ?? "Request failed");
  return data as { token: string; user: AuthUser };
}

// ---------------------------------------------------------------------------
// Provider
// ---------------------------------------------------------------------------

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user,    setUser]    = useState<AuthUser | null>(null);
  const [token,   setToken]   = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  // Rehydrate from localStorage on mount
  useEffect(() => {
    try {
      const savedToken = localStorage.getItem(TOKEN_KEY);
      const savedUser  = localStorage.getItem(USER_KEY);
      if (savedToken && savedUser) {
        setToken(savedToken);
        setUser(JSON.parse(savedUser));
      }
    } catch {
      /* ignore parse errors */
    } finally {
      setLoading(false);
    }
  }, []);

  const persist = useCallback((t: string, u: AuthUser) => {
    localStorage.setItem(TOKEN_KEY, t);
    localStorage.setItem(USER_KEY, JSON.stringify(u));
    setToken(t);
    setUser(u);
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    const { token: t, user: u } = await authFetch("/auth/login", { email, password });
    persist(t, u);
  }, [persist]);

  const signup = useCallback(async (name: string, email: string, password: string) => {
    const { token: t, user: u } = await authFetch("/auth/register", { name, email, password });
    persist(t, u);
  }, [persist]);

  const logout = useCallback(() => {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
    setToken(null);
    setUser(null);
  }, []);

  return (
    <AuthContext.Provider value={{ user, token, loading, login, signup, logout }}>
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
