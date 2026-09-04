export function HeroReceipt() {
  return (
    <div>
      <figure className="receipt" aria-label="Printed receipt for a new Storefy order">
        <div className="receipt-head">
          <span>STOREFY • CAIRO</span>
          <strong>فاتورة • Receipt #1042</strong>
          <span>attar-cairo • paymob • cod</span>
        </div>
        <div className="receipt-body">
          <div className="receipt-line"><span>Oud soap ×2</span><span>240 EGP</span></div>
          <div className="receipt-line"><span>Delivery Giza</span><span>35 EGP</span></div>
          <div className="receipt-total"><span>Total • الإجمالي</span><span>275 EGP</span></div>
          <span className="receipt-stamp">مدفوع • Paid</span>
        </div>
        <div className="receipt-perf" aria-hidden="true" />
      </figure>
      <p className="receipt-ticker">live — Mariam opened ceramics-sohag • Omar got paid 1,150 EGP • Huda printed order #1043</p>
    </div>
  );
}

export function HeroLedger() {
  const rows = [
    { time: "00:12", title: "Attar store", desc: "named, priced in EGP" },
    { time: "00:37", title: "Paymob + COD", desc: "cash on delivery on" },
    { time: "00:58", title: "First order", desc: "receipt printed, Cairo → Giza" },
  ];
  return (
    <dl className="hero-ledger animate-fade-up-delay-3" aria-label="Store opening ledger">
      {rows.map((r) => (
        <div className="hero-ledger-row" key={r.time}>
          <dt>{r.time}</dt>
          <dd><strong>{r.title}</strong> — {r.desc}</dd>
          <span className="ledger-check" aria-label="Done"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" aria-hidden="true"><polyline points="20 6 9 17 4 12" /></svg></span>
        </div>
      ))}
    </dl>
  );
}
