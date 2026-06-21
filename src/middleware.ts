import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(req: NextRequest) {
  const url = req.nextUrl.clone();
  const hostname = req.headers.get('host') || '';

  // Exclude static assets, Next.js internal paths, and API routes
  if (
    url.pathname.startsWith('/_next') ||
    url.pathname.startsWith('/api') ||
    url.pathname.startsWith('/favicon.ico') ||
    url.pathname.includes('.')
  ) {
    return NextResponse.next();
  }

  const isLocal = hostname.includes('localhost');
  // Define platform main domain (e.g. localhost:3000 in dev, storefy.com in prod)
  const mainDomain = isLocal ? 'localhost:3000' : 'storefy.com';

  // 1. Admin Application (app.storefy.com or app.localhost:3000)
  if (hostname === `app.${mainDomain}`) {
    url.pathname = `/admin${url.pathname}`;
    return NextResponse.rewrite(url);
  }

  // 2. Marketing Landing Page (storefy.com or localhost:3000)
  if (hostname === mainDomain) {
    return NextResponse.next();
  }

  // 3. Multi-Tenant Storefront (Subdomain or Custom Domain)
  let slug = '';
  if (hostname.endsWith(`.${mainDomain}`)) {
    // Subdomain: e.g., scent.localhost:3000 -> slug = "scent"
    slug = hostname.replace(`.${mainDomain}`, '');
  } else {
    // Custom domain: e.g., scent-store.com -> slug = "scent-store.com"
    slug = hostname;
  }

  // Rewrite internally to /store/[slug]/[...path]
  url.pathname = `/store/${slug}${url.pathname}`;
  return NextResponse.rewrite(url);
}
