// Enhanced LRC / word-timing parser and renderer helpers.
// Provider-agnostic: accepts [word] timing data after normalization.

export function parseEnhancedLrc(lrc = '') {
  const lines = [];
  for (const raw of String(lrc).split(/\r?\n/)) {
    const lineMatch = raw.match(/^\[(\d+):(\d+(?:\.\d+)?)\](.*)$/);
    if (!lineMatch) continue;
    const start = Number(lineMatch[1]) * 60 + Number(lineMatch[2]);
    const body = lineMatch[3] || '';
    const words = [];
    const wordRe = /<(?:(\d+):(\d+(?:\.\d+)?))>([^<]*)/g;
    let match;
    while ((match = wordRe.exec(body))) {
      words.push({ text: match[3], start: Number(match[1]) * 60 + Number(match[2]), end: null });
    }
    for (let i = 0; i < words.length; i++) words[i].end = words[i + 1]?.start ?? start + 5;
    lines.push({ text: words.length ? words.map(w => w.text).join('').trim() : body.trim(), start, end: null, words });
  }
  for (let i = 0; i < lines.length; i++) lines[i].end = lines[i + 1]?.start ?? (lines[i].start + 5);
  return lines;
}

export function wordProgress(word, time) {
  const start = Number(word?.start);
  const end = Number(word?.end);
  if (!Number.isFinite(start) || !Number.isFinite(end) || end <= start) return time >= start ? 1 : 0;
  return Math.max(0, Math.min(1, (time - start) / (end - start)));
}

export function renderWordTimedLine(container, line, currentTime) {
  if (!container || !line) return;
  container.replaceChildren();
  if (!Array.isArray(line.words) || !line.words.length) {
    container.textContent = line.text || '';
    return;
  }
  const fragment = document.createDocumentFragment();
  for (const word of line.words) {
    const span = document.createElement('span');
    span.className = 'momo-lyric-word';
    span.textContent = word.text;
    const progress = wordProgress(word, currentTime);
    span.style.setProperty('--word-progress', `${progress * 100}%`);
    span.dataset.progress = progress.toFixed(3);
    fragment.appendChild(span);
  }
  container.appendChild(fragment);
}

export function installWordTimingStyles(doc = document) {
  if (doc.getElementById('momo-word-timing-css')) return;
  const style = doc.createElement('style');
  style.id = 'momo-word-timing-css';
  style.textContent = `
    .momo-lyric-word{--word-progress:0%;display:inline;color:var(--muted);background:linear-gradient(90deg,var(--text) var(--word-progress),var(--muted) var(--word-progress));background-clip:text;-webkit-background-clip:text;-webkit-text-fill-color:transparent;transition:background-size .06s linear}
  `;
  doc.head.appendChild(style);
}
