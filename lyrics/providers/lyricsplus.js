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
function durationSeconds(value) {
  const n = Number(value);
  return Number.isFinite(n) ? n / 1000 : NaN;
}
function normalizeWord(w) {
  const start = seconds(w.start ?? w.startTime ?? w.start_ms ?? w.time);
  const duration = durationSeconds(w.duration ?? w.duration_ms ?? w.durationMs);
  const explicitEnd = seconds(w.end ?? w.endTime ?? w.end_ms);
  const end = Number.isFinite(explicitEnd) ? explicitEnd : (Number.isFinite(start) && Number.isFinite(duration) ? start + duration : NaN);
  return { text: String(w.text ?? w.word ?? '').trim(), start, end };
}
function parseSyllables(items) {
  if (!Array.isArray(items)) return [];
  return items.map(normalizeWord).filter(w => w.text && Number.isFinite(w.start) && Number.isFinite(w.end) && w.end >= w.start);
}
function normalizeLine(line,index) {
  const start = seconds(line.start ?? line.startTime ?? line.start_ms ?? line.time);
  const duration = durationSeconds(line.duration ?? line.duration_ms ?? line.durationMs);
  const explicitEnd = seconds(line.end ?? line.endTime ?? line.end_ms);
  const end = Number.isFinite(explicitEnd) ? explicitEnd : (Number.isFinite(start) && Number.isFinite(duration) ? start + duration : NaN);
  const words = parseSyllables(line.words ?? line.syllables ?? line.syllabus);
  const text = String(line.text ?? line.line ?? '').trim() || words.map(w => w.text).join(' ').trim();
  return { text, start, end, words, index };
}
function parseLyricsPlus(data) {
  const raw = data?.lyrics ?? data?.data?.lyrics ?? data?.lines ?? data?.data?.lines ?? [];
  if (!Array.isArray(raw)) return [];
  return raw.map(normalizeLine).filter(l => l.text || l.words.length);
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
    if (Number.isFinite(duration) && duration > 0) params.set('duration', String(Math.round(duration)));
    if (isrc) params.set('isrc', isrc);
    params.set('source', 'apple,lyricsplus,spotify,musixmatch,musixmatch-word');

    let lastError;
    for (const mirror of MIRRORS) {
      try {
        const response = await fetch(`${mirror}/v2/lyrics/get?${params}`, { signal: options.signal });
        if (!response.ok) throw new Error(`HTTP ${response.status}`);
        const data = await response.json();
        const lines = parseLyricsPlus(data);
        const hasWords = lines.some(line => line.words.length);
        if (lines.length || data?.plainLyrics) return { ...data, lines, rawFormat: data?.type || data?.format || (hasWords ? 'WORD' : 'LINE') };
      } catch (error) {
        if (error?.name === 'AbortError') throw error;
        lastError = error;
      }
    }
    throw lastError || new Error('LyricsPlus: no result');
  }
};
export default lyricsPlusProvider;
