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
#momoCanvasUI{position:fixed;inset:0;width:100%;height:100%;pointer-events:none;z-index:1;opacity:.46}
button,.tool,.pl-item,.song,.nav button,.side-action,.primary,.secondary,.icon-btn{transform-origin:center}
button:active,.tool:active,.pl-item:active,.song:active,.nav button:active,.side-action:active,.primary:active,.secondary:active,.icon-btn:active{transform:scale(.94)!important;transition:transform .08s ease!important}
.momo-ripple{position:fixed;z-index:99999;width:8px;height:8px;border-radius:50%;pointer-events:none;background:color-mix(in srgb,var(--a) 70%,#fff);box-shadow:0 0 18px color-mix(in srgb,var(--a) 45%,transparent);animation:momoRipple .48s ease-out forwards}
@keyframes momoRipple{0%{opacity:.9;transform:translate(-50%,-50%) scale(.5)}65%{opacity:.35;transform:translate(-50%,-50%) scale(7)}100%{opacity:0;transform:translate(-50%,-50%) scale(10)}}
.logo,.home-hero,.head,.library-top,.song,.player,.player-bar,.now-playing,.side-action,.tool,.nav button,.pl-item,.settings-card,.setting,.setting-row,.setting-item,.card,.panel{position:relative}
.logo:before,.home-hero:before,.head:before,.library-top:before,.song:before,.player:before,.player-bar:before,.side-action:before,.tool:before,.nav button:before,.pl-item:before,.settings-card:before,.setting:before,.setting-row:before,.setting-item:before,.card:before,.panel:before{content:'✿';position:absolute;pointer-events:none;color:var(--a);font-size:11px;line-height:1;opacity:.42;animation:momoPetal 4.5s ease-in-out infinite}
.logo:before{right:9px;top:8px}.home-hero:before{right:25px;top:20px;font-size:24px}.head:before{right:5px;top:-3px}.library-top:before{right:0;top:0;font-size:18px}.song:before{right:48px;top:7px;font-size:9px}.player:before,.player-bar:before{left:8px;top:8px}.side-action:before{right:8px;top:7px}.tool:before{right:5px;top:4px;font-size:8px}.nav button:before,.pl-item:before{right:7px;top:6px;font-size:8px}.settings-card:before,.setting:before,.setting-row:before,.setting-item:before{right:9px;top:8px}.card:before,.panel:before{right:10px;top:9px}
@keyframes momoPetal{0%,100%{transform:translateY(0) rotate(-10deg);opacity:.28}50%{transform:translateY(-4px) rotate(10deg);opacity:.68}}
.home-hero:after{content:'❀  ✿  ❁';position:absolute;left:24px;bottom:16px;color:color-mix(in srgb,var(--a) 52%,transparent);font-size:17px;letter-spacing:14px;opacity:.48;animation:momoGarden 7s ease-in-out infinite}
@keyframes momoGarden{0%,100%{transform:translateY(0)}50%{transform:translateY(-5px)}}
#mobileMenuClose{display:none!important;position:fixed!important;z-index:10001;width:34px;height:34px;place-items:center;border:1px solid var(--border);border-radius:50%;background:var(--solid);color:var(--muted);box-shadow:var(--shadow2)}
body.momo-menu-open #mobileMenuClose{display:grid!important}
#mobileMenuClose svg{width:16px;height:16px;fill:none;stroke:currentColor;stroke-width:2;stroke-linecap:round}
.player input[type=range],.player-bar input[type=range],.progress input[type=range]{--momo-progress:0%;background:linear-gradient(90deg,var(--a),var(--b) var(--momo-progress),var(--track) var(--momo-progress),var(--track))!important;border:0!important;accent-color:var(--a)!important}
.player input[type=range]::-webkit-slider-runnable-track,.player-bar input[type=range]::-webkit-slider-runnable-track,.progress input[type=range]::-webkit-slider-runnable-track{height:6px;border:0;border-radius:999px;background:transparent!important}
.player input[type=range]::-moz-range-track,.player-bar input[type=range]::-moz-range-track,.progress input[type=range]::-moz-range-track{height:6px;border:0;border-radius:999px;background:transparent!important}
.player input[type=range]::-moz-range-progress,.player-bar input[type=range]::-moz-range-progress,.progress input[type=range]::-moz-range-progress{height:6px;border-radius:999px;background:linear-gradient(90deg,var(--a),var(--b))!important}
[data-density],.density-setting,.density-control,.interface-density{display:none!important}.nav button.active:after{display:none!important}
.momo-settings-icon{display:grid!important;place-items:center;width:30px;height:30px;border-radius:10px;background:var(--bg);border:1px solid var(--border);color:var(--a)}
.momo-settings-icon svg{width:16px;height:16px;fill:none;stroke:currentColor;stroke-width:1.8;stroke-linecap:round;stroke-linejoin:round}
.lyric-line,[data-lyric-line],.lyrics-line,[class*="lyric"] [data-time]{cursor:pointer;transition:color .18s ease,transform .18s ease}
.lyric-line:hover,[data-lyric-line]:hover,.lyrics-line:hover,[class*="lyric"] [data-time]:hover{transform:translateX(4px);color:var(--a)!important}
`;
s = s.replace(/<\/style>/i, css + '\n</style>');

const js = `
<script id="momo-flower-ui-v5">
(()=>{
const q=(sel,root=document)=>[...root.querySelectorAll(sel)], audio=()=>document.querySelector('audio');
const num=v=>{const n=parseFloat(v);return Number.isFinite(n)?n:null};
const lyricTime=el=>{for(const k of ['data-time','data-start','data-timestamp','data-seconds']){const n=num(el.getAttribute?.(k));if(n!=null)return n}return null};
const update=()=>q('input[type="range"]').forEach(r=>{const max=num(r.max)||100,val=num(r.value)||0;r.style.setProperty('--momo-progress',Math.max(0,Math.min(100,val/max*100))+'%')});
const density=()=>q('[data-density],.density-setting,.density-control,.interface-density').forEach(e=>e.remove());
const menu=()=>{const side=document.querySelector('.side');const open=!!side&&(side.classList.contains('open')||side.classList.contains('show')||side.classList.contains('active'));document.body.classList.toggle('momo-menu-open',open)};
const close=()=>{let b=document.getElementById('mobileMenuClose');if(!b){b=document.createElement('button');b.type='button';b.id='mobileMenuClose';b.setAttribute('aria-label','Close menu');b.innerHTML='<svg viewBox="0 0 24 24"><path d="M7 7l10 10M17 7 7 17"/></svg>';document.body.appendChild(b)}b.onclick=()=>{const side=document.querySelector('.side');side?.classList.remove('open','show','active');setTimeout(menu,0)};const side=document.querySelector('.side');if(side)new MutationObserver(menu).observe(side,{attributes:true,attributeFilter:['class']});menu()};
const flowers=()=>{const root=document.querySelector('.app')||document.body;if(root.querySelector('.momo-flower'))return;['✿','❀','✽','✾','❁','❋','✻','✼'].forEach((g,i)=>{const e=document.createElement('span');e.className='momo-flower f'+(i+1);e.textContent=g;root.appendChild(e)})};
const canvas=()=>{if(document.getElementById('momoCanvasUI'))return;const c=document.createElement('canvas');c.id='momoCanvasUI';document.body.appendChild(c);const gl=c.getContext('webgl',{alpha:true,antialias:false,powerPreference:'low-power'});if(!gl)return;const vs=gl.createShader(gl.VERTEX_SHADER),fs=gl.createShader(gl.FRAGMENT_SHADER);gl.shaderSource(vs,'attribute vec2 p;void main(){gl_Position=vec4(p,0.,1.)}');gl.shaderSource(fs,'precision mediump float;uniform float t;void main(){float v=.5+.5*sin(t);gl_FragColor=vec4(.95,.48,.68,.025*v);}');gl.compileShader(vs);gl.compileShader(fs);const pr=gl.createProgram();gl.attachShader(pr,vs);gl.attachShader(pr,fs);gl.linkProgram(pr);gl.useProgram(pr);const b=gl.createBuffer();gl.bindBuffer(gl.ARRAY_BUFFER,b);gl.bufferData(gl.ARRAY_BUFFER,new Float32Array([-1,-1,1,-1,-1,1,-1,1,1,-1,1,1]),gl.STATIC_DRAW);const l=gl.getAttribLocation(pr,'p');gl.enableVertexAttribArray(l);gl.vertexAttribPointer(l,2,gl.FLOAT,false,0,0);const u=gl.getUniformLocation(pr,'t');const resize=()=>{const d=Math.min(devicePixelRatio||1,1.25);c.width=innerWidth*d;c.height=innerHeight*d;gl.viewport(0,0,c.width,c.height)};addEventListener('resize',resize);resize();let last=0;const frame=t=>{if(t-last>33){last=t;gl.uniform1f(u,t/1000);gl.drawArrays(gl.TRIANGLES,0,6)}requestAnimationFrame(frame)};requestAnimationFrame(frame)};
const click=()=>document.addEventListener('pointerdown',e=>{const target=e.target.closest?.('button,.tool,.pl-item,.song,.nav button,.side-action,.primary,.secondary,.icon-btn');if(!target)return;const r=document.createElement('span');r.className='momo-ripple';r.style.left=e.clientX+'px';r.style.top=e.clientY+'px';document.body.appendChild(r);r.addEventListener('animationend',()=>r.remove(),{once:true})},{passive:true});
const lyrics=()=>document.addEventListener('click',e=>{const el=e.target.closest?.('.lyric-line,[data-lyric-line],.lyrics-line,[class*="lyric"] [data-time]');if(!el)return;const a=audio(),t=lyricTime(el);if(a&&t!=null){a.currentTime=t;a.play?.().catch(()=>{})}},true);
const init=()=>{density();close();flowers();canvas();click();lyrics();update();document.addEventListener('input',update,true);document.addEventListener('change',update,true)};document.readyState==='loading'?document.addEventListener('DOMContentLoaded',init,{once:true}):init();
})();
</script>
`;
s = s.replace(/<\/body>/i, js + '</body>');
fs.writeFileSync(p,s,'utf8');
console.log('Momoirobara V5 repair applied');
