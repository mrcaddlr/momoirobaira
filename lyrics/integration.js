import { createLyricsManager } from './manager.js';
import { createWordSyncController } from './word-sync-controller.js';
import { defaultLyricsProviders } from './providers/index.js';

export function createMomoirobaraLyrics({ audio, getLines, getLineElement, onLineChange } = {}) {
  const manager = createLyricsManager({ providers: defaultLyricsProviders });
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

function trackFromApp() {
  const songs = Array.isArray(window.momoSongs) ? window.momoSongs : [];
  const index = Number(window.momoCurrentIndex);
  const song = Number.isInteger(index) && index >= 0 ? songs[index] : null;
  if (!song) return null;
  return {
    ...song,
    metadata: {
      title: song.title || song.name || '',
      artist: song.artist || '',
      album: song.album || '',
      duration: Number(song.duration || document.querySelector('#audio')?.duration || 0),
      isrc: song.isrc || song.ISRC || null,
      albumArtist: song.albumArtist || '',
    }
  };
}

function renderLyricsResult(result) {
  const root = document.querySelector('#lyr');
  if (!root) return;
  if (!result?.lines?.length) {
    root.innerHTML = result?.plainLyrics
      ? String(result.plainLyrics).split(/\r?\n/).filter(Boolean).map(text => `<div class="line">${escapeHtml(text)}</div>`).join('')
      : '<div class="empty">No lyrics found.</div>';
    return;
  }

  root.dataset.source = result.source || 'lyrics';
  root.innerHTML = result.lines.map((line, index) => {
    const words = Array.isArray(line.words) && line.words.length
      ? line.words.map(word => `<span class="lyric-word" data-word-start="${Number(word.start) || 0}" data-word-end="${Number(word.end) || Number(word.start) || 0}">${escapeHtml(word.text)}</span>`).join(' ')
      : escapeHtml(line.text || '');
    return `<div class="line" data-i="${index}" data-time="${Number(line.start) || 0}">${words}</div>`;
  }).join('');
}

function escapeHtml(value) {
  return String(value ?? '').replace(/[&<>"']/g, c => ({ '&':'&amp;', '<':'&lt;', '>':'&gt;', '"':'&quot;', "'":'&#39;' }[c]));
}

export async function bootstrapMomoirobaraLyrics() {
  const audio = document.querySelector('#audio');
  if (!audio || window.__momoExperimentalLyrics) return window.__momoExperimentalLyrics || null;

  let result = null;
  let activeTrackKey = '';
  let loading = false;
  let raf = 0;

  const getLines = () => result?.lines || [];
  const getLineElement = index => document.querySelector(`#lyr .line[data-i="${index}"]`);
  const engine = createMomoirobaraLyrics({ audio, getLines, getLineElement });

  function animate() {
    if (!result?.lines?.length) { raf = requestAnimationFrame(animate); return; }
    const time = Number(audio.currentTime || 0);
    const lines = result.lines;
    let index = -1;
    for (let i = 0; i < lines.length; i++) {
      if (Number(lines[i].start) <= time) index = i;
      else break;
    }
    const elements = document.querySelectorAll('#lyr .line');
    elements.forEach((el, i) => {
      const active = i === index;
      el.classList.toggle('active', active);
      el.classList.toggle('near', Math.abs(i - index) <= 2 && !active);
      if (!active) return;
      const line = lines[i];
      const next = Number(lines[i + 1]?.start);
      const end = Number.isFinite(next) ? next : Number(line.end || (line.start + 4));
      const span = Math.max(.05, end - Number(line.start || 0));
      el.style.setProperty('--progress', `${Math.max(0, Math.min(100, (time - line.start) / span * 100))}%`);
      el.querySelectorAll('.lyric-word').forEach(word => {
        const start = Number(word.dataset.wordStart);
        const endWord = Number(word.dataset.wordEnd);
        word.classList.toggle('active-word', time >= start && time < endWord);
      });
      if (active && !el.dataset.momoCentered) {
        el.scrollIntoView({ behavior: 'smooth', block: 'center' });
        el.dataset.momoCentered = '1';
      }
    });
    raf = requestAnimationFrame(animate);
  }

  async function load() {
    if (loading) return;
    const track = trackFromApp();
    if (!track) return;
    const key = `${track.id || ''}|${track.title}|${track.artist}|${Math.round(track.metadata.duration || 0)}`;
    if (key === activeTrackKey) return;
    activeTrackKey = key;
    loading = true;
    result = null;
    document.querySelector('#lyr')?.replaceChildren(Object.assign(document.createElement('div'), { className: 'empty', textContent: 'Looking for lyrics…' }));
    try {
      result = await engine.resolve(track);
      renderLyricsResult(result);
      engine.controller.refresh();
    } catch (error) {
      console.warn('Momoirobara experimental lyrics:', error);
      result = null;
      document.querySelector('#lyr')?.replaceChildren(Object.assign(document.createElement('div'), { className: 'empty', textContent: 'No lyrics found.' }));
    } finally {
      loading = false;
    }
  }

  audio.addEventListener('loadedmetadata', load);
  audio.addEventListener('play', load);
  audio.addEventListener('emptied', () => { activeTrackKey = ''; result = null; });
  document.addEventListener('momo:statechange', () => setTimeout(load, 0));
  window.addEventListener('momo:songchange', () => setTimeout(load, 0));
  animate();
  window.__momoExperimentalLyrics = { engine, reload: () => { activeTrackKey = ''; return load(); }, getResult: () => result };
  setTimeout(load, 500);
  return window.__momoExperimentalLyrics;
}

export default createMomoirobaraLyrics;
