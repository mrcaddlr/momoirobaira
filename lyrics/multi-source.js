import { normalizeTrackIdentity } from './song-identity.js';
import { metadataCompleteness, resolveMetadata } from './metadata-resolver.js';

const sleep = ms => new Promise(r => setTimeout(r, ms));

function validResult(result) {
  return result && (result.lyricsfile || result.syncedLyrics || result.lines?.length || result.plainLyrics);
}

function scoreResult(result, identity) {
  if (!validResult(result)) return -Infinity;
  const r = normalizeTrackIdentity({ metadata: result.metadata || result });
  let score = 0;
  if (identity.title && r.title && identity.title.toLowerCase() === r.title.toLowerCase()) score += 40;
  if (identity.artist && r.artist && identity.artist.toLowerCase() === r.artist.toLowerCase()) score += 40;
  if (identity.album && r.album && identity.album.toLowerCase() === r.album.toLowerCase()) score += 15;
  if (identity.duration && r.duration && Math.abs(identity.duration - r.duration) <= 2) score += 30;
  if (result.isrc && identity.isrc && result.isrc.toUpperCase() === identity.isrc) score += 100;
  if (result.type === 'word' || result.words?.length || /lyricsfile/i.test(result.format || '')) score += 50;
  if (result.syncedLyrics) score += 10;
  return score;
}

export async function fetchBestLyrics(track, providers = {}, options = {}) {
  const delay = options.delayMs ?? 300;
  let resolvedTrack = track;
  if (options.resolveMetadata !== false) {
    resolvedTrack = await resolveMetadata(track, providers.metadata || {});
  }
  const identity = normalizeTrackIdentity(resolvedTrack);
  const sources = [
    ['lyricsplus', providers.lyricsplus],
    ['musixmatch', providers.musixmatch],
    ['lrclib', providers.lrclib],
    ['lrcmux', providers.lrcmux],
  ];
  const candidates = [];
  for (const [source, provider] of sources) {
    if (typeof provider !== 'function') continue;
    try {
      const result = await provider(resolvedTrack);
      if (validResult(result)) candidates.push({ ...result, source, score: scoreResult(result, identity) });
      if (delay) await sleep(delay);
    } catch (error) {
      candidates.push({ source, error: error?.message || String(error), score: -Infinity });
    }
  }
  candidates.sort((a, b) => b.score - a.score);
  const best = candidates.find(validResult) || null;
  return {
    track: resolvedTrack,
    metadata: metadataCompleteness(resolvedTrack),
    result: best,
    candidates,
  };
}

export default fetchBestLyrics;
