#!/usr/bin/env bash
set -euo pipefail

ROOT="$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")" && pwd)"
INDEX="$ROOT/index.html"
PROFILE="$HOME/.config/momoirobara/chrome-profile"

if [[ ! -f "$INDEX" ]]; then
  echo "Momoirobara: index.html not found in $ROOT" >&2
  exit 1
fi

# Remove the artificial startup/loading overlay permanently from the current source.
python3 - "$INDEX" <<'PY'
from pathlib import Path
import re, sys
p = Path(sys.argv[1])
s = p.read_text(encoding="utf-8")
old = s
s = re.sub(r'\n?<div id="momoLoading"[\s\S]*?</div>\n<script>\(function\(\)\{const start=Date\.now\(\);[\s\S]*?</script>', '', s, count=1)
s = re.sub(r'\n<script>\(function\(\)\{const start=Date\.now\(\);const release=.*?</script>', '', s, count=1)
if s != old:
    p.write_text(s, encoding="utf-8")
PY

mkdir -p "$PROFILE"

# Explicitly launch the Flatpak Chrome app with a permanent profile so
# IndexedDB/localStorage survive between launches.
exec flatpak run com.google.Chrome \
  --user-data-dir="$PROFILE" \
  --app="file://$INDEX" \
  --no-first-run \
  --no-default-browser-check
