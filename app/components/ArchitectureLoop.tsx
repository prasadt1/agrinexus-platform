/**
 * Three-plane architecture, static. The story this section tells is the build
 * narrative, not an animated loop:
 *
 *   - Delivery / accountability engine (bottom)  = AgriNexus on AWS + WhatsApp.
 *     PROVEN — it already shipped and won the AWS AIdeas award.
 *   - Data plane (middle) = one DynamoDB table + Streams. EXTENDED for reporting.
 *   - Control plane (top) = Vercel dashboard + OIDC. NEW for H0.
 *
 * The foundation sits at the base; the two new planes are built on top. Two
 * contained vertical arrows on the right carry the loop: outcomes roll UP
 * (reply -> roll up -> report) and the partner re-nudge flows DOWN to the engine.
 * No arrows leave the frame. Pure SVG, no animation.
 */
const GREEN = "#157347";
const TEAL = "#0E7490";
const INK = "#1A1714";
const AMBER = "#B45309";

type Pill = { label: string; n?: number };
type Plane = {
  key: string;
  name: string;
  platform: string;
  status: string;
  color: string;
  fill: string;
  y: number;
  h: number;
  pills: Pill[];
};

const PLANES: Plane[] = [
  {
    key: "control",
    name: "CONTROL",
    platform: "Vercel · Outturn",
    status: "NEW · H0",
    color: INK,
    fill: "#F1EEEA",
    y: 40,
    h: 96,
    pills: [
      { label: "Dashboard reads SUMMARY#", n: 6 },
      { label: "Re-nudge · OIDC", n: 7 },
      { label: "Audit log · Marketplace" },
    ],
  },
  {
    key: "data",
    name: "DATA",
    platform: "Amazon DynamoDB",
    status: "EXTENDED · reporting",
    color: TEAL,
    fill: "#E2F1F5",
    y: 150,
    h: 96,
    pills: [
      { label: "One table + Streams" },
      { label: "OutcomesAggregator → SUMMARY#", n: 5 },
    ],
  },
  {
    key: "engine",
    name: "ENGINE",
    platform: "AgriNexus",
    status: "PROVEN · won AWS AIdeas",
    color: GREEN,
    fill: "#E7F1EA",
    y: 260,
    h: 116,
    pills: [
      { label: "EventBridge poller", n: 1 },
      { label: "NudgeSender (SFN)", n: 2 },
      { label: "WhatsApp reply", n: 3 },
      { label: "Webhook detect", n: 4 },
    ],
  },
];

// Lay pills left-to-right inside a plane's content band.
function layoutPills(pills: Pill[], color: string, cy: number) {
  const startX = 150;
  const gap = 12;
  const ph = 38;
  // Even widths sized to the content band (150 -> 792).
  const totalW = 792 - startX - gap * (pills.length - 1);
  const pw = totalW / pills.length;
  return pills.map((p, i) => {
    const x = startX + i * (pw + gap);
    return { ...p, x, w: pw, y: cy - ph / 2, h: ph, color };
  });
}

