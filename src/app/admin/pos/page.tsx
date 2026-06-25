"use client";

import { useState, useEffect } from "react";
import { IconCart, IconPackage, IconCheck, IconRevenue } from "../../../components/IconLibrary";

export default function PosPage() {
  const [inputText, setInputText] = useState("");
  const [cart, setCart] = useState<any[]>([]);
  const [suggestions, setSuggestions] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [parsing, setParsing] = useState(false);
  const [error, setError] = useState("");

  const handleParse = async () => {
    if (!inputText.trim()) return;
    setParsing(true);
    setError("");
    try {
      const res = await fetch("/api/admin/pos/parse", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: inputText }),
      });
      const data = await res.json();
      if (data.error) throw new Error(data.error);
      
      // Update cart with parsed items
      const newCart = [...cart];
      for (const item of data.items) {
        const existing = newCart.find(i => i.variantId === item.variantId);
        if (existing) {
          existing.quantity += item.quantity;
        } else {
          newCart.push(item);
        }
      }
      setCart(newCart);
      setInputText("");
      
      // Trigger upsell suggestions
      fetchSuggestions(newCart);
    } catch (e: any) {
      setError(e.message || "Failed to parse order");
    } finally {
      setParsing(false);
    }
  };

  const fetchSuggestions = async (currentCart: any[]) => {
    try {
      const res = await fetch("/api/admin/pos/upsell", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ items: currentCart }),
      });
      const data = await res.json();
      setSuggestions(data.suggestions || []);
    } catch (e) {
      console.error("Failed to fetch suggestions", e);
    }
  };

  const removeFromCart = (index: number) => {
    const newCart = [...cart];
    newCart.splice(index, 1);
    setCart(newCart);
    if (newCart.length > 0) fetchSuggestions(newCart);
    else setSuggestions([]);
  };

  const total = cart.reduce((sum, item) => sum + (item.price || 0) * item.quantity, 0);

  return (
    <div className="admin-page">
      <div className="admin-page-header">
        <h1 className="admin-page-title">AI POS Terminal</h1>
        <p className="admin-page-subtitle">Speak or type an order to build a cart instantly.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Col: Input & Suggestions */}
        <div className="lg:col-span-2 flex flex-col gap-6">
          <div className="card p-6">
            <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
              <span className="w-8 h-8 rounded-full bg-accent-primary/10 flex items-center justify-center text-accent-primary">AI</span>
              Order Parser
            </h3>
            <div className="flex gap-2">
              <input
                type="text"
                className="admin-input flex-1"
                placeholder='e.g., "Add 2 Vanilla Musk 50ml and one Rose Mist"'
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleParse()}
                disabled={parsing}
              />
              <button 
                className="btn-primary" 
                onClick={handleParse}
                disabled={parsing || !inputText.trim()}
              >
                {parsing ? "Parsing..." : "Add"}
              </button>
            </div>
            {error && <p className="text-red-500 text-sm mt-2">{error}</p>}
          </div>

          <div className="card p-6">
            <h3 className="text-lg font-bold mb-4">Smart Suggestions</h3>
            {suggestions.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {suggestions.map((s, i) => (
                  <div key={i} className="p-4 border border-subtle rounded-xl bg-surface-subtle flex flex-col gap-2">
                    <div className="font-bold">{s.name}</div>
                    <div className="text-xs text-muted">{s.reason}</div>
                    <button className="btn-secondary py-1 text-xs mt-auto">Add to Cart</button>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-muted text-sm">Add items to see recommendations.</p>
            )}
          </div>
        </div>

        {/* Right Col: Cart Summary */}
        <div className="flex flex-col gap-6">
          <div className="card p-6 sticky top-6">
            <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
              <IconCart size={20} className="text-accent-primary" />
              Current Order
            </h3>
            
            <div className="flex flex-col gap-4 mb-6 max-h-[400px] overflow-y-auto">
              {cart.length > 0 ? cart.map((item, i) => (
                <div key={i} className="flex justify-between items-center py-2 border-b border-subtle last:border-0">
                  <div>
                    <div className="font-bold text-sm">{item.name}</div>
                    <div className="text-xs text-muted">{item.quantity} × {item.price || 0} EGP</div>
                  </div>
                  <button onClick={() => removeFromCart(i)} className="text-red-500 text-xs">Remove</button>
                </div>
              )) : (
                <div className="py-8 text-center text-muted text-sm">Cart is empty</div>
              )}
            </div>

            <div className="pt-4 border-t border-subtle">
              <div className="flex justify-between items-center mb-4">
                <span className="font-bold">Total</span>
                <span className="text-xl font-black text-accent-primary">{total.toLocaleString()} EGP</span>
              </div>
              <button className="btn-primary w-full py-3" disabled={cart.length === 0}>
                Process Payment
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
