import { parseLyricsfile, hasWordTiming } from '../lyricsfile.js';

const LRCLIB_API = 'https://lrclib.net/api/get';
const LRCLIB_SEARCH = 'https://lrclib.net/api/search';

function parseEnhancedLrc(lrc = '') {
  const lines = [];
  const lineRe = /^\s*\[(\d{1,3}):(\d{2})(?:\.(\d{1,3}))?\]\s*(.*)$/;
  const wordRe = /<(?:(\d{1,3}):(\d{2})(?:\.(\d{1,3}))?|([\d.]+))>([^<]*)/g;
  const fraction = value => Number((value || '').padEnd(3, '0')) / 1000;
  for (const raw of String(lrc).split(/\r?\n/)) {
    const match = raw.match(lineRe); if (!match) continue;
    const start = Number(match[1]) * 60 + Number(match[2]) + fraction(match[3]);
    const body = match[4] || '', words = []; let word;
    wordRe.lastIndex = 0;
    while ((word = wordRe.exec(body))) {
      const wordStart = word[4] != null ? Number(word[4]) : Number(word[1]) * 60 + Number(word[2]) + fraction(word[3]);
      if (Number.isFinite(wordStart)) words.push({ text: word[5], start: wordStart, end: wordStart });
    }
    lines.push({ text: body.replace(/<[^>]+>/g, '').trim(), start, end: start, words });
  }
  lines.sort((a, b) => a.start - b.start);
  for (let i = 0; i < lines.length; i++) {
    lines[i].end = lines[i + 1]?.start ?? lines[i].start + 8;
    for (let j = 0; j < lines[i].words.length; j++) lines[i].words[j].end = lines[i].words[j + 1]?.start ?? lines[i].end;
  }
  return lines;
}

function trackMeta(track = {}) {
  const m = track.metadata || {};
  return { title:String(m.title ?? track.title ?? track.name ?? '').trim(), artist:String(m.artist ?? track.artist ?? track.artistName ?? '').trim(), album:String(m.album ?? track.album ?? '').trim(), duration:Number(m.duration ?? track.duration ?? 0) };
}
function convert(data, meta) {
  let lyricsfileData = null, lyricsfile = null;
  if (data.lyricsfile) { try { lyricsfile = String(data.lyricsfile); lyricsfileData = parseLyricsfile(lyricsfile); } catch (e) { console.warn('[lyrics:lrclib] Lyricsfile parse failed', e); } }
  const fileHasTiming = hasWordTiming(lyricsfileData) || Boolean(lyricsfileData?.lines?.length);
  const lines = fileHasTiming ? lyricsfileData.lines.map(line => ({text:line.text,start:line.start,end:line.end,words:line.words||[]})) : parseEnhancedLrc(data.syncedLyrics || '');
  return { lines, plainLyrics:data.plainLyrics || lyricsfileData?.plain || '', sourceId:data.id||null, format:lines.some(line=>line.words?.length)?'word':(lines.length?'line':'plain'), lyricsfile, rawFormat:fileHasTiming?'lyricsfile':'enhanced-lrc', metadata:{title:data.trackName||data.name||meta.title,artist:data.artistName||meta.artist,album:data.albumName||meta.album,duration:data.duration||meta.duration} };
}

export const lrclibProvider = {
  id:'lrclib',
  async getLyrics(track, options = {}) {
    const meta = trackMeta(track); if (!meta.title || !meta.artist) return null;
    const headers = {'X-User-Agent':'Momoirobara/experimental (https://github.com/mrcaddlr/momoirobara)'};
    const params = new URLSearchParams({track_name:meta.title,artist_name:meta.artist});
    if(meta.album)params.set('album_name',meta.album); if(meta.duration>0)params.set('duration',String(Math.round(meta.duration)));
    let response = await fetch(`${LRCLIB_API}?${params}`,{headers,signal:options.signal});
    if(response.status===429){const e=new Error('LRCLIB rate limited');e.retryAfter=Math.max(1,Number(response.headers.get('Retry-After')||1));throw e;}
    if(response.ok)return convert(await response.json(),meta);
    if(response.status!==404)throw new Error(`LRCLIB HTTP ${response.status}`);

    // Signature lookup can miss alternate album/edition metadata. Fall back to
    // LRCLIB's search endpoint, then choose the closest duration/title/artist match.
    const q = new URLSearchParams({track_name:meta.title,artist_name:meta.artist});
    const searchResponse = await fetch(`${LRCLIB_SEARCH}?${q}`,{headers,signal:options.signal});
    if(searchResponse.status===429){const e=new Error('LRCLIB rate limited');e.retryAfter=Math.max(1,Number(searchResponse.headers.get('Retry-After')||1));throw e;}
    if(!searchResponse.ok)return null;
    const results = await searchResponse.json();
    if(!Array.isArray(results)||!results.length)return null;
    const norm=s=>String(s||'').trim().toLowerCase();
    const candidates=results.filter(x=>!x.instrumental && (norm(x.trackName)===norm(meta.title)||norm(x.name)===norm(meta.title)) && norm(x.artistName)===norm(meta.artist));
    const pool=candidates.length?candidates:results;
    pool.sort((a,b)=>{
      const da=meta.duration>0&&Number(a.duration)>0?Math.abs(Number(a.duration)-meta.duration):9999;
      const db=meta.duration>0&&Number(b.duration)>0?Math.abs(Number(b.duration)-meta.duration):9999;
      const sa=(a.lyricsfile?2:0)+(a.syncedLyrics?1:0), sb=(b.lyricsfile?2:0)+(b.syncedLyrics?1:0);
      return da-db||sb-sa;
    });
    return convert(pool[0],meta);
  }
};
export {parseEnhancedLrc};
export default lrclibProvider;
