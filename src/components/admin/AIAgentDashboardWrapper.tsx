"use client";

import dynamic from "next/dynamic";

const AIAgentDashboard = dynamic(() => import("./AIAgentDashboard").then((mod) => mod.AIAgentDashboard), {
  loading: () => <div className="admin-page"><div className="admin-loading">Loading AI dashboard...</div></div>,
  ssr: false,
});

export { AIAgentDashboard };
