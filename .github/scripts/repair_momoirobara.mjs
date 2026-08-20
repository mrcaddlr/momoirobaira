import fs from 'node:fs';

const indexPath = 'index.html';
let html = fs.readFileSync(indexPath, 'utf8');

function removeLiteral(value) {
  let at = html.indexOf(value);
  while (at !== -1) {
    html = html.slice(0, at) + html.slice(at + value.length);
    at = html.indexOf(value);
  }
}

removeLiteral('✿❀✽✾❁❋✻✼');
removeLiteral('❈');

const oldMarkers = ['DIRECT UI REPAIR V2','MOMOIROBARA FLOWER UI REPAIR V5','MOMOIROBARA BOTANICAL UI V7','MOMOIROBARA BOTANICAL UI V8'];
for (const marker of oldMarkers) removeLiteral('/* ' + marker + ' */');

const cleanupCss = '\n/* MOMOIROBARA INLINE CLEANUP */\n' +
  '.logo-flower{display:block!important;visibility:visible!important;opacity:1!important}\n' +
  '.logo-flower .petal,.logo-flower .center{display:block!important}\n' +
  '.home-hero{display:block!important;visibility:visible!important;opacity:1!important}\n' +
  '.momo-flower,.momo-flower-field,.momo-field-petal,.momo-floral-mark,.momo-floral-rule{display:none!important}\n';

if (!html.includes('MOMOIROBARA INLINE CLEANUP')) html = html.replace('</style>', cleanupCss + '</style>');
if (!html.includes('MOMOIROBARA INLINE BUILD')) html = html.replace('</head>', '<meta name="momoirobara-build" content="MOMOIROBARA INLINE BUILD">\n</head>');

fs.writeFileSync(indexPath, html, 'utf8');
console.log('repair complete');
