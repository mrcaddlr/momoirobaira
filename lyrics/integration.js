import { createLyricsManager } from './manager.js';
import { createWordSyncController } from './word-sync-controller.js';
import { createMusixmatchProvider } from './providers/musixmatch.js';
import { createKaradeoProvider } from './providers/karadeo.js';

// Public-client bootstrap. Network/auth functions are injected by the host app,
// so secrets never need to be embedded in the GitHub Pages bundle.
export function createMomoirobaraLyrics({ audio, getLines, getLineElement, onLineChange, musixmatchRequest, karadeoRequest } = {}) {
  const manager = createLyricsManager();
  if (typeof musixmatchRequest === 'function') manager.register(createMusixmatchProvider({ request: musixmatchRequest }));
  if (typeof karadeoRequest === 'function') manager.register(createKaradeoProvider({ request: karadeoRequest }));

  // LRCLIB can be injected by the existing app so this module does not duplicate
  // the current LRCLIB networking implementation.
  const controller = createWordSyncController({
    getAudio: () => audio,
    getLines,
    getLineElement,
    onLineChange,
  });

  return {
    manager,
    controller,
    async resolve(track, options = {}) { return manager.resolve(track, options); },
    start() { controller.start(); },
    stop() { controller.stop(); },
  };
}

export default createMomoirobaraLyrics;
