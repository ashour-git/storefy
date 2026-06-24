"use client";

import React, { useState, useRef, useEffect, useCallback } from "react";
import type { AiPlan } from "../../lib/ai/plans";
import { DynamicIcon } from "../IconLibrary";

interface Store { id: string; slug: string; name: string; category: string | null; }
interface Metrics { totalProducts: number; activeProducts: number; totalOrders: number; totalRevenue: number; avgOrderValue: number; totalCustomers: number; recentOrders: any[]; topProducts: any[]; }
interface Props { store: Store; metrics: Metrics; aiPlan: AiPlan; }
interface Conversation { id: string; title: string; createdAt: string; messages: ChatMessage[]; }
interface ChatMessage { role: "user" | "assistant" | "system"; content: string; }
interface UsageData { used: number; limit: number; }

const CMD_LIST = [
  { cmd: "/overview", label: "Store performance overview" },
  { cmd: "/products", label: "Product catalog analysis" },
  { cmd: "/orders", label: "Order analysis" },
  { cmd: "/discount", label: "Create a discount suggestion" },
  { cmd: "/health", label: "Store health score" },
  { cmd: "/help", label: "Show available commands" },
];

function formatDate(iso: string): string {
  try { return new Date(iso).toLocaleDateString(undefined, { month: "short", day: "numeric" }); } catch { return ""; }
}

function renderMarkdown(text: string): React.ReactNode[] {
  const out: React.ReactNode[] = [];
  let k = 0, i = 0, inCode = false, buf: string[] = [];
  const lines = text.split("\n");
  while (i < lines.length) {
    const line = lines[i];
    if (line.startsWith("```")) {
      if (inCode) { out.push(<pre key={k++} style={{ background: "rgba(0,0,0,0.3)", padding: "10px 14px", borderRadius: 10, overflowX: "auto", fontSize: "0.8rem", margin: "6px 0", lineHeight: 1.5, fontFamily: "monospace", whiteSpace: "pre-wrap", wordBreak: "break-word" }}>{buf.join("\n")}</pre>); buf = []; inCode = false; }
      else { inCode = true; }
      i++; continue;
    }
    if (inCode) { buf.push(line); i++; continue; }
    if (line.trim() === "") { if (i > 0 && lines[i - 1].trim() !== "") out.push(<br key={k++} />); i++; continue; }
    const segs: React.ReactNode[] = [];
    let rem = line, sk = 0;
    while (rem.length > 0) {
      const bM = rem.match(/\*\*(.+?)\*\*/), cM = rem.match(/`(.+?)`/);
      let fi = rem.length, mt: "bold" | "code" | null = null, m: RegExpMatchArray | null = null;
      if (bM && bM.index! < fi) { fi = bM.index!; mt = "bold"; m = bM; }
      if (cM && cM.index! < fi) { fi = cM.index!; mt = "code"; m = cM; }
      if (!mt) { segs.push(<span key={sk++}>{rem}</span>); break; }
      if (fi > 0) segs.push(<span key={sk++}>{rem.slice(0, fi)}</span>);
      if (mt === "bold") segs.push(<strong key={sk++} style={{ color: "#e2e8f0", fontWeight: 700 }}>{m![1]}</strong>);
      else segs.push(<code key={sk++} style={{ background: "rgba(129,140,248,0.12)", padding: "1px 6px", borderRadius: 4, fontSize: "0.82rem", fontFamily: "monospace", color: "#a5b4fc" }}>{m![1]}</code>);
      rem = rem.slice(fi + m![0].length);
    }
    if (line.startsWith("- ") || line.startsWith("• ")) out.push(<div key={k++} style={{ display: "flex", gap: 8, alignItems: "flex-start", paddingLeft: 4, margin: "2px 0" }}><span style={{ color: "#818cf8", flexShrink: 0, marginTop: 2 }}>•</span><span>{segs}</span></div>);
    else if (/^\d+\.\s/.test(line)) out.push(<div key={k++} style={{ display: "flex", gap: 8, alignItems: "flex-start", paddingLeft: 4, margin: "2px 0" }}><span style={{ color: "#818cf8", flexShrink: 0, fontVariantNumeric: "tabular-nums", fontWeight: 600, fontSize: "0.82rem" }}>{line.match(/^\d+/)?.[0]}.</span><span>{segs}</span></div>);
    else out.push(<div key={k++} style={{ margin: "2px 0", lineHeight: 1.65 }}>{segs}</div>);
    i++;
  }
  if (inCode && buf.length > 0) out.push(<pre key={k++} style={{ background: "rgba(0,0,0,0.3)", padding: "10px 14px", borderRadius: 10, fontSize: "0.8rem", margin: "6px 0", lineHeight: 1.5, fontFamily: "monospace", whiteSpace: "pre-wrap" }}>{buf.join("\n")}</pre>);
  return out;
}

