export function SlideReceiptThread() {
  return (
    <svg viewBox="0 0 1100 720" xmlns="http://www.w3.org/2000/svg" role="img"
      aria-label="Receipt thread: a single WhatsApp conversation as the diagram, with every AWS, Meta, DynamoDB and Vercel service as a hairline footnote, and one green re-nudge loop returning to a fresh advice."
      style={{ display: "block", width: "100%", minWidth: 760, height: "auto" }}
      fontFamily="var(--font-inter), system-ui, sans-serif">
      <defs>
        <marker id="rt-ah" markerWidth="9" markerHeight="9" refX="6" refY="3" orient="auto">
          <path d="M0,0 L6,3 L0,6 Z" fill="#157347" />
        </marker>
      </defs>
      <rect x="0" y="0" width="1100" height="720" fill="#F6F2EA" />
      <text x="565" y="42" fill="#0E7490" fontSize="12" letterSpacing="2.5" textAnchor="middle" fontWeight="600">A SINGLE THREAD · LATUR DISTRICT</text>
      <text x="565" y="60" fill="#9aa18d" fontSize="11" textAnchor="middle">one cohort, today</text>

      {/* LEFT MARGIN — the whole stack as footnotes */}
      <g fontSize="12" fill="#5A554C" textAnchor="end">
        <rect x="446" y="118" width="6" height="6" fill="#157347" /><line x1="446" y1="121" x2="412" y2="121" stroke="#CFC8B8" />
        <text x="404" y="118"><tspan fontWeight="600" fill="#1A1714">Amazon EventBridge</tspan></text><text x="404" y="133">6-hour schedule fires</text>
        <rect x="446" y="158" width="6" height="6" fill="#157347" /><line x1="446" y1="161" x2="412" y2="161" stroke="#CFC8B8" />
        <text x="404" y="158"><tspan fontWeight="600" fill="#1A1714">WeatherPoller</tspan> λ → OpenWeatherMap</text><text x="404" y="173">dry spray window detected</text>
        <rect x="446" y="198" width="6" height="6" fill="#157347" /><line x1="446" y1="201" x2="412" y2="201" stroke="#CFC8B8" />
        <text x="404" y="198"><tspan fontWeight="600" fill="#1A1714">Step Functions → NudgeSender</tspan></text><text x="404" y="213">→ Meta WhatsApp Cloud API</text>
        <rect x="446" y="300" width="6" height="6" fill="#0E7490" /><line x1="446" y1="303" x2="412" y2="303" stroke="#CFC8B8" />
        <text x="404" y="300"><tspan fontWeight="600" fill="#1A1714">API Gateway → WebhookHandler</tspan></text><text x="404" y="315">the &quot;Done&quot; reply lands</text>
        <rect x="446" y="392" width="6" height="6" fill="#0E7490" /><line x1="446" y1="395" x2="412" y2="395" stroke="#CFC8B8" />
        <text x="404" y="392"><tspan fontWeight="600" fill="#1A1714">DynamoDB Streams → ResponseDetector</tspan></text><text x="404" y="407">flips the nudge to done</text>
        <rect x="446" y="432" width="6" height="6" fill="#0E7490" /><line x1="446" y1="435" x2="412" y2="435" stroke="#CFC8B8" />
        <text x="404" y="432"><tspan fontWeight="600" fill="#1A1714">OutcomesAggregator → SUMMARY#</tspan></text><text x="404" y="447">rolls up the 67%</text>
        <rect x="446" y="472" width="6" height="6" fill="#0E7490" /><line x1="446" y1="475" x2="412" y2="475" stroke="#CFC8B8" />
        <text x="404" y="472"><tspan fontWeight="600" fill="#1A1714">Vercel · keyless OIDC</tspan></text><text x="404" y="487">reads the proof, no stored keys</text>
      </g>

      {/* ghost re-entry bubble */}
      <rect x="458" y="76" width="210" height="30" rx="12" fill="#DCF8C6" opacity="0.4" stroke="#157347" strokeDasharray="3 4" strokeOpacity="0.6" />
      <text x="468" y="96" fontSize="11" fill="#157347" opacity="0.85" fontStyle="italic">…and again, for the 14 who slipped</text>

      {/* THE SPINE */}
      <rect x="452" y="112" width="226" height="104" rx="14" fill="#DCF8C6" />
      <text x="466" y="136" fontSize="11.5" fill="#1a2e1a">
        <tspan x="466" dy="0">Good window to spray cotton in</tspan>
        <tspan x="466" dy="15">Latur today — dry through evening.</tspan>
        <tspan x="466" dy="15">Reply <tspan fontWeight="700">Done</tspan> once you&apos;ve sprayed.</tspan>
      </text>
      <text x="654" y="209" fontSize="9" fill="#6b7a5e" textAnchor="end">06:12</text>
      <g transform="translate(658 204.5)" stroke="#34B7F1" strokeWidth="1.4" fill="none" strokeLinecap="round" strokeLinejoin="round">
        <path d="M0 2.4 L2.2 4.6 L7 -1.2" />
        <path d="M4 2.4 L6.2 4.6 L11 -1.2" />
      </g>
      <text x="565" y="244" fontSize="15" fontFamily="Georgia, serif" fontStyle="italic" fill="#726A5C" textAnchor="middle">the farmer sprays, then replies —</text>
      <rect x="556" y="262" width="122" height="42" rx="14" fill="#FFFFFF" stroke="#E6E0D4" />
      <text x="617" y="288" fontSize="13" fill="#157347" fontWeight="700" textAnchor="middle">Done ✓</text>

      {/* proof card */}
      <rect x="448" y="330" width="230" height="168" rx="14" fill="#FFFFFF" stroke="#E6E0D4" />
      <text x="468" y="360" fontSize="10" fill="#726A5C" letterSpacing="1">FOLLOW-THROUGH · THIS MONTH</text>
      <text x="468" y="404" fontSize="40" fontFamily="Georgia, serif" fontWeight="500" fill="#157347">67%</text>
      <rect x="468" y="418" width="190" height="12" rx="6" fill="#EADFCB" />
      <rect x="468" y="418" width="127" height="12" rx="6" fill="#157347" />
      <rect x="592" y="418" width="66" height="12" rx="6" fill="#B54708" />
      <text x="468" y="452" fontSize="12.5" fill="#1A1714">28 of 42 farmers acted</text>
      <rect x="468" y="464" width="120" height="26" rx="13" fill="#157347" />
      <text x="528" y="481" fontSize="11.5" fill="#FFFFFF" fontWeight="600" textAnchor="middle">Re-nudge cohort</text>

      {/* THE LOOP — right gutter, proof → fresh advice */}
      <path d="M678 477 C 880 470, 880 120, 672 104" fill="none" stroke="#157347" strokeWidth="2" strokeDasharray="2 6" strokeLinecap="round" markerEnd="url(#rt-ah)" />
      <text x="892" y="300" fontSize="13" fill="#157347" fontWeight="600" transform="rotate(90 892 300)" textAnchor="middle">RE-NUDGE LOOP — a fresh advice for the 14 who didn&apos;t act</text>
      <text x="24" y="560" fontSize="12.5" fill="#726A5C" textAnchor="start">The conversation is the diagram. Every service sits beside the message it touches.</text>
    </svg>
  );
}
