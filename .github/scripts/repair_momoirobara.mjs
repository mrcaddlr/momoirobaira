import fs from 'node:fs';

const p = 'index.html';
let s = fs.readFileSync(p, 'utf8');
const marker = '/* MOMOIROBARA FLOWER UI REPAIR V4 */';
if (s.includes(marker)) process.exit(0);

s = s.replace(/\/\* MOMOIROBARA FLOWER UI REPAIR(?: V2| V3| V4)? \*\/.*?(?=<\/style>)/gs, '');
s = s.replace(/<script>[\s\S]*?kawaii-close[\s\S]*?<\/script>/gi, '');
s = s.replace(/\s*<style id="momo-canvas-ui-style">[\s\S]*?<\/style>/gi, '');
s = s.replace(/\s*<canvas id="momoCanvasUI"[^>]*><\/canvas>/gi, '');

const css = `
${marker}
#momoCanvasUI{position:fixed;inset:0;width:100%;height:100%;pointer-events:none;z-index:1;opacity:.72}
.player,.player-bar,.now-playing{background:var(--solid)!important;box-shadow:var(--shadow2)!important}
.player-controls,.transport{background:transparent!important;box-shadow:none!important}
.player .play,.player-bar .play,.player button[aria-label*="Play" i],.player-bar button[aria-label*="Play" i],.player-controls .play,.transport .play{background:linear-gradient(135deg,var(--a),var(--b))!important;color:#fff!important;border:1px solid color-mix(in srgb,var(--a) 45%,var(--border))!important;box-shadow:0 6px 18px color-mix(in srgb,var(--a) 28%,transparent)!important;border-radius:50%!important}
.player input[type=range],.player-bar input[type=range],.progress input[type=range]{--momo-progress:0%;background:linear-gradient(90deg,var(--a) 0%,var(--b) var(--momo-progress),var(--track) var(--momo-progress),var(--track) 100%)!important;border:0!important;accent-color:var(--a)!important}
.player input[type=range]::-webkit-slider-runnable-track,.player-bar input[type=range]::-webkit-slider-runnable-track,.progress input[type=range]::-webkit-slider-runnable-track{height:6px;border:0;border-radius:999px;background:transparent!important}
.player input[type=range]::-moz-range-track,.player-bar input[type=range]::-moz-range-track,.progress input[type=range]::-moz-range-track{height:6px;border:0;border-radius:999px;background:transparent!important}
.player input[type=range]::-moz-range-progress,.player-bar input[type=range]::-moz-range-progress,.progress input[type=range]::-moz-range-progress{height:6px;border-radius:999px;background:linear-gradient(90deg,var(--a),var(--b))!important}
.player input[type=range]::-webkit-slider-thumb,.player-bar input[type=range]::-webkit-slider-thumb,.progress input[type=range]::-webkit-slider-thumb{margin-top:-4px;width:14px;height:14px;border:2px solid var(--solid);border-radius:50%;background:var(--a);box-shadow:0 2px 8px color-mix(in srgb,var(--a) 35%,transparent)}
[data-density],.density-setting,.density-control,.interface-density{display:none!important}
.nav button.active:after{display:none!important}
#mobileMenuClose{display:none!important;position:fixed!important;z-index:10001;width:34px;height:34px;place-items:center;border:1px solid var(--border);border-radius:50%;background:var(--solid);color:var(--muted);box-shadow:var(--shadow2)}
body.momo-menu-open #mobileMenuClose{display:grid!important}
#mobileMenuClose svg{width:16px;height:16px;fill:none;stroke:currentColor;stroke-width:2;stroke-linecap:round}
@media(max-width:900px){#mobileMenuClose{left:calc(min(82vw,320px) + 10px);top:18px}}
@media(min-width:901px){#mobileMenuClose{left:248px;top:20px}}
.momo-flower{position:absolute;z-index:3;pointer-events:none;color:var(--a);font-size:clamp(16px,2vw,30px);opacity:.5;filter:drop-shadow(0 4px 10px color-mix(in srgb,var(--a) 18%,transparent));animation:momoFlowerFloat 5.5s ease-in-out infinite}
.momo-flower.f1{right:4%;top:10%;animation-delay:-1s}.momo-flower.f2{right:12%;bottom:14%;font-size:18px;animation-delay:-3s}.momo-flower.f3{left:2%;top:28%;font-size:17px;animation-delay:-4s}.momo-flower.f4{left:8%;bottom:10%;font-size:22px;animation-delay:-2s}.momo-flower.f5{right:28%;top:5%;font-size:15px;animation-delay:-5s}
@keyframes momoFlowerFloat{0%,100%{transform:translate3d(0,0,0) rotate(-8deg);opacity:.35}50%{transform:translate3d(0,-9px,0) rotate(8deg);opacity:.75}}
.lyric-line,[data-lyric-line],.lyrics-line,[class*="lyric"] [data-time]{cursor:pointer;transition:color .18s ease,transform .18s ease}
.lyric-line:hover,[data-lyric-line]:hover,.lyrics-line:hover,[class*="lyric"] [data-time]:hover{transform:translateX(3px);color:var(--a)!important}
`;
s = s.replace(/<\/style>/i, css + '\n</style>');

