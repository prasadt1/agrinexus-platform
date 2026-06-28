"use client";

import { useState } from "react";
import { CropIcon, normalizeCrop } from "./CropIcon";

/**
 * CropImage — a real, large, premium crop photo for a cohort, with an invisible
 * graceful fallback to the CropIcon glyph so the UI is correct before any image
 * exists. Drop generated photos into /public/crops/<crop>.webp (cotton.webp,
 * soybean.webp, …) and every surface upgrades to photography with no code change.
 *
 * The fallback (and the photo) sit inside the brand-tinted chrome, so per-tenant
 * white-label theming still frames every cohort.
 */
export function CropImage({
  crop,
  size = 40,
  fill = false,
  rounded = "lg",
  priority = false,
  className,
  alt,
}: {
  crop: string;
  size?: number;
  fill?: boolean;
  rounded?: "full" | "lg" | "none";
  priority?: boolean;
  className?: string;
  alt?: string;
}) {
  const [failed, setFailed] = useState(false);
  const key = normalizeCrop(crop);
  const radius = rounded === "full" ? "9999px" : rounded === "lg" ? "12px" : "0";

  const box: React.CSSProperties = fill
    ? { position: "absolute", inset: 0, width: "100%", height: "100%" }
    : { width: size, height: size };

  if (failed || !key) {
    // Graceful, on-brand fallback: themed tile/gradient + the crop glyph.
    return (
      <div
        className={className}
        style={{
          ...box,
          borderRadius: radius,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: fill
            ? "linear-gradient(135deg, var(--color-primary-tint), var(--color-primary-muted))"
            : "var(--color-primary-tint)",
          color: "var(--color-primary)",
        }}
        aria-label={alt ?? `${crop} crop`}
      >
        <CropIcon crop={crop} size={fill ? 88 : Math.round(size * 0.55)} />
      </div>
    );
  }

  return (
    <img
      src={`/crops/${key}.webp`}
      alt={alt ?? `${crop} field`}
      loading={priority ? "eager" : "lazy"}
      decoding="async"
      onError={() => setFailed(true)}
      className={className}
      style={{ ...box, borderRadius: radius, objectFit: "cover" }}
    />
  );
}
