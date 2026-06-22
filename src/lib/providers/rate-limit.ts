import { Redis } from '@upstash/redis';
import { Ratelimit } from '@upstash/ratelimit';

interface Bucket {
  count: number;
  resetAt: number;
}

export interface RateLimiter {
  check(key: string, limit: number, windowMs: number): Promise<{ allowed: boolean; remaining: number; resetAt: number }>;
}

class InMemoryRateLimiter implements RateLimiter {
  private buckets = new Map<string, Bucket>();

  async check(key: string, limit: number, windowMs: number) {
    const now = Date.now();
    const current = this.buckets.get(key);
    const bucket = !current || current.resetAt <= now ? { count: 0, resetAt: now + windowMs } : current;
    bucket.count += 1;
    this.buckets.set(key, bucket);

    return {
      allowed: bucket.count <= limit,
      remaining: Math.max(0, limit - bucket.count),
      resetAt: bucket.resetAt,
    };
  }
}

class UpstashRateLimiter implements RateLimiter {
  private redis?: Redis;
  private fallback = new InMemoryRateLimiter();

  constructor() {
    if (process.env.UPSTASH_REDIS_URL && process.env.UPSTASH_REDIS_TOKEN) {
      this.redis = new Redis({
        url: process.env.UPSTASH_REDIS_URL,
        token: process.env.UPSTASH_REDIS_TOKEN,
      });
    }
  }

  async check(key: string, limit: number, windowMs: number) {
    if (!this.redis) {
      return this.fallback.check(key, limit, windowMs);
    }

    try {
      const ratelimit = new Ratelimit({
        redis: this.redis,
        limiter: Ratelimit.slidingWindow(limit, `${windowMs} ms`),
        analytics: true,
        prefix: '@climit',
      });

      const { success, remaining, reset } = await ratelimit.limit(key);

      return {
        allowed: success,
        remaining,
        resetAt: reset,
      };
    } catch (error) {
      console.warn('Upstash Rate Limiting failed, falling back to memory:', error);
      return this.fallback.check(key, limit, windowMs);
    }
  }
}

export const rateLimiter: RateLimiter = new UpstashRateLimiter();

