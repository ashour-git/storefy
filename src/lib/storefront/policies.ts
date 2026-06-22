import type { Locale } from '../i18n';

export type StorePolicyType = 'shipping' | 'returns' | 'privacy' | 'contact';

export const policyTypes: StorePolicyType[] = ['shipping', 'returns', 'privacy', 'contact'];

export function getPolicyContent(type: StorePolicyType, locale: Locale, storeName: string) {
  const content = {
    shipping: {
      en: {
        title: 'Shipping Policy',
        body: `${storeName} confirms delivery availability, timing, and fees after checkout. Local delivery options may vary by city and order size. Customers can choose cash on delivery when enabled by the store.`,
      },
      ar: {
        title: 'سياسة الشحن',
        body: `يقوم متجر ${storeName} بتأكيد توفر التوصيل والمدة والتكلفة بعد إتمام الطلب. قد تختلف خيارات التوصيل حسب المدينة وحجم الطلب. يمكن للعملاء اختيار الدفع عند الاستلام عند تفعيله من المتجر.`,
      },
    },
    returns: {
      en: {
        title: 'Returns and Exchanges',
        body: `${storeName} reviews return and exchange requests according to product condition, order timing, and merchant policy. Contact the store as soon as possible if there is an issue with your order.`,
      },
      ar: {
        title: 'الاسترجاع والاستبدال',
        body: `يراجع متجر ${storeName} طلبات الاسترجاع والاستبدال حسب حالة المنتج ووقت الطلب وسياسة المتجر. تواصل مع المتجر في أقرب وقت إذا واجهت مشكلة في طلبك.`,
      },
    },
    privacy: {
      en: {
        title: 'Privacy Policy',
        body: `${storeName} uses customer contact and order details only to process orders, communicate about fulfillment, and improve the shopping experience.`,
      },
      ar: {
        title: 'سياسة الخصوصية',
        body: `يستخدم متجر ${storeName} بيانات التواصل والطلبات فقط لمعالجة الطلبات والتواصل بخصوص التنفيذ وتحسين تجربة التسوق.`,
      },
    },
    contact: {
      en: {
        title: 'Contact the Store',
        body: `For product questions, order updates, custom requests, or delivery details, contact ${storeName} through the available store channels.`,
      },
      ar: {
        title: 'تواصل مع المتجر',
        body: `لأسئلة المنتجات أو تحديثات الطلبات أو الطلبات الخاصة أو تفاصيل التوصيل، تواصل مع متجر ${storeName} من خلال قنوات التواصل المتاحة.`,
      },
    },
  } satisfies Record<StorePolicyType, Record<Locale, { title: string; body: string }>>;

  return content[type][locale];
}
