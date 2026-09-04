import { describe, expect, it } from 'vitest';
import { getIdempotencyKey, hashRequest, isUniqueViolation, paginate, parsePagination } from '../contract';
import { uuidFromIdempotencyKey } from '../../checkout';

describe('API contract', () => {
  it('parses pagination with clamps', () => {
    expect(parsePagination('http://x/?page=2&pageSize=10')).toEqual({ page: 2, pageSize: 10 });
    expect(parsePagination('http://x/?page=0&pageSize=500')).toEqual({ page: 1, pageSize: 100 });
    expect(paginate([1, 2], 5, 1, 2).pagination.totalPages).toBe(3);
  });

  it('prefers Idempotency-Key header over body', () => {
    const req = new Request('http://x/', { headers: { 'Idempotency-Key': '123456789012' } });
    expect(getIdempotencyKey(req, 'body-key-123456')).toBe('123456789012');
    expect(getIdempotencyKey(new Request('http://x/'), 'short')).toBeNull();
  });

  it('hashes requests deterministically and detects unique violations', async () => {
    expect(await hashRequest({ a: 1 })).toBe(await hashRequest({ a: 1 }));
    expect(isUniqueViolation(new Error('duplicate key value violates unique constraint'))).toBe(true);
    expect(isUniqueViolation(new Error('nope'))).toBe(false);
  });

  it('derives stable order UUIDs from idempotency keys', () => {
    expect(uuidFromIdempotencyKey('t1', 'key-1234567890')).toBe(uuidFromIdempotencyKey('t1', 'key-1234567890'));
    expect(uuidFromIdempotencyKey('t1', 'key-1234567890')).not.toBe(uuidFromIdempotencyKey('t1', 'other-1234567890'));
  });
});
