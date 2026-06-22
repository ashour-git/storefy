"use client";

import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from "react";
import { type Locale, type TranslationKey, translations } from "../lib/i18n";

/* ─── Types ─── */
type Theme = "light" | "dark";

interface AppContextValue {
  theme: Theme;
  toggleTheme: () => void;
  locale: Locale;
  setLocale: (l: Locale) => void;
  t: (key: TranslationKey) => string;
  dir: "ltr" | "rtl";
  // Auth modal
  authModal: null | "login" | "signup";
  openLogin: () => void;
  openSignup: () => void;
  closeAuth: () => void;
}

const AppContext = createContext<AppContextValue | null>(null);

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error("useApp must be used within AppProvider");
  return ctx;
}

/* ─── Provider ─── */
export function AppProvider({ children }: { children: ReactNode }) {
  const [theme, setTheme] = useState<Theme>(() => {
    if (typeof window === "undefined") return "dark";
    const savedTheme = localStorage.getItem("sf-theme");
    return savedTheme === "light" || savedTheme === "dark" ? savedTheme : "dark";
  });
  const [locale, setLocaleState] = useState<Locale>(() => {
    if (typeof window === "undefined") return "en";
    const savedLocale = localStorage.getItem("sf-locale");
    return savedLocale === "en" || savedLocale === "ar" ? savedLocale : "en";
  });
  const [authModal, setAuthModal] = useState<null | "login" | "signup">(null);
  const [mounted, setMounted] = useState(false);

  // Hydrate from localStorage on mount
  useEffect(() => {
    queueMicrotask(() => setMounted(true));
  }, []);

  // Sync theme to <html>
  useEffect(() => {
    if (!mounted) return;
    document.documentElement.setAttribute("data-theme", theme);
    localStorage.setItem("sf-theme", theme);
  }, [theme, mounted]);

  // Sync locale / dir to <html>
  useEffect(() => {
    if (!mounted) return;
    const dir = translations[locale].dir;
    document.documentElement.setAttribute("dir", dir);
    document.documentElement.setAttribute("lang", locale);
    localStorage.setItem("sf-locale", locale);
  }, [locale, mounted]);

  const toggleTheme = useCallback(() => {
    setTheme((prev) => (prev === "dark" ? "light" : "dark"));
  }, []);

  const setLocale = useCallback((l: Locale) => {
    setLocaleState(l);
  }, []);

  const tFn = useCallback(
    (key: TranslationKey) => translations[locale][key],
    [locale]
  );

  const dir = translations[locale].dir;

  const value: AppContextValue = {
    theme,
    toggleTheme,
    locale,
    setLocale,
    t: tFn,
    dir,
    authModal,
    openLogin: () => setAuthModal("login"),
    openSignup: () => setAuthModal("signup"),
    closeAuth: () => setAuthModal(null),
  };

  return (
    <AppContext.Provider value={value}>
      <div style={mounted ? undefined : { visibility: "hidden" }} className="h-full">
        {children}
      </div>
    </AppContext.Provider>
  );
}
