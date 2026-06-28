/**
 * Holistic architecture — the AgriNexus engine (pre-existing, muted grey) carrying
 * the Outturn / H0 layer (the new, dominant, green work: a control plane on Vercel
 * AND the DynamoDB data modelling that is the scored centrepiece of H0).
 *
 * Colour logic is the ONLY legend you need:
 *   green  = added by Outturn (H0)
 *   grey   = the AgriNexus engine that pre-dated H0 (AWS AIdeas Innovation Award)
 *
 * Bands stack top→bottom: CONTROL (Vercel) · DATA (DynamoDB) · ENGINE (AWS + Meta
 * WhatsApp). Both CONTROL and DATA are green — H0 owns the control surface *and*
 * the single-table schema, Streams→Aggregator (with DEDUPE# idempotency), the
 * SUMMARY# roll-ups, and a separate Vercel-Marketplace-provisioned audit table.
 * Only the engine's raw rows are shared/pre-existing.
 *
 * Connectors attach to band edges: the engine writes to the data plane, Vercel
 * reads the roll-ups over keyless OIDC, and the control plane re-nudges back into
 * the engine at Step Functions / NudgeSender. Pure SVG, no animation.
 */
const GREEN = "#157347";
const GREEN_SOFT = "#3E8E63";
const INK = "#1A1714";
const MUTE = "#6B655C"; // engine (pre-existing) ink
const GREY_STROKE = "#B9B2A6";
const GREY_FILL = "#F2F0EC";

function Row({
  labels,
  cy,
  h,
  stroke,
  textFill = INK,
  startX = 160,
  endX = 850,
  gap = 10,
  fontSize = 10,
  accentIdx = -1,
  allGreen = false,
}: {
  labels: string[];
  cy: number;
  h: number;
  stroke: string;
  textFill?: string;
  startX?: number;
  endX?: number;
  gap?: number;
  fontSize?: number;
  accentIdx?: number;
  allGreen?: boolean;
}) {
  const pw = (endX - startX - gap * (labels.length - 1)) / labels.length;
  return (
    <>
      {labels.map((label, i) => {
        const x = startX + i * (pw + gap);
        const green = allGreen || i === accentIdx;
        return (
          <g key={label}>
            <rect
              x={x}
              y={cy - h / 2}
              width={pw}
              height={h}
              rx="8"
              fill="#fff"
              stroke={green ? GREEN : stroke}
              strokeWidth={green ? 1.3 : 1}
              strokeOpacity={green ? 0.85 : 0.55}
            />
            <text x={x + pw / 2} y={cy + fontSize * 0.34} textAnchor="middle" fontSize={fontSize} fill={green ? GREEN : textFill}>
              {label}
            </text>
          </g>
        );
      })}
    </>
  );
}

