import fs from 'node:fs';

const p = 'index.html';
let s = fs.readFileSync(p, 'utf8');
const marker = '/* MOMOIROBARA FLOWER UI REPAIR */';
if (s.includes(marker)) process.exit(0);

const css = `
${marker}
.player,.player-bar,.now-playing{background:var(--solid)!important;box-shadow:var(--shadow2)!important}
.progress-wrap,.progress-container{background:var(--solid)!important}
.player-controls,.transport{background:transparent!important;box-shadow:none!important}
.player .progress,.player-bar .progress,.progress-wrap .progress,.progress-container .progress{background:linear-gradient(90deg,var(--a),var(--b))!important}
.player input[type=range],.player-bar input[type=range]{background:transparent!important;accent-color:var(--a)}
.player input[type=range]::-webkit-slider-runnable-track,.player-bar input[type=range]::-webkit-slider-runnable-track{height:5px;border:0;border-radius:999px;background:var(--track)!important}
.player input[type=range]::-moz-range-track,.player-bar input[type=range]::-moz-range-track{height:5px;border:0;border-radius:999px;background:var(--track)!important}
.player .play,.player-bar .play,.player button[aria-label*="Play" i],.player-bar button[aria-label*="Play" i],.player-controls .play,.transport .play{background:linear-gradient(135deg,var(--a),var(--b))!important;color:#fff!important;border:1px solid color-mix(in srgb,var(--a) 45%,var(--border))!important;box-shadow:0 5px 14px color-mix(in srgb,var(--a) 24%,transparent)!important;border-radius:50%!important}
.logo,.home-hero,.song,.tool,.primary,.secondary,.side-action,.icon-btn,.search,.library-tools,.nav button,.pl-item{border-radius:18px}
.logo,.home-hero,.head,.library-top,.songs,.page{position:relative}
.home-hero:before{content:"✿";position:absolute;right:34px;top:24px;font-size:64px;line-height:1;color:color-mix(in srgb,var(--a) 15%,transparent);transform:rotate(-12deg);pointer-events:none}
.song:before{content:"";position:absolute;left:-5px;top:50%;width:9px;height:9px;border-radius:50% 0 50% 50%;background:color-mix(in srgb,var(--a) 65%,transparent);transform:translateY(-50%) rotate(-35deg);opacity:0;transition:opacity .2s,transform .2s;pointer-events:none}.song:hover:before{opacity:.8;transform:translateY(-50%) rotate(0deg)}
.nav button.active:after{content:"";width:6px;height:6px;border-radius:50% 0 50% 50%;background:var(--a);position:absolute;right:10px;top:8px;transform:rotate(35deg)}
.kawaii-close{position:fixed!important;display:grid;place-items:center;z-index:10001;width:34px;height:34px;border:1px solid var(--border);border-radius:50%;background:var(--solid);color:var(--muted);box-shadow:var(--shadow2);transition:transform .22s var(--ease),color .22s var(--ease),border-color .22s var(--ease)}
#mobileMenuClose{left:calc(238px + 10px);top:20px;right:auto}
.kawaii-close:hover{transform:rotate(8deg) scale(1.06);color:var(--a);border-color:var(--a)}.kawaii-close:active{transform:scale(.92)}.kawaii-close svg{width:16px;height:16px;fill:none;stroke:currentColor;stroke-width:2;stroke-linecap:round}
@media(max-width:900px){#mobileMenuClose{left:calc(min(82vw,320px) + 10px);top:18px}}
.nav button,.tool,.side-action,.icon-btn,.round-action,.transport button,.primary,.secondary,.picker,.pl-item{transition:transform .22s var(--ease),background .22s var(--ease),border-color .22s var(--ease),color .22s var(--ease),box-shadow .22s var(--ease)}
.nav button:active,.tool:active,.side-action:active,.icon-btn:active,.round-action:active,.transport button:active,.primary:active,.secondary:active,.picker:active,.pl-item:active{transform:scale(.96)}
`;

s = s.replace(/\/\* MOMOIROBARA KAWAII UI V2 \*\/.*?(?=<\/style>)/gs, '');
s = s.replace(/\s*:root\[data-density=[^}]+\}\s*/g, '\n');
s = s.replace(/document\.addEventListener\(['"]pointerdown['"],burst[^;]*;?/g, '');
s = s.replace(/<\/style>/i, css + '\n</style>');

const js = `\n<script>\n(()=>{\nconst setup=()=>{\nconst side=document.querySelector('.side');\nconst old=side?.querySelector('.kawaii-close');\nif(old){old.remove();const b=document.createElement('button');b.type='button';b.className='kawaii-close';b.id='mobileMenuClose';b.setAttribute('aria-label','Close menu');b.innerHTML='<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M7 7l10 10M17 7 7 17"/></svg>';document.body.appendChild(b);b.addEventListener('click',()=>{const menu=[...document.querySelectorAll('button')].find(x=>/menu|sidebar/i.test((x.getAttribute('aria-label')||'')+' '+(x.getAttribute('title')||''))&&x.id!=='mobileMenuClose');if(menu)menu.click();else side.classList.remove('open','show','active')})}};\nif(document.readyState==='loading')document.addEventListener('DOMContentLoaded',setup,{once:true});else setup();\n})();\n</script>\n`;
s = s.replace(/<\/body>/i, js + '</body>');
fs.writeFileSync(p, s, 'utf8');
console.log('repair applied');
