import { renderWordTimedLine, installWordTimingStyles, wordProgress } from './enhanced-lrc.js';

export function createWordSyncController({ getAudio, getLines, getLineElement, onLineChange } = {}) {
  let raf = 0;
  let lastIndex = -1;
  let running = false;

  function findLineIndex(time, lines) {
    if (!lines?.length) return -1;
    let low = 0, high = lines.length - 1, answer = -1;
    while (low <= high) {
      const mid = (low + high) >> 1;
      if (Number(lines[mid].start) <= time) { answer = mid; low = mid + 1; }
      else high = mid - 1;
    }
    return answer;
  }

  function tick() {
    if (!running) return;
    const audio = typeof getAudio === 'function' ? getAudio() : null;
    const lines = typeof getLines === 'function' ? getLines() : [];
    const time = Number(audio?.currentTime || 0);
    const index = findLineIndex(time, lines);
    if (index !== lastIndex) {
      lastIndex = index;
      if (typeof onLineChange === 'function') onLineChange(index, lines[index] || null);
    }
    const line = lines[index];
    const element = index >= 0 && typeof getLineElement === 'function' ? getLineElement(index) : null;
    if (element && line?.words?.length) renderWordTimedLine(element, line, time);
    raf = requestAnimationFrame(tick);
  }

  return {
    start() { if (running) return; running = true; installWordTimingStyles(); raf = requestAnimationFrame(tick); },
    stop() { running = false; if (raf) cancelAnimationFrame(raf); raf = 0; },
    refresh() { lastIndex = -1; },
    getWordProgress: wordProgress,
  };
}

export default createWordSyncController;
