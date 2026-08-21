// MusicBrainz metadata recovery provider.
// MusicBrainz is free for non-commercial use and does not require an API key.

const BASE = 'https://musicbrainz.org/ws/2';
const USER_AGENT = 'Momoirobara/experimental (https://github.com/mrcaddlr/momoirobara)';

const text = value => String(value ?? '').trim();

function score(recording, metadata) {
  let score = 0;
  const title = text(metadata.title).toLowerCase();
  const artist = text(metadata.artist).toLowerCase();
  const duration = Number(metadata.duration) || 0;
  if (text(recording.title).toLowerCase() === title) score += 60;
  const artists = (recording['artist-credit'] || []).map(c => text(c.name || c.artist?.name).toLowerCase());
  if (artists.includes(artist)) score += 50;
  const length = Number(recording.length || 0) / 1000;
  if (duration && length) score += Math.max(0, 30 - Math.abs(duration - length) * 3);
  if (recording.releases?.some(r => text(r.title).toLowerCase() === text(metadata.album).toLowerCase())) score += 20;
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
    if (!text(m.title) || !text(m.artist)) return {};
    const query = `recording:"${text(m.title).replace(/[\\\"():]/g, ' ')}" AND artist:"${text(m.artist).replace(/[\\\"():]/g, ' ')}"`;
    const data = await request(`/recording?query=${encodeURIComponent(query)}&limit=10&inc=artist-credits+releases&fmt=json`, signal);
    const best = (data.recordings || []).sort((a, b) => score(b, m) - score(a, m))[0];
    return best ? fromRecording(best) : {};
  },
};

export default musicBrainzProvider;
