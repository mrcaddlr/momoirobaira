// Metadata recovery for incomplete local tags.
const clean = value => String(value ?? '').trim();
export function metadataCompleteness(track = {}) { const m=track.metadata||track; const title=clean(m.title||m.trackName||m.name),artist=clean(m.artist||m.artistName),album=clean(m.album||m.albumName),duration=Number(m.duration||m.durationSeconds||0),isrc=clean(m.isrc||m.ISRC); return {title,artist,album,duration:Number.isFinite(duration)?duration:0,isrc,enoughForLyrics:Boolean(title&&artist),enoughForPreciseLookup:Boolean(title&&artist&&duration>0)}; }
export function mergeMetadata(base={},discovered={}) { const out={...base}; for(const [k,v] of Object.entries(discovered||{})) if(v!==undefined&&v!==null&&String(v).trim()!=='') out[k]=v; return out; }
function filenameHints(track={}) { const name=clean(track.fileName||track.name||track.path?.split(/[\\/]/).pop()).replace(/\.[^.]+$/,''); if(!name)return{}; const match=name.match(/^(.+?)\s+[-–—]\s+(.+)$/); return match?{artist:match[1].trim(),title:match[2].trim()}:{title:name}; }
export async function resolveMetadata(track,providers={}) {
  let resolved=mergeMetadata(track.metadata||track,filenameHints(track));
  const initial=metadataCompleteness(resolved), checks=[initial];
  // Never stop merely because title+artist exist. We still need duration/album
  // when possible because lyrics services use those to disambiguate editions.
  const queries=[];
  if(typeof providers.filename==='function')queries.push(()=>providers.filename({...track,metadata:resolved}));
  if(typeof providers.musicbrainz==='function')queries.push(()=>providers.musicbrainz({...track,metadata:resolved}));
  if(typeof providers.catalog==='function')queries.push(()=>providers.catalog({...track,metadata:resolved}));
  for(const query of queries){ try{const found=await query();resolved=mergeMetadata(resolved,found);const check=metadataCompleteness(resolved);checks.push(check);if(check.enoughForPreciseLookup||check.isrc)break;}catch(e){if(e?.name==='AbortError')throw e;} }
  const final=metadataCompleteness(resolved);
  return {...track,metadata:resolved,metadataSource:final.enoughForPreciseLookup?'recovered':initial.enoughForLyrics?'partial+recovered':'partial',metadataCompleteness:final,recoveryAttempts:checks.length-1};
}
export default resolveMetadata;
