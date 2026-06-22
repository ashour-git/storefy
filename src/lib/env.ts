/**
 * Environment Variable Validation
 * Validates critical environment variables at startup.
 */

const REQUIRED_ENV = ['DATABASE_URL', 'BETTER_AUTH_SECRET'];

const OPTIONAL_SCALE_ENV = [
  'GROQ_API_KEY',
  'PAYMOB_API_KEY',
  'PAYMOB_INTEGRATION_ID',
  'PAYMOB_HMAC_SECRET',
  'RESEND_API_KEY',
  'UPSTASH_REDIS_URL',
  'UPSTASH_REDIS_TOKEN',
  'INNGEST_EVENT_KEY',
  'SENTRY_DSN',
  'VERCEL_BLOB_READ_WRITE_TOKEN',
];

export const env = {
  databaseUrl: process.env.DATABASE_URL,
  betterAuthSecret: process.env.BETTER_AUTH_SECRET,
  groqApiKey: process.env.GROQ_API_KEY,
  paymobApiKey: process.env.PAYMOB_API_KEY,
  paymobIntegrationId: process.env.PAYMOB_INTEGRATION_ID,
  paymobHmacSecret: process.env.PAYMOB_HMAC_SECRET,
  paymobIframeId: process.env.NEXT_PUBLIC_PAYMOB_IFRAME_ID,
  nodeEnv: process.env.NODE_ENV || 'development',
};

export function validateEnv() {
  const missingRequired = REQUIRED_ENV.filter(key => !process.env[key]);
  const missingOptional = OPTIONAL_SCALE_ENV.filter(key => !process.env[key]);

  if (missingRequired.length > 0) {
    const errorMsg = `❌ CRITICAL ERROR: Missing required environment variables: ${missingRequired.join(', ')}. The application cannot run without these configuration parameters. Please check your .env file or host provider dashboard.`;
    
    if (process.env.NODE_ENV === 'production') {
      throw new Error(errorMsg);
    } else {
      console.error(errorMsg);
    }
  }

  if (missingOptional.length > 0 && process.env.NODE_ENV !== 'test') {
    console.warn(
      `WARNING: Optional scale providers not configured: ${missingOptional.join(', ')}. Storefy will use free-tier mocks/fallbacks where safe.`
    );
  }
}

// Auto-run validation
validateEnv();
