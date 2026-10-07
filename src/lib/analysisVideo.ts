/**
 * URL for annotated CV output MP4s.
 *
 * In development we always use same-origin `/api/...` so Vite’s proxy serves the file.
 * Using a full `http://localhost:3000/api/...` URL from the Vite app often breaks `<video>`
 * (CORS / cross-origin media loading).
 *
 * In production, use VITE_API_URL when the UI and API are on different origins.
 */
export function buildAnalysisVideoUrl(filename: string): string {
  const raw = String(import.meta.env.VITE_API_URL || '').trim();
  if (!raw) {
    return `/api/ai/analysis-output/${encodeURIComponent(filename)}`;
  }
  const noTrailingSlash = raw.replace(/\/+$/, '');
  const apiBase = /\/api$/i.test(noTrailingSlash) ? noTrailingSlash : `${noTrailingSlash}/api`;
  return `${apiBase}/ai/analysis-output/${encodeURIComponent(filename)}`;
}

export function analysisVideoNeedsCrossOrigin(url: string): boolean {
  return url.startsWith('http');
}
