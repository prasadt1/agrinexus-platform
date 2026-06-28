/**
 * Outturn brand mark — the generated mark (ring + checkmark sprouting leaves)
 * shipped as a single transparent PNG at /public/outturn-mark.png.
 *
 * Rendered as a CSS mask filled with the brand colour so the ONE asset recolours
 * itself: deep green (#157347) on light surfaces, light green (#6EE7A8) on the
 * dark dashboard sidebar (`tone="light"`). Stays crisp at any size.
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
    <span
      role="img"
      aria-label="Outturn"
      style={{
        display: "inline-block",
        width: size,
        height: size,
        backgroundColor: color,
        WebkitMaskImage: "url(/outturn-mark.png)",
        maskImage: "url(/outturn-mark.png)",
        WebkitMaskRepeat: "no-repeat",
        maskRepeat: "no-repeat",
        WebkitMaskPosition: "center",
        maskPosition: "center",
        WebkitMaskSize: "contain",
        maskSize: "contain",
      }}
    />
  );
}
