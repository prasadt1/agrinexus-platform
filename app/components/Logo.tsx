import { OutturnMark } from "./OutturnMark";

/**
 * AgriNexus brand mark — single source of truth so the sidebar, landing page,
 * login, and judges page all share one asset (public/agrinexus-mark.png).
 * The favicon (app/icon.png) and OG image use the same file.
 */
export function AgriNexusLogo({ size = 32 }: { size?: number }) {
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src="/outturn-mark.png"
      alt="Outturn"
      width={size}
      height={size}
      style={{ display: "block", objectFit: "contain" }}
    />
  );
}

export function AgriNexusWordmark({ light }: { light?: boolean }) {
  return (
    <div className="flex items-center gap-2.5">
      <OutturnMark size={34} tone={light ? "light" : "green"} />
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
    </div>
  );
}