export function ArchitectureLoop() {
  return (
    <div style={{ marginBottom: 18 }}>
      <div style={{ overflowX: "auto" }}>
        <svg
          viewBox="0 0 900 420"
          role="img"
          aria-labelledby="archt archd"
          style={{ display: "block", width: "100%", minWidth: 680, maxWidth: 900, height: "auto", margin: "0 auto" }}
          fontFamily="var(--font-inter), system-ui, sans-serif"
        >
          <title id="archt">Outturn: three planes built on a proven engine</title>
          <desc id="archd">
            Three stacked planes. The base is the AgriNexus accountability engine on AWS and WhatsApp,
            which already won the AWS AIdeas award. Built on top for H0 are the Amazon DynamoDB data
            plane, extended for reporting, and the Vercel control plane. Outcomes roll up from the
            engine to the dashboard; partner re-nudges flow back down to the engine.
          </desc>

          <defs>
            <marker id="upHead" markerWidth="10" markerHeight="10" refX="3" refY="2.5" orient="auto">
              <path d="M0,5 L3,0 L6,5 Z" fill={GREEN} />
            </marker>
            <marker id="downHead" markerWidth="10" markerHeight="10" refX="3" refY="3.5" orient="auto">
              <path d="M0,1 L3,6 L6,1 Z" fill={AMBER} />
            </marker>
          </defs>

          {/* ---- Plane bands ---- */}
          {PLANES.map((p) => {
            const cy = p.y + p.h / 2;
            const pills = layoutPills(p.pills, p.color, cy);
            return (
              <g key={p.key}>
                {/* band */}
                <rect x="128" y={p.y} width="678" height={p.h} rx="12" fill={p.fill} stroke={p.color} strokeOpacity="0.32" strokeWidth="1.25" />
                {/* left identity chip */}
                <rect x="10" y={p.y + (p.h - 64) / 2} width="104" height="64" rx="10" fill={p.color} />
                <text x="62" y={cy - 4} textAnchor="middle" fontSize="13" fontWeight="700" fill="#fff" letterSpacing="0.5">
                  {p.name}
                </text>
                <text x="62" y={cy + 12} textAnchor="middle" fontSize="8.5" fill="#fff" opacity="0.88">
                  {p.platform}
                </text>
                {/* status badge, top-right of band */}
                <text x="794" y={p.y + 19} textAnchor="end" fontSize="10" fontWeight="700" fill={p.color}>
                  {p.status}
                </text>
                {/* component pills */}
                {pills.map((pill) => (
                  <g key={pill.label}>
                    <rect x={pill.x} y={pill.y} width={pill.w} height={pill.h} rx="9" fill="#fff" stroke={p.color} strokeOpacity="0.4" />
                    {pill.n != null ? (
                      <>
                        <circle cx={pill.x + 18} cy={cy} r="9.5" fill={p.color} />
                        <text x={pill.x + 18} y={cy + 3.5} textAnchor="middle" fontSize="10.5" fontWeight="700" fill="#fff">
                          {pill.n}
                        </text>
                      </>
                    ) : null}
                    <text x={pill.n != null ? pill.x + 33 : pill.x + 12} y={cy + 3.5} fontSize="10.5" fill={INK}>
                      {pill.label}
                    </text>
                  </g>
                ))}
              </g>
            );
          })}

          {/* ---- Contained loop arrows in the right channel ---- */}
          {/* outcomes roll UP: engine -> data -> control */}
          <line x1="836" y1="318" x2="836" y2="100" stroke={GREEN} strokeWidth="2.5" markerEnd="url(#upHead)" />
          <text transform="rotate(-90 836 208)" x="836" y="208" textAnchor="middle" fontSize="10" fontWeight="600" fill={GREEN}>
            outcomes ↑
          </text>
          {/* re-nudge flows DOWN: control -> engine (manual, dashed) */}
          <line x1="872" y1="100" x2="872" y2="318" stroke={AMBER} strokeWidth="2" strokeDasharray="5 5" markerEnd="url(#downHead)" />
          <text transform="rotate(-90 872 208)" x="872" y="208" textAnchor="middle" fontSize="10" fontWeight="600" fill={AMBER}>
            re-nudge ↓
          </text>
        </svg>
      </div>

      {/* Legend: the build story + what the two arrows mean */}
      <div
        style={{
          display: "flex",
          flexWrap: "wrap",
          gap: "10px 22px",
          margin: "16px 0 0",
          fontSize: 13,
          color: "#5A554C",
        }}
        className="arch-seq"
      >
        <LegendDot color={GREEN}>
          <b style={{ color: "#1A1714" }}>Engine</b> — proven, won AWS AIdeas
        </LegendDot>
        <LegendDot color={TEAL}>
          <b style={{ color: "#1A1714" }}>Data</b> — extended for reporting
        </LegendDot>
        <LegendDot color={INK}>
          <b style={{ color: "#1A1714" }}>Control</b> — new for H0
        </LegendDot>
        <span style={{ color: "#8A8275" }}>
          ↑ outcomes roll up &nbsp;·&nbsp; ↓ partner re-nudge
        </span>
      </div>
    </div>
  );
}

function LegendDot({ color, children }: { color: string; children: React.ReactNode }) {
  return (
    <span style={{ display: "inline-flex", alignItems: "center", gap: 8 }}>
      <span style={{ width: 11, height: 11, borderRadius: 999, background: color, flexShrink: 0 }} />
      {children}
    </span>
  );
}
