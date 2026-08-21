import { lyricsPlusProvider } from './lyricsplus.js';
import { lrclibProvider } from './lrclib.js';
import { lrcMuxProvider } from './lrcmux.js';

// Free-first provider order. Musixmatch is intentionally not included.
export const defaultLyricsProviders = [
  lyricsPlusProvider,
  lrclibProvider,
  lrcMuxProvider
];

export { lyricsPlusProvider, lrclibProvider, lrcMuxProvider };
