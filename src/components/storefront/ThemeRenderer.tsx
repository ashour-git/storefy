import React from "react";

interface ThemeTokens {
  primaryColor?: string;
  secondaryColor?: string;
  fontFamily?: string;
  borderRadius?: string;
  backgroundColor?: string;
  textColor?: string;
  [key: string]: string | undefined;
}

interface ThemeRendererProps {
  tokens?: ThemeTokens | null;
  children: React.ReactNode;
}

export function ThemeRenderer({ tokens, children }: ThemeRendererProps) {
  // Define defaults
  const safeTokens = tokens || {};
  const primaryColor = safeTokens.primaryColor || "#0f172a";
  const secondaryColor = safeTokens.secondaryColor || "#334155";
  const backgroundColor = safeTokens.backgroundColor || "#ffffff";
  const textColor = safeTokens.textColor || "#0f172a";
  const fontFamily = safeTokens.fontFamily || "var(--font-inter)";
  const borderRadius = safeTokens.borderRadius || "0.5rem";

  // Build the CSS custom properties
  const customStyles = {
    "--store-primary": primaryColor,
    "--store-secondary": secondaryColor,
    "--store-bg": backgroundColor,
    "--store-text": textColor,
    "--store-font": fontFamily,
    "--store-radius": borderRadius,
  } as React.CSSProperties;

  return (
    <div
      style={customStyles}
      className="storefront-wrapper min-h-screen bg-[var(--store-bg)] text-[var(--store-text)] font-[var(--store-font)]"
    >
      {children}
    </div>
  );
}
