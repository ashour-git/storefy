
const fs = require('fs');
const path = 'D:/storefy/src/components/admin/PaymobSettingsForm.tsx';
let content = fs.readFileSync(path, 'utf8');

if (!content.includes('merchantId')) {
    content = content.replace(
        "const [iframeId, setIframeId] = useState(settings?.iframeId || '');",
        "const [iframeId, setIframeId] = useState(settings?.iframeId || '');\n  const [merchantId, setMerchantId] = useState(settings?.merchantId || '');"
    );
    
    content = content.replace(
        /integrationId, iframeId/g,
        "integrationId, iframeId, merchantId"
    );
    
    const insertion = `
      <div className="admin-form-group">
        <label className="admin-label">Merchant ID (For Payouts)</label>
        <input className="admin-input" value={merchantId} onChange={(e) => setMerchantId(e.target.value)} placeholder="e.g., 998877" />
        <p className="text-xs text-muted mt-1">Required for receiving automated payouts.</p>
      </div>
`;
    content = content.replace("</form>", insertion + "</form>");
    fs.writeFileSync(path, content);
    console.log("Paymob form updated via Node.js");
} else {
    console.log("Paymob form skipped");
}
