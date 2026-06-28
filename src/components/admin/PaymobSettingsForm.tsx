"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

interface PaymobSettings {
  sandboxReady?: boolean;
  integrationId?: string;
  iframeId?: string;
  checklist?: Record<string, boolean>;
}

export function PaymobSettingsForm({ settings, envReady }: { settings: PaymobSettings; envReady: boolean }) {
  const router = useRouter();
  const [sandboxReady, setSandboxReady] = useState(Boolean(settings?.sandboxReady));
  const [integrationId, setIntegrationId] = useState(String(settings?.integrationId || ""));
  const [iframeId, setIframeId] = useState(String(settings?.iframeId || ""));
  const [checklist, setChecklist] = useState<Record<string, boolean>>(settings?.checklist || {});

  const save = async () => {
    await fetch("/api/admin/payments", { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ sandboxReady, integrationId, iframeId, checklist }) });
    router.refresh();
  };

  const items = ["Create Paymob merchant account", "Use sandbox/test credentials first", "Set PAYMOB_API_KEY in Vercel/Neon env", "Set PAYMOB_INTEGRATION_ID and webhook HMAC", "Place a COD fallback test order"];
  return (
    <div className="admin-settings-card launch-panel">
      <h2 className="admin-settings-card-title">Paymob merchant setup</h2>
      <p className="admin-muted-text">Secrets stay in environment variables. This screen stores only non-secret sandbox notes and checklist state.</p>
      <div className={`admin-alert ${envReady ? "success" : "warning"}`}>{envReady ? "Paymob env keys detected." : "No Paymob env keys detected. Checkout uses the free mock/COD fallback."}</div>
      <div className="launch-form-grid">
        <label className="admin-form-group"><span className="admin-label">Integration ID note</span><input className="admin-input" value={integrationId} onChange={(event) => setIntegrationId(event.target.value)} /></label>
        <label className="admin-form-group"><span className="admin-label">Iframe ID note</span><input className="admin-input" value={iframeId} onChange={(event) => setIframeId(event.target.value)} /></label>
        <label className="admin-form-group"><span className="admin-label">Sandbox ready</span><input type="checkbox" checked={sandboxReady} onChange={(event) => setSandboxReady(event.target.checked)} /></label>
      </div>
      <div className="launch-checklist compact">
        {items.map((item) => <label key={item}><input type="checkbox" checked={Boolean(checklist[item])} onChange={(event) => setChecklist({ ...checklist, [item]: event.target.checked })} /> <span>{item}</span></label>)}
      </div>
      <button type="button" onClick={save} className="btn-primary">Save Paymob checklist</button>
    </div>
  );
}
