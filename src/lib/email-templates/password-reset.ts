function escapeHtml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;');
}

interface PasswordResetData {
  customerName: string;
  resetUrl: string;
  storeName: string;
  expiresIn: string;
}

export function passwordResetHtml(data: PasswordResetData): string {
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
      <h2 style="color:#1a1a2e;margin:0 0 8px">إعادة تعيين كلمة المرور</h2>
      <p style="color:#666;margin:0 0 24px">مرحباً ${escapeHtml(data.customerName)}، تلقينا طلباً لإعادة تعيين كلمة المرور.</p>

      <div style="text-align:center;margin-bottom:24px">
        <a href="${escapeHtml(data.resetUrl)}" style="display:inline-block;background:#6c5ce7;color:#fff;padding:14px 32px;border-radius:8px;text-decoration:none;font-weight:bold;font-size:16px">
          إعادة تعيين كلمة المرور
        </a>
      </div>

      <p style="color:#666;font-size:14px;text-align:center">
        هذا الرابط صالح لمدة ${data.expiresIn}. إذا لم تطلب إعادة التعيين، تجاهل هذا البريد.
      </p>
    </div>
  </div>
</body>
</html>`;
}
