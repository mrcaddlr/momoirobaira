// Experimental Karadeo adapter boundary.
// The public client must not contain a private API key.
// A server-side request function should return normalized word-timed lines.

export function createKaradeoProvider({ request } = {}) {
  return {
    id: 'karadeo',
    available: typeof request === 'function',
    async getLyrics(track, options = {}) {
      if (typeof request !== 'function') return null;
      if (!options.referenceUrl) return null;
      const result = await request({
        referenceUrl: options.referenceUrl,
        transcript: options.transcript || '',
        wordLevel: true,
        title: track.title || track.name || '',
        artist: track.artist || track.artistName || '',
      });
      if (!result) return null;
      return {
        lines: Array.isArray(result.lines) ? result.lines : [],
        sourceId: result.sourceId || null,
      };
    },
  };
}

export default createKaradeoProvider;
