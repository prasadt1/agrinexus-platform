export function SlideTeardown() {
  return (
    <svg viewBox="0 0 1460 600" xmlns="http://www.w3.org/2000/svg" role="img"
      aria-label="Teardown: the real WhatsApp thread and Outturn dashboard with each AWS, Vercel and Meta service labelled on the touchpoint it acts on, and a green re-nudge loop."
      style={{ display: "block", width: "100%", minWidth: 980, height: "auto" }}
      fontFamily="var(--font-inter), system-ui, sans-serif">
      <defs>
        <marker id="td-ah" markerWidth="9" markerHeight="9" refX="6" refY="3" orient="auto">
          <path d="M0,0 L6,3 L0,6 Z" fill="#157347" />
        </marker>
      </defs>
      <rect x="0" y="0" width="1460" height="600" fill="#F6F2EA" />
      <text x="56" y="46" fill="#157347" fontSize="12.5" letterSpacing="2" fontWeight="600">HOW IT&apos;S BUILT · A TEARDOWN</text>

      {/* LEFT MARGIN — advice / engine */}
      <g fontSize="12.5" fill="#5A554C" textAnchor="end">
        <rect x="296" y="206" width="6" height="6" fill="#157347" /><line x1="302" y1="209" x2="248" y2="209" stroke="#CFC8B8" />
        <text x="240" y="206"><tspan fontWeight="600" fill="#1A1714">Amazon EventBridge</tspan></text><text x="240" y="221">fires every 6 hours</text>
        <rect x="296" y="268" width="6" height="6" fill="#157347" /><line x1="302" y1="271" x2="248" y2="271" stroke="#CFC8B8" />
        <text x="240" y="268"><tspan fontWeight="600" fill="#1A1714">WeatherPoller</tspan> λ</text><text x="240" y="283">→ OpenWeatherMap, dry window</text>
        <rect x="296" y="330" width="6" height="6" fill="#157347" /><line x1="302" y1="333" x2="248" y2="333" stroke="#CFC8B8" />
        <text x="240" y="330"><tspan fontWeight="600" fill="#1A1714">Step Functions → NudgeSender</tspan></text><text x="240" y="345">→ Meta WhatsApp Cloud API</text>
      </g>

      {/* PHONE */}
      <rect x="316" y="120" width="208" height="392" rx="30" fill="#FBF8F2" stroke="#1A1714" strokeWidth="1.6" />
      <rect x="380" y="132" width="80" height="7" rx="3.5" fill="#1A1714" opacity="0.25" />
      <rect x="330" y="158" width="180" height="324" rx="12" fill="#ECE5D8" />
      <rect x="340" y="176" width="160" height="104" rx="13" fill="#DCF8C6" />
      <text x="352" y="200" fontSize="11.5" fill="#1a2e1a">
        <tspan x="352" dy="0">Good window to spray</tspan>
        <tspan x="352" dy="15">cotton in Latur today —</tspan>
        <tspan x="352" dy="15">dry through evening.</tspan>
        <tspan x="352" dy="15">Reply <tspan fontWeight="700">Done</tspan> once sprayed.</tspan>
      </text>
      <text x="476" y="273" fontSize="9" fill="#6b7a5e" textAnchor="end">06:12</text>
      <g transform="translate(480 268.5)" stroke="#34B7F1" strokeWidth="1.4" fill="none" strokeLinecap="round" strokeLinejoin="round">
        <path d="M0 2.4 L2.2 4.6 L7 -1.2" />
        <path d="M4 2.4 L6.2 4.6 L11 -1.2" />
      </g>
      <rect x="372" y="300" width="128" height="40" rx="13" fill="#FFFFFF" stroke="#E6E0D4" />
      <text x="436" y="325" fontSize="13" fill="#157347" fontWeight="700" textAnchor="middle">Done ✓</text>
      <text x="490" y="356" fontSize="9" fill="#9aa18d" textAnchor="end">06:48</text>
      <text x="420" y="500" fontSize="11" fill="#726A5C" textAnchor="middle" letterSpacing="1">THE FARMER · WHATSAPP</text>

      {/* DASHBOARD SLAB — mirror the real hero card values */}
      <rect x="772" y="150" width="360" height="276" rx="16" fill="#FFFFFF" stroke="#E6E0D4" strokeWidth="1.2" />
      <text x="796" y="186" fontSize="10.5" fill="#726A5C" letterSpacing="1.2">LATUR COTTON COHORT · THIS MONTH</text>
      <text x="796" y="240" fontSize="48" fontFamily="Georgia, serif" fontWeight="500" fill="#157347">67%</text>
      <text x="900" y="238" fontSize="14" fill="#5A554C">follow-through</text>
      <rect x="796" y="258" width="314" height="14" rx="7" fill="#EADFCB" />
      <rect x="796" y="258" width="209" height="14" rx="7" fill="#157347" />
      <rect x="1003" y="258" width="107" height="14" rx="7" fill="#B54708" />
      <text x="796" y="298" fontSize="13.5" fill="#1A1714">28 of 42 farmers acted</text>
      <rect x="796" y="312" width="134" height="32" rx="16" fill="#157347" />
      <text x="863" y="333" fontSize="12.5" fill="#FFFFFF" fontWeight="600" textAnchor="middle">Re-nudge cohort</text>
      <text x="946" y="333" fontSize="12" fill="#B54708">14 haven&apos;t acted</text>
      <text x="952" y="408" fontSize="11" fill="#726A5C" textAnchor="middle" letterSpacing="1">THE PARTNER · OUTTURN DASHBOARD (VERCEL)</text>

      {/* RIGHT MARGIN — proof / data / control */}
      <g fontSize="12.5" fill="#5A554C" textAnchor="start">
        <rect x="1132" y="206" width="6" height="6" fill="#0E7490" /><line x1="1132" y1="209" x2="1180" y2="209" stroke="#CFC8B8" />
        <text x="1188" y="206"><tspan fontWeight="600" fill="#1A1714">API Gateway → WebhookHandler</tspan></text><text x="1188" y="221">the &quot;Done&quot; reply lands</text>
        <rect x="1132" y="262" width="6" height="6" fill="#0E7490" /><line x1="1132" y1="265" x2="1180" y2="265" stroke="#CFC8B8" />
        <text x="1188" y="262"><tspan fontWeight="600" fill="#1A1714">DynamoDB Streams → ResponseDetector</tspan></text><text x="1188" y="277">flips the nudge to done</text>
        <rect x="1132" y="318" width="6" height="6" fill="#0E7490" /><line x1="1132" y1="321" x2="1180" y2="321" stroke="#CFC8B8" />
        <text x="1188" y="318"><tspan fontWeight="600" fill="#1A1714">OutcomesAggregator → SUMMARY#</tspan></text><text x="1188" y="333">rolls up the 67%</text>
        <rect x="1132" y="374" width="6" height="6" fill="#0E7490" /><line x1="1132" y1="377" x2="1180" y2="377" stroke="#CFC8B8" />
        <text x="1188" y="374"><tspan fontWeight="600" fill="#1A1714">Vercel · keyless OIDC</tspan></text><text x="1188" y="389">reads it, no stored keys</text>
      </g>

      {/* THE CLOSED LOOP — pill → back into the advice bubble (a circuit, not a halo) */}
      <path d="M830 330 C 760 500, 560 548, 420 548 C 300 548, 250 470, 250 380 C 250 300, 292 250, 338 232"
        fill="none" stroke="#157347" strokeWidth="2.5" strokeDasharray="2 7" strokeLinecap="round" markerEnd="url(#td-ah)" />
      <text x="600" y="588" fontSize="13" fill="#157347" fontWeight="600" textAnchor="middle">The loop: re-nudge re-fires a fresh WhatsApp advice to the 14 who didn&apos;t act</text>
    </svg>
  );
}
