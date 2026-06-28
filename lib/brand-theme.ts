/**
 * brandCssVars — derive the dashboard's brand CSS variables from a single
 * partner brand colour, so white-labelling is one hex value, not a stylesheet.
 *
 * We override the brand/green family (primary, success, active, chart-1) plus
 * the sidebar accent, leaving semantic warning/amber and neutral tokens intact.
 * Applied as inline custom properties on the dashboard root, so the whole
 * subtree re-themes and nothing leaks to the marketing site or login.
 */

type RGB = [number, number, number];

function clampByte(n: number): number {
  return Math.max(0, Math.min(255, Math.round(n)));
}

function hexToRgb(hex: string): RGB {
  const h = hex.replace("#", "").trim();
  const full = h.length === 3 ? h.split("").map((c) => c + c).join("") : h;
  const num = parseInt(full, 16);
  return [(num >> 16) & 255, (num >> 8) & 255, num & 255];
}

function rgbToHex([r, g, b]: RGB): string {
  return "#" + [r, g, b].map((x) => clampByte(x).toString(16).padStart(2, "0")).join("");
}

function mix(a: RGB, b: RGB, t: number): RGB {
  return [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t, a[2] + (b[2] - a[2]) * t];
}

const WHITE: RGB = [255, 255, 255];
const BLACK: RGB = [0, 0, 0];

/** Returns inline CSS custom properties; spread into a React `style` prop. */
export function brandCssVars(hex: string): Record<string, string> {
  let rgb: RGB;
  try {
    rgb = hexToRgb(hex);
    if (rgb.some((v) => Number.isNaN(v))) return {};
  } catch {
    return {};
  }
  const [r, g, b] = rgb;
  const hover = rgbToHex(mix(rgb, BLACK, 0.18));
  const tint = rgbToHex(mix(rgb, WHITE, 0.9));
  const muted = rgbToHex(mix(rgb, WHITE, 0.5));

  return {
    "--color-primary": hex,
    "--color-primary-hover": hover,
    "--color-primary-tint": tint,
    "--color-primary-muted": muted,
    "--color-status-active": hex,
    "--color-status-active-bg": tint,
    "--color-success": hex,
    "--color-success-bg": tint,
    "--color-chart-1": hex,
    "--color-sidebar-active": `rgba(${r}, ${g}, ${b}, 0.35)`,
  };
}
