"use client";

import { useState, useRef, useEffect, useMemo } from "react";
import { usePathname } from "next/navigation";
import type { Locale } from "../../lib/i18n";

interface StorefrontAIAgentProps {
  storeSlug: string;
  storeName: string;
  locale: Locale;
  products?: any[];
}

type PageContext = "home" | "product" | "category" | "search" | "checkout" | "tracking" | "policy" | "other";

interface ChatMessage {
  role: "user" | "assistant";
  content: string;
}

export function StorefrontAIAgent({ storeSlug, storeName, locale, products = [] }: StorefrontAIAgentProps) {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [conversationId, setConversationId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const isArabic = locale === "ar";
  const pathname = usePathname();

  const pageContext: PageContext = useMemo(() => {
    if (!pathname) return "other";
    if (pathname.match(/\/store\/[^/]+\/product\/[^/]+$/)) return "product";
    if (pathname.match(/\/store\/[^/]+\/category\//)) return "category";
    if (pathname.match(/\/store\/[^/]+\/search/)) return "search";
    if (pathname.match(/\/store\/[^/]+\/checkout/)) return "checkout";
    if (pathname.match(/\/store\/[^/]+\/tracking/)) return "tracking";
    if (pathname.match(/\/store\/[^/]+\/policies\//)) return "policy";
    if (pathname === `/store/${storeSlug}` || pathname === `/store/${storeSlug}/`) return "home";
    return "other";
  }, [pathname, storeSlug]);

  const currentProduct = useMemo(() => {
    if (pageContext !== "product" || !pathname || !products.length) return null;
    const match = pathname.match(/\/product\/([^/]+)$/);
    if (!match) return null;
    return products.find((p) => p.id === match[1]) || null;
  }, [pageContext, pathname, products]);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const labels = isArabic
    ? {
        title: `وكيل ${storeName} الذكي`,
        subtitle: "متصل ومستعد لمساعدتك",
        placeholder: "اكتب رسالتك هنا...",
        empty: "أهلاً بك! أنا مساعدك الذكي. كيف يمكنني مساعدتك اليوم؟",
        send: "إرسال",
        recommends: "منتجات مقترحة لك:",
      }
    : {
        title: `${storeName} AI Assistant`,
        subtitle: "Online and ready to help",
        placeholder: "Write your message...",
        empty: "Welcome! I am your AI assistant. How can I help you today?",
        send: "Send",
        recommends: "Recommended for you:",
      };

  const starterPrompts = useMemo(() => {
    if (pageContext === "search") {
      return isArabic
        ? ["🔍 ساعدني في العثور على منتج", "💡 اقترح منتجات بناءً على احتياجاتي", "📦 ما هي أحدث المنتجات؟"]
        : ["🔍 Help me find a product", "💡 Suggest products based on my needs", "📦 What are the newest products?"];
    }
    if (pageContext === "product" && currentProduct) {
      return isArabic
        ? [`❓ ما هي مميزات ${currentProduct.name}؟`, "🚚 ما هي تكلفة الشحن؟", "💳 هل يمكن الدفع عند الاستلام؟"]
        : [`❓ What are the features of ${currentProduct.name}?`, "🚚 What are the shipping costs?", "💳 Can I pay on delivery?"];
    }
    if (pageContext === "checkout") {
      return isArabic
        ? ["💳 ما هي طرق الدفع المتاحة؟", "🚚 كم يستغرق التوصيل؟", "❓ هل يمكن تغيير الطلب بعد تأكيده؟"]
        : ["💳 What payment methods are available?", "🚚 How long does delivery take?", "❓ Can I change my order after confirmation?"];
    }
    return isArabic
      ? [
          "🔍 ما هي أفضل منتجاتكم مبيعاً؟",
          "🚚 هل يتوفر شحن مجاني؟",
          "💳 ما هي خيارات الدفع المتاحة؟",
          "✨ اقترح منتجاً مميزاً"
        ]
      : [
          "🔍 What are your best sellers?",
          "🚚 Do you offer free shipping?",
          "💳 What payment options do you support?",
          "✨ Suggest a premium product"
        ];
  }, [pageContext, currentProduct, isArabic]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    if (open) {
      scrollToBottom();
    }
  }, [messages, loading, open]);

  const sendMessage = async (messageText?: string) => {
    const textToSend = (messageText || input).trim();
    if (!textToSend || loading) return;

    setMessages((prev) => [...prev, { role: "user", content: textToSend }]);
    setInput("");
    setLoading(true);

    try {
      const body: Record<string, any> = { storeSlug, message: textToSend, conversationId, pageContext };
      if (currentProduct) {
        body.currentProduct = { id: currentProduct.id, name: currentProduct.name };
      }
      const res = await fetch("/api/ai/storefront-chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const data = await res.json();
      setConversationId(data.conversationId || conversationId);
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: data.answer || data.error || "I could not answer right now." }
      ]);
    } catch {
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: isArabic ? "حدث خطأ مؤقت. حاول مرة أخرى." : "Temporary error. Please try again." }
      ]);
    } finally {
      setLoading(false);
    }
  };

  // Scan assistant messages for product name mentions
  const findMatchingProducts = (text: string) => {
    if (!products || products.length === 0) return [];
    return products.filter((prod) => {
      const name = (prod.name || "").toLowerCase();
      // Only match if the name is a significant length and is included in the response
      return name.length > 2 && text.toLowerCase().includes(name);
    });
  };

  return (
    <div className="ai-agent-container" dir={isArabic ? "rtl" : "ltr"}>
      {open && (
        <div className="ai-chat-window animate-slide-in">
          {/* Header */}
          <div className="ai-chat-header">
            <div className="ai-avatar-wrapper">
              <div className="ai-avatar">🤖</div>
              <span className="ai-status-pulse" />
            </div>
            <div>
              <div className="ai-chat-title">{labels.title}</div>
              <div className="ai-chat-subtitle">{labels.subtitle}</div>
            </div>
            <button type="button" className="ai-close-btn" onClick={() => setOpen(false)} title="Close chat">✕</button>
          </div>

          {/* Messages Area */}
          <div className="ai-messages-area">
            {messages.length === 0 && (
              <div className="ai-empty-state">
                <div className="ai-empty-icon">✨</div>
                <p className="ai-empty-text">{labels.empty}</p>
                <div className="ai-starters-grid">
                  {starterPrompts.map((prompt, i) => (
                    <button
                      key={i}
                      type="button"
                      className="ai-starter-chip"
                      onClick={() => void sendMessage(prompt)}
                    >
                      {prompt}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {messages.map((message, index) => {
              const matchedProducts = message.role === "assistant" ? findMatchingProducts(message.content) : [];
              return (
                <div key={index} className="ai-message-wrapper">
                  <div className={`ai-message-bubble ${message.role}`}>
                    {message.content}
                  </div>
                  
                  {/* Inline Smart Product Recommendations */}
                  {matchedProducts.length > 0 && (
                    <div className="ai-products-recommendation animate-fade-in">
                      <div className="ai-recommends-label">{labels.recommends}</div>
                      <div className="ai-products-scroll-row">
                        {matchedProducts.map((prod) => (
                          <a
                            key={prod.id}
                            href={`/store/${storeSlug}/product/${prod.id}`}
                            className="ai-product-recommendation-card"
                          >
                            <div className="ai-prod-recommendation-icon">🧴</div>
                            <div className="ai-prod-recommendation-details">
                              <span className="ai-prod-rec-name">{prod.name}</span>
                              <span className="ai-prod-rec-price">
                                {Number(prod.basePrice).toLocaleString()} {prod.currency || "EGP"}
                              </span>
                            </div>
                          </a>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}

            {loading && (
              <div className="ai-message-wrapper">
                <div className="ai-message-bubble assistant typing">
                  <span className="dot" />
                  <span className="dot" />
                  <span className="dot" />
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Footer Input Area */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              void sendMessage();
            }}
            className="ai-chat-input-form"
          >
            <input
              value={input}
              onChange={(event) => setInput(event.target.value)}
              placeholder={labels.placeholder}
              className="ai-chat-text-input"
            />
            <button
              type="submit"
              disabled={loading || !input.trim()}
              className="ai-chat-send-btn"
            >
              {labels.send}
            </button>
          </form>
        </div>
      )}

      {/* Floating Toggle Button */}
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        className={`ai-toggle-fab ${open ? "active" : ""}`}
        title={open ? "Close AI Assistant" : "Open AI Assistant"}
        aria-label={open ? "Close AI Assistant" : "Open AI Assistant"}
      >
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          {open ? (
            <path d="M18 6L6 18M6 6l12 12" />
          ) : (
            <>
              <path d="M12 3a6 6 0 0 1 6 6c0 3.09-2.11 5.67-5 6.32V21l-4-2.2V15.32C5.11 14.67 3 12.09 3 9a6 6 0 0 1 6-6z"/>
              <circle cx="9" cy="9" r="1" fill="currentColor"/>
              <circle cx="15" cy="9" r="1" fill="currentColor"/>
              <path d="M9.5 14.5c.83.83 2.17 1.5 3.5 1.5s2.67-.67 3.5-1.5"/>
            </>
          )}
        </svg>
      </button>

      <style jsx global>{`
        .ai-agent-container {
          position: fixed;
          bottom: 90px;
          inset-inline-end: 20px;
          z-index: 45;
          font-family: inherit;
        }

        .ai-toggle-fab {
          width: 48px;
          height: 48px;
          border-radius: 50%;
          border: none;
          background: linear-gradient(135deg, var(--store-primary), var(--store-secondary));
          color: white;
          box-shadow: 0 8px 24px color-mix(in srgb, var(--store-primary) 30%, rgba(0, 0, 0, 0.2));
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: all 0.25s cubic-bezier(0.16, 1, 0.3, 1);
        }

        .ai-toggle-fab:hover {
          transform: translateY(-3px) scale(1.06);
          box-shadow: 0 12px 32px color-mix(in srgb, var(--store-primary) 40%, rgba(0, 0, 0, 0.28));
        }

        .ai-toggle-fab:active {
          transform: scale(0.95);
        }

        .ai-toggle-fab.active {
          transform: scale(0.95);
          box-shadow: 0 4px 12px color-mix(in srgb, var(--store-primary) 25%, rgba(0, 0, 0, 0.15));
        }

        .ai-chat-window {
          position: absolute;
          bottom: 60px;
          inset-inline-end: 0;
          width: min(380px, calc(100vw - 24px));
          height: min(520px, calc(100vh - 160px));
          background: color-mix(in srgb, var(--store-surface) 92%, transparent);
          backdrop-filter: blur(24px);
          -webkit-backdrop-filter: blur(24px);
          border: 1px solid color-mix(in srgb, var(--store-text) 8%, transparent);
          border-radius: 24px;
          box-shadow: 0 20px 50px rgba(0, 0, 0, 0.22);
          display: flex;
          flex-direction: column;
          overflow: hidden;
          z-index: 50;
          animation: ai-window-in 0.2s ease-out;
        }

        @keyframes ai-window-in {
          from { opacity: 0; transform: translateY(10px) scale(0.95); }
          to { opacity: 1; transform: translateY(0) scale(1); }
        }

        .ai-chat-header {
          padding: 16px 20px;
          background: linear-gradient(135deg, var(--store-primary), var(--store-secondary));
          color: white;
          display: flex;
          align-items: center;
          gap: 12px;
          position: relative;
        }

        .ai-avatar-wrapper {
          position: relative;
        }

        .ai-avatar {
          width: 38px;
          height: 38px;
          background: rgba(255, 255, 255, 0.15);
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 1.25rem;
          border: 1px solid rgba(255, 255, 255, 0.2);
        }

        .ai-status-pulse {
          position: absolute;
          bottom: 0;
          right: 0;
          width: 10px;
          height: 10px;
          background: #22c55e;
          border-radius: 50%;
          border: 2px solid var(--store-primary);
          animation: pulse 2s infinite;
        }

        .ai-chat-title {
          font-weight: 850;
          font-size: 0.95rem;
          letter-spacing: -0.01em;
          line-height: 1.2;
        }

        .ai-chat-subtitle {
          font-size: 0.72rem;
          opacity: 0.8;
        }

        .ai-close-btn {
          position: absolute;
          top: 18px;
          inset-inline-end: 18px;
          background: transparent;
          border: none;
          color: white;
          opacity: 0.7;
          cursor: pointer;
          font-size: 0.9rem;
          transition: opacity 0.2s;
        }

        .ai-close-btn:hover {
          opacity: 1;
        }

        .ai-messages-area {
          flex: 1;
          overflow-y: auto;
          padding: 20px;
          display: flex;
          flex-direction: column;
          gap: 14px;
        }

        .ai-messages-area::-webkit-scrollbar {
          width: 4px;
        }
        .ai-messages-area::-webkit-scrollbar-track {
          background: transparent;
        }
        .ai-messages-area::-webkit-scrollbar-thumb {
          background: color-mix(in srgb, var(--store-text) 10%, transparent);
          border-radius: 2px;
        }

        .ai-empty-state {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          height: 100%;
          text-align: center;
          padding: 0 10px;
          gap: 12px;
        }

        .ai-empty-icon {
          font-size: 2.2rem;
          color: var(--store-primary);
          opacity: 0.85;
          animation: float 3s ease-in-out infinite;
        }

        .ai-empty-text {
          font-size: 0.88rem;
          opacity: 0.8;
          line-height: 1.6;
          margin: 0;
          color: var(--store-text);
        }

        .ai-starters-grid {
          display: flex;
          flex-direction: column;
          gap: 8px;
          width: 100%;
          margin-top: 12px;
        }

        .ai-starter-chip {
          padding: 10px 14px;
          background: color-mix(in srgb, var(--store-primary) 6%, var(--store-surface));
          border: 1px solid color-mix(in srgb, var(--store-text) 6%, transparent);
          border-radius: 16px;
          color: var(--store-text);
          font-size: 0.78rem;
          font-weight: 700;
          cursor: pointer;
          text-align: start;
          transition: all 0.2s ease;
        }

        .ai-starter-chip:hover {
          background: color-mix(in srgb, var(--store-primary) 12%, var(--store-surface));
          border-color: color-mix(in srgb, var(--store-primary) 20%, transparent);
          transform: translateY(-1px);
        }

        .ai-message-wrapper {
          display: flex;
          flex-direction: column;
          gap: 6px;
          max-width: 100%;
        }

        .ai-message-bubble {
          padding: 12px 16px;
          font-size: 0.88rem;
          line-height: 1.6;
          max-width: 85%;
          word-wrap: break-word;
        }

        .ai-message-bubble.user {
          align-self: flex-end;
          background: linear-gradient(135deg, var(--store-primary), var(--store-secondary));
          color: white;
          border-radius: 20px 20px 4px 20px;
          box-shadow: 0 4px 12px color-mix(in srgb, var(--store-primary) 15%, transparent);
        }

        [dir="rtl"] .ai-message-bubble.user {
          border-radius: 20px 20px 20px 4px;
        }

        .ai-message-bubble.assistant {
          align-self: flex-start;
          background: color-mix(in srgb, var(--store-surface) 95%, var(--store-text));
          color: var(--store-text);
          border: 1px solid color-mix(in srgb, var(--store-text) 6%, transparent);
          border-radius: 20px 20px 20px 4px;
        }

        [dir="rtl"] .ai-message-bubble.assistant {
          border-radius: 20px 20px 4px 20px;
        }

        /* Typing indicator animation */
        .ai-message-bubble.typing {
          display: flex;
          align-items: center;
          gap: 4px;
          padding: 12px 18px;
        }

        .ai-message-bubble.typing .dot {
          width: 6px;
          height: 6px;
          background: var(--store-muted);
          border-radius: 50%;
          animation: typingDot 1.4s infinite ease-in-out;
        }

        .ai-message-bubble.typing .dot:nth-child(2) {
          animation-delay: 0.2s;
        }
        .ai-message-bubble.typing .dot:nth-child(3) {
          animation-delay: 0.4s;
        }

        /* Recommendation cards styling */
        .ai-products-recommendation {
          margin-top: 4px;
          padding: 8px 12px;
          background: color-mix(in srgb, var(--store-primary) 4%, transparent);
          border-radius: 18px;
          border: 1px dashed color-mix(in srgb, var(--store-primary) 12%, transparent);
          align-self: flex-start;
          width: 85%;
        }

        .ai-recommends-label {
          font-size: 0.72rem;
          font-weight: 850;
          color: var(--store-primary);
          margin-bottom: 6px;
          text-transform: uppercase;
          letter-spacing: 0.02em;
        }

        .ai-products-scroll-row {
          display: flex;
          gap: 10px;
          overflow-x: auto;
          padding-bottom: 6px;
        }

        .ai-products-scroll-row::-webkit-scrollbar {
          height: 3px;
        }
        .ai-products-scroll-row::-webkit-scrollbar-thumb {
          background: color-mix(in srgb, var(--store-primary) 15%, transparent);
          border-radius: 10px;
        }

        .ai-product-recommendation-card {
          flex: 0 0 150px;
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 8px;
          background: var(--store-surface);
          border: 1px solid color-mix(in srgb, var(--store-text) 5%, transparent);
          border-radius: 12px;
          text-decoration: none;
          transition: all 0.2s;
        }

        .ai-product-recommendation-card:hover {
          border-color: var(--store-primary);
          transform: translateY(-1px);
        }

        .ai-prod-recommendation-icon {
          width: 28px;
          height: 28px;
          border-radius: 6px;
          background: color-mix(in srgb, var(--store-primary) 10%, transparent);
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 1rem;
        }

        .ai-prod-recommendation-details {
          display: flex;
          flex-direction: column;
          min-width: 0;
        }

        .ai-prod-rec-name {
          font-size: 0.72rem;
          font-weight: 800;
          color: var(--store-text);
          line-clamp: 1;
          display: -webkit-box;
          -webkit-line-clamp: 1;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }

        .ai-prod-rec-price {
          font-size: 0.65rem;
          color: var(--store-primary);
          font-weight: 700;
        }

        /* Form Footer styling */
        .ai-chat-input-form {
          padding: 12px 16px;
          border-top: 1px solid color-mix(in srgb, var(--store-text) 6%, transparent);
          display: flex;
          gap: 8px;
          background: color-mix(in srgb, var(--store-surface) 96%, transparent);
        }

        .ai-chat-text-input {
          flex: 1;
          min-width: 0;
          padding: 10px 14px;
          border-radius: 16px;
          border: 1px solid color-mix(in srgb, var(--store-text) 10%, transparent);
          font-size: 0.85rem;
          outline: none;
          background: var(--store-bg);
          color: var(--store-text);
          transition: border-color 0.2s;
        }

        .ai-chat-text-input:focus {
          border-color: var(--store-primary);
        }

        .ai-chat-send-btn {
          padding: 10px 16px;
          border-radius: 16px;
          background: var(--store-primary);
          color: white;
          font-weight: 850;
          font-size: 0.8rem;
          border: none;
          cursor: pointer;
          transition: all 0.2s;
        }

        .ai-chat-send-btn:hover:not(:disabled) {
          background: var(--store-secondary);
        }

        .ai-chat-send-btn:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        @keyframes pulse {
          0% { box-shadow: 0 0 0 0 rgba(34, 197, 94, 0.4); }
          70% { box-shadow: 0 0 0 6px rgba(34, 197, 94, 0); }
          100% { box-shadow: 0 0 0 0 rgba(34, 197, 94, 0); }
        }

        @keyframes typingDot {
          0%, 100% { transform: translateY(0); opacity: 0.4; }
          50% { transform: translateY(-4px); opacity: 1; }
        }

        @keyframes float {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-6px); }
        }

        .animate-slide-in {
          animation: chatSlideIn 0.3s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }

        @keyframes chatSlideIn {
          from { opacity: 0; transform: translateY(12px) scale(0.96); }
          to { opacity: 1; transform: translateY(0) scale(1); }
        }

        .animate-fade-in {
          animation: fadeIn 0.25s ease-out forwards;
        }

        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }

        @media (max-width: 640px) {
          .ai-agent-container {
            bottom: 20px;
            inset-inline-end: 16px;
          }

          .ai-toggle-fab {
            width: 44px;
            height: 44px;
          }

          .ai-toggle-fab svg {
            width: 18px;
            height: 18px;
          }

          .ai-chat-window {
            position: fixed;
            bottom: 0;
            left: 0;
            right: 0;
            width: 100%;
            height: min(460px, 75vh);
            border-radius: 20px 20px 0 0;
            inset-inline-end: 0;
          }
        }
      `}</style>
    </div>
  );
}
