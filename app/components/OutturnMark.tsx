/**
 * Outturn brand mark — a bold vector: a circle (the closed loop), a checkmark
 * (accountability / done), and the check's tip growing into a leaf (agriculture).
 * Vector so it stays crisp and legible at any size, with no PNG square behind it.
 * `tone="light"` is for dark surfaces (the dashboard sidebar).
 */
export function OutturnMark({
  size = 32,
  tone = "green",
}: {
  size?: number;
  tone?: "green" | "light";
}) {
  const color = tone === "light" ? "#6EE7A8" : "#157347";
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 48 48"
      fill="none"
      role="img"
      aria-label="Outturn"
      style={{ color, display: "block" }}
    >
      <circle cx="22" cy="25" r="15" stroke="currentColor" strokeWidth="3.4" />
      <path
        d="M13 25l6 6L33 12"
        stroke="currentColor"
        strokeWidth="4"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path d="M33 12c1-5 4-7 9-8 0 5-3 8-9 8z" fill="currentColor" />
    </svg>
  );
}
