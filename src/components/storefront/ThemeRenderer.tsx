"use client";
import React from "react";

export interface ThemeTokens {
  primaryColor?: string;
  secondaryColor?: string;
  backgroundColor?: string;
  surfaceColor?: string;
  textColor?: string;
  mutedTextColor?: string;
  accentColor?: string;
  fontFamily?: string;
  headingFontFamily?: string;
  baseFontSize?: string;
  headingFontWeight?: string;
  bodyLineHeight?: string;
  borderRadius?: string;
  buttonStyle?: string;
  sectionPadding?: string;
  pageMaxWidth?: string;
  logoUrl?: string;
  logoWidth?: string;
  headerLayout?: string;
  stickyHeader?: boolean;
  announcementText?: string;
  announcementBg?: string;
  announcementTextColor?: string;
  announcementDismissible?: boolean;
  footerLayout?: string;
  footerBg?: string;
  footerTextColor?: string;
  sectionAnimation?: string;
  customCss?: string;
  [key: string]: unknown;
}

interface ThemeRendererProps {
  tokens?: ThemeTokens | null;
  children: React.ReactNode;
}

const GOOGLE_FONTS: Record<string, string> = {
  "Playfair Display": "https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400..900;1,400..900&display=swap",
  "Outfit": "https://fonts.googleapis.com/css2?family=Outfit:wght@100..900&display=swap",
  "Inter": "https://fonts.googleapis.com/css2?family=Inter:wght@100..900&display=swap",
  "Cairo": "https://fonts.googleapis.com/css2?family=Cairo:wght@200..1000&display=swap",
  "Tajawal": "https://fonts.googleapis.com/css2?family=Tajawal:wght@200;300;400;500;700;800;900&display=swap",
  "Poppins": "https://fonts.googleapis.com/css2?family=Poppins:wght@100..900&display=swap",
  "DM Sans": "https://fonts.googleapis.com/css2?family=DM+Sans:wght@100..900&display=swap",
};

const FONT_STACKS: Record<string, string> = {
  "Playfair Display": "'Playfair Display', Georgia, serif",
  "Outfit": "'Outfit', sans-serif",
  "Inter": "'Inter', sans-serif",
  "Cairo": "'Cairo', sans-serif",
  "Tajawal": "'Tajawal', sans-serif",
  "Poppins": "'Poppins', sans-serif",
  "DM Sans": "'DM Sans', sans-serif",
};

export function ThemeRenderer({ tokens, children }: ThemeRendererProps) {
  const t = tokens || {};
  const headingFont = t.headingFontFamily || t.fontFamily || "Inter";
  const bodyFont = t.fontFamily || "Inter";

  const cssVars: Record<string, string> = {
    "--store-primary": t.primaryColor || "#0f172a",
    "--store-secondary": t.secondaryColor || "#334155",
    "--store-bg": t.backgroundColor || "#ffffff",
    "--store-text": t.textColor || "#0f172a",
    "--store-surface": t.surfaceColor || "#ffffff",
    "--store-muted": t.mutedTextColor || "#64748b",
    "--store-accent": t.accentColor || (t.secondaryColor || "#334155"),
    "--store-font": FONT_STACKS[bodyFont] || bodyFont,
    "--store-heading-font": FONT_STACKS[headingFont] || headingFont,
    "--store-radius": t.borderRadius || "0.5rem",
    "--store-base-font-size": t.baseFontSize || "16px",
    "--store-heading-weight": t.headingFontWeight || "700",
    "--store-body-line-height": t.bodyLineHeight || "1.6",
    "--store-section-padding": t.sectionPadding || "4rem 1rem",
    "--store-page-max-width": t.pageMaxWidth || "1200px",
    "--store-button-style": t.buttonStyle || "rounded",
    "--store-footer-bg": t.footerBg || t.secondaryColor || "#0f172a",
    "--store-footer-text": t.footerTextColor || "#f8fafc",
    "--store-announcement-bg": t.announcementBg || t.primaryColor || "#0f172a",
    "--store-announcement-text": t.announcementTextColor || "#ffffff",
  };

  const renderFontLink = (font: string) => {
    const url = GOOGLE_FONTS[font];
    return url ? <link key={font} href={url} rel="stylesheet" /> : null;
  };

  const hasMultipleFonts = headingFont !== bodyFont;
  const fontsToLoad = [bodyFont];
  if (hasMultipleFonts) fontsToLoad.push(headingFont);

  return (
    <>
      <link rel="preconnect" href="https://fonts.googleapis.com" />
      <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      {fontsToLoad.map(renderFontLink)}
      {t.customCss && !t.customCss.includes('undefined') && (
        <style dangerouslySetInnerHTML={{ __html: t.customCss }} />
      )}
      {t.buttonStyle && (
        <style>{`
          .store-btn { border-radius: ${t.buttonStyle === 'pill' ? '9999px' : t.buttonStyle === 'square' ? '0px' : 'var(--store-radius)'}; }
        `}</style>
      )}
      <div
        style={cssVars as React.CSSProperties}
        className="storefront-wrapper min-h-screen bg-[var(--store-bg)] text-[var(--store-text)]"
      >
        {children}
      </div>
    </>
  );
}
