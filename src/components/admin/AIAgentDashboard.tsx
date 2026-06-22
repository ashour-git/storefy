"use client";

import React, { useState, useRef, useEffect } from "react";
import type { AiPlan } from "../../lib/ai/plans";
import { DynamicIcon, IconBrain } from "../IconLibrary";
import { LaunchPlanGenerator } from "./LaunchPlanGenerator";

interface Store {
  id: string;
  slug: string;
  name: string;
  category: string | null;
}

interface Metrics {
  totalProducts: number;
  activeProducts: number;
  totalOrders: number;
  totalRevenue: number;
  avgOrderValue: number;
  totalCustomers: number;
  recentOrders: any[];
  topProducts: any[];
}

interface Insight {
  type: "success" | "warning" | "tip" | "alert";
  title: string;
  description: string;
  action: string;
}

interface ChatMessage {
  role: "user" | "assistant";
  content: string;
  insights?: Insight[];
  timestamp: Date;
}

interface Props {
  store: Store;
  metrics: Metrics;
  aiPlan: AiPlan;
}

const INSIGHT_COLORS: Record<string, { bg: string; border: string; icon: string; badge: string }> = {
  success: {
    bg: "rgba(52, 211, 153, 0.05)",
    border: "rgba(52, 211, 153, 0.2)",
    icon: "check",
    badge: "#34d399",
  },
  warning: {
    bg: "rgba(251, 191, 36, 0.05)",
    border: "rgba(251, 191, 36, 0.2)",
    icon: "alert",
    badge: "#fbbf24",
  },
  tip: {
    bg: "rgba(129, 140, 248, 0.05)",
    border: "rgba(129, 140, 248, 0.2)",
    icon: "sparkles",
    badge: "#818cf8",
  },
  alert: {
    bg: "rgba(248, 113, 113, 0.05)",
    border: "rgba(248, 113, 113, 0.2)",
    icon: "alert",
    badge: "#f87171",
  },
};

const SUGGESTED_QUESTIONS = [
  "How can I increase my average order value?",
  "What products should I add to my store?",
  "How do I get my first 10 customers?",
  "What's the best pricing strategy for my niche?",
  "How can I reduce cart abandonment?",
  "What marketing channels work best for my category?",
];

