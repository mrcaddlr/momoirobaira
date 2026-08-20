import fs from 'node:fs';

const path = 'index.html';
let html = fs.readFileSync(path, 'utf8');

html = html.replace(/✿\s*❀\s*✽\s*✾\s*❁\s*❋\s*✻\s*✼/g, '');
html = html.replace(/❈/g, '');

// Remove old generated repair layers that were overriding the real app.
for (const name of ['DIRECT UI REPAIR V2','MOMOIROBARA FLOWER UI REPAIR V5','MOMOIROBARA BOTANICAL UI V7','MOMOIROBARA BOTANICAL UI V8','MOMOIROBARA TARGETED PLAYER/FLOWER CLEANUP','MOMOIROBARA FINAL DIRECT FIX','MOMOIROBARA PLAYER SAFETY']) {
  const escaped = name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  html = html.replace(new RegExp(`/\\*\\s*${escaped}\\s*\\*/[\\s\\S]*?(?=\\n\\/\\*|\\n<\\/style>)`, 'g'), '');
}

for (const id of ['momo-botanical-ui-v7','momo-botanical-ui-v8','momo-final-menu','momo-safe-repair']) {
  html = html.replace(new RegExp(`<script[^>]*id=["']${id}["'][^>]*>[\\s\\S]*?<\\/script>`, 'gi'), '');
}
html = html.replace(/<style[^>]*id=["']momo-final-menu-css["'][^>]*>[\s\S]*?<\/style>/gi, '');

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
  html = end >= 0 ? html.slice(0,end) + css + '\n' + html.slice(end) : css + '\n' + html;
}
if (!/<script[^>]+src=["']enhancements\.js["']/i.test(html)) {
  html = html.replace(/<\/body>/i, '<script src="enhancements.js"></script>\n</body>');
}

fs.writeFileSync(path, html, 'utf8');
console.log('Momoirobara clean repair applied');
