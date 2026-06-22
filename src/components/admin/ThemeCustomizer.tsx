"use client";

import React, { useState, useEffect, useTransition } from "react";
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
    },
    blocks: [
      {
        id: "promo-preset",
        type: "promo",
        settings: {
          text: "Exquisite Selection: Enjoy complimentary shipping on orders over 1000 EGP.",
          textColor: "#ffffff",
          bgColor: "#1e1b4b"
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
          emoji: ""
        }
      },
      {
        id: "features-preset",
        type: "features",
        settings: {
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
          limit: 8
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
    },
    blocks: [
      {
        id: "promo-preset",
        type: "promo",
        settings: {
          text: "MIDNIGHT EXCLUSIVE: CODE 'BLOOM' GETS 15% OFF ALL SCENTS NOW.",
          textColor: "#090514",
          bgColor: "#22d3ee"
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
          emoji: "sparkles"
        }
      },
      {
        id: "collection-preset",
        type: "collection",
        settings: {
          title: "Vapor Scents Collection",
          subtitle: "Bold fragrances that evolve as you move.",
          limit: 8
        }
      },
      {
        id: "testimonials-preset",
        type: "testimonials",
        settings: {
          title: "Rave Reviews",
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
    },
    blocks: [
      {
        id: "promo-preset",
        type: "promo",
        settings: {
          text: "Organic & Ethical: 100% vegan ingredients. Handcrafted in Egypt.",
          textColor: "#f0fdfa",
          bgColor: "#0f766e"
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
          emoji: "droplet"
        }
      },
      {
        id: "features-preset",
        type: "features",
        settings: {
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
          limit: 8
        }
      }
    ]
  },
  "rose-gold": {
    name: "Rose Gold",
    description: "Feminine blush pink & gold accents, elegant serif, 12px borders. Perfect for beauty, cosmetics & jewelry.",
    tokens: {
      primaryColor: "#be185d",
      secondaryColor: "#9d174d",
      backgroundColor: "#fff1f2",
      textColor: "#881337",
      fontFamily: "Playfair Display",
      borderRadius: "12px",
    },
    blocks: [
      {
        id: "promo-preset",
        type: "promo",
        settings: {
          text: "New Arrivals: Rose Gold Edition — Limited Stock Available Now",
          textColor: "#fff1f2",
          bgColor: "#be185d"
        }
      },
      {
        id: "hero-preset",
        type: "hero",
        settings: {
          title: "Elegance in Every Drop",
          subtitle: "A curated selection of luxury cosmetics and fragrances designed for the modern woman who demands excellence.",
          buttonText: "Discover the Collection",
          buttonLink: "#collection",
          alignment: "center",
          bgType: "gradient",
          gradientFrom: "#831843",
          gradientTo: "#9d174d",
          emoji: "sparkles"
        }
      },
      {
        id: "features-preset",
        type: "features",
        settings: {
          items: [
            { title: "Luxury Crafted", desc: "Each product is hand-curated for premium quality and elegance.", emoji: "sparkles" },
            { title: "Gift Ready", desc: "Beautifully packaged, perfect as a gift for any occasion.", emoji: "gift" },
            { title: "Free Returns", desc: "Love it or return it — we stand by every product.", emoji: "sparkles" }
          ]
        }
      },
      {
        id: "collection-preset",
        type: "collection",
        settings: {
          title: "The Rose Gold Edit",
          subtitle: "Hand-picked luxury essentials, just for you.",
          limit: 8
        }
      },
      {
        id: "testimonials-preset",
        type: "testimonials",
        settings: {
          title: "Loved by Thousands",
          items: [
            { name: "Nour S.", text: "Absolutely gorgeous packaging and the scent lasts all day. I've already ordered three more!", rating: 5 },
            { name: "Mariam H.", text: "This is the most beautiful store experience I've had shopping online. Highly recommend!", rating: 5 }
          ]
        }
      }
    ]
  },
  "obsidian-bold": {
    name: "Obsidian Bold",
    description: "Ultra-dark matte black with electric orange accents, bold Outfit typography, sharp 0px edges. For streetwear & bold brands.",
    tokens: {
      primaryColor: "#ea580c",
      secondaryColor: "#c2410c",
      backgroundColor: "#09090b",
      textColor: "#fafafa",
      fontFamily: "Outfit",
      borderRadius: "0px",
    },
    blocks: [
      {
        id: "promo-preset",
        type: "promo",
        settings: {
          text: "DROP ALERT: Limited Edition Release — Get Yours Before It Sells Out.",
          textColor: "#09090b",
          bgColor: "#ea580c"
        }
      },
      {
        id: "hero-preset",
        type: "hero",
        settings: {
          title: "NO RULES. JUST SCENT.",
          subtitle: "For the bold. For the fearless. Raw fragrances that define who you are — not who they expect you to be.",
          buttonText: "SHOP THE DROP",
          buttonLink: "#collection",
          alignment: "left",
          bgType: "gradient",
          gradientFrom: "#09090b",
          gradientTo: "#18181b",
          emoji: ""
        }
      },
      {
        id: "features-preset",
        type: "features",
        settings: {
          items: [
            { title: "Unisex Formula", desc: "Gender-free fragrances designed for any personality.", emoji: "lightning" },
            { title: "Concentrate Oil", desc: "Pure fragrance oil — no fillers, no compromise.", emoji: "lightning" },
            { title: "Steel Packaging", desc: "Heavy-duty matte-black packaging built to impress.", emoji: "shield" }
          ]
        }
      },
      {
        id: "collection-preset",
        type: "collection",
        settings: {
          title: "THE COLLECTION",
          subtitle: "Drop after drop. Season after season.",
          limit: 8
        }
      }
    ]
  },
  "azure-sky": {
    name: "Azure Sky",
    description: "Calm sky-blue & white palette, Inter typography, 10px borders. Ideal for wellness, skincare & natural products.",
    tokens: {
      primaryColor: "#0369a1",
      secondaryColor: "#0284c7",
      backgroundColor: "#f0f9ff",
      textColor: "#0c4a6e",
      fontFamily: "Inter",
      borderRadius: "10px",
    },
    blocks: [
      {
        id: "promo-preset",
        type: "promo",
        settings: {
          text: "Free Standard Shipping on All Orders. No Minimum Required.",
          textColor: "#f0f9ff",
          bgColor: "#0369a1"
        }
      },
      {
        id: "hero-preset",
        type: "hero",
        settings: {
          title: "Pure. Natural. Powerful.",
          subtitle: "Science-backed skincare and wellness products crafted from the finest natural ingredients to help you feel your best.",
          buttonText: "Shop Wellness",
          buttonLink: "#collection",
          alignment: "center",
          bgType: "gradient",
          gradientFrom: "#075985",
          gradientTo: "#0369a1",
          emoji: "droplet"
        }
      },
      {
        id: "features-preset",
        type: "features",
        settings: {
          items: [
            { title: "Clinically Tested", desc: "Dermatologist-approved formulas for sensitive skin.", emoji: "flask" },
            { title: "Natural Ingredients", desc: "Sourced from certified organic suppliers globally.", emoji: "leaf" },
            { title: "Cruelty Free", desc: "Never tested on animals. Always ethically made.", emoji: "leaf" }
          ]
        }
      },
      {
        id: "collection-preset",
        type: "collection",
        settings: {
          title: "Wellness Collection",
          subtitle: "Your daily ritual, elevated.",
          limit: 8
        }
      }
    ]
  },
  "desert-sand": {
    name: "Desert Sand",
    description: "Warm sandy beige & terracotta tones, serif Playfair Display, 6px borders. Ideal for oud, oriental & artisanal products.",
    tokens: {
      primaryColor: "#92400e",
      secondaryColor: "#b45309",
      backgroundColor: "#fef3c7",
      textColor: "#451a03",
      fontFamily: "Playfair Display",
      borderRadius: "6px",
    },
    blocks: [
      {
        id: "promo-preset",
        type: "promo",
        settings: {
          text: "Artisanal Heritage: Handcrafted Oud & Oriental Blends from Ancient Recipes.",
          textColor: "#fef3c7",
          bgColor: "#92400e"
        }
      },
      {
        id: "hero-preset",
        type: "hero",
        settings: {
          title: "The Ancient Art of Oud",
          subtitle: "Hand-distilled from the finest agarwood forests. A fragrance tradition spanning centuries, now in your hands.",
          buttonText: "Explore Our Heritage",
          buttonLink: "#collection",
          alignment: "left",
          bgType: "gradient",
          gradientFrom: "#451a03",
          gradientTo: "#78350f",
          emoji: "droplet"
        }
      },
      {
        id: "features-preset",
        type: "features",
        settings: {
          items: [
            { title: "Pure Oud Oil", desc: "Steam-distilled from premium agarwood. No synthetics.", emoji: "tree" },
            { title: "Heritage Recipe", desc: "Formulas passed down through generations of master perfumers.", emoji: "scroll" },
            { title: "Aged & Matured", desc: "Fragrances aged in oak barrels for deep, rich complexity.", emoji: "tree" }
          ]
        }
      },
      {
        id: "collection-preset",
        type: "collection",
        settings: {
          title: "Oriental Heritage Collection",
          subtitle: "Centuries of craftsmanship. One extraordinary scent.",
          limit: 8
        }
      },
      {
        id: "testimonials-preset",
        type: "testimonials",
        settings: {
          title: "Testimonials",
          items: [
            { name: "Ahmed Al-Rashid", text: "The finest oud I have ever experienced outside of the Gulf. Truly authentic and long-lasting.", rating: 5 },
            { name: "Sara K.", text: "My grandfather used to wear something that smelled like this. Pure nostalgia and luxury.", rating: 5 }
          ]
        }
      }
    ]
  },
  "neon-minimal": {
    name: "Neon Minimal",
    description: "Sleek monochromatic dark interface with bright electric blue highlights. Modern, fast, and high-contrast.",
    tokens: {
      primaryColor: "#3b82f6",
      secondaryColor: "#1d4ed8",
      backgroundColor: "#050505",
      textColor: "#ffffff",
      fontFamily: "Inter",
      borderRadius: "0px",
    },
    blocks: [
      {
        id: "promo-preset",
        type: "promo",
        settings: {
          text: "FAST DELIVERY WORLDWIDE. ORDER NOW FOR 24-HOUR SHIPPING.",
          textColor: "#050505",
          bgColor: "#3b82f6"
        }
      },
      {
        id: "hero-preset",
        type: "hero",
        settings: {
          title: "MINIMALIST LUXURY",
          subtitle: "Cutting-edge scents for the modern minimalist. Precision, quality, and sophistication.",
          buttonText: "SHOP NOW",
          buttonLink: "#collection",
          alignment: "center",
          bgType: "color",
          bgColor: "#050505",
          emoji: "lightning"
        }
      },
      {
        id: "features-preset",
        type: "features",
        settings: {
          items: [
            { title: "High Contrast", desc: "Designed for ultimate readability and impact.", emoji: "eye" },
            { title: "Sustainable", desc: "Carbon-neutral shipping on all orders.", emoji: "globe" },
            { title: "Signature Scent", desc: "Experience our signature, award-winning profile.", emoji: "award" }
          ]
        }
      },
      {
        id: "collection-preset",
        type: "collection",
        settings: {
          title: "CORE COLLECTION",
          subtitle: "Essentials refined to perfection.",
          limit: 8
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
  const [tokens, setTokens] = useState({
    primaryColor: initialTheme?.tokens?.primaryColor || "#0f172a",
    secondaryColor: initialTheme?.tokens?.secondaryColor || "#334155",
    backgroundColor: initialTheme?.tokens?.backgroundColor || "#ffffff",
    textColor: initialTheme?.tokens?.textColor || "#0f172a",
    fontFamily: initialTheme?.tokens?.fontFamily || "Inter",
    borderRadius: initialTheme?.tokens?.borderRadius || "8px",
  });

  const [blocks, setBlocks] = useState<any[]>(() => {
    if (initialPage?.blocks && initialPage.blocks.length > 0) {
      return initialPage.blocks;
    }
    // Default blocks matching Store Name
    return [
      {
        id: "promo-default",
        type: "promo",
        settings: {
          text: "Grand Opening: Free shipping on all orders over 500 EGP!",
          textColor: "#ffffff",
          bgColor: "var(--store-primary)"
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
          emoji: "droplet"
        }
      },
      {
        id: "features-default",
        type: "features",
        settings: {
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
          limit: 8
        }
      }
    ];
  });

  const [expandedBlockIndex, setExpandedBlockIndex] = useState<number | null>(null);
  const [successMsg, setSuccessMsg] = useState("");
  const [errorMsg, setErrorMsg] = useState("");

  const handleApplyPreset = (presetKey: keyof typeof PRESETS) => {
    const preset = PRESETS[presetKey];
    setTokens({ ...preset.tokens });
    setBlocks(JSON.parse(JSON.stringify(preset.blocks))); // Deep copy
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

    setBlocks(newBlocks);
    if (expandedBlockIndex === index) {
      setExpandedBlockIndex(targetIdx);
    } else if (expandedBlockIndex === targetIdx) {
      setExpandedBlockIndex(index);
    }
  };

  const deleteBlock = (index: number) => {
    if (confirm("Are you sure you want to remove this section?")) {
      const newBlocks = blocks.filter((_, i) => i !== index);
      setBlocks(newBlocks);
      setExpandedBlockIndex(null);
    }
  };

  const addBlock = (type: "promo" | "hero" | "features" | "collection" | "testimonials") => {
    const newBlock: any = {
      id: `${type}-${Date.now()}`,
      type,
      settings: {}
    };

    if (type === "promo") {
      newBlock.settings = { text: "Special Announcement: Add custom banner text here!", textColor: "#ffffff", bgColor: "var(--store-primary)" };
    } else if (type === "hero") {
      newBlock.settings = { title: "Custom Headline Title", subtitle: "Write a descriptive and engaging subtitle here.", buttonText: "Click Me", buttonLink: "#", alignment: "center", bgType: "gradient", gradientFrom: "#0f172a", gradientTo: "#1e293b", emoji: "sparkles" };
    } else if (type === "features") {
      newBlock.settings = {
        items: [
          { title: "Feature One", desc: "Description text highlighting important details.", emoji: "package" },
          { title: "Feature Two", desc: "Description text highlighting important details.", emoji: "flask" },
          { title: "Feature Three", desc: "Description text highlighting important details.", emoji: "revenue" }
        ]
      };
    } else if (type === "collection") {
      newBlock.settings = { title: "Featured Products", subtitle: "Explore our handpicked catalog of popular products.", limit: 8 };
    } else if (type === "testimonials") {
      newBlock.settings = {
        title: "Client Testimonials",
        items: [
          { name: "Youssef", text: "Exceptional fragrance line and amazing packaging experience.", rating: 5 },
          { name: "Sherif", text: "Fragrance persists beautifully throughout the entire day.", rating: 5 }
        ]
      };
    }

    setBlocks([...blocks, newBlock]);
    setExpandedBlockIndex(blocks.length); // Open the new block
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

  // Load preview fonts
  return (
    <div className="admin-customizer-root">
      {/* Dynamic font styling links for customizer preview */}
      <link rel="preconnect" href="https://fonts.googleapis.com" />
      <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      <link href="https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400..900;1,400..900&family=Outfit:wght@100..900&family=Inter:wght@100..900&display=swap" rel="stylesheet" />

      {/* Top Save Bar */}
      <header className="customizer-topbar">
        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
          <a href="/admin" className="btn-secondary" style={{ padding: "8px 16px", borderRadius: "8px", fontSize: "0.85rem", height: 38 }}>
            ← Exit Customizer
          </a>
          <div>
            <h1 className="customizer-title">{store.name}</h1>
            <p className="customizer-subtitle">Design Customizer &bull; /store/{store.slug}</p>
          </div>
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
              Style
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
                <h3 className="customizer-section-title">Select Preset Theme</h3>
                <p className="customizer-muted-desc">Apply one of our preset themes to instantly style your store fonts, colors, and layout sections. You can fully customize them afterwards.</p>
                
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

            {/* 2. STYLE TAB */}
            {activeTab === "style" && (
              <div className="customizer-section-panel">
                <h3 className="customizer-section-title">Style Tokens</h3>
                
                {/* Color pickers */}
                <div className="customizer-form-group">
                  <label className="customizer-label">Primary Color (Accent/Buttons)</label>
                  <div className="color-picker-wrapper">
                    <input 
                      type="color" 
                      value={tokens.primaryColor}
                      onChange={(e) => setTokens({ ...tokens, primaryColor: e.target.value })}
                      className="color-input"
                    />
                    <input 
                      type="text" 
                      value={tokens.primaryColor}
                      onChange={(e) => setTokens({ ...tokens, primaryColor: e.target.value })}
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
                      className="color-input"
                    />
                    <input 
                      type="text" 
                      value={tokens.secondaryColor}
                      onChange={(e) => setTokens({ ...tokens, secondaryColor: e.target.value })}
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
                      className="color-input"
                    />
                    <input 
                      type="text" 
                      value={tokens.backgroundColor}
                      onChange={(e) => setTokens({ ...tokens, backgroundColor: e.target.value })}
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
                      className="color-input"
                    />
                    <input 
                      type="text" 
                      value={tokens.textColor}
                      onChange={(e) => setTokens({ ...tokens, textColor: e.target.value })}
                      className="color-text-input"
                    />
                  </div>
                </div>

                {/* Fonts */}
                <div className="customizer-form-group">
                  <label className="customizer-label">Typography Style</label>
                  <select 
                    value={tokens.fontFamily}
                    onChange={(e) => setTokens({ ...tokens, fontFamily: e.target.value })}
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
                    style={{ width: "100%" }}
                  />
                  <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.75rem", opacity: 0.6, marginTop: 4 }}>
                    <span>0px (Sharp)</span>
                    <span>12px (Rounded)</span>
                    <span>24px (Soft)</span>
                  </div>
                </div>
              </div>
            )}

            {/* 3. LAYOUT TAB */}
            {activeTab === "layout" && (
              <div className="customizer-section-panel">
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
                  <h3 className="customizer-section-title" style={{ margin: 0 }}>Sections List</h3>
                  
                  {/* Add dropdown */}
                  <select 
                    onChange={(e) => {
                      if (e.target.value) {
                        addBlock(e.target.value as any);
                        e.target.value = ""; // reset
                      }
                    }}
                    className="customizer-select"
                    style={{ width: "auto", fontSize: "0.8rem", height: 32, padding: "0 8px" }}
                  >
                    <option value="">+ Add Section</option>
                    <option value="promo">Promo Notification Bar</option>
                    <option value="hero">Hero Header Banner</option>
                    <option value="features">Features Highlighting Grid</option>
                    <option value="collection">Product Catalog Collection</option>
                    <option value="testimonials">Customer Reviews Carousel</option>
                  </select>
                </div>

                {/* Blocks list */}
                <div className="blocks-order-list">
                  {blocks.map((block, idx) => {
                    const isExpanded = expandedBlockIndex === idx;
                    return (
                      <div key={block.id || idx} className={`block-item-card ${isExpanded ? "expanded" : ""}`}>
                        <div className="block-item-header" onClick={() => setExpandedBlockIndex(isExpanded ? null : idx)}>
                          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                            <span className="block-icon" style={{ display: 'inline-flex', alignItems: 'center', color: 'var(--accent-primary)' }}>
                              <DynamicIcon name={block.type === 'promo' ? 'gift' : block.type === 'hero' ? 'eye' : block.type === 'features' ? 'sparkles' : block.type === 'collection' ? 'cart' : 'help'} size={16} />
                            </span>
                            <span className="block-type-name">{block.type.toUpperCase()}</span>
                          </div>
                          
                          <div className="block-actions" onClick={(e) => e.stopPropagation()}>
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
                                  <input 
                                    type="text" 
                                    value={pickLocalized(block.settings.text) || ""}
                                    onChange={(e) => {
                                      const newBlocks = [...blocks];
                                      newBlocks[idx].settings.text = e.target.value;
                                      setBlocks(newBlocks);
                                    }}
                                    className="customizer-input"
                                  />
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
                                  <input 
                                    type="text" 
                                    value={pickLocalized(block.settings.title) || ""}
                                    onChange={(e) => {
                                      const newBlocks = [...blocks];
                                      newBlocks[idx].settings.title = e.target.value;
                                      setBlocks(newBlocks);
                                    }}
                                    className="customizer-input"
                                  />
                                </div>
                                <div className="customizer-form-group">
                                  <label className="customizer-label">Subheading Description</label>
                                  <textarea 
                                    value={pickLocalized(block.settings.subtitle) || ""}
                                    onChange={(e) => {
                                      const newBlocks = [...blocks];
                                      newBlocks[idx].settings.subtitle = e.target.value;
                                      setBlocks(newBlocks);
                                    }}
                                    className="customizer-textarea"
                                    rows={3}
                                  />
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
                                      setBlocks(newBlocks);
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
                                      setBlocks(newBlocks);
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
                                      setBlocks(newBlocks);
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
                                        className="customizer-input"
                                      />
                                    </div>
                                  </div>
                                )}
                              </>
                            )}

                            {/* FEATURES SETTINGS */}
                            {block.type === 'features' && (
                              <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                                {[0, 1, 2].map((num) => {
                                  const item = (block.settings.items && block.settings.items[num]) || { title: "", desc: "", emoji: "" };
                                  return (
                                    <div key={num} className="sub-settings-card">
                                      <h4 style={{ fontSize: "0.8rem", fontWeight: 700, marginBottom: 8 }}>Column {num + 1}</h4>
                                      <div style={{ display: "flex", flexDirection: "column", gap: 8, marginBottom: 8 }}>
                                        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                                          <div className="customizer-form-group" style={{ marginBottom: 0 }}>
                                            <label className="customizer-label">Icon</label>
                                            <select
                                              value={item.emoji || ""}
                                              onChange={(e) => {
                                                const newBlocks = [...blocks];
                                                if (!newBlocks[idx].settings.items) newBlocks[idx].settings.items = [];
                                                if (!newBlocks[idx].settings.items[num]) newBlocks[idx].settings.items[num] = {};
                                                newBlocks[idx].settings.items[num].emoji = e.target.value;
                                                setBlocks(newBlocks);
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
                                            <input
                                              type="text"
                                              value={pickLocalized(item.title) || ""}
                                              onChange={(e) => {
                                                const newBlocks = [...blocks];
                                                if (!newBlocks[idx].settings.items) newBlocks[idx].settings.items = [];
                                                if (!newBlocks[idx].settings.items[num]) newBlocks[idx].settings.items[num] = {};
                                                newBlocks[idx].settings.items[num].title = e.target.value;
                                                setBlocks(newBlocks);
                                              }}
                                              className="customizer-input"
                                            />
                                          </div>
                                        </div>
                                      </div>
                                      <div className="customizer-form-group" style={{ margin: 0 }}>
                                        <label className="customizer-label">Description</label>
                                        <input 
                                          type="text" 
                                          value={pickLocalized(item.desc || item.text) || ""}
                                          onChange={(e) => {
                                            const newBlocks = [...blocks];
                                            if (!newBlocks[idx].settings.items) newBlocks[idx].settings.items = [];
                                            if (!newBlocks[idx].settings.items[num]) newBlocks[idx].settings.items[num] = {};
                                            newBlocks[idx].settings.items[num].desc = e.target.value;
                                            setBlocks(newBlocks);
                                          }}
                                          className="customizer-input"
                                        />
                                      </div>
                                    </div>
                                  );
                                })}
                              </div>
                            )}

                            {/* COLLECTION SETTINGS */}
                            {block.type === 'collection' && (
                              <>
                                <div className="customizer-form-group">
                                  <label className="customizer-label">Collection Header Title</label>
                                  <input 
                                    type="text" 
                                    value={pickLocalized(block.settings.title) || ""}
                                    onChange={(e) => {
                                      const newBlocks = [...blocks];
                                      newBlocks[idx].settings.title = e.target.value;
                                      setBlocks(newBlocks);
                                    }}
                                    className="customizer-input"
                                  />
                                </div>
                                <div className="customizer-form-group">
                                  <label className="customizer-label">Subheading description</label>
                                  <input 
                                    type="text" 
                                    value={pickLocalized(block.settings.subtitle) || ""}
                                    onChange={(e) => {
                                      const newBlocks = [...blocks];
                                      newBlocks[idx].settings.subtitle = e.target.value;
                                      setBlocks(newBlocks);
                                    }}
                                    className="customizer-input"
                                  />
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
                                    className="customizer-input"
                                  />
                                </div>
                              </>
                            )}

                            {/* TESTIMONIALS SETTINGS */}
                            {block.type === 'testimonials' && (
                              <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                                <div className="customizer-form-group" style={{ margin: 0 }}>
                                  <label className="customizer-label">Section Header Title</label>
                                  <input 
                                    type="text" 
                                    value={pickLocalized(block.settings.title) || ""}
                                    onChange={(e) => {
                                      const newBlocks = [...blocks];
                                      newBlocks[idx].settings.title = e.target.value;
                                      setBlocks(newBlocks);
                                    }}
                                    className="customizer-input"
                                  />
                                </div>
                                {[0, 1].map((num) => {
                                  const t = (block.settings.items && block.settings.items[num]) || { name: "", text: "", rating: 5 };
                                  return (
                                    <div key={num} className="sub-settings-card">
                                      <h4 style={{ fontSize: "0.8rem", fontWeight: 700, marginBottom: 8 }}>Testimonial {num + 1}</h4>
                                      <div style={{ display: "grid", gridTemplateColumns: "1fr 80px", gap: 10, marginBottom: 8 }}>
                                        <div>
                                          <label className="customizer-label">Client Name</label>
                                          <input 
                                            type="text" 
                                            value={t.name || ""}
                                            onChange={(e) => {
                                              const newBlocks = [...blocks];
                                              if (!newBlocks[idx].settings.items) newBlocks[idx].settings.items = [];
                                              if (!newBlocks[idx].settings.items[num]) newBlocks[idx].settings.items[num] = {};
                                              newBlocks[idx].settings.items[num].name = e.target.value;
                                              setBlocks(newBlocks);
                                            }}
                                            className="customizer-input"
                                          />
                                        </div>
                                        <div>
                                          <label className="customizer-label">Rating (1-5)</label>
                                          <input 
                                            type="number" 
                                            min="1"
                                            max="5"
                                            value={t.rating || 5}
                                            onChange={(e) => {
                                              const newBlocks = [...blocks];
                                              if (!newBlocks[idx].settings.items) newBlocks[idx].settings.items = [];
                                              if (!newBlocks[idx].settings.items[num]) newBlocks[idx].settings.items[num] = {};
                                              newBlocks[idx].settings.items[num].rating = parseInt(e.target.value) || 5;
                                              setBlocks(newBlocks);
                                            }}
                                            className="customizer-input"
                                          />
                                        </div>
                                      </div>
                                      <div className="customizer-form-group" style={{ margin: 0 }}>
                                        <label className="customizer-label">Review Text</label>
                                        <textarea 
                                          value={pickLocalized(t.text) || ""}
                                          onChange={(e) => {
                                            const newBlocks = [...blocks];
                                            if (!newBlocks[idx].settings.items) newBlocks[idx].settings.items = [];
                                            if (!newBlocks[idx].settings.items[num]) newBlocks[idx].settings.items[num] = {};
                                            newBlocks[idx].settings.items[num].text = e.target.value;
                                            setBlocks(newBlocks);
                                          }}
                                          className="customizer-textarea"
                                          rows={2}
                                        />
                                      </div>
                                    </div>
                                  );
                                })}
                              </div>
                            )}

                          </div>
                        )}
                      </div>
                    );
                  })}
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

                    switch (block.type) {
                      case 'promo':
                        return (
                          <div 
                            key={id} 
                            style={{ 
                              backgroundColor: settings.bgColor || 'var(--store-primary)', 
                              color: settings.textColor || '#ffffff' 
                            }}
                            className="w-full text-center py-2 px-4 text-xs font-semibold"
                          >
                            {pickLocalized(settings.text) || "Promo Notification banner text"}
                          </div>
                        );

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

                        return (
                          <section 
                            key={id}
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

                      case 'features':
                        const featureItems = settings.items || [];
                        return (
                          <section key={id} className="py-12 bg-black/2.5">
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

                      case 'collection':
                        const limit = Number(settings.limit) || 8;
                        // Mock fallback products if none exist
                        const mockProds = products.length > 0 ? products.slice(0, limit) : [
                          { id: "p1", name: "Oud Royal Signature", basePrice: "1850.00", currency: "EGP" },
                          { id: "p2", name: "Musk Supreme", basePrice: "1450.00", currency: "EGP" }
                        ];

                        return (
                          <section key={id} className="py-12 px-6 max-w-5xl mx-auto">
                            <div className="mb-8 flex justify-between items-baseline">
                              <div>
                                <h3 className="text-xl font-black tracking-tight" style={{ fontFamily: "var(--store-font)" }}>
                                  {pickLocalized(settings.title) || 'Our Collection'}
                                </h3>
                                {settings.subtitle && <p className="text-xs opacity-60 mt-0.5">{pickLocalized(settings.subtitle)}</p>}
                              </div>
                            </div>

                            {/* Simulated product cards grid */}
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

                      case 'testimonials':
                        const testimonials = settings.items || [];
                        return (
                          <section key={id} className="py-12 bg-[var(--store-primary)]/5 px-6 border-t border-b border-black/5">
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

                      default:
                        return null;
                    }
                  })}
                </main>

                {/* Simulated Footer */}
                <footer className="bg-white border-t border-black/5 py-8 px-6 flex flex-col items-center gap-2">
                  <span className="text-sm font-bold tracking-tight">{store.name}</span>
                  <p className="text-[10px] opacity-50">&copy; {new Date().getFullYear()} {store.name}. Powered by Storefy.</p>
                </footer>

              </div>
            </div>

          </div>
        </section>
      </div>

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
          font-size: 0.85rem;
          font-weight: 700;
          padding: 16px 8px;
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
          padding: 24px;
        }

        .customizer-section-panel {
          display: flex;
          flex-direction: column;
          gap: 20px;
        }

        .customizer-section-title {
          font-size: 0.95rem;
          font-weight: 800;
          color: #f8fafc;
          letter-spacing: -0.01em;
          margin-bottom: 4px;
        }

        .customizer-muted-desc {
          font-size: 0.78rem;
          color: #94a3b8;
          line-height: 1.5;
          margin: 0;
        }

        .presets-list {
          display: flex;
          flex-direction: column;
          gap: 16px;
        }

        .preset-card {
          background: #0f172a;
          border: 1px solid #1e293b;
          border-radius: 12px;
          padding: 16px;
          display: flex;
          flex-direction: column;
          gap: 10px;
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        }

        .preset-card:hover {
          border-color: #4f46e5;
          transform: translateY(-2px);
        }

        .preset-card-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .preset-name {
          font-size: 0.88rem;
          font-weight: 800;
          color: #f8fafc;
        }

        .preset-apply-btn {
          border: none;
          background: #4f46e5;
          color: white;
          font-size: 0.72rem;
          font-weight: 700;
          padding: 6px 12px;
          border-radius: 6px;
          cursor: pointer;
          transition: background 0.2s;
        }

        .preset-apply-btn:hover {
          background: #4338ca;
        }

        .preset-desc {
          font-size: 0.75rem;
          color: #94a3b8;
          line-height: 1.4;
          margin: 0;
        }

        .preset-colors {
          display: flex;
          align-items: center;
          gap: 6px;
          margin-top: 4px;
        }

        .swatch {
          width: 14px;
          height: 14px;
          border-radius: 50%;
          border: 1px solid rgba(255,255,255,0.1);
          display: inline-block;
        }

        .swatch-font-label {
          font-size: 0.72rem;
          color: #94a3b8;
          margin-left: 6px;
        }

        .customizer-form-group {
          display: flex;
          flex-direction: column;
          gap: 8px;
          margin-bottom: 16px;
        }

        .customizer-label {
          font-size: 0.78rem;
          font-weight: 600;
          color: #94a3b8;
        }

        .color-picker-wrapper {
          display: flex;
          gap: 8px;
        }

        .color-input {
          width: 44px;
          height: 38px;
          border-radius: 8px;
          border: 1px solid #1e293b;
          background: transparent;
          cursor: pointer;
          padding: 0;
        }

        .color-text-input {
          flex: 1;
          height: 38px;
          border-radius: 8px;
          border: 1px solid #1e293b;
          background: #0f172a;
          color: #f8fafc;
          padding: 0 12px;
          font-size: 0.85rem;
          font-family: monospace;
          outline: none;
        }

        .color-text-input:focus {
          border-color: #818cf8;
        }

        .customizer-select, .customizer-input {
          height: 38px;
          border-radius: 8px;
          border: 1px solid #1e293b;
          background: #0f172a;
          color: #f8fafc;
          padding: 0 12px;
          font-size: 0.85rem;
          outline: none;
          width: 100%;
        }

        .customizer-textarea {
          border-radius: 8px;
          border: 1px solid #1e293b;
          background: #0f172a;
          color: #f8fafc;
          padding: 10px 12px;
          font-size: 0.85rem;
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
          font-size: 0.72rem;
          font-weight: 700;
          padding: 2px 6px;
          border-radius: 4px;
        }

        .blocks-order-list {
          display: flex;
          flex-direction: column;
          gap: 12px;
          margin-top: 12px;
        }

        .block-item-card {
          background: #0f172a;
          border: 1px solid #1e293b;
          border-radius: 8px;
          overflow: hidden;
          transition: border-color 0.2s;
        }

        .block-item-card.expanded {
          border-color: #334155;
        }

        .block-item-header {
          padding: 12px 16px;
          display: flex;
          justify-content: space-between;
          align-items: center;
          cursor: pointer;
          background: #0f172a;
          user-select: none;
        }

        .block-item-header:hover {
          background: #1e293b/40;
        }

        .block-icon {
          font-size: 1.1rem;
        }

        .block-type-name {
          font-size: 0.75rem;
          font-weight: 800;
          color: #cbd5e1;
          letter-spacing: 0.05em;
        }

        .block-actions {
          display: flex;
          align-items: center;
          gap: 4px;
        }

        .arr-btn, .del-btn {
          width: 24px;
          height: 24px;
          border-radius: 4px;
          border: 1px solid #1e293b;
          background: #0f172a;
          color: #94a3b8;
          font-size: 0.72rem;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: all 0.2s;
        }

        .arr-btn:hover:not(:disabled) {
          background: #1e293b;
          color: #f8fafc;
        }

        .arr-btn:disabled {
          opacity: 0.25;
          cursor: not-allowed;
        }

        .del-btn:hover {
          background: #ef4444;
          color: white;
          border-color: #ef4444;
        }

        .block-item-settings {
          padding: 16px;
          border-top: 1px solid #1e293b;
          background: #0b0f19;
          display: flex;
          flex-direction: column;
          gap: 14px;
        }

        .sub-settings-card {
          background: #0f172a;
          border: 1px solid #1e293b;
          border-radius: 8px;
          padding: 12px;
        }

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
          margin: 16px 24px 0;
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
          margin: 16px 24px 0;
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
      `}</style>
    </div>
  );
}
