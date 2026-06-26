"use client";

import dynamic from "next/dynamic";

const StorefrontBlocks = dynamic(() => import("./StorefrontBlocks").then((mod) => mod.StorefrontBlocks), {
  loading: () => <div className="storefront-sections"><div className="store-shell" style={{ padding: "40px 20px", textAlign: "center" }}>Loading sections...</div></div>,
  ssr: false,
});

export { StorefrontBlocks };
