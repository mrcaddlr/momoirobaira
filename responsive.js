(()=>{
  'use strict';

  // Desktop-only build. The old Android/responsive layer created duplicate
  // hamburger/X controls and competed with the app's own navigation.
  function desktopOnly(){
    document.getElementById('momoPortraitBlock')?.remove();
    document.getElementById('momoResponsiveMenuBtn')?.remove();
    document.getElementById('momoResponsiveMenuClose')?.remove();
    document.getElementById('momoFixedMenuClose')?.remove();
    const mobile=document.getElementById('mobile');
    if(mobile){ mobile.style.setProperty('display','none','important'); mobile.setAttribute('aria-hidden','true'); }
    const side=document.getElementById('side');
    if(side){ side.classList.remove('open'); side.style.removeProperty('transform'); }
    document.body.classList.remove('momo-responsive-menu','momo-menu-open','momo-fixed-menu-open');
  }

  const DB='MomoirobaraMediaDB', STORE='songs';
  const wait=ms=>new Promise(r=>setTimeout(r,ms));
  function openStore(){return new Promise((resolve,reject)=>{
    let req; try{req=indexedDB.open(DB,2)}catch(e){reject(e);return}
    req.onupgradeneeded=e=>{const d=e.target.result;if(!d.objectStoreNames.contains(STORE))d.createObjectStore(STORE,{keyPath:'id'})};
    req.onsuccess=()=>resolve(req.result); req.onerror=()=>reject(req.error||new Error('IndexedDB unavailable'));
  })}
  function readAll(db){return new Promise((resolve,reject)=>{const r=db.transaction(STORE,'readonly').objectStore(STORE).getAll();r.onsuccess=()=>resolve(r.result||[]);r.onerror=()=>reject(r.error)})}
  function write(db,row){return new Promise((resolve,reject)=>{const r=db.transaction(STORE,'readwrite').objectStore(STORE).put(row);r.onsuccess=()=>resolve();r.onerror=()=>reject(r.error)})}

  async function restoreLibrary(){
    for(let i=0;i<100;i++){ if(Array.isArray(window.momoSongs)) break; await wait(100); }
    if(!Array.isArray(window.momoSongs)) return;
    let db; try{db=await openStore()}catch(e){console.warn('Momoirobara persistence unavailable:',e);return}
    try{
      const rows=await readAll(db), target=window.momoSongs, existing=new Set(target.map(s=>s.id));
      for(const row of rows){
        if(!row?.audioData || existing.has(row.id)) continue;
        try{
          const blob=new Blob([row.audioData],{type:row.mimeType||'application/octet-stream'});
          const file=new File([blob],row.name||'track',{type:row.mimeType||blob.type||'application/octet-stream',lastModified:Number(row.lastModified)||Date.now()});
          target.push({id:row.id,file,url:URL.createObjectURL(file),title:row.title||row.name||'Track',artist:row.artist||'Unknown Artist',album:row.album||'Unknown Album',albumArtist:row.albumArtist||'',genre:row.genre||'',year:row.year??null,trackNumber:row.trackNumber??null,duration:Number(row.duration)||0,favorite:!!row.favorite,added:Number(row.added)||Date.now(),name:row.name||file.name,size:Number(row.size)||file.size,lastModified:Number(row.lastModified)||file.lastModified,mimeType:row.mimeType||file.type||'application/octet-stream',artwork:null});
          existing.add(row.id);
        }catch(e){console.warn('Song restore failed:',row.name,e)}
      }
      window.momoRenderAll?.();
    }finally{db.close()}
  }

  async function saveLibrary(){
    if(!Array.isArray(window.momoSongs)) return;
    let db; try{db=await openStore()}catch{return}
    try{
      for(const s of window.momoSongs){
        if(!(s?.file instanceof Blob)) continue;
        const audioData=await s.file.arrayBuffer();
        await write(db,{id:s.id,audioData,title:s.title,artist:s.artist,album:s.album,albumArtist:s.albumArtist||'',genre:s.genre||'',year:s.year??null,trackNumber:s.trackNumber??null,duration:Number(s.duration)||0,favorite:!!s.favorite,added:Number(s.added)||Date.now(),name:s.name||s.file.name,size:Number(s.size)||s.file.size,lastModified:Number(s.lastModified)||s.file.lastModified,mimeType:s.mimeType||s.file.type||'application/octet-stream'});
      }
    }catch(e){console.warn('Momoirobara persistence write failed:',e)}finally{db.close()}
  }

  const PREF_KEYS={
    theme:['theme','momoirobara_theme'],
    volume:['vol','momoirobara_volume'],
    animations:['animations','momoirobara_animations'],
    fx:['fx','momoirobara_fx'],
    density:['density','momoirobara_density']
  };
  function readPref(name){
    for(const key of PREF_KEYS[name]||[]){const v=localStorage.getItem(key);if(v!==null&&v!=='')return v}
    return null;
  }
  function writePref(name,value){
    if(value===null||value===undefined||value==='')return;
    for(const key of PREF_KEYS[name]||[])localStorage.setItem(key,String(value));
  }
  function restorePrefs(){
    try{
      const state=JSON.parse(localStorage.getItem('momoirobara_desktop_memory')||'null');
      if(state){
        for(const name of Object.keys(PREF_KEYS)) if(readPref(name)==null&&state[name]!=null) writePref(name,state[name]);
      }
      const theme=readPref('theme');
      if(theme){
        document.documentElement.dataset.theme=theme;
        const el=document.getElementById('theme'); if(el)el.value=theme;
        if(typeof window.momoApplyTheme==='function')window.momoApplyTheme(theme);
      }
      const volume=readPref('volume');
      if(volume!=null){const el=document.getElementById('vol');if(el){el.value=volume;if(window.audio)window.audio.volume=Math.max(0,Math.min(1,Number(volume)));}}
      for(const name of ['animations','fx','density']){const value=readPref(name);const id=name==='fx'?'fxToggle':name;const el=document.getElementById(id);if(!el||value==null)continue;if(el.type==='checkbox')el.checked=value!=='off';else el.value=value;}
    }catch(e){console.warn('Momoirobara settings restore:',e)}
  }
  function capturePrefs(){
    try{
      const theme=document.getElementById('theme')?.value||document.documentElement.dataset.theme||readPref('theme');
      const volume=document.getElementById('vol')?.value??readPref('volume');
      const animations=document.getElementById('animations')?.value??readPref('animations');
      const fx=document.getElementById('fxToggle');
      const density=document.getElementById('density')?.value??readPref('density');
      writePref('theme',theme);writePref('volume',volume);writePref('animations',animations);writePref('fx',fx?(fx.checked?'on':'off'):readPref('fx'));writePref('density',density);
      localStorage.setItem('momoirobara_desktop_memory',JSON.stringify({page:document.querySelector('.page.active')?.id?.replace(/^page-/,'')||'home',playlists:JSON.parse(localStorage.getItem('momoirobara_playlists')||'[]'),theme:readPref('theme'),volume:readPref('volume'),animations:readPref('animations'),fx:readPref('fx'),density:readPref('density'),updated:Date.now()}));
    }catch(e){console.warn('Momoirobara settings save:',e)}
  }

  function start(){
    desktopOnly();
    restorePrefs();
    restoreLibrary();
    document.addEventListener('input',e=>{if(e.target?.matches('#theme,#vol,#animations,#fxToggle,#density'))capturePrefs()},true);
    document.addEventListener('change',e=>{if(e.target?.matches('#theme,#vol,#animations,#fxToggle,#density'))setTimeout(capturePrefs,0)},true);
    document.addEventListener('visibilitychange',()=>{if(document.visibilityState==='hidden'){saveLibrary();capturePrefs()}});
    window.addEventListener('pagehide',()=>{saveLibrary();capturePrefs()});
    document.addEventListener('momo:statechange',()=>{capturePrefs();saveLibrary()});
    setInterval(()=>{saveLibrary();capturePrefs()},5000);
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',start,{once:true});else start();
})();
