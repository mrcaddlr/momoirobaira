// Lyricsfile 1.0 parser. Lyricsfile is YAML; this parser intentionally handles
// the subset Momoirobara needs without adding a runtime YAML dependency.

function scalar(value) {
  const v = String(value ?? '').trim();
  if (!v) return '';
  if ((v.startsWith('"') && v.endsWith('"')) || (v.startsWith("'") && v.endsWith("'"))) return v.slice(1, -1);
  if (v === 'true') return true;
  if (v === 'false') return false;
  if (/^-?\d+(?:\.\d+)?$/.test(v)) return Number(v);
  return v;
}

export function parseLyricsfile(input = '') {
  const text = String(input).replace(/\r/g, '');
  if (!text.trim()) return null;
  const lines = text.split('\n');
  const result = { version: null, metadata: {}, lines: [], plain: '' };
  let section = null;
  let currentLine = null;
  let currentWord = null;
  let plain = [];

  for (const raw of lines) {
    const trimmed = raw.trim();
    if (!trimmed) continue;
    if (/^version:\s*/.test(trimmed)) { result.version = scalar(trimmed.replace(/^version:\s*/, '')); continue; }
    if (trimmed === 'metadata:') { section = 'metadata'; currentLine = null; continue; }
    if (trimmed === 'lines:') { section = 'lines'; currentLine = null; continue; }
    if (trimmed === 'plain: |') { section = 'plain'; currentLine = null; continue; }
    if (section === 'metadata') {
      const m = raw.match(/^\s{2}([A-Za-z0-9_]+):\s*(.*)$/);
      if (m) result.metadata[m[1]] = scalar(m[2]);
      continue;
    }
    if (section === 'plain') {
      if (/^\s{2}/.test(raw)) plain.push(raw.replace(/^\s{2}/, ''));
      continue;
    }
    if (section !== 'lines') continue;
    const lineStart = raw.match(/^\s*-\s+text:\s*(.*)$/);
    if (lineStart) {
      currentLine = { text: scalar(lineStart[1]), start_ms: null, end_ms: null, words: [] };
      result.lines.push(currentLine); currentWord = null; continue;
    }
    if (!currentLine) continue;
    const lineProp = raw.match(/^\s{4}(start_ms|end_ms):\s*(.*)$/);
    if (lineProp) { currentLine[lineProp[1]] = Number(scalar(lineProp[2])); continue; }
    const wordStart = raw.match(/^\s{8}-\s+text:\s*(.*)$/);
    if (wordStart) {
      currentWord = { text: scalar(wordStart[1]), start_ms: null, end_ms: null };
      currentLine.words.push(currentWord); continue;
    }
    if (currentWord) {
      const wordProp = raw.match(/^\s{10}(start_ms|end_ms):\s*(.*)$/);
      if (wordProp) currentWord[wordProp[1]] = Number(scalar(wordProp[2]));
    }
  }
  result.plain = plain.join('\n').trim();
  result.lines = result.lines.map((line, i, all) => {
    const nextStart = all[i + 1]?.start_ms;
    const words = line.words.map((word, j, ws) => ({
      text: word.text,
      start: Number(word.start_ms ?? 0) / 1000,
      end: Number(word.end_ms ?? ws[j + 1]?.start_ms ?? line.end_ms ?? nextStart ?? 0) / 1000,
    }));
    const start = Number(line.start_ms ?? words[0]?.start * 1000 ?? 0) / 1000;
    const end = Number(line.end_ms ?? nextStart ?? (start + 5) * 1000) / 1000;
    return { ...line, start, end, words };
  });
  return result;
}

export function hasWordTiming(lyricsfile) {
  return Boolean(lyricsfile?.lines?.some(line => Array.isArray(line.words) && line.words.length > 0));
}
