"use client";

import { useState } from "react";
import type { Locale } from "../../lib/i18n";

interface StorefrontAIAgentProps {
  storeSlug: string;
  storeName: string;
  locale: Locale;
}

interface ChatMessage {
  role: "user" | "assistant";
  content: string;
}

export function StorefrontAIAgent({ storeSlug, storeName, locale }: StorefrontAIAgentProps) {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [conversationId, setConversationId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const isArabic = locale === "ar";

  const labels = isArabic
    ? {
        title: `وكيل ${storeName} الذكي`,
        subtitle: "مدرب على منتجات وبيانات هذا المتجر",
        placeholder: "اسأل عن المنتجات أو الأسعار أو الدفع...",
        empty: "أهلاً! اسألني عن المنتجات، التوفر، الدفع أو التوصيل.",
        send: "إرسال",
      }
    : {
        title: `${storeName} AI Agent`,
        subtitle: "Trained on this store's products and data",
        placeholder: "Ask about products, prices, or payment...",
        empty: "Hi! Ask me about products, availability, payment, or delivery.",
        send: "Send",
      };

  const sendMessage = async () => {
    const message = input.trim();
    if (!message || loading) return;
    setMessages((prev) => [...prev, { role: "user", content: message }]);
    setInput("");
    setLoading(true);

    try {
      const res = await fetch("/api/ai/storefront-chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ storeSlug, message, conversationId }),
      });
      const data = await res.json();
      setConversationId(data.conversationId || conversationId);
      setMessages((prev) => [...prev, { role: "assistant", content: data.answer || data.error || "I could not answer right now." }]);
    } catch {
      setMessages((prev) => [...prev, { role: "assistant", content: isArabic ? "حدث خطأ مؤقت. حاول مرة أخرى." : "Temporary error. Please try again." }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed bottom-24 end-6 z-40" dir={isArabic ? "rtl" : "ltr"}>
      {open && (
        <div 
          className="w-[min(380px,calc(100vw-32px))] h-[min(500px,calc(100vh-140px))] mb-4 rounded-3xl shadow-2xl border border-black/10 overflow-hidden flex flex-col transition-all duration-300 ease-out" 
          style={{ 
            background: "var(--store-surface)", 
            color: "var(--store-text)",
            backdropFilter: "blur(20px)",
            WebkitBackdropFilter: "blur(20px)"
          }}
        >
          <div className="p-5 text-white" style={{ background: "linear-gradient(135deg, var(--store-primary), var(--store-secondary))" }}>
            <div className="font-black text-lg">{labels.title}</div>
            <div className="text-sm text-white/75">{labels.subtitle}</div>
          </div>
          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {messages.length === 0 && <p className="text-sm opacity-70 leading-6">{labels.empty}</p>}
            {messages.map((message, index) => (
              <div key={index} className={`p-3 rounded-2xl text-sm leading-6 ${message.role === "user" ? "ms-8 text-white" : "me-8"}`} style={{ background: message.role === "user" ? "var(--store-primary)" : "color-mix(in srgb, var(--store-primary) 8%, transparent)" }}>
                {message.content}
              </div>
            ))}
            {loading && <div className="text-sm opacity-60">...</div>}
          </div>
          <div className="p-3 border-t border-black/5 flex gap-2 items-center bg-white/5">
            <input
              value={input}
              onChange={(event) => setInput(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === "Enter") void sendMessage();
              }}
              placeholder={labels.placeholder}
              className="flex-1 min-w-0 px-4 py-3 rounded-2xl border border-black/10 text-sm outline-none bg-[color-mix(in srgb,var(--store-bg)_80%,transparent)]"
            />
            <button 
              type="button" 
              onClick={sendMessage} 
              className="px-4 py-3 rounded-2xl text-white font-bold shrink-0 transition-transform active:scale-95" 
              style={{ background: "var(--store-primary)" }}
            >
              {labels.send}
            </button>
          </div>
        </div>
      )}
      <button type="button" onClick={() => setOpen((value) => !value)} className="w-14 h-14 rounded-full shadow-2xl text-white font-black" style={{ background: "linear-gradient(135deg, var(--store-primary), var(--store-secondary))", border: "none" }}>
        AI
      </button>
    </div>
  );
}
