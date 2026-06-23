import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization)
     * - favicon.ico, sitemap.xml, robots.txt
     */
    '/((?!api|_next/static|_next/image|favicon.ico|sitemap.xml|robots.txt).*)',
  ],
};

export function proxy(req: NextRequest) {
  const url = req.nextUrl.clone();
  const hostname = req.headers.get('x-forwarded-host') || req.headers.get('host') || '';

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
  
  // Dynamically resolve the platform's main domain
  let mainDomain = 'storefy.com';
  if (isLocal) {
    mainDomain = 'localhost:3000';
  } else if (process.env.NEXT_PUBLIC_APP_URL) {
    try {
      mainDomain = new URL(process.env.NEXT_PUBLIC_APP_URL).host;
    } catch (e) {
      // Fallback
    }
  } else if (hostname.endsWith('.vercel.app')) {
    // Handle Vercel deployments (production or preview branch domains)
    const parts = hostname.split('.');
    if (parts.length > 3) {
      // e.g. app.perfume-store-green.vercel.app -> mainDomain is perfume-store-green.vercel.app
      mainDomain = parts.slice(1).join('.');
    } else {
      // e.g. perfume-store-green.vercel.app -> mainDomain is perfume-store-green.vercel.app
      mainDomain = hostname;
    }
  }

  // 1. Admin Application (app.storefy.com, app.localhost:3000, or app.perfume-store-green.vercel.app)
  if (hostname === `app.${mainDomain}`) {
    url.pathname = `/admin${url.pathname}`;
    return NextResponse.rewrite(url);
  }

  // 2. Marketing Landing Page (storefy.com, localhost:3000, or perfume-store-green.vercel.app)
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
