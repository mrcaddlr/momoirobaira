// Browser-safe duration reader. Uses the audio container itself, not tags, so
// duration remains available when embedded metadata is missing or incorrect.
export function readAudioDuration(file, { timeoutMs = 10000 } = {}) {
  return new Promise((resolve, reject) => {
    if (!file) return reject(new Error('No audio file supplied'));
    const url = URL.createObjectURL(file);
    const audio = document.createElement('audio');
    let settled = false;
    const finish = (error, value) => {
      if (settled) return;
      settled = true;
      clearTimeout(timer);
      audio.removeAttribute('src');
      audio.load();
      URL.revokeObjectURL(url);
      error ? reject(error) : resolve(value);
    };
    const timer = setTimeout(() => finish(new Error('Timed out reading audio duration')), timeoutMs);
    audio.preload = 'metadata';
    audio.addEventListener('loadedmetadata', () => {
      const duration = Number(audio.duration);
      if (Number.isFinite(duration) && duration > 0) finish(null, duration);
      else finish(new Error('Audio duration is unavailable'));
    }, { once: true });
    audio.addEventListener('error', () => finish(new Error('Unable to read audio metadata')), { once: true });
    audio.src = url;
  });
}

export async function enrichDuration(track = {}) {
  if (Number(track?.metadata?.duration ?? track?.duration) > 0) return track;
  if (!track.file && !track.blob) return track;
  const duration = await readAudioDuration(track.file || track.blob);
  return {
    ...track,
    duration,
    metadata: { ...(track.metadata || {}), duration }
  };
}

export default readAudioDuration;
