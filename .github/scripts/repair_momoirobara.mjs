import fs from 'node:fs';

const p = 'index.html';
let s = fs.readFileSync(p, 'utf8');

// 1. Remove the requested glyphs. Never touch the actual logo flower SVG.
s = s.replace(/✿\s*❀\s*✽\s*✾\s*❁\s*❋\s*✻\s*✼/g, '');
s = s.replace(/❈/g, '');

// 2. Remove the old repair blocks that were responsible for the broken UI.
// DIRECT UI REPAIR V2 hid the real logo flower and hero content, so it must not survive.
s = s.replace(/\/\* MOMOIROBARA DIRECT UI REPAIR V2 \*\/[\s\S]*?(?=<\/style>)/i, '');
// Remove the old V5/V8 decorative pseudo-elements, but keep the useful ripple/button animation code.
s = s.replace(/\.logo:before,[\s\S]*?\.logo:before\{right:9px;top:8px\}/i, '');
s = s.replace(/\.home-hero:after\{content:'❀  ✿  ❁';[\s\S]*?\}\n@keyframes momoGarden\{[\s\S]*?\}/i, '');

const css = `
/* MOMOIROBARA FINAL TARGETED UI FIX */
/* Logo flower is intentional. Keep it. */
.logo-flower{display:block!important;visibility:visible!important;opacity:1!important}
.logo-flower .petal{display:block!important;fill:var(--a)!important;opacity:.9!important}
.logo-flower .center{display:block!important;fill:#ffd77c!important}
/* Remove decorative flowers from menus and songs, not the logo. */
.momo-flower,.momo-flower-field,.momo-field-petal,.momo-floral-mark,.momo-floral-rule{display:none!important}
.song:before,.nav button:before,.pl-item:before,.side-action:before,.tool:before,.head:before,.library-top:before,.player:before,.player-bar:before{content:none!important;display:none!important}
/* Remove only the unwanted corner decoration from the home hero. */
.home-hero:before{content:none!important}
/* Interface Density is gone. */
[data-density],.density-setting,.density-control,.interface-density,.interface-density-setting,.setting-density,.density-row,.interface-density-row{display:none!important}
/* Keep the progress control's native thumb fully inside its track. */
.player input[type=range],.player-bar input[type=range],#playerBar input[type=range],#nowPlayingBar input[type=range]{appearance:none!important;-webkit-appearance:none!important;height:20px!important;overflow:visible!important;clip-path:none!important;background:transparent!important;margin:0!important;padding:0!important}
.player input[type=range]::-webkit-slider-runnable-track,.player-bar input[type=range]::-webkit-slider-runnable-track,#playerBar input[type=range]::-webkit-slider-runnable-track,#nowPlayingBar input[type=range]::-webkit-slider-runnable-track{height:6px!important;border-radius:999px!important;background:var(--track)!important}
.player input[type=range]::-webkit-slider-thumb,.player-bar input[type=range]::-webkit-slider-thumb,#playerBar input[type=range]::-webkit-slider-thumb,#nowPlayingBar input[type=range]::-webkit-slider-thumb{-webkit-appearance:none!important;width:14px!important;height:14px!important;margin-top:-4px!important;border:3px solid var(--solid)!important;border-radius:50%!important;background:var(--a)!important}
.player,.player-bar,#playerBar,#nowPlayingBar{visibility:visible!important;opacity:1!important;z-index:9999!important}
/* Do not redraw the settings icon. Preserve the app's original SVG. */
.settings-button,.settings-btn,[aria-label="Settings"],[title="Settings"]{pointer-events:auto!important}
.settings-button svg,.settings-btn svg,[aria-label="Settings"] svg,[title="Settings"] svg{display:block!important;visibility:visible!important;opacity:1!important}
`;
const styleEnd = s.search(/<\/style>/i);
if (styleEnd >= 0 && !s.includes('MOMOIROBARA FINAL TARGETED UI FIX')) {
  s = s.slice(0, styleEnd) + css + '\n' + s.slice(styleEnd);
}

// Load the feature layer after the existing app code.
if (!/<script[^>]+src=["']enhancements\.js["']/i.test(s)) {
  s = s.replace(/<\/body>/i, '<script src="enhancements.js"></script>\n</body>');
}

// Stable menu X. It never removes itself and only removes the side panel's open state.
if (!s.includes('id="momo-final-menu-close"')) {
  const menuCss = `<style id="momo-final-menu-css">#momo-final-menu-close{display:none;position:fixed;right:14px;top:14px;z-index:10002;width:40px;height:40px;place-items:center;border:1px solid var(--border);border-radius:12px;background:var(--solid);color:var(--text);box-shadow:var(--shadow2)}#momo-final-menu-close svg{width:18px;height:18px;fill:none;stroke:currentColor;stroke-width:2;stroke-linecap:round}@media(max-width:900px){body.momo-final-menu-open #momo-final-menu-close{display:grid!important}}</style>`;
  const js = `<script id="momo-final-menu"><(()=>{const q=(x,r=document)=>r.querySelector(x);let b=q('#momo-final-menu-close');if(!b){b=document.createElement('button');b.id='momo-final-menu-close';b.type='button';b.setAttribute('aria-label','Close menu');b.innerHTML='<svg viewBox="0 0 24 24"><path d="M6 6l12 12M18 6 6 18"/></svg>';document.body.appendChild(b)}const sync=()=>{const side=q('.side');document.body.classList.toggle('momo-final-menu-open',!!side&&side.classList.contains('open'))};b.onclick=e=>{e.preventDefault();e.stopPropagation();const side=q('.side');if(side)side.classList.remove('open');sync()};const side=q('.side');if(side)new MutationObserver(sync).observe(side,{attributes:true,attributeFilter:['class']});sync()})();</script>`;
  s=s.replace(/<\/head>/i,menuCss+'\n</head>').replace(/<\/body>/i,js+'\n</body>');
}

// Preserve the real logo, home copy, and cover markup. Do not reconstruct them.
fs.writeFileSync(p,'utf8'===typeof s?s:'');
console.log('Momoirobara final targeted repair applied');
