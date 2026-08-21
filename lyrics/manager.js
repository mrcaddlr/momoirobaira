const CACHE_KEY = 'momoirobara_lyrics_cache_v1';

function loadCache() {
  try { return JSON.parse(localStorage.getItem(CACHE_KEY) || '{}') || {}; }
  catch { return {}; }
}

function saveCache(cache) {
  try { localStorage.setItem(CACHE_KEY, JSON.stringify(cache)); } catch {}
}

export function songIdentity(track = {}) {
  const isrc = track.isrc || track.ISRC || track.metadata?.isrc;
  if (isrc) return `isrc:${String(isrc).trim().toUpperCase()}`;
  const title = String(track.title || track.name || '').trim().toLowerCase();
  const artist = String(track.artist || track.artistName || '').trim().toLowerCase();
  const album = String(track.album || '').trim().toLowerCase();
  const duration = Math.round(Number(track.duration || 0));
  return `meta:${artist}|${title}|${album}|${duration}`;
}

function normalizeWords(words) {
  if (!Array.isArray(words)) return [];
  return words.map(word => ({
    text: String(word.text ?? word.word ?? '').trim(),
    start: Number(word.start),
    end: Number(word.end),
  })).filter(word => word.text && Number.isFinite(word.start) && Number.isFinite(word.end));
}

export function normalizeLyrics(payload, source = 'unknown') {
  if (!payload) return null;
  const lines = Array.isArray(payload.lines) ? payload.lines : [];
  return {
    source,
    format: lines.some(line => normalizeWords(line.words).length) ? 'word' : 'line',
    fetchedAt: Date.now(),
    lines: lines.map(line => ({
      text: String(line.text || '').trim(),
      start: Number(line.start),
      end: Number(line.end),
      words: normalizeWords(line.words),
    })).filter(line => line.text || line.words.length),
  };
}

export function createLyricsManager({ providers = [], cache = loadCache() } = {}) {
  const manager = {
    providers: [],
    register(provider) {
      if (provider?.id && typeof provider.getLyrics === 'function') manager.providers.push(provider);
      return manager;
    },
    getCached(track) { return cache[songIdentity(track)] || null; },
    cacheLyrics(track, lyrics) {
      const key = songIdentity(track);
      if (!key || !lyrics) return;
      cache[key] = lyrics;
      saveCache(cache);
    },
    clearCache() { saveCache({}); Object.keys(cache).forEach(key => delete cache[key]); },
    async resolve(track, options = {}) {
      const cached = manager.getCached(track);
      if (cached && !options.refresh) return cached;
      for (const provider of manager.providers) {
        try {
          const result = await provider.getLyrics(track, options);
          if (result) {
            const normalized = normalizeLyrics(result, provider.id);
            if (normalized) { manager.cacheLyrics(track, normalized); return normalized; }
          }
        } catch (error) {
          console.warn(`[lyrics:${provider.id}]`, error);
        }
      }
      return null;
    },
  };
  providers.forEach(provider => manager.register(provider));
  return manager;
}

export { loadCache, saveCache };
