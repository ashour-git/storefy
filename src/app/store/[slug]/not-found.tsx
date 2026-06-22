import Link from "next/link";

export default function StoreNotFound() {
  return (
    <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-6 text-center">
      <div className="w-24 h-24 bg-slate-900 rounded-full flex items-center justify-center mb-6 text-4xl shadow-xl">
        🏬
      </div>
      <h1 className="text-3xl font-bold text-white mb-3">Store Not Found</h1>
      <p className="text-slate-400 max-w-md mb-8">
        We couldn't find a store at this address. It might have been closed, deleted, or you typed the URL incorrectly.
      </p>
      <Link
        href="/"
        className="px-8 py-3 bg-slate-800 hover:bg-slate-700 text-white rounded-full font-semibold transition-colors"
      >
        Go to Storefy Home
      </Link>
    </div>
  );
}
