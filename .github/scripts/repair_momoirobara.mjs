import fs from 'node:fs';

const p = 'index.html';
let s = fs.readFileSync(p, 'utf8');
const marker = '/* MOMOIROBARA BOTANICAL UI V8 */';

// Remove every previous repair-injected decorative/functional block we own.
s = s.replace(/<script[^>]*id="momo-botanical-ui-v7"[^>]*>[\s\S]*?<\/script>/gi, '');
s = s.replace(/<script[^>]*id="momo-targeted-repair-v6"[^>]*>[\s\S]*?<\/script>/gi, '');
s = s.replace(/\/\* MOMOIROBARA BOTANICAL UI V7 \*\/[\s\S]*?(?=<\/style>)/g, '');
s = s.replace(/\/\* MOMOIROBARA TARGETED REPAIR V6 \*\/[\s\S]*?(?=<\/style>)/g, '');

const css = `${marker}
/* New floral treatment: botanical typography, borders, and corner ornaments. No floating flower layer. */
.momo-floral-surface{position:relative;isolation:isolate}
.momo-floral-surface::before,.momo-floral-surface::after{content:"";position:absolute;pointer-events:none;z-index:0;width:38px;height:38px;border-color:color-mix(in srgb,var(--a) 42%,transparent);opacity:.55}
.momo-floral-surface::before{left:9px;top:9px;border-left:1px solid;border-top:1px solid;border-radius:16px 0 0 0}
.momo-floral-surface::after{right:9px;bottom:9px;border-right:1px solid;border-bottom:1px solid;border-radius:0 0 16px 0}
.momo-floral-mark{display:inline-flex;align-items:center;justify-content:center;width:22px;height:22px;margin-right:7px;color:var(--a);font-family:serif;font-size:15px;line-height:1;transform-origin:center;animation:momoBloom 4s ease-in-out infinite}
@keyframes momoBloom{0%,100%{transform:rotate(-7deg) scale(.94)}50%{transform:rotate(7deg) scale(1.06)}}
.momo-floral-rule{display:flex;align-items:center;gap:9px;height:16px;margin:4px 0 10px;color:var(--a);opacity:.52;pointer-events:none}.momo-floral-rule::before,.momo-floral-rule::after{content:"";height:1px;flex:1;background:linear-gradient(90deg,transparent,color-mix(in srgb,var(--a) 42%,transparent))}.momo-floral-rule span{font-family:serif;font-size:13px;animation:momoBloom 4s ease-in-out infinite}

/* Preserve the working V6 behavior. */
button:active,.tool:active,.pl-item:active,.song:active,.nav button:active,.side-action:active{transform:scale(.96)!important;transition:transform .08s ease!important}
.momo-ripple{position:fixed;z-index:99999;width:7px;height:7px;border-radius:50%;pointer-events:none;background:var(--a);animation:momoRipple .42s ease-out forwards}@keyframes momoRipple{0%{opacity:.75;transform:translate(-50%,-50%) scale(.5)}100%{opacity:0;transform:translate(-50%,-50%) scale(8)}}
#mobileMenuClose{display:none!important;position:fixed!important;z-index:10001;width:34px;height:34px;place-items:center;border:1px solid var(--border);border-radius:50%;background:var(--solid);color:var(--muted)}body.momo-menu-open #mobileMenuClose{display:grid!important}
.player input[type=range],.player-bar input[type=range],.progress input[type=range]{--momo-progress:0%;background:linear-gradient(90deg,var(--a),var(--b) var(--momo-progress),var(--track) var(--momo-progress),var(--track))!important;border:0!important}.player input[type=range]::-webkit-slider-runnable-track,.player-bar input[type=range]::-webkit-slider-runnable-track,.progress input[type=range]::-webkit-slider-runnable-track{height:6px;background:transparent!important}
[data-density],.density-setting,.density-control,.interface-density{display:none!important}.settings-button svg,.settings-btn svg,[aria-label="Settings"] svg,[title="Settings"] svg{display:block!important;visibility:visible!important;opacity:1!important}.lyric-line,[data-lyric-line],.lyrics-line,[class*="lyric"] [data-time]{cursor:pointer}.lyric-line:hover,[data-lyric-line]:hover,.lyrics-line:hover,[class*="lyric"] [data-time]:hover{color:var(--a)!important;transform:translateX(3px)}
`;

