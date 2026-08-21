/* Momoirobara experimental lyrics UI bridge.
 * Loaded by the experimental Pages workflow so the visible app uses the
 * normalized LyricsPlus -> LRCLIB -> LRC Mux pipeline without replacing the
 * existing player UI.
 */
(async () => {
  'use strict';
  if (window.__momoExperimentalLyrics) return;
  window.__momoExperimentalLyrics = true;

  const sleep = ms => new Promise(r => setTimeout(r, ms));
  const state = { audio: null, lyrics: null, trackKey: '', button: null, timer: 0 };

  function css() {
    if (document.getElementById('momo-experimental-lyrics-css')) return;
    const s = document.createElement('style');
    s.id = 'momo-experimental-lyrics-css';
    s.textContent = `
      #momoExperimentalLyricsRefresh{position:fixed;right:18px;bottom:92px;z-index:99998;border:1px solid var(--border,#ddd);background:var(--solid,#fff);color:var(--text,#333);border-radius:12px;padding:8px 12px;font:600 12px system-ui;box-shadow:0 8px 30px rgba(0,0,0,.12);cursor:pointer;opacity:.78;transition:.18s}
      #momoExperimentalLyricsRefresh:hover{opacity:1;transform:translateY(-2px)}
      #lyr.momo-experimental-rendered .line{background:none!important;background-clip:initial!important;-webkit-background-clip:initial!important}
      #lyr .momo-word{display:inline-block;white-space:pre;opacity:.46;transition:opacity .08s linear,color .08s linear,transform .08s linear}
      #lyr .momo-word.active{opacity:1;color:var(--a,#c86a9c);text-shadow:0 0 14px color-mix(in srgb,var(--a,#c86a9c) 28%,transparent)}
      #lyr .momo-exp-line{cursor:pointer;scroll-margin-top:45vh;transition:transform .16s ease,opacity .16s ease}
      #lyr .momo-exp-line.active{transform:scale(1.018);opacity:1}
      #lyr .momo-exp-line:not(.active){opacity:.58}
      #momoExperimentalLyricsStatus{position:fixed;right:18px;bottom:138px;z-index:99997;font:500 11px system-ui;color:var(--muted,#777);pointer-events:none;opacity:0;transition:opacity .2s}
      #momoExperimentalLyricsStatus.show{opacity:.9}
    `;
    document.head.appendChild(s);
  }

  function toast(text) {
    let el = document.getElementById('momoExperimentalLyricsStatus');
    if (!el) { el = document.createElement('div'); el.id = 'momoExperimentalLyricsStatus'; document.body.appendChild(el); }
    el.textContent = text; el.classList.add('show');
    clearTimeout(el._t); el._t = setTimeout(() => el.classList.remove('show'), 1800);
  }

  function parseFilename(url) {
    try {
      const name = decodeURIComponent(new URL(url, location.href).pathname.split('/').pop() || '').replace(/\.[^.]+$/, '');
      const cleaned = name.replace(/[_]+/g, ' ').replace(/\s+/g, ' ').trim();
      const parts = cleaned.split(/\s+[-–—]\s+/);
      if (parts.length >= 2) return { artist: parts[0].trim(), title: parts.slice(1).join(' - ').trim() };
      return { title: cleaned };
    } catch { return {}; }
  }

  function readTrack() {
    const audio = state.audio || document.querySelector('audio');
    if (!audio) return null;
    state.audio = audio;
    const candidates = [
      document.querySelector('[data-track-title]'), document.querySelector('.now-playing .title'),
      document.querySelector('.player .title'), document.querySelector('.player-bar .title'),
      document.querySelector('[class*="now-playing"] [class*="title"]')
    ].filter(Boolean);
    const artistEls = [document.querySelector('[data-track-artist]'),document.querySelector('.now-playing .artist'),document.querySelector('.player .artist'),document.querySelector('.player-bar .artist')].filter(Boolean);
    const fallback = parseFilename(audio.currentSrc || audio.src || '');
    const title = candidates[0]?.textContent?.trim() || fallback.title || document.title;
    const artist = artistEls[0]?.textContent?.trim() || fallback.artist || '';
    const duration = Number.isFinite(audio.duration) ? audio.duration : 0;
    const meta = { title, artist, album: '', duration };
    return { metadata: meta, title, artist, duration };
  }

  async function importModule(path) {
    try { return await import(path); } catch { return null; }
  }

  async function makeManager() {
    const mod = await importModule('./lyrics/manager.js');
    if (!mod?.createLyricsManager) return null;
    const providerPaths = [
      ['./lyrics/providers/lyricsplus.js', 'lyricsplus'],
      ['./lyrics/providers/lrclib.js', 'lrclib'],
      ['./lyrics/providers/lrcmux.js', 'lrcmux']
    ];
    const providers = [];
    for (const [path, id] of providerPaths) {
      const p = await importModule(path);
      if (!p) continue;
      const provider = p.default || p.provider || p[id] || p[`${id}Provider`];
      if (provider?.getLyrics) providers.push(provider);
    }
    return mod.createLyricsManager({ providers, delayMs: 350 });
  }

  function render(lyrics) {
    const root = document.getElementById('lyr') || document.querySelector('.lyrics-drawer #lyr') || document.querySelector('.lyrics-drawer') || document.querySelector('.drawer');
    if (!root || !lyrics) return;
    const lines = Array.isArray(lyrics.lines) ? lyrics.lines : [];
    if (!lines.length) {
      root.textContent = lyrics.plainLyrics || 'No synchronized lyrics found.';
      return;
    }
    root.classList.add('momo-experimental-rendered');
    root.innerHTML = '';
    lines.forEach((line, index) => {
      const row = document.createElement('div');
      row.className = 'line momo-exp-line';
      row.dataset.index = String(index);
      row.dataset.start = String(Number(line.start) || 0);
      row.dataset.end = String(Number(line.end) || 0);
      if (line.words?.length) {
        line.words.forEach((word, wi) => {
          const span = document.createElement('span');
          span.className = 'momo-word';
          span.textContent = word.text + (wi === line.words.length - 1 ? '' : ' ');
          span.dataset.start = String(Number(word.start) || 0);
          span.dataset.end = String(Number(word.end) || Number(word.start) || 0);
          row.appendChild(span);
        });
      } else row.textContent = line.text || '';
      row.addEventListener('click', () => {
        if (state.audio && Number.isFinite(Number(row.dataset.start))) state.audio.currentTime = Number(row.dataset.start);
      });
      root.appendChild(row);
    });
  }

  function tick() {
    const audio = state.audio;
    if (!audio || !state.lyrics) return;
    const t = audio.currentTime || 0;
    const root = document.getElementById('lyr');
    if (!root) return;
    const rows = [...root.querySelectorAll('.momo-exp-line')];
    let activeRow = null;
    rows.forEach(row => {
      const start = Number(row.dataset.start), end = Number(row.dataset.end);
      const active = t >= start && (!end || t <= end);
      row.classList.toggle('active', active);
      if (active) activeRow = row;
      row.querySelectorAll('.momo-word').forEach(word => {
        const ws = Number(word.dataset.start), we = Number(word.dataset.end);
        word.classList.toggle('active', t >= ws && (!we || t <= we));
      });
    });
    if (activeRow && activeRow !== state._activeRow) {
      state._activeRow = activeRow;
      const rect = activeRow.getBoundingClientRect();
      const parent = root.getBoundingClientRect();
      if (rect.top < parent.top || rect.bottom > parent.bottom) activeRow.scrollIntoView({ block: 'center', behavior: 'smooth' });
    }
  }

  async function load(force = false) {
    const track = readTrack();
    if (!track) return;
    const key = `${track.artist}|${track.title}|${Math.round(track.duration || 0)}`.toLowerCase();
    if (!force && key === state.trackKey && state.lyrics) return;
    state.trackKey = key; state.lyrics = null; state._activeRow = null;
    toast('finding synchronized lyrics…');
    const manager = await makeManager();
    if (!manager) { toast('lyrics engine unavailable'); return; }
    const result = await manager.resolve(track, { refresh: force });
    if (key !== state.trackKey) return;
    if (!result) { toast('no synchronized lyrics found'); return; }
    state.lyrics = result; render(result); toast(`${result.format === 'word' ? 'word-synced' : result.format} lyrics · ${result.source}`);
  }

  function install() {
    css();
    if (!document.getElementById('momoExperimentalLyricsRefresh')) {
      const b = document.createElement('button'); b.id = 'momoExperimentalLyricsRefresh'; b.textContent = 'refresh lyrics';
      b.addEventListener('click', () => load(true)); document.body.appendChild(b); state.button = b;
    }
    const audio = document.querySelector('audio');
    if (audio && audio !== state.audio) {
      state.audio = audio;
      audio.addEventListener('timeupdate', tick, { passive: true });
      audio.addEventListener('seeked', tick, { passive: true });
      audio.addEventListener('loadedmetadata', () => load(false), { passive: true });
      audio.addEventListener('play', tick, { passive: true });
      audio.addEventListener('durationchange', () => load(false), { passive: true });
    }
    if (!state.audio) return;
    if (!state.trackKey) load(false);
    clearInterval(state.timer); state.timer = setInterval(() => { install(); tick(); }, 700);
  }

  await sleep(250);
  install();
})();
