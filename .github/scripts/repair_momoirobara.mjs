import fs from 'node:fs';

const p='index.html';
let s=fs.readFileSync(p,'utf8');
const marker='/* MOMOIROBARA BOTANICAL UI V8 */';

// Preserve the existing app and add only the V8 compatibility layer when needed.
if(!s.includes(marker)){
  const css=`${marker}
button:active,.tool:active,.pl-item:active,.song:active,.nav button:active,.side-action:active{transform:scale(.96)!important}
.momo-ripple{position:fixed;z-index:99999;width:7px;height:7px;border-radius:50%;pointer-events:none;background:var(--a);animation:momoRipple .42s ease-out forwards}@keyframes momoRipple{0%{opacity:.75;transform:translate(-50%,-50%) scale(.5)}100%{opacity:0;transform:translate(-50%,-50%) scale(8)}}
[data-density],.density-setting,.density-control,.interface-density{display:none!important}.settings-button svg,.settings-btn svg,[aria-label="Settings"] svg,[title="Settings"] svg{display:block!important;visibility:visible!important;opacity:1!important}.lyric-line,[data-lyric-line],.lyrics-line{cursor:pointer}
`;
  s=s.replace(/<\/style>/i,css+'\n</style>');
  const js=`<script id="momo-botanical-ui-v8">(()=>{const A=(x,r=document)=>[...r.querySelectorAll(x)],N=v=>{const n=parseFloat(v);return Number.isFinite(n)?n:null};const progress=()=>A('input[type="range"]').forEach(r=>{const m=N(r.max),v=N(r.value);if(m)r.style.setProperty('--momo-progress',Math.max(0,Math.min(100,v/m*100))+'%')});const menu=()=>{const x=document.querySelector('.side');document.body.classList.toggle('momo-menu-open',!!x&&(x.classList.contains('open')||x.classList.contains('show')||x.classList.contains('active')))};const close=()=>{let b=document.getElementById('mobileMenuClose');if(!b){b=document.createElement('button');b.id='mobileMenuClose';b.type='button';b.setAttribute('aria-label','Close menu');b.innerHTML='<svg viewBox="0 0 24 24"><path d="M7 7l10 10M17 7 7 17"/></svg>';document.body.appendChild(b)}b.onclick=()=>{document.querySelector('.side')?.classList.remove('open','show','active');menu()};const x=document.querySelector('.side');if(x)new MutationObserver(menu).observe(x,{attributes:true,attributeFilter:['class']});menu()};const ripple=()=>document.addEventListener('pointerdown',e=>{if(!e.target.closest?.('button,.tool,.pl-item,.song,.nav button,.side-action'))return;const r=document.createElement('span');r.className='momo-ripple';r.style.left=e.clientX+'px';r.style.top=e.clientY+'px';document.body.appendChild(r);r.onanimationend=()=>r.remove()},{passive:true});const init=()=>{progress();close();ripple();document.addEventListener('input',progress,true);document.addEventListener('change',progress,true)};document.readyState==='loading'?document.addEventListener('DOMContentLoaded',init,{once:true}):init()})()</script>`;
  s=s.replace(/<\/body>/i,js+'\n</body>');
}

// Remove the old flower row and its glyphs, but do not remove app/V8 code.
s=s.replace(/✿\s*❀\s*✽\s*✾\s*❁\s*❋\s*✻\s*✼/g,'');
s=s.replace(/<script id=["']momo-flower-ui-v5["'][^>]*>[\s\S]*?<\/script>/ig,'');
s=s.replace(/<script id=["']momo-botanical-ui-v7["'][^>]*>[\s\S]*?<\/script>/ig,'');

// Inject the new feature layer once. It contains the Artists page, shuffle controls,
// scrobbling, repaired settings/menu UI, progress-thumb fix, and cute press animation.
if(!s.includes('src="enhancements.js"'))s=s.replace(/<\/body>/i,'<script src="enhancements.js"></script>\n</body>');

// Final player/progress safety override. The enhancement stylesheet handles the thumb itself.
const fix=`\n/* MOMOIROBARA PLAYER SAFETY */\n.momo-floral-rule,.momo-floral-mark,.momo-floral-surface::before,.momo-floral-surface::after{display:none!important}\n.home-hero:after{display:none!important}\nfooter.player,.player,.player-bar,#playerBar,#nowPlayingBar{visibility:visible!important;opacity:1!important;z-index:9999!important}\n`;
if(!s.includes('MOMOIROBARA PLAYER SAFETY'))s=s.replace(/<\/style>/i,fix+'\n</style>');

fs.writeFileSync(p,s,'utf8');
console.log('Momoirobara targeted repair applied');
