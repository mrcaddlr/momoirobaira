// Provider-agnostic helpers for the experimental lyrics pipeline.
// Network/authenticated requests are intentionally injected by the host app.

export function parseEnhancedLrcText(text = '') {
  const result = [];
  const lines = String(text).split(/\r?\n/);
  const lineRe = /^\[(\d+):(\d+(?:\.\d+)?)\](.*)$/;
  const wordRe = /<((?:\d+):(?:\d+(?:\.\d+)?))>([^<]*)/g;
  const toSeconds = value => {
    const [m, s] = value.split(':').map(Number);
    return m * 60 + s;
  };
  for (const raw of lines) {
    const lm = raw.match(lineRe);
    if (!lm) continue;
    const start = Number(lm[1]) * 60 + Number(lm[2]);
    const body = lm[3] || '';
    const words = [];
    let wm;
    while ((wm = wordRe.exec(body))) words.push({ text: wm[2], start: toSeconds(wm[1]), end: null });
    for (let i = 0; i < words.length; i++) words[i].end = words[i + 1]?.start ?? start + 5;
    result.push({ text: words.length ? words.map(w => w.text).join('').trim() : body.trim(), start, end: null, words });
  }
  for (let i = 0; i < result.length; i++) result[i].end = result[i + 1]?.start ?? result[i].start + 5;
  return result;
}

export function hasWordTiming(lyrics) {
  return Boolean(lyrics?.lines?.some(line => Array.isArray(line.words) && line.words.length));
}

export function normalizeProviderResult(result, source) {
  if (!result) return null;
  if (typeof result === 'string') return { source, lines: parseEnhancedLrcText(result), format: 'word' };
  return {
    ...result,
    source,
    lines: Array.isArray(result.lines) ? result.lines : [],
    format: hasWordTiming(result) ? 'word' : 'line',
  };
}
