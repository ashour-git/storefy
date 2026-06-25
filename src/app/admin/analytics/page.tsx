"use client";

import { useState } from "react";
import { IconRevenue, IconCart, IconUsers } from "../../../components/IconLibrary";

export default function AnalyticsPage() {
  const [query, setQuery] = useState("");
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleQuery = async (customQuery?: string) => {
    const q = customQuery || query;
    if (!q.trim()) return;
    
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/admin/analytics", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query: q }),
      });
      const data = await res.json();
      if (data.error) throw new Error(data.error);
      setResult(data);
    } catch (e: any) {
      setError(e.message || "Failed to analyze data");
    } finally {
      setLoading(false);
    }
  };

  const presets = [
    "How much revenue did I make last week?",
    "What are my top 3 selling products?",
    "Show me the customer growth over the last month",
    "Which category has the highest average order value?"
  ];

  const maxVal = result?.dataPoints ? Math.max(...result.dataPoints.map((d: any) => d.value), 1) : 1;

  return (
    <div className="admin-page">
      <div className="admin-page-header">
        <h1 className="admin-page-title">AI Business Insights</h1>
        <p className="admin-page-subtitle">Ask anything about your store in plain English or Arabic.</p>
      </div>

      <div className="flex flex-col gap-6">
        {/* Search Bar */}
        <div className="card p-6">
          <div className="flex gap-2">
            <input
              type="text"
              className="admin-input flex-1"
              placeholder='e.g., "Compare this month vs last month revenue"'
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleQuery()}
              disabled={loading}
            />
            <button 
              className="btn-primary" 
              onClick={() => handleQuery()}
              disabled={loading || !query.trim()}
            >
              {loading ? "Analyzing..." : "Ask AI"}
            </button>
          </div>
          <div className="flex flex-wrap gap-2 mt-4">
            {presets.map((p, i) => (
              <button 
                key={i} 
                className="text-xs bg-accent-primary/5 hover:bg-accent-primary/10 text-accent-primary border border-accent-primary/20 px-3 py-1.5 rounded-full transition-colors"
                onClick={() => handleQuery(p)}
              >
                {p}
              </button>
            ))}
          </div>
          {error && <p className="text-red-500 text-sm mt-3">{error}</p>}
        </div>

        {/* Results Area */}
        {result && (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 flex flex-col gap-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="card p-6 md:col-span-2">
                <h3 className="text-lg font-bold mb-1">{result.explanation}</h3>
                <p className="text-sm text-muted mb-6">{result.insight}</p>
                
                {/* Dynamic Charting Logic */}
                {result.visualType === 'bar' && (
                  <div className="flex flex-col gap-4">
                    {result.dataPoints.map((d: any, i: number) => (
                      <div key={i} className="flex flex-col gap-1">
                        <div className="flex justify-between text-xs">
                          <span className="font-medium">{d.label}</span>
                          <span className="text-muted">{d.value.toLocaleString()}</span>
                        </div>
                        <div className="h-6 w-full bg-surface-subtle rounded-full overflow-hidden border border-subtle">
                          <div 
                            className="h-full bg-gradient-to-r from-accent-primary to-accent-secondary"
                            style={{ width: `${(d.value / maxVal) * 100}%`, transition: 'width 1s cubic-bezier(0.16, 1, 0.3, 1)' }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {result.visualType === 'kpi' && (
                  <div className="py-8 flex items-center justify-center">
                    <div className="text-center">
                      <div className="text-5xl font-black text-accent-primary mb-2">
                        {result.dataPoints[0]?.value.toLocaleString()}
                      </div>
                      <div className="text-muted font-medium">{result.dataPoints[0]?.label}</div>
                    </div>
                  </div>
                )}
              </div>

              <div className="flex flex-col gap-6">
                <div className="card p-6 bg-accent-primary/5 border-accent-primary/20">
                  <h4 className="text-sm font-bold text-accent-primary uppercase tracking-wider mb-2">AI Summary</h4>
                  <p className="text-sm leading-relaxed text-secondary-900">
                    Based on your store data, ${result.insight}. This indicates a strong trend in ${result.explanation.toLowerCase()}.
                  </p>
                </div>
                <div className="card p-6">
                  <h4 className="text-sm font-bold uppercase tracking-wider mb-4">Related Queries</h4>
                  <ul className="flex flex-col gap-3">
                    <li className="text-xs text-muted hover:text-accent-primary cursor-pointer">Show orders for this segment</li>
                    <li className="text-xs text-muted hover:text-accent-primary cursor-pointer">Download report as CSV</li>
                    <li className="text-xs text-muted hover:text-accent-primary cursor-pointer">Forecast next month</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
