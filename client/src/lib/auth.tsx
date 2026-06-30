import { createContext, useContext, useState, useCallback, type ReactNode } from "react";
import { queryClient } from "./queryClient";
import type { PublicUser } from "@shared/schema";

interface AuthState {
  token: string | null;
  user: PublicUser | null;
}

interface AuthContextValue extends AuthState {
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (username: string, email: string, password: string) => Promise<void>;
  logout: () => void;
  authFetch: (method: string, url: string, body?: unknown) => Promise<Response>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AuthState>(() => {
    try {
      const saved = localStorage.getItem("cff_session");
      if (saved) return JSON.parse(saved) as AuthState;
    } catch {}
    return { token: null, user: null };
  });

  const persist = (s: AuthState) => {
    setState(s);
    if (s.token) {
      localStorage.setItem("cff_session", JSON.stringify(s));
    } else {
      localStorage.removeItem("cff_session");
    }
  };

  const handleAuthResponse = useCallback(async (res: Response) => {
    if (!res.ok) {
      const data = await res.json().catch(() => ({ message: "Er ging iets mis" }));
      throw new Error(data.message || "Er ging iets mis");
    }
    const data = await res.json();
    queryClient.clear();
    persist({ token: data.token, user: data.user });
  }, []);

  const login = useCallback(
    (email: string, password: string) =>
      fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      }).then(handleAuthResponse),
    [handleAuthResponse]
  );

  const register = useCallback(
    (username: string, email: string, password: string) =>
      fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, email, password }),
      }).then(handleAuthResponse),
    [handleAuthResponse]
  );

  const logout = useCallback(() => {
    if (state.token) {
      fetch("/api/auth/logout", {
        method: "POST",
        headers: { Authorization: `Bearer ${state.token}` },
      }).catch(() => {});
    }
    queryClient.clear();
    persist({ token: null, user: null });
  }, [state.token]);

  const authFetch = useCallback(
    async (method: string, url: string, body?: unknown): Promise<Response> => {
      const res = await fetch(url, {
        method,
        headers: {
          ...(body ? { "Content-Type": "application/json" } : {}),
          ...(state.token ? { Authorization: `Bearer ${state.token}` } : {}),
        },
        body: body ? JSON.stringify(body) : undefined,
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({ message: res.statusText }));
        throw new Error(data.message || `${res.status}`);
      }
      return res;
    },
    [state.token]
  );

  return (
    <AuthContext.Provider
      value={{ ...state, isAuthenticated: !!state.token, login, register, logout, authFetch }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
