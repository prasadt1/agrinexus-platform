import { MH_DISTRICTS } from "@/lib/maharashtra-geo";

const ALIASES: Record<string, string> = {
  sambhajinagar: "aurangabad",
  "chhatrapati sambhajinagar": "aurangabad",
  dharashiv: "osmanabad",
  gondiya: "gondia",
  ahilyanagar: "ahmednagar",
  ahmadnagar: "ahmednagar",
  buldana: "buldhana",
};
function norm(s: string): string {
  const k = (s || "").trim().toLowerCase();
  return ALIASES[k] || k;
}

type Rec = { d: string; vb: string; sw: number };
const BY_NAME = new Map<string, Rec>();
for (const dd of MH_DISTRICTS) {
  const nums = (dd.d.match(/-?\d+(?:\.\d+)?/g) || []).map(Number);
  let minx = Infinity, miny = Infinity, maxx = -Infinity, maxy = -Infinity;
  for (let i = 0; i + 1 < nums.length; i += 2) {
    const x = nums[i], y = nums[i + 1];
    if (x < minx) minx = x;
    if (x > maxx) maxx = x;
    if (y < miny) miny = y;
    if (y > maxy) maxy = y;
  }
  const ext = Math.max(maxx - minx, maxy - miny) || 1;
  const pad = ext * 0.14;
  BY_NAME.set(norm(dd.name), {
    d: dd.d,
    vb: `${minx - pad} ${miny - pad} ${maxx - minx + pad * 2} ${maxy - miny + pad * 2}`,
    sw: Math.max(0.5, ext / 70),
  });
}

// A small thumbnail showing the SHAPE of one district (zoomed from the real
// Maharashtra geometry), filled in the partner's brand colour — a district
// identity, not a crop photo.
export function DistrictThumb({
  district,
  size = 44,
  className,
}: {
  district: string;
  size?: number;
  className?: string;
}) {
  const rec = BY_NAME.get(norm(district));
  return (
    <div
      className={className}
      style={{
        width: size,
        height: size,
        borderRadius: Math.round(size * 0.22),
        background: "#F1ECE0",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        overflow: "hidden",
        flexShrink: 0,
      }}
      aria-label={`${district} district`}
    >
      {rec ? (
        <svg viewBox={rec.vb} width={size * 0.72} height={size * 0.72} style={{ display: "block" }} aria-hidden>
          <path d={rec.d} fill="var(--color-primary)" stroke="#fff" strokeWidth={rec.sw} strokeLinejoin="round" />
        </svg>
      ) : (
        <svg width={size * 0.5} height={size * 0.5} viewBox="0 0 24 24" fill="none" aria-hidden>
          <path
            d="M12 21s7-6.3 7-11a7 7 0 10-14 0c0 4.7 7 11 7 11z"
            fill="var(--color-primary)"
          />
          <circle cx="12" cy="10" r="2.4" fill="#fff" />
        </svg>
      )}
    </div>
  );
}
