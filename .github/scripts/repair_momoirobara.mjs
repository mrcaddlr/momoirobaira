import fs from 'node:fs';

const p = 'index.html';
let s = fs.readFileSync(p, 'utf8');
const marker = '/* MOMOIROBARA BOTANICAL UI V8 */';

// Rebuild the V8 repair on the current index without deleting the existing app.
if (!s.includes(marker)) {
  const css = `${marker}
button:active,.tool:active,.pl-item:active,.song:active,.nav button:active,.side-action:active{transform:scale(.96)!important;transition:transform .08s ease!important}
.momo-ripple{position:fixed;z-index:99999;width:7px;height:7px;border-radius:50%;pointer-events:none;background:var(--a);animation:momoRipple .42s ease-out forwards}@keyframes momoRipple{0%{opacity:.75;transform:translate(-50%,-50%) scale(.5)}100%{opacity:0;transform:translate(-50%,-50%) scale(8)}}
#mobileMenuClose{display:none!important;position:fixed!important;z-index:10001;width:34px;height:34px;place-items:center;border:1px solid var(--border);border-radius:50%;background:var(--solid);color:var(--muted)}body.momo-menu-open #mobileMenuClose{display:grid!important}
.player input[type=range],.player-bar input[type=range],.progress input[type=range]{--momo-progress:0%;background:linear-gradient(90deg,var(--a),var(--b) var(--momo-progress),var(--track) var(--momo-progress),var(--track))!important;border:0!important}.player input[type=range]::-webkit-slider-runnable-track,.player-bar input[type=range]::-webkit-slider-runnable-track,.progress input[type=range]::-webkit-slider-runnable-track{height:6px;background:transparent!important}
[data-density],.density-setting,.density-control,.interface-density{display:none!important}.settings-button svg,.settings-btn svg,[aria-label="Settings"] svg,[title="Settings"] svg{display:block!important;visibility:visible!important;opacity:1!important}.lyric-line,[data-lyric-line],.lyrics-line,[class*="lyric"] [data-time]{cursor:pointer}.lyric-line:hover,[data-lyric-line]:hover,.lyrics-line:hover,[class*="lyric"] [data-time]:hover{color:var(--a)!important;transform:translateX(3px)}
.momo-floral-surface{position:relative;isolation:isolate}.momo-floral-surface::before,.momo-floral-surface::after{content:"";position:absolute;pointer-events:none;z-index:0;width:38px;height:38px;border-color:color-mix(in srgb,var(--a) 42%,transparent);opacity:.55}.momo-floral-surface::before{left:9px;top:9px;border-left:1px solid;border-top:1px solid;border-radius:16px 0 0 0}.momo-floral-surface::after{right:9px;bottom:9px;border-right:1px solid;border-bottom:1px solid;border-radius:0 0 16px 0}.momo-floral-mark{display:inline-flex;align-items:center;justify-content:center;width:22px;height:22px;margin-right:7px;color:var(--a);font-family:serif;font-size:15px;animation:momoBloom 4s ease-in-out infinite}@keyframes momoBloom{0%,100%{transform:rotate(-7deg) scale(.94)}50%{transform:rotate(7deg) scale(1.06)}}.momo-floral-rule{display:flex;align-items:center;gap:9px;height:16px;margin:4px 0 10px;color:var(--a);opacity:.52;pointer-events:none}.momo-floral-rule::before,.momo-floral-rule::after{content:"";height:1px;flex:1;background:linear-gradient(90deg,transparent,color-mix(in srgb,var(--a) 42%,transparent))}.momo-floral-rule span{font-family:serif;font-size:13px;animation:momoBloom 4s ease-in-out infinite}
`;
  s = s.replace(/<\/style>/i, css + '\n</style>');

  const js = `<script id="momo-botanical-ui-v8">(()=>{const A=(x,r=document)=>[...r.querySelectorAll(x)],N=v=>{const n=parseFloat(v);return Number.isFinite(n)?n:null};const density=()=>A('[data-density],.density-setting,.density-control,.interface-density').forEach(e=>(e.closest('.setting,.setting-row,.setting-item,.control-row')||e).remove());const progress=()=>A('input[type="range"]').forEach(r=>{const m=N(r.max),v=N(r.value);if(m)r.style.setProperty('--momo-progress',Math.max(0,Math.min(100,v/m*100))+'%')});const menu=()=>{const x=document.querySelector('.side');document.body.classList.toggle('momo-menu-open',!!x&&(x.classList.contains('open')||x.classList.contains('show')||x.classList.contains('active')))};const close=()=>{let b=document.getElementById('mobileMenuClose');if(!b){b=document.createElement('button');b.type='button';b.id='mobileMenuClose';b.setAttribute('aria-label','Close menu');b.innerHTML='<svg viewBox="0 0 24 24"><path d="M7 7l10 10M17 7 7 17"/></svg>';document.body.appendChild(b)}b.onclick=()=>{document.querySelector('.side')?.classList.remove('open','show','active');menu()};const x=document.querySelector('.side');if(x)new MutationObserver(menu).observe(x,{attributes:true,attributeFilter:['class']});menu()};const ripple=()=>document.addEventListener('pointerdown',e=>{if(!e.target.closest?.('button,.tool,.pl-item,.song,.nav button,.side-action'))return;const r=document.createElement('span');r.className='momo-ripple';r.style.left=e.clientX+'px';r.style.top=e.clientY+'px';document.body.appendChild(r);r.onanimationend=()=>r.remove()},{passive:true});const lyrics=()=>document.addEventListener('click',e=>{const l=e.target.closest?.('.lyric-line,[data-lyric-line],.lyrics-line,[class*="lyric"] [data-time]');if(!l)return;const a=document.querySelector('audio');let t=null;for(const k of ['data-time','data-start','data-timestamp','data-seconds']){const v=N(l.getAttribute?.(k));if(v!==null){t=v;break}}if(t===null){const m=(l.textContent||'').match(/(?:^|\s)(\d{1,2}):(\d{2})(?:\s|$)/);if(m)t=+m[1]*60+ +m[2]}if(a&&t!==null)a.currentTime=Math.max(0,t)},true);const floral=()=>{A('.home-hero,.player,.player-bar,.now-playing,.settings-card,.card,.panel,.playlist-card').forEach(root=>{root.classList.add('momo-floral-surface');const title=root.querySelector(':scope > h1,:scope > h2,:scope > h3,.title,.card-title,.section-title');if(title&&!title.querySelector(':scope > .momo-floral-mark')){const m=document.createElement('span');m.className='momo-floral-mark';m.textContent='❈';m.setAttribute('aria-hidden','true');title.prepend(m)}});A('.section-title,.library-title,.settings-title,.playlist-title').forEach(h=>{if(h.nextElementSibling?.classList.contains('momo-floral-rule'))return;const d=document.createElement('div');d.className='momo-floral-rule';d.innerHTML='<span>❈</span>';h.insertAdjacentElement('afterend',d)})};const init=()=>{density();progress();close();ripple();lyrics();floral();document.addEventListener('input',progress,true);document.addEventListener('change',progress,true)};document.readyState==='loading'?document.addEventListener('DOMContentLoaded',init,{once:true}):init()})()</script>`;
  s = s.replace(/<\/body>/i, js + '\n</body>');
}

