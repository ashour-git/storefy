"use client";

import { useState } from "react";

export function LaunchPlanGenerator() {
  const [audience, setAudience] = useState("");
  const [goal, setGoal] = useState("first 10 orders");
  const [channels, setChannels] = useState("WhatsApp, Instagram");
  const [plan, setPlan] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const generate = async () => {
    setLoading(true);
    const response = await fetch("/api/ai/launch-plan", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ audience, goal, channels: channels.split(",").map((channel) => channel.trim()).filter(Boolean) }),
    });
    setPlan(await response.json());
    setLoading(false);
  };

  return (
    <div className="admin-settings-card launch-panel">
      <h2 className="admin-settings-card-title">AI launch interview</h2>
      <p className="admin-muted-text">Uses Groq when configured and a deterministic free fallback otherwise.</p>
      <div className="launch-form-grid">
        <label className="admin-form-group"><span className="admin-label">Target audience</span><input className="admin-input" value={audience} onChange={(event) => setAudience(event.target.value)} placeholder="New moms in Cairo, fragrance lovers..." /></label>
        <label className="admin-form-group"><span className="admin-label">Launch goal</span><input className="admin-input" value={goal} onChange={(event) => setGoal(event.target.value)} /></label>
        <label className="admin-form-group"><span className="admin-label">Channels</span><input className="admin-input" value={channels} onChange={(event) => setChannels(event.target.value)} /></label>
      </div>
      <button className="btn-primary" type="button" onClick={generate} disabled={loading}>{loading ? "Generating..." : "Generate launch plan"}</button>
      {plan?.plan && <div className="launch-plan-output"><h3>{plan.plan.headline}</h3><p>{plan.plan.positioning}</p><strong>{plan.plan.offer}</strong>{plan.plan.checklist.map((item: string) => <p key={item}>- {item}</p>)}</div>}
    </div>
  );
}
