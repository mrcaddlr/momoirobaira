const CACHE_KEY = 'momoirobara_lyrics_cache_v6';
const CACHE_TTL = 1000 * 60 * 60 * 24 * 30;

function loadCache() { try { return JSON.parse(localStorage.getItem(CACHE_KEY) || '{}') || {}; } catch { return {}; } }
function saveCache(cache) { try { localStorage.setItem(CACHE_KEY, JSON.stringify(cache)); } catch {} }
function sleep(ms) { return new Promise(resolve => setTimeout(resolve, ms)); }

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
  return words.map(w => ({
    text: String(w.text ?? w.word ?? '').trim(),
    start: Number(w.start ?? (Number(w.start_ms) / 1000)),
    end: Number(w.end ?? (Number(w.end_ms) / 1000)),
    estimated: Boolean(w.estimated)
  })).filter(w => w.text && Number.isFinite(w.start) && Number.isFinite(w.end) && w.end >= w.start);
}

function estimateWords(line) {
  if (line.words?.length || !line.text) return normalizeWords(line.words);
  const start = Number(line.start ?? (Number(line.start_ms) / 1000));
  const end = Number(line.end ?? (Number(line.end_ms) / 1000));
  if (!Number.isFinite(start) || !Number.isFinite(end) || end <= start) return [];
  const tokens = String(line.text).trim().split(/\s+/).filter(Boolean);
  if (!tokens.length) return [];
  const weights = tokens.map(t => Math.max(1, t.replace(/\s/g, '').length));
  const total = weights.reduce((a, b) => a + b, 0);
  let cursor = start;
  return tokens.map((text, i) => {
    const next = i === tokens.length - 1 ? end : cursor + (end - start) * weights[i] / total;
    const word = { text, start: cursor, end: Math.max(cursor, next), estimated: true };
    cursor = next;
    return word;
  });
}

export function normalizeLyrics(payload, source = 'unknown') {
  if (!payload) return null;
  const lines = Array.isArray(payload.lines) ? payload.lines : [];
  const normalizedLines = lines.map(l => {
    const line = {
      text: String(l.text || '').trim(),
      start: Number(l.start ?? (Number(l.start_ms) / 1000)),
      end: Number(l.end ?? (Number(l.end_ms) / 1000)),
      words: normalizeWords(l.words)
    };
    if (!line.words.length) line.words = estimateWords(line);
    return line;
  }).filter(l => l.text || l.words.length);
  if (!normalizedLines.length && !String(payload.plainLyrics || '').trim()) return null;
  const hasTrueWords = normalizedLines.some(l => l.words.some(w => !w.estimated));
  const hasEstimatedWords = normalizedLines.some(l => l.words.some(w => w.estimated));
  return {
    source,
    sourceId: payload.sourceId || null,
    format: normalizedLines.some(l => l.words.length) ? 'word' : normalizedLines.length ? 'line' : 'plain',
    wordTiming: hasTrueWords ? 'native' : hasEstimatedWords ? 'estimated' : 'none',
    fetchedAt: Date.now(),
    lines: normalizedLines,
    plainLyrics: payload.plainLyrics || '',
    lyricsfile: payload.lyricsfile || null,
    rawFormat: payload.rawFormat || null,
    metadata: payload.metadata || null
  };
}

