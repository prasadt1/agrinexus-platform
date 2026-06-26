#!/usr/bin/env bash
# Render architecture/diagrams/*.mmd -> exports/*.{svg,png} via the Kroki API.
# No local mermaid-cli needed (mirrors the Iris pipeline). Run: bash render.sh
set -euo pipefail
DIR="$(cd "$(dirname "$0")" && pwd)"
OUT="$DIR/exports"
mkdir -p "$OUT"
for f in "$DIR"/*.mmd; do
  name=$(basename "$f" .mmd)
  for fmt in svg png; do
    echo "Rendering ${name}.${fmt} ..."
    curl -sf -X POST "https://kroki.io/mermaid/${fmt}" \
      -H "Content-Type: text/plain" \
      --data-binary @"$f" \
      -o "$OUT/${name}.${fmt}" || echo "  !! Kroki failed for ${name}.${fmt}"
  done
done
echo "Done -> $OUT"
