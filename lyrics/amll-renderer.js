/* Original Apple-Music-inspired lyric renderer for Momoirobara. */
const STYLE_ID = 'momo-amll-renderer-style';

function ensureStyle() {
  if (document.getElementById(STYLE_ID)) return;
  const s = document.createElement('style');
  s.id = STYLE_ID;
  s.textContent = `
    #lyr.momo-amll { position:relative; overflow-y:auto; overflow-x:hidden; scroll-behavior:smooth; padding:18vh 7vw 32vh; box-sizing:border-box; }
    #lyr.momo-amll .momo-amll-line { position:relative; display:block; width:min(900px,100%); margin:0 auto; padding:10px 0; border:0; background:none; color:inherit; text-align:left; font-size:clamp(24px,3.1vw,46px); font-weight:700; line-height:1.2; letter-spacing:-.025em; opacity:.24; transform-origin:left center; transition:opacity .35s ease,transform .45s cubic-bezier(.2,.8,.2,1),filter .35s ease; cursor:pointer; }
    #lyr.momo-amll .momo-amll-line.near { opacity:.55; transform:scale(.96); }
    #lyr.momo-amll .momo-amll-line.active { opacity:1; transform:scale(1); filter:none; }
    #lyr.momo-amll .momo-amll-line.far { filter:blur(.5px); }
    #lyr.momo-amll .momo-amll-word { display:inline; color:inherit; opacity:.42; transition:color .06s linear,opacity .06s linear,text-shadow .06s linear; }
    #lyr.momo-amll .momo-amll-word.active { opacity:1; color:var(--a,#d56a9f); text-shadow:0 0 18px color-mix(in srgb,var(--a,#d56a9f) 24%,transparent); }
    #lyr.momo-amll .momo-amll-translation { display:block; margin-top:5px; font-size:.43em; line-height:1.35; font-weight:500; opacity:.55; letter-spacing:0; }
    #lyr.momo-amll .momo-amll-plain { width:min(900px,100%); margin:0 auto; white-space:pre-wrap; font-size:20px; line-height:1.8; opacity:.8; }
  `;
  document.head.appendChild(s);
}

function wordTiming(words) {
  return Array.isArray(words) && words.length > 0 && words.every(w => Number.isFinite(Number(w.start)) && Number.isFinite(Number(w.end)) && Number(w.end) >= Number(w.start));
}

export function createAmllRenderer(container, audio) {
  ensureStyle();
  const root = container;
  root.classList.add('momo-amll');
  let lyrics = null;
  let rows = [];
  let raf = 0;
  let lastActive = -1;

  function clear() {
    cancelAnimationFrame(raf);
    root.innerHTML = '';
    rows = [];
    lastActive = -1;
  }

  function renderLine(line, index) {
    const row = document.createElement('div');
    row.className = 'momo-amll-line far';
    row.dataset.index = String(index);
    row.dataset.start = String(Number(line.start) || 0);
    row.dataset.end = String(Number(line.end) || 0);
    row.addEventListener('click', () => {
      if (audio && Number.isFinite(Number(line.start))) audio.currentTime = Number(line.start);
    });

    if (wordTiming(line.words)) {
      line.words.forEach((word, i) => {
        const span = document.createElement('span');
        span.className = 'momo-amll-word';
        span.textContent = String(word.text || '') + (i === line.words.length - 1 ? '' : ' ');
        span.dataset.start = String(word.start);
        span.dataset.end = String(word.end);
        row.appendChild(span);
      });
    } else {
      row.textContent = line.text || '';
    }

    if (line.translation) {
      const tr = document.createElement('span');
      tr.className = 'momo-amll-translation';
      tr.textContent = line.translation;
      row.appendChild(tr);
    }
    root.appendChild(row);
    return row;
  }

  function update(t) {
    if (!lyrics || !rows.length) return;
    let active = -1;
    for (let i = 0; i < rows.length; i++) {
      const row = rows[i];
      const start = Number(row.dataset.start) || 0;
      const end = Number(row.dataset.end) || 0;
      if (t >= start && (!end || t < end)) { active = i; break; }
    }
    rows.forEach((row, i) => {
      row.classList.toggle('active', i === active);
      row.classList.toggle('near', Math.abs(i - active) === 1);
      row.classList.toggle('far', Math.abs(i - active) > 1);
      row.querySelectorAll('.momo-amll-word').forEach(word => {
        const s = Number(word.dataset.start);
        const e = Number(word.dataset.end);
        word.classList.toggle('active', t >= s && t < e);
      });
    });
    if (active !== lastActive && active >= 0) {
      lastActive = active;
      rows[active].scrollIntoView({ block:'center', behavior:'smooth' });
    }
  }

  function frame() {
    if (audio && !audio.paused) update(audio.currentTime || 0);
    raf = requestAnimationFrame(frame);
  }

  return {
    setLyrics(next) {
      lyrics = next;
      clear();
      const lines = Array.isArray(next?.lines) ? next.lines : [];
      if (!lines.length) {
        const plain = document.createElement('div');
        plain.className = 'momo-amll-plain';
        plain.textContent = next?.plainLyrics || 'No lyrics found.';
        root.appendChild(plain);
        return;
      }
      rows = lines.map(renderLine);
      update(audio?.currentTime || 0);
    },
    update,
    destroy() {
      cancelAnimationFrame(raf);
      root.classList.remove('momo-amll');
      clear();
    }
  };
}
