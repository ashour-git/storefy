/**
 * Paymob Integration Utilities
 * 
 * This module handles server-side communication with Paymob's APIs.
 * It is designed to be easily pluggable with real sandbox/production keys.
 */

const PAYMOB_API_KEY = process.env.PAYMOB_API_KEY || "mock_api_key";
const PAYMOB_INTEGRATION_ID = process.env.PAYMOB_INTEGRATION_ID || "mock_integration_id";

interface PaymobOrderPayload {
  amount_cents: number;
  currency: string;
  merchant_order_id: string;
  items: any[];
}

/**
 * 1. Authenticate with Paymob to get a token.
 * Since we don't have real keys right now, we return a mock token.
 */
export async function authenticatePaymob(): Promise<string> {
  if (PAYMOB_API_KEY === "mock_api_key") {
    return "mock_auth_token_12345";
  }

  // Real implementation:
  const res = await fetch("https://accept.paymob.com/api/auth/tokens", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ api_key: PAYMOB_API_KEY }),
  });

  if (!res.ok) throw new Error("Paymob Authentication Failed");
  const data = await res.json();
  return data.token;
}

/**
 * 2. Create an order registration on Paymob.
 */
export async function createPaymobOrder(authToken: string, payload: PaymobOrderPayload): Promise<string> {
  if (PAYMOB_API_KEY === "mock_api_key") {
    return `mock_order_id_${Date.now()}`;
  }

  // Real implementation:
  const res = await fetch("https://accept.paymob.com/api/ecommerce/orders", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      auth_token: authToken,
      delivery_needed: "false",
      amount_cents: payload.amount_cents,
      currency: payload.currency,
      merchant_order_id: payload.merchant_order_id,
      items: payload.items,
    }),
  });

  if (!res.ok) throw new Error("Paymob Order Creation Failed");
  const data = await res.json();
  return data.id; // Paymob Order ID
}

/**
 * 3. Generate a Payment Key for the iFrame or Intention checkout.
 */
export async function generatePaymentKey(
  authToken: string, 
  orderId: string, 
  amountCents: number, 
  currency: string,
  billingData: any
): Promise<string> {
  if (PAYMOB_API_KEY === "mock_api_key") {
    return "mock_payment_key_abcdef";
  }

  // Real implementation:
  const res = await fetch("https://accept.paymob.com/api/acceptance/payment_keys", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      auth_token: authToken,
      amount_cents: amountCents.toString(),
      expiration: 3600,
      order_id: orderId,
      billing_data: billingData,
      currency: currency,
      integration_id: PAYMOB_INTEGRATION_ID,
    }),
  });

  if (!res.ok) throw new Error("Paymob Payment Key Generation Failed");
  const data = await res.json();
  return data.token; // The payment key used for the iframe
}
