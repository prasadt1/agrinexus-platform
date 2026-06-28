"use client";

import { useEffect, useState } from "react";

const C = {
  ink: "#1A1714",
  muted: "#5A554C",
  faint: "#726A5C",
  green: "#157347",
  greenTint: "#E9F1EB",
  border: "#E6E0D4",
  white: "#FFFFFF",
  cream: "#FBF8F2",
};
const SERIF = "var(--font-serif), Georgia, 'Times New Roman', serif";

const NEXT_STEPS: [string, string][] = [
  ["A quick fit call", "A 30-minute call to understand the farmers you serve and the districts you cover."],
  ["Your branded workspace", "We provision a licensed, white-labelled workspace for your organisation."],
  ["Go live", "Create your first district cohort, activate a plan, and start the advisory loop."],
];

export function PartnerLeadForm({
  fallbackEmail = "pilot@prasadtilloo.com",
  label = "Talk to us about a pilot",
  defaultOpen = false,
}: {
  fallbackEmail?: string;
  label?: string;
  defaultOpen?: boolean;
}) {
  const [open, setOpen] = useState(defaultOpen);
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState("");
  const [org, setOrg] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [website, setWebsite] = useState(""); // honeypot

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  function close() {
    setOpen(false);
    // Reset after the close transition so a re-open is fresh.
    setTimeout(() => {
      setDone(false);
      setError("");
      setOrg("");
      setEmail("");
      setMessage("");
      setWebsite("");
    }, 200);
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setError("");
    try {
      const res = await fetch("/api/leads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ org, email, message, website }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(data.error || "Something went wrong. Please email us instead.");
        return;
      }
      setDone(true);
    } catch {
      setError("Couldn’t reach the server. Please email us instead.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <>
      <button type="button" onClick={() => setOpen(true)} style={triggerStyle}>
        {label}
      </button>

      {open && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label="Talk to us about a pilot"
          onClick={close}
          style={overlayStyle}
        >
          <div onClick={(e) => e.stopPropagation()} style={cardStyle}>
            <button aria-label="Close" onClick={close} style={closeStyle}>
              ✕
            </button>

            {!done ? (
              <>
                <p style={{ fontFamily: SERIF, fontSize: 23, fontWeight: 500, margin: "0 0 6px", color: C.ink }}>
                  Talk to us about a pilot
                </p>
                <p style={{ fontSize: 14.5, color: C.muted, margin: "0 0 20px", lineHeight: 1.55 }}>
                  Tell us a little about your organisation and we’ll set up a short fit call. No
                  commitment.
                </p>

                <form onSubmit={submit}>
                  {/* Honeypot — visually hidden, ignored by humans, filled by bots. */}
                  <input
                    type="text"
                    name="website"
                    tabIndex={-1}
                    autoComplete="off"
                    aria-hidden="true"
                    value={website}
                    onChange={(e) => setWebsite(e.target.value)}
                    style={{ position: "absolute", left: "-9999px", width: 1, height: 1, opacity: 0 }}
                  />

                  <label style={labelStyle}>
                    Organisation
                    <input
                      type="text"
                      required
                      value={org}
                      onChange={(e) => setOrg(e.target.value)}
                      placeholder="e.g. GreenHarvest NGO"
                      style={inputStyle}
                    />
                  </label>

                  <label style={labelStyle}>
                    Work email
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="you@organisation.org"
                      style={inputStyle}
                    />
                  </label>

                  <label style={labelStyle}>
                    Anything we should know? <span style={{ color: C.faint, fontWeight: 400 }}>(optional)</span>
                    <textarea
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      placeholder="Crops, districts, rough number of farmers…"
                      rows={3}
                      style={{ ...inputStyle, resize: "vertical" }}
                    />
                  </label>

                  {error && (
                    <p style={{ color: "#B54708", fontSize: 13.5, margin: "0 0 12px" }}>{error}</p>
                  )}

                  <button type="submit" disabled={submitting} style={{ ...triggerStyle, width: "100%", opacity: submitting ? 0.6 : 1 }}>
                    {submitting ? "Sending…" : "Request a pilot call"}
                  </button>
                </form>

                <p style={{ fontSize: 12.5, color: C.faint, margin: "14px 0 0", textAlign: "center" }}>
                  Prefer email?{" "}
                  <a href={`mailto:${fallbackEmail}?subject=Outturn%20partner%20pilot`} style={{ color: C.green }}>
                    {fallbackEmail}
                  </a>
                </p>
              </>
            ) : (
              <>
                <div
                  aria-hidden="true"
                  style={{
                    width: 44,
                    height: 44,
                    borderRadius: 999,
                    background: C.greenTint,
                    color: C.green,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    marginBottom: 14,
                  }}
                >
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
                    <path d="M5 13l4 4L19 7" stroke={C.green} strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </div>
                <p style={{ fontFamily: SERIF, fontSize: 23, fontWeight: 500, margin: "0 0 6px", color: C.ink }}>
                  Thanks{org ? `, ${org}` : ""} — we’re on it.
                </p>
                <p style={{ fontSize: 14.5, color: C.muted, margin: "0 0 22px", lineHeight: 1.55 }}>
                  We’ll reach out within a couple of working days. Here’s what happens next:
                </p>

                <ol style={{ listStyle: "none", margin: 0, padding: 0, display: "flex", flexDirection: "column", gap: 14 }}>
                  {NEXT_STEPS.map(([title, body], i) => (
                    <li key={title} style={{ display: "flex", gap: 12 }}>
                      <span
                        style={{
                          flexShrink: 0,
                          width: 26,
                          height: 26,
                          borderRadius: 999,
                          background: C.greenTint,
                          color: C.green,
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          fontWeight: 600,
                          fontSize: 13,
                        }}
                      >
                        {i + 1}
                      </span>
                      <div>
                        <p style={{ fontWeight: 600, fontSize: 14.5, margin: 0, color: C.ink }}>{title}</p>
                        <p style={{ fontSize: 13.5, color: C.muted, margin: "2px 0 0", lineHeight: 1.5 }}>{body}</p>
                      </div>
                    </li>
                  ))}
                </ol>

                <button type="button" onClick={close} style={{ ...triggerStyle, width: "100%", marginTop: 22 }}>
                  Done
                </button>
              </>
            )}
          </div>
        </div>
      )}
    </>
  );
}

const triggerStyle: React.CSSProperties = {
  background: C.green,
  color: C.white,
  fontSize: 14,
  fontWeight: 500,
  padding: "10px 18px",
  borderRadius: 10,
  border: "none",
  cursor: "pointer",
};

const overlayStyle: React.CSSProperties = {
  position: "fixed",
  inset: 0,
  background: "rgba(20,17,13,0.45)",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  padding: 20,
  zIndex: 100,
};

const cardStyle: React.CSSProperties = {
  position: "relative",
  background: C.white,
  borderRadius: 16,
  padding: "28px 26px",
  width: "100%",
  maxWidth: 440,
  maxHeight: "90vh",
  overflowY: "auto",
  boxShadow: "0 24px 56px -12px rgba(16,24,40,0.22)",
};

const closeStyle: React.CSSProperties = {
  position: "absolute",
  top: 14,
  right: 16,
  background: "none",
  border: "none",
  fontSize: 18,
  lineHeight: 1,
  color: C.faint,
  cursor: "pointer",
};

const labelStyle: React.CSSProperties = {
  display: "block",
  fontSize: 13,
  fontWeight: 600,
  color: C.ink,
  marginBottom: 14,
};

const inputStyle: React.CSSProperties = {
  display: "block",
  width: "100%",
  marginTop: 6,
  padding: "10px 12px",
  fontSize: 14,
  fontWeight: 400,
  color: C.ink,
  background: C.cream,
  border: `1px solid ${C.border}`,
  borderRadius: 9,
  outline: "none",
  fontFamily: "inherit",
};
