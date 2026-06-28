/**
 * Architecture diagram: the closed loop as a numbered ring of events. A
 * sequenced highlight travels 1 -> 7 (the order of the flow), the farmer on
 * WhatsApp is its own node (the delivery channel), and everything reads/writes
 * the central Amazon DynamoDB. Pure SVG/SMIL, no JS, colour-coded by plane.
 */
const NODES = [
  { n: 1, x: 340, y: 52, title: "Weather", color: "#157347" },
  { n: 2, x: 456, y: 108, title: "Orchestrate", color: "#157347" },
  { n: 3, x: 484, y: 233, title: "Send nudge", color: "#157347" },
  { n: 4, x: 404, y: 333, title: "Farmer", color: "#1DA851", wa: true },
  { n: 5, x: 276, y: 333, title: "Reply", color: "#157347" },
  { n: 6, x: 196, y: 233, title: "Roll up", color: "#0E7490" },
  { n: 7, x: 224, y: 108, title: "Monitor", color: "#B45309" },
];

const SEQ: [number, string, string, string][] = [
  [1, "Watch the weather", "Amazon EventBridge · WeatherPoller Lambda", "#157347"],
  [2, "Orchestrate", "AWS Step Functions", "#157347"],
  [3, "Send the nudge", "NudgeSender Lambda", "#157347"],
  [4, "Deliver to the farmer", "Meta WhatsApp Cloud API", "#1DA851"],
  [5, "Capture the reply", "Amazon API Gateway · WebhookHandler Lambda", "#157347"],
  [6, "Detect + roll up", "ResponseDetector · OutcomesAggregator · DynamoDB Streams", "#0E7490"],
  [7, "Monitor + act", "Vercel dashboard · re-nudge via OIDC", "#B45309"],
];

const LEGEND: [string, string][] = [
  ["Engine — AWS", "#157347"],
  ["Delivery — Meta WhatsApp", "#1DA851"],
  ["Data", "#0E7490"],
  ["Control — Vercel", "#B45309"],
];

export function ArchitectureLoop() {
  return (
    <div style={{ marginBottom: 18 }}>
      <div style={{ overflowX: "auto" }}>
        <svg
          viewBox="0 0 680 400"
          role="img"
          aria-labelledby="archt archd"
          style={{ display: "block", width: "100%", minWidth: 600, maxWidth: 720, height: "auto", margin: "0 auto" }}
          fontFamily="var(--font-inter), system-ui, sans-serif"
        >
          <title id="archt">Outturn closed-loop architecture</title>
          <desc id="archd">
            Seven numbered events arranged in a ring, in order: watch weather, orchestrate, send nudge,
            deliver to the farmer on WhatsApp, capture the reply, detect and roll up, monitor and act,
            all reading and writing a central Amazon DynamoDB table.
          </desc>
          <rect x="0" y="0" width="680" height="400" rx="16" fill="#FBF8F2" stroke="#E6E0D4" strokeWidth="1" />
          <ellipse cx="340" cy="200" rx="148" ry="148" fill="none" stroke="#E1DACB" strokeWidth="1.5" />

          {NODES.map((nd) => (
            <line key={`sp-${nd.n}`} x1={nd.x} y1={nd.y} x2="340" y2="200" stroke="#EAE3D5" strokeWidth="1.5" />
          ))}

          {/* central hub */}
          <g>
            <rect x="273" y="176" width="134" height="48" rx="11" fill="#fff" stroke="#0E7490" strokeWidth="2" />
            <text x="340" y="197" textAnchor="middle" fontSize="12.5" fontWeight="600" fill="#0E7490">Amazon DynamoDB</text>
            <text x="340" y="212" textAnchor="middle" fontSize="9.5" fill="#5A554C">one table · Streams · reads + writes</text>
          </g>

          {/* nodes with a sequenced highlight (1 -> 7) */}
          {NODES.map((nd) => {
            const rx = nd.x - 56;
            const ry = nd.y - 20;
            return (
              <g key={nd.n}>
                <rect x={rx - 5} y={ry - 5} width={122} height={50} rx={12} fill={nd.color} opacity={0}>
                  <animate
                    attributeName="opacity"
                    values="0;0.4;0;0"
                    keyTimes="0;0.07;0.14;1"
                    dur="7s"
                    begin={`${nd.n - 1}s`}
                    repeatCount="indefinite"
                  />
                </rect>
                <rect x={rx} y={ry} width={112} height={40} rx={10} fill="#fff" stroke={nd.color} strokeWidth={1.8} />
                <circle cx={rx + 18} cy={nd.y} r={11} fill={nd.color} />
                <text x={rx + 18} y={nd.y + 4} textAnchor="middle" fontSize="11" fontWeight="700" fill="#fff">
                  {nd.n}
                </text>
                <text x={rx + 35} y={nd.y + 4} fontSize="11.5" fontWeight="600" fill="#1A1714">
                  {nd.title}
                </text>
                {nd.wa && (
                  <path
                    transform={`translate(${rx + 88}, ${nd.y - 6})`}
                    d="M6 0C2.7 0 0 2.7 0 6c0 1.1.3 2.1.8 3L0 12l3.1-.8c.9.5 1.9.7 2.9.7 3.3 0 6-2.7 6-6S9.3 0 6 0z"
                    fill="#1DA851"
                  />
                )}
              </g>
            );
          })}
        </svg>
      </div>

      {/* sequence + service tags */}
      <ol style={{ listStyle: "none", margin: "14px 0 0", padding: 0, display: "grid", gridTemplateColumns: "1fr", gap: 8 }} className="arch-seq">
        {SEQ.map(([n, title, svc, color]) => (
          <li key={n} style={{ display: "flex", alignItems: "baseline", gap: 10 }}>
            <span
              style={{
                flexShrink: 0,
                width: 20,
                height: 20,
                borderRadius: 999,
                background: color,
                color: "#fff",
                display: "inline-flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: 11,
                fontWeight: 700,
              }}
            >
              {n}
            </span>
            <span style={{ fontSize: 13.5, color: "#1A1714" }}>
              <span style={{ fontWeight: 600 }}>{title}</span>
              <span style={{ color: "#5A554C" }}> — {svc}</span>
            </span>
          </li>
        ))}
      </ol>

      <div style={{ display: "flex", flexWrap: "wrap", gap: "8px 16px", marginTop: 14, fontSize: 12, color: "#5A554C" }}>
        {LEGEND.map(([label, color]) => (
          <span key={label} style={{ display: "inline-flex", alignItems: "center", gap: 6 }}>
            <span style={{ width: 10, height: 10, borderRadius: 3, background: color }} />
            {label}
          </span>
        ))}
      </div>
    </div>
  );
}
