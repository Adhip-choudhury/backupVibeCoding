"use client";

import { createContext, useContext, useState, useCallback, useSyncExternalStore, type ReactNode } from "react";
import { loginUser, registerUser, logoutUser, getSession, type Session } from "@/lib/auth";

interface AuthContextType {
  session: Session | null;
  login: (email: string, password: string) => Promise<string | null>;
  signup: (email: string, password: string, name: string) => Promise<string | null>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

function subscribeToSession(callback: () => void) {
  window.addEventListener("storage", callback);
  return () => window.removeEventListener("storage", callback);
}

let cachedSession: Session | null | undefined = undefined;

function getSessionSnapshot(): Session | null {
  const next = getSession();
  if (cachedSession === undefined) {
    cachedSession = next;
  } else if (next === null && cachedSession === null) {
    // both null — stable
  } else if (next?.userId === cachedSession?.userId && next?.email === cachedSession?.email && next?.name === cachedSession?.name) {
    return cachedSession;
  }
  cachedSession = next;
  return next;
}

function getServerSnapshot(): null {
  return null;
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const session = useSyncExternalStore(subscribeToSession, getSessionSnapshot, getServerSnapshot);
  const [, forceUpdate] = useState(0);

  const login = useCallback(async (email: string, password: string): Promise<string | null> => {
    const result = await loginUser(email, password);
    if (result.ok) {
      forceUpdate((n) => n + 1);
      return null;
    }
    return result.error;
  }, []);

  const signup = useCallback(async (email: string, password: string, name: string): Promise<string | null> => {
    const result = await registerUser(email, password, name);
    if (result.ok) {
      const loginResult = await loginUser(email, password);
      if (loginResult.ok) {
        forceUpdate((n) => n + 1);
        return null;
      }
      return "Account created but login failed. Please sign in.";
    }
    return result.error;
  }, []);

  const logout = useCallback(() => {
    logoutUser();
    forceUpdate((n) => n + 1);
  }, []);

  return (
    <AuthContext.Provider value={{ session, login, signup, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextType {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within an AuthProvider");
  return ctx;
}
