from pathlib import Path

p = Path('index.html')
s = p.read_text(encoding='utf-8')
marker = '<!-- MOMOIROBARA LYRICS PROGRESS REPAIR -->'
if marker in s:
    print('lyrics repair already present')
    raise SystemExit(0)

payload = '''<!-- MOMOIROBARA LYRICS PROGRESS REPAIR -->
<style id="momo-lyrics-progress-repair">
.lyr .line {
  --momo-progress: 0;
  --momo-progress-pct: 0%;
  position: relative;
  overflow: visible !important;
  transition: color .12s ease, transform .12s ease, opacity .12s ease !important;
  background: none !important;
  -webkit-background-clip: initial !important;
  background-clip: initial !important;
}
.lyr .line::after {
  content: "" !important;
  position: absolute !important;
  inset: 0 !important;
  pointer-events: none !important;
  opacity: 0 !important;
  background:
    radial-gradient(circle at 20% 40%, color-mix(in srgb,var(--a) 85%,transparent) 0 1px, transparent 1.7px),
    radial-gradient(circle at 48% 65%, color-mix(in srgb,var(--a) 65%,transparent) 0 1px, transparent 1.8px),
    radial-gradient(circle at 76% 30%, color-mix(in srgb,var(--a) 55%,transparent) 0 1px, transparent 1.6px);
  background-size: 23px 19px, 31px 27px, 37px 23px;
  mix-blend-mode: screen;
  transform: translateX(var(--momo-drift,0px));
  clip-path: inset(0 calc(100% - var(--momo-progress-pct)) 0 0);
  filter: blur(.15px);
}
.lyr .line.active::after {
  opacity: .85 !important;
  animation: momoAshDrift .7s steps(2,end) infinite;
}
.lyr .line.active .momo-lyric-text {
  display: inline;
  background: linear-gradient(90deg,
    var(--muted) 0,
    var(--text) var(--momo-progress-pct),
    color-mix(in srgb,var(--text) 72%,transparent) calc(var(--momo-progress-pct) + 3%),
    var(--muted) calc(var(--momo-progress-pct) + 9%),
    var(--muted) 100%);
  -webkit-background-clip: text;
  background-clip: text;
  color: transparent;
}
.lyr .line:not(.active) .momo-lyric-text { color: inherit; }
@keyframes momoAshDrift {
  0% { background-position: 0 0, 0 0, 0 0; transform: translateX(-2px); }
  50% { background-position: 7px -3px, -6px 4px, 5px 2px; }
  100% { background-position: -4px 3px, 5px -2px, -7px 4px; transform: translateX(2px); }
}
@media (prefers-reduced-motion: reduce) {
  .lyr .line.active::after { animation: none; }
}
</style>
<script id="momo-lyrics-progress-repair-js">
(() => {
  'use strict';
  const drawer = document.getElementById('lyr');
  const audio = document.getElementById('audio');
  if (!drawer || !audio) return;

  const timeFrom = (line) => {
    const raw = line?.dataset?.time ?? line?.getAttribute?.('data-time') ?? line?.dataset?.start ?? line?.getAttribute?.('data-start');
    if (raw != null && raw !== '') {
      const n = Number(raw);
      if (Number.isFinite(n)) return n > 1000 ? n / 1000 : n;
      const m = String(raw).match(/^(?:(\\d+):)?(\\d+)(?:\\.(\\d+))?$/);
      if (m) return (Number(m[1] || 0) * 60) + Number(m[2]) + Number(('0.' + (m[3] || '0')));
    }
    const text = line?.textContent || '';
    const m = text.match(/^\\s*\\[(\\d+):(\\d+(?:\\.\\d+)?)\\]\\s*/);
    return m ? Number(m[1]) * 60 + Number(m[2]) : null;
  };

  const getLines = () => [...drawer.querySelectorAll('.line')]
    .map((el, domIndex) => ({ el, domIndex, time: timeFrom(el) }))
    .filter(x => Number.isFinite(x.time));

  let lastSong = null;
  let lastActive = -1;

  const prepare = () => {
    drawer.querySelectorAll('.line').forEach(line => {
      if (!line.querySelector('.momo-lyric-text')) {
        const span = document.createElement('span');
        span.className = 'momo-lyric-text';
        while (line.firstChild) span.appendChild(line.firstChild);
        line.appendChild(span);
      }
      const t = timeFrom(line);
      if (Number.isFinite(t)) line.dataset.momoTime = String(t);
    });
  };

  const render = () => {
    prepare();
    const lines = getLines();
    if (!lines.length || !Number.isFinite(audio.currentTime)) return;
    const now = audio.currentTime;
    let active = -1;
    for (let i = 0; i < lines.length; i++) {
      if (lines[i].time <= now + 0.01) active = i;
      else break;
    }

    lines.forEach((item, i) => {
      const start = item.time;
      const end = i + 1 < lines.length ? Math.max(lines[i + 1].time, start + 0.01) : Math.max(Number(audio.duration) || start + 3, start + 0.01);
      const progress = i === active ? Math.max(0, Math.min(1, (now - start) / (end - start))) : i < active ? 1 : 0;
      item.el.style.setProperty('--momo-progress', progress.toFixed(4));
      item.el.style.setProperty('--momo-progress-pct', (progress * 100).toFixed(3) + '%');
      item.el.style.setProperty('--momo-drift', (((progress * 2) - 1) * 3).toFixed(2) + 'px');
      item.el.classList.toggle('active', i === active);
      item.el.classList.toggle('near', i !== active && Math.abs(i - active) <= 1);
    });

    if (active !== lastActive && active >= 0) {
      lines[active].el.scrollIntoView({ behavior: 'smooth', block: 'center' });
      lastActive = active;
    }
  };

  drawer.addEventListener('click', e => {
    const line = e.target.closest('.line');
    if (!line) return;
    const t = timeFrom(line);
    if (Number.isFinite(t)) {
      e.preventDefault();
      audio.currentTime = t;
      render();
    }
  });

  ['timeupdate','seeking','seeked','durationchange','loadedmetadata','play','pause'].forEach(ev => audio.addEventListener(ev, render));
  const observer = new MutationObserver(() => {
    const song = audio.src;
    if (song !== lastSong) { lastSong = song; lastActive = -1; }
    prepare();
    render();
  });
  observer.observe(drawer, { childList: true, subtree: true, characterData: true });
  requestAnimationFrame(render);
})();
</script>
'''

s = s.replace('</body>', payload + '\n</body>', 1)
p.write_text(s, encoding='utf-8')
print('lyrics progress machinery replaced')
