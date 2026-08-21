import { createWordSyncController } from './word-sync-controller.js';

// Lightweight adapter for the existing Momoirobara DOM.
// It discovers the app's audio element and lyric rows without replacing the
// existing lyric loader. Word-timed data can be exposed as
// window.momoirobaraWordLyrics = { lines: [...] } by the lyrics manager.
export function installMomoirobaraWordSync({ root = document } = {}) {
  const findAudio = () => root.querySelector('audio, #audio, #playerAudio');
  const findRows = () => Array.from(root.querySelectorAll('.lyr .line, .line[data-time], [data-lyric-line], .lyrics-line'));
  const getLines = () => {
    const supplied = globalThis.momoirobaraWordLyrics;
    if (supplied?.lines?.length) return supplied.lines;
    return findRows().map((el, i, rows) => ({
      text: el.textContent.trim(),
      start: Number(el.dataset.time ?? el.dataset.start ?? 0),
      end: Number(el.dataset.end ?? rows[i + 1]?.dataset.time ?? 0),
      words: Array.isArray(el._momoWords) ? el._momoWords : []
    }));
  };
  const controller = createWordSyncController({
    getAudio: findAudio,
    getLines,
    getLineElement: index => findRows()[index] || null,
    onLineChange: (index, line) => {
      const rows = findRows();
      rows.forEach((row, i) => row.classList.toggle('momo-word-sync', i === index && !!line?.words?.length));
      if (rows[index] && !rows[index].classList.contains('active')) rows[index].classList.add('active');
    }
  });

  const audio = findAudio();
  if (audio) {
    controller.start();
    audio.addEventListener('play', controller.start, { passive: true });
    audio.addEventListener('pause', controller.stop, { passive: true });
    audio.addEventListener('ended', controller.stop, { passive: true });
    audio.addEventListener('seeked', controller.refresh, { passive: true });
  }
  globalThis.momoirobaraWordSync = controller;
  return controller;
}

if (typeof window !== 'undefined') {
  const boot = () => installMomoirobaraWordSync();
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot, { once: true });
  else boot();
}
