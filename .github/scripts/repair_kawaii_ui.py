from pathlib import Path

p = Path("index.html")
s = p.read_text(encoding="utf-8")
marker = "/* MOMOIROBARA SAFE KAWAII UI */"
start = s.find(marker)
if start >= 0:
    end = s.find("/* END MOMOIROBARA SAFE KAWAII UI */", start)
    if end >= 0:
        end += len("/* END MOMOIROBARA SAFE KAWAII UI */")
        s = s[:start] + s[end:]

css = r'''/* MOMOIROBARA SAFE KAWAII UI */
/* Keep the player transparent so themes control its surface. */
.player,.player-bar,.now-playing,.player-controls,.progress-wrap,.progress-container,.transport{background:transparent!important;box-shadow:none!important}
.player button,.player-bar button,.player-controls button,.transport button{background:transparent!important}

/* Theme-aware progress/volume controls. */
input[type=range]{background:transparent!important;accent-color:var(--a)}
input[type=range]::-webkit-slider-runnable-track{height:4px;border:0;border-radius:999px;background:var(--track)}
input[type=range]::-webkit-slider-thumb{-webkit-appearance:none;appearance:none;width:14px;height:14px;margin-top:-5px;border:2px solid var(--solid);border-radius:50%;background:linear-gradient(135deg,var(--a),var(--b));box-shadow:0 2px 8px color-mix(in srgb,var(--a) 30%,transparent)}
input[type=range]::-moz-range-track{height:4px;border:0;border-radius:999px;background:var(--track)}
input[type=range]::-moz-range-progress{height:4px;border-radius:999px;background:linear-gradient(90deg,var(--a),var(--b))}
input[type=range]::-moz-range-thumb{width:12px;height:12px;border:2px solid var(--solid);border-radius:50%;background:var(--a)}

/* Density is CSS-only: no event interception, no global listeners. */
:root[data-density="compact"] .song{padding:6px 9px;gap:9px}:root[data-density="compact"] .cover{width:46px;height:46px}
:root[data-density="normal"] .song{padding:9px 11px;gap:12px}:root[data-density="normal"] .cover{width:54px;height:54px}
:root[data-density="cozy"] .song{padding:13px 13px;gap:14px}:root[data-density="cozy"] .cover{width:60px;height:60px}
:root[data-density="spacious"] .song{padding:16px 15px;gap:16px}:root[data-density="spacious"] .cover{width:64px;height:64px}

/* Reliable click feedback using the browser's native :active state. */
.nav button,.tool,.side-action,.icon-btn,.round-action,.transport button,.primary,.secondary,.picker,.pl-item{transition:transform .18s var(--ease),background .22s var(--ease),border-color .22s var(--ease),color .22s var(--ease),box-shadow .22s var(--ease)}
button:active,.tool:active,.side-action:active,.icon-btn:active,.round-action:active,.transport button:active,.primary:active,.secondary:active,.picker:active,.pl-item:active{transform:scale(.96)}

/* Close buttons remain visually consistent if the existing UI markup exposes one. */
.kawaii-close{position:absolute;top:12px;right:12px;z-index:60;width:34px;height:34px;display:grid;place-items:center;border:1px solid var(--border);border-radius:50%;background:color-mix(in srgb,var(--solid) 92%,transparent);color:var(--muted);box-shadow:var(--shadow2);transition:transform .18s var(--ease),color .18s var(--ease),border-color .18s var(--ease)}
.kawaii-close:hover{transform:scale(1.06);color:var(--a);border-color:var(--a)}.kawaii-close:active{transform:scale(.92)}.kawaii-close svg{width:16px;height:16px;fill:none;stroke:currentColor;stroke-width:2;stroke-linecap:round}

@media(max-width:900px){.side .kawaii-close{display:grid}.side .logo{width:max-content;min-width:0;margin:0 auto;padding:0 10px}.side .logo-flower{width:34px;height:34px}}
/* END MOMOIROBARA SAFE KAWAII UI */
'''

if "</style>" not in s or "</html>" not in s:
    raise SystemExit("index.html structure check failed")
s = s.replace("</style>", css + "</style>", 1)
p.write_text(s, encoding="utf-8")
print("Safe kawaii UI enhancements applied without global pointer/click listeners.")
