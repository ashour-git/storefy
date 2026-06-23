"use client";

import React, { useState, useEffect, useTransition, useRef } from "react";
import { useRouter } from "next/navigation";
import { DynamicIcon, ICONS } from "../IconLibrary";

interface Store {
  id: string;
  slug: string;
  name: string;
  category: string | null;
  defaultLocale?: string | null;
}

interface ThemeCustomizerProps {
  store: Store;
  initialTheme: any;
  initialPage: any;
  products: any[];
}

const PRESETS = {
  "classic-luxe": {
    name: "Classic Luxe",
    description: "Amber & gold accents, serif typography, sharp borders. Perfect for high-end luxury perfumes.",
    tokens: {
      primaryColor: "#b45309",
      secondaryColor: "#1e1b4b",
      backgroundColor: "#fafaf9",
      textColor: "#1c1917",
      fontFamily: "Playfair Display",
      borderRadius: "0px",
      customCss: "",
      facebookUrl: "",
      instagramUrl: "",
      twitterUrl: "",
      tiktokUrl: ""
    },
    blocks: [
      {
        id: "promo-preset",
        type: "promo",
        settings: {
          text: "Exquisite Selection: Enjoy complimentary shipping on orders over 1000 EGP.",
          textColor: "#ffffff",
          bgColor: "#1e1b4b",
          hidden: false
        }
      },
      {
        id: "hero-preset",
        type: "hero",
        settings: {
          title: "The Art of Fine Perfumery",
          subtitle: "Discover curated luxury scents crafted by master perfumers to capture memories and define your presence.",
          buttonText: "Explore the Collection",
          buttonLink: "#collection",
          alignment: "left",
          bgType: "gradient",
          gradientFrom: "#111827",
          gradientTo: "#1f2937",
          emoji: "",
          hidden: false
        }
      },
      {
        id: "features-preset",
        type: "features",
        settings: {
          hidden: false,
          items: [
            { title: "Pure Oils", desc: "Formulated with premium, high-concentration fragrance oils.", emoji: "droplet" },
            { title: "Elegant Glass", desc: "Housed in signature luxury heavy-glass vessels.", emoji: "sparkles" },
            { title: "Fast Delivery", desc: "Complementary shipping and secure transit.", emoji: "shipping" }
          ]
        }
      },
      {
        id: "collection-preset",
        type: "collection",
        settings: {
          title: "Our Signature Blends",
          subtitle: "Scent profiles balanced for day, night, and memory.",
          limit: 8,
          hidden: false
        }
      }
    ]
  },
  "midnight-bloom": {
    name: "Midnight Bloom",
    description: "Cyber-neon purple & cyan accents, bold modern typography, rounded 16px borders, dark mode.",
    tokens: {
      primaryColor: "#c084fc",
      secondaryColor: "#22d3ee",
      backgroundColor: "#090514",
      textColor: "#f3e8ff",
      fontFamily: "Outfit",
      borderRadius: "16px",
      customCss: "",
      facebookUrl: "",
      instagramUrl: "",
      twitterUrl: "",
      tiktokUrl: ""
    },
    blocks: [
      {
        id: "promo-preset",
        type: "promo",
        settings: {
          text: "MIDNIGHT EXCLUSIVE: CODE 'BLOOM' GETS 15% OFF ALL SCENTS NOW.",
          textColor: "#090514",
          bgColor: "#22d3ee",
          hidden: false
        }
      },
      {
        id: "hero-preset",
        type: "hero",
        settings: {
          title: "Vibrant Scents, Neon Nights",
          subtitle: "Bold, synthetic, and natural botanical extracts blended for the modern aesthetic. Defy tradition.",
          buttonText: "Unlock the Midnight",
          buttonLink: "#collection",
          alignment: "center",
          bgType: "gradient",
          gradientFrom: "#020024",
          gradientTo: "#090514",
          emoji: "sparkles",
          hidden: false
        }
      },
      {
        id: "collection-preset",
        type: "collection",
        settings: {
          title: "Vapor Scents Collection",
          subtitle: "Bold fragrances that evolve as you move.",
          limit: 8,
          hidden: false
        }
      },
      {
        id: "testimonials-preset",
        type: "testimonials",
        settings: {
          title: "Rave Reviews",
          hidden: false,
          items: [
            { name: "Laila K.", text: "This smells futuristic! People literally stop me on the street to ask what scent I'm wearing.", rating: 5 }
          ]
        }
      }
    ]
  },
  "fresh-citrus": {
    name: "Fresh Citrus",
    description: "Organic clean vibes, fresh teal accents, crisp sans-serif Inter typography, 8px borders.",
    tokens: {
      primaryColor: "#0f766e",
      secondaryColor: "#0d9488",
      backgroundColor: "#f0fdfa",
      textColor: "#115e59",
      fontFamily: "Inter",
      borderRadius: "8px",
      customCss: "",
      facebookUrl: "",
      instagramUrl: "",
      twitterUrl: "",
      tiktokUrl: ""
    },
    blocks: [
      {
        id: "promo-preset",
        type: "promo",
        settings: {
          text: "Organic & Ethical: 100% vegan ingredients. Handcrafted in Egypt.",
          textColor: "#f0fdfa",
          bgColor: "#0f766e",
          hidden: false
        }
      },
      {
        id: "hero-preset",
        type: "hero",
        settings: {
          title: "Fresh Botanicals & Sunny Citrus",
          subtitle: "Lighter, clean, and breezy fragrances designed for daily wear. Invigorate your senses.",
          buttonText: "Shop Fresh Scents",
          buttonLink: "#collection",
          alignment: "center",
          bgType: "color",
          bgColor: "#0f766e",
          emoji: "droplet",
          hidden: false
        }
      },
      {
        id: "features-preset",
        type: "features",
        settings: {
          hidden: false,
          items: [
            { title: "Vegan Blends", desc: "100% clean-certified and cruelty-free formulation.", emoji: "leaf" },
            { title: "Recyclable Glass", desc: "Bottled with sustainable, earth-conscious packaging.", emoji: "leaf" },
            { title: "Direct Trade", desc: "Botanicals sourced from fair-trade Egyptian farms.", emoji: "globe" }
          ]
        }
      },
      {
        id: "collection-preset",
        type: "collection",
        settings: {
          title: "Clean Harvest Collection",
          subtitle: "Explore our crisp and sunny botanical fragrances.",
          limit: 8,
          hidden: false
        }
      }
    ]
  }
};

const GOOGLE_FONTS_PREVIEWS: Record<string, string> = {
  "Playfair Display": "https://fonts.googleapis.com/css2?family=Playfair+Display:wght@700&display=swap",
  "Outfit": "https://fonts.googleapis.com/css2?family=Outfit:wght@700&display=swap",
  "Inter": "https://fonts.googleapis.com/css2?family=Inter:wght@700&display=swap",
};

