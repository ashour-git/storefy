"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export function OrderWorkflowForm({ order }: { order: { id: string; status: string; fulfillmentStatus: string; trackingNumber?: string | null; internalNotes?: string | null } }) {
  const router = useRouter();
  const [status, setStatus] = useState(order.status);
  const [fulfillmentStatus, setFulfillmentStatus] = useState(order.fulfillmentStatus);
  const [trackingNumber, setTrackingNumber] = useState(order.trackingNumber || "");
  const [internalNotes, setInternalNotes] = useState(order.internalNotes || "");
  const [note, setNote] = useState("");
  const [loading, setLoading] = useState(false);

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    setLoading(true);
    await fetch(`/api/admin/orders/${order.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status, fulfillmentStatus, trackingNumber, internalNotes, note }),
    });
    setLoading(false);
    setNote("");
    router.refresh();
  };

  return (
    <form onSubmit={submit} className="admin-settings-card launch-panel">
      <h2 className="admin-settings-card-title">Fulfillment workflow</h2>
      <div className="launch-form-grid">
        <label className="admin-form-group"><span className="admin-label">Order status</span><select className="admin-select" value={status} onChange={(event) => setStatus(event.target.value)}>{["pending", "paid", "fulfilled", "cancelled", "refunded"].map((value) => <option key={value} value={value}>{value}</option>)}</select></label>
        <label className="admin-form-group"><span className="admin-label">Fulfillment</span><select className="admin-select" value={fulfillmentStatus} onChange={(event) => setFulfillmentStatus(event.target.value)}>{["unfulfilled", "packed", "shipped", "delivered", "returned"].map((value) => <option key={value} value={value}>{value}</option>)}</select></label>
        <label className="admin-form-group"><span className="admin-label">Tracking number</span><input className="admin-input" value={trackingNumber} onChange={(event) => setTrackingNumber(event.target.value)} /></label>
      </div>
      <label className="admin-form-group"><span className="admin-label">Internal notes</span><textarea className="admin-input admin-textarea" value={internalNotes} onChange={(event) => setInternalNotes(event.target.value)} /></label>
      <label className="admin-form-group"><span className="admin-label">Timeline note</span><input className="admin-input" value={note} onChange={(event) => setNote(event.target.value)} placeholder="Optional customer or operations note" /></label>
      <button className="btn-primary" type="submit" disabled={loading}>{loading ? "Updating..." : "Update order"}</button>
    </form>
  );
}
