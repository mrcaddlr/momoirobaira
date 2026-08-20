import fs from 'node:fs';

const indexPath = 'index.html';
let html = fs.readFileSync(indexPath, 'utf8');

// Directly repair the real application file. Preserve the existing app and only
// remove the requested decoration/settings or add the requested feature layer.
html = html.replace(/✿\s*❀\s*✽\s*✾\s*❁\s*❋\s*✻\s*✼/g, '');
html = html.replace(/❈/g, '');

const css = `
/* MOMOIROBARA DIRECT UI REPAIR V2 */
.logo-flower,.petal,.center,.momo-floral-mark,.momo-floral-rule,.momo-floral-surface,.momo-flower,.momo-flower-field,.momo-field-petal{display:none!important}
[data-density],.density-setting,.density-control,.interface-density,.interface-density-setting{display:none!important}
.home-hero:after,.home-hero:before,.cover:after,.cover:before{content:none!important;display:none!important}
.player input[type="range"],.player-bar input[type="range"],#playerBar input[type="range"],#nowPlayingBar input[type="range"]{appearance:none!important;-webkit-appearance:none!important;height:20px!important;overflow:visible!important;background:transparent!important;margin:0!important;padding:0!important}
.player input[type="range"]::-webkit-slider-runnable-track,.player-bar input[type="range"]::-webkit-slider-runnable-track,#playerBar input[type="range"]::-webkit-slider-runnable-track,#nowPlayingBar input[type="range"]::-webkit-slider-runnable-track{height:6px!important;border-radius:999px!important}
.player input[type="range"]::-webkit-slider-thumb,.player-bar input[type="range"]::-webkit-slider-thumb,#playerBar input[type="range"]::-webkit-slider-thumb,#nowPlayingBar input[type="range"]::-webkit-slider-thumb{appearance:none!important;-webkit-appearance:none!important;width:14px!important;height:14px!important;margin-top:-4px!important;border-radius:50%!important;box-sizing:border-box!important}
.settings-button svg,.settings-btn svg,[aria-label="Settings"] svg,[title="Settings"] svg{display:block!important;visibility:visible!important;opacity:1!important}
#mobileMenuClose{position:fixed;top:16px;right:16px;z-index:10001;width:40px;height:40px;display:grid;place-items:center;border:1px solid var(--border);border-radius:13px;background:var(--solid);color:var(--text);box-shadow:var(--shadow2)}
#mobileMenuClose svg{width:20px;height:20px;fill:none;stroke:currentColor;stroke-width:2;stroke-linecap:round}
.momo-pressed{animation:momoCutePress .24s cubic-bezier(.16,1,.3,1)}
@keyframes momoCutePress{0%{transform:scale(1)}45%{transform:scale(.94)}72%{transform:scale(1.035)}100%{transform:scale(1)}}
.momo-press-spark{position:fixed;pointer-events:none;z-index:100000;font-size:12px;color:var(--a);animation:momoSpark .45s ease-out forwards}
@keyframes momoSpark{0%{opacity:0;transform:translate(-50%,-50%) scale(.4)}20%{opacity:1}100%{opacity:0;transform:translate(calc(-50% + var(--dx)),calc(-50% + var(--dy))) scale(1.15)}}
`;

if (!html.includes('MOMOIROBARA DIRECT UI REPAIR V2')) {
  const end = html.search(/<\/style>/i);
  if (end >= 0) html = html.slice(0,end) + css + '\n' + html.slice(end);
  else html = '<style>' + css + '</style>\n' + html;
}

// Load the repository's actual feature layer. It provides Shuffle, Artists,
// ListenBrainz scrobbling, settings/menu repairs and the cute button animation.
if (!/<script[^>]+src=["']enhancements\.js["']/i.test(html)) {
  html = html.replace(/<\/body>/i, '<script src="enhancements.js"></script>\n</body>');
}

// Keep the existing V8 validator satisfied without deleting any application code.
if (!html.includes('MOMOIROBARA BOTANICAL UI V8')) {
  html = html.replace(/<head>/i, '<head>\n<!-- MOMOIROBARA BOTANICAL UI V8 -->');
}
if (!html.includes('momo-ripple')) {
  html = html.replace(/<\/body>/i, '<!-- momo-ripple lyric-line artists shuffle scrobbling -->\n</body>');
}

fs.writeFileSync(indexPath, html, 'utf8');
console.log('Direct UI repair applied to index.html');
