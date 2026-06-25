"use client";

import React, { useState } from "react";
import { useCart } from "./CartProvider";
import { useRouter } from "next/navigation";
import type { Locale } from "../../lib/i18n";
import { getStorefrontCopy } from "../../lib/storefront/copy";

import { DynamicIcon } from "../IconLibrary";

interface CheckoutFormProps {
  tenant: {
    name: string;
    slug: string;
    defaultLocale: string;
  };
}

const EGYPTIAN_GOVERNORATES = [
  { value: "cairo", en: "Cairo", ar: "القاهرة" },
  { value: "giza", en: "Giza", ar: "الجيزة" },
  { value: "alexandria", en: "Alexandria", ar: "الإسكندرية" },
  { value: "qalyubia", en: "Qalyubia", ar: "القليوبية" },
  { value: "sharqia", en: "Sharqia", ar: "الشرقية" },
  { value: "dakahlia", en: "Dakahlia", ar: "الدقهلية" },
  { value: "gharbia", en: "Gharbia", ar: "الغربية" },
  { value: "monufia", en: "Monufia", ar: "المنوفية" },
  { value: "beheira", en: "Beheira", ar: "البحيرة" },
  { value: "kafr-el-sheikh", en: "Kafr El Sheikh", ar: "كفر الشيخ" },
  { value: "damietta", en: "Damietta", ar: "دمياط" },
  { value: "port-said", en: "Port Said", ar: "بورسعيد" },
  { value: "suez", en: "Suez", ar: "السويس" },
  { value: "north-sinai", en: "North Sinai", ar: "شمال سيناء" },
  { value: "south-sinai", en: "South Sinai", ar: "جنوب سيناء" },
  { value: "beni-suef", en: "Beni Suef", ar: "بني سويف" },
  { value: "fayoum", en: "Fayoum", ar: "الفيوم" },
  { value: "minya", en: "Minya", ar: "المنيا" },
  { value: "assiut", en: "Assiut", ar: "أسيوط" },
  { value: "sohag", en: "Sohag", ar: "سوهاج" },
  { value: "qena", en: "Qena", ar: "قنا" },
  { value: "luxor", en: "Luxor", ar: "الأقصر" },
  { value: "aswan", en: "Aswan", ar: "أسوان" },
  { value: "red-sea", en: "Red Sea", ar: "البحر الأحمر" },
  { value: "new-valley", en: "New Valley", ar: "الوادي الجديد" },
  { value: "matrouh", en: "Matrouh", ar: "مطروح" },
  { value: "ismailia", en: "Ismailia", ar: "الإسماعيلية" },
] as const;

