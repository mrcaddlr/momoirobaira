import fs from 'node:fs';

const p='index.html';
let s=fs.readFileSync(p,'utf8');
const marker='/* MOMOIROBARA BOTANICAL UI V7 */';
if(s.includes(marker)) process.exit(0);

// Remove only the previous V6 repair block, leaving the app's own code untouched.
s=s.replace(/<script[^>]*id="momo-targeted-repair-v6"[^>]*>[\s\S]*?<\/script>/gi,'');
s=s.replace(/\/\* MOMOIROBARA TARGETED REPAIR V6 \*\/[\s\S]*?(?=<\/style>)/g,'');

const css=`${marker}
/* Botanical UI: use borders, corners, separators and motion instead of overlaying flowers on controls. */
.momo-botanical{position:relative}
.momo-botanical::before{content:"";position:absolute;inset:7px;border:1px solid color-mix(in srgb,var(--a) 24%,transparent);border-radius:inherit;pointer-events:none}
.momo-vine{position:absolute;pointer-events:none;z-index:0;width:72px;height:72px;opacity:.34}
.momo-vine svg{width:100%;height:100%;overflow:visible;fill:none;stroke:var(--a);stroke-width:1.35;stroke-linecap:round;stroke-linejoin:round}
.momo-vine path{stroke-dasharray:120;stroke-dashoffset:120;animation:momoVineDraw 2.4s ease forwards,momoVineSway 5s ease-in-out 2.4s infinite}
.momo-vine .petal{fill:var(--a);stroke:none;transform-origin:center;animation:momoPetalPulse 4s ease-in-out infinite}
@keyframes momoVineDraw{to{stroke-dashoffset:0}}@keyframes momoVineSway{0%,100%{transform:rotate(-1deg)}50%{transform:rotate(2deg)}}@keyframes momoPetalPulse{0%,100%{opacity:.35;transform:scale(.9)}50%{opacity:.75;transform:scale(1.08)}}
.momo-floral-divider{height:18px;display:flex;align-items:center;gap:8px;color:var(--a);opacity:.5;pointer-events:none;overflow:hidden}.momo-floral-divider::before,.momo-floral-divider::after{content:"";height:1px;background:linear-gradient(90deg,transparent,color-mix(in srgb,var(--a) 35%,transparent));flex:1}.momo-floral-divider span{font-size:12px;animation:momoPetalPulse 3.8s ease-in-out infinite}
.momo-flower-field{position:fixed;inset:0;pointer-events:none;z-index:0;overflow:hidden}.momo-field-petal{position:absolute;color:var(--a);opacity:.16;font-size:13px;animation:momoFloat 9s ease-in-out infinite}.momo-field-petal:nth-child(2n){animation-duration:12s}.momo-field-petal:nth-child(3n){animation-duration:15s}@keyframes momoFloat{0%,100%{transform:translateY(12px) rotate(0deg);opacity:.08}50%{transform:translateY(-18px) rotate(20deg);opacity:.22}}

/* Keep functional V6 fixes */
button:active,.tool:active,.pl-item:active,.song:active,.nav button:active,.side-action:active{transform:scale(.96)!important;transition:transform .08s ease!important}
.momo-ripple{position:fixed;z-index:99999;width:7px;height:7px;border-radius:50%;pointer-events:none;background:var(--a);animation:momoRipple .42s ease-out forwards}@keyframes momoRipple{0%{opacity:.75;transform:translate(-50%,-50%) scale(.5)}100%{opacity:0;transform:translate(-50%,-50%) scale(8)}}
#mobileMenuClose{display:none!important;position:fixed!important;z-index:10001;width:34px;height:34px;place-items:center;border:1px solid var(--border);border-radius:50%;background:var(--solid);color:var(--muted)}body.momo-menu-open #mobileMenuClose{display:grid!important}
.player input[type=range],.player-bar input[type=range],.progress input[type=range]{--momo-progress:0%;background:linear-gradient(90deg,var(--a),var(--b) var(--momo-progress),var(--track) var(--momo-progress),var(--track))!important;border:0!important}.player input[type=range]::-webkit-slider-runnable-track,.player-bar input[type=range]::-webkit-slider-runnable-track,.progress input[type=range]::-webkit-slider-runnable-track{height:6px;background:transparent!important}
[data-density],.density-setting,.density-control,.interface-density{display:none!important}.settings-button svg,.settings-btn svg,[aria-label="Settings"] svg,[title="Settings"] svg{display:block!important;visibility:visible!important;opacity:1!important}
.lyric-line,[data-lyric-line],.lyrics-line,[class*="lyric"] [data-time]{cursor:pointer}.lyric-line:hover,[data-lyric-line]:hover,.lyrics-line:hover,[class*="lyric"] [data-time]:hover{color:var(--a)!important;transform:translateX(3px)}
`;
s=s.replace(/<\/style>/i,css+'</style>');

