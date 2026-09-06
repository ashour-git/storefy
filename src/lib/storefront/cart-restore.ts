import { createHmac, timingSafeEqual } from 'node:crypto';

export const RESTORE_TOKEN_TTL_MS = 7 * 24 * 60 * 60 * 1000;

export interface RestoreTokenIds {
  cartId: string;
  tenantId: string;
}

function b64urlEncode(obj: object): string {
  return Buffer.from(JSON.stringify(obj)).toString('base64url');
}

function b64urlDecode<T>(raw: string): T | null {
  try {
    return JSON.parse(Buffer.from(raw, 'base64url').toString('utf8')) as T;
  } catch {
    return null;
  }
}

function signature(payload: string, secret: string): string {
  return createHmac('sha256', secret).update(payload).digest('hex');
}

export function signRestoreToken(ids: RestoreTokenIds, secret: string, ttlMs = RESTORE_TOKEN_TTL_MS): string {
  const payload = b64urlEncode({ ...ids, exp: Date.now() + ttlMs });
  return `${payload}.${signature(payload, secret)}`;
}

export function verifyRestoreToken(token: string, secret: string): RestoreTokenIds | null {
  if (!token || !secret) return null;
  const dot = token.lastIndexOf('.');
  if (dot <= 0) return null;
  const payload = token.slice(0, dot);
  const sig = token.slice(dot + 1);
  const expected = signature(payload, secret);
  if (sig.length !== expected.length) return null;
  try {
    if (!timingSafeEqual(Buffer.from(sig), Buffer.from(expected))) return null;
  } catch {
    return null;
  }
  const data = b64urlDecode<{ cartId?: unknown; tenantId?: unknown; exp?: unknown }>(payload);
  if (!data || typeof data.cartId !== 'string' || typeof data.tenantId !== 'string') return null;
  if (typeof data.exp !== 'number' || data.exp <= Date.now()) return null;
  return { cartId: data.cartId, tenantId: data.tenantId };
}
