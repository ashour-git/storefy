"use client";

export default function NotFoundPage() {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 relative">
      {/* Abstract Background Element */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-1/2 -right-1/4 w-[1000px] h-[1000px] rounded-full bg-gradient-to-b from-indigo-900/10 to-transparent blur-3xl opacity-30" />
      </div>

      <div className="max-w-md w-full text-center relative z-10 space-y-6">
        <div className="text-8xl font-black tracking-tight text-indigo-500/80 animate-pulse">
          404
        </div>

        <div className="space-y-2">
          <h1 className="text-3xl font-black tracking-tight text-white">Page not found</h1>
          <p className="text-slate-400 text-sm">
            Sorry, we couldn't find the page you're looking for. It might have been moved or deleted.
          </p>
        </div>

        <div className="flex flex-col gap-3 max-w-xs mx-auto pt-4">
          <a
            href="/"
            className="btn-primary text-decoration-none"
            style={{ width: "100%" }}
          >
            Go back home
          </a>
          <a
            href="/admin"
            className="btn-secondary text-decoration-none"
            style={{ width: "100%" }}
          >
            Go to Admin Dashboard
          </a>
        </div>
      </div>
    </div>
  );
}