export function ThemeCustomizer({ store, initialTheme, initialPage, products }: ThemeCustomizerProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  // Localization helper
  const locale = (store.defaultLocale === "ar" ? "ar" : "en") as "en" | "ar";
  const pickLocalized = (val: any) => {
    if (!val) return "";
    if (typeof val === "string") return val;
    return val[locale] || val.en || val.ar || "";
  };

  // Tabs: 'templates' | 'style' | 'layout'
  const [activeTab, setActiveTab] = useState<"templates" | "style" | "layout">("templates");
  
  // Device Emulator Toggle: 'desktop' | 'mobile'
  const [deviceMode, setDeviceMode] = useState<"desktop" | "mobile">("desktop");

  // Customizer State
  const [tokens, setTokens] = useState(() => ({
    primaryColor: initialTheme?.tokens?.primaryColor || "#0f172a",
    secondaryColor: initialTheme?.tokens?.secondaryColor || "#334155",
    backgroundColor: initialTheme?.tokens?.backgroundColor || "#ffffff",
    textColor: initialTheme?.tokens?.textColor || "#0f172a",
    fontFamily: initialTheme?.tokens?.fontFamily || "Inter",
    borderRadius: initialTheme?.tokens?.borderRadius || "8px",
    customCss: initialTheme?.tokens?.customCss || "",
    facebookUrl: initialTheme?.tokens?.facebookUrl || "",
    instagramUrl: initialTheme?.tokens?.instagramUrl || "",
    twitterUrl: initialTheme?.tokens?.twitterUrl || "",
    tiktokUrl: initialTheme?.tokens?.tiktokUrl || "",
  }));

  const [blocks, setBlocks] = useState<any[]>(() => {
    if (initialPage?.blocks && initialPage.blocks.length > 0) {
      return initialPage.blocks;
    }
    return [
      {
        id: "promo-default",
        type: "promo",
        settings: {
          text: "Grand Opening: Free shipping on all orders over 500 EGP!",
          textColor: "#ffffff",
          bgColor: "var(--store-primary)",
          hidden: false
        }
      },
      {
        id: "hero-default",
        type: "hero",
        settings: {
          title: `Welcome to ${store.name}`,
          subtitle: `Explore our collection of premium, hand-selected perfumes crafted for you.`,
          buttonText: "Shop Our Collection",
          buttonLink: "#collection",
          alignment: "center",
          bgType: "gradient",
          gradientFrom: "#0f172a",
          gradientTo: "#1e293b",
          emoji: "droplet",
          hidden: false
        }
      },
      {
        id: "features-default",
        type: "features",
        settings: {
          hidden: false,
          items: [
            { title: "Premium Quality", desc: "Sourced from the finest global materials.", emoji: "leaf" },
            { title: "Long Lasting", desc: "Formulated for deep and enduring scent presence.", emoji: "clock" },
            { title: "Secured Checkout", desc: "Secured checkout and delivery processes.", emoji: "revenue" }
          ]
        }
      },
      {
        id: "collection-default",
        type: "collection",
        settings: {
          title: "Our Collection",
          subtitle: "Explore our best selling items.",
          limit: 8,
          hidden: false
        }
      }
    ];
  });

  const [expandedBlockIndex, setExpandedBlockIndex] = useState<number | null>(null);
  const [successMsg, setSuccessMsg] = useState("");
  const [errorMsg, setErrorMsg] = useState("");

  // AI Design Copilot State
  const [aiInput, setAiInput] = useState("");
  const [isAiGenerating, setIsAiGenerating] = useState(false);

  // Undo / Redo Session History States
  const [historyStack, setHistoryStack] = useState<{ tokens: any; blocks: any }[]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);

  // Visual Add Section Drawer State
  const [isAddSectionOpen, setIsAddSectionOpen] = useState(false);

  // Inline AI Copywriter States
  const [activeAiField, setActiveAiField] = useState<{ blockIdx: number; fieldPath: string; subIdx?: number; isGlobalToken?: boolean } | null>(null);
  const [aiSuggestions, setAiSuggestions] = useState<string[]>([]);
  const [isAiSuggestionsLoading, setIsAiSuggestionsLoading] = useState(false);

  // Initialize history stack
  useEffect(() => {
    setHistoryStack([{ tokens, blocks }]);
    setHistoryIndex(0);
  }, []);

  // Update State and Push to History stack
  const updateStateAndPushHistory = (newTokens: any, newBlocks: any) => {
    const tk = JSON.parse(JSON.stringify(newTokens));
    const blk = JSON.parse(JSON.stringify(newBlocks));

    setTokens(tk);
    setBlocks(blk);

    const nextIndex = historyIndex + 1;
    const newStack = historyStack.slice(0, nextIndex);
    setHistoryStack([...newStack, { tokens: tk, blocks: blk }]);
    setHistoryIndex(nextIndex);
  };

  const handleUndo = () => {
    if (historyIndex > 0) {
      const prevIdx = historyIndex - 1;
      const prevState = historyStack[prevIdx];
      setTokens(JSON.parse(JSON.stringify(prevState.tokens)));
      setBlocks(JSON.parse(JSON.stringify(prevState.blocks)));
      setHistoryIndex(prevIdx);
      setExpandedBlockIndex(null);
    }
  };

  const handleRedo = () => {
    if (historyIndex < historyStack.length - 1) {
      const nextIdx = historyIndex + 1;
      const nextState = historyStack[nextIdx];
      setTokens(JSON.parse(JSON.stringify(nextState.tokens)));
      setBlocks(JSON.parse(JSON.stringify(nextState.blocks)));
      setHistoryIndex(nextIdx);
      setExpandedBlockIndex(null);
    }
  };

  // Push state to history after user releases input focus (onBlur)
  const handleInputBlur = () => {
    // Avoid duplicate insertions of identical state
    const currentHist = historyStack[historyIndex];
    if (
      currentHist &&
      JSON.stringify(currentHist.tokens) === JSON.stringify(tokens) &&
      JSON.stringify(currentHist.blocks) === JSON.stringify(blocks)
    ) {
      return;
    }
    updateStateAndPushHistory(tokens, blocks);
  };

  const handleAiGenerate = async () => {
    if (!aiInput.trim()) return;
    setIsAiGenerating(true);
    setErrorMsg("");
    setSuccessMsg("");
    try {
      const res = await fetch("/api/ai/suggest-design", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt: aiInput, storeName: store.name, locale }),
      });
      if (!res.ok) throw new Error("Suggestion failed");
      const data = await res.json();
      if (data.tokens && data.blocks) {
        // Enforce basic fields if missing
        const formattedTokens = {
          ...tokens,
          ...data.tokens
        };
        updateStateAndPushHistory(formattedTokens, data.blocks);
        setSuccessMsg("AI Design Copilot successfully generated custom layout & copy!");
        setTimeout(() => setSuccessMsg(""), 4000);
      }
    } catch (err) {
      setErrorMsg("Failed to generate AI storefront styles. Please try again.");
    } finally {
      setIsAiGenerating(false);
    }
  };

  const handleApplyPreset = (presetKey: keyof typeof PRESETS) => {
    const preset = PRESETS[presetKey];
    const newTokens = { ...tokens, ...preset.tokens };
    const newBlocks = JSON.parse(JSON.stringify(preset.blocks));
    updateStateAndPushHistory(newTokens, newBlocks);
    setSuccessMsg(`Applied '${preset.name}' template settings!`);
    setTimeout(() => setSuccessMsg(""), 3000);
  };

  const handleSave = () => {
    setErrorMsg("");
    setSuccessMsg("");
    
    startTransition(async () => {
      try {
        const response = await fetch("/api/themes/customize", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            storeId: store.id,
            tokens,
            blocks,
          }),
        });

        if (!response.ok) {
          const errData = await response.json();
          setErrorMsg(errData.error || "Failed to save design customization.");
          return;
        }

        setSuccessMsg("Design customizations saved successfully!");
        setTimeout(() => setSuccessMsg(""), 4000);
        router.refresh();
      } catch (err: any) {
        setErrorMsg("Failed to connect to customization API.");
      }
    });
  };

  // Reordering helpers
  const moveBlock = (index: number, direction: "up" | "down") => {
    if (direction === "up" && index === 0) return;
    if (direction === "down" && index === blocks.length - 1) return;

    const newBlocks = [...blocks];
    const targetIdx = direction === "up" ? index - 1 : index + 1;
    const temp = newBlocks[index];
    newBlocks[index] = newBlocks[targetIdx];
    newBlocks[targetIdx] = temp;

    updateStateAndPushHistory(tokens, newBlocks);
    if (expandedBlockIndex === index) {
      setExpandedBlockIndex(targetIdx);
    } else if (expandedBlockIndex === targetIdx) {
      setExpandedBlockIndex(index);
    }
  };

  const deleteBlock = (index: number) => {
    if (confirm(locale === "ar" ? "هل أنت متأكد من رغبتك في حذف هذا القسم؟" : "Are you sure you want to remove this section?")) {
      const newBlocks = blocks.filter((_, i) => i !== index);
      updateStateAndPushHistory(tokens, newBlocks);
      setExpandedBlockIndex(null);
    }
  };

  const toggleHideBlock = (index: number) => {
    const newBlocks = [...blocks];
    const currentHidden = !!newBlocks[index].settings?.hidden;
    newBlocks[index].settings = {
      ...(newBlocks[index].settings || {}),
      hidden: !currentHidden
    };
    updateStateAndPushHistory(tokens, newBlocks);
  };

  const addBlock = (type: "promo" | "hero" | "features" | "collection" | "testimonials" | "newsletter" | "gallery" | "faq") => {
    const newBlock: any = {
      id: `${type}-${Date.now()}`,
      type,
      settings: {
        hidden: false
      }
    };

    if (type === "promo") {
      newBlock.settings = { text: "Special Announcement: Add custom banner text here!", textColor: "#ffffff", bgColor: "var(--store-primary)", hidden: false };
    } else if (type === "hero") {
      newBlock.settings = { title: "Custom Headline Title", subtitle: "Write a descriptive and engaging subtitle here.", buttonText: "Click Me", buttonLink: "#", alignment: "center", bgType: "gradient", gradientFrom: "#0f172a", gradientTo: "#1e293b", emoji: "sparkles", hidden: false };
    } else if (type === "features") {
      newBlock.settings = {
        hidden: false,
        items: [
          { title: "Feature One", desc: "Description text highlighting important details.", emoji: "package" },
          { title: "Feature Two", desc: "Description text highlighting important details.", emoji: "flask" },
          { title: "Feature Three", desc: "Description text highlighting important details.", emoji: "revenue" }
        ]
      };
    } else if (type === "collection") {
      newBlock.settings = { title: "Featured Products", subtitle: "Explore our handpicked catalog of popular products.", limit: 8, hidden: false };
    } else if (type === "testimonials") {
      newBlock.settings = {
        title: "Client Testimonials",
        hidden: false,
        items: [
          { name: "Youssef", text: "Exceptional fragrance line and amazing packaging experience.", rating: 5 },
          { name: "Sherif", text: "Fragrance persists beautifully throughout the entire day.", rating: 5 }
        ]
      };
    } else if (type === "newsletter") {
      newBlock.settings = { title: "Subscribe to our Newsletter", subtitle: "Get updates on new perfume drops and exclusive private sales.", buttonText: "Subscribe", placeholder: "Enter your email address...", hidden: false };
    } else if (type === "gallery") {
      newBlock.settings = {
        title: "Visual Gallery",
        hidden: false,
        items: [
          { title: "Summer Scents", desc: "Fresh botanical collections.", emoji: "leaf" },
          { title: "Warm Amber", desc: "Cozy woody notes for evening wear.", emoji: "fire" },
          { title: "Exclusive Blends", desc: "Limited run collections.", emoji: "sparkles" }
        ]
      };
    } else if (type === "faq") {
      newBlock.settings = {
        title: "Common Questions",
        hidden: false,
        items: [
          { question: "How long does delivery take?", answer: "Usually 24-48 hours across Egypt." },
          { question: "Are these authentic perfumes?", answer: "100% authentic formulated with high quality French oils." }
        ]
      };
    }

    const newBlocks = [...blocks, newBlock];
    updateStateAndPushHistory(tokens, newBlocks);
    setExpandedBlockIndex(newBlocks.length - 1); // Open the new block
    setIsAddSectionOpen(false);
  };

  // Sub-items nesting handlers (add/delete/reorder inside features/testimonials/gallery/faq)
  const addNestedItem = (blockIdx: number) => {
    const newBlocks = [...blocks];
    const block = newBlocks[blockIdx];
    if (!block.settings.items) block.settings.items = [];

    const type = block.type;
    let newItem = {};
    if (type === "features") {
      newItem = { title: "New Feature", desc: "Detail description text.", emoji: "star" };
    } else if (type === "testimonials") {
      newItem = { name: "Client Name", text: "Honest feedback review.", rating: 5 };
    } else if (type === "gallery") {
      newItem = { title: "New Showcase", desc: "Brief description details.", emoji: "image" };
    } else if (type === "faq") {
      newItem = { question: "Write your question here?", answer: "Write the answering copy here." };
    }

    block.settings.items.push(newItem);
    updateStateAndPushHistory(tokens, newBlocks);
  };

  const deleteNestedItem = (blockIdx: number, itemIdx: number) => {
    const newBlocks = [...blocks];
    const block = newBlocks[blockIdx];
    if (block.settings.items) {
      block.settings.items = block.settings.items.filter((_: any, i: number) => i !== itemIdx);
      updateStateAndPushHistory(tokens, newBlocks);
    }
  };

  const moveNestedItem = (blockIdx: number, itemIdx: number, direction: "up" | "down") => {
    const newBlocks = [...blocks];
    const block = newBlocks[blockIdx];
    const items = block.settings.items;
    if (!items) return;

    if (direction === "up" && itemIdx === 0) return;
    if (direction === "down" && itemIdx === items.length - 1) return;

    const targetIdx = direction === "up" ? itemIdx - 1 : itemIdx + 1;
    const temp = items[itemIdx];
    items[itemIdx] = items[targetIdx];
    items[targetIdx] = temp;

    updateStateAndPushHistory(tokens, newBlocks);
  };

  // Trigger Inline AI Copywriting Suggestions
  const triggerAiCopywriter = async (blockIdx: number, fieldPath: string, currentText: string, subIdx?: number, isGlobalToken?: boolean) => {
    setActiveAiField({ blockIdx, fieldPath, subIdx, isGlobalToken });
    setIsAiSuggestionsLoading(true);
    setAiSuggestions([]);
    try {
      const res = await fetch("/api/ai/copywriter", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          currentText,
          fieldName: fieldPath,
          storeName: store.name,
          category: store.category || "Perfumes",
          locale
        })
      });
      if (res.ok) {
        const data = await res.json();
        setAiSuggestions(data.suggestions || []);
      }
    } catch {
      setErrorMsg("Failed to query copywriting Suggestions.");
    } finally {
      setIsAiSuggestionsLoading(false);
    }
  };

  const applyCopywriterSuggestion = (suggestion: string) => {
    if (!activeAiField) return;
    const { blockIdx, fieldPath, subIdx, isGlobalToken } = activeAiField;

    if (isGlobalToken) {
      const newTokens = { ...tokens, [fieldPath]: suggestion };
      updateStateAndPushHistory(newTokens, blocks);
    } else {
      const newBlocks = [...blocks];
      const settings = newBlocks[blockIdx].settings;
      if (subIdx !== undefined) {
        if (settings.items && settings.items[subIdx]) {
          settings.items[subIdx][fieldPath] = suggestion;
        }
      } else {
        settings[fieldPath] = suggestion;
      }
      updateStateAndPushHistory(tokens, newBlocks);
    }
    setActiveAiField(null);
  };

  // Build the CSS values for previewing
  const cssFontFamily =
    tokens.fontFamily === "Playfair Display"
      ? "'Playfair Display', Georgia, serif"
      : tokens.fontFamily === "Outfit"
      ? "'Outfit', sans-serif"
      : tokens.fontFamily === "Inter"
      ? "'Inter', sans-serif"
      : tokens.fontFamily;

  const mockStyles = {
    "--store-primary": tokens.primaryColor,
    "--store-secondary": tokens.secondaryColor,
    "--store-bg": tokens.backgroundColor,
    "--store-text": tokens.textColor,
    "--store-font": cssFontFamily,
    "--store-radius": tokens.borderRadius,
    fontFamily: "var(--store-font)",
    backgroundColor: "var(--store-bg)",
    color: "var(--store-text)",
  } as React.CSSProperties;

  // Dynamically load Google Font previews in Admin head
  useEffect(() => {
    const activeFontPreview = GOOGLE_FONTS_PREVIEWS[tokens.fontFamily];
    if (!activeFontPreview) return;

    const linkId = `font-link-${tokens.fontFamily.replace(/\s+/g, "-")}`;
    if (document.getElementById(linkId)) return;

    const link = document.createElement("link");
    link.id = linkId;
    link.rel = "stylesheet";
    link.href = activeFontPreview;
    document.head.appendChild(link);
  }, [tokens.fontFamily]);

  // Group blocks for 3-Level Outline Tree
  const headerBlocks = blocks.filter(b => b.type === "promo");
  const templateBlocks = blocks.filter(b => b.type !== "promo");

  return (
    <div className="admin-customizer-root">
      {/* Dynamic font styling links for customizer preview */}
      <link rel="preconnect" href="https://fonts.googleapis.com" />
      <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      <link href="https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400..900;1,400..900&family=Outfit:wght@100..900&family=Inter:wght@100..900&display=swap" rel="stylesheet" />

      {/* Top Save & History Bar */}
      <header className="customizer-topbar">
        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
          <a href="/admin" className="btn-secondary" style={{ padding: "8px 16px", borderRadius: "8px", fontSize: "0.85rem", height: 38, textDecoration: 'none' }}>
            ← Exit Customizer
          </a>
          <div>
            <h1 className="customizer-title">{store.name}</h1>
            <p className="customizer-subtitle">Design Customizer &bull; /store/{store.slug}</p>
          </div>
        </div>

        {/* Undo/Redo Buttons */}
        <div style={{ display: "flex", alignItems: "center", gap: 8, background: "#1e293b", padding: "4px 8px", borderRadius: "8px" }}>
          <button
            onClick={handleUndo}
            disabled={historyIndex <= 0}
            className="history-action-btn"
            title="Undo (Ctrl+Z)"
          >
            ↩ Undo
          </button>
          <span style={{ color: "#475569", fontSize: "0.75rem" }}>|</span>
          <button
            onClick={handleRedo}
            disabled={historyIndex >= historyStack.length - 1}
            className="history-action-btn"
            title="Redo (Ctrl+Y)"
          >
            Redo ↪
          </button>
        </div>
        
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          {/* Device toggle */}
          <div className="customizer-device-toggle">
            <button 
              className={`device-btn ${deviceMode === "desktop" ? "active" : ""}`}
              onClick={() => setDeviceMode("desktop")}
              title="Desktop View"
              style={{ display: "inline-flex", alignItems: "center", gap: 6 }}
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="3" width="20" height="14" rx="2" ry="2"/><line x1="8" y1="21" x2="16" y2="21"/><line x1="12" y1="17" x2="12" y2="21"/></svg>
              Desktop
            </button>
            <button 
              className={`device-btn ${deviceMode === "mobile" ? "active" : ""}`}
              onClick={() => setDeviceMode("mobile")}
              title="Mobile View"
              style={{ display: "inline-flex", alignItems: "center", gap: 6 }}
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><rect x="5" y="2" width="14" height="20" rx="2" ry="2"/><line x1="12" y1="18" x2="12.01" y2="18"/></svg>
              Mobile
            </button>
          </div>

          <button
            onClick={handleSave}
            disabled={isPending}
            className="btn-primary"
            style={{ padding: "8px 24px", borderRadius: "8px", fontSize: "0.88rem", height: 38, cursor: "pointer" }}
          >
            {isPending ? "Saving..." : "Save Design"}
          </button>
        </div>
      </header>

      {/* Main split view */}
      <div className="customizer-workspace">
        {/* Left Control Panel */}
        <aside className="customizer-sidebar">
          {/* Tabs header */}
          <div className="customizer-tabs">
            <button className={`tab-btn ${activeTab === "templates" ? "active" : ""}`} onClick={() => setActiveTab("templates")} style={{ display: "inline-flex", alignItems: "center", justifyContent: "center", gap: 6 }}>
              <DynamicIcon name="store" size={16} />
              Templates
            </button>
            <button className={`tab-btn ${activeTab === "style" ? "active" : ""}`} onClick={() => setActiveTab("style")} style={{ display: "inline-flex", alignItems: "center", justifyContent: "center", gap: 6 }}>
              <DynamicIcon name="sparkles" size={16} />
              Style & CSS
            </button>
            <button className={`tab-btn ${activeTab === "layout" ? "active" : ""}`} onClick={() => setActiveTab("layout")} style={{ display: "inline-flex", alignItems: "center", justifyContent: "center", gap: 6 }}>
              <DynamicIcon name="settings" size={16} />
              Layout
            </button>
          </div>

          {/* Feedback messages */}
          {successMsg && (
            <div className="customizer-alert-success animate-bounce">
              {successMsg}
            </div>
          )}
          {errorMsg && (
            <div className="customizer-alert-error">
              {errorMsg}
            </div>
          )}

          {/* Tab content panel */}
          <div className="customizer-tab-content">
            
            {/* 1. TEMPLATES TAB */}
            {activeTab === "templates" && (
              <div className="customizer-section-panel">
                {/* AI Design Copilot */}
                <div style={{ background: "rgba(99, 102, 241, 0.08)", border: "1px solid rgba(99, 102, 241, 0.2)", borderRadius: 12, padding: 16, display: "flex", flexDirection: "column", gap: 10 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <span style={{ fontSize: "1.1rem" }}>🪄</span>
                    <span style={{ fontSize: "0.85rem", fontWeight: 800, color: "#f8fafc" }}>AI Design Copilot</span>
                  </div>
                  <p style={{ fontSize: "0.75rem", color: "#94a3b8", lineHeight: 1.4, margin: 0 }}>
                    Describe your brand or campaign to instantly generate custom colors, fonts, layouts, and sales copy.
                  </p>
                  <textarea
                    placeholder="e.g. A luxury niche perfume house named Scent Noir featuring heavy woody oud and dark amber tones."
                    value={aiInput}
                    onChange={(e) => setAiInput(e.target.value)}
                    className="customizer-textarea"
                    style={{ fontSize: "0.78rem", minHeight: 64, background: "#0b0f19" }}
                    rows={2}
                  />
                  <button 
                    onClick={handleAiGenerate}
                    disabled={isAiGenerating}
                    className="btn-primary"
                    style={{ width: "100%", height: 34, fontSize: "0.78rem", borderRadius: 8, background: "linear-gradient(135deg, #818cf8, #6366f1)", cursor: "pointer", border: "none", color: "white", fontWeight: 700 }}
                  >
                    {isAiGenerating ? "AI is Designing..." : "Generate Layout & Copy"}
                  </button>
                </div>

                <div style={{ borderTop: "1px solid #1e293b", margin: "10px 0" }} />

                <h3 className="customizer-section-title">Select Preset Theme</h3>
                <p className="customizer-muted-desc">Apply one of our preset themes to instantly style your store fonts, colors, and layout sections.</p>
                
                <div className="presets-list">
                  {Object.entries(PRESETS).map(([key, p]) => (
                    <div key={key} className="preset-card hover-glow">
                      <div className="preset-card-header">
                        <span className="preset-name">{p.name}</span>
                        <button className="preset-apply-btn" onClick={() => handleApplyPreset(key as any)}>
                          Apply Preset
                        </button>
                      </div>
                      <p className="preset-desc">{p.description}</p>
                      
                      {/* Presets color swatches */}
                      <div className="preset-colors">
                        <span className="swatch" style={{ backgroundColor: p.tokens.primaryColor }} title="Primary" />
                        <span className="swatch" style={{ backgroundColor: p.tokens.secondaryColor }} title="Secondary" />
                        <span className="swatch" style={{ backgroundColor: p.tokens.backgroundColor }} title="Bg" />
                        <span className="swatch" style={{ backgroundColor: p.tokens.textColor }} title="Text" />
                        <span className="swatch-font-label" style={{ fontFamily: p.tokens.fontFamily }}>Aa ({p.tokens.fontFamily})</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* 2. STYLE & GLOBAL SETTINGS TAB */}
            {activeTab === "style" && (
              <div className="customizer-section-panel">
                <h3 className="customizer-section-title">Global Theme Styles</h3>
                
                {/* Color pickers */}
                <div className="customizer-form-group">
                  <label className="customizer-label">Primary Color (Accent/Buttons)</label>
                  <div className="color-picker-wrapper">
                    <input 
                      type="color" 
                      value={tokens.primaryColor}
                      onChange={(e) => setTokens({ ...tokens, primaryColor: e.target.value })}
                      onBlur={handleInputBlur}
                      className="color-input"
                    />
                    <input 
                      type="text" 
                      value={tokens.primaryColor}
                      onChange={(e) => setTokens({ ...tokens, primaryColor: e.target.value })}
                      onBlur={handleInputBlur}
                      className="color-text-input"
                    />
                  </div>
                </div>

                <div className="customizer-form-group">
                  <label className="customizer-label">Secondary Color</label>
                  <div className="color-picker-wrapper">
                    <input 
                      type="color" 
                      value={tokens.secondaryColor}
                      onChange={(e) => setTokens({ ...tokens, secondaryColor: e.target.value })}
                      onBlur={handleInputBlur}
                      className="color-input"
                    />
                    <input 
                      type="text" 
                      value={tokens.secondaryColor}
                      onChange={(e) => setTokens({ ...tokens, secondaryColor: e.target.value })}
                      onBlur={handleInputBlur}
                      className="color-text-input"
                    />
                  </div>
                </div>

                <div className="customizer-form-group">
                  <label className="customizer-label">Background Color</label>
                  <div className="color-picker-wrapper">
                    <input 
                      type="color" 
                      value={tokens.backgroundColor}
                      onChange={(e) => setTokens({ ...tokens, backgroundColor: e.target.value })}
                      onBlur={handleInputBlur}
                      className="color-input"
                    />
                    <input 
                      type="text" 
                      value={tokens.backgroundColor}
                      onChange={(e) => setTokens({ ...tokens, backgroundColor: e.target.value })}
                      onBlur={handleInputBlur}
                      className="color-text-input"
                    />
                  </div>
                </div>

                <div className="customizer-form-group">
                  <label className="customizer-label">Text Color</label>
                  <div className="color-picker-wrapper">
                    <input 
                      type="color" 
                      value={tokens.textColor}
                      onChange={(e) => setTokens({ ...tokens, textColor: e.target.value })}
                      onBlur={handleInputBlur}
                      className="color-input"
                    />
                    <input 
                      type="text" 
                      value={tokens.textColor}
                      onChange={(e) => setTokens({ ...tokens, textColor: e.target.value })}
                      onBlur={handleInputBlur}
                      className="color-text-input"
                    />
                  </div>
                </div>

                {/* Fonts */}
                <div className="customizer-form-group">
                  <label className="customizer-label">Typography Style</label>
                  <select 
                    value={tokens.fontFamily}
                    onChange={(e) => {
                      const newTokens = { ...tokens, fontFamily: e.target.value };
                      updateStateAndPushHistory(newTokens, blocks);
                    }}
                    className="customizer-select"
                  >
                    <option value="Playfair Display">Playfair Display (Elegant Serif / Perfumes)</option>
                    <option value="Outfit">Outfit (Modern Rounded Sans / Luxury Branding)</option>
                    <option value="Inter">Inter (Clean Clean Sans / Cosmetics)</option>
                  </select>
                </div>

                {/* Border Radius */}
                <div className="customizer-form-group">
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
                    <label className="customizer-label">Border Radius (Corners)</label>
                    <span className="badge-value">{tokens.borderRadius}</span>
                  </div>
                  <input 
                    type="range"
                    min="0"
                    max="24"
                    step="1"
                    value={parseInt(tokens.borderRadius) || 0}
                    onChange={(e) => setTokens({ ...tokens, borderRadius: `${e.target.value}px` })}
                    onMouseUp={handleInputBlur}
                    style={{ width: "100%" }}
                  />
                </div>

                <div style={{ borderTop: "1px solid #1e293b", margin: "10px 0" }} />

                {/* Social Links Settings */}
                <h3 className="customizer-section-title">Social Media Icons</h3>
                <p className="customizer-muted-desc" style={{ marginBottom: 12 }}>Enter your URLs to render social links in the storefront footer.</p>
                
                <div className="customizer-form-group">
                  <label className="customizer-label">Facebook URL</label>
                  <input 
                    type="text" 
                    value={tokens.facebookUrl || ""}
                    onChange={(e) => setTokens({ ...tokens, facebookUrl: e.target.value })}
                    onBlur={handleInputBlur}
                    placeholder="https://facebook.com/yourbrand"
                    className="customizer-input"
                  />
                </div>

                <div className="customizer-form-group">
                  <label className="customizer-label">Instagram URL</label>
                  <input 
                    type="text" 
                    value={tokens.instagramUrl || ""}
                    onChange={(e) => setTokens({ ...tokens, instagramUrl: e.target.value })}
                    onBlur={handleInputBlur}
                    placeholder="https://instagram.com/yourbrand"
                    className="customizer-input"
                  />
                </div>

                <div className="customizer-form-group">
                  <label className="customizer-label">TikTok URL</label>
                  <input 
                    type="text" 
                    value={tokens.tiktokUrl || ""}
                    onChange={(e) => setTokens({ ...tokens, tiktokUrl: e.target.value })}
                    onBlur={handleInputBlur}
                    placeholder="https://tiktok.com/@yourbrand"
                    className="customizer-input"
                  />
                </div>

                <div style={{ borderTop: "1px solid #1e293b", margin: "10px 0" }} />

                {/* Custom CSS overrides */}
                <h3 className="customizer-section-title">Custom CSS Overrides</h3>
                <p className="customizer-muted-desc" style={{ marginBottom: 10 }}>Write raw CSS to customize specific visual elements. Changes apply in real time.</p>
                <div className="customizer-form-group">
                  <textarea
                    rows={8}
                    value={tokens.customCss || ""}
                    onChange={(e) => setTokens({ ...tokens, customCss: e.target.value })}
                    onBlur={handleInputBlur}
                    className="customizer-textarea"
                    style={{ fontFamily: "monospace", fontSize: "0.78rem" }}
                    placeholder="e.g. .store-hero-title { letter-spacing: -2px; }&#10;.store-promo-bar { font-size: 14px; }"
                  />
                </div>
              </div>
            )}

            {/* 3. LAYOUT TAB - Outline Tree Structure */}
            {activeTab === "layout" && (
              <div className="customizer-section-panel">
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
                  <h3 className="customizer-section-title" style={{ margin: 0 }}>Visual Outline</h3>
                  
                  {/* Catalog Drawer Trigger */}
                  <button 
                    onClick={() => setIsAddSectionOpen(true)}
                    className="btn-primary"
                    style={{ fontSize: "0.75rem", padding: "6px 12px", height: 32, borderRadius: "6px" }}
                  >
                    + Add Section
                  </button>
                </div>

                {/* 3.1 HEADER ZONE */}
                <div className="outline-zone-container">
                  <div className="outline-zone-title">HEADER</div>
                  <div className="blocks-order-list">
                    {headerBlocks.map((block) => {
                      const realIndex = blocks.findIndex(b => b.id === block.id);
                      return renderOutlineBlockCard(block, realIndex);
                    })}
                  </div>
                </div>

                {/* 3.2 TEMPLATE SECTIONS ZONE */}
                <div className="outline-zone-container">
                  <div className="outline-zone-title">TEMPLATE SECTIONS</div>
                  <div className="blocks-order-list">
                    {templateBlocks.map((block) => {
                      const realIndex = blocks.findIndex(b => b.id === block.id);
                      return renderOutlineBlockCard(block, realIndex);
                    })}
                  </div>
                </div>

                {/* 3.3 FOOTER ZONE */}
                <div className="outline-zone-container">
                  <div className="outline-zone-title">FOOTER</div>
                  <div className="footer-outline-card">
                    <div className="footer-outline-header">
                      <span className="block-icon">📌</span>
                      <span className="footer-name">Footer Info & Branding</span>
                    </div>
                    <div style={{ padding: "12px", borderTop: "1px solid #1e293b", background: "#0b0f19", display: "flex", flexDirection: "column", gap: 10 }}>
                      <p style={{ margin: 0, fontSize: "0.75rem", opacity: 0.6 }}>Custom copyright and powered-by links.</p>
                      {tokens.facebookUrl || tokens.instagramUrl || tokens.tiktokUrl ? (
                        <div style={{ display: "flex", gap: 6 }}>
                          <span style={{ fontSize: "0.7rem", color: "#818cf8", fontWeight: 700 }}>Social Icons Enabled:</span>
                          <span style={{ fontSize: "0.7rem", opacity: 0.8 }}>
                            {[
                              tokens.facebookUrl && "FB",
                              tokens.instagramUrl && "IG",
                              tokens.tiktokUrl && "TT"
                            ].filter(Boolean).join(", ")}
                          </span>
                        </div>
                      ) : (
                        <span style={{ fontSize: "0.7rem", color: "#64748b" }}>No social media links configured.</span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )}

          </div>
        </aside>

        {/* Right Preview Panel */}
        <section className="customizer-preview-container">
          <div className={`simulator-frame ${deviceMode === "mobile" ? "mobile" : "desktop"}`}>
            
            {/* Storefront rendering simulation with mockup values */}
            <div style={mockStyles} className="mock-storefront-viewport">
              {/* Inject configured custom CSS block dynamically */}
              {tokens.customCss && (
                <style dangerouslySetInnerHTML={{ __html: tokens.customCss }} />
              )}
              
              <div className="min-h-full flex flex-col">
                
                {/* Simulated Header */}
                <header className="sticky top-0 z-30 w-full border-b border-black/5 bg-[var(--store-bg)]/80 backdrop-blur-md">
                  <div className="px-6 h-16 flex items-center justify-between">
                    <span className="text-xl font-black tracking-tight" style={{ fontFamily: "var(--store-font)" }}>
                      {store.name}
                    </span>
                    <div className="flex items-center gap-3">
                      <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-[var(--store-primary)]/10 text-[var(--store-primary)]">
                        ● Accepting Orders
                      </span>
                    </div>
                  </div>
                </header>

                {/* Simulated Blocks content */}
                <main className="flex-1">
                  {blocks.map((block, idx) => {
                    const settings = block.settings || {};
                    const id = block.id || `mock-block-${idx}`;

                    // Hide block from visual preview if toggled hidden ( Shopify eyes toggle )
                    if (settings.hidden) return null;

                    let blockNode = null;
                    switch (block.type) {
                      case 'promo':
                        blockNode = (
                          <div 
                            style={{ 
                              backgroundColor: settings.bgColor || 'var(--store-primary)', 
                              color: settings.textColor || '#ffffff' 
                            }}
                            className="w-full text-center py-2 px-4 text-xs font-semibold"
                          >
                            {pickLocalized(settings.text) || "Promo Notification banner text"}
                          </div>
                        );
                        break;

                      case 'hero':
                        const isCenter = settings.alignment === 'center';
                        const isRight = settings.alignment === 'right';
                        const alignmentClass = isCenter ? 'text-center items-center' : isRight ? 'text-right items-end' : 'text-left items-start';
                        
                        const bgStyle: React.CSSProperties = {};
                        if (settings.bgType === 'color') {
                          bgStyle.backgroundColor = settings.bgColor || 'var(--store-primary)';
                        } else {
                          bgStyle.backgroundImage = `linear-gradient(135deg, ${settings.gradientFrom || '#0f172a'} 0%, ${settings.gradientTo || '#1e293b'} 100%)`;
                        }

                        const heroBtnText = pickLocalized(settings.buttonText || settings.primaryCta);

                        blockNode = (
                          <section 
                            style={bgStyle}
                            className="relative overflow-hidden py-16 px-6 text-white text-center flex flex-col items-center justify-center min-h-[300px]"
                          >
                            <div className="absolute inset-0 opacity-5 bg-[linear-gradient(rgba(255,255,255,0.05)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.05)_1px,transparent_1px)] bg-[size:20px_20px]" />
                            <div className={`relative max-w-xl mx-auto flex flex-col ${alignmentClass} gap-4`}>
                              {settings.emoji && (
                                <span className="text-4xl text-[var(--store-primary)]" style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}>
                                  <DynamicIcon name={settings.emoji} size={40} />
                                </span>
                              )}
                              <h2 className="text-3xl font-black tracking-tight" style={{ fontFamily: "var(--store-font)" }}>
                                {pickLocalized(settings.title) || "Headline Title"}
                              </h2>
                              <p className="text-sm text-white/80 font-light leading-relaxed">
                                {pickLocalized(settings.subtitle) || "A short descriptive subheading description."}
                              </p>
                              {heroBtnText && (
                                <span className="px-6 py-2.5 bg-white text-gray-950 text-xs font-bold rounded-[var(--store-radius)] shadow-md">
                                  {heroBtnText}
                                </span>
                              )}
                            </div>
                          </section>
                        );
                        break;

                      case 'features':
                        const featureItems = settings.items || [];
                        blockNode = (
                          <section className="py-12 bg-black/2.5">
                            <div className="px-6 max-w-5xl mx-auto">
                              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                {featureItems.map((item: any, fIdx: number) => (
                                  <div 
                                    key={fIdx}
                                    className="p-6 bg-white rounded-[var(--store-radius)] border border-black/5 flex flex-col items-center text-center gap-2"
                                  >
                                    <div style={{ display: 'inline-flex', color: 'var(--store-primary)', marginBottom: '8px' }}>
                                      <DynamicIcon name={item.emoji || 'sparkles'} size={32} />
                                    </div>
                                    <h4 className="text-base font-bold text-[var(--store-primary)]">{pickLocalized(item.title) || "Feature"}</h4>
                                    <p className="text-xs opacity-70 leading-relaxed">{pickLocalized(item.desc || item.text) || "Description content."}</p>
                                  </div>
                                ))}
                              </div>
                            </div>
                          </section>
                        );
                        break;

                      case 'collection':
                        const limit = Number(settings.limit) || 8;
                        const mockProds = products.length > 0 ? products.slice(0, limit) : [
                          { id: "p1", name: "Oud Royal Signature", basePrice: "1850.00", currency: "EGP" },
                          { id: "p2", name: "Musk Supreme", basePrice: "1450.00", currency: "EGP" }
                        ];

                        blockNode = (
                          <section className="py-12 px-6 max-w-5xl mx-auto">
                            <div className="mb-8 flex justify-between items-baseline">
                              <div>
                                <h3 className="text-xl font-black tracking-tight" style={{ fontFamily: "var(--store-font)" }}>
                                  {pickLocalized(settings.title) || 'Our Collection'}
                                </h3>
                                {settings.subtitle && <p className="text-xs opacity-60 mt-0.5">{pickLocalized(settings.subtitle)}</p>}
                              </div>
                            </div>

                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                              {mockProds.map((prod) => (
                                <div key={prod.id} className="bg-white border border-black/5 rounded-[var(--store-radius)] overflow-hidden shadow-xs flex flex-col">
                                  <div className="aspect-[4/5] bg-gray-50 flex items-center justify-center text-3xl font-light text-gray-400">
                                    <DynamicIcon name="package" size={32} />
                                  </div>
                                  <div className="p-3 flex flex-col flex-1 bg-white">
                                    <h4 className="font-bold text-xs text-gray-900 line-clamp-1">{prod.name}</h4>
                                    <p className="text-[10px] text-gray-400 mt-1 flex-1">A wonderful signature perfume.</p>
                                    <div className="flex items-center justify-between mt-2 pt-2 border-t border-gray-50">
                                      <span className="font-black text-xs text-gray-900">
                                        {Number(prod.basePrice).toLocaleString()} <span className="text-[9px] text-gray-400 font-normal">{prod.currency || 'EGP'}</span>
                                      </span>
                                      <span className="w-6 h-6 rounded-full bg-[var(--store-primary)]/10 text-[var(--store-primary)] flex items-center justify-center text-xs font-bold">
                                        +
                                      </span>
                                    </div>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </section>
                        );
                        break;

                      case 'testimonials':
                        const testimonials = settings.items || [];
                        blockNode = (
                          <section className="py-12 bg-[var(--store-primary)]/5 px-6 border-t border-b border-black/5">
                            <div className="max-w-4xl mx-auto">
                              <h4 className="text-lg font-black text-center mb-8" style={{ fontFamily: "var(--store-font)" }}>
                                {pickLocalized(settings.title) || 'Customer Reviews'}
                              </h4>
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {testimonials.map((t: any, tIdx: number) => (
                                  <div key={tIdx} className="p-5 bg-white rounded-[var(--store-radius)] border border-black/5 flex flex-col gap-3">
                                    <p className="italic text-xs opacity-80 leading-relaxed">"{pickLocalized(t.text) || 'Review content'}"</p>
                                    <div className="flex items-center justify-between">
                                      <span className="font-bold text-[11px] text-[var(--store-primary)]">{t.name || 'Client'}</span>
                                      <span className="text-amber-500 text-xs">{'★'.repeat(Number(t.rating || 5))}</span>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </div>
                          </section>
                        );
                        break;

                      case 'newsletter':
                        blockNode = (
                          <section className="py-12 px-6 bg-[var(--store-primary)]/5 border-t border-b border-black/5 text-center flex flex-col items-center gap-4">
                            <h3 className="text-lg font-black tracking-tight" style={{ fontFamily: "var(--store-font)" }}>
                              {pickLocalized(settings.title) || "Subscribe to our newsletter"}
                            </h3>
                            {settings.subtitle && <p className="text-xs opacity-75 max-w-md mx-auto leading-relaxed">{pickLocalized(settings.subtitle)}</p>}
                            <div className="flex gap-2 w-full max-w-sm mt-2" onClick={(e) => e.stopPropagation()}>
                              <input 
                                type="email" 
                                readOnly
                                placeholder={settings.placeholder || "Enter your email..."} 
                                className="flex-1 px-4 py-2.5 text-xs rounded-[var(--store-radius)] border border-black/10 outline-none bg-white text-gray-800"
                              />
                              <span className="px-5 py-2.5 rounded-[var(--store-radius)] text-white font-bold text-xs bg-[var(--store-primary)] flex items-center justify-center cursor-pointer">
                                {settings.buttonText || "Subscribe"}
                              </span>
                            </div>
                          </section>
                        );
                        break;

                      case 'gallery':
                        const galleryItems = settings.items || [];
                        blockNode = (
                          <section className="py-12 px-6 bg-[var(--store-bg)] border-b border-black/5">
                            <div className="max-w-5xl mx-auto">
                              {settings.title && (
                                <h3 className="text-lg font-black text-center mb-8" style={{ fontFamily: "var(--store-font)" }}>
                                  {pickLocalized(settings.title)}
                                </h3>
                              )}
                              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                {galleryItems.map((item: any, gIdx: number) => (
                                  <div key={gIdx} className="group relative overflow-hidden rounded-[var(--store-radius)] border border-black/5 bg-black/5 aspect-square flex flex-col items-center justify-center p-6 text-center gap-2">
                                    <div style={{ display: 'inline-flex', color: 'var(--store-primary)', marginBottom: '8px' }}>
                                      <DynamicIcon name={item.emoji || 'star'} size={36} />
                                    </div>
                                    <h4 className="font-bold text-sm text-[var(--store-primary)]">{pickLocalized(item.title) || "Gallery Card"}</h4>
                                    <p className="text-[11px] opacity-70 leading-relaxed max-w-[200px]">{pickLocalized(item.desc) || "Short description details here."}</p>
                                  </div>
                                ))}
                              </div>
                            </div>
                          </section>
                        );
                        break;
                      
                      case 'faq':
                        const faqItems = settings.items || [];
                        blockNode = (
                          <section className="py-12 px-6 max-w-3xl mx-auto">
                            <h3 className="text-xl font-black text-center mb-6" style={{ fontFamily: "var(--store-font)" }}>
                              {pickLocalized(settings.title) || "FAQ"}
                            </h3>
                            <div className="flex flex-col gap-3">
                              {faqItems.map((item: any, fIdx: number) => (
                                <div key={fIdx} className="p-4 border border-black/5 rounded-[var(--store-radius)] bg-white">
                                  <h4 className="font-bold text-xs text-gray-900">{pickLocalized(item.question) || "Question?"}</h4>
                                  <p className="text-[11px] text-gray-500 mt-1">{pickLocalized(item.answer) || "Answer details."}</p>
                                </div>
                              ))}
                            </div>
                          </section>
                        );
                        break;
                    }

                    return (
                      <div 
                        key={id}
                        onClick={() => {
                          setActiveTab("layout");
                          setExpandedBlockIndex(idx);
                        }}
                        className={`preview-block-wrapper ${expandedBlockIndex === idx ? "active" : ""}`}
                      >
                        {blockNode}
                      </div>
                    );
                  })}
                </main>

                {/* Simulated Footer with Social links */}
                <footer className="bg-white border-t border-black/5 py-8 px-6 flex flex-col items-center gap-3">
                  <span className="text-sm font-bold tracking-tight">{store.name}</span>
                  
                  {/* Simulated Social Links */}
                  {(tokens.facebookUrl || tokens.instagramUrl || tokens.tiktokUrl || tokens.twitterUrl) && (
                    <div style={{ display: "flex", gap: 12, opacity: 0.7, margin: "4px 0" }}>
                      {tokens.facebookUrl && <span style={{ fontSize: "0.75rem", fontWeight: 700, color: "var(--store-primary)" }}>Facebook</span>}
                      {tokens.instagramUrl && <span style={{ fontSize: "0.75rem", fontWeight: 700, color: "var(--store-primary)" }}>Instagram</span>}
                      {tokens.tiktokUrl && <span style={{ fontSize: "0.75rem", fontWeight: 700, color: "var(--store-primary)" }}>TikTok</span>}
                      {tokens.twitterUrl && <span style={{ fontSize: "0.75rem", fontWeight: 700, color: "var(--store-primary)" }}>Twitter</span>}
                    </div>
                  )}

                  <p className="text-[10px] opacity-50">&copy; {new Date().getFullYear()} {store.name}. Powered by Storefy.</p>
                </footer>

              </div>
            </div>

          </div>
        </section>
      </div>

      {/* 4. VISUAL ADD SECTION drawer MODAL */}
      {isAddSectionOpen && (
        <div className="visual-catalog-backdrop" onClick={() => setIsAddSectionOpen(false)}>
          <div className="visual-catalog-drawer animate-slide-right" onClick={(e) => e.stopPropagation()}>
            <div className="catalog-header">
              <h3>+ Add New Section</h3>
              <button className="catalog-close-btn" onClick={() => setIsAddSectionOpen(false)}>✕</button>
            </div>
            
            <div className="catalog-body">
              {/* Marketing category */}
              <div className="catalog-category-group">
                <div className="catalog-category-title">Marketing & Banner announcements</div>
                <div className="catalog-cards-grid">
                  <div className="catalog-item-card hover-glow" onClick={() => addBlock("promo")}>
                    <div className="catalog-card-icon">📣</div>
                    <div>
                      <div className="catalog-card-name">Promo Notification Bar</div>
                      <div className="catalog-card-desc">An elegant colored banner sitting at the top of your shop for discount codes and free shipping announcements.</div>
                    </div>
                  </div>
                  <div className="catalog-item-card hover-glow" onClick={() => addBlock("newsletter")}>
                    <div className="catalog-card-icon">✉️</div>
                    <div>
                      <div className="catalog-card-name">Newsletter Signup Form</div>
                      <div className="catalog-card-desc">Engage shoppers by displaying an email subscription input box. Excellent for build campaigns.</div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Visuals category */}
              <div className="catalog-category-group">
                <div className="catalog-category-title">Branding & Rich Media Visuals</div>
                <div className="catalog-cards-grid">
                  <div className="catalog-item-card hover-glow" onClick={() => addBlock("hero")}>
                    <div className="catalog-card-icon">✨</div>
                    <div>
                      <div className="catalog-card-name">Hero Header Banner</div>
                      <div className="catalog-card-desc">Your primary welcome banner. Large headline text, action buttons, and full background options.</div>
                    </div>
                  </div>
                  <div className="catalog-item-card hover-glow" onClick={() => addBlock("gallery")}>
                    <div className="catalog-card-icon">🖼️</div>
                    <div>
                      <div className="catalog-card-name">Photo Grid Gallery</div>
                      <div className="catalog-card-desc">Columns showing collections, ingredients, or brand showcases with descriptions.</div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Information category */}
              <div className="catalog-category-group">
                <div className="catalog-category-title">Social Proof & Trust</div>
                <div className="catalog-cards-grid">
                  <div className="catalog-item-card hover-glow" onClick={() => addBlock("features")}>
                    <div className="catalog-card-icon">🛡️</div>
                    <div>
                      <div className="catalog-card-name">Features Grid</div>
                      <div className="catalog-card-desc">Columns displaying benefits (e.g. 100% natural, fast shipping) with beautiful icons.</div>
                    </div>
                  </div>
                  <div className="catalog-item-card hover-glow" onClick={() => addBlock("testimonials")}>
                    <div className="catalog-card-icon">⭐</div>
                    <div>
                      <div className="catalog-card-name">Customer Reviews</div>
                      <div className="catalog-card-desc">Showcase rating stars and positive reviews from happy customers to drive confidence.</div>
                    </div>
                  </div>
                  <div className="catalog-item-card hover-glow" onClick={() => addBlock("faq")}>
                    <div className="catalog-card-icon">❓</div>
                    <div>
                      <div className="catalog-card-name">FAQ Accordion</div>
                      <div className="catalog-card-desc">Common questions and answers that help address purchase hurdles.</div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Products category */}
              <div className="catalog-category-group">
                <div className="catalog-category-title">Products</div>
                <div className="catalog-cards-grid">
                  <div className="catalog-item-card hover-glow" onClick={() => addBlock("collection")}>
                    <div className="catalog-card-icon">🛒</div>
                    <div>
                      <div className="catalog-card-name">Product Catalog Grid</div>
                      <div className="catalog-card-desc">Instantly render a dynamic list of active products from your shop database. Supports limit values.</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 5. INLINE AI COPYWRITER SUCCESTIONS MODAL DROPDOWN */}
      {activeAiField && (
        <div className="copywriter-backdrop" onClick={() => setActiveAiField(null)}>
          <div 
            className="copywriter-dropdown-panel animate-fade-in" 
            onClick={(e) => e.stopPropagation()}
            style={{
              position: "fixed",
              top: "35%",
              left: "50%",
              transform: "translate(-50%, -50%)",
              zIndex: 1100
            }}
          >
            <div className="copywriter-panel-header">
              <span>🪄 AI Copywriter Suggest</span>
              <button onClick={() => setActiveAiField(null)}>✕</button>
            </div>
            <div className="copywriter-panel-body">
              {isAiSuggestionsLoading ? (
                <div className="copywriter-loading">
                  <span className="dot" />
                  <span className="dot" />
                  <span className="dot" />
                  <p>Generating copy alternatives...</p>
                </div>
              ) : (
                <div className="copywriter-suggestions-list">
                  {aiSuggestions.length > 0 ? (
                    aiSuggestions.map((sug, i) => (
                      <button
                        key={i}
                        className="copywriter-sug-item"
                        onClick={() => applyCopywriterSuggestion(sug)}
                      >
                        {sug}
                      </button>
                    ))
                  ) : (
                    <p style={{ margin: 0, fontSize: "0.8rem", opacity: 0.6 }}>No recommendations returned. Please try again.</p>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Styled JSX tags to inject custom layout rules without conflicting with main index.css */}
      <style jsx global>{`
        .admin-customizer-root {
          display: flex;
          flex-direction: column;
          height: 100vh;
          width: 100vw;
          position: fixed;
          top: 0;
          left: 0;
          background: #0f172a;
          color: #f8fafc;
          z-index: 1000;
          font-family: 'Inter', system-ui, sans-serif;
          overflow: hidden;
        }

        .customizer-topbar {
          height: 64px;
          border-bottom: 1px solid #1e293b;
          background: #0f172a;
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 0 24px;
          flex-shrink: 0;
        }

        .customizer-title {
          font-size: 1.1rem;
          font-weight: 850;
          color: #f8fafc;
          line-height: 1.2;
          margin: 0;
        }

        .customizer-subtitle {
          font-size: 0.75rem;
          color: #94a3b8;
          margin: 2px 0 0 0;
        }

        .customizer-device-toggle {
          display: flex;
          background: #1e293b;
          border-radius: 8px;
          padding: 3px;
        }

        .device-btn {
          border: none;
          background: transparent;
          color: #94a3b8;
          font-size: 0.78rem;
          font-weight: 600;
          padding: 6px 12px;
          border-radius: 6px;
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .device-btn.active {
          background: #334155;
          color: #f8fafc;
        }

        .customizer-workspace {
          display: flex;
          flex: 1;
          height: calc(100vh - 64px);
          overflow: hidden;
        }

        .customizer-sidebar {
          width: 380px;
          background: #0b0f19;
          border-right: 1px solid #1e293b;
          display: flex;
          flex-direction: column;
          flex-shrink: 0;
          height: 100%;
          overflow: hidden;
        }

        .customizer-tabs {
          display: grid;
          grid-template-columns: 1fr 1fr 1fr;
          border-bottom: 1px solid #1e293b;
          background: #0f172a;
          flex-shrink: 0;
        }

        .tab-btn {
          border: none;
          background: transparent;
          color: #94a3b8;
          font-size: 0.82rem;
          font-weight: 700;
          padding: 16px 4px;
          cursor: pointer;
          transition: all 0.2s ease;
          border-bottom: 2px solid transparent;
        }

        .tab-btn.active {
          color: #818cf8;
          border-bottom-color: #818cf8;
          background: rgba(129, 140, 248, 0.03);
        }

        .customizer-tab-content {
          flex: 1;
          overflow-y: auto;
          padding: 20px;
        }

        .customizer-tab-content::-webkit-scrollbar {
          width: 4px;
        }
        .customizer-tab-content::-webkit-scrollbar-thumb {
          background: #1e293b;
          border-radius: 2px;
        }

        .customizer-section-panel {
          display: flex;
          flex-direction: column;
          gap: 20px;
        }

        .customizer-section-title {
          font-size: 0.9rem;
          font-weight: 800;
          color: #f8fafc;
          letter-spacing: -0.01em;
          margin: 0;
        }

        .customizer-muted-desc {
          font-size: 0.75rem;
          color: #94a3b8;
          line-height: 1.4;
          margin: 0;
        }

        .presets-list {
          display: flex;
          flex-direction: column;
          gap: 12px;
        }

        .preset-card {
          background: #0f172a;
          border: 1px solid #1e293b;
          border-radius: 10px;
          padding: 14px;
          display: flex;
          flex-direction: column;
          gap: 8px;
          transition: all 0.2s ease;
        }

        .preset-card:hover {
          border-color: #4f46e5;
        }

        .preset-card-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .preset-name {
          font-size: 0.82rem;
          font-weight: 800;
          color: #f8fafc;
        }

        .preset-apply-btn {
          border: none;
          background: #4f46e5;
          color: white;
          font-size: 0.7rem;
          font-weight: 700;
          padding: 5px 10px;
          border-radius: 4px;
          cursor: pointer;
        }

        .preset-desc {
          font-size: 0.72rem;
          color: #94a3b8;
          line-height: 1.4;
          margin: 0;
        }

        .preset-colors {
          display: flex;
          align-items: center;
          gap: 6px;
        }

        .swatch {
          width: 12px;
          height: 12px;
          border-radius: 50%;
          border: 1px solid rgba(255,255,255,0.1);
          display: inline-block;
        }

        .swatch-font-label {
          font-size: 0.7rem;
          color: #64748b;
          margin-left: 4px;
        }

        .customizer-form-group {
          display: flex;
          flex-direction: column;
          gap: 6px;
          margin-bottom: 12px;
          position: relative;
        }

        .customizer-label {
          font-size: 0.75rem;
          font-weight: 600;
          color: #94a3b8;
        }

        .color-picker-wrapper {
          display: flex;
          gap: 8px;
        }

        .color-input {
          width: 38px;
          height: 34px;
          border-radius: 6px;
          border: 1px solid #1e293b;
          background: transparent;
          cursor: pointer;
          padding: 0;
        }

        .color-text-input {
          flex: 1;
          height: 34px;
          border-radius: 6px;
          border: 1px solid #1e293b;
          background: #0f172a;
          color: #f8fafc;
          padding: 0 10px;
          font-size: 0.8rem;
          font-family: monospace;
          outline: none;
        }

        .customizer-select, .customizer-input {
          height: 36px;
          border-radius: 6px;
          border: 1px solid #1e293b;
          background: #0f172a;
          color: #f8fafc;
          padding: 0 10px;
          font-size: 0.8rem;
          outline: none;
          width: 100%;
        }

        .customizer-textarea {
          border-radius: 6px;
          border: 1px solid #1e293b;
          background: #0f172a;
          color: #f8fafc;
          padding: 8px 10px;
          font-size: 0.8rem;
          outline: none;
          width: 100%;
          font-family: inherit;
        }

        .customizer-select:focus, .customizer-input:focus, .customizer-textarea:focus {
          border-color: #818cf8;
        }

        .badge-value {
          background: #1e293b;
          color: #818cf8;
          font-size: 0.68rem;
          font-weight: 700;
          padding: 2px 5px;
          border-radius: 4px;
        }

        /* 3-Level Outline Tree Styling */
        .outline-zone-container {
          margin-bottom: 20px;
          background: rgba(255,255,255,0.01);
          border: 1px solid #1e293b;
          border-radius: 8px;
          padding: 12px;
        }

        .outline-zone-title {
          font-size: 0.7rem;
          font-weight: 900;
          color: #818cf8;
          letter-spacing: 0.08em;
          margin-bottom: 10px;
        }

        .blocks-order-list {
          display: flex;
          flex-direction: column;
          gap: 10px;
        }

        .block-item-card {
          background: #0f172a;
          border: 1px solid #1e293b;
          border-radius: 6px;
          overflow: hidden;
        }

        .block-item-header {
          padding: 10px 12px;
          display: flex;
          justify-content: space-between;
          align-items: center;
          cursor: pointer;
          background: #0f172a;
          user-select: none;
        }

        .block-type-name {
          font-size: 0.72rem;
          font-weight: 800;
          color: #cbd5e1;
        }

        .block-actions {
          display: flex;
          align-items: center;
          gap: 3px;
        }

        .arr-btn, .del-btn, .eye-btn {
          width: 22px;
          height: 22px;
          border-radius: 4px;
          border: 1px solid #1e293b;
          background: #0f172a;
          color: #94a3b8;
          font-size: 0.65rem;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .arr-btn:hover, .eye-btn:hover {
          background: #1e293b;
          color: #f8fafc;
        }

        .del-btn:hover {
          background: #ef4444;
          color: white;
          border-color: #ef4444;
        }

        .block-item-settings {
          padding: 14px;
          border-top: 1px solid #1e293b;
          background: #0b0f19;
          display: flex;
          flex-direction: column;
          gap: 12px;
        }

        .sub-settings-card {
          background: #0f172a;
          border: 1px solid #1e293b;
          border-radius: 6px;
          padding: 10px;
          margin-bottom: 8px;
        }

        .footer-outline-card {
          background: #0f172a;
          border: 1px solid #1e293b;
          border-radius: 6px;
        }
        .footer-outline-header {
          padding: 10px 12px;
          display: flex;
          align-items: center;
          gap: 8px;
        }
        .footer-name {
          font-size: 0.72rem;
          font-weight: 800;
          color: #cbd5e1;
        }

        /* Input field container with 🪄 copywriter icon */
        .ai-copywriter-input-wrapper {
          position: relative;
          display: flex;
          align-items: center;
          width: 100%;
        }

        .ai-copywriter-wand-btn {
          position: absolute;
          right: 8px;
          background: transparent;
          border: none;
          font-size: 0.9rem;
          cursor: pointer;
          opacity: 0.6;
          transition: opacity 0.2s, transform 0.2s;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 4px;
        }

        [dir="rtl"] .ai-copywriter-wand-btn {
          right: auto;
          left: 8px;
        }

        .ai-copywriter-wand-btn:hover {
          opacity: 1;
          transform: scale(1.15);
        }

        .customizer-input.with-wand {
          padding-right: 32px;
        }

        [dir="rtl"] .customizer-input.with-wand {
          padding-right: 12px;
          padding-left: 32px;
        }

        /* Visual Catalog Drawer Dialog Styles */
        .visual-catalog-backdrop {
          position: fixed;
          inset: 0;
          background: rgba(6, 9, 15, 0.7);
          backdrop-filter: blur(8px);
          z-index: 1050;
        }

        .visual-catalog-drawer {
          position: fixed;
          top: 0;
          left: 0;
          width: min(480px, 90vw);
          height: 100vh;
          background: #0b0f19;
          border-right: 1px solid #1e293b;
          box-shadow: 24px 0 64px rgba(0, 0, 0, 0.5);
          display: flex;
          flex-direction: column;
          z-index: 1060;
        }

        .catalog-header {
          padding: 20px 24px;
          border-bottom: 1px solid #1e293b;
          display: flex;
          justify-content: space-between;
          align-items: center;
          background: #0f172a;
        }

        .catalog-header h3 {
          margin: 0;
          font-size: 1.1rem;
          font-weight: 850;
          color: #f8fafc;
        }

        .catalog-close-btn {
          background: transparent;
          border: none;
          color: #94a3b8;
          font-size: 1.1rem;
          cursor: pointer;
        }

        .catalog-body {
          flex: 1;
          overflow-y: auto;
          padding: 24px;
          display: flex;
          flex-direction: column;
          gap: 24px;
        }

        .catalog-category-group {
          display: flex;
          flex-direction: column;
          gap: 12px;
        }

        .catalog-category-title {
          font-size: 0.75rem;
          font-weight: 900;
          color: #818cf8;
          letter-spacing: 0.05em;
          text-transform: uppercase;
        }

        .catalog-cards-grid {
          display: flex;
          flex-direction: column;
          gap: 12px;
        }

        .catalog-item-card {
          padding: 16px;
          background: #0f172a;
          border: 1px solid #1e293b;
          border-radius: 10px;
          cursor: pointer;
          display: flex;
          gap: 14px;
          align-items: flex-start;
          transition: all 0.25s ease;
        }

        .catalog-item-card:hover {
          border-color: #6366f1;
          background: rgba(99, 102, 241, 0.05);
          transform: translateX(4px);
        }

        .catalog-card-icon {
          font-size: 1.8rem;
          padding: 6px;
          background: #1e293b;
          border-radius: 8px;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
        }

        .catalog-card-name {
          font-size: 0.85rem;
          font-weight: 800;
          color: #f8fafc;
          margin-bottom: 4px;
        }

        .catalog-card-desc {
          font-size: 0.72rem;
          color: #94a3b8;
          line-height: 1.4;
        }

        /* Inline AI Copywriter dropdown styling */
        .copywriter-backdrop {
          position: fixed;
          inset: 0;
          background: rgba(0,0,0,0.5);
          z-index: 1090;
        }

        .copywriter-dropdown-panel {
          width: 320px;
          background: #0f172a;
          border: 1px solid #334155;
          border-radius: 12px;
          box-shadow: 0 10px 25px rgba(0,0,0,0.4);
          overflow: hidden;
        }

        .copywriter-panel-header {
          padding: 10px 14px;
          background: #1e293b;
          border-bottom: 1px solid #334155;
          display: flex;
          justify-content: space-between;
          align-items: center;
          font-size: 0.75rem;
          font-weight: 800;
        }

        .copywriter-panel-header button {
          background: transparent;
          border: none;
          color: #94a3b8;
          cursor: pointer;
        }

        .copywriter-panel-body {
          padding: 12px;
        }

        .copywriter-loading {
          display: flex;
          flex-direction: column;
          align-items: center;
          padding: 16px 0;
          gap: 8px;
        }

        .copywriter-loading .dot {
          width: 5px;
          height: 5px;
          background: #818cf8;
          border-radius: 50%;
          display: inline-block;
          animation: typingDot 1.4s infinite ease-in-out;
        }

        .copywriter-loading .dot:nth-child(2) { animation-delay: 0.2s; }
        .copywriter-loading .dot:nth-child(3) { animation-delay: 0.4s; }

        .copywriter-loading p {
          margin: 0;
          font-size: 0.72rem;
          color: #94a3b8;
        }

        .copywriter-suggestions-list {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }

        .copywriter-sug-item {
          padding: 10px 12px;
          background: #0b0f19;
          border: 1px solid #1e293b;
          border-radius: 8px;
          color: #cbd5e1;
          font-size: 0.75rem;
          line-height: 1.4;
          text-align: start;
          cursor: pointer;
          transition: all 0.2s;
        }

        .copywriter-sug-item:hover {
          background: #1e293b;
          color: #f8fafc;
          border-color: #818cf8;
        }

        /* History topbar buttons style */
        .history-action-btn {
          border: none;
          background: transparent;
          color: #94a3b8;
          font-size: 0.72rem;
          font-weight: 700;
          padding: 4px 8px;
          cursor: pointer;
          border-radius: 4px;
        }

        .history-action-btn:hover:not(:disabled) {
          color: #f8fafc;
          background: #334155;
        }

        .history-action-btn:disabled {
          opacity: 0.3;
          cursor: not-allowed;
        }

        /* Simulator visual styles */
        .customizer-preview-container {
          flex: 1;
          background: #1e293b;
          background-image: 
            radial-gradient(#334155 1px, transparent 1px),
            radial-gradient(#334155 1px, transparent 1px);
          background-size: 20px 20px;
          background-position: 0 0, 10px 10px;
          padding: 32px;
          display: flex;
          align-items: center;
          justify-content: center;
          overflow: hidden;
          height: 100%;
        }

        .simulator-frame {
          box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5);
          background: white;
          transition: all 0.4s cubic-bezier(0.16, 1, 0.3, 1);
          overflow: hidden;
          display: flex;
        }

        .simulator-frame.desktop {
          width: 100%;
          height: 100%;
          border-radius: 12px;
          border: 1px solid rgba(255,255,255,0.08);
        }

        .simulator-frame.mobile {
          width: 375px;
          height: 680px;
          border-radius: 40px;
          border: 12px solid #0f172a;
          position: relative;
        }

        .mock-storefront-viewport {
          width: 100%;
          height: 100%;
          overflow-y: auto;
          display: flex;
          flex-direction: column;
        }

        .mock-storefront-viewport::-webkit-scrollbar {
          width: 6px;
        }
        .mock-storefront-viewport::-webkit-scrollbar-track {
          background: transparent;
        }
        .mock-storefront-viewport::-webkit-scrollbar-thumb {
          background: rgba(0,0,0,0.15);
          border-radius: 3px;
        }

        .customizer-alert-success {
          margin: 16px 20px 0;
          padding: 8px 16px;
          background: rgba(16, 185, 129, 0.15);
          border: 1px solid rgba(16, 185, 129, 0.25);
          border-radius: 8px;
          color: #34d399;
          font-size: 0.8rem;
          font-weight: 500;
          line-height: 1.4;
        }

        .customizer-alert-error {
          margin: 16px 20px 0;
          padding: 8px 16px;
          background: rgba(239, 68, 68, 0.15);
          border: 1px solid rgba(239, 68, 68, 0.25);
          border-radius: 8px;
          color: #f87171;
          font-size: 0.8rem;
          font-weight: 500;
          line-height: 1.4;
        }
        
        .hover-glow {
          box-shadow: 0 0 0 transparent;
        }
        .hover-glow:hover {
          box-shadow: 0 0 15px rgba(99, 102, 241, 0.15);
        }

        /* Simulator Click-to-Edit Styles */
        .preview-block-wrapper {
          position: relative;
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .preview-block-wrapper::after {
          content: "";
          position: absolute;
          inset: 0;
          border: 2px dashed transparent;
          pointer-events: none;
          transition: all 0.2s ease;
          z-index: 10;
        }

        .preview-block-wrapper:hover::after {
          border-color: #6366f1;
        }

        .preview-block-wrapper.active::after {
          border: 2px solid #4f46e5;
          background: rgba(99, 102, 241, 0.03);
        }

        .preview-block-wrapper:hover::before {
          content: "Click to Edit";
          position: absolute;
          top: 6px;
          right: 6px;
          background: #4f46e5;
          color: white;
          font-size: 0.65rem;
          font-weight: 700;
          padding: 2px 8px;
          border-radius: 4px;
          z-index: 20;
          pointer-events: none;
          box-shadow: 0 2px 4px rgba(0,0,0,0.25);
        }

        [dir="rtl"] .preview-block-wrapper:hover::before {
          right: auto;
          left: 6px;
        }

        /* Slide Right animation */
        .animate-slide-right {
          animation: slideRight 0.35s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }

        @keyframes slideRight {
          from { transform: translateX(-100%); }
          to { transform: translateX(0); }
        }

        .animate-fade-in {
          animation: fadeIn 0.2s ease-out forwards;
        }

        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
      `}</style>
    </div>
  );

  // Helper renderer function for blocks in outline sidebar list
  function renderOutlineBlockCard(block: any, idx: number) {
    const isExpanded = expandedBlockIndex === idx;
    const isHidden = !!block.settings?.hidden;
    
    return (
      <div 
        key={block.id || idx} 
        className={`block-item-card ${isExpanded ? "expanded" : ""} ${isHidden ? "hidden-translucent" : ""}`}
        style={isHidden ? { opacity: 0.45, borderStyle: "dashed" } : undefined}
      >
        <div className="block-item-header" onClick={() => setExpandedBlockIndex(isExpanded ? null : idx)}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <span className="block-icon" style={{ display: 'inline-flex', alignItems: 'center', color: 'var(--accent-primary)' }}>
              <DynamicIcon name={block.type === 'promo' ? 'gift' : block.type === 'hero' ? 'eye' : block.type === 'features' ? 'sparkles' : block.type === 'collection' ? 'cart' : block.type === 'newsletter' ? 'scroll' : block.type === 'gallery' ? 'eye' : block.type === 'faq' ? 'help' : 'help'} size={16} />
            </span>
            <span className="block-type-name">{block.type.toUpperCase()}</span>
          </div>
          
          <div className="block-actions" onClick={(e) => e.stopPropagation()}>
            <button className="eye-btn" onClick={() => toggleHideBlock(idx)} title={isHidden ? "Show Section" : "Hide Section"}>
              {isHidden ? "👁️‍🗨️" : "👁️"}
            </button>
            <button className="arr-btn" onClick={() => moveBlock(idx, "up")} disabled={idx === 0} title="Move Up">↑</button>
            <button className="arr-btn" onClick={() => moveBlock(idx, "down")} disabled={idx === blocks.length - 1} title="Move Down">↓</button>
            <button className="del-btn" onClick={() => deleteBlock(idx)} title="Delete Section">✕</button>
          </div>
        </div>

        {/* Collapsible settings details */}
        {isExpanded && (
          <div className="block-item-settings">
            
            {/* PROMO SETTINGS */}
            {block.type === 'promo' && (
              <>
                <div className="customizer-form-group">
                  <label className="customizer-label">Promo Message</label>
                  <div className="ai-copywriter-input-wrapper">
                    <input 
                      type="text" 
                      value={pickLocalized(block.settings.text) || ""}
                      onChange={(e) => {
                        const newBlocks = [...blocks];
                        newBlocks[idx].settings.text = e.target.value;
                        setBlocks(newBlocks);
                      }}
                      onBlur={handleInputBlur}
                      className="customizer-input with-wand"
                    />
                    <button 
                      type="button" 
                      className="ai-copywriter-wand-btn" 
                      onClick={() => triggerAiCopywriter(idx, "text", block.settings.text)}
                      title="🪄 AI Copy suggestions"
                    >
                      🪄
                    </button>
                  </div>
                </div>
                <div className="customizer-form-group">
                  <label className="customizer-label">Background Color Override</label>
                  <input 
                    type="text" 
                    placeholder="e.g. #000000 or empty for theme default"
                    value={block.settings.bgColor || ""}
                    onChange={(e) => {
                      const newBlocks = [...blocks];
                      newBlocks[idx].settings.bgColor = e.target.value;
                      setBlocks(newBlocks);
                    }}
                    onBlur={handleInputBlur}
                    className="customizer-input"
                  />
                </div>
              </>
            )}

            {/* HERO SETTINGS */}
            {block.type === 'hero' && (
              <>
                <div className="customizer-form-group">
                  <label className="customizer-label">Headline Title</label>
                  <div className="ai-copywriter-input-wrapper">
                    <input 
                      type="text" 
                      value={pickLocalized(block.settings.title) || ""}
                      onChange={(e) => {
                        const newBlocks = [...blocks];
                        newBlocks[idx].settings.title = e.target.value;
                        setBlocks(newBlocks);
                      }}
                      onBlur={handleInputBlur}
                      className="customizer-input with-wand"
                    />
                    <button 
                      type="button" 
                      className="ai-copywriter-wand-btn" 
                      onClick={() => triggerAiCopywriter(idx, "title", block.settings.title)}
                      title="🪄 AI Copy suggestions"
                    >
                      🪄
                    </button>
                  </div>
                </div>
                <div className="customizer-form-group">
                  <label className="customizer-label">Subheading Description</label>
                  <div className="ai-copywriter-input-wrapper">
                    <textarea 
                      value={pickLocalized(block.settings.subtitle) || ""}
                      onChange={(e) => {
                        const newBlocks = [...blocks];
                        newBlocks[idx].settings.subtitle = e.target.value;
                        setBlocks(newBlocks);
                      }}
                      onBlur={handleInputBlur}
                      className="customizer-textarea"
                      style={{ paddingRight: "32px" }}
                      rows={3}
                    />
                    <button 
                      type="button" 
                      className="ai-copywriter-wand-btn" 
                      style={{ top: "8px", right: "8px" }}
                      onClick={() => triggerAiCopywriter(idx, "subtitle", block.settings.subtitle)}
                      title="🪄 AI Copy suggestions"
                    >
                      🪄
                    </button>
                  </div>
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                  <div className="customizer-form-group">
                    <label className="customizer-label">Button Label</label>
                    <input 
                      type="text" 
                      value={pickLocalized(block.settings.buttonText || block.settings.primaryCta) || ""}
                      onChange={(e) => {
                        const newBlocks = [...blocks];
                        newBlocks[idx].settings.buttonText = e.target.value;
                        setBlocks(newBlocks);
                      }}
                      onBlur={handleInputBlur}
                      className="customizer-input"
                    />
                  </div>
                  <div className="customizer-form-group">
                    <label className="customizer-label">Button Anchor Link</label>
                    <input 
                      type="text" 
                      value={block.settings.buttonLink || ""}
                      onChange={(e) => {
                        const newBlocks = [...blocks];
                        newBlocks[idx].settings.buttonLink = e.target.value;
                        setBlocks(newBlocks);
                      }}
                      onBlur={handleInputBlur}
                      className="customizer-input"
                    />
                  </div>
                </div>
                <div className="customizer-form-group">
                  <label className="customizer-label">Decorating Icon</label>
                  <select
                    value={block.settings.emoji || ""}
                    onChange={(e) => {
                      const newBlocks = [...blocks];
                      newBlocks[idx].settings.emoji = e.target.value;
                      updateStateAndPushHistory(tokens, newBlocks);
                    }}
                    className="customizer-select"
                  >
                    <option value="">No Icon</option>
                    {Object.keys(ICONS).map((iconName) => (
                      <option key={iconName} value={iconName}>
                        {iconName.charAt(0).toUpperCase() + iconName.slice(1)}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="customizer-form-group">
                  <label className="customizer-label">Text Alignment</label>
                  <select 
                    value={block.settings.alignment || "center"}
                    onChange={(e) => {
                      const newBlocks = [...blocks];
                      newBlocks[idx].settings.alignment = e.target.value;
                      updateStateAndPushHistory(tokens, newBlocks);
                    }}
                    className="customizer-select"
                  >
                    <option value="left">Left</option>
                    <option value="center">Center</option>
                    <option value="right">Right</option>
                  </select>
                </div>
                <div className="customizer-form-group">
                  <label className="customizer-label">Background Style</label>
                  <select 
                    value={block.settings.bgType || "gradient"}
                    onChange={(e) => {
                      const newBlocks = [...blocks];
                      newBlocks[idx].settings.bgType = e.target.value;
                      updateStateAndPushHistory(tokens, newBlocks);
                    }}
                    className="customizer-select"
                  >
                    <option value="gradient">Linear Gradient</option>
                    <option value="color">Solid Primary Color</option>
                  </select>
                </div>
                {block.settings.bgType === 'gradient' && (
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                    <div className="customizer-form-group">
                      <label className="customizer-label">Gradient From</label>
                      <input 
                        type="text" 
                        value={block.settings.gradientFrom || ""}
                        onChange={(e) => {
                          const newBlocks = [...blocks];
                          newBlocks[idx].settings.gradientFrom = e.target.value;
                          setBlocks(newBlocks);
                        }}
                        onBlur={handleInputBlur}
                        className="customizer-input"
                      />
                    </div>
                    <div className="customizer-form-group">
                      <label className="customizer-label">Gradient To</label>
                      <input 
                        type="text" 
                        value={block.settings.gradientTo || ""}
                        onChange={(e) => {
                          const newBlocks = [...blocks];
                          newBlocks[idx].settings.gradientTo = e.target.value;
                          setBlocks(newBlocks);
                        }}
                        onBlur={handleInputBlur}
                        className="customizer-input"
                      />
                    </div>
                  </div>
                )}
              </>
            )}

            {/* NESTED SUB-ITEMS LISTS (Features, Testimonials, Gallery, FAQ) */}
            {(block.type === 'features' || block.type === 'testimonials' || block.type === 'gallery' || block.type === 'faq') && (
              <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                
                {/* FAQ section title helper */}
                {block.type === 'faq' && (
                  <div className="customizer-form-group">
                    <label className="customizer-label">Section Title</label>
                    <input 
                      type="text" 
                      value={pickLocalized(block.settings.title) || ""}
                      onChange={(e) => {
                        const newBlocks = [...blocks];
                        newBlocks[idx].settings.title = e.target.value;
                        setBlocks(newBlocks);
                      }}
                      onBlur={handleInputBlur}
                      className="customizer-input"
                    />
                  </div>
                )}

                {/* Gallery section title helper */}
                {block.type === 'gallery' && (
                  <div className="customizer-form-group">
                    <label className="customizer-label">Gallery Section Title</label>
                    <input 
                      type="text" 
                      value={pickLocalized(block.settings.title) || ""}
                      onChange={(e) => {
                        const newBlocks = [...blocks];
                        newBlocks[idx].settings.title = e.target.value;
                        setBlocks(newBlocks);
                      }}
                      onBlur={handleInputBlur}
                      className="customizer-input"
                    />
                  </div>
                )}

                {/* Testimonial section title helper */}
                {block.type === 'testimonials' && (
                  <div className="customizer-form-group">
                    <label className="customizer-label">Testimonials Section Title</label>
                    <input 
                      type="text" 
                      value={pickLocalized(block.settings.title) || ""}
                      onChange={(e) => {
                        const newBlocks = [...blocks];
                        newBlocks[idx].settings.title = e.target.value;
                        setBlocks(newBlocks);
                      }}
                      onBlur={handleInputBlur}
                      className="customizer-input"
                    />
                  </div>
                )}

                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <span className="customizer-label" style={{ fontSize: "0.72rem", color: "#818cf8" }}>NESTED ITEMS ({block.settings.items?.length || 0})</span>
                  <button 
                    type="button" 
                    onClick={() => addNestedItem(idx)}
                    style={{ fontSize: "0.68rem", background: "#1e293b", color: "#f8fafc", padding: "4px 8px", borderRadius: "4px", border: "none", cursor: "pointer" }}
                  >
                    + Add Item
                  </button>
                </div>

                {block.settings.items?.map((item: any, num: number) => (
                  <div key={num} className="sub-settings-card">
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8, borderBottom: "1px solid #1e293b", paddingBottom: 6 }}>
                      <h4 style={{ fontSize: "0.75rem", fontWeight: 700, margin: 0 }}>Item #{num + 1}</h4>
                      <div style={{ display: "flex", gap: 3 }}>
                        <button type="button" className="arr-btn" onClick={() => moveNestedItem(idx, num, "up")} disabled={num === 0}>↑</button>
                        <button type="button" className="arr-btn" onClick={() => moveNestedItem(idx, num, "down")} disabled={num === (block.settings.items.length - 1)}>↓</button>
                        <button type="button" className="del-btn" style={{ width: 18, height: 18 }} onClick={() => deleteNestedItem(idx, num)}>✕</button>
                      </div>
                    </div>

                    {/* Nested item columns depending on section type */}
                    {block.type === 'features' && (
                      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
                          <div className="customizer-form-group" style={{ marginBottom: 0 }}>
                            <label className="customizer-label">Icon</label>
                            <select
                              value={item.emoji || ""}
                              onChange={(e) => {
                                const newBlocks = [...blocks];
                                newBlocks[idx].settings.items[num].emoji = e.target.value;
                                updateStateAndPushHistory(tokens, newBlocks);
                              }}
                              className="customizer-select"
                            >
                              <option value="">No Icon</option>
                              {Object.keys(ICONS).map((iconName) => (
                                <option key={iconName} value={iconName}>
                                  {iconName.charAt(0).toUpperCase() + iconName.slice(1)}
                                </option>
                              ))}
                            </select>
                          </div>
                          <div className="customizer-form-group" style={{ marginBottom: 0 }}>
                            <label className="customizer-label">Title</label>
                            <div className="ai-copywriter-input-wrapper">
                              <input
                                type="text"
                                value={pickLocalized(item.title) || ""}
                                onChange={(e) => {
                                  const newBlocks = [...blocks];
                                  newBlocks[idx].settings.items[num].title = e.target.value;
                                  setBlocks(newBlocks);
                                }}
                                onBlur={handleInputBlur}
                                className="customizer-input"
                                style={{ paddingRight: "24px" }}
                              />
                              <button 
                                type="button" 
                                className="ai-copywriter-wand-btn" 
                                onClick={() => triggerAiCopywriter(idx, "title", item.title, num)}
                                title="🪄 AI Suggestions"
                              >
                                🪄
                              </button>
                            </div>
                          </div>
                        </div>
                        <div className="customizer-form-group" style={{ marginBottom: 0 }}>
                          <label className="customizer-label">Description</label>
                          <div className="ai-copywriter-input-wrapper">
                            <input 
                              type="text" 
                              value={pickLocalized(item.desc || item.text) || ""}
                              onChange={(e) => {
                                const newBlocks = [...blocks];
                                newBlocks[idx].settings.items[num].desc = e.target.value;
                                setBlocks(newBlocks);
                              }}
                              onBlur={handleInputBlur}
                              className="customizer-input"
                              style={{ paddingRight: "24px" }}
                            />
                            <button 
                              type="button" 
                              className="ai-copywriter-wand-btn" 
                              onClick={() => triggerAiCopywriter(idx, "desc", item.desc || item.text, num)}
                              title="🪄 AI Suggestions"
                            >
                              🪄
                            </button>
                          </div>
                        </div>
                      </div>
                    )}

                    {block.type === 'testimonials' && (
                      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                        <div style={{ display: "grid", gridTemplateColumns: "1fr 80px", gap: 10 }}>
                          <div>
                            <label className="customizer-label">Client Name</label>
                            <input 
                              type="text" 
                              value={item.name || ""}
                              onChange={(e) => {
                                const newBlocks = [...blocks];
                                newBlocks[idx].settings.items[num].name = e.target.value;
                                setBlocks(newBlocks);
                              }}
                              onBlur={handleInputBlur}
                              className="customizer-input"
                            />
                          </div>
                          <div>
                            <label className="customizer-label">Rating (1-5)</label>
                            <input 
                              type="number" 
                              min="1"
                              max="5"
                              value={item.rating || 5}
                              onChange={(e) => {
                                const newBlocks = [...blocks];
                                newBlocks[idx].settings.items[num].rating = parseInt(e.target.value) || 5;
                                setBlocks(newBlocks);
                              }}
                              onBlur={handleInputBlur}
                              className="customizer-input"
                            />
                          </div>
                        </div>
                        <div className="customizer-form-group" style={{ margin: 0 }}>
                          <label className="customizer-label">Review Text</label>
                          <div className="ai-copywriter-input-wrapper">
                            <textarea 
                              value={pickLocalized(item.text) || ""}
                              onChange={(e) => {
                                const newBlocks = [...blocks];
                                newBlocks[idx].settings.items[num].text = e.target.value;
                                setBlocks(newBlocks);
                              }}
                              onBlur={handleInputBlur}
                              className="customizer-textarea"
                              style={{ paddingRight: "24px" }}
                              rows={2}
                            />
                            <button 
                              type="button" 
                              className="ai-copywriter-wand-btn" 
                              onClick={() => triggerAiCopywriter(idx, "text", item.text, num)}
                              title="🪄 AI Suggestions"
                            >
                              🪄
                            </button>
                          </div>
                        </div>
                      </div>
                    )}

                    {block.type === 'gallery' && (
                      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
                          <div className="customizer-form-group" style={{ marginBottom: 0 }}>
                            <label className="customizer-label">Emoji Icon</label>
                            <select
                              value={item.emoji || ""}
                              onChange={(e) => {
                                const newBlocks = [...blocks];
                                newBlocks[idx].settings.items[num].emoji = e.target.value;
                                updateStateAndPushHistory(tokens, newBlocks);
                              }}
                              className="customizer-select"
                            >
                              <option value="">No Icon</option>
                              {Object.keys(ICONS).map((iconName) => (
                                <option key={iconName} value={iconName}>
                                  {iconName.charAt(0).toUpperCase() + iconName.slice(1)}
                                </option>
                              ))}
                            </select>
                          </div>
                          <div className="customizer-form-group" style={{ marginBottom: 0 }}>
                            <label className="customizer-label">Card Title</label>
                            <div className="ai-copywriter-input-wrapper">
                              <input
                                type="text"
                                value={pickLocalized(item.title) || ""}
                                onChange={(e) => {
                                  const newBlocks = [...blocks];
                                  newBlocks[idx].settings.items[num].title = e.target.value;
                                  setBlocks(newBlocks);
                                }}
                                onBlur={handleInputBlur}
                                className="customizer-input"
                                style={{ paddingRight: "24px" }}
                              />
                              <button 
                                type="button" 
                                className="ai-copywriter-wand-btn" 
                                onClick={() => triggerAiCopywriter(idx, "title", item.title, num)}
                                title="🪄 AI Suggestions"
                              >
                                🪄
                              </button>
                            </div>
                          </div>
                        </div>
                        <div className="customizer-form-group" style={{ margin: 0 }}>
                          <label className="customizer-label">Description Text</label>
                          <div className="ai-copywriter-input-wrapper">
                            <input 
                              type="text" 
                              value={pickLocalized(item.desc || item.text) || ""}
                              onChange={(e) => {
                                const newBlocks = [...blocks];
                                newBlocks[idx].settings.items[num].desc = e.target.value;
                                setBlocks(newBlocks);
                              }}
                              onBlur={handleInputBlur}
                              className="customizer-input"
                              style={{ paddingRight: "24px" }}
                            />
                            <button 
                              type="button" 
                              className="ai-copywriter-wand-btn" 
                              onClick={() => triggerAiCopywriter(idx, "desc", item.desc || item.text, num)}
                              title="🪄 AI Suggestions"
                            >
                              🪄
                            </button>
                          </div>
                        </div>
                      </div>
                    )}

                    {block.type === 'faq' && (
                      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                        <div className="customizer-form-group" style={{ marginBottom: 0 }}>
                          <label className="customizer-label">Question Text</label>
                          <input 
                            type="text" 
                            value={pickLocalized(item.question) || ""}
                            onChange={(e) => {
                              const newBlocks = [...blocks];
                              newBlocks[idx].settings.items[num].question = e.target.value;
                              setBlocks(newBlocks);
                            }}
                            onBlur={handleInputBlur}
                            className="customizer-input"
                          />
                        </div>
                        <div className="customizer-form-group" style={{ margin: 0 }}>
                          <label className="customizer-label">Answer Text</label>
                          <textarea 
                            value={pickLocalized(item.answer) || ""}
                            onChange={(e) => {
                              const newBlocks = [...blocks];
                              newBlocks[idx].settings.items[num].answer = e.target.value;
                              setBlocks(newBlocks);
                            }}
                            onBlur={handleInputBlur}
                            className="customizer-textarea"
                            rows={2}
                          />
                        </div>
                      </div>
                    )}

                  </div>
                ))}
              </div>
            )}

            {/* COLLECTION SETTINGS */}
            {block.type === 'collection' && (
              <>
                <div className="customizer-form-group">
                  <label className="customizer-label">Collection Header Title</label>
                  <div className="ai-copywriter-input-wrapper">
                    <input 
                      type="text" 
                      value={pickLocalized(block.settings.title) || ""}
                      onChange={(e) => {
                        const newBlocks = [...blocks];
                        newBlocks[idx].settings.title = e.target.value;
                        setBlocks(newBlocks);
                      }}
                      onBlur={handleInputBlur}
                      className="customizer-input with-wand"
                    />
                    <button 
                      type="button" 
                      className="ai-copywriter-wand-btn" 
                      onClick={() => triggerAiCopywriter(idx, "title", block.settings.title)}
                      title="🪄 AI Copy suggestions"
                    >
                      🪄
                    </button>
                  </div>
                </div>
                <div className="customizer-form-group">
                  <label className="customizer-label">Subheading description</label>
                  <div className="ai-copywriter-input-wrapper">
                    <input 
                      type="text" 
                      value={pickLocalized(block.settings.subtitle) || ""}
                      onChange={(e) => {
                        const newBlocks = [...blocks];
                        newBlocks[idx].settings.subtitle = e.target.value;
                        setBlocks(newBlocks);
                      }}
                      onBlur={handleInputBlur}
                      className="customizer-input with-wand"
                    />
                    <button 
                      type="button" 
                      className="ai-copywriter-wand-btn" 
                      onClick={() => triggerAiCopywriter(idx, "subtitle", block.settings.subtitle)}
                      title="🪄 AI Copy suggestions"
                    >
                      🪄
                    </button>
                  </div>
                </div>
                <div className="customizer-form-group">
                  <label className="customizer-label">Max products displayed</label>
                  <input 
                    type="number" 
                    min="1"
                    max="24"
                    value={block.settings.limit || 8}
                    onChange={(e) => {
                      const newBlocks = [...blocks];
                      newBlocks[idx].settings.limit = parseInt(e.target.value) || 8;
                      setBlocks(newBlocks);
                    }}
                    onBlur={handleInputBlur}
                    className="customizer-input"
                  />
                </div>
              </>
            )}

            {/* NEWSLETTER SETTINGS */}
            {block.type === 'newsletter' && (
              <>
                <div className="customizer-form-group">
                  <label className="customizer-label">Title</label>
                  <div className="ai-copywriter-input-wrapper">
                    <input 
                      type="text" 
                      value={pickLocalized(block.settings.title) || ""}
                      onChange={(e) => {
                        const newBlocks = [...blocks];
                        newBlocks[idx].settings.title = e.target.value;
                        setBlocks(newBlocks);
                      }}
                      onBlur={handleInputBlur}
                      className="customizer-input with-wand"
                    />
                    <button 
                      type="button" 
                      className="ai-copywriter-wand-btn" 
                      onClick={() => triggerAiCopywriter(idx, "title", block.settings.title)}
                      title="🪄 AI Copy suggestions"
                    >
                      🪄
                    </button>
                  </div>
                </div>
                <div className="customizer-form-group">
                  <label className="customizer-label">Subheading Description</label>
                  <div className="ai-copywriter-input-wrapper">
                    <input 
                      type="text" 
                      value={pickLocalized(block.settings.subtitle) || ""}
                      onChange={(e) => {
                        const newBlocks = [...blocks];
                        newBlocks[idx].settings.subtitle = e.target.value;
                        setBlocks(newBlocks);
                      }}
                      onBlur={handleInputBlur}
                      className="customizer-input with-wand"
                    />
                    <button 
                      type="button" 
                      className="ai-copywriter-wand-btn" 
                      onClick={() => triggerAiCopywriter(idx, "subtitle", block.settings.subtitle)}
                      title="🪄 AI Copy suggestions"
                    >
                      🪄
                    </button>
                  </div>
                </div>
                <div className="customizer-form-group">
                  <label className="customizer-label">Placeholder Text</label>
                  <input 
                    type="text" 
                    value={block.settings.placeholder || ""}
                    onChange={(e) => {
                      const newBlocks = [...blocks];
                      newBlocks[idx].settings.placeholder = e.target.value;
                      setBlocks(newBlocks);
                    }}
                    onBlur={handleInputBlur}
                    className="customizer-input"
                  />
                </div>
                <div className="customizer-form-group">
                  <label className="customizer-label">Button Label</label>
                  <input 
                    type="text" 
                    value={block.settings.buttonText || ""}
                    onChange={(e) => {
                      const newBlocks = [...blocks];
                      newBlocks[idx].settings.buttonText = e.target.value;
                      setBlocks(newBlocks);
                    }}
                    onBlur={handleInputBlur}
                    className="customizer-input"
                  />
                </div>
              </>
            )}

          </div>
        )}
      </div>
    );
  }
}
