import { resolveMetadata } from './metadata-resolver.js';
import musicBrainzProvider from './providers/musicbrainz.js';

// Resolves the best available identity before lyrics providers are queried.
export async function resolveTrackForLyrics(track, options = {}) {
  const providers = {
    filename: async current => {
      const m = current.metadata || {};
      if (m.title && m.artist) return {};
      const name = String(current.fileName || current.name || '').split(/[\\/]/).pop().replace(/\.[^.]+$/, '');
      const match = name.match(/^(.+?)\s+-\s+(.+)$/);
      return match ? { artist: match[1].trim(), title: match[2].trim() } : { title: name.trim() };
    },
    musicbrainz: current => musicBrainzProvider.resolve(current, options),
  };
  return resolveMetadata(track, providers);
}

export default resolveTrackForLyrics;
