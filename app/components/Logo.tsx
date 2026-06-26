/**
 * AgriNexus brand mark — single source of truth so the sidebar, landing page,
 * login, and judges page all share one asset (public/agrinexus-mark.png).
 * The favicon (app/icon.png) and OG image use the same file.
 */
export function AgriNexusLogo({ size = 32 }: { size?: number }) {
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src="/agrinexus-mark.png"
      alt="AgriNexus"
      width={size}
      height={size}
      style={{ display: "block", objectFit: "contain" }}
    />
  );
}

export function AgriNexusWordmark({ light }: { light?: boolean }) {
  return (
    <div className="flex items-center gap-2.5">
      <div
        className="flex items-center justify-center"
        style={{
          background: "#FFFFFF",
          border: "1px solid rgba(16,24,40,0.08)",
          boxShadow: "0 1px 2px rgba(16,24,40,0.10)",
          width: 40,
          height: 40,
          borderRadius: 11,
        }}
      >
        <AgriNexusLogo size={30} />
      </div>
      <div className="flex flex-col" style={{ lineHeight: 1.05 }}>
        <span
          style={{
            fontSize: "18px",
            fontWeight: 650,
            color: light ? "#F9FAFB" : "var(--color-text-primary)",
            letterSpacing: "-0.02em",
          }}
        >
          Out<span style={{ color: light ? "#6EE7A8" : "var(--color-primary)" }}>turn</span>
        </span>
        <span
          style={{
            fontSize: "10px",
            fontWeight: 500,
            letterSpacing: "0.04em",
            textTransform: "uppercase",
            color: light ? "rgba(249,250,251,0.62)" : "var(--color-text-muted)",
          }}
        >
          by AgriNexus
        </span>
      </div>
    </div>
  );
}
