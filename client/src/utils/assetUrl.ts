/**
 * Dynamic Asset URL Versioning Helper
 * Appends the build version to static/dynamic asset URLs to guarantee cache-busting on CDNs and GitHub Pages.
 */
export function withVersion(path: string): string {
  if (!path) return '';
  const version = typeof __APP_VERSION__ !== 'undefined' ? __APP_VERSION__ : 'dev';
  const delimiter = path.includes('?') ? '&' : '?';
  return `${path}${delimiter}v=${encodeURIComponent(version)}`;
}