export function AIAgentDashboard({ store, metrics, aiPlan }: Props) {
  const [insights, setInsights] = useState<Insight[]>([]);
  const [isLoadingInsights, setIsLoadingInsights] = useState(false);
  const [hasLoadedInsights, setHasLoadedInsights] = useState(false);

  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [chatInput, setChatInput] = useState("");
  const [isChatLoading, setIsChatLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<"insights" | "advisor" | "tools">("insights");

  // Product description tool
  const [pdProductName, setPdProductName] = useState("");
  const [pdCategory, setPdCategory] = useState(store.category || "");
  const [pdLocale, setPdLocale] = useState<"en" | "ar">("en");
  const [pdResult, setPdResult] = useState("");
  const [pdLoading, setPdLoading] = useState(false);
  const [pdError, setPdError] = useState("");
  const [pdCopied, setPdCopied] = useState(false);

  const chatEndRef = useRef<HTMLDivElement>(null);
  const chatInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chatMessages]);

  const loadInsights = async () => {
    setIsLoadingInsights(true);
    try {
      const res = await fetch("/api/ai/insights", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type: "overview" }),
      });
      const data = await res.json();
      setInsights(data.insights || []);
      setHasLoadedInsights(true);
    } catch {
      setInsights([]);
    } finally {
      setIsLoadingInsights(false);
    }
  };

  useEffect(() => {
    if (activeTab === "insights" && !hasLoadedInsights) {
      loadInsights();
    }
  }, [activeTab]);

  const sendChatMessage = async (msg?: string) => {
    const message = (msg || chatInput).trim();
    if (!message || isChatLoading) return;

    const userMsg: ChatMessage = { role: "user", content: message, timestamp: new Date() };
    setChatMessages((prev) => [...prev, userMsg]);
    setChatInput("");
    setIsChatLoading(true);

    try {
      const res = await fetch("/api/ai/insights", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type: "chat", question: message }),
      });
      const data = await res.json();
      const aiInsights: Insight[] = data.insights || [];

      const assistantMsg: ChatMessage = {
        role: "assistant",
        content:
          aiInsights.length > 0
            ? `Here are my recommendations based on ${store.name}'s data:`
            : "I couldn't generate specific insights at this time. Please try again.",
        insights: aiInsights,
        timestamp: new Date(),
      };
      setChatMessages((prev) => [...prev, assistantMsg]);
    } catch {
      const errMsg: ChatMessage = {
        role: "assistant",
        content: "I'm having trouble connecting right now. Please try again in a moment.",
        timestamp: new Date(),
      };
      setChatMessages((prev) => [...prev, errMsg]);
    } finally {
      setIsChatLoading(false);
      chatInputRef.current?.focus();
    }
  };

  const generateDescription = async () => {
    if (!pdProductName.trim()) return;
    setPdLoading(true);
    setPdError("");
    setPdResult("");
    setPdCopied(false);

    try {
      const res = await fetch("/api/ai/generate-description", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          productName: pdProductName,
          category: pdCategory,
          locale: pdLocale,
        }),
      });
      const data = await res.json();
      if (data.error) {
        setPdError(data.error);
      } else {
        setPdResult(data.description || "");
      }
    } catch {
      setPdError("Failed to generate description. Please check your connection.");
    } finally {
      setPdLoading(false);
    }
  };

  const copyDescription = () => {
    if (pdResult) {
      navigator.clipboard.writeText(pdResult);
      setPdCopied(true);
      setTimeout(() => setPdCopied(false), 2000);
    }
  };

  const rebuildKnowledge = async () => {
    await fetch("/api/ai/knowledge/rebuild", { method: "POST" });
  };

  // Metric cards
  const metricCards = [
    {
      label: "Total Revenue",
      value: `${Math.round(metrics.totalRevenue).toLocaleString()} EGP`,
      icon: "revenue",
      color: "#34d399",
      sub: `Avg order: ${Math.round(metrics.avgOrderValue)} EGP`,
    },
    {
      label: "Total Orders",
      value: metrics.totalOrders.toString(),
      icon: "cart",
      color: "#818cf8",
      sub: metrics.totalOrders === 0 ? "No orders yet" : "Keep selling!",
    },
    {
      label: "Active Products",
      value: `${metrics.activeProducts} / ${metrics.totalProducts}`,
      icon: "package",
      color: "#fbbf24",
      sub: metrics.totalProducts === 0 ? "Add products" : `${metrics.totalProducts - metrics.activeProducts} drafts`,
    },
    {
      label: "Customers",
      value: metrics.totalCustomers.toString(),
      icon: "users",
      color: "#f472b6",
      sub: metrics.totalCustomers === 0 ? "Grow your base" : "Loyal buyers",
    },
  ];

  return (
    <div className="admin-page" style={{ maxWidth: "100%" }}>
      {/* Page Header */}
      <div className="admin-page-header" style={{ marginBottom: 24 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
          <div
            style={{
              width: 52,
              height: 52,
              borderRadius: 14,
              background: "linear-gradient(135deg, #818cf8, #6366f1)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              flexShrink: 0,
              boxShadow: "0 8px 24px rgba(99,102,241,0.3)",
              color: "white"
            }}
          >
            <IconBrain size={28} />
          </div>
          <div>
            <h1 className="admin-page-title">AI Business Advisor</h1>
            <p className="admin-page-subtitle">
              Powered by Llama 3 · Analyzing {store.name} · {store.category || "General"} category
            </p>
          </div>
        </div>
      </div>

      <div className="admin-card" style={{ marginBottom: 24, display: "grid", gridTemplateColumns: "1.3fr .7fr", gap: 20, alignItems: "center" }}>
        <div>
          <div className="admin-badge" style={{ marginBottom: 10 }}>Current AI plan: {aiPlan.name}</div>
          <h2 style={{ fontSize: "1.4rem", fontWeight: 800, marginBottom: 8 }}>Your store has AI agents trained on its data</h2>
          <p style={{ color: "var(--text-secondary)", lineHeight: 1.7 }}>
            Storefy connects product, order, customer, FAQ, and policy context into tenant-safe agents for storefront support, growth advice, POS, and analytics. Free tier uses safe local knowledge; paid scale providers can upgrade the same agent interfaces.
          </p>
        </div>
        <div style={{ display: "grid", gap: 8 }}>
          {aiPlan.features.map((feature) => (
            <div key={feature.key} style={{ display: "flex", justifyContent: "space-between", color: feature.included ? "var(--text-primary)" : "var(--text-muted)" }}>
              <span>{feature.label}</span>
              <strong>{feature.included ? "Enabled" : "Upgrade"}</strong>
            </div>
          ))}
          <button type="button" onClick={rebuildKnowledge} className="btn-secondary" style={{ marginTop: 8 }}>Rebuild AI Knowledge</button>
        </div>
      </div>

      <LaunchPlanGenerator />

      {/* Metrics Row */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
          gap: 16,
          marginBottom: 28,
        }}
      >
        {metricCards.map((card) => (
          <div
            key={card.label}
            className="admin-stat-card"
            style={{
              borderLeft: `3px solid ${card.color}`,
              position: "relative",
              overflow: "hidden",
            }}
          >
            <div
              style={{
                position: "absolute",
                top: -10,
                right: -10,
                width: 60,
                height: 60,
                borderRadius: "50%",
                background: card.color,
                opacity: 0.06,
              }}
            />
            <div style={{ display: "inline-flex", color: card.color, marginBottom: 8 }}>
              <DynamicIcon name={card.icon} size={22} />
            </div>
            <div
              className="admin-stat-value"
              style={{ color: card.color, fontSize: "1.4rem" }}
            >
              {card.value}
            </div>
            <div className="admin-stat-label">{card.label}</div>
            <div
              style={{
                fontSize: "0.72rem",
                color: "var(--text-muted)",
                marginTop: 4,
              }}
            >
              {card.sub}
            </div>
          </div>
        ))}
      </div>

      {/* Tab Navigation */}
      <div
        style={{
          display: "flex",
          gap: 4,
          marginBottom: 24,
          background: "var(--bg-surface)",
          padding: 4,
          borderRadius: 12,
          border: "1px solid var(--border-subtle)",
          width: "fit-content",
        }}
      >
        {(["insights", "advisor", "tools"] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            style={{
              padding: "8px 20px",
              borderRadius: 8,
              border: "none",
              cursor: "pointer",
              fontWeight: 600,
              fontSize: "0.85rem",
              transition: "all 0.2s",
              background:
                activeTab === tab
                  ? "linear-gradient(135deg, #818cf8, #6366f1)"
                  : "transparent",
              color:
                activeTab === tab
                  ? "white"
                  : "var(--text-secondary)",
              boxShadow:
                activeTab === tab
                  ? "0 4px 12px rgba(99,102,241,0.3)"
                  : "none",
            }}
          >
            <span style={{ display: "inline-flex", alignItems: "center", gap: "6px" }}>
              <DynamicIcon name={tab === "insights" ? "trending-up" : tab === "advisor" ? "brain" : "settings"} size={16} />
              <span>{tab === "insights" ? "Insights" : tab === "advisor" ? "AI Advisor" : "AI Tools"}</span>
            </span>
          </button>
        ))}
      </div>

      {/* ──── INSIGHTS TAB ──── */}
      {activeTab === "insights" && (
        <div>
          {isLoadingInsights ? (
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                padding: "80px 0",
                gap: 20,
              }}
            >
              <div
                style={{
                  width: 56,
                  height: 56,
                  borderRadius: "50%",
                  border: "3px solid var(--border-subtle)",
                  borderTopColor: "#818cf8",
                  animation: "spin 0.8s linear infinite",
                }}
              />
              <p style={{ color: "var(--text-muted)", fontSize: "0.9rem" }}>
                Analyzing your store data with AI…
              </p>
            </div>
          ) : insights.length > 0 ? (
            <div>
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  marginBottom: 20,
                }}
              >
                <h2
                  style={{
                    fontSize: "1.1rem",
                    fontWeight: 700,
                    color: "var(--text-primary)",
                  }}
                >
                  {insights.length} AI Recommendations for {store.name}
                </h2>
                <button
                  onClick={loadInsights}
                  style={{
                    padding: "6px 14px",
                    borderRadius: 8,
                    border: "1px solid var(--border-input)",
                    background: "transparent",
                    color: "var(--text-secondary)",
                    cursor: "pointer",
                    fontSize: "0.8rem",
                    fontWeight: 600,
                    display: "flex",
                    alignItems: "center",
                    gap: 6,
                  }}
                >
                  <span style={{ display: "inline-flex", alignItems: "center", gap: "6px" }}>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M21.5 2v6h-6M21.34 15.57a10 10 0 1 1-.57-8.38l5.67-5.67"/></svg>
                    Refresh
                  </span>
                </button>
              </div>
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
                  gap: 16,
                }}
              >
                {insights.map((insight, idx) => {
                  const colors = INSIGHT_COLORS[insight.type] || INSIGHT_COLORS.tip;
                  return (
                    <div
                      key={idx}
                      style={{
                        background: colors.bg,
                        border: `1px solid ${colors.border}`,
                        borderRadius: 14,
                        padding: "20px 22px",
                        display: "flex",
                        flexDirection: "column",
                        gap: 10,
                        transition: "transform 0.2s, box-shadow 0.2s",
                      }}
                      onMouseEnter={(e) => {
                        (e.currentTarget as HTMLElement).style.transform = "translateY(-2px)";
                        (e.currentTarget as HTMLElement).style.boxShadow = `0 8px 24px ${colors.border}`;
                      }}
                      onMouseLeave={(e) => {
                        (e.currentTarget as HTMLElement).style.transform = "translateY(0)";
                        (e.currentTarget as HTMLElement).style.boxShadow = "none";
                      }}
                    >
                      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                        <span style={{ display: "inline-flex", alignItems: "center", color: colors.badge }}>
                          <DynamicIcon name={colors.icon} size={18} />
                        </span>
                        <span
                          style={{
                            fontSize: "0.7rem",
                            fontWeight: 700,
                            color: colors.badge,
                            background: `${colors.badge}20`,
                            padding: "2px 8px",
                            borderRadius: 99,
                            textTransform: "uppercase",
                            letterSpacing: "0.05em",
                          }}
                        >
                          {insight.type}
                        </span>
                      </div>
                      <h3
                        style={{
                          fontWeight: 700,
                          fontSize: "0.95rem",
                          color: "var(--text-primary)",
                        }}
                      >
                        {insight.title}
                      </h3>
                      <p
                        style={{
                          color: "var(--text-secondary)",
                          fontSize: "0.85rem",
                          lineHeight: 1.6,
                        }}
                      >
                        {insight.description}
                      </p>
                      <div
                        style={{
                          background: "var(--bg-surface)",
                          border: "1px solid var(--border-subtle)",
                          borderRadius: 8,
                          padding: "8px 12px",
                          fontSize: "0.8rem",
                          color: colors.badge,
                          fontWeight: 600,
                          display: "flex",
                          alignItems: "center",
                          gap: 6,
                        }}
                      >
                        <span>→</span>
                        <span>{insight.action}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ) : (
            <div
              style={{
                textAlign: "center",
                padding: "60px 20px",
                color: "var(--text-muted)",
              }}
            >
              <div style={{ display: "inline-flex", color: "var(--text-muted)", opacity: 0.5, marginBottom: 16 }}>
                <DynamicIcon name="trending-up" size={48} />
              </div>
              <p>Click below to analyze your store with AI</p>
              <button
                onClick={loadInsights}
                className="btn-primary"
                style={{ marginTop: 20, padding: "10px 28px" }}
              >
                Generate AI Insights
              </button>
            </div>
          )}
        </div>
      )}

      {/* ──── ADVISOR TAB ──── */}
      {activeTab === "advisor" && (
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            height: "calc(100vh - 320px)",
            minHeight: 480,
            background: "var(--bg-surface)",
            border: "1px solid var(--border-subtle)",
            borderRadius: 16,
            overflow: "hidden",
          }}
        >
          {/* Chat Header */}
          <div
            style={{
              padding: "16px 20px",
              borderBottom: "1px solid var(--border-subtle)",
              background: "var(--bg-surface-raised)",
              display: "flex",
              alignItems: "center",
              gap: 12,
            }}
          >
            <div
              style={{
                width: 40,
                height: 40,
                borderRadius: 10,
                background: "linear-gradient(135deg, #818cf8, #6366f1)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "white"
              }}
            >
              <IconBrain size={20} />
            </div>
            <div>
              <div style={{ fontWeight: 700, color: "var(--text-primary)", fontSize: "0.9rem" }}>
                Storefy AI Advisor
              </div>
              <div style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>
                Ask anything about your store's growth
              </div>
            </div>
            <div
              style={{
                marginLeft: "auto",
                display: "flex",
                alignItems: "center",
                gap: 6,
                fontSize: "0.75rem",
                color: "#34d399",
                fontWeight: 600,
              }}
            >
              <span
                style={{
                  width: 8,
                  height: 8,
                  borderRadius: "50%",
                  background: "#34d399",
                  display: "inline-block",
                  animation: "pulse 2s infinite",
                }}
              />
              Online
            </div>
          </div>

          {/* Chat Messages */}
          <div
            style={{
              flex: 1,
              overflowY: "auto",
              padding: "20px",
              display: "flex",
              flexDirection: "column",
              gap: 16,
            }}
          >
            {chatMessages.length === 0 && (
              <div style={{ textAlign: "center", padding: "20px 0" }}>
                <div style={{ display: "inline-flex", color: "var(--accent-primary)", marginBottom: 12 }}>
                  <DynamicIcon name="sparkles" size={40} />
                </div>
                <p
                  style={{
                    color: "var(--text-secondary)",
                    marginBottom: 20,
                    fontSize: "0.9rem",
                  }}
                >
                  Hi! I'm your AI Business Advisor. Ask me anything about growing{" "}
                  <strong>{store.name}</strong>.
                </p>
                <div
                  style={{
                    display: "flex",
                    flexWrap: "wrap",
                    gap: 8,
                    justifyContent: "center",
                  }}
                >
                  {SUGGESTED_QUESTIONS.map((q) => (
                    <button
                      key={q}
                      onClick={() => sendChatMessage(q)}
                      style={{
                        padding: "7px 14px",
                        borderRadius: 99,
                        border: "1px solid var(--border-accent)",
                        background: "rgba(99,102,241,0.06)",
                        color: "var(--accent-primary)",
                        fontSize: "0.78rem",
                        cursor: "pointer",
                        fontWeight: 500,
                        transition: "all 0.2s",
                      }}
                      onMouseEnter={(e) => {
                        (e.currentTarget as HTMLElement).style.background = "rgba(99,102,241,0.12)";
                      }}
                      onMouseLeave={(e) => {
                        (e.currentTarget as HTMLElement).style.background = "rgba(99,102,241,0.06)";
                      }}
                    >
                      {q}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {chatMessages.map((msg, idx) => (
              <div
                key={idx}
                style={{
                  display: "flex",
                  flexDirection: msg.role === "user" ? "row-reverse" : "row",
                  gap: 12,
                  alignItems: "flex-start",
                }}
              >
                <div
                  style={{
                    width: 36,
                    height: 36,
                    borderRadius: "50%",
                    background:
                      msg.role === "user"
                        ? "linear-gradient(135deg, #f59e0b, #ef4444)"
                        : "linear-gradient(135deg, #818cf8, #6366f1)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    color: "white",
                    flexShrink: 0,
                  }}
                >
                  {msg.role === "user" ? <DynamicIcon name="users" size={18} /> : <IconBrain size={18} />}
                </div>
                <div
                  style={{
                    maxWidth: "75%",
                    display: "flex",
                    flexDirection: "column",
                    gap: 8,
                    alignItems: msg.role === "user" ? "flex-end" : "flex-start",
                  }}
                >
                  <div
                    style={{
                      padding: "12px 16px",
                      borderRadius:
                        msg.role === "user" ? "16px 16px 4px 16px" : "16px 16px 16px 4px",
                      background:
                        msg.role === "user"
                          ? "linear-gradient(135deg, #818cf8, #6366f1)"
                          : "var(--bg-surface-raised)",
                      color: msg.role === "user" ? "white" : "var(--text-primary)",
                      fontSize: "0.88rem",
                      lineHeight: 1.6,
                      border: msg.role === "assistant" ? "1px solid var(--border-subtle)" : "none",
                    }}
                  >
                    {msg.content}
                  </div>
                  {msg.insights && msg.insights.length > 0 && (
                    <div style={{ display: "flex", flexDirection: "column", gap: 8, width: "100%" }}>
                      {msg.insights.map((insight, iIdx) => {
                        const colors = INSIGHT_COLORS[insight.type] || INSIGHT_COLORS.tip;
                        return (
                          <div
                            key={iIdx}
                            style={{
                              background: colors.bg,
                              border: `1px solid ${colors.border}`,
                              borderRadius: 10,
                              padding: "12px 14px",
                            }}
                          >
                            <div
                              style={{
                                fontWeight: 700,
                                fontSize: "0.85rem",
                                color: "var(--text-primary)",
                                marginBottom: 4,
                                display: "flex",
                                alignItems: "center",
                                gap: 6,
                              }}
                            >
                              <span style={{ display: "inline-flex", color: colors.badge }}>
                                <DynamicIcon name={colors.icon} size={14} />
                              </span>
                              {insight.title}
                            </div>
                            <p
                              style={{
                                color: "var(--text-secondary)",
                                fontSize: "0.8rem",
                                lineHeight: 1.6,
                                marginBottom: 6,
                              }}
                            >
                              {insight.description}
                            </p>
                            <div
                              style={{
                                fontSize: "0.75rem",
                                color: colors.badge,
                                fontWeight: 600,
                              }}
                            >
                              → {insight.action}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                  <span
                    style={{
                      fontSize: "0.7rem",
                      color: "var(--text-muted)",
                    }}
                  >
                    {msg.timestamp.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                  </span>
                </div>
              </div>
            ))}

            {isChatLoading && (
              <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                <div
                  style={{
                    width: 36,
                    height: 36,
                    borderRadius: "50%",
                    background: "linear-gradient(135deg, #818cf8, #6366f1)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    color: "white"
                  }}
                >
                  <IconBrain size={18} />
                </div>
                <div
                  style={{
                    padding: "12px 18px",
                    background: "var(--bg-surface-raised)",
                    borderRadius: "16px 16px 16px 4px",
                    border: "1px solid var(--border-subtle)",
                    display: "flex",
                    gap: 4,
                    alignItems: "center",
                  }}
                >
                  {[0, 1, 2].map((i) => (
                    <span
                      key={i}
                      style={{
                        width: 8,
                        height: 8,
                        borderRadius: "50%",
                        background: "#818cf8",
                        animation: `bounce 1.2s ease-in-out ${i * 0.2}s infinite`,
                        display: "inline-block",
                      }}
                    />
                  ))}
                </div>
              </div>
            )}

            <div ref={chatEndRef} />
          </div>

          {/* Chat Input */}
          <div
            style={{
              padding: "16px 20px",
              borderTop: "1px solid var(--border-subtle)",
              background: "var(--bg-surface-raised)",
              display: "flex",
              gap: 12,
            }}
          >
            <input
              ref={chatInputRef}
              type="text"
              value={chatInput}
              onChange={(e) => setChatInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  sendChatMessage();
                }
              }}
              placeholder="Ask about pricing, marketing, products, customers…"
              style={{
                flex: 1,
                padding: "10px 16px",
                borderRadius: 10,
                border: "1px solid var(--border-input)",
                background: "var(--bg-input)",
                color: "var(--text-primary)",
                fontSize: "0.88rem",
                outline: "none",
              }}
              disabled={isChatLoading}
            />
            <button
              onClick={() => sendChatMessage()}
              disabled={!chatInput.trim() || isChatLoading}
              style={{
                padding: "10px 20px",
                borderRadius: 10,
                border: "none",
                background:
                  !chatInput.trim() || isChatLoading
                    ? "var(--bg-surface)"
                    : "linear-gradient(135deg, #818cf8, #6366f1)",
                color:
                  !chatInput.trim() || isChatLoading
                    ? "var(--text-muted)"
                    : "white",
                fontWeight: 700,
                cursor: !chatInput.trim() || isChatLoading ? "not-allowed" : "pointer",
                fontSize: "0.85rem",
                transition: "all 0.2s",
              }}
            >
              Send →
            </button>
          </div>
        </div>
      )}

      {/* ──── TOOLS TAB ──── */}
      {activeTab === "tools" && (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(340px, 1fr))", gap: 20 }}>
          {/* Product Description Generator */}
          <div
            style={{
              background: "var(--bg-surface)",
              border: "1px solid var(--border-subtle)",
              borderRadius: 16,
              padding: 24,
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 20 }}>
              <div
                style={{
                  width: 44,
                  height: 44,
                  borderRadius: 10,
                  background: "linear-gradient(135deg, #818cf8, #6366f1)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: "white"
                }}
              >
                <DynamicIcon name="edit" size={22} />
              </div>
              <div>
                <h3 style={{ fontWeight: 700, color: "var(--text-primary)", fontSize: "1rem" }}>
                  AI Product Description
                </h3>
                <p style={{ color: "var(--text-muted)", fontSize: "0.78rem" }}>
                  Generate SEO-optimized copy in seconds
                </p>
              </div>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              <div>
                <label
                  style={{
                    display: "block",
                    fontSize: "0.8rem",
                    fontWeight: 600,
                    color: "var(--text-secondary)",
                    marginBottom: 6,
                  }}
                >
                  Product Name *
                </label>
                <input
                  type="text"
                  value={pdProductName}
                  onChange={(e) => setPdProductName(e.target.value)}
                  placeholder="e.g. Oud Noir Perfume 100ml"
                  style={{
                    width: "100%",
                    padding: "10px 14px",
                    borderRadius: 8,
                    border: "1px solid var(--border-input)",
                    background: "var(--bg-input)",
                    color: "var(--text-primary)",
                    fontSize: "0.88rem",
                    outline: "none",
                  }}
                />
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                <div>
                  <label
                    style={{
                      display: "block",
                      fontSize: "0.8rem",
                      fontWeight: 600,
                      color: "var(--text-secondary)",
                      marginBottom: 6,
                    }}
                  >
                    Category
                  </label>
                  <input
                    type="text"
                    value={pdCategory}
                    onChange={(e) => setPdCategory(e.target.value)}
                    placeholder="e.g. Perfumes"
                    style={{
                      width: "100%",
                      padding: "10px 14px",
                      borderRadius: 8,
                      border: "1px solid var(--border-input)",
                      background: "var(--bg-input)",
                      color: "var(--text-primary)",
                      fontSize: "0.88rem",
                      outline: "none",
                    }}
                  />
                </div>
                <div>
                  <label
                    style={{
                      display: "block",
                      fontSize: "0.8rem",
                      fontWeight: 600,
                      color: "var(--text-secondary)",
                      marginBottom: 6,
                    }}
                  >
                    Language
                  </label>
                  <select
                    value={pdLocale}
                    onChange={(e) => setPdLocale(e.target.value as "en" | "ar")}
                    style={{
                      width: "100%",
                      padding: "10px 14px",
                      borderRadius: 8,
                      border: "1px solid var(--border-input)",
                      background: "var(--bg-input)",
                      color: "var(--text-primary)",
                      fontSize: "0.88rem",
                      outline: "none",
                    }}
                  >
                    <option value="en">English</option>
                    <option value="ar">Arabic (العربية)</option>
                  </select>
                </div>
              </div>

              <button
                onClick={generateDescription}
                disabled={!pdProductName.trim() || pdLoading}
                className="btn-primary"
                style={{
                  width: "100%",
                  padding: "11px",
                  borderRadius: 8,
                  fontSize: "0.88rem",
                  opacity: !pdProductName.trim() || pdLoading ? 0.6 : 1,
                  cursor: !pdProductName.trim() || pdLoading ? "not-allowed" : "pointer",
                }}
              >
                {pdLoading ? "✨ Generating…" : "✨ Generate Description"}
              </button>

              {pdError && (
                <div
                  style={{
                    padding: "10px 14px",
                    background: "rgba(248,113,113,0.06)",
                    border: "1px solid rgba(248,113,113,0.2)",
                    borderRadius: 8,
                    color: "#f87171",
                    fontSize: "0.82rem",
                  }}
                >
                  ⚠️ {pdError}
                </div>
              )}

              {pdResult && (
                <div
                  style={{
                    background: "var(--bg-surface-raised)",
                    border: "1px solid var(--border-accent)",
                    borderRadius: 10,
                    padding: 14,
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      marginBottom: 10,
                    }}
                  >
                    <span
                      style={{
                        fontSize: "0.78rem",
                        fontWeight: 700,
                        color: "var(--accent-primary)",
                        display: "flex",
                        alignItems: "center",
                        gap: 6
                      }}
                    >
                      <DynamicIcon name="check" size={14} />
                      Generated Description
                    </span>
                    <button
                      onClick={copyDescription}
                      style={{
                        padding: "4px 10px",
                        borderRadius: 6,
                        border: "1px solid var(--border-input)",
                        background: "transparent",
                        color: "var(--text-secondary)",
                        fontSize: "0.75rem",
                        cursor: "pointer",
                        fontWeight: 600,
                        display: "flex",
                        alignItems: "center",
                        gap: 4
                      }}
                    >
                      {pdCopied ? (
                        <>
                          <DynamicIcon name="check" size={12} />
                          <span>Copied!</span>
                        </>
                      ) : (
                        <>
                          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>
                          <span>Copy</span>
                        </>
                      )}
                    </button>
                  </div>
                  <p
                    style={{
                      fontSize: "0.82rem",
                      color: "var(--text-secondary)",
                      lineHeight: 1.7,
                      whiteSpace: "pre-wrap",
                      direction: pdLocale === "ar" ? "rtl" : "ltr",
                    }}
                  >
                    {pdResult}
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Store Health Card */}
          <div
            style={{
              background: "var(--bg-surface)",
              border: "1px solid var(--border-subtle)",
              borderRadius: 16,
              padding: 24,
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 20 }}>
              <div
                style={{
                  width: 44,
                  height: 44,
                  borderRadius: 10,
                  background: "linear-gradient(135deg, #34d399, #059669)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: "white"
                }}
              >
                <DynamicIcon name="shield" size={22} />
              </div>
              <div>
                <h3 style={{ fontWeight: 700, color: "var(--text-primary)", fontSize: "1rem" }}>
                  Store Health Score
                </h3>
                <p style={{ color: "var(--text-muted)", fontSize: "0.78rem" }}>
                  Optimization checklist
                </p>
              </div>
            </div>

            {(() => {
              const checks = [
                {
                  label: "Products in catalog",
                  passed: metrics.totalProducts > 0,
                  tip: "Add at least 1 product",
                },
                {
                  label: "Active products published",
                  passed: metrics.activeProducts > 0,
                  tip: "Publish draft products",
                },
                {
                  label: "First order received",
                  passed: metrics.totalOrders > 0,
                  tip: "Share your store link",
                },
                {
                  label: "Customer base growing",
                  passed: metrics.totalCustomers > 0,
                  tip: "Promote on social media",
                },
                {
                  label: "Revenue generating",
                  passed: metrics.totalRevenue > 0,
                  tip: "Improve store design & prices",
                },
              ];
              const score = Math.round((checks.filter((c) => c.passed).length / checks.length) * 100);
              const scoreColor =
                score >= 80 ? "#34d399" : score >= 50 ? "#fbbf24" : "#f87171";

              return (
                <div>
                  {/* Score */}
                  <div
                    style={{
                      textAlign: "center",
                      padding: "20px 0",
                      marginBottom: 20,
                    }}
                  >
                    <div
                      style={{
                        fontSize: "3.5rem",
                        fontWeight: 900,
                        color: scoreColor,
                        lineHeight: 1,
                      }}
                    >
                      {score}
                    </div>
                    <div
                      style={{
                        fontSize: "0.85rem",
                        color: "var(--text-muted)",
                        marginTop: 4,
                      }}
                    >
                      out of 100
                    </div>
                    <div
                      style={{
                        height: 6,
                        background: "var(--bg-surface-raised)",
                        borderRadius: 99,
                        marginTop: 12,
                        overflow: "hidden",
                      }}
                    >
                      <div
                        style={{
                          height: "100%",
                          width: `${score}%`,
                          background: scoreColor,
                          borderRadius: 99,
                          transition: "width 1s ease",
                        }}
                      />
                    </div>
                  </div>

                  {/* Checklist */}
                  <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                    {checks.map((check) => (
                      <div
                        key={check.label}
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: 10,
                          padding: "8px 12px",
                          borderRadius: 8,
                          background: check.passed
                            ? "rgba(52,211,153,0.05)"
                            : "rgba(248,113,113,0.04)",
                          border: `1px solid ${check.passed ? "rgba(52,211,153,0.2)" : "rgba(248,113,113,0.12)"}`,
                        }}
                      >
                        <span style={{ display: "inline-flex", color: check.passed ? "#34d399" : "#f87171" }}>
                          <DynamicIcon name={check.passed ? "check" : "x"} size={16} />
                        </span>
                        <div style={{ flex: 1 }}>
                          <div
                            style={{
                              fontSize: "0.83rem",
                              fontWeight: 600,
                              color: "var(--text-primary)",
                            }}
                          >
                            {check.label}
                          </div>
                          {!check.passed && (
                            <div
                              style={{
                                fontSize: "0.75rem",
                                color: "var(--text-muted)",
                              }}
                            >
                              → {check.tip}
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })()}
          </div>
        </div>
      )}

      <style>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        @keyframes bounce {
          0%, 60%, 100% { transform: translateY(0); }
          30% { transform: translateY(-6px); }
        }
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.5; }
        }
      `}</style>
    </div>
  );
}
