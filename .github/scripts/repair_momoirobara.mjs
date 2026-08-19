import fs from 'node:fs';

const p = 'index.html';
let s = fs.readFileSync(p, 'utf8');
const marker = '/* MOMOIROBARA FLOWER UI REPAIR V5 */';
if (s.includes(marker)) process.exit(0);

s = s.replace(/\/\* MOMOIROBARA FLOWER UI REPAIR(?: V2| V3| V4| V5)? \*\/.*?(?=<\/style>)/gs, '');
s = s.replace(/<script[^>]*id="momo-flower-ui-v[0-9]+"[^>]*>[\s\S]*?<\/script>/gi, '');
s = s.replace(/\s*<canvas id="momoCanvasUI"[^>]*><\/canvas>/gi, '');

const css = `
${marker}
/* FLOWER UI: decorative, animated, but never blocks interaction */
#momoCanvasUI{position:fixed;inset:0;width:100%;height:100%;pointer-events:none;z-index:1;opacity:.46}

/* real press feedback on every interactive control */
button,.tool,.pl-item,.song,.nav button,.side-action,.primary,.secondary,.icon-btn{transform-origin:center;}
button:active,.tool:active,.pl-item:active,.song:active,.nav button:active,.side-action:active,.primary:active,.secondary:active,.icon-btn:active{transform:scale(.94)!important;transition:transform .08s ease!important}
.momo-ripple{position:fixed;z-index:99999;width:8px;height:8px;border-radius:50%;pointer-events:none;background:color-mix(in srgb,var(--a) 70%,#fff);box-shadow:0 0 0 1px color-mix(in srgb,var(--a) 35%,transparent),0 0 18px color-mix(in srgb,var(--a) 45%,transparent);animation:momoRipple .48s var(--ease) forwards}
@keyframes momoRipple{0%{opacity:.9;transform:translate(-50%,-50%) scale(.5)}65%{opacity:.35;transform:translate(-50%,-50%) scale(7)}100%{opacity:0;transform:translate(-50%,-50%) scale(10)}}

/* make the entire interface feel botanical instead of adding three floating symbols */
.logo,.home-hero,.head,.library-top,.songs,.song,.player,.player-bar,.now-playing,.side-action,.tool,.search,.primary,.secondary,.nav button,.pl-item,.settings-card,.setting,.setting-row,.setting-item,.card,.panel{position:relative;}
.logo:before,.home-hero:before,.head:before,.library-top:before,.song:before,.player:before,.player-bar:before,.side-action:before,.tool:before,.nav button:before,.pl-item:before,.settings-card:before,.setting:before,.setting-row:before,.setting-item:before,.card:before,.panel:before{content:'✿';position:absolute;pointer-events:none;color:var(--a);font-size:11px;line-height:1;opacity:.42;filter:drop-shadow(0 2px 5px color-mix(in srgb,var(--a) 25%,transparent));animation:momoPetal 4.5s ease-in-out infinite;}
.logo:before{right:9px;top:8px}.home-hero:before{right:25px;top:20px;font-size:24px}.head:before{right:5px;top:-3px}.library-top:before{right:0;top:0;font-size:18px}.song:before{right:48px;top:7px;font-size:9px;animation-delay:-1s}.player:before,.player-bar:before{left:8px;top:8px;font-size:12px}.side-action:before{right:8px;top:7px}.tool:before{right:5px;top:4px;font-size:8px}.nav button:before,.pl-item:before{right:7px;top:6px;font-size:8px}.settings-card:before,.setting:before,.setting-row:before,.setting-item:before{right:9px;top:8px}.card:before,.panel:before{right:10px;top:9px}
@keyframes momoPetal{0%,100%{transform:translateY(0) rotate(-10deg);opacity:.28}50%{transform:translateY(-4px) rotate(10deg);opacity:.68}}

/* botanical borders and tiny petals around major surfaces */
.home-hero,.player,.player-bar,.now-playing,.settings-card,.card,.panel{border-color:color-mix(in srgb,var(--a) 22%,var(--border));}
.home-hero:after{content:'❀  ✿  ❁';position:absolute;left:24px;bottom:18px;inset:auto auto 16px 24px;color:color-mix(in srgb,var(--a) 52%,transparent);font-size:17px;letter-spacing:14px;opacity:.48;animation:momoGarden 7s ease-in-out infinite;filter:drop-shadow(0 4px 8px color-mix(in srgb,var(--a) 20%,transparent))}
@keyframes momoGarden{0%,100%{transform:translateY(0) rotate(-1deg)}50%{transform:translateY(-5px) rotate(1deg)}}

/* proper menu close: hidden until menu is genuinely open */
#mobileMenuClose{display:none!important;position:fixed!important;z-index:10001;width:34px;height:34px;place-items:center;border:1px solid var(--border);border-radius:50%;background:var(--solid);color:var(--muted);box-shadow:var(--shadow2)}
body.momo-menu-open #mobileMenuClose{display:grid!important}
#mobileMenuClose svg{width:16px;height:16px;fill:none;stroke:currentColor;stroke-width:2;stroke-linecap:round}
@media(max-width:900px){#mobileMenuClose{left:calc(min(82vw,320px) + 10px);top:18px}}
@media(min-width:901px){#mobileMenuClose{left:248px;top:20px}}

/* progress is a trail, never a transparent empty-looking player surface */
.player input[type=range],.player-bar input[type=range],.progress input[type=range]{--momo-progress:0%;background:linear-gradient(90deg,var(--a) 0%,var(--b) var(--momo-progress),var(--track) var(--momo-progress),var(--track) 100%)!important;border:0!important;accent-color:var(--a)!important}
.player input[type=range]::-webkit-slider-runnable-track,.player-bar input[type=range]::-webkit-slider-runnable-track,.progress input[type=range]::-webkit-slider-runnable-track{height:6px;border:0;border-radius:999px;background:transparent!important}
.player input[type=range]::-moz-range-track,.player-bar input[type=range]::-moz-range-track,.progress input[type=range]::-moz-range-track{height:6px;border:0;border-radius:999px;background:transparent!important}
.player input[type=range]::-moz-range-progress,.player-bar input[type=range]::-moz-range-progress,.progress input[type=range]::-moz-range-progress{height:6px;border-radius:999px;background:linear-gradient(90deg,var(--a),var(--b))!important}
.player input[type=range]::-webkit-slider-thumb,.player-bar input[type=range]::-webkit-slider-thumb{margin-top:-4px;width:14px;height:14px;border:2px solid var(--solid);border-radius:50%;background:var(--a);box-shadow:0 2px 8px color-mix(in srgb,var(--a) 35%,transparent)}

/* density is gone */
[data-density],.density-setting,.density-control,.interface-density{display:none!important}
.nav button.active:after{display:none!important}

/* settings icon repair: give the settings control its own stable floral icon treatment */
.momo-settings-icon{display:grid!important;place-items:center;width:30px;height:30px;border-radius:10px;background:var(--bg);border:1px solid var(--border);color:var(--a);flex:0 0 auto}
.momo-settings-icon svg{width:16px;height:16px;fill:none;stroke:currentColor;stroke-width:1.8;stroke-linecap:round;stroke-linejoin:round}
.momo-settings-icon:after{content:'✿';position:absolute;right:-4px;top:-5px;font-size:8px;color:var(--a);animation:momoPetal 3.5s ease-in-out infinite}

.lyric-line,[data-lyric-line],.lyrics-line,[class*="lyric"] [data-time]{cursor:pointer;transition:color .18s ease,transform .18s ease}
.lyric-line:hover,[data-lyric-line]:hover,.lyrics-line:hover,[class*="lyric"] [data-time]:hover{transform:translateX(4px);color:var(--a)!important}
`;
s = s.replace(/<\/style>/i, css + '\n</style>');

