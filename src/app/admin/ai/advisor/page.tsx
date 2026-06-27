"use client";

import { useState, useRef, useEffect } from "react";
import { IconSparkles } from "../../../../components/IconLibrary";

export default function BusinessAdvisorPage() {
  const [messages, setMessages] = useState<any[]>([
    { role: 'assistant', content: "Hi! I'm your Storefy Business Advisor. I can analyze your sales, suggest marketing campaigns, or help you write product descriptions. What's on your mind?" }
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim()) return;
    
    const userMessage = { role: 'user', content: input };
    setMessages(prev => [...prev, userMessage]);
    setInput("");
    setLoading(true);

    try {
      const res = await fetch("/api/admin/ai/advisor", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: [...messages, userMessage] })
      });
      const data = await res.json();
      
      if (data.error) throw new Error(data.error);
      
      setMessages(prev => [...prev, { role: 'assistant', content: data.reply }]);
    } catch (e: any) {
      console.error(e);
      setMessages(prev => [...prev, { role: 'assistant', content: "Sorry, I ran into an error. Please try again." }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="admin-page h-[calc(100vh-2rem)] flex flex-col max-w-4xl mx-auto">
      <div className="admin-page-header shrink-0">
        <h1 className="admin-page-title flex items-center gap-2">
          <IconSparkles size={28} className="text-accent-primary" /> 
          Business Advisor
        </h1>
        <p className="admin-page-subtitle">Your AI co-pilot for growth, analytics, and marketing.</p>
      </div>

      <div className="card flex-1 flex flex-col min-h-0">
        <div className="flex-1 overflow-y-auto p-6 flex flex-col gap-6">
          {messages.map((msg, i) => (
            <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-[80%] rounded-2xl p-4 ${
                msg.role === 'user' 
                  ? 'bg-accent-primary text-white rounded-br-none' 
                  : 'bg-surface-subtle text-text-primary rounded-bl-none border border-subtle'
              }`}>
                <div className="whitespace-pre-wrap">{msg.content}</div>
              </div>
            </div>
          ))}
          {loading && (
            <div className="flex justify-start">
              <div className="bg-surface-subtle border border-subtle rounded-2xl rounded-bl-none p-4 max-w-[80%]">
                <div className="flex gap-1 items-center h-5">
                  <div className="w-2 h-2 rounded-full bg-muted animate-bounce" style={{ animationDelay: '0ms' }} />
                  <div className="w-2 h-2 rounded-full bg-muted animate-bounce" style={{ animationDelay: '150ms' }} />
                  <div className="w-2 h-2 rounded-full bg-muted animate-bounce" style={{ animationDelay: '300ms' }} />
                </div>
              </div>
            </div>
          )}
          <div ref={bottomRef} />
        </div>

        <div className="p-4 border-t border-subtle shrink-0">
          <div className="flex gap-2">
            <input 
              type="text" 
              className="admin-input flex-1 bg-surface-primary" 
              placeholder="Ask about sales, marketing ideas, or product optimization..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSend()}
              disabled={loading}
            />
            <button 
              className="btn-primary px-6"
              onClick={handleSend}
              disabled={loading || !input.trim()}
            >
              Send
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
