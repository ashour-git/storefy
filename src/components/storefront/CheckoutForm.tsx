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
  const [city, setCity] = useState("Cairo");
  const [paymentMethod, setPaymentMethod] = useState<"online" | "cod">("online");
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
            email,
            phone,
            street,
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
            <label>{copy.email}</label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="e.g. aly@domain.com"
              className="store-input"
            />
          </div>

          <div className="store-form-field">
            <label>{copy.phone}</label>
            <input
              type="tel"
              required
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="e.g. +20 100 123 4567"
              className="store-input"
            />
          </div>

          <div className="store-form-field">
            <label>{copy.street}</label>
            <input
              type="text"
              required
              value={street}
              onChange={(e) => setStreet(e.target.value)}
              placeholder={locale === "ar" ? "مثال: ١٥ شارع الجزيرة" : "e.g. 15 El-Gezira Street"}
              className="store-input"
            />
          </div>

          <div className="store-form-field">
            <label>{copy.city}</label>
            <select
              value={city}
              onChange={(e) => setCity(e.target.value)}
              className="store-input"
            >
              <option value="Cairo">Cairo</option>
              <option value="Giza">Giza</option>
              <option value="Alexandria">Alexandria</option>
              <option value="Mansoura">Mansoura</option>
              <option value="Tanta">Tanta</option>
            </select>
          </div>

          <div className="store-form-field">
            <label>{copy.paymentMethod}</label>
            <div className="store-payment-grid">
              <button type="button" onClick={() => setPaymentMethod("online")} className={`store-payment-card ${paymentMethod === "online" ? "active" : ""}`}>
                <span>{copy.payOnline}</span>
                <small>{copy.payOnlineDesc}</small>
              </button>
              <button type="button" onClick={() => setPaymentMethod("cod")} className={`store-payment-card ${paymentMethod === "cod" ? "active" : ""}`}>
                <span>{copy.cod}</span>
                <small>{copy.codDesc}</small>
              </button>
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