const js = `
<script id="momo-flower-ui-v5">
(()=>{
const q=(sel,root=document)=>[...root.querySelectorAll(sel)], audio=()=>document.querySelector('audio');
const num=v=>{const n=parseFloat(v);return Number.isFinite(n)?n:null};
const lyricTime=el=>{for(const k of ['data-time','data-start','data-timestamp','data-seconds']){const n=num(el.getAttribute?.(k));if(n!=null)return n}const m=(el.textContent||'').match(/(?:^|\\s)(\\d{1,2}):(\\d{2})(?:\\s|$)/);return m?Number(m[1])*60+Number(m[2]):null};
const update=()=>q('input[type="range"]').forEach(r=>{const max=num(r.max)||100,val=num(r.value)||0;r.style.setProperty('--momo-progress',Math.max(0,Math.min(100,val/max*100))+'%')});
const density=()=>{q('[data-density],.density-setting,.density-control,.interface-density').forEach(e=>e.remove());q('.setting,.setting-row,.setting-item,.control-row').forEach(e=>{const t=(e.textContent||'').replace(/\\s+/g,' ').trim();if(/^interface\\s+density(?:\\s|:|$)/i.test(t)||/^density(?:\\s|:|$)/i.test(t))e.remove()})};
const settings=()=>q('button,.nav button,.side-action').forEach(b=>{const text=((b.getAttribute('aria-label')||'')+' '+(b.getAttribute('title')||'')+' '+(b.textContent||'')).replace(/\\s+/g,' ').trim();if(!/settings/i.test(text)||b.querySelector('.momo-settings-icon'))return;const old=b.querySelector('.nav-icon');if(old){old.classList.add('momo-settings-icon');old.innerHTML='<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 8.2a3.8 3.8 0 1 0 0 7.6 3.8 3.8 0 0 0 0-7.6Z"/><path d="m19.1 13.5 1.2.9-1.8 3.1-1.4-.6a7.6 7.6 0 0 1-1.9 1.1l-.2 1.5h-3.6l-.2-1.5a7.6 7.6 0 0 1-1.9-1.1l-1.4.6-1.8-3.1 1.2-.9a7.3 7.3 0 0 1 0-2.2l-1.2-.9 1.8-3.1 1.4.6a7.6 7.6 0 0 1 1.9-1.1l.2-1.5h3.6l.2 1.5a7.6 7.6 0 0 1 1.9 1.1l1.4-.6 1.8 3.1-1.2.9a7.3 7.3 0 0 1 0 2.2Z"/></svg>'}});
const menu=()=>{const side=document.querySelector('.side');const open=!!side&&(side.classList.contains('open')||side.classList.contains('show')||side.classList.contains('active'));document.body.classList.toggle('momo-menu-open',open)};
const close=()=>{let b=document.getElementById('mobileMenuClose');if(!b){b=document.createElement('button');b.type='button';b.id='mobileMenuClose';b.setAttribute('aria-label','Close menu');b.innerHTML='<svg viewBox="0 0 24 24"><path d="M7 7l10 10M17 7 7 17"/></svg>';document.body.appendChild(b)}b.onclick=()=>{const side=document.querySelector('.side'),m=q('button').find(x=>x!==b&&/menu|sidebar/i.test((x.getAttribute('aria-label')||'')+' '+(x.getAttribute('title')||'')));if(m)m.click();else side?.classList.remove('open','show','active');setTimeout(menu,0)};const side=document.querySelector('.side');if(side)new MutationObserver(menu).observe(side,{attributes:true,attributeFilter:['class','style']});menu()};
const flowers=()=>{const root=document.querySelector('.app')||document.body;if(root.querySelector('.momo-flower'))return;['✿','❀','✽','✾','❁','❋','✻','✼'].forEach((g,i)=>{const e=document.createElement('span');e.className='momo-flower f'+(i+1);e.textContent=g;root.appendChild(e)})};
const canvas=()=>{if(document.getElementById('momoCanvasUI'))return;const c=document.createElement('canvas');c.id='momoCanvasUI';document.body.appendChild(c);const gl=c.getContext('webgl',{alpha:true,antialias:false,powerPreference:'low-power'});if(!gl)return;const V='attribute vec2 p;void main(){gl_Position=vec4(p,0.,1.)}',F='precision mediump float;uniform float t;uniform vec2 r;uniform vec2 m;void main(){vec2 p=gl_FragCoord.xy/r-.5;float d=length(p-m);float w=sin(d*42.-t*2.4)*exp(-d*7.);gl_FragColor=vec4(.95,.48,.68,max(0.,w)*.028);}';const sh=(t,s)=>{const x=gl.createShader(t);gl.shaderSource(x,s);gl.compileShader(x);return x},pr=gl.createProgram();gl.attachShader(pr,sh(gl.VERTEX_SHADER,V));gl.attachShader(pr,sh(gl.FRAGMENT_SHADER,F));gl.linkProgram(pr);gl.useProgram(pr);const b=gl.createBuffer();gl.bindBuffer(gl.ARRAY_BUFFER,b);gl.bufferData(gl.ARRAY_BUFFER,new Float32Array([-1,-1,1,-1,-1,1,-1,1,1,-1,1,1]),gl.STATIC_DRAW);const l=gl.getAttribLocation(pr,'p');gl.enableVertexAttribArray(l);gl.vertexAttribPointer(l,2,gl.FLOAT,false,0,0);const ut=gl.getUniformLocation(pr,'t'),ur=gl.getUniformLocation(pr,'r'),um=gl.getUniformLocation(pr,'m');let mx=.5,my=.5;addEventListener('pointermove',e=>{mx=e.clientX/innerWidth;my=1-e.clientY/innerHeight},{passive:true});const resize=()=>{const d=Math.min(devicePixelRatio||1,1.25);c.width=innerWidth*d;c.height=innerHeight*d;gl.viewport(0,0,c.width,c.height);gl.uniform2f(ur,c.width,c.height)};addEventListener('resize',resize);resize();let last=0;const frame=t=>{if(t-last>33){last=t;gl.uniform1f(ut,t/1000);gl.uniform2f(um,mx,my);gl.drawArrays(gl.TRIANGLES,0,6)}requestAnimationFrame(frame)};requestAnimationFrame(frame)};
const click=()=>document.addEventListener('pointerdown',e=>{const target=e.target.closest?.('button,.tool,.pl-item,.song,.nav button,.side-action,.primary,.secondary,.icon-btn');if(!target)return;const r=document.createElement('span');r.className='momo-ripple';r.style.left=e.clientX+'px';r.style.top=e.clientY+'px';document.body.appendChild(r);r.addEventListener('animationend',()=>r.remove(),{once:true})},{passive:true});
const lyrics=()=>document.addEventListener('click',e=>{const el=e.target.closest?.('.lyric-line,[data-lyric-line],.lyrics-line,[class*="lyric"] [data-time]');if(!el)return;const a=audio(),t=lyricTime(el);if(a&&t!=null){a.currentTime=Math.max(0,Math.min(a.duration||t,t));a.play?.().catch(()=>{})}},true);
const init=()=>{density();settings();close();flowers();canvas();click();lyrics();update();document.addEventListener('input',update,true);document.addEventListener('change',update,true);new MutationObserver(()=>{density();settings()}).observe(document.body,{childList:true,subtree:true})};document.readyState==='loading'?document.addEventListener('DOMContentLoaded',init,{once:true}):init();
})();
</script>
`;
s = s.replace(/<\/body>/i, js + '</body>');
fs.writeFileSync(p,s,'utf8');
console.log('Momoirobara V5 repair applied');
