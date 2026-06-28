"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { DEMO_PERSONAS } from "@/lib/auth/demo-personas";
import { AgriNexusWordmark } from "@/app/components/Logo";
import { useAuth } from "@/lib/context/AuthProvider";

export default function LoginPage() {
  const router = useRouter();
  const { login, authenticated, loading } = useAuth();
  const [loadingPersona, setLoadingPersona] = useState<string | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!loading && authenticated) {
      router.replace("/dashboard");
    }
  }, [loading, authenticated, router]);

  if (loading || authenticated) {
    return (
      <div
        className="min-h-screen flex items-center justify-center"
        style={{ background: "var(--color-page-bg)" }}
        role="status"
        aria-label="Loading"
      >
        <div className="w-full max-w-md px-8">
          <div className="skeleton" style={{ width: 140, height: 30, marginBottom: 28 }} />
          <div className="skeleton" style={{ width: 120, height: 24, marginBottom: 8 }} />
          <div className="skeleton" style={{ width: 220, height: 16, marginBottom: 28 }} />
          <div className="space-y-3">
            {[0, 1, 2].map((i) => (
              <div key={i} className="skeleton" style={{ height: 72 }} />
            ))}
          </div>
        </div>
      </div>
    );
  }

  async function handleLogin(personaId: string) {
    setLoadingPersona(personaId);
    setError("");
    try {
      await login(personaId);
      router.push("/dashboard");
    } catch {
      setError("Login failed. Please try again.");
    } finally {
      setLoadingPersona(null);
    }
  }

  return (
    <div className="min-h-screen flex">
      {/* Left panel — brand */}
      <div
        className="hidden lg:flex lg:w-1/2 flex-col justify-between p-12"
        style={{ background: "var(--color-sidebar-bg)" }}
      >
        <AgriNexusWordmark light />
        <div>
          <h1
            className="text-3xl font-semibold leading-tight mb-4"
            style={{ color: "var(--color-sidebar-text-active)" }}
          >
            The control plane for agricultural advisory at scale
          </h1>
          <p className="text-lg leading-relaxed" style={{ color: "var(--color-sidebar-text)" }}>
            Provision district cohorts in minutes. Monitor whether farmers actually acted on advice — not just message delivery.
          </p>
          <p className="mt-6 text-sm" style={{ color: "var(--color-sidebar-text)" }}>
            Built on Amazon DynamoDB + Vercel for the{" "}
            <a href="https://h01.devpost.com/" className="underline" style={{ color: "var(--color-primary-muted)" }}>
              H0 Hackathon
            </a>
            .
          </p>
        </div>
        <p className="text-xs" style={{ color: "var(--color-sidebar-text)" }}>
          AgriNexus AI — winner of the AWS AIdeas Innovation Award.
        </p>
      </div>

      {/* Right panel — login */}
      <div className="flex-1 flex items-center justify-center p-8" style={{ background: "var(--color-page-bg)" }}>
        <div className="w-full max-w-md">
          <div className="lg:hidden mb-8">
            <AgriNexusWordmark />
          </div>

          <h2 className="text-page-title mb-2">Sign in</h2>
          <p className="mb-8" style={{ color: "var(--color-text-secondary)" }}>
            Demo access for judges — select a partner persona below.
          </p>

          {error && (
            <div className="mb-4 p-3 rounded-lg" style={{ background: "var(--color-status-attention-bg)" }}>
              <p style={{ color: "var(--color-status-attention)" }}>{error}</p>
            </div>
          )}

          <div className="space-y-3">
            {DEMO_PERSONAS.map((persona) => (
              <button
                key={persona.id}
                onClick={() => handleLogin(persona.id)}
                disabled={loadingPersona !== null}
                className="w-full text-left p-4 rounded-lg border transition-all hover:shadow-md disabled:opacity-60"
                style={{
                  background: "var(--color-surface)",
                  borderColor: "var(--color-border)",
                }}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">{persona.label}</p>
                    <p className="text-sm mt-0.5" style={{ color: "var(--color-text-muted)" }}>
                      {persona.description}
                    </p>
                  </div>
                  <span
                    className="text-xs px-2 py-1 rounded-full capitalize"
                    style={{
                      background: persona.role === "admin" ? "var(--color-primary-tint)" : "var(--color-page-bg)",
                      color: persona.role === "admin" ? "var(--color-primary)" : "var(--color-text-muted)",
                    }}
                  >
                    {persona.role}
                  </span>
                </div>
                {loadingPersona === persona.id && (
                  <p className="text-sm mt-2" style={{ color: "var(--color-primary)" }}>Signing in…</p>
                )}
              </button>
            ))}
          </div>

          <p className="mt-8 text-center text-sm" style={{ color: "var(--color-text-muted)" }}>
            <Link href="/" className="hover:underline" style={{ color: "var(--color-primary)" }}>
              ← Back to home
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
