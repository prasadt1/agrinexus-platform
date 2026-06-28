/**
 * Architecture diagram as stacked plane layers. Four labeled lanes — Vercel
 * control, Amazon DynamoDB, the AWS engine, Meta WhatsApp delivery — with the
 * numbered event flow (1 -> 7) and a pulse crossing the layers in sequence.
 * Pure SVG/SMIL, no JS.
 */
const FLOW_PATH = "M170 171 L250 171 L330 171 L410 233 L490 171 L570 109 L650 47";

const SEQ: [number, string, string, string][] = [
  [1, "Watch the weather", "Amazon EventBridge · WeatherPoller λ", "#157347"],
  [2, "Orchestrate", "AWS Step Functions", "#157347"],
  [3, "Send the nudge", "NudgeSender Lambda", "#157347"],
  [4, "Deliver to the farmer", "Meta WhatsApp Cloud API", "#1DA851"],
  [5, "Capture the reply", "API Gateway · WebhookHandler λ", "#157347"],
  [6, "Detect + roll up", "Stream Lambdas → SUMMARY#", "#0E7490"],
  [7, "Monitor + act", "Vercel dashboard · re-nudge via OIDC", "#B45309"],
];

export function ArchitectureLoop() {
  return (
    <div style={{ marginBottom: 18 }}>
      <div style={{ overflowX: "auto" }}>
        <svg
          viewBox="0 0 720 320"
          role="img"
          aria-labelledby="archt archd"
          style={{ display: "block", width: "100%", minWidth: 600, maxWidth: 720, height: "auto", margin: "0 auto" }}
          fontFamily="var(--font-inter), system-ui, sans-serif"
        >
          <title id="archt">Outturn architecture as stacked plane layers</title>
          <desc id="archd">
            Four stacked layers — Vercel control, Amazon DynamoDB, the AWS engine, and Meta WhatsApp
            delivery — with a numbered event flow from 1 to 7 crossing the layers in sequence.
          </desc>
          <rect x="118" y="20" width="592" height="54" rx="10" fill="#FBEFD8" />
          <rect x="118" y="82" width="592" height="54" rx="10" fill="#E1F0F0" />
          <rect x="118" y="144" width="592" height="54" rx="10" fill="#E9F1EB" />
          <rect x="118" y="206" width="592" height="54" rx="10" fill="#E4F5E9" />

          <g textAnchor="start">
            <text x="10" y="44" fontSize="12" fontWeight="600" fill="#B45309">Control</text>
            <text x="10" y="58" fontSize="10" fill="#8A8275">Vercel</text>
            <text x="10" y="106" fontSize="12" fontWeight="600" fill="#0E7490">Data</text>
            <text x="10" y="120" fontSize="10" fill="#8A8275">DynamoDB</text>
            <text x="10" y="168" fontSize="12" fontWeight="600" fill="#157347">Engine</text>
            <text x="10" y="182" fontSize="10" fill="#8A8275">AWS</text>
            <text x="10" y="230" fontSize="12" fontWeight="600" fill="#1DA851">Delivery</text>
            <text x="10" y="244" fontSize="10" fill="#8A8275">Meta WhatsApp</text>
          </g>

          <text x="690" y="113" textAnchor="end" fontSize="9.5" fill="#5A554C">one table · Streams</text>

          <polyline points="170,171 250,171 330,171 410,233 490,171 570,109 650,47" fill="none" stroke="#CFC8B8" strokeWidth="2.5" />
          <path d="M650 47 C 690 47 690 171 530 171" fill="none" stroke="#D9D2C4" strokeWidth="1.5" strokeDasharray="4 4" />
          <text x="556" y="158" fontSize="8.5" fill="#A89F8E">re-nudge</text>

          <circle r="5" fill="#157347">
            <animateMotion dur="6.5s" repeatCount="indefinite" path={FLOW_PATH} />
          </circle>
          <circle r="5" fill="#157347" opacity="0.5">
            <animateMotion dur="6.5s" begin="-2.2s" repeatCount="indefinite" path={FLOW_PATH} />
          </circle>

          <g fontSize="13" fontWeight="700" fill="#fff" textAnchor="middle">
            <circle cx="170" cy="171" r="15" fill="#157347" /><text x="170" y="175">1</text>
            <circle cx="250" cy="171" r="15" fill="#157347" /><text x="250" y="175">2</text>
            <circle cx="330" cy="171" r="15" fill="#157347" /><text x="330" y="175">3</text>
            <circle cx="410" cy="233" r="15" fill="#1DA851" /><text x="410" y="237">4</text>
            <circle cx="490" cy="171" r="15" fill="#157347" /><text x="490" y="175">5</text>
            <circle cx="570" cy="109" r="15" fill="#0E7490" /><text x="570" y="113">6</text>
            <circle cx="650" cy="47" r="15" fill="#B45309" /><text x="650" y="51">7</text>
          </g>
        </svg>
      </div>

      <ol style={{ listStyle: "none", margin: "16px 0 0", padding: 0, display: "grid", gridTemplateColumns: "1fr", gap: 8 }} className="arch-seq">
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
    </div>
  );
}
