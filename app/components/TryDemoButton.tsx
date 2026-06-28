"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/context/AuthProvider";

/**
 * One-click "try the live demo": signs in as a demo partner persona and drops
 * straight into the dashboard, no login screen. Falls back to /login on error.
 */
export function TryDemoButton({
  children,
  className,
  style,
  persona = "greenharvest-admin",
}: {
  children: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
  persona?: string;
}) {
  const router = useRouter();
  const { login } = useAuth();
  const [loading, setLoading] = useState(false);

  async function go() {
    setLoading(true);
    try {
      await login(persona);
      router.push("/dashboard");
    } catch {
      router.push("/login");
    }
  }

  return (
    <button onClick={go} disabled={loading} className={className} style={style}>
      {loading ? "Opening the dashboard…" : children}
    </button>
  );
}
