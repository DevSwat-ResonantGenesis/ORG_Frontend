import { getApiUrl } from './apiUrl';

/**
 * Tools like finalize_audio_podcast return a raw `/agents/audio/{session_id}`
 * path in agent text output. nginx only proxies specific prefixes to the
 * backend (/api/v1/, /api/, /auth/, etc.) — a bare /agents/* request falls
 * through to the SPA's index.html fallback instead of reaching the API, so
 * it must be rewritten under /api/v1 (the same prefix every other agent API
 * call in this app already uses) before it's usable as a real URL.
 */
const AGENT_AUDIO_PATH_REGEX = /\/agents\/audio\/([0-9a-fA-F-]{36})/g;

export const extractAgentAudioUrls = (text: string | undefined | null): string[] => {
  if (!text) return [];
  const urls = new Set<string>();
  for (const match of text.matchAll(AGENT_AUDIO_PATH_REGEX)) {
    urls.add(`${getApiUrl()}/api/v1${match[0]}`);
  }
  return Array.from(urls);
};
