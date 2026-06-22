import React from "react";

export interface ThemeTokens {
  primaryColor?: string;
  secondaryColor?: string;
  fontFamily?: string;
  borderRadius?: string;
  surfaceColor?: string;
  mutedTextColor?: string;
  accentColor?: string;
  headingFontFamily?: string;
  backgroundColor?: string;
  textColor?: string;
  [key: string]: string | undefined;
}

interface ThemeRendererProps {
  tokens?: ThemeTokens | null;
  children: React.ReactNode;
}

const GOOGLE_FONTS: Record<string, string> = {
  "Playfair Display": "https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400..900;1,400..900&display=swap",
  "Outfit": "https://fonts.googleapis.com/css2?family=Outfit:wght@100..900&display=swap",
  "Inter": "https://fonts.googleapis.com/css2?family=Inter:wght@100..900&display=swap",
};

export function ThemeRenderer({ tokens, children }: ThemeRendererProps) {
  // Define defaults
  const safeTokens = tokens || {};
  const primaryColor = safeTokens.primaryColor || "#0f172a";
  const secondaryColor = safeTokens.secondaryColor || "#334155";
  const backgroundColor = safeTokens.backgroundColor || "#ffffff";
  const textColor = safeTokens.textColor || "#0f172a";
  const surfaceColor = safeTokens.surfaceColor || "#ffffff";
  const mutedTextColor = safeTokens.mutedTextColor || "#64748b";
  const accentColor = safeTokens.accentColor || secondaryColor;
  const fontFamily = safeTokens.fontFamily || "Inter";
  const headingFontFamily = safeTokens.headingFontFamily || fontFamily;
  const borderRadius = safeTokens.borderRadius || "0.5rem";

  // Map user-friendly font name to CSS value
  const resolveFont = (font: string) => font === "Playfair Display"
      ? "'Playfair Display', Georgia, serif"
      : font === "Outfit"
      ? "'Outfit', sans-serif"
      : font === "Inter"
      ? "'Inter', sans-serif"
      : font;

  const cssFontFamily = resolveFont(fontFamily);
  const cssHeadingFontFamily = resolveFont(headingFontFamily);

  // Build the CSS custom properties
  const customStyles = {
    "--store-primary": primaryColor,
    "--store-secondary": secondaryColor,
    "--store-bg": backgroundColor,
    "--store-text": textColor,
    "--store-surface": surfaceColor,
    "--store-muted": mutedTextColor,
    "--store-accent": accentColor,
    "--store-font": cssFontFamily,
    "--store-heading-font": cssHeadingFontFamily,
    "--store-radius": borderRadius,
  } as React.CSSProperties;

  const fontUrl = GOOGLE_FONTS[fontFamily];

  return (
    <>
      {fontUrl && (
        <>
          <link rel="preconnect" href="https://fonts.googleapis.com" />
          <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
          <link href={fontUrl} rel="stylesheet" />
        </>
      )}
      <div
        style={customStyles}
        className="storefront-wrapper min-h-screen bg-[var(--store-bg)] text-[var(--store-text)] font-[var(--store-font)]"
      >
        {children}
      </div>
    </>
  );
}