const js = `
<script id="momo-flower-ui-v4">
(()=>{
const q=(sel,root=document)=>[...root.querySelectorAll(sel)], audio=()=>document.querySelector('audio');
const num=v=>{const n=parseFloat(v);return Number.isFinite(n)?n:null};
const lyricTime=el=>{for(const k of ['data-time','data-start','data-timestamp','data-seconds']){const n=num(el.getAttribute?.(k));if(n!=null)return n}const m=(el.textContent||'').match(/(?:^|\\s)(\\d{1,2}):(\\d{2})(?:\\s|$)/);return m?Number(m[1])*60+Number(m[2]):null};
const update=()=>q('input[type="range"]').forEach(r=>{const max=num(r.max)||100,val=num(r.value)||0;r.style.setProperty('--momo-progress',Math.max(0,Math.min(100,val/max*100))+'%')});
const density=()=>{q('[data-density],.density-setting,.density-control,.interface-density').forEach(e=>e.remove());q('.setting,.setting-row,.setting-item,.control-row').forEach(e=>{const t=(e.textContent||'').replace(/\\s+/g,' ').trim();if(/^interface\\s+density(?:\\s|:|$)/i.test(t)||/^density(?:\\s|:|$)/i.test(t))e.remove()})};
const menu=()=>{const side=document.querySelector('.side');const open=!!side&&(side.classList.contains('open')||side.classList.contains('show')||side.classList.contains('active'));document.body.classList.toggle('momo-menu-open',open)};
const close=()=>{let b=document.getElementById('mobileMenuClose');if(!b){b=document.createElement('button');b.type='button';b.id='mobileMenuClose';b.setAttribute('aria-label','Close menu');b.innerHTML='<svg viewBox="0 0 24 24"><path d="M7 7l10 10M17 7 7 17"/></svg>';document.body.appendChild(b)}b.onclick=()=>{const side=document.querySelector('.side'),m=q('button').find(x=>x!==b&&/menu|sidebar/i.test((x.getAttribute('aria-label')||'')+' '+(x.getAttribute('title')||'')));if(m)m.click();else side?.classList.remove('open','show','active');setTimeout(menu,0)};const side=document.querySelector('.side');if(side)new MutationObserver(menu).observe(side,{attributes:true,attributeFilter:['class','style']});menu()};
const flowers=()=>{const root=document.querySelector('.app')||document.body;if(root.querySelector('.momo-flower'))return;['✿','❀','✽','✾','❁'].forEach((g,i)=>{const e=document.createElement('span');e.className='momo-flower f'+(i+1);e.textContent=g;root.appendChild(e)})};
const canvas=()=>{if(document.getElementById('momoCanvasUI'))return;const c=document.createElement('canvas');c.id='momoCanvasUI';document.body.appendChild(c);const gl=c.getContext('webgl',{alpha:true,antialias:false,powerPreference:'low-power'});if(!gl)return;const V='attribute vec2 p;void main(){gl_Position=vec4(p,0.,1.)}',F='precision mediump float;uniform float t;uniform vec2 r;uniform vec2 m;void main(){vec2 p=gl_FragCoord.xy/r-.5;float d=length(p-m);float w=sin(d*42.-t*2.4)*exp(-d*7.);gl_FragColor=vec4(.95,.48,.68,max(0.,w)*.045);}';const sh=(t,s)=>{const x=gl.createShader(t);gl.shaderSource(x,s);gl.compileShader(x);return x},pr=gl.createProgram();gl.attachShader(pr,sh(gl.VERTEX_SHADER,V));gl.attachShader(pr,sh(gl.FRAGMENT_SHADER,F));gl.linkProgram(pr);gl.useProgram(pr);const b=gl.createBuffer();gl.bindBuffer(gl.ARRAY_BUFFER,b);gl.bufferData(gl.ARRAY_BUFFER,new Float32Array([-1,-1,1,-1,-1,1,-1,1,1,-1,1,1]),gl.STATIC_DRAW);const l=gl.getAttribLocation(pr,'p');gl.enableVertexAttribArray(l);gl.vertexAttribPointer(l,2,gl.FLOAT,false,0,0);const ut=gl.getUniformLocation(pr,'t'),ur=gl.getUniformLocation(pr,'r'),um=gl.getUniformLocation(pr,'m');let mx=.5,my=.5;addEventListener('pointermove',e=>{mx=e.clientX/innerWidth;my=1-e.clientY/innerHeight},{passive:true});const resize=()=>{const d=Math.min(devicePixelRatio||1,1.5);c.width=innerWidth*d;c.height=innerHeight*d;gl.viewport(0,0,c.width,c.height);gl.uniform2f(ur,c.width,c.height)};addEventListener('resize',resize);resize();const frame=t=>{gl.uniform1f(ut,t/1000);gl.uniform2f(um,mx,my);gl.drawArrays(gl.TRIANGLES,0,6);requestAnimationFrame(frame)};requestAnimationFrame(frame)};
const lyrics=()=>document.addEventListener('click',e=>{const el=e.target.closest?.('.lyric-line,[data-lyric-line],.lyrics-line,[class*="lyric"] [data-time]');if(!el)return;const a=audio(),t=lyricTime(el);if(a&&t!=null){a.currentTime=Math.max(0,Math.min(a.duration||t,t));a.play?.().catch(()=>{})}},true);
const init=()=>{density();close();flowers();canvas();lyrics();update();document.addEventListener('input',update,true);document.addEventListener('change',update,true)};document.readyState==='loading'?document.addEventListener('DOMContentLoaded',init,{once:true}):init();
})();
</script>
`;
s = s.replace(/<\/body>/i, js + '</body>');
fs.writeFileSync(p,s,'utf8');
console.log('Momoirobara V4 repair applied');
