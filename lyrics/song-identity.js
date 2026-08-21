// Stable local identity and metadata normalization for lyrics lookup.

export function normalizeTrackIdentity(track = {}) {
  const metadata = track.metadata || {};
  const value = key => metadata[key] ?? track[key] ?? '';
  const isrc = String(value('isrc') || value('ISRC')).trim().toUpperCase();
  const title = String(value('title') || value('name')).trim();
  const artist = String(value('artist') || value('artistName')).trim();
  const album = String(value('album')).trim();
  const duration = Number(value('duration') || 0);
  return {
    isrc: isrc || null,
    title,
    artist,
    album,
    duration: Number.isFinite(duration) ? duration : 0,
    durationSeconds: Math.round(Number.isFinite(duration) ? duration : 0),
  };
}

export function songIdentityCandidates(track = {}) {
  const m = normalizeTrackIdentity(track);
  const candidates = [];
  if (m.isrc) candidates.push({ type: 'isrc', value: m.isrc });
  if (m.title && m.artist) candidates.push({ type: 'metadata', value: `${m.artist}|${m.title}|${m.album}|${m.durationSeconds}` });
  if (m.title && m.artist) candidates.push({ type: 'basic', value: `${m.artist}|${m.title}|${m.durationSeconds}` });
  return candidates;
}

export function comparableDuration(a, b, toleranceSeconds = 4) {
  const left = Number(a), right = Number(b);
  if (!Number.isFinite(left) || !Number.isFinite(right) || left <= 0 || right <= 0) return false;
  return Math.abs(left - right) <= toleranceSeconds;
}

export default normalizeTrackIdentity;
