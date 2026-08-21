// MusicBrainz metadata recovery provider.
// Free public API; no API key is embedded in Momoirobara.

const BASE = 'https://musicbrainz.org/ws/2';
const USER_AGENT = 'Momoirobara/experimental (https://github.com/mrcaddlr/momoirobara)';
const text = value => String(value ?? '').trim();

function score(recording, metadata) {
  let score = 0;
  const title = text(metadata.title).toLowerCase();
  const artist = text(metadata.artist).toLowerCase();
  const duration = Number(metadata.duration) || 0;
  const rTitle = text(recording.title).toLowerCase();
  if (title && rTitle === title) score += 80;
  else if (title && (rTitle.includes(title) || title.includes(rTitle))) score += 35;
  const artists = (recording['artist-credit'] || []).map(c => text(c.name || c.artist?.name).toLowerCase());
  if (artist && artists.includes(artist)) score += 70;
  if (duration && recording.length) {
    const delta = Math.abs(duration - Number(recording.length) / 1000);
    if (delta <= 2) score += 35;
    else if (delta <= 5) score += 15;
  }
  if (text(metadata.album) && recording.releases?.some(r => text(r.title).toLowerCase() === text(metadata.album).toLowerCase())) score += 25;
  return score;
}

async function request(path, signal) {
  const response = await fetch(`${BASE}${path}`, {
    signal,
    headers: { Accept: 'application/json', 'User-Agent': USER_AGENT, 'X-User-Agent': USER_AGENT },
  });
  if (!response.ok) throw new Error(`MusicBrainz ${response.status}`);
  return response.json();
}

function fromRecording(recording) {
  const credit = recording['artist-credit']?.[0];
  const release = recording.releases?.[0];
  return {
    title: text(recording.title),
    artist: text(credit?.name || credit?.artist?.name),
    album: text(release?.title),
    duration: Number(recording.length || 0) / 1000 || undefined,
    musicbrainzId: text(recording.id) || undefined,
    isrc: text(recording.isrcs?.[0]).toUpperCase() || undefined,
  };
}

export const musicBrainzProvider = {
  id: 'musicbrainz-metadata',
  async resolve(track, { signal } = {}) {
    const m = track.metadata || track;
    if (text(m.isrc)) {
      try {
        const data = await request(`/isrc/${encodeURIComponent(text(m.isrc))}?inc=artist-credits+releases&fmt=json`, signal);
        const best = (data.recordings || []).sort((a, b) => score(b, m) - score(a, m))[0];
        if (best) return fromRecording(best);
      } catch (_) {}
    }
    if (!text(m.title)) return {};
    const safeTitle = text(m.title).replace(/[\\\"():]/g, ' ');
    const safeArtist = text(m.artist).replace(/[\\\"():]/g, ' ');
    const query = safeArtist
      ? `recording:"${safeTitle}" AND artist:"${safeArtist}"`
      : `recording:"${safeTitle}"`;
    const data = await request(`/recording?query=${encodeURIComponent(query)}&limit=20&inc=artist-credits+releases+isrcs&fmt=json`, signal);
    const best = (data.recordings || []).sort((a, b) => score(b, m) - score(a, m))[0];
    return best ? fromRecording(best) : {};
  },
};

export default musicBrainzProvider;
