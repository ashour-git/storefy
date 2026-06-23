import { withTenant } from '../../../../../db';
import * as schema from '../../../../../db/schema';
import { eq } from 'drizzle-orm';
import { notFound } from 'next/navigation';
import { ThemeRenderer } from '../../../../../components/storefront/ThemeRenderer';
import type { ThemeTokens } from '../../../../../components/storefront/ThemeRenderer';
import { CartProvider } from '../../../../../components/storefront/CartProvider';
import { resolveTenantBySlugOrDomain } from '../../../../../lib/tenancy';
import { getStorefrontCopy } from '../../../../../lib/storefront/copy';
import { getTemplateForVertical } from '../../../../../lib/storefront/templates';

interface SuccessPageProps {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ orderId?: string }>;
}

export default async function SuccessPage({ params, searchParams }: SuccessPageProps) {
  const { slug } = await params;
  const { orderId } = await searchParams;

  const tenant = await resolveTenantBySlugOrDomain(slug);

  if (!tenant) {
    notFound();
  }

  const { themeRecord, order, payment } = await withTenant(tenant.id, async (tx) => {
    const theme = await tx.query.themes.findFirst({
      where: eq(schema.themes.tenantId, tenant.id),
    });

    let orderData = null;
    let paymentData = null;

    if (orderId) {
      orderData = await tx.query.orders.findFirst({
        where: eq(schema.orders.id, orderId),
      }) || null;

      if (orderData) {
        paymentData = await tx.query.payments.findFirst({
          where: eq(schema.payments.orderId, orderId),
        }) || null;
      }
    }

    return { themeRecord: theme, order: orderData, payment: paymentData };
  });

  const tokens = (themeRecord?.tokens || getTemplateForVertical(tenant.category).tokens) as ThemeTokens;
  const locale = tenant.defaultLocale === 'ar' ? 'ar' : 'en';
  const copy = getStorefrontCopy(locale);
  const dir = locale === 'ar' ? 'rtl' : 'ltr';

  const ipaAddress = `${tenant.slug}@instapay`;
  const whatsappNumber = "201012345678";
  
  const orderAmount = order ? order.grandTotal : "0.00";
  const whatsappMsg = locale === "ar"
    ? `مرحباً! أود تأكيد الدفع لطلب رقم ${orderId} بمبلغ ${orderAmount} جنيه مصري.`
    : `Hello! I would like to confirm my payment for Order #${orderId} of amount ${orderAmount} EGP.`;
  const whatsappLink = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(whatsappMsg)}`;

  let paymentType: 'card' | 'wallet' | 'fawry' | 'instapay' | 'cod' | 'unknown' = 'unknown';
  let fawryCode = "";
  
  if (payment) {
    const ref = payment.providerRef || "";
    if (ref.startsWith("instapay_")) {
      paymentType = "instapay";
    } else if (ref.startsWith("fawry_")) {
      paymentType = "fawry";
      fawryCode = ref.replace("fawry_", "");
    } else if (ref.startsWith("wallet_")) {
      paymentType = "wallet";
    } else if (payment.provider === "cod") {
      paymentType = "cod";
    } else if (payment.provider === "paymob") {
      paymentType = "card";
    }
  }

  return (
    <CartProvider>
      <ThemeRenderer tokens={tokens}>
        <div className="store-checkout-page store-shell" dir={dir} lang={locale}>
          <div className="store-success-card" style={{ maxWidth: "600px", margin: "0 auto" }}>
            <div className="store-success-icon">
              OK
            </div>
          
            <h1>{copy.orderReceived}</h1>
            <p>
              {copy.orderThanks} <strong>{tenant.name}</strong>.
            </p>

            {orderId && (
              <div className="store-success-ref">
                <span>{copy.orderRef}</span>
                <strong>{orderId}</strong>
              </div>
            )}

            {orderId && order && (
              <div style={{ width: "100%", marginTop: "24px", display: "grid", gap: "16px" }}>
                {paymentType === "instapay" && (
                  <div style={{ border: "1px solid color-mix(in srgb, var(--store-text) 10%, transparent)", padding: "20px", borderRadius: "16px", textAlign: "start", background: "var(--store-surface)" }}>
                    <h3 style={{ fontWeight: 800, fontSize: "1.05rem", marginBottom: "12px", display: "flex", alignItems: "center", gap: "8px", color: "var(--store-primary)" }}>
                      <span>💸</span>
                      {locale === "ar" ? "تعليمات الدفع عبر إنستاباي" : "InstaPay & Bank Transfer"}
                    </h3>
                    <p style={{ fontSize: "0.85rem", color: "var(--store-muted)", marginBottom: "16px", lineHeight: "1.5" }}>
                      {locale === "ar" 
                        ? "يرجى تحويل المبلغ الإجمالي للطلب وإرسال لقطة شاشة لتأكيد الدفع عبر الواتساب لتفعيل طلبك." 
                        : "Please transfer the total amount and send a payment confirmation screenshot via WhatsApp to process your order."}
                    </p>
                    
                    <div style={{ background: "color-mix(in srgb, var(--store-text) 3%, transparent)", padding: "14px", borderRadius: "12px", display: "grid", gap: "10px", fontSize: "0.85rem", marginBottom: "16px" }}>
                      <div style={{ display: "flex", justifyContent: "space-between" }}>
                        <span style={{ color: "var(--store-muted)" }}>{locale === "ar" ? "عنوان إنستاباي (IPA):" : "InstaPay Address (IPA):"}</span>
                        <strong>{ipaAddress}</strong>
                      </div>
                      <div style={{ display: "flex", justifyContent: "space-between" }}>
                        <span style={{ color: "var(--store-muted)" }}>{locale === "ar" ? "البنك:" : "Bank:"}</span>
                        <strong>{locale === "ar" ? "بنك مصر" : "Banque Misr"}</strong>
                      </div>
                      <div style={{ display: "flex", justifyContent: "space-between" }}>
                        <span style={{ color: "var(--store-muted)" }}>{locale === "ar" ? "رقم الحساب:" : "Account Number:"}</span>
                        <strong>1400010000987654</strong>
                      </div>
                      <div style={{ display: "flex", justifyContent: "space-between" }}>
                        <span style={{ color: "var(--store-muted)" }}>{locale === "ar" ? "اسم الحساب:" : "Account Name:"}</span>
                        <strong>{tenant.name} Store</strong>
                      </div>
                      <div style={{ display: "flex", justifyContent: "space-between", borderTop: "1px solid color-mix(in srgb, var(--store-text) 8%, transparent)", paddingTop: "8px", fontWeight: "bold" }}>
                        <span style={{ color: "var(--store-muted)" }}>{locale === "ar" ? "المبلغ المطلوب:" : "Amount to Pay:"}</span>
                        <span style={{ color: "var(--store-primary)" }}>{orderAmount} EGP</span>
                      </div>
                    </div>

                    <a
                      href={whatsappLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="store-cart-checkout"
                      style={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        gap: "8px",
                        background: "#25D366",
                        color: "#fff",
                        borderColor: "#25D366",
                        padding: "12.5px",
                        borderRadius: "12px",
                        fontSize: "0.9rem",
                        textDecoration: "none",
                        width: "100%",
                        border: "none",
                        cursor: "pointer"
                      }}
                    >
                      <span>💬</span>
                      {locale === "ar" ? "تأكيد الدفع عبر واتساب" : "Confirm Payment on WhatsApp"}
                    </a>
                  </div>
                )}

                {paymentType === "fawry" && (
                  <div style={{ border: "1px solid color-mix(in srgb, var(--store-text) 10%, transparent)", padding: "20px", borderRadius: "16px", textAlign: "start", background: "var(--store-surface)" }}>
                    <h3 style={{ fontWeight: 800, fontSize: "1.05rem", marginBottom: "12px", display: "flex", alignItems: "center", gap: "8px", color: "#FFC107" }}>
                      <span>🏪</span>
                      {locale === "ar" ? "الدفع من خلال فوري" : "Fawry Payment Instructions"}
                    </h3>
                    <p style={{ fontSize: "0.85rem", color: "var(--store-muted)", marginBottom: "16px", lineHeight: "1.5" }}>
                      {locale === "ar"
                        ? "يرجى التوجه لأي منفذ فوري ودفع قيمة الطلب باستخدام كود الدفع التالي:"
                        : "Please visit any Fawry kiosk or outlet and pay using the following reference code:"}
                    </p>

                    <div style={{ background: "color-mix(in srgb, var(--store-text) 3%, transparent)", padding: "14px", borderRadius: "12px", display: "grid", gap: "10px", fontSize: "0.85rem", marginBottom: "16px" }}>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                        <span style={{ color: "var(--store-muted)" }}>{locale === "ar" ? "كود دفع فوري:" : "Fawry Reference Code:"}</span>
                        <strong style={{ fontSize: "1.15rem", letterSpacing: "1px", color: "var(--store-primary)" }}>{fawryCode}</strong>
                      </div>
                      <div style={{ display: "flex", justifyContent: "space-between", borderTop: "1px solid color-mix(in srgb, var(--store-text) 8%, transparent)", paddingTop: "8px", fontWeight: "bold" }}>
                        <span style={{ color: "var(--store-muted)" }}>{locale === "ar" ? "المبلغ المطلوب:" : "Amount to Pay:"}</span>
                        <span style={{ color: "var(--store-primary)" }}>{orderAmount} EGP</span>
                      </div>
                    </div>

                    <div style={{ fontSize: "0.8rem", color: "var(--store-muted)", display: "grid", gap: "8px", lineHeight: "1.4" }}>
                      <div>1. {locale === "ar" ? "توجه إلى أي كشك أو منفذ دفع فوري." : "Visit any merchant outlet or kiosk with Fawry service."}</div>
                      <div>2. {locale === "ar" ? "اختر مدفوعات فوري باي (كود الخدمة 788) أو أخبر التاجر بالدفع لـ Paymob." : "Ask to pay for Fawry Pay (service code 788) or Paymob."}</div>
                      <div>3. {locale === "ar" ? `أدخل كود الدفع الموضح أعلاه: ${fawryCode}` : `Enter the reference code shown above: ${fawryCode}`}</div>
                      <div>4. {locale === "ar" ? "ادفع نقداً واحصل على إيصال الدفع لحفظ حقك." : "Complete the cash payment and keep your payment receipt."}</div>
                    </div>
                  </div>
                )}

                {paymentType === "wallet" && (
                  <div style={{ border: "1px solid color-mix(in srgb, var(--store-text) 10%, transparent)", padding: "20px", borderRadius: "16px", textAlign: "start", background: "var(--store-surface)" }}>
                    <h3 style={{ fontWeight: 800, fontSize: "1.05rem", marginBottom: "12px", display: "flex", alignItems: "center", gap: "8px", color: "var(--store-primary)" }}>
                      <span>📱</span>
                      {locale === "ar" ? "تحويل فودافون كاش / محفظة إلكترونية" : "Vodafone Cash & Mobile Wallet"}
                    </h3>
                    
                    <div>
                      <p style={{ fontSize: "0.85rem", color: "var(--store-muted)", marginBottom: "16px", lineHeight: "1.5" }}>
                        {locale === "ar"
                          ? "يرجى تحويل إجمالي المبلغ إلى رقم المحفظة الإلكترونية أدناه وإرسال لقطة شاشة للتأكيد عبر واتساب:"
                          : "Please transfer the total amount to the wallet number below and send the confirmation screenshot on WhatsApp:"}
                      </p>
                      
                      <div style={{ background: "color-mix(in srgb, var(--store-text) 3%, transparent)", padding: "14px", borderRadius: "12px", display: "grid", gap: "10px", fontSize: "0.85rem", marginBottom: "16px" }}>
                        <div style={{ display: "flex", justifyContent: "space-between" }}>
                          <span style={{ color: "var(--store-muted)" }}>{locale === "ar" ? "رقم المحفظة (فودافون كاش):" : "Wallet Number (Vodafone Cash):"}</span>
                          <strong>01012345678</strong>
                        </div>
                        <div style={{ display: "flex", justifyContent: "space-between", borderTop: "1px solid color-mix(in srgb, var(--store-text) 8%, transparent)", paddingTop: "8px", fontWeight: "bold" }}>
                          <span style={{ color: "var(--store-muted)" }}>{locale === "ar" ? "المبلغ المطلوب:" : "Amount to Pay:"}</span>
                          <span style={{ color: "var(--store-primary)" }}>{orderAmount} EGP</span>
                        </div>
                      </div>

                      <a
                        href={whatsappLink}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="store-cart-checkout"
                        style={{
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          gap: "8px",
                          background: "#25D366",
                          color: "#fff",
                          borderColor: "#25D366",
                          padding: "12.5px",
                          borderRadius: "12px",
                          fontSize: "0.9rem",
                          textDecoration: "none",
                          width: "100%",
                          border: "none",
                          cursor: "pointer"
                        }}
                      >
                        <span>💬</span>
                        {locale === "ar" ? "تأكيد التحويل عبر واتساب" : "Confirm Transfer on WhatsApp"}
                      </a>
                    </div>
                  </div>
                )}

                {paymentType === "card" && (
                  <div style={{ border: "1px solid color-mix(in srgb, var(--store-text) 10%, transparent)", padding: "20px", borderRadius: "16px", textAlign: "start", background: "var(--store-surface)" }}>
                    <h3 style={{ fontWeight: 800, fontSize: "1.05rem", marginBottom: "12px", display: "flex", alignItems: "center", gap: "8px", color: "var(--store-primary)" }}>
                      <span>💳</span>
                      {locale === "ar" ? "الدفع بالبطاقة الائتمانية" : "Credit / Debit Card Payment"}
                    </h3>
                    <p style={{ fontSize: "0.85rem", color: "var(--store-muted)", lineHeight: "1.5" }}>
                      {payment?.status === 'succeeded'
                        ? (locale === "ar" ? "تم دفع قيمة الطلب بنجاح عبر بطاقتك الائتمانية." : "Your payment was successfully completed via Credit/Debit card.")
                        : (locale === "ar" ? "طلبك قيد المراجعة والتحقق من الدفع الإلكتروني." : "Your order is pending validation of online payment.")}
                    </p>
                  </div>
                )}

                {paymentType === "cod" && (
                  <div style={{ border: "1px solid color-mix(in srgb, var(--store-text) 10%, transparent)", padding: "20px", borderRadius: "16px", textAlign: "start", background: "var(--store-surface)" }}>
                    <h3 style={{ fontWeight: 800, fontSize: "1.05rem", marginBottom: "12px", display: "flex", alignItems: "center", gap: "8px", color: "var(--store-primary)" }}>
                      <span>📦</span>
                      {locale === "ar" ? "الدفع عند الاستلام" : "Cash on Delivery"}
                    </h3>
                    <p style={{ fontSize: "0.85rem", color: "var(--store-muted)", lineHeight: "1.5" }}>
                      {locale === "ar"
                        ? `تم تأكيد طلبك بنجاح! يرجى تحضير إجمالي المبلغ ${orderAmount} جنيه مصري للدفع للمندوب عند استلام طلبك.`
                        : `Your order is confirmed successfully! Please prepare the total amount of ${orderAmount} EGP to pay the delivery courier upon receipt.`}
                    </p>
                  </div>
                )}
              </div>
            )}

            <a
              href={`/store/${tenant.slug}`}
              className="store-cart-checkout"
              style={{ marginTop: "24px", display: "block" }}
            >
              {copy.continueShopping}
            </a>
          </div>
        </div>
      </ThemeRenderer>
    </CartProvider>
  );
}
