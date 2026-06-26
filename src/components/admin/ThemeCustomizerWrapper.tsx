"use client";

import dynamic from "next/dynamic";

const ThemeCustomizer = dynamic(() => import("./ThemeCustomizer").then((mod) => mod.ThemeCustomizer), {
  loading: () => <div className="admin-page"><div className="admin-loading">Loading theme customizer...</div></div>,
  ssr: false,
});

export { ThemeCustomizer };
