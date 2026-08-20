import fs from 'node:fs';

const path = 'index.html';
let html = fs.readFileSync(path, 'utf8');

// Remove unwanted decorative glyphs. Keep the intentional flower beside the logo.
html = html.replace(/✿\s*❀\s*✽\s*✾\s*❁\s*❋\s*✻\s*✼/g, '');
html = html.replace(/❈/g, '');

// Remove known obsolete repair blocks by their exact marker, without fragile nested regex strings.
const oldMarkers = [
  'DIRECT UI REPAIR V2',
  'MOMOIROBARA FLOWER UI REPAIR V5',
  'MOMOIROBARA BOTANICAL UI V7',
  'MOMOIROBARA BOTANICAL UI V8',
  'MOMOIROBARA TARGETED PLAYER/FLOWER CLEANUP',
  'MOMOIROBARA FINAL DIRECT FIX',
  'MOMOIROBARA PLAYER SAFETY'
];

for (const marker of oldMarkers) {
  const start = html.indexOf(`/* ${marker} */`);
  if (start === -1) continue;
  const next = html.indexOf('/*', start + marker.length + 8);
  const endStyle = html.indexOf('</style>', start);
  const end = next !== -1 && next < endStyle ? next : endStyle;
  if (end !== -1) html = html.slice(0, start) + html.slice(end);
}

// Remove only known obsolete generated scripts.
for (const id of ['momo-botanical-ui-v7', 'momo-botanical-ui-v8', 'momo-final-menu', 'momo-safe-repair']) {
  const open = html.indexOf(`<script id="${id}"`);
  if (open === -1) continue;
  const close = html.indexOf('</script>', open);
  if (close !== -1) html = html.slice(0, open) + html.slice(close + '</script>'.length);
}

const css = `
/* MOMOIROBARA CLEAN FEATURE HOOKS */
.logo-flower{display:block!important;visibility:visible!important;opacity:1!important}
.logo-flower .petal,.logo-flower .center{display:block!important}
.home-hero{display:block!important;visibility:visible!important;opacity:1!important}
.momo-flower,.momo-flower-field,.momo-field-petal,.momo-floral-mark,.momo-floral-rule{display:none!important}
[data-density],.density-setting,.density-control,.interface-density,.interface-density-setting,.setting-density,.density-row,.interface-density-row{display:none!important}
`;

if (!html.includes('MOMOIROBARA CLEAN FEATURE HOOKS')) {
  const end = html.search(/<\/style>/i);
  html = end >= 0 ? html.slice(0, end) + css + '\n' + html.slice(end) : css + '\n' + html;
}

if (!/<script[^>]+src=["']enhancements\.js["']/i.test(html)) {
  html = html.replace(/<\/body>/i, '<script src="enhancements.js"></script>\n</body>');
}

fs.writeFileSync(path, html, 'utf8');
console.log('Momoirobara clean repair applied');
