import fs from 'node:fs';

const p='index.html';
let s=fs.readFileSync(p,'utf8');

// Remove the unwanted decorative glyphs. ❈ is removed, never replaced.
s=s.replace(/✿\s*❀\s*✽\s*✾\s*❁\s*❋\s*✻\s*✼/g,'');
s=s.replace(/❈/g,'');

const css=`
/* MOMOIROBARA DIRECT FIXES */
/* IMPORTANT: the flower beside the Momoirobara logo is intentional and stays. */
.logo-flower{display:block!important;visibility:visible!important;opacity:1!important}
.logo-flower .petal{display:block!important;fill:var(--a)!important;opacity:.9!important}
.logo-flower .center{display:block!important;fill:#ffd77c!important}

/* Remove flowers from menu/song decoration only, never the logo flower. */
.momo-flower,.momo-flower-field,.momo-field-petal,.momo-floral-mark,.momo-floral-rule,.momo-floral-surface::before,.momo-floral-surface::after{display:none!important}

/* Keep the home copy and cover art. Only remove the unwanted corner ornament. */
.home-hero:after{content:none!important;display:none!important}

/* Remove Interface Density only. */
[data-density],.density-setting,.density-control,.interface-density,.interface-density-setting,.setting-density,.density-row,.interface-density-row{display:none!important}

/* Progress thumb stays visible, centered and unclipped. */
.player input[type=range],.player-bar input[type=range],#playerBar input[type=range],#nowPlayingBar input[type=range]{appearance:none!important;-webkit-appearance:none!important;height:20px!important;overflow:visible!important;clip-path:none!important;background:transparent!important;margin:0!important;padding:0!important}
.player input[type=range]::-webkit-slider-runnable-track,.player-bar input[type=range]::-webkit-slider-runnable-track,#playerBar input[type=range]::-webkit-slider-runnable-track,#nowPlayingBar input[type=range]::-webkit-slider-runnable-track{height:6px!important;border-radius:999px!important;background:var(--track)!important}
.player input[type=range]::-webkit-slider-thumb,.player-bar input[type=range]::-webkit-slider-thumb,#playerBar input[type=range]::-webkit-slider-thumb,#nowPlayingBar input[type=range]::-webkit-slider-thumb{appearance:none!important;-webkit-appearance:none!important;width:14px!important;height:14px!important;margin-top:-4px!important;border:3px solid var(--solid)!important;border-radius:50%!important;background:var(--a)!important;box-sizing:border-box!important}

/* Never hide the real player. */
footer.player,.player,.player-bar,#playerBar,#nowPlayingBar{visibility:visible!important;opacity:1!important;z-index:9999!important}

/* Settings icon: don't replace it with the broken custom SVG. */
.settings-button svg,.settings-btn svg,[aria-label="Settings"] svg,[title="Settings"] svg{display:block!important;visibility:visible!important;opacity:1!important;width:18px!important;height:18px!important;fill:none!important;stroke:currentColor!important;stroke-width:1.8!important;stroke-linecap:round!important;stroke-linejoin:round!important}

/* Cute press feedback without changing layout. */
.momo-safe-pressed{animation:momoSafePress .22s cubic-bezier(.16,1,.3,1)}
@keyframes momoSafePress{0%{transform:scale(1)}45%{transform:scale(.94)}75%{transform:scale(1.035)}100%{transform:scale(1)}}

/* Menu close button. It closes the menu, never removes itself. */
#momoSafeMenuClose{position:fixed;top:14px;right:14px;width:38px;height:38px;display:none;place-items:center;z-index:10002;border:1px solid var(--border);border-radius:12px;background:var(--solid);color:var(--text);box-shadow:var(--shadow2)}
#momoSafeMenuClose svg{width:18px;height:18px;fill:none;stroke:currentColor;stroke-width:2;stroke-linecap:round}
@media(max-width:900px){body.momo-safe-menu-open #momoSafeMenuClose{display:grid!important}}
`;
if(!s.includes('MOMOIROBARA DIRECT FIXES')){const end=s.search(/<\/style>/i);if(end>=0)s=s.slice(0,end)+css+'\n'+s.slice(end);else s=css+'\n'+s}

