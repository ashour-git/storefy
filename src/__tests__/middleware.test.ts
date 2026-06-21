import { describe, it, expect, vi } from 'vitest';
import { NextRequest, NextResponse } from 'next/server';
import { middleware } from '../middleware';

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

describe('Tenant Routing Middleware Unit Tests', () => {
  const createRequest = (host: string, pathname: string = '/') => {
    return new NextRequest(new URL(`http://${host}${pathname}`), {
      headers: { host },
    });
  };

  it('should allow static assets to pass through natively', () => {
    const req = createRequest('scent.localhost:3000', '/logo.jpg');
    const res = middleware(req);
    expect(res).toEqual({ type: 'next' });
  });

  it('should allow platform API endpoints to pass through natively', () => {
    const req = createRequest('scent.localhost:3000', '/api/auth/signin');
    const res = middleware(req);
    expect(res).toEqual({ type: 'next' });
  });

  it('should route admin subdomain to the /admin route tree', () => {
    const req = createRequest('app.localhost:3000', '/dashboard');
    const res = middleware(req) as any;
    expect(res.type).toBe('rewrite');
    expect(res.url).toContain('/admin/dashboard');
  });

  it('should allow the main landing page to render unmodified', () => {
    const req = createRequest('localhost:3000', '/');
    const res = middleware(req);
    expect(res).toEqual({ type: 'next' });
  });

  it('should route tenant subdomains to /store/[subdomain] dynamic routes', () => {
    const req = createRequest('perfume.localhost:3000', '/catalog');
    const res = middleware(req) as any;
    expect(res.type).toBe('rewrite');
    expect(res.url).toContain('/store/perfume/catalog');
  });

  it('should route custom domains to /store/[customdomain] using the full hostname', () => {
    const req = createRequest('perfumecenter.eg', '/about-us');
    const res = middleware(req) as any;
    expect(res.type).toBe('rewrite');
    expect(res.url).toContain('/store/perfumecenter.eg/about-us');
  });
});
