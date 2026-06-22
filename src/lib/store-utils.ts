/**
 * Utility function to dynamically generate storefront URLs.
 * Resolves path-based routing locally for convenience,
 * and subdomain-based routing in production/preview deployments.
 */
export function getStoreUrl(slug: string, currentHost?: string, customDomain?: string | null): string {
  // Determine hostname dynamically on the client, or use parameter/fallback
  const host = currentHost || (typeof window !== 'undefined' ? window.location.host : 'localhost:3000');
  
  const isLocal = host.includes('localhost');
  if (isLocal) {
    // In local development, return path-based URL to ensure it works without DNS setup
    return `http://localhost:3000/store/${slug}`;
  }

  // If there's a custom domain, use it directly (in production)
  if (customDomain) {
    const cleanDomain = customDomain.replace(/^(https?:\/\/)?(www\.)?/, '');
    return `https://${cleanDomain}`;
  }

  // Strip port if present
  const hostNameOnly = host.split(':')[0];

  // Strip app. prefix if present
  let baseDomain = hostNameOnly;
  if (hostNameOnly.startsWith('app.')) {
    baseDomain = hostNameOnly.substring(4);
  }

  // Vercel deployment domains (like *.vercel.app) do not support wildcard subdomains dynamically.
  // Use path-based routing instead for preview/production system domains.
  if (baseDomain.endsWith('.vercel.app')) {
    return `https://${baseDomain}/store/${slug}`;
  }

  return `https://${slug}.${baseDomain}`;
}

