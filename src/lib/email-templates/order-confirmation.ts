function escapeHtml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;');
}

interface OrderConfirmationData {
  customerName: string;
  orderId: string;
  storeName: string;
  items: { name: string; quantity: number; unitPrice: string }[];
  subtotal: string;
  discountTotal: string;
  taxTotal: string;
  shippingTotal: string;
  grandTotal: string;
  currency: string;
  paymentMethod: string;
  shippingAddress: {
    firstName: string;
    lastName: string;
    street: string;
    city: string;
    phone: string;
  };
}

export function orderConfirmationHtml(data: OrderConfirmationData): string {
  const itemsHtml = data.items
    .map(
      (item) => `
      <tr>
        <td style="padding:12px 0;border-bottom:1px solid #eee;font-family:IBM Plex Sans Arabic,Inter,sans-serif">${escapeHtml(item.name)}</td>
        <td style="padding:12px 0;border-bottom:1px solid #eee;text-align:center;font-family:Inter,sans-serif">${item.quantity}</td>
        <td style="padding:12px 0;border-bottom:1px solid #eee;text-align:right;font-family:Inter,sans-serif">${Number(item.unitPrice).toFixed(2)} ${data.currency}</td>
      </tr>`
    )
    .join('');

  return `
<!DOCTYPE html>
<html lang="ar" dir="rtl">
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#f5f5f5;font-family:IBM Plex Sans Arabic,Inter,sans-serif">
  <div style="max-width:600px;margin:0 auto;background:#fff">
    <div style="background:#1a1a2e;padding:32px;text-align:center">
      <h1 style="color:#fff;margin:0;font-size:24px">${escapeHtml(data.storeName)}</h1>
    </div>
    <div style="padding:32px">
      <h2 style="color:#1a1a2e;margin:0 0 8px">تم تأكيد طلبك</h2>
      <p style="color:#666;margin:0 0 24px">مرحباً ${escapeHtml(data.customerName)}، تم استلام طلبك بنجاح.</p>

      <div style="background:#f8f9fa;border-radius:8px;padding:16px;margin-bottom:24px">
        <p style="margin:0;color:#666">رقم الطلب</p>
        <p style="margin:4px 0 0;font-weight:bold;color:#1a1a2e;font-size:18px">#${data.orderId.slice(0, 8).toUpperCase()}</p>
      </div>

      <table style="width:100%;border-collapse:collapse;margin-bottom:24px">
        <thead>
          <tr style="border-bottom:2px solid #eee">
            <th style="padding:12px 0;text-align:right;color:#666;font-weight:normal">المنتج</th>
            <th style="padding:12px 0;text-align:center;color:#666;font-weight:normal">الكمية</th>
            <th style="padding:12px 0;text-align:left;color:#666;font-weight:normal">السعر</th>
          </tr>
        </thead>
        <tbody>${itemsHtml}</tbody>
      </table>

      <div style="border-top:2px solid #eee;padding-top:16px;margin-bottom:24px">
        <div style="display:flex;justify-content:space-between;margin-bottom:8px">
          <span style="color:#666">المجموع الفرعي</span>
          <span>${Number(data.subtotal).toFixed(2)} ${data.currency}</span>
        </div>
        ${Number(data.discountTotal) > 0 ? `
        <div style="display:flex;justify-content:space-between;margin-bottom:8px;color:#16a34a">
          <span>الخصم</span>
          <span>-${Number(data.discountTotal).toFixed(2)} ${data.currency}</span>
        </div>` : ''}
        ${Number(data.taxTotal) > 0 ? `
        <div style="display:flex;justify-content:space-between;margin-bottom:8px">
          <span style="color:#666">ضريبة القيمة المضافة (14%)</span>
          <span>${Number(data.taxTotal).toFixed(2)} ${data.currency}</span>
        </div>` : ''}
        <div style="display:flex;justify-content:space-between;margin-bottom:8px">
          <span style="color:#666">الشحن</span>
          <span>${Number(data.shippingTotal).toFixed(2)} ${data.currency}</span>
        </div>
        <div style="display:flex;justify-content:space-between;padding-top:8px;border-top:2px solid #eee;font-size:18px;font-weight:bold">
          <span>الإجمالي</span>
          <span>${Number(data.grandTotal).toFixed(2)} ${data.currency}</span>
        </div>
      </div>

      <div style="background:#f8f9fa;border-radius:8px;padding:16px;margin-bottom:24px">
        <h3 style="margin:0 0 8px;color:#1a1a2e">عنوان الشحن</h3>
        <p style="margin:0;color:#666">
          ${escapeHtml(data.shippingAddress.firstName)} ${escapeHtml(data.shippingAddress.lastName)}<br>
          ${escapeHtml(data.shippingAddress.street)}<br>
          ${escapeHtml(data.shippingAddress.city)}<br>
          ${escapeHtml(data.shippingAddress.phone)}
        </p>
      </div>

      <p style="color:#999;text-align:center;font-size:12px;margin:0">
        طلبك قيد المعالجة. سنرسل لك تحديثاً عند شحن الطلب.
      </p>
    </div>
  </div>
</body>
</html>`;
}
