from pathlib import Path
import re

p = Path('index.html')
s = p.read_text(encoding='utf-8')
s = re.sub(r'\n?<!-- MOMOIROBARA LYRICS PROGRESS REPAIR -->.*?</script>\s*', '\n', s, flags=re.S)
s = re.sub(r'\n?<!-- MOMOIROBARA CLEAN PLAYBACK/UI REPAIR -->.*?</script>\s*', '\n', s, flags=re.S)

payload = r'''<!-- MOMOIROBARA STABLE UI REPAIR -->
<style id="momo-stable-ui-repair">
#momoAnimatedBg{position:fixed;inset:0;z-index:0;overflow:hidden;pointer-events:none;background:radial-gradient(circle at 20% 20%,color-mix(in srgb,var(--a) 12%,transparent),transparent 34%),radial-gradient(circle at 80% 75%,color-mix(in srgb,var(--b) 14%,transparent),transparent 38%)}
#momoAnimatedBg .momo-orb{position:absolute;width:38vw;height:38vw;max-width:560px;max-height:560px;border-radius:50%;filter:blur(55px);opacity:.26;mix-blend-mode:multiply;animation:momoOrbFloat 18s ease-in-out infinite alternate}
#momoAnimatedBg .one{left:-10vw;top:-12vw;background:color-mix(in srgb,var(--a) 55%,transparent)}
#momoAnimatedBg .two{right:-12vw;bottom:-14vw;background:color-mix(in srgb,var(--b) 55%,transparent);animation-delay:-6s;animation-duration:22s}
#momoAnimatedBg .three{left:42%;top:42%;width:24vw;height:24vw;background:color-mix(in srgb,var(--a) 32%,var(--b));animation-delay:-11s;animation-duration:26s}
#momoAnimatedBg::after{content:"";position:absolute;inset:0;opacity:.18;background-image:radial-gradient(color-mix(in srgb,var(--a) 18%,transparent) .7px,transparent .7px);background-size:20px 20px;mask-image:linear-gradient(to bottom,transparent,black 35%,transparent)}
@keyframes momoOrbFloat{0%{transform:translate3d(0,0,0) scale(1)}50%{transform:translate3d(7vw,3vh,0) scale(1.08)}100%{transform:translate3d(-4vw,7vh,0) scale(.96)}}
@media(prefers-reduced-motion:reduce){#momoAnimatedBg .momo-orb{animation:none}}
.lyr .line{background:none!important;-webkit-background-clip:initial!important;background-clip:initial!important;color:var(--muted)!important;position:relative!important;overflow:visible!important}
.lyr .line.active{color:var(--text)!important;font-weight:750!important;transform:translateX(3px)!important}
.lyr .line::after{content:""!important;position:absolute!important;left:0!important;bottom:0!important;width:var(--momo-line-progress,0%)!important;height:2px!important;border-radius:99px!important;background:linear-gradient(90deg,var(--a),var(--b))!important;opacity:0!important;transition:none!important;animation:none!important}
.lyr .line.active::after{opacity:1!important}
.lyr .momo-lyric-text{background:none!important;color:inherit!important}
.player input[type=range],.player-bar input[type=range],.progress input[type=range]{transition:none!important}
.song .icon-btn{position:relative!important;z-index:50!important;pointer-events:auto!important;cursor:pointer!important}
#momoContextMenu{position:fixed;z-index:2147483647;display:none;min-width:205px;padding:6px;border:1px solid var(--border);border-radius:15px;background:color-mix(in srgb,var(--surface) 96%,transparent);backdrop-filter:blur(20px);box-shadow:0 20px 60px rgba(50,30,45,.24)}
#momoContextMenu.open{display:grid}
#momoContextMenu button{border:0;background:transparent;color:var(--text);padding:10px 12px;border-radius:9px;text-align:left;font-size:13px;cursor:pointer}
#momoContextMenu button:hover{background:var(--surface2);color:var(--a)}
.momo-shuffle-btn{display:inline-flex!important;align-items:center;justify-content:center;gap:7px;border:1px solid var(--border)!important;background:var(--surface)!important;color:var(--text)!important;border-radius:12px!important;padding:9px 12px!important;font-weight:700!important;font-size:12px!important;cursor:pointer!important;white-space:nowrap}
.momo-shuffle-btn:hover{background:var(--surface2)!important;color:var(--a)!important;transform:translateY(-1px)}
.momo-shuffle-btn svg{width:16px;height:16px;fill:none;stroke:currentColor;stroke-width:1.8;stroke-linecap:round;stroke-linejoin:round}
</style>
<script id="momo-stable-ui-repair-js">
(function(){
  'use strict';
  var audio=document.getElementById('audio');
  var lyr=document.getElementById('lyr');
  if(!document.getElementById('momoAnimatedBg')){
    var bg=document.createElement('div');bg.id='momoAnimatedBg';
    bg.innerHTML='<i class="momo-orb one"></i><i class="momo-orb two"></i><i class="momo-orb three"></i>';
    document.body.insertBefore(bg,document.body.firstChild);
  }
  function paintProgress(){
    if(!audio)return;
    var d=Number(audio.duration),p=(isFinite(d)&&d>0)?Math.max(0,Math.min(1,audio.currentTime/d)):0,pct=(p*100).toFixed(3)+'%';
    document.querySelectorAll('.player input[type="range"],.player-bar input[type="range"],.progress input[type="range"]').forEach(function(r){r.style.setProperty('--momo-progress',pct);});
  }
  if(audio){['loadedmetadata','durationchange','timeupdate','seeking','seeked'].forEach(function(n){audio.addEventListener(n,paintProgress,{passive:true});});(function frame(){paintProgress();window.requestAnimationFrame(frame);})();}
  function lyricTime(el){
    var raw=el.getAttribute('data-time')||el.getAttribute('data-start');
    if(raw===null)return NaN;
    var n=Number(raw);if(isFinite(n))return n>1000?n/1000:n;
    var m=String(raw).match(/^(?:(\d+):)?(\d+)(?:\.(\d+))?$/);
    return m?Number(m[1]||0)*60+Number(m[2])+Number('0.'+(m[3]||'0')):NaN;
  }
  function paintLyrics(){
    if(!lyr||!audio||!isFinite(audio.currentTime))return;
    var lines=Array.prototype.slice.call(lyr.querySelectorAll('.line')),times=lines.map(lyricTime),active=-1;
    times.forEach(function(t,i){if(isFinite(t)&&t<=audio.currentTime+0.01)active=i;});
    lines.forEach(function(el,index){
      var start=times[index],next=times[index+1],end=isFinite(next)?next:(isFinite(audio.duration)?audio.duration:start+3);
      var progress=(index===active&&isFinite(start))?Math.max(0,Math.min(1,(audio.currentTime-start)/Math.max(.01,end-start))):0;
      el.style.setProperty('--momo-line-progress',(progress*100).toFixed(2)+'%');el.classList.toggle('active',index===active);
    });
  }
  if(audio){['timeupdate','seeking','seeked','durationchange'].forEach(function(n){audio.addEventListener(n,paintLyrics,{passive:true});});(function frame(){paintLyrics();window.requestAnimationFrame(frame);})();}
  document.addEventListener('pointerdown',function(e){var b=e.target.closest&&e.target.closest('.song .icon-btn');if(b)e.stopPropagation();},true);
  var menu=document.getElementById('momoContextMenu');
  if(!menu){menu=document.createElement('div');menu.id='momoContextMenu';menu.setAttribute('role','menu');menu.innerHTML='<button data-momo-action="play">Play</button><button data-momo-action="favorite">Favorite</button><button data-momo-action="playlist">Add to playlist</button><button data-momo-action="shuffle">Shuffle</button>';document.body.appendChild(menu);}
  var targetSong=null;
  function closeMenu(){menu.classList.remove('open');targetSong=null;}
  document.addEventListener('contextmenu',function(e){var song=e.target.closest&&e.target.closest('.song');if(!song)return;e.preventDefault();e.stopPropagation();targetSong=song;menu.classList.add('open');var x=Math.min(e.clientX,window.innerWidth-menu.offsetWidth-8),y=Math.min(e.clientY,window.innerHeight-menu.offsetHeight-8);menu.style.left=Math.max(8,x)+'px';menu.style.top=Math.max(8,y)+'px';},true);
  document.addEventListener('click',function(e){if(!menu.contains(e.target))closeMenu();});window.addEventListener('blur',closeMenu);
  menu.addEventListener('click',function(e){var b=e.target.closest&&e.target.closest('button');if(!b||!targetSong)return;var action=b.getAttribute('data-momo-action');if(action==='play')targetSong.click();if(action==='favorite'){var fav=targetSong.querySelector('.icon-btn');if(fav)fav.click();}if(action==='playlist'){var add=document.querySelector('#addToPlaylistBtn,[data-action="add-to-playlist"],.add-playlist,.playlist-add');if(add)add.click();}if(action==='shuffle')shufflePage(targetSong.closest('.page')||document);closeMenu();});
  function shufflePage(scope){var songs=Array.prototype.slice.call(scope.querySelectorAll('.songs .song'));if(!songs.length)return;songs[Math.floor(Math.random()*songs.length)].click();}
  function addShuffle(){
    document.querySelectorAll('.momo-shuffle-btn').forEach(function(b){b.remove();});
    document.querySelectorAll('.page.active').forEach(function(page){if(!page.querySelector('.songs'))return;var host=page.querySelector('.library-tools,.playlist-buttons,.library-top,.head');if(!host)return;var b=document.createElement('button');b.type='button';b.className='momo-shuffle-btn';b.innerHTML='<svg viewBox="0 0 24 24"><path d="M3 7h4c4 0 6 10 10 10h4"/><path d="m18 14 3 3-3 3"/><path d="M3 17h4c1.5 0 2.8-1.4 4-3.1M18 4l3 3-3 3"/></svg><span>Shuffle</span>';b.addEventListener('click',function(){shufflePage(page);});host.appendChild(b);});
  }
  addShuffle();var observer=new MutationObserver(function(){window.setTimeout(addShuffle,0);});observer.observe(document.body,{childList:true,subtree:true});
})();
</script>
'''

s = s.replace('</body>', payload + '</body>', 1)
p.write_text(s, encoding='utf-8')