export function ArchitectureLoop() {
  return (
    <div style={{ marginBottom: 18 }}>
      <div style={{ overflowX: "auto" }}>
        <svg
          viewBox="0 0 980 624"
          role="img"
          aria-labelledby="archt archd"
          style={{ display: "block", width: "100%", minWidth: 720, maxWidth: 980, height: "auto", margin: "0 auto" }}
          fontFamily="var(--font-inter), system-ui, sans-serif"
        >
          <title id="archt">Outturn control plane and data layer on the AgriNexus engine</title>
          <desc id="archd">
            A green Vercel control plane and a green Amazon DynamoDB data layer (both added by H0) sit
            on the pre-existing grey AgriNexus engine of AWS services plus Meta WhatsApp. The engine
            writes nudges and replies into the table, Vercel reads the rolled-up outcomes over keyless
            OIDC, and the control plane re-nudges back into the engine at Step Functions and the
            NudgeSender. The control plane is extensible to partner APIs and IoT sensors.
          </desc>

          <defs>
            <marker id="ahInk" markerWidth="9" markerHeight="9" refX="6" refY="3" orient="auto">
              <path d="M0,0 L6,3 L0,6 Z" fill={INK} />
            </marker>
            <marker id="ahGreen" markerWidth="9" markerHeight="9" refX="6" refY="3" orient="auto">
              <path d="M0,0 L6,3 L0,6 Z" fill={GREEN} />
            </marker>
            <marker id="ahMute" markerWidth="9" markerHeight="9" refX="6" refY="3" orient="auto">
              <path d="M0,0 L6,3 L0,6 Z" fill={MUTE} />
            </marker>
          </defs>

          {/* ---- Legend ---- */}
          <g>
            <rect x="12" y="12" width="13" height="13" rx="3" fill={GREEN} />
            <text x="31" y="22.5" fontSize="10.5" fill={INK}>Added by Outturn (H0)</text>
            <rect x="184" y="12" width="13" height="13" rx="3" fill={GREY_STROKE} />
            <text x="203" y="22.5" fontSize="10.5" fill={MUTE}>AgriNexus engine — pre-existing (AWS AIdeas Innovation Award)</text>
          </g>

          {/* ---- Extensible bar (top) ---- */}
          <rect x="128" y="40" width="736" height="30" rx="8" fill="none" stroke={GREEN_SOFT} strokeWidth="1.1" strokeDasharray="5 4" />
          <text x="496" y="59" textAnchor="middle" fontSize="10.5" fill={GREEN_SOFT}>
            Extensible — partner APIs · IoT / soil sensors plug into the control plane
          </text>
          {[300, 496, 692].map((x) => (
            <line key={x} x1={x} y1="70" x2={x} y2="86" stroke={GREEN_SOFT} strokeWidth="1.4" strokeDasharray="3 3" markerEnd="url(#ahGreen)" />
          ))}

          {/* ================= CONTROL PLANE (green) ================= */}
          <rect x="128" y="88" width="736" height="132" rx="12" fill="#E7F1EA" stroke={GREEN} strokeOpacity="0.45" strokeWidth="1.4" />
          <rect x="12" y="124" width="104" height="60" rx="10" fill={GREEN} />
          <text x="64" y="149" textAnchor="middle" fontSize="13" fontWeight="700" fill="#fff" letterSpacing="0.4">CONTROL</text>
          <text x="64" y="165" textAnchor="middle" fontSize="9" fill="#fff" opacity="0.9">Vercel · Next.js</text>
          <Row labels={["Multi-tenant, white-label dashboard", "Cohort provisioning", "Stripe licensing"]} cy={126} h={40} stroke={GREEN} allGreen />
          <Row labels={["Follow-through roll-ups", "Re-nudge / activate", "Reports · Activity · Leads"]} cy={182} h={40} stroke={GREEN} allGreen />

          {/* ================= DATA PLANE (green — H0 owns the schema) ================= */}
          <rect x="128" y="236" width="736" height="128" rx="12" fill="#E9F1EB" stroke={GREEN} strokeOpacity="0.45" strokeWidth="1.4" />
          <rect x="12" y="270" width="104" height="60" rx="10" fill={GREEN} />
          <text x="64" y="295" textAnchor="middle" fontSize="13" fontWeight="700" fill="#fff" letterSpacing="0.3">DATA</text>
          <text x="64" y="311" textAnchor="middle" fontSize="9" fill="#fff" opacity="0.9">DynamoDB</text>
          <Row labels={["Single-table schema — cohorts · members · licenses", "Streams \u2192 Aggregator · DEDUPE# idempotency"]} cy={268} h={34} stroke={GREEN} allGreen fontSize={9.5} />
          <Row labels={["SUMMARY# follow-through roll-ups", "Audit table — Vercel Marketplace · own OIDC role"]} cy={308} h={34} stroke={GREEN} allGreen fontSize={9.5} />
          <text x="160" y="352" fontSize="8.5" fill={MUTE}>
            Shared base: the engine&apos;s raw rows (USER# · PROFILE · NUDGE#) live in the same table.
          </text>

          {/* ================= ENGINE (grey, deep, pre-existing) ================= */}
          <rect x="128" y="380" width="736" height="196" rx="12" fill={GREY_FILL} stroke={GREY_STROKE} strokeWidth="1.25" />
          <rect x="12" y="438" width="104" height="80" rx="10" fill="#7A756C" />
          <text x="64" y="472" textAnchor="middle" fontSize="12.5" fontWeight="700" fill="#fff" letterSpacing="0.3">ENGINE</text>
          <text x="64" y="487" textAnchor="middle" fontSize="8" fill="#fff" opacity="0.92">AgriNexus</text>
          <text x="64" y="499" textAnchor="middle" fontSize="8" fill="#fff" opacity="0.92">AWS + WhatsApp</text>

          <Row labels={["API Gateway + WAF", "Meta WhatsApp Cloud API", "EventBridge — schedule + scheduler"]} cy={406} h={24} stroke={GREY_STROKE} textFill={MUTE} fontSize={9} />
          {/* 9 Lambdas — one wide pill to show compute depth */}
          <rect x="160" y="422" width="690" height="24" rx="7" fill="#fff" stroke={GREY_STROKE} strokeOpacity="0.55" />
          <text x="505" y="437.5" textAnchor="middle" fontSize="9" fill={MUTE}>
            9 Lambdas — Webhook · Message · Voice · WebChat · Nudge · Reminder · ResponseDetector · WeatherPoller · DLQ
          </text>
          <Row labels={["SQS FIFO \u00d72", "Step Functions", "SNS"]} cy={460} h={24} stroke={GREY_STROKE} textFill={MUTE} fontSize={9} />
          <Row labels={["Bedrock + Knowledge Base", "Transcribe", "Polly", "S3 \u00d72"]} cy={490} h={24} stroke={GREY_STROKE} textFill={MUTE} fontSize={9} />
          <Row labels={["CloudWatch \u00d73", "X-Ray", "Secrets Manager"]} cy={520} h={24} stroke={GREY_STROKE} textFill={MUTE} fontSize={9} />
          <text x="496" y="560" textAnchor="middle" fontSize="9.5" fill={MUTE} fontStyle="italic">
            100% serverless · multi-region ready · ~$0.54 / farmer / year
          </text>

          {/* ---- Connectors (centre-left) ---- */}
          {/* engine -> data : writes */}
          <line x1="270" y1="380" x2="270" y2="364" stroke={MUTE} strokeWidth="2" markerEnd="url(#ahMute)" />
          <text x="282" y="375" fontSize="9.5" fill={MUTE}>writes nudges &amp; replies</text>
          {/* data -> control : reads over OIDC */}
          <line x1="270" y1="236" x2="270" y2="220" stroke={INK} strokeWidth="2" markerEnd="url(#ahInk)" />
          <text x="282" y="231" fontSize="9.5" fill="#5A554C">Vercel reads roll-ups · keyless OIDC</text>

          {/* ---- Control -> Engine : re-nudge into Step Functions / NudgeSender (right loop) ---- */}
          <path
            d="M864,150 L900,150 Q912,150 912,162 L912,448 Q912,460 900,460 L866,460"
            fill="none"
            stroke={GREEN}
            strokeWidth="2"
            strokeDasharray="6 5"
            markerEnd="url(#ahGreen)"
          />
          <text transform="rotate(-90 938 305)" x="938" y="305" textAnchor="middle" fontSize="10" fontWeight="600" fill={GREEN}>
            re-nudge &#8594; Step Functions / NudgeSender
          </text>
        </svg>
      </div>
    </div>
  );
}