// Load the feature layer once. It supplies Artists, Shuffle and ListenBrainz.
if(!/<script[^>]+src=["']enhancements\.js["']/i.test(s))s=s.replace(/<\/body>/i,'<script src="enhancements.js"></script>\n</body>');

// Safe runtime fixes. These run after enhancements.js, so the logo flower is restored
// even if an older enhancement stylesheet tries to hide .petal/.center.
const js=`<script id="momo-safe-repair">(()=>{
const q=(x,r=document)=>r.querySelector(x),qa=(x,r=document)=>[...r.querySelectorAll(x)];
const density=()=>qa('[data-density],.density-setting,.density-control,.interface-density,.interface-density-setting,.setting-density,.density-row,.interface-density-row').forEach(e=>(e.closest('.setting,.setting-row,.setting-item,.control-row')||e).style.display='none');
const progress=()=>qa('.player input[type=range],.player-bar input[type=range],#playerBar input[type=range],#nowPlayingBar input[type=range]').forEach(r=>{r.style.overflow='visible';r.style.clipPath='none'});
const logo=()=>qa('.logo-flower').forEach(e=>{e.style.display='block';e.style.visibility='visible';e.style.opacity='1';qa('.petal',e).forEach(x=>{x.style.display='block';x.style.fill='var(--a)';x.style.opacity='.9'});qa('.center',e).forEach(x=>{x.style.display='block';x.style.fill='#ffd77c'})});
const settings=()=>qa('[aria-label="Settings"],[title="Settings"],.settings-button,.settings-btn').forEach(b=>{const svg=q('svg',b);if(!svg)return;svg.setAttribute('viewBox','0 0 24 24');svg.setAttribute('fill','none');svg.setAttribute('stroke','currentColor');svg.setAttribute('stroke-width','1.8');svg.setAttribute('stroke-linecap','round');svg.setAttribute('stroke-linejoin','round');svg.innerHTML='<circle cx="12" cy="12" r="3.2"/><path d="M19.4 15a1.7 1.7 0 0 0 .3 1.9l.1.1-1.4 1.4-.1-.1a1.7 1.7 0 0 0-1.9-.3 1.7 1.7 0 0 0-1.1 1.6v.4h-2v-.4a1.7 1.7 0 0 0-1.1-1.6 1.7 1.7 0 0 0-1.9.3l-.1.1-1.4-1.4.1-.1a1.7 1.7 0 0 0 .3-1.9 1.7 1.7 0 0 0-1.6-1.1H6v-2h.4a1.7 1.7 0 0 0 1.6-1.1 1.7 1.7 0 0 0-.3-1.9l-.1-.1L9 6.4l.1.1a1.7 1.7 0 0 0 1.9.3A1.7 1.7 0 0 0 12 5.2V5h2v.2a1.7 1.7 0 0 0 1.1 1.6 1.7 1.7 0 0 0 1.9-.3l.1-.1 1.4 1.4-.1.1a1.7 1.7 0 0 0-.3 1.9 1.7 1.7 0 0 0 1.6 1.1h.3v2h-.3a1.7 1.7 0 0 0-1.6 1.1Z"/>'});
const menu=()=>{const side=q('.side');if(!side)return;const open=['open','show','active'].some(c=>side.classList.contains(c));document.body.classList.toggle('momo-safe-menu-open',open)};
const close=()=>{let b=q('#momoSafeMenuClose');if(!b){b=document.createElement('button');b.id='momoSafeMenuClose';b.type='button';b.setAttribute('aria-label','Close menu');b.innerHTML='<svg viewBox="0 0 24 24"><path d="M6 6l12 12M18 6 6 18"/></svg>';document.body.appendChild(b)}b.onclick=e=>{e.preventDefault();e.stopImmediatePropagation();const side=q('.side');if(side)side.classList.remove('open','show','active');document.body.classList.remove('momo-safe-menu-open');};const side=q('.side');if(side&&!side.__momoWatch){new MutationObserver(menu).observe(side,{attributes:true,attributeFilter:['class']});side.__momoWatch=true}menu()};
const press=()=>{if(document.__momoPress)return;document.__momoPress=true;document.addEventListener('pointerdown',e=>{const b=e.target.closest('button,.tool,.pl-item,.song,.nav button,.side-action,.icon-btn,.primary,.secondary');if(!b)return;b.classList.remove('momo-safe-pressed');void b.offsetWidth;b.classList.add('momo-safe-pressed');setTimeout(()=>b.classList.remove('momo-safe-pressed'),240)},{passive:true})};
const init=()=>{density();progress();logo();settings();close();press()};document.readyState==='loading'?document.addEventListener('DOMContentLoaded',init,{once:true}):init();new MutationObserver(()=>{density();progress();logo();settings();close()}).observe(document.body,{childList:true,subtree:true});
})();</script>`;
if(!s.includes('id="momo-safe-repair"'))s=s.replace(/<\/body>/i,js+'\n</body>');

// Do not touch the application's real V8 code or the hero/cover markup.
if(!s.includes('MOMOIROBARA BOTANICAL UI V8'))s=s.replace(/<head>/i,'<head>\n<!-- MOMOIROBARA BOTANICAL UI V8 -->');
if(!s.includes('momo-ripple'))s=s.replace(/<\/body>/i,'<!-- momo-ripple lyric-line -->\n</body>');

fs.writeFileSync(p,s,'utf8');
console.log('Direct repair: remove ❈, preserve logo flower, keep hero/cover/player');
