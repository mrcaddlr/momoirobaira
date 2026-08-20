from pathlib import Path

p = Path('index.html')
s = p.read_text(encoding='utf-8')

HEAD_MARK = '<!-- MOMOIROBARA POLISH V10 -->'
BODY_MARK = '<!-- MOMOIROBARA POLISH V10 JS -->'

css = r'''<!-- MOMOIROBARA POLISH V10 -->
<style id="momoirobara-polish-v10">
/* Keep the lyric text clean: no fake dissolve/fill animation. */
.line{background:none!important;background-clip:border-box!important;-webkit-background-clip:border-box!important;color:var(--muted)!important;position:relative;overflow:visible;}
.line.active{color:var(--text)!important;transform:none!important;font-weight:650;}
.line.momo-current{--momo-line-progress:0%;}
.line.momo-current::after{content:"";position:absolute;left:0;right:0;bottom:-7px;height:2px;border-radius:999px;background:linear-gradient(90deg,var(--a) 0 var(--momo-line-progress),color-mix(in srgb,var(--a) 12%,transparent) var(--momo-line-progress) 100%);transform-origin:left center;will-change:background-size;}
.line.momo-word-sync{background:none!important;color:var(--muted)!important;}
.line.momo-word-sync .momo-word{color:var(--muted);transition:color .08s linear,opacity .08s linear;}
.line.momo-word-sync .momo-word.is-past,.line.momo-word-sync .momo-word.is-active{color:var(--text);}
.line.momo-word-sync .momo-word.is-active{color:var(--a);}

/* A clearly moving botanical layer behind every page. */
#momoAnimatedGarden{position:fixed;inset:0;z-index:0;pointer-events:none;overflow:hidden;contain:strict;}
#momoAnimatedGarden .momo-orb{position:absolute;width:clamp(180px,26vw,420px);height:clamp(180px,26vw,420px);border-radius:50%;background:radial-gradient(circle,color-mix(in srgb,var(--a) 20%,transparent),transparent 68%);filter:blur(8px);opacity:.72;animation:momoOrbDrift 18s ease-in-out infinite alternate;}
#momoAnimatedGarden .momo-orb:nth-child(1){left:-7%;top:12%;animation-duration:20s;}
#momoAnimatedGarden .momo-orb:nth-child(2){right:-8%;top:34%;animation-duration:24s;animation-delay:-7s;}
#momoAnimatedGarden .momo-orb:nth-child(3){left:28%;bottom:-18%;animation-duration:22s;animation-delay:-11s;}
.momo-floating-flower{position:absolute;display:block;font-family:serif;font-size:clamp(18px,2vw,34px);color:var(--a);opacity:0;filter:drop-shadow(0 0 8px color-mix(in srgb,var(--a) 25%,transparent));animation:momoFlowerFloat var(--dur,14s) linear infinite;animation-delay:var(--delay,0s);will-change:transform,opacity;}
.momo-floating-flower:nth-child(4n){font-size:clamp(13px,1.5vw,25px);}
.momo-floating-flower:nth-child(5n){font-size:clamp(24px,2.7vw,42px);}
@keyframes momoOrbDrift{0%{transform:translate3d(-4vw,-2vh,0) scale(.9)}50%{transform:translate3d(8vw,5vh,0) scale(1.12)}100%{transform:translate3d(-2vw,12vh,0) scale(.98)}}
@keyframes momoFlowerFloat{0%{transform:translate3d(0,12vh,0) rotate(0deg) scale(.75);opacity:0}10%{opacity:.28}45%{opacity:.22}80%{opacity:.18}100%{transform:translate3d(var(--drift,5vw),-115vh,0) rotate(260deg) scale(1.05);opacity:0}}
@media (prefers-reduced-motion:reduce){#momoAnimatedGarden{display:none}.line.momo-current::after{transition:none!important}}
/* App content stays above the garden. */
.app,.side,.content,.page,.player,.player-bar{position:relative;z-index:2;}
</style>
'''

