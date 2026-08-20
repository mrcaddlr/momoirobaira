import fs from 'node:fs';

const p = 'index.html';
let s = fs.readFileSync(p, 'utf8');

const marker = '/* MOMOIROBARA BOTANICAL UI V8 */';
const css = `${marker}
/* Remove unwanted bottom floral glyphs. */
.momo-flower,.momo-flower-field,.momo-field-petal{display:none!important}
.home-hero:after{content:none!important}
/* Keep the real player bar above decorative/effect layers. */
footer.player,.player,.player-bar,#playerBar,#nowPlayingBar{display:grid!important;visibility:visible!important;opacity:1!important;position:fixed!important;left:238px;right:0;bottom:0;z-index:9999!important;transform:none!important;clip-path:none!important;pointer-events:auto!important}
@media(max-width:900px){footer.player,.player,.player-bar,#playerBar,#nowPlayingBar{left:0!important;right:0!important;bottom:0!important}}
`;

if (!s.includes('MOMOIROBARA TARGETED PLAYER/FLOWER CLEANUP')) {
  s = s.replace(/<\/style>/i, `\n/* MOMOIROBARA TARGETED PLAYER/FLOWER CLEANUP */\n${css}\n</style>`);
}

// Remove scripts responsible for the decorative flower row.
for (const id of ['momo-flower-ui-v5','momo-botanical-ui-v7','momo-botanical-ui-v8']) {
  s = s.replace(new RegExp(`<script id=["']${id}["'][^>]*>[\\s\\S]*?<\\/script>`, 'ig'), '');
}

// Remove the literal decorative glyph sequence wherever it was injected.
s = s.replace(/✿\s*❀\s*✽\s*✾\s*❁\s*❋\s*✻\s*✼/g, '');

fs.writeFileSync(p, s, 'utf8');
console.log('Targeted player/flower cleanup applied');