const js=`<script id="momo-botanical-ui-v7">(()=>{
const A=(x,r=document)=>[...r.querySelectorAll(x)],N=v=>{const n=parseFloat(v);return Number.isFinite(n)?n:null};
const density=()=>A('[data-density],.density-setting,.density-control,.interface-density').forEach(e=>(e.closest('.setting,.setting-row,.setting-item,.control-row')||e).remove());
const progress=()=>A('input[type="range"]').forEach(r=>{const m=N(r.max),v=N(r.value);if(m)r.style.setProperty('--momo-progress',Math.max(0,Math.min(100,v/m*100))+'%')});
const menu=()=>{const x=document.querySelector('.side');document.body.classList.toggle('momo-menu-open',!!x&&(x.classList.contains('open')||x.classList.contains('show')||x.classList.contains('active')))};
const close=()=>{let b=document.getElementById('mobileMenuClose');if(!b){b=document.createElement('button');b.type='button';b.id='mobileMenuClose';b.setAttribute('aria-label','Close menu');b.innerHTML='<svg viewBox="0 0 24 24"><path d="M7 7l10 10M17 7 7 17"/></svg>';document.body.appendChild(b)}b.onclick=()=>{document.querySelector('.side')?.classList.remove('open','show','active');menu()};const x=document.querySelector('.side');if(x)new MutationObserver(menu).observe(x,{attributes:true,attributeFilter:['class']});menu()};
const ripple=()=>document.addEventListener('pointerdown',e=>{if(!e.target.closest?.('button,.tool,.pl-item,.song,.nav button,.side-action'))return;const r=document.createElement('span');r.className='momo-ripple';r.style.left=e.clientX+'px';r.style.top=e.clientY+'px';document.body.appendChild(r);r.onanimationend=()=>r.remove()},{passive:true});
const lyrics=()=>document.addEventListener('click',e=>{const l=e.target.closest?.('.lyric-line,[data-lyric-line],.lyrics-line,[class*="lyric"] [data-time]');if(!l)return;const a=document.querySelector('audio');let t=null;for(const k of ['data-time','data-start','data-timestamp','data-seconds']){const v=N(l.getAttribute?.(k));if(v!==null){t=v;break}}if(t===null){const m=(l.textContent||'').match(/(?:^|\\s)(\\d{1,2}):(\\d{2})(?:\\s|$)/);if(m)t=+m[1]*60+ +m[2]}if(a&&t!==null)a.currentTime=Math.max(0,t)},true);
const vine=()=>{const host=document.querySelector('.home-hero,.app');if(!host||host.querySelector('.momo-vine'))return;host.classList.add('momo-botanical');const v=document.createElement('div');v.className='momo-vine';v.style.cssText='right:12px;top:10px';v.innerHTML='<svg viewBox="0 0 80 80"><path d="M8 68 C20 48 24 35 43 28 C55 23 62 15 68 5"/><path d="M28 43 C20 38 15 30 15 22"/><path d="M43 29 C48 38 57 42 67 40"/><ellipse class="petal" cx="15" cy="21" rx="5" ry="8" transform="rotate(-35 15 21)"/><ellipse class="petal" cx="67" cy="40" rx="5" ry="8" transform="rotate(65 67 40)"/></svg>';host.appendChild(v)};
const divider=()=>{A('.section-title,.library-title,.settings-title,.playlist-title').forEach(h=>{if(h.nextElementSibling?.classList.contains('momo-floral-divider'))return;const d=document.createElement('div');d.className='momo-floral-divider';d.innerHTML='<span>❀</span>';h.insertAdjacentElement('afterend',d)})};
const field=()=>{if(document.querySelector('.momo-flower-field'))return;const f=document.createElement('div');f.className='momo-flower-field';const glyphs=['·','✧','❋','✦','❈'];for(let i=0;i<18;i++){const e=document.createElement('span');e.className='momo-field-petal';e.textContent=glyphs[i%glyphs.length];e.style.left=(5+Math.random()*90)+'%';e.style.top=(5+Math.random()*90)+'%';e.style.animationDelay=(-Math.random()*12)+'s';f.appendChild(e)}document.body.appendChild(f)};
const init=()=>{density();progress();close();ripple();lyrics();vine();divider();field();document.addEventListener('input',progress,true);document.addEventListener('change',progress,true)};document.readyState==='loading'?document.addEventListener('DOMContentLoaded',init,{once:true}):init();
})()</script>`;
s=s.replace(/<\/body>/i,js+'</body>');
fs.writeFileSync(p,s);console.log('V7 botanical UI repair applied');