// Remove only the unwanted bottom flower decoration. Preserve V8 and all player logic.
s = s.replace(/✿\s*❀\s*✽\s*✾\s*❁\s*❋\s*✻\s*✼/g, '');
s = s.replace(/<script id=["']momo-flower-ui-v5["'][^>]*>[\s\S]*?<\/script>/ig, '');
s = s.replace(/<script id=["']momo-botanical-ui-v7["'][^>]*>[\s\S]*?<\/script>/ig, '');

// Keep the actual player visible and above decorative layers.
const playerFix = `
/* MOMOIROBARA PLAYER/FLOWER TARGETED FIX */
.momo-floral-rule{display:none!important}
footer.player,.player,.player-bar,#playerBar,#nowPlayingBar{display:grid!important;visibility:visible!important;opacity:1!important;position:fixed!important;left:238px;right:0;bottom:0;z-index:9999!important;transform:none!important;clip-path:none!important;pointer-events:auto!important}
@media(max-width:900px){footer.player,.player,.player-bar,#playerBar,#nowPlayingBar{left:0!important;right:0!important}}
`;
if (!s.includes('MOMOIROBARA PLAYER/FLOWER TARGETED FIX')) {
  s = s.replace(/<\/style>/i, playerFix + '\n</style>');
}

fs.writeFileSync(p, s, 'utf8');
console.log('V8 rebuilt, bottom floral glyphs removed, player visibility repaired');
