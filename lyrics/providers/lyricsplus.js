const MIRRORS = [
  'https://lyricsplus.prjktla.my.id',
  'https://lyricsplus.atomix.one',
  'https://lyricsplus.binimum.org',
  'https://lyricsplus.prjktla.workers.dev',
  'https://lyricsplus-seven.vercel.app'
];

function seconds(value) {
  const n = Number(value);
  if (!Number.isFinite(n)) return NaN;
  return Math.abs(n) > 10000 ? n / 1000 : n;
}

function normalizeWord(w) {
  const start = seconds(w.start ?? w.startTime ?? w.start_ms ?? w.time);
  const end = seconds(w.end ?? w.endTime ?? w.end_ms ?? (Number.isFinite(start) ? start + seconds(w.duration || 0) : NaN));
  return { text: String(w.text ?? w.word ?? '').trim(), start, end };
}

function parseSyllables(items) {
  if (!Array.isArray(items)) return [];
  return items.map(normalizeWord).filter(w => w.text && Number.isFinite(w.start));
}

function parseLines(data) {
  const raw = data?.lines ?? data?.lyrics ?? data?.data?.lines ?? [];
  if (!Array.isArray(raw)) return [];
  return raw.map((line, index) => {
    const start = seconds(line.start ?? line.startTime ?? line.start_ms ?? line.time);
    const end = seconds(line.end ?? line.endTime ?? line.end_ms ?? (Number.isFinite(start) ? start + seconds(line.duration || 0) : NaN));
    const words = parseSyllables(line.words ?? line.syllables ?? line.syllabus);
    return { text: String(line.text ?? line.line ?? '').trim(), start, end, words, index };
  }).filter(l => l.text || l.words.length);
}

function parseLyricsPlus(data) {
  const lines = parseLines(data);
  if (lines.length) return lines;
  const raw = Array.isArray(data?.lyrics) ? data.lyrics : [];
  return raw.map((line, index) => {
    const start = seconds(line.time ?? line.start ?? line.start_ms);
    const end = Number.isFinite(start) ? start + seconds(line.duration || 0) : NaN;
    const words = parseSyllables(line.syllabus ?? line.syllables ?? line.words);
    return { text: String(line.text || '').trim(), start, end, words, index };
  }).filter(l => l.text || l.words.length);
}

export const lyricsPlusProvider = {
  id: 'lyricsplus',
  async getLyrics(track, options = {}) {
    const m = track.metadata || {};
    const title = String(m.title ?? track.title ?? track.name ?? '').trim();
    const artist = String(m.artist ?? track.artist ?? track.artistName ?? '').trim();
    if (!title || !artist) return null;
    const params = new URLSearchParams({ title, artist });
    const album = m.album ?? track.album;
    const duration = Number(m.duration ?? track.duration);
    const isrc = m.isrc ?? track.isrc;
    if (album) params.set('album', album);
    if (Number.isFinite(duration) && duration > 0) params.set('duration', String(duration));
    if (isrc) params.set('isrc', isrc);
    params.set('source', 'apple,lyricsplus,spotify');

    let lastError;
    for (const mirror of MIRRORS) {
      try {
        const response = await fetch(`${mirror}/v2/lyrics/get?${params}`, { signal: options.signal });
        if (!response.ok) throw new Error(`HTTP ${response.status}`);
        const data = await response.json();
        const lines = parseLyricsPlus(data);
        if (lines.length || data?.plainLyrics) return { ...data, lines, rawFormat: data?.type || null };
      } catch (error) {
        if (error?.name === 'AbortError') throw error;
        lastError = error;
      }
    }
    throw lastError || new Error('LyricsPlus: no result');
  }
};

export default lyricsPlusProvider;
