// Metadata recovery for tracks whose embedded tags are incomplete.
// Provider calls are injected so the frontend never needs service credentials.

const clean = value => String(value ?? '').trim();

export function metadataCompleteness(track = {}) {
  const m = track.metadata || track;
  const title = clean(m.title || m.trackName || m.name);
  const artist = clean(m.artist || m.artistName);
  const album = clean(m.album || m.albumName);
  const duration = Number(m.duration || m.durationSeconds || 0);
  return { title, artist, album, duration: Number.isFinite(duration) ? duration : 0,
    enoughForLyrics: Boolean(title && artist), enoughForPreciseLookup: Boolean(title && artist && duration > 0) };
}

export function mergeMetadata(base = {}, discovered = {}) {
  const out = { ...base };
  for (const [key, value] of Object.entries(discovered || {})) {
    if (value !== undefined && value !== null && String(value).trim() !== '') out[key] = value;
  }
  return out;
}

export async function resolveMetadata(track, providers = {}) {
  const current = metadataCompleteness(track);
  if (current.enoughForPreciseLookup) return { ...track, metadata: mergeMetadata(track.metadata || track, current), source: 'embedded' };

  const queries = [];
  if (typeof providers.filename === 'function') queries.push(() => providers.filename(track));
  if (typeof providers.musicbrainz === 'function') queries.push(() => providers.musicbrainz(track));
  if (typeof providers.catalog === 'function') queries.push(() => providers.catalog(track));

  let resolved = { ...(track.metadata || track) };
  for (const query of queries) {
    try {
      const result = await query();
      resolved = mergeMetadata(resolved, result);
      const check = metadataCompleteness(resolved);
      if (check.enoughForPreciseLookup) break;
    } catch (_) { /* try the next metadata source */ }
  }

  return { ...track, metadata: resolved, metadataSource: current.enoughForLyrics ? 'partial+recovered' : 'recovered' };
}

export default resolveMetadata;
