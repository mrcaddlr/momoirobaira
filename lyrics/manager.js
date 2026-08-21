const CACHE_KEY = 'momoirobara_lyrics_cache_v2';

function loadCache() {
  try { return JSON.parse(localStorage.getItem(CACHE_KEY) || '{}') || {}; }
  catch { return {}; }
}
function saveCache(cache) { try { localStorage.setItem(CACHE_KEY, JSON.stringify(cache)); } catch {} }

export function songIdentity(track = {}) {
  const m = track.metadata || {};
  const isrc = String(m.isrc ?? track.isrc ?? m.ISRC ?? track.ISRC ?? '').trim().toUpperCase();
  if (isrc) return `isrc:${isrc}`;
  const title = String(m.title ?? track.title ?? track.name ?? '').trim().toLowerCase();
  const artist = String(m.artist ?? track.artist ?? track.artistName ?? '').trim().toLowerCase();
  const album = String(m.album ?? track.album ?? '').trim().toLowerCase();
  const duration = Math.round(Number(m.duration ?? track.duration ?? 0));
  return `meta:${artist}|${title}|${album}|${duration}`;
}

function normalizeWords(words) {
  if (!Array.isArray(words)) return [];
  return words.map(w => ({ text: String(w.text ?? w.word ?? '').trim(), start: Number(w.start), end: Number(w.end) }))
    .filter(w => w.text && Number.isFinite(w.start) && Number.isFinite(w.end));
}

export function normalizeLyrics(payload, source = 'unknown') {
  if (!payload) return null;
  const lines = Array.isArray(payload.lines) ? payload.lines : [];
  return {
    source, sourceId: payload.sourceId || null,
    format: lines.some(l => normalizeWords(l.words).length) ? 'word' : 'line',
    fetchedAt: Date.now(),
    lines: lines.map(l => ({ text: String(l.text || '').trim(), start: Number(l.start), end: Number(l.end), words: normalizeWords(l.words) }))
      .filter(l => l.text || l.words.length),
    plainLyrics: payload.plainLyrics || ''
  };
}

export function createLyricsManager({ providers = [], cache = loadCache() } = {}) {
  const manager = {
    providers: [],
    register(provider) { if (provider?.id && typeof provider.getLyrics === 'function') manager.providers.push(provider); return manager; },
    getCached(track) { return cache[songIdentity(track)] || null; },
    cacheLyrics(track, lyrics) { const key = songIdentity(track); if (key && lyrics) { cache[key] = lyrics; saveCache(cache); } },
    clearCache() { saveCache({}); Object.keys(cache).forEach(k => delete cache[k]); },
    async resolve(track, options = {}) {
      if (!options.refresh) { const cached = manager.getCached(track); if (cached) return cached; }
      for (const provider of manager.providers) {
        try {
          const result = await provider.getLyrics(track, options);
          const normalized = normalizeLyrics(result, provider.id);
          if (normalized) { manager.cacheLyrics(track, normalized); return normalized; }
        } catch (error) { console.warn(`[lyrics:${provider.id}]`, error); }
      }
      return null;
    }
  };
  providers.forEach(p => manager.register(p));
  return manager;
}
export { loadCache, saveCache };
