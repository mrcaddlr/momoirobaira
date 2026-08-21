// Enhanced LRC / word-timing parser and renderer helpers.

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
  for (let i = 0; i < lines.length; i++) lines[i].end = lines[i + 1]?.start ?? lines[i].start + 5;
  return lines;
}

export function wordProgress(word, time) {
  const start = Number(word?.start), end = Number(word?.end);
  if (!Number.isFinite(start) || !Number.isFinite(end) || end <= start) return time >= start ? 1 : 0;
  return Math.max(0, Math.min(1, (time - start) / (end - start)));
}

export function renderWordTimedLine(container, line, currentTime) {
  if (!container || !line) return;
  if (!Array.isArray(line.words) || !line.words.length) {
    container.textContent = line.text || '';
    return;
  }
  const fragment = document.createDocumentFragment();
  const old = container.querySelectorAll('.momo-lyric-word');
  if (old.length !== line.words.length) container.replaceChildren();
  const nodes = container.querySelectorAll('.momo-lyric-word');
  line.words.forEach((word, index) => {
    let span = nodes[index];
    if (!span) { span = document.createElement('span'); span.className = 'momo-lyric-word'; fragment.appendChild(span); }
    span.textContent = word.text;
    const progress = wordProgress(word, currentTime);
    span.style.setProperty('--word-progress', `${progress * 100}%`);
    span.dataset.progress = progress.toFixed(3);
  });
  if (fragment.childNodes.length) container.appendChild(fragment);
}

export function installWordTimingStyles(doc = document) {
  if (doc.getElementById('momo-word-timing-css')) return;
  const style = doc.createElement('style');
  style.id = 'momo-word-timing-css';
  style.textContent = `
    .momo-lyric-word{--word-progress:0%;display:inline;color:var(--muted);background:linear-gradient(90deg,var(--text) var(--word-progress),var(--muted) var(--word-progress));background-clip:text;-webkit-background-clip:text;-webkit-text-fill-color:transparent;}
  `;
  doc.head.appendChild(style);
}
