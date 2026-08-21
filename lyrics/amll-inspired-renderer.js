/* Momoirobara AMLL-inspired renderer. Original implementation; no AMLL source copied. */
export function createAMLLInspiredRenderer({ root = document } = {}) {
  let rows = [];
  let current = -1;
  let raf = 0;
  let audio = null;
  let lyrics = null;

  function injectStyles() {
    if (document.getElementById('momo-amll-inspired-css')) return;
    const style = document.createElement('style');
    style.id = 'momo-amll-inspired-css';
    style.textContent = `
      #lyr.momo-amll { overflow-y:auto; overscroll-behavior:contain; scroll-behavior:smooth; padding:18vh 7vw 28vh; }
      #lyr.momo-amll .momo-amll-line { position:relative; margin:0 auto; max-width:1100px; padding:7px 0; font-size:clamp(24px,3.2vw,48px); line-height:1.2; font-weight:720; letter-spacing:-.025em; text-align:left; color:var(--text,#222); opacity:.32; transform:scale(.94); transform-origin:left center; transition:opacity .32s ease, transform .38s cubic-bezier(.2,.8,.2,1), filter .32s ease; }
      #lyr.momo-amll .momo-amll-line.active { opacity:1; transform:scale(1); filter:none; }
      #lyr.momo-amll .momo-amll-line.near { opacity:.62; transform:scale(.97); }
      #lyr.momo-amll .momo-amll-line.far { opacity:.2; filter:blur(.35px); }
      #lyr.momo-amll .momo-amll-word { position:relative; display:inline; transition:color .08s linear, opacity .08s linear; opacity:.7; }
      #lyr.momo-amll .momo-amll-word.active { color:var(--a,#c86a9c); opacity:1; }
      #lyr.momo-amll .momo-amll-line.has-words .momo-amll-word { background-image:linear-gradient(90deg,var(--a,#c86a9c) var(--momo-progress,0%),currentColor var(--momo-progress,0%)); background-clip:text; -webkit-background-clip:text; color:transparent; }
      #lyr.momo-amll .momo-amll-line.has-words .momo-amll-word:not(.active) { background-image:none; color:var(--text,#222); opacity:.55; }
      #lyr.momo-amll .momo-amll-translation { display:block; margin-top:4px; font-size:.52em; font-weight:520; letter-spacing:0; opacity:.55; }
      #lyr.momo-amll .momo-amll-bg { font-size:.72em; opacity:.55; }
    `;
    document.head.appendChild(style);
  }

  function target() { return root.getElementById?.('lyr') || root.querySelector?.('#lyr') || root.querySelector?.('.lyrics-drawer #lyr'); }
  function time(v) { const n=Number(v); return Number.isFinite(n)?n:0; }
  function render(data) {
    const el=target(); if(!el) return;
    injectStyles(); el.classList.add('momo-amll'); el.innerHTML=''; rows=[]; current=-1; lyrics=data;
    (data?.lines||[]).forEach((line,i)=>{
      const row=document.createElement('div'); row.className='momo-amll-line'; row.dataset.index=i; row.dataset.start=time(line.start); row.dataset.end=time(line.end);
      if(Array.isArray(line.words)&&line.words.length){
        row.classList.add('has-words');
        line.words.forEach(word=>{ const span=document.createElement('span'); span.className='momo-amll-word'; span.textContent=word.text+' '; span.dataset.start=time(word.start); span.dataset.end=time(word.end); row.appendChild(span); });
      } else row.textContent=line.text||'';
      if(line.translation){ const tr=document.createElement('span'); tr.className='momo-amll-translation'; tr.textContent=line.translation; row.appendChild(tr); }
      row.addEventListener('click',()=>{ if(audio) audio.currentTime=time(line.start); });
      el.appendChild(row); rows.push(row);
    });
    if(!rows.length && data?.plainLyrics){ const p=document.createElement('div'); p.className='momo-amll-line active'; p.textContent=data.plainLyrics; el.appendChild(p); }
    update(true);
  }
  function update(force=false){
    if(!audio||!lyrics||!rows.length) return;
    const t=audio.currentTime||0; let idx=-1;
    rows.forEach((row,i)=>{
      const s=time(row.dataset.start), e=time(row.dataset.end); const active=t>=s && (!e||t<e); if(active) idx=i;
      row.classList.toggle('active',active); row.classList.toggle('near',Math.abs(i-(idx<0?current:idx))<=1 && !active); row.classList.toggle('far',Math.abs(i-(idx<0?current:idx))>3);
      row.querySelectorAll('.momo-amll-word').forEach(word=>{ const ws=time(word.dataset.start), we=time(word.dataset.end); const on=t>=ws && (!we||t<we); word.classList.toggle('active',on); if(on&&we>ws){ word.style.setProperty('--momo-progress',Math.max(0,Math.min(100,(t-ws)/(we-ws)*100))+'%'); } else word.style.removeProperty('--momo-progress'); });
    });
    if(idx!==-1 && (force||idx!==current)){ current=idx; rows[idx].scrollIntoView({behavior:'smooth',block:'center'}); }
  }
  function attach(nextAudio){
    if(audio===nextAudio) return; audio=nextAudio||null;
    if(!audio) return;
    ['timeupdate','seeking','seeked','play'].forEach(e=>audio.addEventListener(e,()=>update(),{passive:true}));
  }
  function destroy(){ cancelAnimationFrame(raf); rows=[]; lyrics=null; audio=null; }
  return { render, attach, update, destroy };
}
