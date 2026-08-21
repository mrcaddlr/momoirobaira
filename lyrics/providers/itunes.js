// iTunes Search metadata fallback. No API key required.
const API = 'https://itunes.apple.com/search';
const text = value => String(value ?? '').trim();

function score(item, metadata) {
  const title = text(metadata.title).toLowerCase();
  const artist = text(metadata.artist).toLowerCase();
  const duration = Number(metadata.duration) || 0;
  let score = 0;
  const it = text(item.trackName).toLowerCase();
  const ia = text(item.artistName).toLowerCase();
  if (title && it === title) score += 80;
  else if (title && (it.includes(title) || title.includes(it))) score += 35;
  if (artist && ia === artist) score += 70;
  else if (artist && (ia.includes(artist) || artist.includes(ia))) score += 25;
  if (duration && item.trackTimeMillis) {
    const delta = Math.abs(duration - item.trackTimeMillis / 1000);
    if (delta <= 2) score += 40;
    else if (delta <= 5) score += 15;
  }
  if (text(metadata.album) && text(item.collectionName).toLowerCase() === text(metadata.album).toLowerCase()) score += 25;
  return score;
}

export const iTunesProvider = {
  id: 'itunes-metadata',
  async resolve(track, { signal } = {}) {
    const m = track.metadata || track;
    const title = text(m.title || track.title || track.name);
    if (!title) return {};
    const artist = text(m.artist || track.artist || track.artistName);
    const term = artist ? `${title} ${artist}` : title;
    const params = new URLSearchParams({ term, entity: 'song', limit: '20' });
    const response = await fetch(`${API}?${params}`, { signal, headers: { Accept: 'application/json' } });
    if (!response.ok) throw new Error(`iTunes Search ${response.status}`);
    const data = await response.json();
    const best = (data.results || []).sort((a, b) => score(b, m) - score(a, m))[0];
    if (!best) return {};
    return {
      title: text(best.trackName),
      artist: text(best.artistName),
      album: text(best.collectionName),
      duration: Number(best.trackTimeMillis || 0) / 1000 || undefined,
      genre: text(best.primaryGenreName),
      releaseDate: text(best.releaseDate),
      artworkUrl: text(best.artworkUrl100),
      catalogSource: 'itunes'
    };
  }
};

export default iTunesProvider;
