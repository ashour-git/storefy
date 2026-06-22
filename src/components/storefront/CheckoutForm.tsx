"use client";

import React, { useState, useEffect } from "react";
import { useCart } from "./CartProvider";
import { useRouter } from "next/navigation";

interface CheckoutFormProps {
  tenant: {
    id: string;
    name: string;
    slug: string;
  };
}

export function CheckoutForm({ tenant }: CheckoutFormProps) {
  const router = useRouter();
  const { items, totalAmount, clearCart } = useCart();

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [street, setStreet] = useState("");
  const [city, setCity] = useState("Cairo");

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
          tenantId: tenant.id,
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
      const { paymentKey, orderId } = data;

      // Clear cart
      clearCart();

      // If mock key, redirect to mock success page
      if (paymentKey.startsWith("mock_")) {
        router.push(`/store/${tenant.slug}/checkout/success?orderId=${orderId}`);
      } else {
        // Redirect to real Paymob iframe
        const iframeId = process.env.NEXT_PUBLIC_PAYMOB_IFRAME_ID || "843079";
        window.location.href = `https://accept.paymob.com/api/acceptance/iframes/${iframeId}?payment_token=${paymentKey}`;
      }
    } catch (err) {
      setError("An error occurred during checkout. Please try again.");
      setLoading(false);
    }
  };

  if (items.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <div className="text-6xl mb-6">🛒</div>
        <h2 className="text-2xl font-bold mb-2">Your cart is empty</h2>
        <p className="text-gray-500 max-w-sm mb-6">Add items to your cart from our collection before checking out.</p>
        <a 
          href={`/store/${tenant.slug}`} 
          className="inline-flex items-center justify-center px-6 py-3 rounded-xl bg-[var(--store-primary)] text-white font-bold text-center shadow-md hover:brightness-110 transition-all text-decoration-none cursor-pointer"
        >
          Back to Shop
        </a>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
      {/* Checkout Form */}
      <div className="lg:col-span-7 bg-white p-8 rounded-2xl border border-gray-100 shadow-xs">
        <h2 className="text-xl font-bold text-gray-900 mb-6">Billing & Shipping Details</h2>
        
        {error && (
          <div className="p-4 mb-6 bg-red-50 text-red-500 rounded-xl border border-red-100 text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">First Name</label>
              <input
                type="text"
                required
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                placeholder="e.g. Aly"
                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[var(--store-primary)] text-black"
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Last Name</label>
              <input
                type="text"
                required
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                placeholder="e.g. Sabry"
                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[var(--store-primary)] text-black"
              />
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Email Address</label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="e.g. aly@domain.com"
              className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[var(--store-primary)] text-black"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Phone Number</label>
            <input
              type="tel"
              required
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="e.g. +20 100 123 4567"
              className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[var(--store-primary)] text-black"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Street Address</label>
            <input
              type="text"
              required
              value={street}
              onChange={(e) => setStreet(e.target.value)}
              placeholder="e.g. 15 El-Gezira Street"
              className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[var(--store-primary)] text-black"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">City</label>
            <select
              value={city}
              onChange={(e) => setCity(e.target.value)}
              className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[var(--store-primary)] bg-white text-black"
            >
              <option value="Cairo">Cairo</option>
              <option value="Giza">Giza</option>
              <option value="Alexandria">Alexandria</option>
              <option value="Mansoura">Mansoura</option>
              <option value="Tanta">Tanta</option>
            </select>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-4 mt-4 bg-[var(--store-primary)] text-white font-bold rounded-xl shadow-lg hover:brightness-110 transition-all cursor-pointer"
            style={{ border: "none" }}
          >
            {loading ? "Processing Order..." : `Pay ${Number(totalAmount).toLocaleString()} ${items[0]?.currency || 'EGP'} with Paymob`}
          </button>
        </form>
      </div>

      {/* Order Summary */}
      <div className="lg:col-span-5">
        <div className="bg-gray-50 p-8 rounded-2xl border border-gray-100">
          <h2 className="text-lg font-bold text-gray-900 mb-6">Order Summary</h2>
          
          <div className="space-y-4 mb-6">
            {items.map((item) => (
              <div key={item.productId} className="flex justify-between items-start">
                <div>
                  <span className="font-semibold text-gray-900">{item.name}</span>
                  <span className="text-gray-400 text-xs block">Qty: {item.quantity}</span>
                </div>
                <span className="font-semibold text-gray-900">
                  {Number(item.price * item.quantity).toLocaleString()} {item.currency}
                </span>
              </div>
            ))}
          </div>

          <div className="border-t border-gray-200 pt-6 flex justify-between items-baseline">
            <span className="font-bold text-gray-900">Total</span>
            <span className="text-3xl font-black text-[var(--store-primary)]">
              {Number(totalAmount).toLocaleString()} <span className="text-sm font-normal text-gray-500">{items[0]?.currency || "EGP"}</span>
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
