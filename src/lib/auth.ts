import { betterAuth } from 'better-auth';
import { drizzleAdapter } from '@better-auth/drizzle-adapter';
import { db } from '../db';
import * as schema from '../db/schema';

const secret = process.env.BETTER_AUTH_SECRET;
if (!secret) {
  console.warn('⚠️ BETTER_AUTH_SECRET is missing. Authentication will fail in production if this is not set.');
}

// Intercept and remove the local environment variable if deployed on Vercel.
// This prevents BetterAuth's internal logic from mistakenly using localhost.
if (process.env.VERCEL && process.env.BETTER_AUTH_URL?.includes('localhost')) {
  delete process.env.BETTER_AUTH_URL;
}

// Helper to get the correct URL based on Vercel environment variables
function getBaseUrl() {
  // If explicitly set to a production domain, use it.
  // We ignore localhost if we detect Vercel environment variables to prevent the "Invalid origin" error.
  if (process.env.BETTER_AUTH_URL && !process.env.BETTER_AUTH_URL.includes('localhost')) {
    return process.env.BETTER_AUTH_URL;
  }
  
  if (process.env.VERCEL_PROJECT_PRODUCTION_URL) {
    return `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`;
  }

  if (process.env.VERCEL_URL) {
    return `https://${process.env.VERCEL_URL}`;
  }

  return process.env.BETTER_AUTH_URL || 'http://localhost:3000';
}

const baseUrl = getBaseUrl();

export const auth = betterAuth({
  secret: secret || 'dev_only_placeholder_secret_key_123',
  trustedOrigins: [
    baseUrl,
    'http://localhost:3000',
    'https://*.vercel.app' // Trust all Vercel dynamic branch aliases and preview URLs!
  ].filter(Boolean),
  database: drizzleAdapter(db, {
    provider: 'pg',
    schema: {
      user: schema.platformUsers,
      session: schema.sessions,
      account: schema.accounts,
      verification: schema.verifications,
    },
  }),
  advanced: {
    database: {
      generateId: 'uuid',
    },
  },
  emailAndPassword: {
    enabled: true,
  },
});
