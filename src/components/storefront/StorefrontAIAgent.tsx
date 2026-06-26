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
    </div>
  );
}
