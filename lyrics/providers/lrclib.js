const LRCLIB_API = 'https://lrclib.net/api/get';

function parseEnhancedLrc(lrc = '') {
  const lines = [];
  const lineRe = /^\s*\[(\d{1,3}):(\d{2})(?:\.(\d{1,3}))?\]\s*(.*)$/;
  const wordRe = /<(?:(\d{1,3}):(\d{2})(?:\.(\d{1,3}))?|([\d.]+))>([^<]*)/g;
  const fraction = value => Number((value || '').padEnd(3, '0')) / 1000;

  for (const raw of String(lrc).split(/\r?\n/)) {
    const match = raw.match(lineRe);
    if (!match) continue;
    const start = Number(match[1]) * 60 + Number(match[2]) + fraction(match[3]);
    const body = match[4] || '';
    const words = [];
    let word;
    while ((word = wordRe.exec(body))) {
      const wordStart = word[4] != null
        ? Number(word[4])
        : Number(word[1]) * 60 + Number(word[2]) + fraction(word[3]);
      if (Number.isFinite(wordStart)) words.push({ text: word[5], start: wordStart, end: wordStart });
    }
    lines.push({ text: body.replace(/<[^>]+>/g, '').trim(), start, end: start, words });
  }

  lines.sort((a, b) => a.start - b.start);
  for (let i = 0; i < lines.length; i++) {
    lines[i].end = lines[i + 1]?.start ?? lines[i].start + 8;
    for (let j = 0; j < lines[i].words.length; j++) {
      lines[i].words[j].end = lines[i].words[j + 1]?.start ?? lines[i].end;
    }
  }
  return lines;
}

function trackMeta(track = {}) {
  const m = track.metadata || {};
  return {
    title: String(m.title ?? track.title ?? track.name ?? '').trim(),
    artist: String(m.artist ?? track.artist ?? track.artistName ?? '').trim(),
    album: String(m.album ?? track.album ?? '').trim(),
    duration: Number(m.duration ?? track.duration ?? 0),
  };
}

export const lrclibProvider = {
  id: 'lrclib',
  async getLyrics(track, options = {}) {
    const meta = trackMeta(track);
    if (!meta.title || !meta.artist) return null;

    const params = new URLSearchParams({ track_name: meta.title, artist_name: meta.artist });
    if (meta.album) params.set('album_name', meta.album);
    if (meta.duration > 0) params.set('duration', String(Math.round(meta.duration)));

    const response = await fetch(`${LRCLIB_API}?${params}`, {
      headers: {
        'X-User-Agent': 'Momoirobara/experimental (https://github.com/mrcaddlr/momoirobara)',
      },
      signal: options.signal,
    });

    if (response.status === 404) return null;
    if (response.status === 429) {
      const error = new Error('LRCLIB rate limited');
      error.retryAfter = Math.max(1, Number(response.headers.get('Retry-After') || 1));
      throw error;
    }
    if (!response.ok) throw new Error(`LRCLIB HTTP ${response.status}`);

    const data = await response.json();
    const lines = parseEnhancedLrc(data.syncedLyrics || '');
    return {
      lines,
      plainLyrics: data.plainLyrics || '',
      sourceId: data.id || null,
      format: lines.some(line => line.words.length) ? 'word' : (lines.length ? 'line' : 'plain'),
      lyricsfile: data.lyricsfile || null,
      metadata: {
        title: data.trackName || data.name || meta.title,
        artist: data.artistName || meta.artist,
        album: data.albumName || meta.album,
        duration: data.duration || meta.duration,
      },
    };
  },
};

export { parseEnhancedLrc };
export default lrclibProvider;
