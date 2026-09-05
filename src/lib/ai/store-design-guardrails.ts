export const ALLOWED_DESIGN_FONTS = [
  'Playfair Display',
  'Outfit',
  'Inter',
  'Cairo',
  'Tajawal',
  'Poppins',
  'DM Sans',
] as const;

export const REQUIRED_DESIGN_BLOCKS = ['hero', 'collection', 'footer'] as const;

const VALID_ALIGNMENTS = ['left', 'center', 'right', 'justify', 'start', 'end'];

export interface DesignTokens {
  primaryColor?: string;
  backgroundColor?: string;
  textColor?: string;
  fontFamily?: string;
  headingFontFamily?: string;
  [key: string]: unknown;
}

export interface DesignBlock {
  type?: string;
  settings?: Record<string, unknown>;
  [key: string]: unknown;
}

export interface DesignValidation {
  ok: boolean;
  warnings: string[];
}

function parseHexColor(value: unknown): [number, number, number] | null {
  if (typeof value !== 'string') return null;
  const hex = value.trim().replace(/^#/, '');
  const full = hex.length === 3 ? hex.split('').map((c) => c + c).join('') : hex;
  if (!/^[0-9a-fA-F]{6}$/.test(full)) return null;
  const num = parseInt(full, 16);
  return [(num >> 16) & 255, (num >> 8) & 255, num & 255];
}

function relativeLuminance([r, g, b]: [number, number, number]): number {
  const channel = (c: number) => {
    const s = c / 255;
    return s <= 0.03928 ? s / 12.92 : Math.pow((s + 0.055) / 1.055, 2.4);
  };
  return 0.2126 * channel(r) + 0.7152 * channel(g) + 0.0722 * channel(b);
}

export function contrastRatio(foreground: unknown, background: unknown): number | null {
  const fg = parseHexColor(foreground);
  const bg = parseHexColor(background);
  if (!fg || !bg) return null;
  const lighter = Math.max(relativeLuminance(fg), relativeLuminance(bg));
  const darker = Math.min(relativeLuminance(fg), relativeLuminance(bg));
  return (lighter + 0.05) / (darker + 0.05);
}

export function validateStoreDesign(design: { tokens?: DesignTokens | null; blocks?: DesignBlock[] | null }): DesignValidation {
  const warnings: string[] = [];
  const tokens = design.tokens ?? {};
  const blocks = Array.isArray(design.blocks) ? design.blocks : [];

  const ratio = contrastRatio(tokens.textColor, tokens.backgroundColor);
  if (ratio !== null && ratio < 4.5) {
    warnings.push(`Text/background contrast ${ratio.toFixed(2)} is below AA (4.5).`);
  }

  for (const key of ['fontFamily', 'headingFontFamily'] as const) {
    const font = tokens[key];
    if (typeof font === 'string' && !(ALLOWED_DESIGN_FONTS as readonly string[]).includes(font)) {
      warnings.push(`Font "${font}" is outside the allowlist.`);
    }
  }

  const present = new Set(blocks.map((b) => String(b?.type ?? '').toLowerCase()));
  for (const required of REQUIRED_DESIGN_BLOCKS) {
    if (!present.has(required)) {
      warnings.push(`Required block "${required}" is missing.`);
    }
  }

  for (const block of blocks) {
    const settings = block?.settings;
    if (!settings || typeof settings !== 'object') continue;
    for (const key of ['alignment', 'align', 'textAlign']) {
      const value = (settings as Record<string, unknown>)[key];
      if (typeof value === 'string' && !VALID_ALIGNMENTS.includes(value.toLowerCase())) {
        warnings.push(`Block "${String(block.type)}" has unsafe alignment "${value}".`);
      }
    }
  }

  return { ok: warnings.length === 0, warnings };
}
