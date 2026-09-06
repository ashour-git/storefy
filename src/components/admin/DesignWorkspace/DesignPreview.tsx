export type PreviewDevice = 'desktop' | 'mobile';

interface DesignPreviewProps {
  storeSlug: string;
  device: PreviewDevice;
  highlightAi: boolean;
}

export function DesignPreview({ storeSlug, device, highlightAi }: DesignPreviewProps) {
  return (
    <section aria-label="Storefront preview">
      <nav aria-label="Preview device">
        <a href="?device=desktop" aria-current={device === 'desktop' ? 'page' : undefined}>
          Desktop
        </a>
        <a href="?device=mobile" aria-current={device === 'mobile' ? 'page' : undefined}>
          Mobile
        </a>
      </nav>
      <div>
        {highlightAi && <div aria-hidden="true" className="studio-ai-hairline" />}
        <iframe
          title="Storefront preview"
          src={`/store/${storeSlug}?preview=1&device=${device}`}
          className={device === 'mobile' ? 'studio-preview-mobile' : 'studio-preview-desktop'}
        />
      </div>
    </section>
  );
}
