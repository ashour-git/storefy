import crypto from 'crypto';
import { env } from '../env';

export type PaymentMethod = 'card' | 'wallet' | 'fawry' | 'instapay' | 'cod' | 'online';
export type PaymentProviderName = 'paymob' | 'cod';
export type PaymentStatus = 'initiated' | 'succeeded' | 'failed' | 'refunded';

export interface PaymentIntentInput {
  orderId: string;
  amount: string;
  amountCents: number;
  currency: string;
  idempotencyKey: string;
  paymentMethod?: PaymentMethod;
  paymobSettings?: {
    sandboxReady?: boolean;
    integrationId?: string;
    iframeId?: string;
  };
  customer: {
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    street: string;
    city: string;
  };
  items: Array<{
    name: string;
    amountCents: number;
    quantity: number;
  }>;
}

export interface PaymentIntentResult {
  provider: PaymentProviderName;
  providerRef: string | null;
  status: PaymentStatus;
  redirectUrl: string | null;
  paymentKey?: string;
}

export interface PaymentProvider {
  createIntent(input: PaymentIntentInput): Promise<PaymentIntentResult>;
  verifyWebhook?(requestUrl: string, payload: unknown): boolean;
}

class MockOnlinePaymentProvider implements PaymentProvider {
  async createIntent(input: PaymentIntentInput): Promise<PaymentIntentResult> {
    if (input.paymentMethod === 'fawry') {
      return {
        provider: 'paymob',
        providerRef: `fawry_${Math.floor(1000000000 + Math.random() * 9000000000)}`,
        status: 'initiated',
        redirectUrl: null,
      };
    }
    if (input.paymentMethod === 'wallet') {
      return {
        provider: 'paymob',
        providerRef: `wallet_${input.orderId}`,
        status: 'initiated',
        redirectUrl: null,
      };
    }
    return {
      provider: 'paymob',
      providerRef: `mock_${input.orderId}`,
      status: 'succeeded',
      redirectUrl: null,
      paymentKey: 'mock_paid',
    };
  }
}

class CodPaymentProvider implements PaymentProvider {
  async createIntent(input: PaymentIntentInput): Promise<PaymentIntentResult> {
    return {
      provider: 'cod',
      providerRef: `cod_${input.orderId}`,
      status: 'initiated',
      redirectUrl: null,
    };
  }
}

class InstaPayPaymentProvider implements PaymentProvider {
  async createIntent(input: PaymentIntentInput): Promise<PaymentIntentResult> {
    return {
      provider: 'cod', // Stored under 'cod' in db due to strict enum checks
      providerRef: `instapay_${input.orderId}`,
      status: 'initiated',
      redirectUrl: null,
    };
  }
}

class PaymobPaymentProvider implements PaymentProvider {
  private mock = new MockOnlinePaymentProvider();

  async createIntent(input: PaymentIntentInput): Promise<PaymentIntentResult> {
    let integrationId = input.paymobSettings?.integrationId || env.paymobIntegrationId;

    if (input.paymentMethod === 'wallet') {
      integrationId = env.paymobWalletIntegrationId || integrationId;
    } else if (input.paymentMethod === 'fawry') {
      integrationId = env.paymobFawryIntegrationId || integrationId;
    }

    const iframeId = input.paymobSettings?.iframeId || env.paymobIframeId;

    if (!env.paymobApiKey || !integrationId) {
      return this.mock.createIntent(input);
    }

    // Paymob Intention API is the target production path
    const response = await fetch('https://accept.paymob.com/v1/intention/', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Token ${env.paymobApiKey}`,
      },
      body: JSON.stringify({
        amount: input.amountCents,
        currency: input.currency,
        payment_methods: [Number(integrationId)],
        merchant_order_id: input.orderId,
        items: input.items.map((item) => ({
          name: item.name,
          amount: item.amountCents,
          quantity: item.quantity,
        })),
        billing_data: {
          first_name: input.customer.firstName,
          last_name: input.customer.lastName,
          email: input.customer.email,
          phone_number: input.customer.phone,
          street: input.customer.street,
          city: input.customer.city,
          country: 'EG',
        },
        extras: {
          idempotency_key: input.idempotencyKey,
        },
      }),
    });

    if (!response.ok) {
      throw new Error('Paymob intention creation failed');
    }

    const data = await response.json() as { id?: string | number; client_secret?: string; payment_keys?: Array<{ key?: string; iframe_id?: number | string }> };
    const paymentKey = data.payment_keys?.[0]?.key || data.client_secret || '';
    const resolvedIframeId = data.payment_keys?.[0]?.iframe_id || iframeId;

    return {
      provider: 'paymob',
      providerRef: data.id ? String(data.id) : input.orderId,
      status: 'initiated',
      paymentKey,
      redirectUrl: resolvedIframeId && paymentKey ? `https://accept.paymob.com/api/acceptance/iframes/${resolvedIframeId}?payment_token=${paymentKey}` : null,
    };
  }

  verifyWebhook(requestUrl: string): boolean {
    if (!env.paymobHmacSecret) return env.nodeEnv !== 'production';
    const url = new URL(requestUrl);
    const hmac = url.searchParams.get('hmac') || '';
    const keys = [
      'amount_cents', 'created_at', 'currency', 'error_occured',
      'has_parent_transaction', 'id', 'integration_id', 'is_3d_secure',
      'is_auth', 'is_capture', 'is_refunded', 'is_standalone_payment',
      'is_voided', 'order', 'owner', 'pending', 'source_data.pan',
      'source_data.sub_type', 'source_data.type', 'success',
    ];
    const hmacString = keys.map((key) => url.searchParams.get(key) || '').join('');
    const calculated = crypto.createHmac('sha512', env.paymobHmacSecret).update(hmacString).digest('hex');
    return crypto.timingSafeEqual(Buffer.from(calculated), Buffer.from(hmac));
  }
}

export function getPaymentProvider(method: PaymentMethod): PaymentProvider {
  if (method === 'cod') return new CodPaymentProvider();
  if (method === 'instapay') return new InstaPayPaymentProvider();
  return new PaymobPaymentProvider();
}
