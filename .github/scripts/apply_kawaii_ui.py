from pathlib import Path
import re
import subprocess
import tempfile

p = Path("index.html")
s = p.read_text(encoding="utf-8")
marker = "/* MOMOIROBARA KAWAII UI V2 */"
if marker in s:
    raise SystemExit("kawaii UI v2 is already applied")

css = r'''
/* MOMOIROBARA KAWAII UI V2 */
.player,.player-bar,.now-playing,.player-controls,.progress-wrap,.progress-container,.transport{background:transparent!important;box-shadow:none!important}
.player button,.player-bar button,.player-controls button,.transport button{background:transparent!important}
input[type=range]{background:transparent!important;accent-color:var(--a)}
input[type=range]::-webkit-slider-runnable-track{height:4px;border:0;border-radius:999px;background:var(--track)}
input[type=range]::-webkit-slider-thumb{-webkit-appearance:none;appearance:none;width:14px;height:14px;margin-top:-5px;border:2px solid var(--solid);border-radius:50%;background:linear-gradient(135deg,var(--a),var(--b));box-shadow:0 2px 8px color-mix(in srgb,var(--a) 30%,transparent)}
input[type=range]::-moz-range-track{height:4px;border:0;border-radius:999px;background:var(--track)}
input[type=range]::-moz-range-progress{height:4px;border-radius:999px;background:linear-gradient(90deg,var(--a),var(--b))}
input[type=range]::-moz-range-thumb{width:12px;height:12px;border:2px solid var(--solid);border-radius:50%;background:var(--a)}
:root[data-density=compact] .song{padding:6px 9px;gap:9px}:root[data-density=compact] .cover{width:46px;height:46px}
:root[data-density=normal] .song{padding:9px 11px;gap:12px}:root[data-density=normal] .cover{width:54px;height:54px}
:root[data-density=cozy] .song{padding:13px 13px;gap:14px}:root[data-density=cozy] .cover{width:60px;height:60px}
:root[data-density=spacious] .song{padding:16px 15px;gap:16px}:root[data-density=spacious] .cover{width:64px;height:64px}
.kawaii-close{position:absolute;top:12px;right:12px;z-index:60;width:34px;height:34px;display:grid;place-items:center;border:1px solid var(--border);border-radius:50%;background:color-mix(in srgb,var(--solid) 92%,transparent);color:var(--muted);box-shadow:var(--shadow2);transition:transform .22s var(--ease),color .22s var(--ease),border-color .22s var(--ease)}
.kawaii-close:hover{transform:rotate(8deg) scale(1.06);color:var(--a);border-color:var(--a)}.kawaii-close:active{transform:scale(.92)}.kawaii-close svg{width:16px;height:16px;fill:none;stroke:currentColor;stroke-width:2;stroke-linecap:round}
@media(max-width:900px){.side .kawaii-close{display:grid}.side .logo{width:max-content;min-width:0;margin:0 auto;padding:0 10px}.side .logo-flower{width:34px;height:34px}}
.kawaii-burst{position:fixed;left:0;top:0;width:18px;height:18px;pointer-events:none;z-index:100000;transform:translate(-50%,-50%) scale(.15);border:2px solid var(--a);border-radius:50%;animation:kawaiiRing .62s var(--ease) forwards}
.kawaii-burst i{position:absolute;left:50%;top:50%;width:4px;height:10px;border-radius:999px;background:var(--b);transform-origin:50% 18px;animation:kawaiiSpark .58s var(--ease) forwards}
.kawaii-burst i:nth-child(1){transform:translate(-50%,-50%) rotate(0deg) translateY(-20px)}.kawaii-burst i:nth-child(2){transform:translate(-50%,-50%) rotate(90deg) translateY(-20px)}.kawaii-burst i:nth-child(3){transform:translate(-50%,-50%) rotate(180deg) translateY(-20px)}.kawaii-burst i:nth-child(4){transform:translate(-50%,-50%) rotate(270deg) translateY(-20px)}
@keyframes kawaiiRing{to{transform:translate(-50%,-50%) scale(3.3);opacity:0}}@keyframes kawaiiSpark{to{opacity:0;transform:translate(-50%,-50%) rotate(var(--r,0deg)) translateY(-31px) scale(.25)}}
.kawaii-pop{animation:kawaiiPop .24s var(--ease)}@keyframes kawaiiPop{0%{transform:scale(1)}45%{transform:scale(.95)}100%{transform:scale(1)}}
.nav button,.tool,.side-action,.icon-btn,.round-action,.transport button,.primary,.secondary,.picker{transition:transform .22s var(--ease),background .22s var(--ease),border-color .22s var(--ease),color .22s var(--ease),box-shadow .22s var(--ease)}
:root[data-animations=off] .kawaii-burst{display:none!important}:root[data-animations=low] .kawaii-burst{animation-duration:.42s}
'''

