import { betterAuth } from 'better-auth';
import { drizzleAdapter } from '@better-auth/drizzle-adapter';
import { db } from '../db';
import * as schema from '../db/schema';

const secret = process.env.BETTER_AUTH_SECRET;
if (!secret && process.env.NODE_ENV === 'production') {
  throw new Error('BETTER_AUTH_SECRET is required in production');
}

export const auth = betterAuth({
  secret: secret || 'dev_only_placeholder_secret_key_123',
  baseURL: process.env.BETTER_AUTH_URL || 'http://localhost:3000',
  trustedOrigins: [
    process.env.BETTER_AUTH_URL || 'http://localhost:3000',
    'http://localhost:3000',
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
