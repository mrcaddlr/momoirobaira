import fs from 'node:fs';

const p = 'index.html';
let s = fs.readFileSync(p, 'utf8');

// TARGETED REPAIR ONLY. Preserve all existing V8 HTML/CSS/JS.
// Remove the unwanted decorative glyph sequence wherever it appears.
s = s.replace(/✿\s*❀\s*✽\s*✾\s*❁\s*❋\s*✻\s*✼/g, '');

// Hide known decorative flower elements without deleting any V8 code.
const cleanup = `
/* MOMOIROBARA TARGETED PLAYER/FLOWER CLEANUP */
.momo-flower,.momo-flower-field,.momo-field-petal{display:none!important}
.home-hero:after{content:none!important}
footer.player,.player,.player-bar,#playerBar,#nowPlayingBar{display:grid!important;visibility:visible!important;opacity:1!important;position:fixed!important;left:238px;right:0;bottom:0;z-index:9999!important;transform:none!important;clip-path:none!important;pointer-events:auto!important}
@media(max-width:900px){footer.player,.player,.player-bar,#playerBar,#nowPlayingBar{left:0!important;right:0!important;bottom:0!important}}
`;

if (!s.includes('MOMOIROBARA TARGETED PLAYER/FLOWER CLEANUP')) {
  const styleEnd = s.search(/<\/style>/i);
  if (styleEnd !== -1) {
    s = s.slice(0, styleEnd) + cleanup + '\n' + s.slice(styleEnd);
  } else {
    s = cleanup + '\n' + s;
  }
}

fs.writeFileSync(p, s, 'utf8');
console.log('Targeted flower/player repair applied without removing V8 code');