s = s.replace(/<\/style>/i, css + '\n</style>');

const js = `<script id="momo-botanical-ui-v8">(()=>{
const A=(x,r=document)=>[...r.querySelectorAll(x)];
const N=v=>{const n=parseFloat(v);return Number.isFinite(n)?n:null};
const density=()=>A('[data-density],.density-setting,.density-control,.interface-density').forEach(e=>(e.closest('.setting,.setting-row,.setting-item,.control-row')||e).remove());
const progress=()=>A('input[type="range"]').forEach(r=>{const m=N(r.max),v=N(r.value);if(m)r.style.setProperty('--momo-progress',Math.max(0,Math.min(100,v/m*100))+'%')});
const menu=()=>{const x=document.querySelector('.side');document.body.classList.toggle('momo-menu-open',!!x&&(x.classList.contains('open')||x.classList.contains('show')||x.classList.contains('active')))};
const close=()=>{let b=document.getElementById('mobileMenuClose');if(!b){b=document.createElement('button');b.type='button';b.id='mobileMenuClose';b.setAttribute('aria-label','Close menu');b.innerHTML='<svg viewBox="0 0 24 24"><path d="M7 7l10 10M17 7 7 17"/></svg>';document.body.appendChild(b)}b.onclick=()=>{document.querySelector('.side')?.classList.remove('open','show','active');menu()};const x=document.querySelector('.side');if(x)new MutationObserver(menu).observe(x,{attributes:true,attributeFilter:['class']});menu()};
const ripple=()=>document.addEventListener('pointerdown',e=>{if(!e.target.closest?.('button,.tool,.pl-item,.song,.nav button,.side-action'))return;const r=document.createElement('span');r.className='momo-ripple';r.style.left=e.clientX+'px';r.style.top=e.clientY+'px';document.body.appendChild(r);r.onanimationend=()=>r.remove()},{passive:true});
const lyrics=()=>document.addEventListener('click',e=>{const l=e.target.closest?.('.lyric-line,[data-lyric-line],.lyrics-line,[class*="lyric"] [data-time]');if(!l)return;const a=document.querySelector('audio');let t=null;for(const k of ['data-time','data-start','data-timestamp','data-seconds']){const v=N(l.getAttribute?.(k));if(v!==null){t=v;break}}if(t===null){const m=(l.textContent||'').match(/(?:^|\s)(\d{1,2}):(\d{2})(?:\s|$)/);if(m)t=+m[1]*60+ +m[2]}if(a&&t!==null)a.currentTime=Math.max(0,t)},true);
const floral=()=>{
  const roots=A('.home-hero,.player,.player-bar,.now-playing,.settings-card,.card,.panel,.playlist-card');
  roots.forEach(root=>{
    if(root.querySelector(':scope > .momo-floral-mark'))return;
    root.classList.add('momo-floral-surface');
    const mark=document.createElement('span');mark.className='momo-floral-mark';mark.textContent='❈';mark.setAttribute('aria-hidden','true');
    const title=root.querySelector(':scope > h1,:scope > h2,:scope > h3,.title,.card-title,.section-title');
    if(title)title.prepend(mark);else root.appendChild(mark);
  });
  A('.section-title,.library-title,.settings-title,.playlist-title').forEach(h=>{
    if(h.nextElementSibling?.classList.contains('momo-floral-rule'))return;
    const d=document.createElement('div');d.className='momo-floral-rule';d.innerHTML='<span>❈</span>';h.insertAdjacentElement('afterend',d);
  });
};
const init=()=>{density();progress();close();ripple();lyrics();floral();document.addEventListener('input',progress,true);document.addEventListener('change',progress,true)};
document.readyState==='loading'?document.addEventListener('DOMContentLoaded',init,{once:true}):init();
})();</script>`;

s=s.replace(/<\/body>/i,js+'</body>');
fs.writeFileSync(p,s,'utf8');
console.log('V8 botanical UI repair applied');
