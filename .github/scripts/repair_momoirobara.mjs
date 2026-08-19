import fs from 'node:fs';

const p = 'index.html';
let s = fs.readFileSync(p, 'utf8');

// Keep the existing V8 functionality, but make this repair targeted and idempotent.
const marker = '/* MOMOIROBARA BOTANICAL UI V8 */';
const css = `${marker}
/* Remove the unwanted bottom floral glyphs without touching the rest of the UI. */
.momo-flower,.momo-flower-field,.momo-field-petal{display:none!important}
.home-hero:after{content:none!important}
/* The player is a required part of the app. Never allow decorative layers or stale CSS to hide it. */
footer.player,.player,.player-bar,#playerBar,#nowPlayingBar{display:grid!important;visibility:visible!important;opacity:1!important;position:fixed!important;left:238px;right:0;bottom:0;z-index:9999!important;transform:none!important;clip-path:none!important;pointer-events:auto!important}
@media(max-width:900px){footer.player,.player,.player-bar,#playerBar,#nowPlayingBar{left:0!important;right:0!important;bottom:0!important}}
`;

// Add the override once. If an older V8 block exists, add the targeted repair after it.
if (!s.includes('MOMOIROBARA TARGETED PLAYER/FLOWER CLEANUP')) {
  const targeted = `\n/* MOMOIROBARA TARGETED PLAYER/FLOWER CLEANUP */\n${css}`;
  s = s.replace(/<\/style>/i, targeted + '\n</style>');
}

// Remove the old decorative scripts that create the flower row.
s = s.replace(/<script id="momo-flower-ui-v5">[\s\S]*?<\/script>/i, '');
s = s.replace(/<script id="momo-botanical-ui-v7">[\s\S]*?<\/script>/i, '');
s = s.replace(/<script id="momo-botanical-ui-v8">[\s\S]*?<\/script>/i, '');

// Remove only the old decorative CSS blocks, while preserving the actual player styles.
s = s.replace(/\/\* MOMOIROBARA FLOWER UI REPAIR V5 \*\/[\s\S]*?(?=\/\* MOMOIROBARA BOTANICAL UI V7 \*\/)/i, '');
s = s.replace(/\/\* MOMOIROBARA BOTANICAL UI V7 \*\/[\s\S]*?(?=<\/style>)/i, '');

// Ensure the cleanup override remains after any preserved application styles.
if (!s.includes('MOMOIROBARA TARGETED PLAYER/FLOWER CLEANUP')) {
  s = s.replace(/<\/style>/i, `\n/* MOMOIROBARA TARGETED PLAYER/FLOWER CLEANUP */\n${css}\n</style>`);
}

fs.writeFileSync(p, s, 'utf8');
console.log('Targeted player/flower cleanup applied');
