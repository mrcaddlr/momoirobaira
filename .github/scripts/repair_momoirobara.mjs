import fs from 'node:fs';

const p = 'index.html';
let s = fs.readFileSync(p, 'utf8');
const marker = '/* MOMOIROBARA TARGETED REPAIR V6 */';
if (s.includes(marker)) process.exit(0);

s = s.replace(/\/\* MOMOIROBARA FLOWER UI REPAIR V[2-5] \*\/[\s\S]*?(?=<\/style>)/g, '');
s = s.replace(/<script[^>]*id="momo-flower-ui-v[0-9]+"[^>]*>[\s\S]*?<\/script>/gi, '');

const css = `
${marker}
button,.tool,.pl-item,.song,.nav button,.side-action,.primary,.secondary,.icon-btn{transform-origin:center}
button:active,.tool:active,.pl-item:active,.song:active,.nav button:active,.side-action:active,.primary:active,.secondary:active,.icon-btn:active{transform:scale(.96)!important;transition:transform .08s ease}
.momo-ripple{position:fixed;z-index:99999;width:7px;height:7px;border-radius:50%;pointer-events:none;background:var(--a);box-shadow:0 0 16px color-mix(in srgb,var(--a) 45%,transparent);animation:momoRipple .42s ease-out forwards}
@keyframes momoRipple{0%{opacity:.75;transform:translate(-50%,-50%) scale(.5)}100%{opacity:0;transform:translate(-50%,-50%) scale(8)}}
.app,.home-hero,.player,.player-bar,.now-playing,.settings-card,.card,.panel,.playlist-card{position:relative}
.app:before,.home-hero:before,.player:before,.player-bar:before,.now-playing:before,.settings-card:before,.card:before,.panel:before,.playlist-card:before{content:'✿';position:absolute;pointer-events:none;color:var(--a);opacity:.4;font-size:13px;animation:momoPetal 4.5s ease-in-out infinite}
.home-hero:before{right:24px;top:18px;font-size:25px}.player:before,.player-bar:before{left:10px;top:7px}.now-playing:before{right:10px;top:7px}.settings-card:before{right:12px;top:10px}.card:before,.panel:before,.playlist-card:before{right:10px;top:8px}
@keyframes momoPetal{0%,100%{transform:translateY(0) rotate(-8deg);opacity:.28}50%{transform:translateY(-4px) rotate(8deg);opacity:.62}}
.home-hero:after{content:'❀  ✿  ❁';position:absolute;left:24px;bottom:16px;color:var(--a);opacity:.4;font-size:16px;letter-spacing:12px;pointer-events:none;animation:momoGarden 6s ease-in-out infinite}
@keyframes momoGarden{0%,100%{transform:translateY(0)}50%{transform:translateY(-4px)}}
#mobileMenuClose{display:none!important;position:fixed!important;z-index:10001;width:34px;height:34px;place-items:center;border:1px solid var(--border);border-radius:50%;background:var(--solid);color:var(--muted);box-shadow:var(--shadow2)}
body.momo-menu-open #mobileMenuClose{display:grid!important}
#mobileMenuClose svg{width:16px;height:16px;fill:none;stroke:currentColor;stroke-width:2;stroke-linecap:round}
.player input[type=range],.player-bar input[type=range],.progress input[type=range]{--momo-progress:0%;background:linear-gradient(90deg,var(--a) 0%,var(--b) var(--momo-progress),var(--track) var(--momo-progress),var(--track) 100%)!important;border:0!important}
.player input[type=range]::-webkit-slider-runnable-track,.player-bar input[type=range]::-webkit-slider-runnable-track,.progress input[type=range]::-webkit-slider-runnable-track{height:6px;background:transparent!important;border:0;border-radius:999px}
.player input[type=range]::-moz-range-track,.player-bar input[type=range]::-moz-range-track,.progress input[type=range]::-moz-range-track{height:6px;background:transparent!important;border:0;border-radius:999px}
.player input[type=range]::-moz-range-progress,.player-bar input[type=range]::-moz-range-progress,.progress input[type=range]::-moz-range-progress{height:6px;border-radius:999px;background:linear-gradient(90deg,var(--a),var(--b))!important}
[data-density],.density-setting,.density-control,.interface-density{display:none!important}
.settings-button svg,.settings-btn svg,[aria-label="Settings"] svg,[title="Settings"] svg{display:block!important;visibility:visible!important;opacity:1!important}
.lyric-line,[data-lyric-line],.lyrics-line,[class*="lyric"] [data-time]{cursor:pointer;transition:color .18s ease,transform .18s ease}
.lyric-line:hover,[data-lyric-line]:hover,.lyrics-line:hover,[class*="lyric"] [data-time]:hover{transform:translateX(3px);color:var(--a)!important}
`;
s = s.replace(/<\/style>/i, css + '\n</style>');

