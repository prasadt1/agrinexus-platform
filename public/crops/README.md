# Crop photos

Drop a photo per crop here and every cohort surface (detail hero banner, cohorts
list, dashboard) upgrades from the fallback emblem to real photography — **no code
change**. Until a file exists, the UI shows a themed crop emblem (graceful fallback).

## Required filenames (lowercase, `.webp`)

| file | crop |
|---|---|
| `cotton.webp` | Cotton |
| `soybean.webp` | Soybean (soy/soya) |
| `groundnut.webp` | Groundnut (peanut) |
| `wheat.webp` | Wheat |
| `rice.webp` | Rice (paddy) |
| `maize.webp` | Maize (corn) |
| `grapes.webp` | Grapes |
| `mustard.webp` | Mustard |
| `onion.webp` | Onion |

## Guidance
- **Format/size:** export as WebP, ~1600×1200 (4:3), quality ~80. Each file ideally < 250 KB.
- **Look:** consistent art direction across all nine (same lighting/grade) so they read as a set.
- The filename must match the normalized crop key exactly (see `app/components/CropIcon.tsx` `normalizeCrop`).

Generation prompts for all nine are in the project notes / chat handoff.
