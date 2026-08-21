// Normalize Enhanced LRC / provider word timing into Momoirobara's internal format.

export function parseEnhancedLrcText(text = '') {
  const lines = [];
  const lineRe = /^\[(\d+):(\d+(?:\.\d+)?)\]\s*(.*)$/;
  const wordRe = /<((?:\d+):(?:\d+(?:\.\d+)?))>([^<]*)/g;
  for (const raw of String(text).split(/\r?\n/)) {
    const lm = raw.match(lineRe);
    if (!lm) continue;
    const lineStart = Number(lm[1]) * 60 + Number(lm[2]);
    const body = lm[3] || '';
    const words = [];
    let wm;
    while ((wm = wordRe.exec(body))) {
      const [min, sec] = wm[1].split(':').map(Number);
      const start = min * 60 + sec;
      const value = wm[2];
      if (value) words.push({ text: value, start, end: null });
    }
    for (let i = 0; i < words.length; i++) {
      words[i].end = words[i + 1]?.start ?? null;
    }
    lines.push({
      text: words.length ? words.map(w => w.text).join('').trim() : body.trim(),
      start: lineStart,
      end: null,
      words,
    });
  }
  for (let i = 0; i < lines.length; i++) {
    const next = lines[i + 1]?.start;
    lines[i].end = Number.isFinite(next) ? next : (lines[i].words.at(-1)?.end ?? lines[i].start + 5);
    if (lines[i].words.length) {
      for (let j = 0; j < lines[i].words.length; j++) {
        if (!Number.isFinite(lines[i].words[j].end)) lines[i].words[j].end = lines[i].end;
      }
    }
  }
  return lines;
}

export function normalizeProviderResult(result, source) {
  if (!result) return null;
  const lines = Array.isArray(result.lines) ? result.lines : parseEnhancedLrcText(result.text || result.lrc || '');
  return {
    source,
    sourceId: result.sourceId || null,
    lines,
    format: lines.some(line => line.words?.length) ? 'word' : 'line',
  };
}
