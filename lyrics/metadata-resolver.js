// Metadata recovery for incomplete local tags.
// Uses injected providers so service-specific credentials never live in the player.

const clean = value => String(value ?? '').trim();

export function metadataCompleteness(track = {}) {
  const m = track.metadata || track;
  const title = clean(m.title || m.trackName || m.name);
  const artist = clean(m.artist || m.artistName);
  const album = clean(m.album || m.albumName);
  const duration = Number(m.duration || m.durationSeconds || 0);
  const isrc = clean(m.isrc || m.ISRC);
  return {
    title, artist, album, duration: Number.isFinite(duration) ? duration : 0, isrc,
    enoughForLyrics: Boolean(title && artist),
    enoughForPreciseLookup: Boolean(title && artist && duration > 0),
  };
}

export function mergeMetadata(base = {}, discovered = {}) {
  const out = { ...base };
  for (const [key, value] of Object.entries(discovered || {})) {
    if (value !== undefined && value !== null && String(value).trim() !== '') out[key] = value;
  }
  return out;
}

function filenameHints(track = {}) {
  const name = clean(track.fileName || track.name || track.path?.split(/[\\/]/).pop()).replace(/\.[^.]+$/, '');
  if (!name) return {};
  const match = name.match(/^(.+?)\s+-\s+(.+)$/);
  if (!match) return { title: name };
  return { artist: match[1].trim(), title: match[2].trim() };
}

export async function resolveMetadata(track, providers = {}) {
  const initial = metadataCompleteness(track);
  if (initial.enoughForPreciseLookup || initial.isrc) {
    return { ...track, metadata: mergeMetadata(track.metadata || track, initial), metadataSource: 'embedded' };
  }

  let resolved = mergeMetadata(track.metadata || track, filenameHints(track));
  const checks = [metadataCompleteness(resolved)];
  const queries = [];
  if (typeof providers.filename === 'function') queries.push(() => providers.filename({ ...track, metadata: resolved }));
  if (typeof providers.musicbrainz === 'function') queries.push(() => providers.musicbrainz({ ...track, metadata: resolved }));
  if (typeof providers.catalog === 'function') queries.push(() => providers.catalog({ ...track, metadata: resolved }));

  for (const query of queries) {
    try {
      resolved = mergeMetadata(resolved, await query());
      const check = metadataCompleteness(resolved);
      checks.push(check);
      if (check.enoughForPreciseLookup || check.isrc) break;
    } catch (_) {}
  }

  const final = metadataCompleteness(resolved);
  return {
    ...track,
    metadata: resolved,
    metadataSource: final.enoughForPreciseLookup ? 'recovered' : initial.enoughForLyrics ? 'partial+recovered' : 'partial',
    metadataCompleteness: final,
    recoveryAttempts: checks.length - 1,
  };
}

export default resolveMetadata;