const SIDEBAR = 280;
const V = (p: string, fallback: string) => `var(${p}, ${fallback})`;

export function AIAgentDashboard({ store, metrics, aiPlan }: Props) {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [activeConvId, setActiveConvId] = useState<string | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [streamingText, setStreamingText] = useState("");
  const [isStreaming, setIsStreaming] = useState(false);
  const [error, setError] = useState("");
  const [showCmdPalette, setShowCmdPalette] = useState(false);
  const [cmdFilter, setCmdFilter] = useState("");
  const [usage, setUsage] = useState<UsageData>({ used: 0, limit: aiPlan.monthlyGenerations });
  const [lastAssistantMsg, setLastAssistantMsg] = useState("");
  const msgEnd = useRef<HTMLDivElement>(null);
  const inpRef = useRef<HTMLInputElement>(null);
  const cmdRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = useCallback(() => msgEnd.current?.scrollIntoView({ behavior: "smooth" }), []);
  useEffect(() => { scrollToBottom(); }, [messages, streamingText, scrollToBottom]);

  useEffect(() => { fetchConversations(); fetchUsage(); }, []);

  useEffect(() => {
    const h = (e: MouseEvent) => { if (cmdRef.current && !cmdRef.current.contains(e.target as Node) && inpRef.current && !inpRef.current.contains(e.target as Node)) setShowCmdPalette(false); };
    document.addEventListener("mousedown", h);
    return () => document.removeEventListener("mousedown", h);
  }, []);

  const fetchConversations = async () => {
    try { const r = await fetch("/api/ai/conversations"); if (r.ok) { const data = await r.json() as { conversations: Conversation[] }; setConversations(data.conversations || []); } } catch { /* ignore */ }
  };
  const fetchUsage = async () => {
    try { const r = await fetch("/api/ai/usage"); if (r.ok) setUsage(await r.json() as UsageData); } catch { /* ignore */ }
  };
  const saveConversation = async (id: string, title: string, msgs: ChatMessage[]) => {
    try { await fetch("/api/ai/conversations", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id, title, messages: msgs }) }); } catch { /* ignore */ }
  };
  const loadConversation = (conv: Conversation) => { setActiveConvId(conv.id); setMessages(conv.messages); setError(""); };
  const newConversation = () => { setActiveConvId(null); setMessages([]); setStreamingText(""); setIsStreaming(false); setError(""); setLastAssistantMsg(""); inpRef.current?.focus(); };
  const deleteConversation = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    try { const r = await fetch(`/api/ai/conversations/${id}`, { method: "DELETE" }); if (r.ok) { setConversations((p) => p.filter((c) => c.id !== id)); if (activeConvId === id) newConversation(); } } catch { /* ignore */ }
  };

  const sendMessage = async (text?: string) => {
    const q = (text || input).trim();
    if (!q || isStreaming) return;
    const userMsg: ChatMessage = { role: "user", content: q };
    const updated = [...messages, userMsg];
    setMessages(updated); setInput(""); setError(""); setShowCmdPalette(false); setCmdFilter(""); setIsStreaming(true); setStreamingText("");
    if (!activeConvId) {
      const cid = `conv_${Date.now()}`;
      setActiveConvId(cid);
      const title = q.length > 50 ? q.slice(0, 50) + "..." : q;
      setConversations((p) => [{ id: cid, title, createdAt: new Date().toISOString(), messages: [] }, ...p]);
    }
    try {
      const res = await fetch("/api/ai/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question: q, messageHistory: updated.map((m) => ({ role: m.role === "system" ? "assistant" : m.role, content: m.content })) }),
      });
      if (!res.ok) { setError(((await res.json().catch(() => ({}))) as { error?: string }).error || "Request failed"); setIsStreaming(false); return; }
      const reader = res.body?.getReader();
      if (!reader) { setError("No response stream"); setIsStreaming(false); return; }
      const decoder = new TextDecoder();
      let full = "", buf = "";
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        buf += decoder.decode(value, { stream: true });
        const lines = buf.split("\n");
        buf = lines.pop() || "";
        for (const line of lines) {
          const t = line.trim();
          if (!t.startsWith("data: ")) continue;
          try {
            const p = JSON.parse(t.slice(6)) as { token?: string; done?: boolean; error?: string };
            if (p.token) { full += p.token; setStreamingText(full); }
            if (p.done) {
              const assMsg: ChatMessage = { role: "assistant", content: full };
              const final = [...updated, assMsg];
              setMessages(final); setStreamingText(""); setLastAssistantMsg(full);
              const cid = activeConvId || `conv_${Date.now()}`;
              const title = messages.length === 0 ? (q.length > 50 ? q.slice(0, 50) + "..." : q) : conversations.find((c) => c.id === cid)?.title || "Chat";
              await saveConversation(cid, title, final);
              setConversations((p) => p.map((c) => c.id === cid ? { ...c, messages: final, title } : c));
            }
            if (p.error) setError(p.error);
          } catch { /* skip */ }
        }
      }
      if (full && !messages.find((m) => m.role === "assistant" && m.content === full)) {
        const final = [...updated, { role: "assistant" as const, content: full }];
        setMessages(final); setLastAssistantMsg(full);
      }
    } catch { setError("Network error. Check your connection."); } finally { setIsStreaming(false); fetchUsage(); }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const v = e.target.value; setInput(v);
    if (v === "/") { setShowCmdPalette(true); setCmdFilter(""); }
    else if (v.startsWith("/")) { setShowCmdPalette(true); setCmdFilter(v.slice(1)); }
    else setShowCmdPalette(false);
  };
  const handleKeyDown = (e: React.KeyboardEvent) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); void sendMessage(); } if (e.key === "Escape") setShowCmdPalette(false); };

  const filteredCmds = showCmdPalette ? CMD_LIST.filter((c) => c.cmd.slice(1).startsWith(cmdFilter)) : [];

  const getStarterPrompts = (): string[] => {
    const p: string[] = [];
    if (metrics.totalProducts === 0) p.push("How do I add my first products?", "What categories should I create?");
    else if (metrics.totalOrders === 0) p.push("How do I get my first sale?", "Best marketing channels?");
    else p.push("How can I increase AOV?", "Analyze my recent orders");
    p.push("Store performance overview", "What should I improve?");
    return p;
  };

  const getFollowUpPrompts = (): string[] => {
    const lc = lastAssistantMsg.toLowerCase();
    const s: string[] = [];
    if (lc.includes("discount") || lc.includes("coupon") || lc.includes("promo")) s.push("Create a discount code");
    if (lc.includes("product") || lc.includes("catalog") || lc.includes("inventory")) s.push("How to optimize my catalog?");
    if (lc.includes("order") || lc.includes("sale") || lc.includes("revenue")) s.push("Analyze sales trends");
    if (lc.includes("marketing") || lc.includes("channel") || lc.includes("social")) s.push("Best marketing channels for my store");
    if (lc.includes("seo") || lc.includes("traffic") || lc.includes("visitor")) s.push("Improve store SEO");
    s.push("Give me an action plan");
    return s.slice(0, 3);
  };

  const starterPrompts = getStarterPrompts();
  const followUpPrompts = messages.length > 1 && lastAssistantMsg ? getFollowUpPrompts() : [];
  const usagePct = usage.limit > 0 ? Math.min((usage.used / usage.limit) * 100, 100) : 0;
  const showStarters = messages.length === 0 || (messages.length === 1 && messages[0]?.role === "system");

  const C = V("--bg-primary", "#0b0f19");
  const CS = V("--bg-surface", "#111827");
  const CSR = V("--bg-surface-raised", "#121c30");
  const CT1 = V("--text-primary", "#f1f5f9");
  const CT2 = V("--text-secondary", "#94a3b8");
  const CTM = V("--text-muted", "#64748b");
  const CA = V("--accent-primary", "#818cf8");
  const CAG = V("--accent-glow", "rgba(129,140,248,0.25)");
  const CBI = V("--border-input", "rgba(148,163,184,0.15)");
  const CBS = V("--border-subtle", "rgba(148,163,184,0.08)");
  const CAG2 = V("--accent-gradient", "linear-gradient(135deg,#818cf8,#6366f1)");
  const RAD = V("--radius-lg", "16px");

  const s: Record<string, React.CSSProperties> = {
    container: { display: "flex", height: "100%", minHeight: "calc(100vh - 80px)", background: C, color: CT1, position: "relative", overflow: "hidden", borderRadius: RAD, border: `1px solid ${CBS}` },
    sidebar: { width: sidebarOpen ? SIDEBAR : 0, minWidth: sidebarOpen ? SIDEBAR : 0, overflow: "hidden", background: CS, borderRight: `1px solid ${CBS}`, display: "flex", flexDirection: "column", transition: "width 0.25s ease, min-width 0.25s ease", flexShrink: 0 },
    main: { flex: 1, display: "flex", flexDirection: "column", minWidth: 0, position: "relative" },
    msgArea: { flex: 1, overflowY: "auto", padding: sidebarOpen ? "20px 24px" : "48px 24px 20px", display: "flex", flexDirection: "column", gap: 6 },
    inputArea: { padding: "14px 20px", borderTop: `1px solid ${CBS}`, background: C, position: "relative" },
    userBubble: { maxWidth: "75%", padding: "12px 18px", borderRadius: "18px 18px 4px 18px", background: CAG2, color: "white", fontSize: "0.88rem", lineHeight: 1.6, border: "none", boxShadow: `0 4px 14px ${CAG}`, wordBreak: "break-word" },
    assBubble: { maxWidth: "75%", padding: "12px 18px", borderRadius: "18px 18px 18px 4px", background: CS, color: CT1, fontSize: "0.88rem", lineHeight: 1.6, border: `1px solid ${CBS}`, wordBreak: "break-word" },
    input: { flex: 1, padding: "11px 16px", borderRadius: 12, border: `1px solid ${CBI}`, background: V("--bg-input", "#0f172a"), color: CT1, fontSize: "0.88rem", outline: "none", fontFamily: "inherit" },
    actBtn: { padding: "5px 12px", borderRadius: 999, border: `1px solid rgba(129,140,248,0.15)`, background: "rgba(129,140,248,0.06)", color: CA, fontSize: "0.73rem", fontWeight: 600, cursor: "pointer", display: "inline-flex", alignItems: "center", gap: 6 },
    errBox: { padding: "10px 14px", borderRadius: 10, background: "rgba(248,113,113,0.08)", border: "1px solid rgba(248,113,113,0.2)", color: V("--error", "#f87171"), fontSize: "0.8rem", margin: "4px 0" },
  };
  const sendBtnSx = (disabled: boolean): React.CSSProperties => ({ padding: "11px 18px", borderRadius: 12, border: "none", background: disabled ? CSR : CAG2, color: disabled ? CTM : "white", fontSize: "0.82rem", fontWeight: 600, cursor: disabled ? "not-allowed" : "pointer", display: "flex", alignItems: "center", gap: 6, flexShrink: 0 });

  const getActBtns = (content: string) => {
    const c = content.toLowerCase();
    const acts: Array<{ label: string; onClick: () => void; icon: string }> = [];
    if (c.includes("discount") || c.includes("coupon") || c.includes("promo")) acts.push({ label: "Create Discount Code", onClick: () => { window.location.href = "/admin/discounts"; }, icon: "gift" });
    if (c.includes("add product") || c.includes("new product") || c.includes("create product")) acts.push({ label: "Add Products", onClick: () => { window.location.href = "/admin/products"; }, icon: "package" });
    if (c.includes("view order") || c.includes("check order") || c.includes("order analysis")) acts.push({ label: "View Orders", onClick: () => { window.location.href = "/admin/orders"; }, icon: "cart" });
    if (acts.length === 0) acts.push({ label: "View Report", onClick: () => {}, icon: "trending-up" });
    return acts;
  };

  return (
    <div style={s.container}>
      <aside style={s.sidebar}>
        <div style={{ padding: "16px 14px 12px", borderBottom: `1px solid ${CBS}`, flexShrink: 0 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 12 }}>
            <div style={{ width: 32, height: 32, borderRadius: 10, background: CAG2, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
              <DynamicIcon name="brain" size={16} color="white" />
            </div>
            <div>
              <div style={{ fontSize: "0.88rem", fontWeight: 700, letterSpacing: "-0.01em", color: CT1 }}>AI Advisor</div>
              <div style={{ fontSize: "0.68rem", color: CTM }}>{aiPlan.name}</div>
            </div>
          </div>
          <div style={{ marginBottom: 6 }}>
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.68rem", color: CTM, marginBottom: 4 }}>
              <span>{usage.used}/{usage.limit} generations</span>
              <span>{Math.round(usagePct)}%</span>
            </div>
            <div style={{ height: 4, background: CSR, borderRadius: 4, overflow: "hidden" }}>
              <div style={{ height: "100%", width: `${usagePct}%`, background: CAG2, borderRadius: 4, transition: "width 0.4s ease" }} />
            </div>
          </div>
          <button onClick={newConversation} type="button" style={{ width: "100%", padding: "9px 14px", borderRadius: 10, border: `1px solid ${V("--border-accent", "rgba(129,140,248,0.2)")}`, background: CAG2, color: "white", fontSize: "0.82rem", fontWeight: 600, cursor: isStreaming ? "not-allowed" : "pointer", display: "flex", alignItems: "center", gap: 8, justifyContent: "center", opacity: isStreaming ? 0.5 : 1 }} disabled={isStreaming}>
            + New Conversation
          </button>
        </div>
        <div style={{ flex: 1, overflowY: "auto", padding: "8px 0" }}>
          {conversations.length === 0 && <div style={{ padding: "20px 16px", textAlign: "center", fontSize: "0.78rem", color: CTM }}>No conversations yet</div>}
          {conversations.map((conv) => (
            <div key={conv.id} onClick={() => loadConversation(conv)} style={{ padding: "10px 14px", cursor: "pointer", background: activeConvId === conv.id ? "rgba(129,140,248,0.08)" : "transparent", borderLeft: activeConvId === conv.id ? `2px solid ${CA}` : "2px solid transparent" }}>
              <div style={{ fontSize: "0.8rem", fontWeight: 500, color: CT1, marginBottom: 3, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{conv.title || "Untitled"}</div>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <span style={{ fontSize: "0.65rem", color: CTM }}>{formatDate(conv.createdAt)}</span>
                <button type="button" onClick={(e) => void deleteConversation(conv.id, e)} style={{ background: "none", border: "none", color: CTM, cursor: "pointer", padding: 2, fontSize: "0.7rem", opacity: 0.5 }} title="Delete"><DynamicIcon name="x" size={12} /></button>
              </div>
            </div>
          ))}
        </div>
        <div style={{ padding: "8px 10px", borderTop: `1px solid ${CBS}`, display: "flex", justifyContent: "flex-end" }}>
          <button type="button" onClick={() => setSidebarOpen(false)} style={{ background: "none", border: "none", color: CTM, cursor: "pointer", padding: 4 }} title="Close sidebar"><DynamicIcon name="x" size={14} /></button>
        </div>
      </aside>

      <div style={s.main}>
        {!sidebarOpen && (
          <button type="button" onClick={() => setSidebarOpen(true)} style={{ position: "absolute", top: 12, left: 12, zIndex: 10, background: CS, border: `1px solid ${CBS}`, borderRadius: 10, padding: "6px 8px", cursor: "pointer", color: CTM, display: "flex", alignItems: "center", gap: 6, fontSize: "0.75rem" }}>
            <DynamicIcon name="scroll" size={14} /> Conversations
          </button>
        )}

        <div style={s.msgArea}>
          {showStarters && (
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", flex: 1, textAlign: "center", padding: "0 20px", gap: 20 }}>
              <div style={{ width: 56, height: 56, borderRadius: 16, background: CAG2, display: "flex", alignItems: "center", justifyContent: "center", opacity: 0.85, boxShadow: `0 0 30px ${CAG}` }}>
                <DynamicIcon name="brain" size={28} color="white" />
              </div>
              <div>
                <div style={{ fontSize: "1.1rem", fontWeight: 700, letterSpacing: "-0.02em", marginBottom: 4, color: CT1 }}>Hi, I'm your AI Advisor</div>
                <div style={{ fontSize: "0.85rem", color: CTM, maxWidth: 380, lineHeight: 1.6 }}>Ask me about your store performance, products, orders, or anything about growing your business.</div>
              </div>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 8, justifyContent: "center", maxWidth: 480 }}>
                {starterPrompts.map((prompt, idx) => (
                  <button key={idx} type="button" onClick={() => void sendMessage(prompt)} style={{ padding: "8px 16px", borderRadius: 999, border: `1px solid rgba(129,140,248,0.12)`, background: CS, color: CT2, fontSize: "0.78rem", fontWeight: 600, cursor: "pointer", whiteSpace: "nowrap" }}
                    onMouseEnter={(e) => { e.currentTarget.style.borderColor = CA; e.currentTarget.style.color = CA; e.currentTarget.style.background = "rgba(129,140,248,0.06)"; }}
                    onMouseLeave={(e) => { e.currentTarget.style.borderColor = "rgba(129,140,248,0.12)"; e.currentTarget.style.color = CT2; e.currentTarget.style.background = CS; }}>
                    {prompt}
                  </button>
                ))}
              </div>
            </div>
          )}

          {messages.map((msg, idx) => (
            <div key={idx}>
              {msg.role === "system" ? (
                <div style={{ textAlign: "center", fontSize: "0.72rem", color: CTM, padding: "12px 0 6px" }}>{msg.content}</div>
              ) : (
                <div style={{ display: "flex", justifyContent: msg.role === "user" ? "flex-end" : "flex-start", marginBottom: 2 }}>
                  <div style={msg.role === "user" ? s.userBubble : s.assBubble}>
                    {msg.role === "assistant" ? renderMarkdown(msg.content) : msg.content}
                  </div>
                </div>
              )}
              {msg.role === "assistant" && (() => {
                const acts = getActBtns(msg.content);
                return acts.length > 0 ? (
                  <div style={{ display: "flex", gap: 8, padding: "6px 0 2px", flexWrap: "wrap", justifyContent: "flex-start" }}>
                    {acts.map((a, ai) => (
                      <button key={ai} type="button" onClick={a.onClick} style={s.actBtn}
                        onMouseEnter={(e) => { e.currentTarget.style.background = "rgba(129,140,248,0.12)"; e.currentTarget.style.borderColor = CA; }}
                        onMouseLeave={(e) => { e.currentTarget.style.background = "rgba(129,140,248,0.06)"; e.currentTarget.style.borderColor = "rgba(129,140,248,0.15)"; }}>
                        <DynamicIcon name={a.icon} size={12} /> {a.label}
                      </button>
                    ))}
                  </div>
                ) : null;
              })()}
            </div>
          ))}

          {isStreaming && streamingText && (
            <div style={{ display: "flex", justifyContent: "flex-start", marginBottom: 2 }}>
              <div style={{ ...s.assBubble }}>
                {renderMarkdown(streamingText)}
                <span style={{ display: "inline-block", width: 2, height: "1em", background: CA, marginLeft: 2, animation: "cursorBlink 0.8s step-end infinite", verticalAlign: "text-bottom" }} />
              </div>
            </div>
          )}

          {!isStreaming && followUpPrompts.length > 0 && (
            <div style={{ display: "flex", gap: 6, padding: "4px 0 8px", flexWrap: "wrap" }}>
              {followUpPrompts.map((p, idx) => (
                <button key={idx} type="button" onClick={() => void sendMessage(p)} style={{ padding: "6px 14px", borderRadius: 999, border: `1px solid rgba(148,163,184,0.1)`, background: "transparent", color: CTM, fontSize: "0.75rem", fontWeight: 500, cursor: "pointer" }}
                  onMouseEnter={(e) => { e.currentTarget.style.borderColor = `rgba(129,140,248,0.2)`; e.currentTarget.style.color = CA; }}
                  onMouseLeave={(e) => { e.currentTarget.style.borderColor = `rgba(148,163,184,0.1)`; e.currentTarget.style.color = CTM; }}>
                  {p}
                </button>
              ))}
            </div>
          )}

          {error && <div style={s.errBox}><DynamicIcon name="alert" size={14} style={{ marginRight: 6, verticalAlign: "middle" }} />{error}</div>}
          <div ref={msgEnd} />
        </div>

        <div style={s.inputArea}>
          {showCmdPalette && filteredCmds.length > 0 && (
            <div ref={cmdRef} style={{ position: "absolute", bottom: "100%", left: 20, right: 20, background: CSR, border: `1px solid ${CBS}`, borderRadius: 12, overflow: "hidden", boxShadow: V("--shadow-modal", "0 24px 64px rgba(0,0,0,0.6)"), zIndex: 50, marginBottom: 4 }}>
              <div style={{ padding: "8px 12px", fontSize: "0.7rem", color: CTM, textTransform: "uppercase", letterSpacing: "0.05em", fontWeight: 600 }}>Commands</div>
              {filteredCmds.map((c) => (
                <div key={c.cmd} onClick={() => { setInput(c.cmd); void sendMessage(c.cmd); }} style={{ padding: "10px 14px", cursor: "pointer", display: "flex", alignItems: "center", gap: 10, fontSize: "0.82rem" }}
                  onMouseEnter={(e) => { e.currentTarget.style.background = "rgba(129,140,248,0.06)"; }}
                  onMouseLeave={(e) => { e.currentTarget.style.background = "transparent"; }}>
                  <span style={{ color: CA, fontFamily: "monospace", fontSize: "0.82rem", fontWeight: 600, minWidth: 80 }}>{c.cmd}</span>
                  <span style={{ color: CT2, fontSize: "0.78rem" }}>{c.label}</span>
                </div>
              ))}
            </div>
          )}
          <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
            <input ref={inpRef} type="text" value={input} onChange={handleInputChange} onKeyDown={handleKeyDown} placeholder="Ask anything... (type / for commands)" style={s.input}
              onFocus={(e) => { e.currentTarget.style.borderColor = CA; e.currentTarget.style.boxShadow = `0 0 0 3px ${CAG}`; }}
              onBlur={(e) => { e.currentTarget.style.borderColor = CBI; e.currentTarget.style.boxShadow = "none"; }}
              disabled={isStreaming} />
            <button type="button" onClick={() => void sendMessage()} disabled={isStreaming || !input.trim()} style={sendBtnSx(isStreaming || !input.trim())}>
              <DynamicIcon name="sparkles" size={14} /> Send
            </button>
          </div>
        </div>
      </div>
      <style>{`@keyframes cursorBlink{0%,50%{opacity:1}51%,100%{opacity:0}}`}</style>
    </div>
  );
}
