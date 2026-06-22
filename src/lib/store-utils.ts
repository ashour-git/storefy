/**
 * Utility function to dynamically generate storefront URLs.
 * Resolves path-based routing locally for convenience,
 * and subdomain-based routing in production/preview deployments.
 */
export function getStoreUrl(slug: string, currentHost?: string): string {
  // Determine hostname dynamically on the client, or use parameter/fallback
  const host = currentHost || (typeof window !== 'undefined' ? window.location.host : 'localhost:3000');
  
  const isLocal = host.includes('localhost');
  if (isLocal) {
    // In local development, return path-based URL to ensure it works without DNS setup
    return `http://localhost:3000/store/${slug}`;
  }

  // Strip port if present
  const hostNameOnly = host.split(':')[0];

  // Strip app. prefix if present
  let baseDomain = hostNameOnly;
  if (hostNameOnly.startsWith('app.')) {
    baseDomain = hostNameOnly.substring(4);
  }

  return `https://${slug}.${baseDomain}`;
}
