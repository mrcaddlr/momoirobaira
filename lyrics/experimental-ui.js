/* Momoirobara experimental lyrics UI bridge. */
(async () => {
  'use strict';
  if (window.__momoExperimentalLyrics) return;
  window.__momoExperimentalLyrics = true;

  const state = { audio:null, lyrics:null, trackKey:'', activeRow:null, manager:null, timer:0, abort:null, loading:false };
  const sleep = ms => new Promise(r => setTimeout(r, ms));

  function css(){
    if(document.getElementById('momo-experimental-lyrics-css')) return;
    const s=document.createElement('style'); s.id='momo-experimental-lyrics-css';
    s.textContent=`#momoExperimentalLyricsRefresh{position:fixed;right:18px;bottom:92px;z-index:99998;border:1px solid var(--border,#ddd);background:var(--solid,#fff);color:var(--text,#333);border-radius:12px;padding:8px 12px;font:600 12px system-ui;box-shadow:0 8px 30px rgba(0,0,0,.12);cursor:pointer;opacity:.78;transition:.18s}#momoExperimentalLyricsRefresh:hover{opacity:1;transform:translateY(-2px)}#lyr.momo-experimental-rendered .line{background:none!important;background-clip:initial!important;-webkit-background-clip:initial!important}#lyr .momo-word{display:inline-block;white-space:pre;opacity:.46;transition:opacity .08s linear,color .08s linear,transform .08s linear}#lyr .momo-word.active{opacity:1;color:var(--a,#c86a9c);text-shadow:0 0 14px color-mix(in srgb,var(--a,#c86a9c) 28%,transparent)}#lyr .momo-exp-line{cursor:pointer;scroll-margin-top:45vh;transition:transform .16s ease,opacity .16s ease}#lyr .momo-exp-line.active{transform:scale(1.018);opacity:1}#lyr .momo-exp-line:not(.active){opacity:.58}#momoExperimentalLyricsStatus{position:fixed;right:18px;bottom:138px;z-index:99997;font:500 11px system-ui;color:var(--muted,#777);pointer-events:none;opacity:0;transition:opacity .2s}#momoExperimentalLyricsStatus.show{opacity:.9}`;
    document.head.appendChild(s);
  }
  function toast(text){let e=document.getElementById('momoExperimentalLyricsStatus');if(!e){e=document.createElement('div');e.id='momoExperimentalLyricsStatus';document.body.appendChild(e)}e.textContent=text;e.classList.add('show');clearTimeout(e._t);e._t=setTimeout(()=>e.classList.remove('show'),1800)}
  function parseFilename(url){try{const n=decodeURIComponent(new URL(url,location.href).pathname.split('/').pop()||'').replace(/\.[^.]+$/,'').replace(/[_]+/g,' ').replace(/\s+/g,' ').trim(),p=n.split(/\s+[-–—]\s+/);return p.length>=2?{artist:p[0].trim(),title:p.slice(1).join(' - ').trim()}:{title:n}}catch{return{}}}
  function readTrack(){const a=state.audio||document.querySelector('audio');if(!a)return null;state.audio=a;const te=document.querySelector('[data-track-title],.now-playing .title,.player .title,.player-bar .title,[class*="now-playing"] [class*="title"]'),ae=document.querySelector('[data-track-artist],.now-playing .artist,.player .artist,.player-bar .artist'),f=parseFilename(a.currentSrc||a.src||'');const title=te?.textContent?.trim()||f.title||document.title,artist=ae?.textContent?.trim()||f.artist||'',duration=Number.isFinite(a.duration)?a.duration:0;return{metadata:{title,artist,album:'',duration},title,artist,duration}}
  async function im(p){try{return await import(p)}catch(e){console.warn('[momo lyrics]',p,e);return null}}
  async function getManager(){
    if(state.manager) return state.manager;
    const m=await im('./manager.js');if(!m?.createLyricsManager)return null;
    const specs=[['./providers/lyricsplus.js','lyricsPlusProvider'],['./providers/lrclib.js','lrclibProvider'],['./providers/lrcmux.js','lrcmuxProvider']],ps=[];
    for(const [p,n] of specs){const x=await im(p),v=x?.default||x?.[n];if(v?.getLyrics)ps.push(v)}
    state.manager=m.createLyricsManager({providers:ps,delayMs:350});
    return state.manager;
  }
  function render(l){const r=document.getElementById('lyr')||document.querySelector('.lyrics-drawer #lyr')||document.querySelector('.lyrics-drawer')||document.querySelector('.drawer');if(!r)return;const ls=Array.isArray(l?.lines)?l.lines:[];r.classList.add('momo-experimental-rendered');r.innerHTML='';if(!ls.length){r.textContent=l?.plainLyrics||'No synchronized lyrics found.';return}ls.forEach((x,i)=>{const row=document.createElement('div');row.className='line momo-exp-line';row.dataset.index=i;row.dataset.start=Number(x.start)||0;row.dataset.end=Number(x.end)||0;if(x.words?.length)x.words.forEach((w,j)=>{const z=document.createElement('span');z.className='momo-word';z.textContent=w.text+(j===x.words.length-1?'':' ');z.dataset.start=Number(w.start)||0;z.dataset.end=Number(w.end)||Number(w.start)||0;row.appendChild(z)});else row.textContent=x.text||'';row.onclick=()=>{if(state.audio)state.audio.currentTime=Number(row.dataset.start)||0};r.appendChild(row)})}
  function tick(){const a=state.audio,r=document.getElementById('lyr');if(!a||!state.lyrics||!r)return;const t=a.currentTime||0;let active=null;r.querySelectorAll('.momo-exp-line').forEach(row=>{const s=Number(row.dataset.start),e=Number(row.dataset.end),on=t>=s&&(!e||t<=e);row.classList.toggle('active',on);if(on)active=row;row.querySelectorAll('.momo-word').forEach(w=>{const s2=Number(w.dataset.start),e2=Number(w.dataset.end);w.classList.toggle('active',t>=s2&&(!e2||t<=e2))})});if(active&&active!==state.activeRow){state.activeRow=active;const q=active.getBoundingClientRect(),p=r.getBoundingClientRect();if(q.top<p.top||q.bottom>p.bottom)active.scrollIntoView({block:'center',behavior:'smooth'})}}
  async function load(force=false){
    const t=readTrack();if(!t)return;
    const key=`${t.artist}|${t.title}|${Math.round(t.duration||0)}`.toLowerCase();
    if(!force&&key===state.trackKey&&state.lyrics)return;
    if(state.abort) state.abort.abort();
    state.abort=new AbortController();
    const signal=state.abort.signal;
    state.trackKey=key;state.lyrics=null;state.activeRow=null;state.loading=true;toast('finding synchronized lyrics…');
    try{
      const m=await getManager();if(!m)throw new Error('lyrics engine unavailable');
      if(signal.aborted)return;
      const l=await m.resolve(t,{refresh:force,signal});
      if(signal.aborted||key!==state.trackKey)return;
      if(!l){toast('no synchronized lyrics found');return}
      state.lyrics=l;render(l);toast(`${l.format==='word'?'word-synced':l.format} lyrics · ${l.source||l.provider||'lyrics'}`);
    }catch(e){if(e?.name!=='AbortError'&&!signal.aborted)toast('lyrics lookup failed');}
    finally{if(!signal.aborted)state.loading=false}
  }
  function install(){
    css();
    if(!document.getElementById('momoExperimentalLyricsRefresh')){const b=document.createElement('button');b.id='momoExperimentalLyricsRefresh';b.textContent='refresh lyrics';b.onclick=()=>load(true);document.body.appendChild(b)}
    const a=document.querySelector('audio');
    if(a!==state.audio){if(state.audio&&state.abort)state.abort.abort();state.audio=a;state.trackKey='';state.lyrics=null;if(a){['timeupdate','seeked','play'].forEach(e=>a.addEventListener(e,tick,{passive:true}));['loadedmetadata','durationchange'].forEach(e=>a.addEventListener(e,()=>load(false),{passive:true}));a.addEventListener('emptied',()=>{if(state.abort)state.abort.abort();state.trackKey='';state.lyrics=null},{passive:true})}}
    if(state.audio&&!state.trackKey&&!state.loading)load(false);
  }
  await sleep(400);install();clearInterval(state.timer);state.timer=setInterval(()=>{install();tick()},2000);
})();
