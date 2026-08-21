const LRCLIB_API = 'https://lrclib.net/api/get';

function parseLrc(lrc = '') {
  const lines = [];
  for (const raw of String(lrc).split(/\r?\n/)) {
    const match = raw.match(/^\[(\d+):(\d+(?:\.\d+)?)\]\s*(.*)$/);
    if (!match) continue;
    const start = Number(match[1]) * 60 + Number(match[2]);
    lines.push({ text: match[3].trim(), start, end: start + 5, words: [] });
  }
  lines.sort((a, b) => a.start - b.start);
  for (let i = 0; i < lines.length; i++) lines[i].end = lines[i + 1]?.start ?? lines[i].start + 5;
  return lines;
}

export const lrclibProvider = {
  id: 'lrclib',
  async getLyrics(track) {
    const params = new URLSearchParams({
      track_name: track.title || track.name || '',
      artist_name: track.artist || track.artistName || '',
      album_name: track.album || '',
    });
    const response = await fetch(`${LRCLIB_API}?${params}`);
    if (!response.ok) throw new Error(`LRCLIB HTTP ${response.status}`);
    const data = await response.json();
    return {
      lines: parseLrc(data.syncedLyrics || ''),
      plainLyrics: data.plainLyrics || '',
      sourceId: data.id || null,
    };
  },
};

export default lrclibProvider;