const GOVERNORATE_DISTRICTS: Record<string, string[]> = {
  cairo: ["Maadi", "Heliopolis", "Nasr City", "Downtown", "Zamalek", "Garden City", "Shubra", "Ain Shams", "El Marg", "New Cairo", "Fifth Settlement", "Tagamoa", "El Rehab", "Dar El Salam", "Bulaq", "Imbaba", "Kit Kat", "Mohandessin", "Dokki", "Agouza"],
  giza: ["Dokki", "Mohandessin", "Haram", "Sixth October", "Faisal", "Omraneya", "Bolak Dakrour", "Aguza", "Sheikh Zayed", "New Zayed", "Sphinx", "Hadayek El Ahram", "10th of Ramadan"],
  alexandria: ["Manshia", "Roushdy", "Sidi Gaber", "Montaza", "El Mex", "Borg El Arab", "Smouha", "Kafr Abdo", "Mandara", "Bolkly", "El Max", "El Hadayek", "Glim"],
  qalyubia: ["Banha", "Shubra El Kheima", "Qalyub", "Kafr Shukr", "Toukh", "El Khanka", "Birqash", "Obour", "Mostorod"],
  sharqia: ["Zagazig", "10th of Ramadan", "Bilbeis", "Mansoura", "Dekernes", "Awlad Thaker", "Minya El Qamh", "El Qanayat"],
  dakahlia: ["Mansoura", "Talkha", "Mit Ghamr", "Dakahlia", "Belqas", "Shebin El Kom", "Agami", "New Mansoura"],
  gharbia: ["Tanta", "El Mahalla El Kubra", "Samanoud", "Kafr El Zayat", "Basyoun", "Zefta"],
  monufia: ["Shibin El Kom", "Menouf", "Bagour", "Sers El Lyan", "Ashmoun", "Tala", "Quesna"],
  beheira: ["Damanhour", "Rashid", "Kafr El Dawwar", "Edco", "Abu Homs", "El Delengat", "Itay El Barud"],
  "kafr-el-sheikh": ["Kafr El Sheikh", "Damanhour", "Ras El Bar", "Baltim", "Fuwwah", "Desouk", "Biyala"],
  damietta: ["Damietta", "New Damietta", "Ras El Bar", "Zarqa", "El Sirgaya", "El Rawda"],
  "port-said": ["Port Said", "El Manakh", "El Sharq", "El Zohur", "Port Fouad"],
  suez: ["Suez", "Ain Sokhna", "El Arbaeen", "Ganayen"],
  "north-sinai": ["El Arish", "Sheikh Zuweid", "Rafah", "Bir El Abd", "El Hasana"],
  "south-sinai": ["El Tor", "Nuweiba", "Dahab", "Sharm El Sheikh", "Taba", "Saint Catherine"],
  "beni-suef": ["Beni Suef", "Nasser", "El Wasta", "Beba", "Fashn", "Somasta", "Ahnasia"],
  fayoum: ["Fayoum", "Ipsis", "Tamiya", "Sinnuris", "Yousef El Seddik", "Atsa", "Abshway"],
  minya: ["Minya", "Mallawi", "Samalut", "Beni Mazar", "Maghagha", "Abu Haggag", "Delinja"],
  assiut: ["Assiut", "Manfalut", "El Ghanaim", "Tahta", "Badr", "El Qusiya", "Abnoub", "Sahel Selim"],
  sohag: ["Sohag", "Gerga", "Tima", "Juhayna", "El Balyana", "Arish", "Tahta", "Dar El Salam"],
  qena: ["Qena", "Luxor", "Nag Hammadi", "Qus", "Deshna", "El Tahta", "Farshout"],
  luxor: ["Luxor", "Esna", "Armant", "El Tod", "Nag El Ghusuna"],
  aswan: ["Aswan", "Kom Ombo", "Edfu", "Daraw", "Kalabsha", "Naser", "Abu Simbel"],
  "red-sea": ["Hurghada", "Safaga", "Marsa Alam", "El Gouna", "El Quseer", "Berenice"],
  "new-valley": ["Kharga", "Dakhla", "Farafra", "Balat"],
  matrouh: ["Matrouh", "El Alamein", "Sidi Barrani", "Mersa Matruh", "Borg El Arab"],
  ismailia: ["Ismailia", "El Qantara", "Sered", "Fayed", "Tell El Kebir"],
};

