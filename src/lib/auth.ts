import { betterAuth } from 'better-auth';
import { pgAdapter } from 'better-auth/adapters/postgres';
import postgres from 'postgres';

const dbClient = postgres(process.env.DATABASE_URL!);

export const auth = betterAuth({
  database: pgAdapter(dbClient, {
    schema: {
      user: {
        tableName: 'platform_users',
        fields: {
          email: 'email',
          name: 'name',
          emailVerified: 'email_verified',
          image: 'image',
          createdAt: 'created_at',
          updatedAt: 'updated_at',
        },
      },
      session: {
        tableName: 'sessions',
        fields: {
          expiresAt: 'expires_at',
          token: 'token',
          ipAddress: 'ip_address',
          userAgent: 'user_agent',
          userId: 'user_id',
          createdAt: 'created_at',
          updatedAt: 'updated_at',
        },
      },
      account: {
        tableName: 'accounts',
        fields: {
          accountId: 'account_id',
          providerId: 'provider_id',
          userId: 'user_id',
          accessToken: 'access_token',
          refreshToken: 'refresh_token',
          idToken: 'id_token',
          accessTokenExpiresAt: 'access_token_expires_at',
          refreshTokenExpiresAt: 'refresh_token_expires_at',
          scope: 'scope',
          password: 'password',
          createdAt: 'created_at',
          updatedAt: 'updated_at',
        },
      },
      verification: {
        tableName: 'verifications',
        fields: {
          identifier: 'identifier',
          value: 'value',
          expiresAt: 'expires_at',
          createdAt: 'created_at',
          updatedAt: 'updated_at',
        },
      },
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
