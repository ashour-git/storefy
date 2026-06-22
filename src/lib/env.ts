/**
 * Environment Variable Validation
 * Validates critical environment variables at startup.
 */

const REQUIRED_ENV = [
  'DATABASE_URL',
  'BETTER_AUTH_SECRET',
];

const RECOMMENDED_ENV = [
  'GROQ_API_KEY',
  'PAYMOB_API_KEY',
  'PAYMOB_INTEGRATION_ID',
  'PAYMOB_HMAC_SECRET',
];

export function validateEnv() {
  const missingRequired = REQUIRED_ENV.filter(key => !process.env[key]);
  const missingRecommended = RECOMMENDED_ENV.filter(key => !process.env[key]);

  if (missingRequired.length > 0) {
    const errorMsg = `❌ CRITICAL ERROR: Missing required environment variables: ${missingRequired.join(', ')}. The application cannot run without these configuration parameters. Please check your .env file or host provider dashboard.`;
    
    if (process.env.NODE_ENV === 'production') {
      throw new Error(errorMsg);
    } else {
      console.error(errorMsg);
    }
  }

  if (missingRecommended.length > 0) {
    console.warn(
      `⚠️ WARNING: Missing recommended environment variables: ${missingRecommended.join(', ')}. Some features like Paymob checkouts or AI description generation may run in mock-only mode.`
    );
  }
}

// Auto-run validation
validateEnv();
