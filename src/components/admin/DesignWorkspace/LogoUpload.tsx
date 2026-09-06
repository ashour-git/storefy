'use client';

interface LogoUploadProps {
  logoUrl: string;
  logoWidth: string;
  uploading: boolean;
  onSelect: (file: File) => void;
  onRemove: () => void;
  onWidthChange: (width: string) => void;
}

export function LogoUpload({ logoUrl, logoWidth, uploading, onSelect, onRemove, onWidthChange }: LogoUploadProps) {
  return (
    <div className="customizer-form-group">
      {logoUrl ? (
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 8 }}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={logoUrl} alt="Logo" height={40} width={160} style={{ height: 40, width: 'auto', borderRadius: 4, border: '1px solid #1e293b' }} />
          <button type="button" onClick={onRemove} className="btn-secondary" style={{ fontSize: '0.75rem', padding: '4px 10px' }}>Remove</button>
        </div>
      ) : null}
      <label className="customizer-upload-btn" style={{ display: 'inline-flex', alignItems: 'center', gap: 8, cursor: 'pointer', padding: '8px 16px', background: '#1e293b', borderRadius: 8, fontSize: '0.8rem', color: '#f8fafc' }}>
        {uploading ? 'Uploading...' : '📁 Upload Logo'}
        <input
          type="file"
          accept="image/*"
          disabled={uploading}
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) onSelect(file);
          }}
          style={{ display: 'none' }}
        />
      </label>
      {logoUrl ? (
        <div className="customizer-form-group" style={{ marginTop: 8 }}>
          <label className="customizer-label" htmlFor="logo-upload-width">Logo Width</label>
          <select id="logo-upload-width" value={logoWidth} onChange={(e) => onWidthChange(e.target.value)} className="customizer-select">
            <option value="32px">Small (32px)</option>
            <option value="40px">Medium (40px)</option>
            <option value="48px">Large (48px)</option>
            <option value="60px">X-Large (60px)</option>
            <option value="80px">XX-Large (80px)</option>
          </select>
        </div>
      ) : null}
    </div>
  );
}
