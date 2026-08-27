"use client";

/**
 * DEMO sign-in (§31 safe).
 *
 * There is NO real authentication: no password, OTP, Aadhaar, phone or
 * server. A "sign in" simply stores a display name in the browser so the
 * UI can greet the user and attribute filed grievances. Nothing is
 * verified and nothing sensitive is collected or transmitted.
 */
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

export interface DemoUser {
  name: string;
}

interface AuthContextValue {
  user: DemoUser | null;
  signIn: (name: string) => void;
  signOut: () => void;
  ready: boolean;
}

const AuthContext = createContext<AuthContextValue | null>(null);
const STORAGE_KEY = "agla-kadam.user";

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<DemoUser | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) setUser(JSON.parse(raw) as DemoUser);
    } catch {
      /* ignore */
    }
    setReady(true);
  }, []);

  const signIn = useCallback((name: string) => {
    const u: DemoUser = { name: name.trim() || "Demo User" };
    setUser(u);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(u));
    } catch {
      /* ignore */
    }
  }, []);

  const signOut = useCallback(() => {
    setUser(null);
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch {
      /* ignore */
    }
  }, []);

  const value = useMemo(
    () => ({ user, signIn, signOut, ready }),
    [user, signIn, signOut, ready]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
