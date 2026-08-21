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
  const start = seconds(w.start ?? w.startTime ?? w.start_ms);
  const end = seconds(w.end ?? w.endTime ?? w.end_ms ?? start);
  return { text: String(w.text ?? w.word ?? '').trim(), start, end };
}

function parseLines(data) {
  const raw = data?.lines ?? data?.lyrics ?? data?.data?.lines ?? [];
  if (!Array.isArray(raw)) return [];
  return raw.map(line => ({
    text: String(line.text ?? line.line ?? '').trim(),
    start: seconds(line.start ?? line.startTime ?? line.start_ms),
    end: seconds(line.end ?? line.endTime ?? line.end_ms),
    words: (line.words ?? line.syllables ?? []).map(normalizeWord).filter(w => w.text && Number.isFinite(w.start))
  })).filter(l => l.text || l.words.length);
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
    // Deliberately do not request the Musixmatch source. Momoirobara's experimental
    // provider chain is LyricsPlus -> LRCLIB -> LRC Mux.
    params.set('source', 'apple,lyricsplus,spotify');

    let lastError;
    for (const mirror of MIRRORS) {
      try {
        const response = await fetch(`${mirror}/v2/lyrics/get?${params}`, { signal: options.signal });
        if (!response.ok) throw new Error(`HTTP ${response.status}`);
        const data = await response.json();
        const lines = parseLines(data);
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
