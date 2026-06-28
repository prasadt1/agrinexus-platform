import { MH_DISTRICTS, MH_VIEWBOX } from "@/lib/maharashtra-geo";

// District-name aliases so renamed / variant spellings still match the geometry.
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

// A stylised map of Maharashtra. Every district forms the silhouette; the
// districts named in `highlight` are filled with the partner's brand colour and
// pinned. Uses real district geometry (projected once, baked into lib/maharashtra-geo).
export function MaharashtraMap({
  highlight,
  showLabels = true,
  maxWidth = 460,
  className,
  style,
}: {
  highlight: string[];
  showLabels?: boolean;
  maxWidth?: number;
  className?: string;
  style?: React.CSSProperties;
}) {
  const want = new Set((highlight || []).map(norm));
  const pins = MH_DISTRICTS.filter((d) => want.has(norm(d.name)));

  return (
    <div
      className={className}
      style={{ background: "#F6F2EA", borderRadius: 14, padding: 16, ...style }}
    >
      <svg
        viewBox={`0 0 ${MH_VIEWBOX.w} ${MH_VIEWBOX.h}`}
        role="img"
        aria-label={
          pins.length
            ? `Map of Maharashtra highlighting ${pins.map((p) => p.name).join(", ")}`
            : "Map of Maharashtra"
        }
        style={{ display: "block", width: "100%", maxWidth, height: "auto", margin: "0 auto" }}
      >
        <g stroke="#FBF8F2" strokeWidth={0.7} strokeLinejoin="round">
          {MH_DISTRICTS.map((d) => (
            <path
              key={d.name}
              d={d.d}
              fill={want.has(norm(d.name)) ? "var(--color-primary)" : "#E7E1D4"}
            />
          ))}
        </g>
        {pins.map((d) => (
          <g key={d.name}>
            <circle cx={d.cx} cy={d.cy} r={6} fill="var(--color-primary)" stroke="#fff" strokeWidth={2} />
            {showLabels && (
              <text
                x={d.cx}
                y={d.cy - 12}
                textAnchor="middle"
                fontSize={15}
                fontWeight={600}
                fill="#1A1714"
                stroke="#F6F2EA"
                strokeWidth={3}
                style={{ fontFamily: "var(--font-serif), Georgia, serif", paintOrder: "stroke" }}
              >
                {d.name}
              </text>
            )}
          </g>
        ))}
      </svg>
    </div>
  );
}
