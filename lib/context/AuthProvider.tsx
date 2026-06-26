"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import type { UserRole } from "@/lib/entities/types";
import { DEMO_TENANTS } from "@/lib/auth/demo-personas";

export interface AuthState {
  authenticated: boolean;
  loading: boolean;
  userId: string;
  tenantId: string;
  tenantName: string;
  role: UserRole;
  email: string;
}

interface AuthContextValue extends AuthState {
  isAdmin: boolean;
  login: (personaId: string) => Promise<void>;
  logout: () => Promise<void>;
  switchTenant: (tenantId: string) => void;
  authHeaders: () => Record<string, string>;
}

const defaultState: AuthState = {
  authenticated: false,
  loading: true,
  userId: "",
  tenantId: "",
  tenantName: "",
  role: "viewer",
  email: "",
};

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<AuthState>(defaultState);

  const refresh = useCallback(async () => {
    try {
      const res = await fetch("/api/auth/me");
      if (res.ok) {
        const data = await res.json();
        setState({
          authenticated: true,
          loading: false,
          userId: data.userId,
          tenantId: data.tenantId,
          tenantName: data.tenantName || "",
          role: data.role,
          email: data.email,
        });
      } else {
        setState({ ...defaultState, loading: false });
      }
    } catch {
      setState({ ...defaultState, loading: false });
    }
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const login = useCallback(async (personaId: string) => {
    const res = await fetch("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ personaId }),
    });
    if (!res.ok) throw new Error("Login failed");
    await refresh();
  }, [refresh]);

  const logout = useCallback(async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    setState({ ...defaultState, loading: false });
    window.location.href = "/login";
  }, []);

  const switchTenant = useCallback((tenantId: string) => {
    const tenant = DEMO_TENANTS.find((t) => t.tenantId === tenantId);
    setState((prev) => ({
      ...prev,
      tenantId,
      tenantName: tenant?.name || tenantId,
    }));
  }, []);

  const authHeaders = useCallback(() => {
    return { "X-Tenant-ID": state.tenantId };
  }, [state.tenantId]);

  const value = useMemo<AuthContextValue>(
    () => ({
      ...state,
      isAdmin: state.role === "admin",
      login,
      logout,
      switchTenant,
      authHeaders,
    }),
    [state, login, logout, switchTenant, authHeaders]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