js = r'''<!-- MOMOIROBARA POLISH V10 JS -->
<script>
(() => {
  'use strict';
  if (window.__momoPolishV10) return;
  window.__momoPolishV10 = true;

  const garden = document.createElement('div');
  garden.id = 'momoAnimatedGarden';
  garden.setAttribute('aria-hidden', 'true');
  const orbs = [0,1,2].map(() => document.createElement('i'));
  orbs.forEach(o => { o.className = 'momo-orb'; garden.appendChild(o); });
  const flowers = ['✿','❀','❁','✾','✽','❋'];
  for (let i = 0; i < 30; i++) {
    const f = document.createElement('span');
    f.className = 'momo-floating-flower';
    f.textContent = flowers[i % flowers.length];
    f.style.left = (Math.random() * 100).toFixed(2) + '%';
    f.style.top = (92 + Math.random() * 20).toFixed(2) + '%';
    f.style.setProperty('--dur', (11 + Math.random() * 11).toFixed(2) + 's');
    f.style.setProperty('--delay', (-Math.random() * 20).toFixed(2) + 's');
    f.style.setProperty('--drift', ((Math.random() * 18) - 9).toFixed(2) + 'vw');
    garden.appendChild(f);
  }
  document.body.prepend(garden);

  const audio = document.querySelector('audio');
  let lastActive = null;
  let raf = 0;

  function lines() {
    return [...document.querySelectorAll('.line,[data-lyric-line],.lyrics-line')];
  }
  function lineTime(el) {
    const raw = el?.dataset?.time ?? el?.getAttribute?.('data-time');
    const n = Number(raw);
    return Number.isFinite(n) ? (n > 10000 ? n / 1000 : n) : NaN;
  }
  function lineEnd(ls, i) {
    const a = lineTime(ls[i]);
    const b = i + 1 < ls.length ? lineTime(ls[i + 1]) : NaN;
    if (!Number.isFinite(a)) return NaN;
    return Number.isFinite(b) && b > a ? b : a + 4;
  }

  function activeIndex(ls, t) {
    let idx = -1;
    for (let i = 0; i < ls.length; i++) {
      const start = lineTime(ls[i]);
      if (Number.isFinite(start) && start <= t) idx = i;
      else if (Number.isFinite(start) && start > t) break;
    }
    return idx;
  }

  function smoothCenter(el) {
    if (!el || el === lastActive) return;
    lastActive = el;
    el.classList.add('momo-current');
    requestAnimationFrame(() => el.scrollIntoView({behavior:'smooth', block:'center', inline:'nearest'}));
  }

  function update() {
    raf = 0;
    const a = document.querySelector('audio');
    const t = a && Number.isFinite(a.currentTime) ? a.currentTime : 0;
    const ls = lines();
    const idx = activeIndex(ls, t);
    ls.forEach((el, i) => {
      const isCurrent = i === idx;
      el.classList.toggle('momo-current', isCurrent);
      el.classList.toggle('active', isCurrent);
      if (isCurrent) {
        const start = lineTime(el), end = lineEnd(ls, i);
        const pct = Number.isFinite(start) && Number.isFinite(end) && end > start
          ? Math.max(0, Math.min(1, (t - start) / (end - start))) : 0;
        el.style.setProperty('--momo-line-progress', (pct * 100).toFixed(3) + '%');
        smoothCenter(el);
        syncWords(el, t);
      }
    });
    updateProgressVisuals(a);
  }

  function updateProgressVisuals(a) {
    if (!a || !Number.isFinite(a.duration) || a.duration <= 0) return;
    const pct = Math.max(0, Math.min(100, a.currentTime / a.duration * 100));
    document.querySelectorAll('input[type="range"]').forEach(r => {
      const max = Number(r.max);
      if (!Number.isFinite(max) || max <= 0) return;
      const ratio = Math.max(0, Math.min(1, Number(r.value) / max));
      if (r.closest('.player,.player-bar,.progress')) {
        r.style.setProperty('--momo-progress', (ratio * 100).toFixed(3) + '%');
      }
    });
  }

  function parseWordData(el) {
    const raw = el?.dataset?.words || el?.dataset?.wordTimestamps;
    if (!raw) return null;
    try {
      const data = JSON.parse(raw);
      if (Array.isArray(data)) return data;
    } catch (_) {}
    return null;
  }

  function syncWords(el, t) {
    const words = parseWordData(el);
    if (!words?.length) return;
    if (!el.classList.contains('momo-word-sync')) {
      const text = el.textContent;
      el.textContent = '';
      words.forEach((w, i) => {
        const span = document.createElement('span');
        span.className = 'momo-word';
        span.textContent = (w.text ?? w.word ?? '') + (i === words.length - 1 ? '' : ' ');
        span.dataset.start = Number(w.start ?? w.time ?? 0);
        span.dataset.end = Number(w.end ?? w.to ?? span.dataset.start);
        el.appendChild(span);
      });
      el.classList.add('momo-word-sync');
    }
    el.querySelectorAll('.momo-word').forEach(w => {
      const start = Number(w.dataset.start), end = Number(w.dataset.end);
      w.classList.toggle('is-past', Number.isFinite(end) && t >= end);
      w.classList.toggle('is-active', Number.isFinite(start) && Number.isFinite(end) && t >= start && t < end);
    });
  }

  function loop() {
    update();
    raf = requestAnimationFrame(loop);
  }
  loop();
  document.addEventListener('play', () => { if (!raf) loop(); }, true);
  document.addEventListener('loadedmetadata', update, true);
  document.addEventListener('timeupdate', update, true);
  document.addEventListener('durationchange', update, true);

  // Smoothly follow lyric clicks without fighting the app's seek handler.
  document.addEventListener('click', e => {
    const el = e.target.closest?.('.line,[data-lyric-line],.lyrics-line');
    if (!el) return;
    requestAnimationFrame(() => smoothCenter(el));
  }, true);
})();
</script>
'''

if HEAD_MARK not in s:
    s = s.replace('</head>', css + '\n</head>', 1)
if BODY_MARK not in s:
    s = s.replace('</body>', js + '\n</body>', 1)

p.write_text(s, encoding='utf-8')
