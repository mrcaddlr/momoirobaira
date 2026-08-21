const API = 'https://api.lrcmux.dev';

function seconds(value) {
  const n = Number(value);
  if (!Number.isFinite(n)) return NaN;
  return Math.abs(n) > 10000 ? n / 1000 : n;
}

function normalizeWord(w) {
  const start = seconds(w.start ?? w.start_ms ?? w.startTime);
  const end = seconds(w.end ?? w.end_ms ?? w.endTime ?? start);
  return { text: String(w.text ?? w.word ?? '').trim(), start, end };
}

function normalizeLines(raw) {
  if (!Array.isArray(raw)) return [];
  return raw.map(line => ({
    text: String(line.text ?? line.line ?? '').trim(),
    start: seconds(line.start ?? line.start_ms ?? line.startTime),
    end: seconds(line.end ?? line.end_ms ?? line.endTime),
    words: (line.words ?? line.syllables ?? []).map(normalizeWord).filter(w => w.text && Number.isFinite(w.start))
  })).filter(l => l.text || l.words.length);
}

export const lrcMuxProvider = {
  id: 'lrcmux',
  async getLyrics(track, options = {}) {
    const m = track.metadata || {};
    const params = new URLSearchParams({
      artist: String(m.artist ?? track.artist ?? track.artistName ?? ''),
      title: String(m.title ?? track.title ?? track.name ?? '')
    });
    const album = m.album ?? track.album;
    const duration = Number(m.duration ?? track.duration);
    if (album) params.set('album', album);
    if (Number.isFinite(duration) && duration > 0) params.set('duration', String(duration));

    const response = await fetch(`${API}/get?${params}`, { signal: options.signal });
    if (!response.ok) throw new Error(`LRC Mux HTTP ${response.status}`);
    const data = await response.json();
    const lines = normalizeLines(data?.lines ?? data?.lyrics ?? data?.data?.lines);
    if (!lines.length && !String(data?.plainLyrics ?? data?.lyrics ?? '').trim()) throw new Error('LRC Mux: no lyrics');
    return { ...data, lines, plainLyrics: data?.plainLyrics ?? (typeof data?.lyrics === 'string' ? data.lyrics : ''), rawFormat: data?.format ?? null };
  }
};
