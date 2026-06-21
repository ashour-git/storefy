import { describe, it, expect, vi } from 'vitest';
import { NextRequest, NextResponse } from 'next/server';
import { proxy } from '../proxy';

// Mock NextRequest and NextResponse to verify internal routing behaviour
vi.mock('next/server', async () => {
  const actual = await vi.importActual<typeof import('next/server')>('next/server');
  return {
    ...actual,
    NextResponse: {
      next: vi.fn(() => ({ type: 'next' })),
      rewrite: vi.fn((url) => ({ type: 'rewrite', url: url.toString() })),
    },
  };
});

describe('Tenant Routing Proxy Unit Tests', () => {
  const createRequest = (host: string, pathname: string = '/') => {
    return new NextRequest(new URL(`http://${host}${pathname}`), {
      headers: { host },
    });
  };

  it('should allow static assets to pass through natively', () => {
    const req = createRequest('scent.localhost:3000', '/logo.jpg');
    const res = proxy(req);
    expect(res).toEqual({ type: 'next' });
  });

  it('should allow platform API endpoints to pass through natively', () => {
    const req = createRequest('scent.localhost:3000', '/api/auth/signin');
    const res = proxy(req);
    expect(res).toEqual({ type: 'next' });
  });

  it('should route admin subdomain to the /admin route tree on localhost', () => {
    const req = createRequest('app.localhost:3000', '/dashboard');
    const res = proxy(req) as any;
    expect(res.type).toBe('rewrite');
    expect(res.url).toContain('/admin/dashboard');
  });

  it('should allow the main landing page to render unmodified on localhost', () => {
    const req = createRequest('localhost:3000', '/');
    const res = proxy(req);
    expect(res).toEqual({ type: 'next' });
  });

  it('should route tenant subdomains to /store/[subdomain] dynamic routes on localhost', () => {
    const req = createRequest('perfume.localhost:3000', '/catalog');
    const res = proxy(req) as any;
    expect(res.type).toBe('rewrite');
    expect(res.url).toContain('/store/perfume/catalog');
  });

  it('should allow the main landing page to render unmodified on Vercel production', () => {
    const req = createRequest('perfume-store-green.vercel.app', '/');
    const res = proxy(req);
    expect(res).toEqual({ type: 'next' });
  });

  it('should route admin subdomain to the /admin route tree on Vercel production', () => {
    const req = createRequest('app.perfume-store-green.vercel.app', '/dashboard');
    const res = proxy(req) as any;
    expect(res.type).toBe('rewrite');
    expect(res.url).toContain('/admin/dashboard');
  });

  it('should route tenant subdomains to /store/[subdomain] dynamic routes on Vercel production', () => {
    const req = createRequest('perfume.perfume-store-green.vercel.app', '/catalog');
    const res = proxy(req) as any;
    expect(res.type).toBe('rewrite');
    expect(res.url).toContain('/store/perfume/catalog');
  });

  it('should allow the main landing page to render unmodified on Vercel preview URLs', () => {
    const req = createRequest('perfume-store-hp3j67oih-mohamed-ashours-projects-d6aca12a.vercel.app', '/');
    const res = proxy(req);
    expect(res).toEqual({ type: 'next' });
  });

  it('should route custom domains to /store/[customdomain] using the full hostname', () => {
    const req = createRequest('perfumecenter.eg', '/about-us');
    const res = proxy(req) as any;
    expect(res.type).toBe('rewrite');
    expect(res.url).toContain('/store/perfumecenter.eg/about-us');
  });
});