function scoreCandidate(candidate, track = {}) {
  if (!candidate) return -Infinity;
  const m = track.metadata || {};
  const title = String(m.title ?? track.title ?? track.name ?? '').trim().toLowerCase();
  const artist = String(m.artist ?? track.artist ?? track.artistName ?? '').trim().toLowerCase();
  const album = String(m.album ?? track.album ?? '').trim().toLowerCase();
  const duration = Number(m.duration ?? track.duration ?? 0);
  const cm = candidate.metadata || {};
  const cTitle = String(cm.title ?? candidate.title ?? '').trim().toLowerCase();
  const cArtist = String(cm.artist ?? candidate.artist ?? '').trim().toLowerCase();
  const cAlbum = String(cm.album ?? candidate.album ?? '').trim().toLowerCase();
  const cDuration = Number(cm.duration ?? candidate.duration ?? 0);
  let score = 0;
  if (title && cTitle && title === cTitle) score += 40; else if (title && cTitle && (title.includes(cTitle) || cTitle.includes(title))) score += 20;
  if (artist && cArtist && artist === cArtist) score += 40; else if (artist && cArtist && (artist.includes(cArtist) || cArtist.includes(artist))) score += 20;
  if (album && cAlbum && album === cAlbum) score += 15;
  if (duration > 0 && cDuration > 0) { const delta = Math.abs(duration - cDuration); if (delta <= 2) score += 30; else if (delta <= 5) score += 15; }
  if (candidate.isrc && m.isrc && String(candidate.isrc).toUpperCase() === String(m.isrc).toUpperCase()) score += 100;
  if (candidate.lines?.some(l => l.words?.some(w => !w.estimated))) score += 60;
  else if (candidate.lines?.some(l => l.words?.length)) score += 15;
  if (String(candidate.plainLyrics || '').trim()) score += 5;
  return score;
}

function hasUsableResult(result) {
  if (!result) return false;
  if (Array.isArray(result.lines) && result.lines.some(l => l.text || (Array.isArray(l.words) && l.words.length))) return true;
  return Boolean(String(result.plainLyrics || '').trim());
}
function hasWordTiming(result) { return Boolean(result?.lines?.some(l => Array.isArray(l.words) && l.words.some(w => !w.estimated))); }

export function createLyricsManager({ providers = [], cache = loadCache(), delayMs = 300 } = {}) {
  const manager = {
    providers: [],
    register(provider) { if (provider?.id && typeof provider.getLyrics === 'function') manager.providers.push(provider); return manager; },
    getCached(track) { const entry = cache[songIdentity(track)]; if (!entry) return null; if (entry.savedAt && Date.now() - entry.savedAt > CACHE_TTL) return null; return entry.lyrics || entry; },
    cacheLyrics(track, lyrics) { const key = songIdentity(track); if (key && lyrics) { cache[key] = { savedAt: Date.now(), lyrics }; saveCache(cache); } },
    clearCache() { saveCache({}); Object.keys(cache).forEach(k => delete cache[k]); },
    async refresh(track, options = {}) { return manager.resolve(track, { ...options, refresh: true }); },
    async resolve(track, options = {}) {
      if (!options.refresh) { const cached = manager.getCached(track); if (cached) return cached; }
      const candidates = [];
      for (let index = 0; index < manager.providers.length; index++) {
        const provider = manager.providers[index];
        try {
          const result = await provider.getLyrics(track, options);
          if (hasUsableResult(result)) {
            const normalized = normalizeLyrics(result, provider.id);
            if (normalized) {
              normalized.matchScore = scoreCandidate(result, track);
              candidates.push(normalized);
              if (hasWordTiming(normalized) && normalized.matchScore >= 150) break;
            }
          }
        } catch (error) {
          if (error?.name === 'AbortError') throw error;
          console.warn(`[lyrics:${provider.id}]`, error);
          if (error?.retryAfter && index < manager.providers.length - 1) await sleep(Math.min(Number(error.retryAfter) * 1000, 30000));
        }
        if (index < manager.providers.length - 1) await sleep(delayMs);
      }
      if (!candidates.length) return null;
      candidates.sort((a, b) => {
        const nativeDelta = Number(b.wordTiming === 'native') - Number(a.wordTiming === 'native');
        return nativeDelta || (b.matchScore ?? -Infinity) - (a.matchScore ?? -Infinity);
      });
      const best = candidates[0];
      manager.cacheLyrics(track, best);
      return best;
    }
  };
  providers.forEach(p => manager.register(p));
  return manager;
}
export { loadCache, saveCache };
