// Small player-side bridge for the experimental lyrics engine.
// It deliberately targets the existing .line elements so the current UI stays intact.

function activeLine(lines, time) {
  let index = -1;
  for (let i = 0; i < lines.length; i++) {
    const start = Number(lines[i].start);
    if (Number.isFinite(start) && start <= time) index = i;
    else if (Number.isFinite(start) && start > time) break;
  }
  return index;
}

function clamp(value, min, max) { return Math.min(max, Math.max(min, value)); }

export function renderWordProgress(container, lyrics, time) {
  if (!container || !lyrics?.lines) return;
  const elements = [...container.querySelectorAll('.line,[data-lyric-line],.lyrics-line')];
  const lines = lyrics.lines;
  const active = activeLine(lines, time);

  elements.forEach((el, index) => {
    const line = lines[index];
    if (!line) return;
    const isActive = index === active;
    el.classList.toggle('active', isActive);
    if (!isActive) {
      el.style.setProperty('--progress', '0%');
      return;
    }

    const words = Array.isArray(line.words) ? line.words : [];
    if (!words.length) {
      const start = Number(line.start);
      const end = Number(line.end) > start ? Number(line.end) : start + 4;
      const progress = clamp((time - start) / (end - start), 0, 1) * 100;
      el.style.setProperty('--progress', `${progress}%`);
      return;
    }

    const first = Number(words[0].start);
    const last = Number(words[words.length - 1].end ?? words[words.length - 1].start);
    const total = Math.max(0.001, last - first);
    const progress = clamp((time - first) / total, 0, 1) * 100;
    el.style.setProperty('--progress', `${progress}%`);
  });
}

export function attachLyricsPlayback({ audio, container, getLyrics }) {
  if (!audio || !container || typeof getLyrics !== 'function') return () => {};
  let lyrics = null;
  let raf = 0;

  const paint = () => {
    raf = 0;
    if (lyrics) renderWordProgress(container, lyrics, Number(audio.currentTime) || 0);
  };
  const schedule = () => { if (!raf) raf = requestAnimationFrame(paint); };
  const load = async () => {
    lyrics = await getLyrics();
    schedule();
  };

  audio.addEventListener('timeupdate', schedule);
  audio.addEventListener('seeking', schedule);
  audio.addEventListener('seeked', schedule);
  audio.addEventListener('play', schedule);
  audio.addEventListener('pause', schedule);
  load();

  return () => {
    audio.removeEventListener('timeupdate', schedule);
    audio.removeEventListener('seeking', schedule);
    audio.removeEventListener('seeked', schedule);
    audio.removeEventListener('play', schedule);
    audio.removeEventListener('pause', schedule);
    if (raf) cancelAnimationFrame(raf);
  };
}
