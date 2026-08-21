import { resolveMetadata } from './metadata-resolver.js';
import musicBrainzProvider from './providers/musicbrainz.js';
import iTunesProvider from './providers/itunes.js';

// Resolve identity before lyrics providers are queried.
export async function resolveTrackForLyrics(track, options = {}) {
  const providers = {
    filename: async current => {
      const m = current.metadata || {};
      if (m.title && m.artist) return {};
      const name = String(current.fileName || current.name || current.path || '').split(/[\\/]/).pop().replace(/\.[^.]+$/, '');
      const normalized = name.replace(/[_.]+/g, ' ').replace(/\s+/g, ' ').trim();
      const match = normalized.match(/^(.+?)\s+[-–—]\s+(.+)$/);
      return match ? { artist: match[1].trim(), title: match[2].trim() } : (normalized ? { title: normalized } : {});
    },
    musicbrainz: current => musicBrainzProvider.resolve(current, options),
    catalog: current => iTunesProvider.resolve(current, options),
  };
  return resolveMetadata(track, providers);
}

export default resolveTrackForLyrics;
