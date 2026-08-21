const MIRRORS = [
  'https://lyricsplus.prjktla.my.id',
  'https://lyricsplus.atomix.one',
  'https://lyricsplus.binimum.org',
  'https://lyricsplus.prjktla.workers.dev',
  'https://lyricsplus-seven.vercel.app'
];

function normalizeWord(w) {
  const start = Number(w.start ?? w.startTime ?? w.start_ms);
  const end = Number(w.end ?? w.endTime ?? w.end_ms ?? start);
  return { text: String(w.text ?? w.word ?? '').trim(), start, end };
}

function parseLines(data) {
  const raw = data?.lines ?? data?.lyrics ?? data?.data?.lines ?? [];
  if (!Array.isArray(raw)) return [];
  return raw.map(line => ({
    text: String(line.text ?? line.line ?? '').trim(),
    start: Number(line.start ?? line.startTime ?? line.start_ms),
    end: Number(line.end ?? line.endTime ?? line.end_ms),
    words: (line.words ?? line.syllables ?? []).map(normalizeWord).filter(w => w.text && Number.isFinite(w.start))
  })).filter(l => l.text || l.words.length);
}

export const lyricsPlusProvider = {
  id: 'lyricsplus',
  async getLyrics(track, options = {}) {
    const m = track.metadata || {};
    const params = new URLSearchParams({
      title: String(m.title ?? track.title ?? track.name ?? ''),
      artist: String(m.artist ?? track.artist ?? track.artistName ?? '')
    });
    const album = m.album ?? track.album;
    const duration = Number(m.duration ?? track.duration);
    const isrc = m.isrc ?? track.isrc;
    if (album) params.set('album', album);
    if (Number.isFinite(duration) && duration > 0) params.set('duration', String(duration));
    if (isrc) params.set('isrc', isrc);
    // Deliberately exclude Musixmatch from the provider request.
    params.set('source', 'apple,lyricsplus,spotify');

    let lastError;
    for (const mirror of MIRRORS) {
      try {
        const response = await fetch(`${mirror}/v2/lyrics/get?${params}`, { signal: options.signal });
        if (!response.ok) throw new Error(`HTTP ${response.status}`);
        const data = await response.json();
        const lines = parseLines(data);
        if (lines.length || data?.plainLyrics) {
          return {
            ...data,
            lines,
            rawFormat: data?.type || null,
            metadata: {
              title: data?.title ?? data?.trackName ?? m.title ?? track.title ?? '',
              artist: data?.artist ?? data?.artistName ?? m.artist ?? track.artist ?? '',
              album: data?.album ?? data?.albumName ?? m.album ?? track.album ?? '',
              duration: Number(data?.duration ?? m.duration ?? track.duration ?? 0),
              isrc: data?.isrc ?? m.isrc ?? track.isrc ?? ''
            }
          };
        }
      } catch (error) {
        lastError = error;
      }
    }
    throw lastError || new Error('LyricsPlus: no result');
  }
};

export default lyricsPlusProvider;
