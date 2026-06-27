/**
 * CropIcon — a small, monochrome line glyph per crop type, so partners can scan
 * cohorts by what's growing there. Drawn in `currentColor` and a single
 * consistent stroke weight (matching the app's other icons), used as a quiet
 * functional identifier — not decorative agtech clip-art.
 */

function normalizeCrop(c: string): string {
  const k = (c || "").trim().toLowerCase();
  const synonyms: Record<string, string> = {
    soy: "soybean",
    soya: "soybean",
    soybeans: "soybean",
    peanut: "groundnut",
    peanuts: "groundnut",
    "ground nut": "groundnut",
    corn: "maize",
    paddy: "rice",
    grape: "grapes",
  };
  return synonyms[k] ?? k;
}

const ICONS: Record<string, React.ReactNode> = {
  cotton: (
    <>
      <path d="M12 13.5V20" />
      <path d="M12 17.5c-2.5 0-3.5-1.2-4-2.5" />
      <g fill="currentColor" stroke="none">
        <circle cx="12" cy="8.5" r="3.1" />
        <circle cx="8.7" cy="10.8" r="2.5" />
        <circle cx="15.3" cy="10.8" r="2.5" />
        <circle cx="12" cy="11.9" r="2.7" />
      </g>
    </>
  ),
  soybean: (
    <>
      <rect x="4" y="9.3" width="16" height="5.4" rx="2.7" />
      <g fill="currentColor" stroke="none">
        <circle cx="8.2" cy="12" r="1.25" />
        <circle cx="12" cy="12" r="1.25" />
        <circle cx="15.8" cy="12" r="1.25" />
      </g>
    </>
  ),
  groundnut: (
    <>
      <path d="M12 3.5c-2.6 0-3.6 2.4-3.6 4.2 0 1.3.9 2.2.9 3.3s-.9 1.8-.9 3.1c0 2.2 1 4.4 3.6 4.4s3.6-2.2 3.6-4.4c0-1.3-.9-2-.9-3.1s.9-2 .9-3.3c0-1.8-1-4.2-3.6-4.2z" />
      <path d="M9.2 8.2h5.6M9.2 14.4h5.6" />
    </>
  ),
  wheat: (
    <>
      <path d="M12 21V10.5" />
      <path d="M12 10.5c0-2.1 1.7-3.3 1.7-3.3M12 10.5c0-2.1-1.7-3.3-1.7-3.3" />
      <path d="M12 14c1.9 0 3.3-1.5 3.3-3.6M12 14c-1.9 0-3.3-1.5-3.3-3.6" />
      <path d="M12 17.3c1.9 0 3.3-1.5 3.3-3.6M12 17.3c-1.9 0-3.3-1.5-3.3-3.6" />
    </>
  ),
  rice: (
    <>
      <path d="M6 5c5 .5 8 3.5 9 9" />
      <g fill="currentColor" stroke="none">
        <ellipse cx="7.5" cy="6.3" rx="1.4" ry="0.7" transform="rotate(35 7.5 6.3)" />
        <ellipse cx="10" cy="8" rx="1.4" ry="0.7" transform="rotate(45 10 8)" />
        <ellipse cx="12.2" cy="10.5" rx="1.4" ry="0.7" transform="rotate(55 12.2 10.5)" />
        <ellipse cx="13.8" cy="13.5" rx="1.4" ry="0.7" transform="rotate(65 13.8 13.5)" />
      </g>
    </>
  ),
  maize: (
    <>
      <path d="M10.5 4.5c-3 0-4.5 3.5-4.5 8s1.5 7 4.5 7 4.5-2.5 4.5-7-1.5-8-4.5-8z" />
      <path d="M10.5 6v13M7 9.5h7M7 13h7M7 16.5h7" strokeWidth="1.1" />
      <path d="M15 9c3-1.5 4 1 3.2 3.8C16.8 13 15 11.5 15 9z" fill="currentColor" stroke="none" />
    </>
  ),
  grapes: (
    <>
      <path d="M12 10V6.5" />
      <path d="M12 6.5c1.5-.3 2.5-1.3 2.8-2.8-1.5.3-2.5 1.3-2.8 2.8z" fill="currentColor" stroke="none" />
      <g fill="currentColor" stroke="none">
        <circle cx="8.5" cy="11" r="1.7" />
        <circle cx="12" cy="11" r="1.7" />
        <circle cx="15.5" cy="11" r="1.7" />
        <circle cx="10.2" cy="14" r="1.7" />
        <circle cx="13.8" cy="14" r="1.7" />
        <circle cx="12" cy="17" r="1.7" />
      </g>
    </>
  ),
  mustard: (
    <>
      <path d="M12 21V8" />
      <path d="M12 14c-2.6 0-4-1.4-5-3" />
      <g fill="currentColor" stroke="none">
        <circle cx="12" cy="5" r="1.2" />
        <circle cx="9.6" cy="6.4" r="1.1" />
        <circle cx="14.4" cy="6.4" r="1.1" />
        <circle cx="11" cy="7.6" r="1" />
        <circle cx="13.2" cy="7.8" r="1" />
      </g>
    </>
  ),
  onion: (
    <>
      <path d="M12 8.5c2.2 2 3.8 4 3.8 7 0 3.2-1.9 5-3.8 5s-3.8-1.8-3.8-5c0-3 1.6-5 3.8-7z" />
      <path d="M12 8.5c0-1.6-.8-2.8-2-3.5M12 8.5c0-1.6.8-2.8 2-3.5" />
      <path d="M10.4 11.5c-.6 2.4-.6 5 .3 7M13.6 11.5c.6 2.4.6 5-.3 7" strokeWidth="1" />
    </>
  ),
  default: (
    <>
      <path d="M12 21V11" />
      <path d="M12 13C8.5 13 6.5 10.5 6.5 7c3.5 0 5.5 2 5.5 5.5z" fill="currentColor" stroke="none" />
      <path d="M12 11.5C15.5 11.5 17.5 9 17.5 5.5c-3.5 0-5.5 2-5.5 5.5z" fill="currentColor" stroke="none" />
    </>
  ),
};

export function CropIcon({
  crop,
  size = 20,
  className,
}: {
  crop: string;
  size?: number;
  className?: string;
}) {
  const key = normalizeCrop(crop);
  const glyph = ICONS[key] ?? ICONS.default;
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.6}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      role="img"
      aria-label={`${crop} crop`}
    >
      {glyph}
    </svg>
  );
}
