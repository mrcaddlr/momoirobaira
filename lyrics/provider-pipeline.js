// Multi-source lyrics pipeline for experimental word-synced lyrics.
// Providers are intentionally injected so the public frontend never needs private credentials.

const clean = value => String(value ?? '').trim();

function normalizedIdentity(track = {}) {
  const m = track.metadata || track;
  return {
    title: clean(m.title || m.trackName || m.name),
    artist: clean(m.artist || m.artistName),
    album: clean(m.album || m.albumName),
    duration: Number(m.duration || m.durationSeconds || 0),
    isrc: clean(m.isrc || m.ISRC).toUpperCase(),
  };
}

function scoreResult(result, track) {
  if (!result) return -Infinity;
  const q = normalizedIdentity(track);
  const title = clean(result.title || result.metadata?.title).toLowerCase();
  const artist = clean(result.artist || result.metadata?.artist).toLowerCase();
  const album = clean(result.album || result.metadata?.album).toLowerCase();
  const duration = Number(result.duration || result.metadata?.duration || 0);
  const words = (result.lines || []).some(line => Array.isArray(line.words) && line.words.length);
  let score = 0;
  if (q.isrc && clean(result.isrc || result.metadata?.isrc).toUpperCase() === q.isrc) score += 100;
  if (title && title === q.title.toLowerCase()) score += 40;
  else if (title && q.title.toLowerCase().includes(title)) score += 20;
  if (artist && artist === q.artist.toLowerCase()) score += 40;
  else if (artist && q.artist.toLowerCase().includes(artist)) score += 20;
  if (album && q.album && album === q.album.toLowerCase()) score += 15;
  if (duration > 0 && q.duration > 0) {
    const delta = Math.abs(duration - q.duration);
    if (delta <= 2) score += 30;
    else if (delta <= 5) score += 15;
    else if (delta > 15) score -= 30;
  }
  if (words) score += 50;
  else if ((result.lines || []).length) score += 10;
  return score;
}

function validResult(result) {
  return Boolean(result && ((result.lines || []).length || clean(result.plainLyrics)));
}

export function createLyricsProviderPipeline({ providers = [], minimumScore = 55, delayMs = 250 } = {}) {
  const ordered = providers.filter(p => p && typeof p.getLyrics === 'function');

  return {
    providers: ordered,
    async resolve(track, options = {}) {
      const candidates = [];
      for (const provider of ordered) {
        try {
          const result = await provider.getLyrics(track, options);
          if (validResult(result)) {
            const candidate = { ...result, source: result.source || provider.id, score: scoreResult(result, track) };
            candidates.push(candidate);
            // A strong word-level match is good enough; otherwise continue down the ladder.
            if (candidate.score >= minimumScore && (result.type === 'word' || result.format === 'word')) break;
          }
        } catch (error) {
          console.warn(`[lyrics:${provider.id}]`, error);
        }
        if (delayMs > 0) await new Promise(resolve => setTimeout(resolve, delayMs));
      }
      candidates.sort((a, b) => b.score - a.score);
      return candidates[0] || null;
    }
  };
}

export { normalizedIdentity, scoreResult };
export default createLyricsProviderPipeline;