const js = `
<script id="momo-targeted-repair-v6">
(()=>{
const all=(sel,root=document)=>[...root.querySelectorAll(sel)];
const audio=()=>document.querySelector('audio');
const n=v=>{const x=parseFloat(v);return Number.isFinite(x)?x:null};
const density=()=>{all('[data-density],.density-setting,.density-control,.interface-density').forEach(e=>{const row=e.closest('.setting,.setting-row,.setting-item,.control-row');(row||e).remove()})};
const progress=()=>all('input[type="range"]').forEach(r=>{const max=n(r.max),value=n(r.value);if(max&&max>0)r.style.setProperty('--momo-progress',Math.max(0,Math.min(100,value/max*100))+'%')});
const menu=()=>{const side=document.querySelector('.side');const open=!!side&&(side.classList.contains('open')||side.classList.contains('show')||side.classList.contains('active'));document.body.classList.toggle('momo-menu-open',open)};
const closeButton=()=>{let b=document.getElementById('mobileMenuClose');if(!b){b=document.createElement('button');b.type='button';b.id='mobileMenuClose';b.setAttribute('aria-label','Close menu');b.innerHTML='<svg viewBox="0 0 24 24"><path d="M7 7l10 10M17 7 7 17"/></svg>';document.body.appendChild(b)}b.onclick=()=>{const side=document.querySelector('.side');side?.classList.remove('open','show','active');menu()};const side=document.querySelector('.side');if(side&&!side.dataset.momoObserved){side.dataset.momoObserved='1';new MutationObserver(menu).observe(side,{attributes:true,attributeFilter:['class']})}menu()};
const ripple=()=>document.addEventListener('pointerdown',e=>{const target=e.target.closest?.('button,.tool,.pl-item,.song,.nav button,.side-action,.primary,.secondary,.icon-btn');if(!target)return;const r=document.createElement('span');r.className='momo-ripple';r.style.left=e.clientX+'px';r.style.top=e.clientY+'px';document.body.appendChild(r);r.addEventListener('animationend',()=>r.remove(),{once:true})},{passive:true});
const seekLyrics=()=>document.addEventListener('click',e=>{const el=e.target.closest?.('.lyric-line,[data-lyric-line],.lyrics-line,[class*="lyric"] [data-time]');if(!el)return;const a=audio();let t=null;for(const key of ['data-time','data-start','data-timestamp','data-seconds']){const v=n(el.getAttribute?.(key));if(v!==null){t=v;break}}if(t===null){const m=(el.textContent||'').match(/(?:^|\s)(\d{1,2}):(\d{2})(?:\s|$)/);if(m)t=Number(m[1])*60+Number(m[2])}if(a&&t!==null){a.currentTime=Math.max(0,t);a.play?.().catch(()=>{})}},true);
const init=()=>{density();progress();closeButton();ripple();seekLyrics();document.addEventListener('input',progress,true);document.addEventListener('change',progress,true);const mo=new MutationObserver(()=>{density();progress();menu()});mo.observe(document.body,{childList:true,subtree:true,attributes:true,attributeFilter:['class','value']})};document.readyState==='loading'?document.addEventListener('DOMContentLoaded',init,{once:true}):init();
})();
</script>
`;
s=s.replace(/<\/body>/i,js+'</body>');
fs.writeFileSync(p,s,'utf8');
console.log('Momoirobara targeted V6 repair applied');
