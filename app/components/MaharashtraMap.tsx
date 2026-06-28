"use client";

import { useEffect, useRef, useState } from "react";
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
  labelPx = 13,
  className,
  style,
}: {
  highlight: string[];
  showLabels?: boolean;
  maxWidth?: number;
  /** Target on-screen label size in px; kept consistent regardless of map width. */
  labelPx?: number;
  className?: string;
  style?: React.CSSProperties;
}) {
  const want = new Set((highlight || []).map(norm));
  const pins = MH_DISTRICTS.filter((d) => want.has(norm(d.name)));

  // The SVG scales to its rendered width, so a fixed viewBox font size shrinks
  // on small maps and balloons on large ones. Measure the actual rendered SVG
  // width and convert a target *screen* px into viewBox units, so labels read
  // the same size everywhere (small cohort map or the enlarged coverage modal).
  const svgRef = useRef<SVGSVGElement>(null);
  const [renderW, setRenderW] = useState(maxWidth);
  useEffect(() => {
    const el = svgRef.current;
    if (!el) return;
    const ro = new ResizeObserver(([entry]) => {
      const w = entry.contentRect.width;
      if (w > 0) setRenderW(w);
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  const k = MH_VIEWBOX.w / Math.max(renderW, 1);
  const fontSize = +(labelPx * k).toFixed(1);
  const haloW = +(fontSize * 0.3).toFixed(1);
  const pinR = +(4.5 * k).toFixed(1);
  const labelDy = +(pinR + fontSize * 0.65).toFixed(1);

  return (
    <div
      className={className}
      style={{ background: "#F6F2EA", borderRadius: 14, padding: 16, ...style }}
    >
      <svg
        ref={svgRef}
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
            <circle cx={d.cx} cy={d.cy} r={pinR} fill="var(--color-primary)" stroke="#fff" strokeWidth={pinR * 0.34} />
            {showLabels && (
              <text
                x={d.cx}
                y={d.cy - labelDy}
                textAnchor="middle"
                fontSize={fontSize}
                fontWeight={700}
                fill="#1A1714"
                stroke="#FFFFFF"
                strokeWidth={haloW}
                style={{ fontFamily: "var(--font-serif), Georgia, serif", paintOrder: "stroke", strokeLinejoin: "round" }}
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
