// Normalize common word-timed lyric payloads into Momoirobara's internal format.

function num(value) {
  const n = Number(value);
  return Number.isFinite(n) ? n : null;
}

export function normalizeWordLines(payload) {
  const sourceLines = Array.isArray(payload) ? payload : payload?.lines;
  if (!Array.isArray(sourceLines)) return [];
  return sourceLines.map(line => {
    const words = (line.words || line.tokens || []).map(word => ({
      text: String(word.text ?? word.word ?? '').replace(/\s+/g, ' '),
      start: num(word.start ?? word.startTime),
      end: num(word.end ?? word.endTime)
    })).filter(word => word.text && word.start !== null && word.end !== null);
    const start = num(line.start ?? line.startTime) ?? words[0]?.start ?? 0;
    const end = num(line.end ?? line.endTime) ?? words.at(-1)?.end ?? start + 5;
    return {
      text: String(line.text ?? words.map(w => w.text).join('').trim()),
      start,
      end,
      words
    };
  }).filter(line => line.text || line.words.length);
}

export function enhancedLrcToWordLines(lrc = '') {
  const output = [];
  for (const raw of String(lrc).split(/\r?\n/)) {
    const lm = raw.match(/^\[(\d+):(\d+(?:\.\d+)?)\](.*)$/);
    if (!lm) continue;
    const lineStart = Number(lm[1]) * 60 + Number(lm[2]);
    const words = [];
    const re = /<(?:(\d+):(\d+(?:\.\d+)?))>([^<]*)/g;
    let m;
    while ((m = re.exec(lm[3]))) words.push({ text: m[3], start: Number(m[1]) * 60 + Number(m[2]), end: null });
    words.forEach((w, i) => { w.end = words[i + 1]?.start ?? lineStart + 5; });
    output.push({ text: words.length ? words.map(w => w.text).join('').trim() : lm[3].trim(), start: lineStart, end: words.at(-1)?.end ?? lineStart + 5, words });
  }
  for (let i = 0; i < output.length - 1; i++) output[i].end = output[i + 1].start;
  return output;
}
