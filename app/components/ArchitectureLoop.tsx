/**
 * Holistic three-plane architecture, static.
 *
 *   Control plane (Vercel)        — dashboard, re-nudge/activate, audit log
 *   Data plane   (Amazon DynamoDB)— one table, Streams, roll-ups
 *   Engine       (AWS + WhatsApp) — schedule, nudge, reply, detect
 *
 * Planes are stacked and connected by labeled arrows that attach to the band
 * edges (no floating/orphaned arrows): the engine writes to the data plane,
 * the control plane reads the roll-ups, and the control plane re-nudges /
 * activates the engine. Pure SVG, no animation.
 */
const GREEN = "#157347";
const TEAL = "#0E7490";
const INK = "#1A1714";
const AMBER = "#B45309";

type Plane = {
  key: string;
  name: string;
  platform: string;
  color: string;
  fill: string;
  y: number;
  h: number;
  pills: string[];
};

const PLANES: Plane[] = [
  {
    key: "control",
    name: "CONTROL",
    platform: "Vercel",
    color: INK,
    fill: "#F1EEEA",
    y: 30,
    h: 92,
    pills: ["Next.js dashboard + APIs", "Re-nudge / activate", "Audit log → DynamoDB"],
  },
  {
    key: "data",
    name: "DATA",
    platform: "Amazon DynamoDB",
    color: TEAL,
    fill: "#E2F1F5",
    y: 170,
    h: 92,
    pills: ["Single table", "Streams → Aggregator", "SUMMARY# roll-ups"],
  },
  {
    key: "engine",
    name: "ENGINE",
    platform: "AWS + WhatsApp",
    color: GREEN,
    fill: "#E7F1EA",
    y: 310,
    h: 104,
    pills: ["EventBridge schedule", "NudgeSender (SFN)", "WhatsApp Cloud API", "ResponseDetector"],
  },
];

function layoutPills(pills: string[], cy: number) {
  const startX = 150;
  const endX = 792;
  const gap = 12;
  const ph = 38;
  const pw = (endX - startX - gap * (pills.length - 1)) / pills.length;
  return pills.map((label, i) => ({
    label,
    x: startX + i * (pw + gap),
    w: pw,
    y: cy - ph / 2,
    h: ph,
  }));
}

export function ArchitectureLoop() {
  return (
    <div style={{ marginBottom: 18 }}>
      <div style={{ overflowX: "auto" }}>
        <svg
          viewBox="0 0 900 444"
          role="img"
          aria-labelledby="archt archd"
          style={{ display: "block", width: "100%", minWidth: 680, maxWidth: 900, height: "auto", margin: "0 auto" }}
          fontFamily="var(--font-inter), system-ui, sans-serif"
        >
          <title id="archt">Outturn: control plane, data plane, and engine</title>
          <desc id="archd">
            Three stacked planes — a Vercel control plane, an Amazon DynamoDB data plane, and the
            AWS-plus-WhatsApp engine. The engine writes nudges and replies to the data plane, the
            control plane reads the rolled-up outcomes, and the control plane re-nudges or activates
            the engine over keyless OIDC.
          </desc>

          <defs>
            <marker id="ahInk" markerWidth="8" markerHeight="8" refX="6" refY="3" orient="auto">
              <path d="M0,0 L6,3 L0,6 Z" fill={INK} />
            </marker>
            <marker id="ahAmber" markerWidth="8" markerHeight="8" refX="6" refY="3" orient="auto">
              <path d="M0,0 L6,3 L0,6 Z" fill={AMBER} />
            </marker>
          </defs>

          {/* ---- Plane bands ---- */}
          {PLANES.map((p) => {
            const cy = p.y + p.h / 2;
            const pills = layoutPills(p.pills, cy);
            return (
              <g key={p.key}>
                <rect x="128" y={p.y} width="678" height={p.h} rx="12" fill={p.fill} stroke={p.color} strokeOpacity="0.32" strokeWidth="1.25" />
                {/* left identity chip */}
                <rect x="10" y={p.y + (p.h - 60) / 2} width="104" height="60" rx="10" fill={p.color} />
                <text x="62" y={cy - 3} textAnchor="middle" fontSize="13" fontWeight="700" fill="#fff" letterSpacing="0.5">
                  {p.name}
                </text>
                <text x="62" y={cy + 13} textAnchor="middle" fontSize="9" fill="#fff" opacity="0.88">
                  {p.platform}
                </text>
                {/* component boxes */}
                {pills.map((pill) => (
                  <g key={pill.label}>
                    <rect x={pill.x} y={pill.y} width={pill.w} height={pill.h} rx="9" fill="#fff" stroke={p.color} strokeOpacity="0.4" />
                    <text x={pill.x + pill.w / 2} y={cy + 3.5} textAnchor="middle" fontSize="10.5" fill={INK}>
                      {pill.label}
                    </text>
                  </g>
                ))}
              </g>
            );
          })}

          {/* ---- Connectors between planes (attached to band edges) ---- */}
          {/* Data -> Control: dashboard reads roll-ups */}
          <line x1="300" y1="170" x2="300" y2="124" stroke={INK} strokeWidth="2" markerEnd="url(#ahInk)" />
          <text x="312" y="150" fontSize="10.5" fill="#5A554C">dashboard reads SUMMARY#</text>
          {/* Engine -> Data: engine writes outcomes via Streams */}
          <line x1="300" y1="310" x2="300" y2="264" stroke={INK} strokeWidth="2" markerEnd="url(#ahInk)" />
          <text x="312" y="290" fontSize="10.5" fill="#5A554C">engine writes nudges &amp; replies → Streams</text>

          {/* Control -> Engine: re-nudge / activate (keyless OIDC), right-side connector */}
          <path
            d="M806,76 L832,76 Q840,76 840,84 L840,352 Q840,360 832,360 L810,360"
            fill="none"
            stroke={AMBER}
            strokeWidth="2"
            strokeDasharray="5 5"
            markerEnd="url(#ahAmber)"
          />
          <text transform="rotate(-90 858 218)" x="858" y="218" textAnchor="middle" fontSize="10.5" fontWeight="600" fill={AMBER}>
            re-nudge / activate · OIDC
          </text>
        </svg>
      </div>
    </div>
  );
}
