import fs from 'node:fs';

const path = 'index.html';
let html = fs.readFileSync(path, 'utf8');

// Remove only the requested decorative glyphs. Keep the flower beside the logo.
html = html.replace(/✿\s*❀\s*✽\s*✾\s*❁\s*❋\s*✻\s*✼/g, '');
html = html.replace(/❈/g, '');

// Remove old repair CSS blocks that were hiding real UI elements.
html = html.replace(/\/\* MOMOIROBARA DIRECT UI REPAIR V2 \*\/[\s\S]*?(?=<\/style>)/gi, '');
html = html.replace(/\.logo:before,[\s\S]*?\.logo:before\{right:9px;top:8px\}/gi, '');

const css = `
/* MOMOIROBARA FINAL DIRECT FIX */
/* The flower beside the logo is intentional. */
.logo-flower { display:block !important; visibility:visible !important; opacity:1 !important; }
.logo-flower .petal { display:block !important; opacity:.9 !important; }
.logo-flower .center { display:block !important; }
/* Remove decorative flowers everywhere except the logo. */
.momo-flower,.momo-flower-field,.momo-field-petal,.momo-floral-mark,.momo-floral-rule { display:none !important; }
.song:before,.nav button:before,.pl-item:before,.side-action:before,.tool:before,.head:before,.library-top:before,.player:before,.player-bar:before { content:none !important; display:none !important; }
/* Preserve the hero text and cover art. Remove only the corner ornament. */
.home-hero:before { content:none !important; }
/* Remove Interface Density only. */
[data-density],.density-setting,.density-control,.interface-density,.interface-density-setting,.setting-density,.density-row,.interface-density-row { display:none !important; }
/* Keep the progress thumb inside its track. */
.player input[type=range],.player-bar input[type=range],#playerBar input[type=range],#nowPlayingBar input[type=range] { appearance:none !important; -webkit-appearance:none !important; height:20px !important; overflow:visible !important; clip-path:none !important; background:transparent !important; margin:0 !important; padding:0 !important; }
.player input[type=range]::-webkit-slider-thumb,.player-bar input[type=range]::-webkit-slider-thumb,#playerBar input[type=range]::-webkit-slider-thumb,#nowPlayingBar input[type=range]::-webkit-slider-thumb { -webkit-appearance:none !important; width:14px !important; height:14px !important; margin-top:-4px !important; border:3px solid var(--solid) !important; border-radius:50% !important; background:var(--a) !important; box-sizing:border-box !important; }
.player,.player-bar,#playerBar,#nowPlayingBar { visibility:visible !important; opacity:1 !important; z-index:9999 !important; }
.settings-button,.settings-btn,[aria-label="Settings"],[title="Settings"] { pointer-events:auto !important; }
.settings-button svg,.settings-btn svg,[aria-label="Settings"] svg,[title="Settings"] svg { display:block !important; visibility:visible !important; opacity:1 !important; }
.momo-safe-pressed { animation:momoSafePress .22s cubic-bezier(.16,1,.3,1); }
@keyframes momoSafePress { 0%{transform:scale(1)} 45%{transform:scale(.94)} 75%{transform:scale(1.035)} 100%{transform:scale(1)} }
`;

if (!html.includes('MOMOIROBARA FINAL DIRECT FIX')) {
  const styleEnd = html.search(/<\/style>/i);
  if (styleEnd >= 0) html = html.slice(0, styleEnd) + css + '\n' + html.slice(styleEnd);
}

// Load the feature layer once. It now contains Last.fm only, not ListenBrainz.
if (!/<script[^>]+src=["']enhancements\.js["']/i.test(html)) {
  html = html.replace(/<\/body>/i, '<script src="enhancements.js"></script>\n</body>');
}

// Stable mobile menu close button. It only closes the side panel; it never removes itself.
if (!html.includes('id="momo-final-menu-close"')) {
  const menuCss = `<style id="momo-final-menu-css">#momo-final-menu-close{display:none;position:fixed;right:14px;top:14px;z-index:10002;width:40px;height:40px;place-items:center;border:1px solid var(--border);border-radius:12px;background:var(--solid);color:var(--text)}#momo-final-menu-close svg{width:18px;height:18px;fill:none;stroke:currentColor;stroke-width:2;stroke-linecap:round}@media(max-width:900px){body.momo-final-menu-open #momo-final-menu-close{display:grid!important}}</style>`;
  const menuJs = `<script id="momo-final-menu">(()=>{const q=(x,r=document)=>r.querySelector(x);let b=q('#momo-final-menu-close');if(!b){b=document.createElement('button');b.id='momo-final-menu-close';b.type='button';b.setAttribute('aria-label','Close menu');b.innerHTML='<svg viewBox="0 0 24 24"><path d="M6 6l12 12M18 6 6 18"/></svg>';document.body.appendChild(b)}const sync=()=>{const side=q('.side');document.body.classList.toggle('momo-final-menu-open',!!side&&side.classList.contains('open'))};b.onclick=e=>{e.preventDefault();e.stopPropagation();const side=q('.side');if(side)side.classList.remove('open');sync()};const side=q('.side');if(side&&!side.__momoWatch){new MutationObserver(sync).observe(side,{attributes:true,attributeFilter:['class']});side.__momoWatch=true}sync()})();</script>`;
  html = html.replace(/<\/head>/i, menuCss + '\n</head>');
  html = html.replace(/<\/body>/i, menuJs + '\n</body>');
}

fs.writeFileSync(path, html, 'utf8');
console.log('Momoirobara direct repair applied');
