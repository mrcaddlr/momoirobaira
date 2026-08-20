import fs from 'node:fs';

const INDEX = 'index.html';
const EXTERNAL = 'enhancements.js';
let html = fs.readFileSync(INDEX, 'utf8');

if (fs.existsSync(EXTERNAL)) {
  const feature = fs.readFileSync(EXTERNAL, 'utf8').trim();
  html = html.replace(/<script\s+[^>]*src=["']enhancements\.js["'][^>]*>\s*<\/script>/gi, '');
  html = html.replace(/<script\s+id=["']momo-inline-features["'][\s\S]*?<\/script>/gi, '');
  if (feature) html = html.replace(/<\/body>/i, `<script id="momo-inline-features">\n${feature}\n</script>\n</body>`);
}

html = html.replace(/✿\s*❀\s*✽\s*✾\s*❁\s*❋\s*✻\s*✼/g, '');
html = html.replace(/❈/g, '');

const staleMarkers = [
  'DIRECT UI REPAIR V2', 'MOMOIROBARA FLOWER UI REPAIR V5',
  'MOMOIROBARA BOTANICAL UI V7', 'MOMOIROBARA BOTANICAL UI V8',
  'MOMOIROBARA TARGETED PLAYER/FLOWER CLEANUP', 'MOMOIROBARA FINAL DIRECT FIX',
  'MOMOIROBARA PLAYER SAFETY', 'MOMOIROBARA DIRECT FIXES', 'MOMOIROBARA FEATURES V4'
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

for (const id of ['momo-botanical-ui-v7', 'momo-botanical-ui-v8', 'momo-final-menu', 'momo-safe-repair']) {
  const open = new RegExp(`<script[^>]*id=["']${id}["'][^>]*>`, 'i').exec(html);
  if (!open) continue;
  const end = html.indexOf('</script>', open.index + open[0].length);
  if (end !== -1) html = html.slice(0, open.index) + html.slice(end + 9);
}

const css = `
/* MOMOIROBARA FINAL INLINE CLEANUP */
.logo-flower{display:block!important;visibility:visible!important;opacity:1!important}
.logo-flower .petal,.logo-flower .center{display:block!important}
.home-hero{display:block!important;visibility:visible!important;opacity:1!important;min-height:250px!important}
.home-hero:after{pointer-events:none!important}
.momo-flower,.momo-flower-field,.momo-field-petal,.momo-floral-mark,.momo-floral-rule{display:none!important}
[data-density],.density-setting,.density-control,.interface-density,.interface-density-setting,.setting-density,.density-row,.interface-density-row{display:none!important}
`;
if (!html.includes('MOMOIROBARA FINAL INLINE CLEANUP')) html = html.replace(/<\/style>/i, `${css}\n</style>`);

html = html.replace(/<script\s+[^>]*src=["']enhancements\.js["'][^>]*>\s*<\/script>/gi, '');
if (!html.includes('MOMOIROBARA INLINE BUILD')) html = html.replace(/<\/head>/i, '<meta name="momoirobara-build" content="MOMOIROBARA INLINE BUILD">\n</head>');

fs.writeFileSync(INDEX, html, 'utf8');
if (fs.existsSync(EXTERNAL)) fs.rmSync(EXTERNAL);
console.log('Momoirobara features inlined into index.html; enhancements.js removed.');
