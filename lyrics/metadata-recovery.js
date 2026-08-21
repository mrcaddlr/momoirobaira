// Metadata recovery pipeline. Network adapters are injected so the public
// GitHub Pages build never needs to ship provider credentials.

export function normalizeMetadata(input = {}) {
  const m = input.metadata || input;
  const clean = value => String(value ?? '').trim();
  return {
    title: clean(m.title || m.trackName || m.name),
    artist: clean(m.artist || m.artistName),
    album: clean(m.album || m.albumName),
    albumArtist: clean(m.albumArtist),
    duration: Number(m.duration ?? m.durationSeconds ?? 0) || 0,
    isrc: clean(m.isrc || m.ISRC).toUpperCase() || null,
    musicbrainzRecordingId: clean(m.musicbrainzRecordingId || m.recordingId) || null,
  };
}

export function metadataCompleteness(metadata) {
  const m = normalizeMetadata(metadata);
  return {
    ...m,
    score: (m.title ? 1 : 0) + (m.artist ? 1 : 0) + (m.album ? 1 : 0) + (m.duration > 0 ? 1 : 0) + (m.isrc ? 2 : 0),
    enoughForLyrics: Boolean(m.title && m.artist),
  };
}

export async function recoverMetadata(track, adapters = {}) {
  let current = metadataCompleteness(track);
  if (current.score >= 4 || current.enoughForLyrics) return current;

  const queries = [];
  if (current.title) queries.push({ title: current.title, artist: current.artist, album: current.album, duration: current.duration });
  if (track.fileName) queries.push({ fileName: track.fileName });

  const providers = [adapters.musicbrainz, adapters.catalog].filter(Boolean);
  for (const provider of providers) {
    try {
      const candidate = await provider(queries[0] || { fileName: track.fileName || '' });
      if (!candidate) continue;
      current = metadataCompleteness({ ...current, ...candidate });
      if (current.enoughForLyrics) break;
    } catch (_) {
      // Metadata providers are optional; one failure must not stop lyrics lookup.
    }
  }
  return current;
}
