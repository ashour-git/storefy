import Link from "next/link";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-6 text-center">
      <h1 className="text-9xl font-black text-slate-800 tracking-tighter mb-4">404</h1>
      <h2 className="text-3xl font-bold text-white mb-4">Page not found</h2>
      <p className="text-slate-400 max-w-md mb-8">
        Sorry, we couldn't find the page you're looking for. It might have been moved or doesn't exist.
      </p>
      <Link
        href="/"
        className="px-8 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-full font-semibold transition-colors shadow-[0_0_20px_rgba(79,70,229,0.3)]"
      >
        Return Home
      </Link>
    </div>
  );
}
