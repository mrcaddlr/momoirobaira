import fs from 'node:fs';
import {execFileSync} from 'node:child_process';

const INDEX = 'index.html';
const EXTERNAL = 'enhancements.js';
let html = fs.readFileSync(INDEX, 'utf8');

// The feature layer is deliberately kept out of the repository. Recover the
// last committed copy from git history and inline it into index.html.
let feature = '';
try {
  const commits = execFileSync('git', ['log', '--all', '--format=%H', '--', EXTERNAL], {encoding:'utf8'})
    .trim().split(/\s+/).filter(Boolean);
  for (const commit of commits) {
    try {
      feature = execFileSync('git', ['show', `${commit}:${EXTERNAL}`], {encoding:'utf8'}).trim();
      if (feature) break;
    } catch {}
  }
} catch {}

// If a working-tree copy exists, prefer it.
if (fs.existsSync(EXTERNAL)) {
  const working = fs.readFileSync(EXTERNAL, 'utf8').trim();
  if (working) feature = working;
}

html = html.replace(/\s*<script\s+[^>]*src=["']enhancements\.js["'][^>]*>\s*<\/script>/gi, '');
html = html.replace(/\s*<script\s+id=["']momo-inline-features["'][\s\S]*?<\/script>/gi, '');
if (feature) {
  html = html.replace(/<\/body>/i, `<script id="momo-inline-features">\n${feature}\n</script>\n</body>`);
}

// Remove the requested decorative glyphs, but never remove the actual logo flower SVG.
html = html.replace(/✿\s*❀\s*✽\s*✾\s*❁\s*❋\s*✻\s*✼/g, '');
html = html.replace(/❈/g, '');

// Remove obsolete generated style blocks without touching the real application styles.
const staleMarkers = [
  'DIRECT UI REPAIR V2', 'MOMOIROBARA FLOWER UI REPAIR V5',
  'MOMOIROBARA BOTANICAL UI V7', 'MOMOIROBARA BOTANICAL UI V8',
  'MOMOIROBARA TARGETED PLAYER/FLOWER CLEANUP', 'MOMOIROBARA FINAL DIRECT FIX',
  'MOMOIROBARA PLAYER SAFETY', 'MOMOIROBARA DIRECT FIXES'
];
for (const marker of staleMarkers) {
  const needle = `/* ${marker} */`;
  let at = html.indexOf(needle);
  while (at !== -1) {
    const end = html.indexOf('</style>', at);
    if (end === -1) { html = html.replace(needle, ''); break; }
    html = html.slice(0, at) + html.slice(end + 8);
    at = html.indexOf(needle);
  }
}

// Remove obsolete generated script blocks.
for (const id of ['momo-botanical-ui-v7', 'momo-botanical-ui-v8', 'momo-final-menu', 'momo-safe-repair']) {
  const re = new RegExp(`<script[^>]*id=["']${id}["'][^>]*>[\\s\\S]*?<\\/script>`, 'gi');
  html = html.replace(re, '');
}

// Remove the actual Interface Density setting from the markup, not merely with CSS.
html = html.replace(/<div class="setting">(?=[\\s\\S]{0,1800}?Interface density)[\\s\\S]*?<\\/div>\\s*(?=<div class="setting">)/i, '');
html = html.replace(/<div class="setting">(?=[\\s\\S]{0,1200}?interface density)[\\s\\S]*?<\\/div>\s*<\/div>/i, '');

const css = `
/* MOMOIROBARA INLINE CLEANUP */
.logo-flower{display:block!important;visibility:visible!important;opacity:1!important}
.logo-flower .petal,.logo-flower .center{display:block!important}
.home-hero{display:block!important;visibility:visible!important;opacity:1!important;min-height:250px!important}
.home-hero:after{pointer-events:none!important}
.momo-flower,.momo-flower-field,.momo-field-petal,.momo-floral-mark,.momo-floral-rule{display:none!important}
`;
if (!html.includes('MOMOIROBARA INLINE CLEANUP')) html = html.replace(/<\/style>/i, `${css}\n</style>`);

if (!html.includes('MOMOIROBARA INLINE BUILD')) {
  html = html.replace(/<\/head>/i, '<meta name="momoirobara-build" content="MOMOIROBARA INLINE BUILD">\n</head>');
}

fs.writeFileSync(INDEX, html, 'utf8');
if (fs.existsSync(EXTERNAL)) fs.rmSync(EXTERNAL);
console.log(feature ? 'Momoirobara feature layer inlined into index.html.' : 'Warning: no historical enhancements.js found; index cleanup still applied.');
