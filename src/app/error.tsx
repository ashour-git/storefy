"use client";

import { useEffect } from "react";

export default function ErrorPage({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log the error to console with structured context
    console.error("Application Error Boundary:", error);
  }, [error]);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 relative">
      {/* Abstract Background Element */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-1/2 -right-1/4 w-[1000px] h-[1000px] rounded-full bg-gradient-to-b from-red-900/10 to-transparent blur-3xl opacity-30" />
      </div>

      <div className="max-w-md w-full text-center relative z-10 space-y-6">
        <div className="w-20 h-20 bg-red-500/10 text-red-500 rounded-full flex items-center justify-center text-4xl mx-auto border border-red-500/20">
          ⚠️
        </div>

        <div className="space-y-2">
          <h1 className="text-3xl font-black tracking-tight text-white">Something went wrong</h1>
          <p className="text-slate-400 text-sm">
            An unexpected error occurred in our system. The platform administrators have been notified.
          </p>
        </div>

        <div className="p-4 bg-slate-900/50 border border-slate-800 rounded-xl font-mono text-xs text-red-400 text-left overflow-x-auto max-h-32">
          {error.message || "Unknown error"}
        </div>

        <div className="flex justify-center gap-4">
          <button
            onClick={() => window.location.href = "/"}
            className="btn-secondary"
            style={{ padding: "10px 20px", fontSize: "0.9rem" }}
          >
            Go Home
          </button>
          <button
            onClick={() => reset()}
            className="btn-primary"
            style={{ padding: "10px 20px", fontSize: "0.9rem" }}
          >
            Try Again
          </button>
        </div>
      </div>
    </div>
  );
}
