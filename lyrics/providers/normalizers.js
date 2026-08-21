import { normalizeProviderResult } from '../enhanced-lrc-normalizer.js';

export function normalizeMusixmatchResponse(data) {
  if (!data) return null;
  if (typeof data === 'string') return normalizeProviderResult({ text: data }, 'musixmatch');
  return normalizeProviderResult(data, 'musixmatch');
}

export function normalizeKaradeoResponse(data) {
  if (!data) return null;
  if (typeof data === 'string') return normalizeProviderResult({ text: data }, 'karadeo');
  return normalizeProviderResult(data, 'karadeo');
}
