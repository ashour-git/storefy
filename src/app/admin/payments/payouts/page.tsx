"use client";

import { useState } from "react";

export default function PayoutsPage() {
  const [loading, setLoading] = useState(false);
  const [payoutAmount, setPayoutAmount] = useState("");

  const handleRequestPayout = async () => {
    if (!payoutAmount) return;
    setLoading(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      alert("Payout requested successfully!");
      setPayoutAmount("");
    } catch (e) {
      console.error(e);
      alert("Failed to request payout");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="admin-page max-w-4xl mx-auto">
      <div className="admin-page-header">
        <h1 className="admin-page-title">Global-Local Payouts</h1>
        <p className="admin-page-subtitle">Manage your earnings, Paymob splits, and withdrawal requests.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="card p-6 bg-surface-primary">
          <h3 className="text-sm font-bold text-muted mb-2">Available to Payout</h3>
          <p className="text-3xl font-black text-accent-primary">12,450 EGP</p>
        </div>
        <div className="card p-6 bg-surface-primary">
          <h3 className="text-sm font-bold text-muted mb-2">Pending (Clearing)</h3>
          <p className="text-3xl font-black">3,200 EGP</p>
        </div>
        <div className="card p-6 bg-surface-primary">
          <h3 className="text-sm font-bold text-muted mb-2">Total Earnings</h3>
          <p className="text-3xl font-black">45,890 EGP</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Request Payout Form */}
        <div className="card p-6">
          <h2 className="text-lg font-bold mb-4">Request Payout</h2>
          <p className="text-sm text-muted mb-6">
            Withdrawals are processed directly to your linked Paymob merchant account or bank account within 1-2 business days.
          </p>

          <div className="flex flex-col gap-4">
            <div className="customizer-form-group mb-0">
              <label className="customizer-label">Amount (EGP)</label>
              <input 
                type="number" 
                className="admin-input" 
                placeholder="Enter amount"
                value={payoutAmount}
                onChange={(e) => setPayoutAmount(e.target.value)}
              />
            </div>
            <button 
              className="btn-primary w-full py-3 mt-2"
              onClick={handleRequestPayout}
              disabled={loading || !payoutAmount}
            >
              {loading ? "Processing..." : "Withdraw Funds"}
            </button>
          </div>
        </div>

        {/* Payout History */}
        <div className="card p-0 overflow-hidden">
          <div className="p-6 border-b border-subtle">
            <h2 className="text-lg font-bold">Recent Payouts</h2>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-sm">
              <thead>
                <tr className="bg-surface-subtle">
                  <th className="p-4 font-bold text-muted border-b border-subtle">Date</th>
                  <th className="p-4 font-bold text-muted border-b border-subtle">Amount</th>
                  <th className="p-4 font-bold text-muted border-b border-subtle">Status</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td className="p-4 border-b border-subtle">Jun 20, 2026</td>
                  <td className="p-4 border-b border-subtle font-medium">8,500 EGP</td>
                  <td className="p-4 border-b border-subtle"><span className="px-2 py-1 bg-green-500/10 text-green-600 rounded text-xs font-bold">Completed</span></td>
                </tr>
                <tr>
                  <td className="p-4 border-b border-subtle">Jun 15, 2026</td>
                  <td className="p-4 border-b border-subtle font-medium">10,200 EGP</td>
                  <td className="p-4 border-b border-subtle"><span className="px-2 py-1 bg-green-500/10 text-green-600 rounded text-xs font-bold">Completed</span></td>
                </tr>
                <tr>
                  <td className="p-4">Jun 01, 2026</td>
                  <td className="p-4 font-medium">5,000 EGP</td>
                  <td className="p-4"><span className="px-2 py-1 bg-green-500/10 text-green-600 rounded text-xs font-bold">Completed</span></td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
