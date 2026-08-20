from pathlib import Path
import re

p = Path('index.html')
s = p.read_text(encoding='utf-8')

# Remove the previous fake lyric-progress injection completely.
s = re.sub(r'\n?<!-- MOMOIROBARA LYRICS PROGRESS REPAIR -->.*?</script>\s*(?=</body>)', '', s, flags=re.S)

# Remove the old gradient/text-progress lyric rules that made the lyrics look fake.
s = re.sub(r'\.line\{position:relative;cursor:pointer;user-select:none;transition:color \.12s ease,opacity \.12s ease,transform \.12s ease;background:linear-gradient\(90deg,var\(--a\) var\(--progress,0%\),transparent var\(--progress,0%\)\);background-clip:text;-webkit-background-clip:text;color:var\(--muted\)\}\\n', '', s)

payload = r'''<!-- MOMOIROBARA CLEAN PLAYBACK/UI REPAIR -->
<style id="momo-clean-repair-css">
/* Lyrics: plain text with one small playback line underneath. */
.lyr .line{position:relative!important;background:none!important;-webkit-background-clip:initial!important;background-clip:initial!important;color:var(--muted)!important;overflow:visible!important;transition:color .12s ease,transform .12s ease!important}
.lyr .line.active{color:var(--text)!important;transform:translateX(3px)!important;font-weight:750}
.lyr .line::after{content:""!important;position:absolute!important;left:0!important;right:auto!important;bottom:1px!important;width:var(--momo-line-progress,0%)!important;height:2px!important;border-radius:99px!important;background:linear-gradient(90deg,var(--a),var(--b))!important;opacity:0!important;transition:none!important;transform:none!important;animation:none!important}
.lyr .line.active::after{opacity:1!important}
.lyr .momo-lyric-text{background:none!important;color:inherit!important;-webkit-background-clip:initial!important;background-clip:initial!important}
/* Progress bars: paint directly from the audio clock every animation frame. */
.player input[type=range],.player-bar input[type=range],.progress input[type=range]{transition:none!important}
/* Custom song context menu. */
#momoContextMenu{position:fixed;z-index:2147483647;min-width:190px;padding:6px;border:1px solid var(--border);border-radius:14px;background:color-mix(in srgb,var(--surface) 97%,transparent);backdrop-filter:blur(20px);box-shadow:0 18px 55px rgba(50,30,45,.22);display:none}
#momoContextMenu.open{display:grid}
#momoContextMenu button{appearance:none;border:0;background:transparent;color:var(--text);text-align:left;padding:10px 12px;border-radius:9px;font-size:13px;cursor:pointer}
#momoContextMenu button:hover{background:var(--surface2);color:var(--a)}
#momoContextMenu .danger{color:#c95d72}
.momo-shuffle-btn{display:inline-flex!important;align-items:center;justify-content:center;gap:7px;border:1px solid var(--border);background:var(--surface);color:var(--text);border-radius:12px;padding:9px 12px;font-weight:700;font-size:12px;cursor:pointer;white-space:nowrap}
.momo-shuffle-btn:hover{background:var(--surface2);color:var(--a);transform:translateY(-1px)}
.momo-shuffle-btn svg{width:16px;height:16px;fill:none;stroke:currentColor;stroke-width:1.8;stroke-linecap:round;stroke-linejoin:round}
</style>
<script id="momo-clean-repair-js">
(() => {
  'use strict';
  const audio = document.getElementById('audio');
  const root = document.documentElement;

  const icon = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M3 7h4c4 0 6 10 10 10h4"/><path d="m18 14 3 3-3 3"/><path d="M3 17h4c1.6 0 2.8-1.5 4-3.2M18 4l3 3-3 3"/><path d="M7 7h4"/></svg>';

  function updateProgress(){
    if(!audio) return;
    const duration = Number(audio.duration);
    const pct = Number.isFinite(duration) && duration > 0 ? Math.max(0,Math.min(100,(audio.currentTime/duration)*100)) : 0;
    document.querySelectorAll('.player input[type="range"],.player-bar input[type="range"],.progress input[type="range"]').forEach(r=>{
      if(r.max && Number(r.max) > 1){
        r.style.setProperty('--momo-progress', pct + '%');
      } else {
        r.style.setProperty('--momo-progress', pct + '%');
      }
    });
  }
  if(audio){
    ['play','playing','timeupdate','seeking','seeked','loadedmetadata','durationchange'].forEach(e=>audio.addEventListener(e,updateProgress,{passive:true}));
    const tick=()=>{updateProgress();requestAnimationFrame(tick)};
    requestAnimationFrame(tick);
  }

  // Keep lyric progression honest: only a simple line under the current lyric.
  const lyr=document.getElementById('lyr');
  const lyricTime=(el)=>{
    const raw=el?.dataset?.time ?? el?.getAttribute?.('data-time') ?? el?.dataset?.start ?? el?.getAttribute?.('data-start');
    if(raw==null) return NaN;
    const n=Number(raw); if(Number.isFinite(n)) return n>1000?n/1000:n;
    const m=String(raw).match(/^(?:(\d+):)?(\d+)(?:\.(\d+))?$/);
    return m ? Number(m[1]||0)*60+Number(m[2])+Number('0.'+(m[3]||0)) : NaN;
  };
  function updateLyrics(){
    if(!lyr || !audio || !Number.isFinite(audio.currentTime)) return;
    const lines=[...lyr.querySelectorAll('.line')];
    let active=-1;
    const times=lines.map(lyricTime);
    times.forEach((t,i)=>{if(Number.isFinite(t)&&t<=audio.currentTime+0.01) active=i});
    lines.forEach((el,i)=>{
      const start=times[i], end=times[i+1];
      const p=i===active && Number.isFinite(start) ? Math.max(0,Math.min(1,(audio.currentTime-start)/Math.max(.01,(Number.isFinite(end)?end:(audio.duration||start+3))-start))) : 0;
      el.style.setProperty('--momo-line-progress',(p*100).toFixed(2)+'%');
      el.classList.toggle('active',i===active);
    });
  }
  if(audio){['timeupdate','seeking','seeked','durationchange'].forEach(e=>audio.addEventListener(e,updateLyrics,{passive:true}));requestAnimationFrame(function loop(){updateLyrics();requestAnimationFrame(loop)})}

  // Custom right-click menu for songs.
  let menu=document.getElementById('momoContextMenu');
  if(!menu){
    menu=document.createElement('div'); menu.id='momoContextMenu'; menu.setAttribute('role','menu');
    menu.innerHTML='<button data-action="play">Play</button><button data-action="queue">Add to queue</button><button data-action="favorite">Favorite</button><button data-action="playlist">Add to playlist</button><button data-action="shuffle">Shuffle from here</button>';
    document.body.appendChild(menu);
  }
  let contextSong=null;
  const closeMenu=()=>menu.classList.remove('open');
  document.addEventListener('click',e=>{if(!menu.contains(e.target))closeMenu()});
  window.addEventListener('blur',closeMenu);
  document.addEventListener('scroll',closeMenu,true);
  document.addEventListener('contextmenu',e=>{
    const song=e.target.closest('.song');
    if(!song)return;
    e.preventDefault(); e.stopPropagation(); contextSong=song;
    menu.classList.add('open');
    const x=Math.min(e.clientX,innerWidth-menu.offsetWidth-8), y=Math.min(e.clientY,innerHeight-menu.offsetHeight-8);
    menu.style.left=Math.max(8,x)+'px'; menu.style.top=Math.max(8,y)+'px';
  },true);
  menu.addEventListener('click',e=>{
    const btn=e.target.closest('button'); if(!btn||!contextSong)return;
    const action=btn.dataset.action;
    if(action==='play') contextSong.dispatchEvent(new MouseEvent('click',{bubbles:true}));
    if(action==='favorite'){
      const fav=contextSong.querySelector('.icon-btn');
      if(fav) fav.click();
    }
    if(action==='playlist'){
      const candidates=[...document.querySelectorAll('#addToPlaylistBtn,[data-action="add-to-playlist"],.add-playlist,.playlist-add')];
      if(candidates[0]) candidates[0].click();
    }
    if(action==='shuffle') shuffleVisible(contextSong);
    closeMenu();
  });

  function shuffleVisible(from=null){
    const songs=[...document.querySelectorAll('.songs .song')];
    if(!songs.length)return;
    const start=from && songs.includes(from)?songs.indexOf(from):Math.floor(Math.random()*songs.length);
    const chosen=songs[(start+Math.floor(Math.random()*songs.length))%songs.length] || songs[0];
    chosen.dispatchEvent(new MouseEvent('click',{bubbles:true}));
  }

  // One shuffle control for each library/playlist view. Avoid duplicating existing controls.
  function addShuffleButtons(){
    document.querySelectorAll('.momo-shuffle-btn').forEach(b=>b.remove());
    const pages=[...document.querySelectorAll('.page')];
    pages.forEach(page=>{
      const text=(page.innerText||'').toLowerCase();
      const isLibrary=/all music|favorites|favorite/.test(text) || page.querySelector('.songs');
      if(!isLibrary)return;
      const target=page.querySelector('.library-tools,.playlist-buttons,.head,.library-top');
      if(!target)return;
      const b=document.createElement('button'); b.className='momo-shuffle-btn'; b.type='button'; b.innerHTML=icon+'<span>Shuffle</span>';
      b.addEventListener('click',()=>{
        const songs=[...page.querySelectorAll('.songs .song')];
        if(!songs.length)return;
        songs[Math.floor(Math.random()*songs.length)].dispatchEvent(new MouseEvent('click',{bubbles:true}));
      });
      target.appendChild(b);
    });
  }
  const mo=new MutationObserver(()=>addShuffleButtons());
  mo.observe(document.body,{childList:true,subtree:true});
  addShuffleButtons();
})();
</script>
'''

s = s.replace('</body>', payload + '\n</body>', 1)
p.write_text(s, encoding='utf-8')
