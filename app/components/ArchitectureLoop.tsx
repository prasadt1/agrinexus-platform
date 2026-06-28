/**
 * Animated architecture diagram: the closed loop drawn as a ring with a pulse
 * travelling the real event path (weather poll -> Step Functions -> WhatsApp
 * nudge -> reply -> stream processing -> Vercel dashboard), around a central
 * Amazon DynamoDB table. Pure SVG/SMIL, no JS, color-coded by plane.
 */
export function ArchitectureLoop() {
  return (
    <div style={{ overflowX: "auto", marginBottom: 16 }}>
      <svg
        viewBox="0 0 680 460"
        role="img"
        aria-labelledby="archt archd"
        style={{ display: "block", width: "100%", minWidth: 600, maxWidth: 720, height: "auto", margin: "0 auto" }}
        fontFamily="var(--font-inter), system-ui, sans-serif"
      >
        <title id="archt">Outturn closed-loop architecture</title>
        <desc id="archd">
          A circular event loop with a pulse travelling clockwise through weather polling, Step
          Functions, the WhatsApp nudge, the farmer reply, stream processing, and the Vercel
          dashboard, all around a central Amazon DynamoDB table.
        </desc>
        <rect x="0" y="0" width="680" height="460" rx="16" fill="#FFFFFF" stroke="#E6E0D4" strokeWidth="1" />

        <ellipse cx="340" cy="210" rx="248" ry="132" fill="none" stroke="#E1DACB" strokeWidth="2" />

        <line x1="340" y1="78" x2="340" y2="183" stroke="#E1DACB" strokeWidth="1.5" />
        <line x1="555" y1="144" x2="395" y2="195" stroke="#E1DACB" strokeWidth="1.5" />
        <line x1="555" y1="276" x2="395" y2="225" stroke="#E1DACB" strokeWidth="1.5" />
        <line x1="340" y1="342" x2="340" y2="237" stroke="#E1DACB" strokeWidth="1.5" />
        <line x1="125" y1="276" x2="285" y2="225" stroke="#E1DACB" strokeWidth="1.5" />
        <line x1="125" y1="144" x2="285" y2="195" stroke="#E1DACB" strokeWidth="1.5" />

        <circle r="5.5" fill="#157347">
          <animateMotion dur="7s" repeatCount="indefinite" path="M 340 78 A 248 132 0 1 1 340 342 A 248 132 0 1 1 340 78" />
        </circle>
        <circle r="5.5" fill="#157347" opacity="0.55">
          <animateMotion dur="7s" begin="-2.33s" repeatCount="indefinite" path="M 340 78 A 248 132 0 1 1 340 342 A 248 132 0 1 1 340 78" />
        </circle>
        <circle r="5.5" fill="#157347" opacity="0.3">
          <animateMotion dur="7s" begin="-4.66s" repeatCount="indefinite" path="M 340 78 A 248 132 0 1 1 340 342 A 248 132 0 1 1 340 78" />
        </circle>

        <g>
          <rect x="265" y="183" width="150" height="54" rx="11" fill="#fff" stroke="#0E7490" strokeWidth="2" />
          <text x="340" y="205" textAnchor="middle" fontSize="13" fontWeight="600" fill="#0E7490">Amazon DynamoDB</text>
          <text x="340" y="221" textAnchor="middle" fontSize="10.5" fill="#5A554C">one table · Streams</text>
        </g>

        <g>
          <rect x="270" y="55" width="140" height="46" rx="10" fill="#fff" stroke="#157347" strokeWidth="1.8" />
          <text x="340" y="76" textAnchor="middle" fontSize="11.5" fontWeight="600" fill="#1A1714">Watch weather</text>
          <text x="340" y="90" textAnchor="middle" fontSize="9" fill="#6F685C">EventBridge · Lambda</text>
        </g>
        <g>
          <rect x="485" y="121" width="140" height="46" rx="10" fill="#fff" stroke="#157347" strokeWidth="1.8" />
          <text x="555" y="142" textAnchor="middle" fontSize="11.5" fontWeight="600" fill="#1A1714">Orchestrate</text>
          <text x="555" y="156" textAnchor="middle" fontSize="9" fill="#6F685C">Step Functions</text>
        </g>
        <g>
          <rect x="485" y="253" width="140" height="46" rx="10" fill="#fff" stroke="#157347" strokeWidth="1.8" />
          <text x="555" y="274" textAnchor="middle" fontSize="11.5" fontWeight="600" fill="#1A1714">Send nudge</text>
          <text x="555" y="288" textAnchor="middle" fontSize="9" fill="#6F685C">Lambda · Meta WhatsApp</text>
        </g>
        <g>
          <rect x="270" y="319" width="140" height="46" rx="10" fill="#fff" stroke="#157347" strokeWidth="1.8" />
          <text x="340" y="340" textAnchor="middle" fontSize="11.5" fontWeight="600" fill="#1A1714">Farmer replies</text>
          <text x="340" y="354" textAnchor="middle" fontSize="9" fill="#6F685C">API Gateway · Lambda</text>
        </g>
        <g>
          <rect x="55" y="253" width="140" height="46" rx="10" fill="#fff" stroke="#0E7490" strokeWidth="1.8" />
          <text x="125" y="274" textAnchor="middle" fontSize="11.5" fontWeight="600" fill="#1A1714">Detect + roll up</text>
          <text x="125" y="288" textAnchor="middle" fontSize="9" fill="#6F685C">Stream Lambdas</text>
        </g>
        <g>
          <rect x="55" y="121" width="140" height="46" rx="10" fill="#fff" stroke="#B45309" strokeWidth="1.8" />
          <text x="125" y="142" textAnchor="middle" fontSize="11.5" fontWeight="600" fill="#1A1714">Monitor + act</text>
          <text x="125" y="156" textAnchor="middle" fontSize="9" fill="#6F685C">Vercel dashboard · OIDC</text>
        </g>

        <g fontSize="11" fill="#6F685C">
          <rect x="232" y="422" width="11" height="11" rx="2" fill="#157347" />
          <text x="249" y="431">Engine (AWS)</text>
          <rect x="338" y="422" width="11" height="11" rx="2" fill="#0E7490" />
          <text x="355" y="431">Data</text>
          <rect x="398" y="422" width="11" height="11" rx="2" fill="#B45309" />
          <text x="415" y="431">Control (Vercel)</text>
        </g>
      </svg>
    </div>
  );
}