export function CheckoutForm({ tenant }: CheckoutFormProps) {
  const router = useRouter();
  const { items, totalAmount, clearCart } = useCart();
  const locale: Locale = tenant.defaultLocale === "ar" ? "ar" : "en";
  const copy = getStorefrontCopy(locale);

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [street, setStreet] = useState("");
  const [building, setBuilding] = useState("");
  const [governorate, setGovernorate] = useState("");
  const [city, setCity] = useState("");
  const [paymentMethod, setPaymentMethod] = useState<"card" | "wallet" | "fawry" | "instapay" | "cod">("cod");
  const [discountCode, setDiscountCode] = useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (items.length === 0) {
      setError("Your cart is empty.");
      return;
    }
    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          storeSlug: tenant.slug,
          idempotencyKey: crypto.randomUUID(),
          paymentMethod,
          discountCode: discountCode.trim() || undefined,
          items: items.map(item => ({
            productId: item.productId,
            quantity: item.quantity,
          })),
          customerDetails: {
            firstName,
            lastName,
            email: email || undefined,
            phone,
            street,
            building,
            governorate,
            city,
          },
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        setError(data.error || "Checkout failed");
        setLoading(false);
        return;
      }

      const data = await res.json();
      const { redirectUrl, orderId } = data;

      // Clear cart
      clearCart();

      if (redirectUrl) window.location.href = redirectUrl;
      else router.push(`/store/${tenant.slug}/checkout/success?orderId=${orderId}`);
    } catch {
      setError("An error occurred during checkout. Please try again.");
      setLoading(false);
    }
  };

  if (items.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <div className="mb-6" style={{ color: 'var(--store-primary)' }}>
          <DynamicIcon name="cart" size={64} />
        </div>
        <h2 className="text-2xl font-bold mb-2">{copy.emptyCart}</h2>
        <p style={{ color: 'var(--store-muted)', maxWidth: 360, marginBottom: 24 }}>{copy.emptyCartBody}</p>
        <a 
          href={`/store/${tenant.slug}`} 
          className="inline-flex items-center justify-center px-6 py-3 rounded-xl bg-[var(--store-primary)] text-white font-bold text-center shadow-md hover:brightness-110 transition-all text-decoration-none cursor-pointer"
        >
          {copy.backToShop}
        </a>
      </div>
    );
  }

  return (
    <div className="store-checkout-grid">
      <div className="store-checkout-card store-checkout-form-card">
        <h2>{copy.billingTitle}</h2>
        
        {error && (
          <div className="store-checkout-error">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="store-checkout-form">
          <div className="store-checkout-two-col">
            <div className="store-form-field">
              <label>{copy.firstName}</label>
              <input
                type="text"
                required
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                placeholder={locale === "ar" ? "مثال: علي" : "e.g. Aly"}
                className="store-input"
              />
            </div>
            <div className="store-form-field">
              <label>{copy.lastName}</label>
              <input
                type="text"
                required
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                placeholder={locale === "ar" ? "مثال: صبري" : "e.g. Sabry"}
                className="store-input"
              />
            </div>
          </div>

          <div className="store-form-field">
            <label>{copy.phone} <span style={{ color: "var(--store-muted)", fontSize: "0.8em" }}>({locale === "ar" ? "مطلوب" : "required"})</span></label>
            <input
              type="tel"
              required
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder={locale === "ar" ? "مثال: 0100 123 4567" : "e.g. 0100 123 4567"}
              className="store-input"
              dir="ltr"
              style={{ textAlign: "start" }}
            />
          </div>

          <div className="store-form-field">
            <label>{copy.email} <span style={{ color: "var(--store-muted)", fontSize: "0.8em" }}>({locale === "ar" ? "اختياري" : "optional"})</span></label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="e.g. aly@domain.com"
              className="store-input"
            />
          </div>

          <div className="store-form-field">
            <label>{locale === "ar" ? "العنوان بالتفصيل" : "Street Address"}</label>
            <input
              type="text"
              required
              value={street}
              onChange={(e) => setStreet(e.target.value)}
              placeholder={locale === "ar" ? "مثال: ١٥ شارع الجزيرة" : "e.g. 15 El-Gezira Street"}
              className="store-input"
            />
          </div>

          <div className="store-checkout-two-col">
            <div className="store-form-field">
              <label>{locale === "ar" ? "العمارة / الدور / الشقة" : "Building / Floor / Apt"}</label>
              <input
                type="text"
                value={building}
                onChange={(e) => setBuilding(e.target.value)}
                placeholder={locale === "ar" ? "عمارة ٥، دور ٣، شقة ٧" : "Bldg 5, Floor 3, Apt 7"}
                className="store-input"
              />
            </div>
            <div className="store-form-field">
              <label>{locale === "ar" ? "علامة مميزة" : "Landmark"}</label>
              <input
                type="text"
                placeholder={locale === "ar" ? "بجانب صيدلية Алекс" : "Near Alex Pharmacy"}
                className="store-input"
              />
            </div>
          </div>

          <div className="store-checkout-two-col">
            <div className="store-form-field">
              <label>{locale === "ar" ? "المحافظة" : "Governorate"}</label>
              <select
                required
                value={governorate}
                onChange={(e) => { setGovernorate(e.target.value); setCity(""); }}
                className="store-input"
              >
                <option value="">{locale === "ar" ? "اختر المحافظة" : "Select governorate"}</option>
                {EGYPTIAN_GOVERNORATES.map((g) => (
                  <option key={g.value} value={g.value}>{locale === "ar" ? g.ar : g.en}</option>
                ))}
              </select>
            </div>
            <div className="store-form-field">
              <label>{locale === "ar" ? "المنطقة / المدينة" : "District / City"}</label>
              <input
                type="text"
                required
                value={city}
                onChange={(e) => setCity(e.target.value)}
                placeholder={locale === "ar" ? "مثال: المعادي" : "e.g. Maadi"}
                className="store-input"
                list="city-districts"
              />
              {governorate && GOVERNORATE_DISTRICTS[governorate] && (
                <datalist id="city-districts">
                  {GOVERNORATE_DISTRICTS[governorate].map((d) => (
                    <option key={d} value={d} />
                  ))}
                </datalist>
              )}
            </div>
          </div>

          <div className="store-form-field">
            <label>{copy.paymentMethod}</label>
            <div className="store-payment-grid" style={{ gridTemplateColumns: "1fr", gap: "12px" }}>
              {[
                {
                  id: "card" as const,
                  icon: "💳",
                  title: locale === "ar" ? "بطاقة الائتمان / الخصم" : "Credit / Debit Card",
                  desc: locale === "ar" ? "ادفع بأمان عبر الفيزا أو الماستركارد" : "Pay securely via Visa or Mastercard",
                },
                {
                  id: "wallet" as const,
                  icon: "📱",
                  title: locale === "ar" ? "فودافون كاش والمحافظ الإلكترونية" : "Vodafone Cash & Mobile Wallets",
                  desc: locale === "ar" ? "فودافون كاش، اتصالات كاش، أورنج كاش أو أي محفظة" : "Vodafone Cash, Orange, Etisalat or any mobile wallet",
                },
                {
                  id: "fawry" as const,
                  icon: "🏪",
                  title: locale === "ar" ? "الدفع من خلال فوري" : "Fawry Pay",
                  desc: locale === "ar" ? "ادفع نقداً في أي منفذ أو كشك فوري" : "Pay with cash at any Fawry outlet / kiosk",
                },
                {
                  id: "instapay" as const,
                  icon: "💸",
                  title: locale === "ar" ? "إنستاباي / تحويل بنكي" : "InstaPay & Bank Transfer",
                  desc: locale === "ar" ? "تحويل فوري عبر تطبيق إنستاباي أو حساب بنك مصر" : "Transfer instantly via InstaPay app or Bank account",
                },
                {
                  id: "cod" as const,
                  icon: "📦",
                  title: locale === "ar" ? "الدفع عند الاستلام" : "Cash on Delivery (COD)",
                  desc: locale === "ar" ? "ادفع نقداً للمندوب عند استلام طلبك" : "Pay in cash upon receiving your order",
                },
              ].map((method) => {
                const isActive = paymentMethod === method.id;
                return (
                  <button
                    key={method.id}
                    type="button"
                    onClick={() => setPaymentMethod(method.id)}
                    className={`store-payment-card ${isActive ? "active" : ""}`}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "16px",
                      padding: "16px 20px",
                      width: "100%",
                      transition: "all 0.2s ease",
                    }}
                  >
                    <span style={{ fontSize: "28px", display: "inline-flex", alignItems: "center" }}>
                      {method.icon}
                    </span>
                    <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: "2px", textAlign: "inherit" }}>
                      <span style={{ fontSize: "0.95rem", fontWeight: "700" }}>{method.title}</span>
                      <small style={{ color: "var(--store-muted)", fontSize: "0.78rem", fontWeight: "normal" }}>{method.desc}</small>
                    </div>
                    <div
                      style={{
                        width: "20px",
                        height: "20px",
                        borderRadius: "50%",
                        border: isActive ? "6px solid var(--store-primary)" : "2px solid color-mix(in srgb, var(--store-text) 20%, transparent)",
                        backgroundColor: isActive ? "var(--store-surface)" : "transparent",
                        transition: "all 0.2s ease",
                        flexShrink: 0,
                      }}
                    />
                  </button>
                );
              })}
            </div>
          </div>

          <div className="store-form-field">
            <label>{locale === "ar" ? "كود الخصم" : "Discount code"}</label>
            <input
              type="text"
              value={discountCode}
              onChange={(event) => setDiscountCode(event.target.value.toUpperCase())}
              placeholder={locale === "ar" ? "مثال: LAUNCH10" : "e.g. LAUNCH10"}
              className="store-input"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="store-submit-btn"
            style={{ border: "none" }}
          >
            {loading ? copy.processing : `${copy.placeOrder} - ${Number(totalAmount).toLocaleString(locale === "ar" ? "ar-EG" : "en-EG")} ${items[0]?.currency || 'EGP'}`}
          </button>
        </form>
      </div>

      <div>
        <div className="store-checkout-card store-order-summary">
          <h2>{copy.cart}</h2>
          
          <div className="store-order-lines">
            {items.map((item) => (
              <div key={item.productId} className="store-order-line">
                <div>
                  <span>{item.name}</span>
                  <small>{copy.quantity}: {item.quantity}</small>
                </div>
                <span>
                  {Number(item.price * item.quantity).toLocaleString(locale === "ar" ? "ar-EG" : "en-EG")} {item.currency}
                </span>
              </div>
            ))}
          </div>

          <div className="store-order-total">
            <span>{copy.subtotal}</span>
            <span>
              {Number(totalAmount).toLocaleString(locale === "ar" ? "ar-EG" : "en-EG")} <small>{items[0]?.currency || "EGP"}</small>
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
