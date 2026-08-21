import { parseLyricsfile, hasWordTiming } from './lyricsfile.js';
import { normalizeLyrics } from './manager.js';

const wait = ms => new Promise(resolve => setTimeout(resolve, ms));

function text(v) { return String(v ?? '').trim(); }
function durationOf(track) {
  const m = track?.metadata || {};
  return Number(m.duration ?? track?.duration ?? 0);
}
function identity(track) {
  const m = track?.metadata || {};
  return {
    title: text(m.title ?? track?.title ?? track?.name),
    artist: text(m.artist ?? track?.artist ?? track?.artistName),
    album: text(m.album ?? track?.album),
    duration: durationOf(track),
    isrc: text(m.isrc ?? track?.isrc ?? m.ISRC ?? track?.ISRC).toUpperCase()
  };
}
function cleanTitle(v) { return text(v).toLowerCase().replace(/\([^)]*\)|\[[^\]]*\]/g, '').replace(/\s+/g, ' ').trim(); }
function similarity(a, b) {
  a = cleanTitle(a); b = cleanTitle(b);
  if (!a || !b) return 0;
  if (a === b) return 1;
  if (a.includes(b) || b.includes(a)) return 0.88;
  const aa = new Set(a.split(/\s+/)), bb = new Set(b.split(/\s+/));
  const intersection = [...aa].filter(x => bb.has(x)).length;
  return intersection / Math.max(aa.size, bb.size);
}
function scoreCandidate(track, candidate) {
  const t = identity(track);
  const c = identity({ metadata: candidate });
  let score = 0;
  if (t.isrc && c.isrc && t.isrc === c.isrc) score += 100;
  score += similarity(t.title, c.title) * 40;
  score += similarity(t.artist, c.artist) * 40;
  if (t.album && c.album) score += similarity(t.album, c.album) * 15;
  if (t.duration > 0 && c.duration > 0) {
    const delta = Math.abs(t.duration - c.duration);
    if (delta <= 2) score += 30;
    else if (delta <= 5) score += 15;
  }
  return score;
}

export function parseProviderPayload(payload, source = 'unknown') {
  if (!payload) return null;
  if (typeof payload === 'string') {
    const parsed = parseLyricsfile(payload);
    if (parsed) return normalizeLyrics({ ...parsed, lines: parsed.lines, plainLyrics: parsed.plain }, source);
    return null;
  }
  if (payload.lyricsfile) {
    const parsed = parseLyricsfile(payload.lyricsfile);
    if (parsed && hasWordTiming(parsed)) return normalizeLyrics({ ...parsed, lines: parsed.lines, plainLyrics: parsed.plain }, source);
    if (parsed) return normalizeLyrics({ ...parsed, lines: parsed.lines, plainLyrics: parsed.plain }, source);
  }
  if (payload.syncedLyrics) {
    const lines = parseEnhancedLrc(payload.syncedLyrics);
    return normalizeLyrics({ lines, plainLyrics: payload.plainLyrics || '' }, source);
  }
  if (Array.isArray(payload.lines)) return normalizeLyrics(payload, source);
  if (payload.plainLyrics) return normalizeLyrics({ lines: [{ text: payload.plainLyrics, start: 0, end: 0, words: [] }], plainLyrics: payload.plainLyrics }, source);
  return null;
}

function parseEnhancedLrc(lrc = '') {
  const out = [];
  for (const raw of String(lrc).split(/\r?\n/)) {
    const lm = raw.match(/^\[(\d+):(\d+(?:\.\d+)?)\]\s*(.*)$/);
    if (!lm) continue;
    const start = Number(lm[1]) * 60 + Number(lm[2]);
    const body = lm[3] || '';
    const words = [];
    const re = /<(?:(\d+):(\d+(?:\.\d+)?))>([^<]*)/g;
    let m;
    while ((m = re.exec(body))) words.push({ text: m[3], start: Number(m[1]) * 60 + Number(m[2]), end: null });
    for (let i = 0; i < words.length; i++) words[i].end = words[i + 1]?.start ?? start + 5;
    out.push({ text: words.length ? words.map(w => w.text).join('').trim() : body.trim(), start, end: null, words });
  }
  for (let i = 0; i < out.length; i++) out[i].end = out[i + 1]?.start ?? out[i].start + 5;
  return out;
}

export function createProviderEngine({ providers = [], delayMs = 300 } = {}) {
  return {
    async resolve(track, options = {}) {
      const candidates = [];
      for (const provider of providers) {
        try {
          const raw = await provider.fetch(track, options);
          const parsed = parseProviderPayload(raw, provider.id);
          if (!parsed) { await wait(delayMs); continue; }
          const meta = raw?.metadata || raw || {};
          let score = scoreCandidate(track, meta);
          if (parsed.format === 'word') score += 50;
          if (parsed.lines.length) score += 5;
          candidates.push({ ...parsed, score });
          if (parsed.format === 'word' && score >= 120 && !options.collectAll) break;
        } catch (error) {
          console.warn(`[lyrics-provider:${provider.id}]`, error);
        }
        await wait(delayMs);
      }
      candidates.sort((a, b) => b.score - a.score);
      return candidates[0] || null;
    }
  };
}

export { scoreCandidate, identity };
