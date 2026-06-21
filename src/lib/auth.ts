import { betterAuth } from 'better-auth';
import { drizzleAdapter } from '@better-auth/drizzle-adapter';
import { db } from '../db';
import * as schema from '../db/schema';

export const auth = betterAuth({
  secret: process.env.BETTER_AUTH_SECRET || 'placeholder_secret_key_for_build_safety_123',
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
