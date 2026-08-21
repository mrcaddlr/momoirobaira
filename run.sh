#!/usr/bin/env bash
set -euo pipefail

ROOT="$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")" && pwd)"
INDEX="$ROOT/index.html"
PROFILE="$HOME/.config/momoirobara/chrome-profile"

if [[ ! -f "$INDEX" ]]; then
  echo "Momoirobara: index.html not found in $ROOT" >&2
  exit 1
fi

# Remove the artificial startup/loading overlay from the source.
python3 - "$INDEX" <<'PY'
from pathlib import Path
import re, sys
p = Path(sys.argv[1])
s = p.read_text(encoding="utf-8")
old = s
pattern = r'\n<div id="momoLoading"[\s\S]*?</div>\s*</div>\s*</div>\s*<script>\(function\(\)\{const start=Date\.now\(\);[\s\S]*?</script>'
s = re.sub(pattern, '', s, count=1)
if s != old:
    p.write_text(s, encoding="utf-8")
PY

mkdir -p "$PROFILE"

# Explicitly launch the Flatpak Chrome app with a permanent profile.
# This keeps Momoirobara's IndexedDB/localStorage data between launches.
exec flatpak run com.google.Chrome \
  --user-data-dir="$PROFILE" \
  --app="file://$INDEX" \
  --no-first-run \
  --no-default-browser-check