js = r'''
/* MOMOIROBARA KAWAII UI V2 interactions */
(()=>{
  const $=s=>document.querySelector(s);
  const closeSvg='<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M7 7l10 10M17 7 7 17"/></svg>';
  const makeClose=(parent,id,label,fn)=>{
    if(!parent||parent.querySelector('.kawaii-close')) return;
    const b=document.createElement('button'); b.type='button'; b.className='kawaii-close'; b.id=id; b.setAttribute('aria-label',label); b.innerHTML=closeSvg; parent.appendChild(b); b.addEventListener('click',e=>{e.stopPropagation();fn()});
  };
  const clickText=t=>[...document.querySelectorAll('button,[role="button"]')].find(b=>(b.textContent||'').trim().toLowerCase().includes(t));
  const setup=()=>{
    const side=$('.side');
    if(side) makeClose(side,'mobileMenuClose','Close menu',()=>{
      const menu=[...document.querySelectorAll('button')].find(b=>/menu|sidebar/i.test((b.getAttribute('aria-label')||'')+' '+(b.getAttribute('title')||'')));
      if(menu && menu.id!=='mobileMenuClose') menu.click(); else side.classList.remove('open','show','active');
    });
    const lyrics=$('.drawer,.lyrics-drawer,#lyricsDrawer');
    if(lyrics) makeClose(lyrics,'lyricsClose','Close lyrics',()=>{const b=clickText('lyrics');if(b)b.click();else lyrics.classList.remove('open','show','active')});
    const settings=clickText('settings');
    const svg=settings?.querySelector('.nav-icon svg');
    if(svg) svg.innerHTML='<path d="M9.5 3.8h5l.8 2.1c.5.2 1 .5 1.5.9l2.1-.8 2.5 4.3-1.7 1.5a7 7 0 0 1 0 1.7l1.7 1.5-2.5 4.3-2.1-.8c-.5.4-1 .7-1.5.9l-.8 2.1h-5l-.8-2.1c-.5-.2-1-.5-1.5-.9l-2.1.8-2.5-4.3 1.7-1.5a7 7 0 0 1 0-1.7L2.6 10.3l2.5-4.3 2.1.8c.5-.4 1-.7 1.5-.9l.8-2.1Z"/><circle cx="12" cy="12.6" r="2.5"/>';
    const candidates=[...document.querySelectorAll('select')];
    const density=candidates.find(s=>/compact|normal|cozy|spacious/i.test([...s.options].map(o=>o.value+' '+o.textContent).join(' '))) || $('#density');
    if(density){
      const apply=()=>{const v=(density.value||localStorage.getItem('density')||'normal').toLowerCase();document.documentElement.dataset.density=v;try{localStorage.setItem('density',v)}catch{}};
      density.addEventListener('change',apply);density.addEventListener('input',apply);apply();
    }else{document.documentElement.dataset.density=localStorage.getItem('density')||'normal'}
  };
  const burst=e=>{
    if(document.documentElement.dataset.animations==='off'||e.button!==0)return;
    const b=document.createElement('span'); b.className='kawaii-burst'; b.style.left=e.clientX+'px'; b.style.top=e.clientY+'px';
    for(let i=0;i<4;i++){const s=document.createElement('i');s.style.setProperty('--r',(i*90)+'deg');b.appendChild(s)} document.body.appendChild(b);setTimeout(()=>b.remove(),700);
    const hit=e.target.closest?.('button,.tool,.side-action,.icon-btn,.round-action,.primary,.secondary,.picker,.nav button,.pl-item');
    if(hit){hit.classList.remove('kawaii-pop');void hit.offsetWidth;hit.classList.add('kawaii-pop');setTimeout(()=>hit.classList.remove('kawaii-pop'),260)}
  };
  if(document.readyState==='loading') document.addEventListener('DOMContentLoaded',setup,{once:true}); else setup();
  document.addEventListener('pointerdown',burst,{passive:true});
})();
'''

if '</style>' not in s or '</body>' not in s:
    raise SystemExit('index.html structure check failed')
s=s.replace('</style>',css+'\n</style>',1)
s=s.replace('</body>','<script>\n'+js+'\n</script>\n</body>',1)

# Syntax-check every inline script before writing the result.
for i,script in enumerate(re.findall(r'<script[^>]*>(.*?)</script>',s,flags=re.S|re.I)):
    if not script.strip():
        continue
    with tempfile.NamedTemporaryFile('w',suffix='.js',delete=False,encoding='utf-8') as f:
        f.write(script); name=f.name
    r=subprocess.run(['node','--check',name],capture_output=True,text=True)
    Path(name).unlink(missing_ok=True)
    if r.returncode:
        print(r.stderr)
        raise SystemExit(f'JavaScript syntax check failed in inline script {i}')

p.write_text(s,encoding='utf-8')
print('Applied clean kawaii UI v2 and passed HTML structure + inline JS syntax checks.')
