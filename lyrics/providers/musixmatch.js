// Experimental adapter boundary for an authorized Musixmatch integration.
// Keep credentials/server authentication outside the public Pages bundle.

export function createMusixmatchProvider({ request } = {}) {
  if (typeof request !== 'function') {
    return {
      id: 'musixmatch',
      available: false,
      async getLyrics() { return null; },
    };
  }

  return {
    id: 'musixmatch',
    available: true,
    async getLyrics(track) {
      const data = await request({
        title: track.title || track.name || '',
        artist: track.artist || track.artistName || '',
        album: track.album || '',
        duration: Number(track.duration || 0),
        isrc: track.isrc || track.ISRC || '',
      });
      if (!data) return null;
      return {
        lines: Array.isArray(data.lines) ? data.lines.map(line => ({
          text: line.text || '',
          start: Number(line.start),
          end: Number(line.end),
          words: Array.isArray(line.words) ? line.words : [],
        })) : [],
        sourceId: data.sourceId || null,
      };
    },
  };
}

export default createMusixmatchProvider;
