export const BACKEND_ORIGIN =
  typeof globalThis !== 'undefined' && typeof API_TARGET !== 'undefined'
    ? API_TARGET
    : '';

export function getBackendAssetUrl(url?: string): string {
  if (!url) return '';
  if (/^https?:\/\//i.test(url)) return url;
  return `${BACKEND_ORIGIN}${url}`;
}
