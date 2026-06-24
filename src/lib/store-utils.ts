/**
 * Utility function to dynamically generate storefront URLs.
 * Resolves path-based routing locally for convenience,
 * and subdomain-based routing in production/preview deployments.
 */
function getDefaultHost(): string {
  if (typeof process !== 'undefined' && process.env.NEXT_PUBLIC_APP_URL) {
    return process.env.NEXT_PUBLIC_APP_URL.replace(/^https?:\/\//, '');
  }
  if (typeof window !== 'undefined') {
    return window.location.host;
  }
  return 'localhost:3000';
}

export function getCanonicalHost(): string | undefined {
  if (typeof process !== 'undefined' && process.env.NEXT_PUBLIC_APP_URL) {
    try { return new URL(process.env.NEXT_PUBLIC_APP_URL).host; } catch {}
  }
  return undefined;
}

export function getStoreUrl(slug: string, currentHost?: string, customDomain?: string | null): string {
  const host = currentHost || getDefaultHost();
  
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

