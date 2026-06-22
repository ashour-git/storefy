"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Wizard } from "../../../../components/wizard/WizardStep";

export default function CreateStorePage() {
  const router = useRouter();
  
  // Form State
  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [category, setCategory] = useState("");
  const [currency, setCurrency] = useState("EGP");
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleNameChange = (value: string) => {
    setName(value);
    setSlug(
      value
        .toLowerCase()
        .replace(/[^a-z0-9\s-]/g, "")
        .replace(/\s+/g, "-")
        .slice(0, 40)
    );
  };

  const handleSubmit = async () => {
    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/stores", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, slug, category }),
      });

      if (!res.ok) {
        const data = await res.json();
        setError(data.error || "Failed to create store");
        setLoading(false);
        return;
      }

      router.push("/admin");
      router.refresh();
    } catch {
      setError("Something went wrong. Please try again.");
      setLoading(false);
    }
  };

  const categories = [
    { value: "perfume", label: "🧴 Perfume & Fragrances", desc: "Sell signature scents and colognes." },
    { value: "fashion", label: "👗 Fashion & Clothing", desc: "Apparel, shoes, and accessories." },
    { value: "electronics", label: "📱 Electronics", desc: "Gadgets, phones, and computers." },
    { value: "food", label: "🍕 Food & Beverages", desc: "Local treats and imported snacks." },
  ];

  const steps = [
    {
      id: "basics",
      title: "Name Your Store",
      subtitle: "What will your brand be known as?",
      content: (
        <div className="flex flex-col gap-6 w-full max-w-md mx-auto">
          <div className="flex flex-col gap-2">
            <label className="text-slate-300 font-medium">Store Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => handleNameChange(e.target.value)}
              placeholder="e.g., Scent Palace"
              className="bg-slate-950 border border-slate-700 rounded-xl px-5 py-4 text-white text-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all placeholder:text-slate-600"
              autoFocus
            />
          </div>
          
          <div className="flex flex-col gap-2 opacity-80 mt-2">
            <label className="text-slate-400 font-medium text-sm">Your Store URL</label>
            <div className="flex bg-slate-950 border border-slate-800 rounded-xl overflow-hidden focus-within:ring-2 focus-within:ring-indigo-500/50 transition-all">
              <span className="px-4 py-3 bg-slate-900 text-slate-500 border-r border-slate-800 select-none">
                storefy.com/
              </span>
              <input
                type="text"
                value={slug}
                onChange={(e) => setSlug(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ""))}
                placeholder="scent-palace"
                className="bg-transparent flex-1 px-4 py-3 text-white outline-none"
              />
            </div>
          </div>
        </div>
      ),
      isValid: name.trim().length >= 3 && slug.trim().length >= 3,
    },
    {
      id: "category",
      title: "What are you selling?",
      subtitle: "We'll customize your AI engine based on your choice.",
      content: (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 w-full">
          {categories.map((cat) => (
            <button
              key={cat.value}
              onClick={() => setCategory(cat.value)}
              className={`flex flex-col items-start p-5 rounded-xl border-2 text-left transition-all ${
                category === cat.value
                  ? "border-indigo-500 bg-indigo-500/10"
                  : "border-slate-800 bg-slate-900/50 hover:border-slate-600 hover:bg-slate-800"
              }`}
            >
              <span className="text-xl font-bold text-white mb-2">{cat.label}</span>
              <span className="text-sm text-slate-400">{cat.desc}</span>
            </button>
          ))}
        </div>
      ),
      isValid: category !== "",
    },
    {
      id: "currency",
      title: "Store Currency",
      subtitle: "Which currency will you accept for payments?",
      content: (
        <div className="flex flex-col gap-6 w-full max-w-md mx-auto">
          <div className="flex flex-col gap-4">
            <button
              onClick={() => setCurrency("EGP")}
              className={`flex items-center justify-between p-5 rounded-xl border-2 transition-all ${
                currency === "EGP" ? "border-indigo-500 bg-indigo-500/10" : "border-slate-800 bg-slate-900/50 hover:border-slate-600"
              }`}
            >
              <div className="flex items-center gap-4">
                <span className="text-3xl">🇪🇬</span>
                <div className="flex flex-col text-left">
                  <span className="font-bold text-white">Egyptian Pound (EGP)</span>
                  <span className="text-xs text-slate-400">Default for Paymob</span>
                </div>
              </div>
              <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${currency === "EGP" ? "border-indigo-500 bg-indigo-500" : "border-slate-600"}`}>
                {currency === "EGP" && <div className="w-2 h-2 bg-white rounded-full" />}
              </div>
            </button>

            <button
              disabled
              className="flex items-center justify-between p-5 rounded-xl border-2 border-slate-800 bg-slate-900/20 opacity-50 cursor-not-allowed"
            >
              <div className="flex items-center gap-4">
                <span className="text-3xl">🇸🇦</span>
                <div className="flex flex-col text-left">
                  <span className="font-bold text-white">Saudi Riyal (SAR)</span>
                  <span className="text-xs text-amber-500 font-medium">Coming Soon</span>
                </div>
              </div>
            </button>
          </div>

          {error && (
            <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm text-center">
              {error}
            </div>
          )}
        </div>
      ),
      isValid: currency !== "",
    }
  ];

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 relative">
      {/* Abstract Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-1/2 -right-1/4 w-[1000px] h-[1000px] rounded-full bg-gradient-to-b from-indigo-900/20 to-transparent blur-3xl opacity-50" />
      </div>

      <div className="w-full relative z-10">
        <Wizard steps={steps} onComplete={handleSubmit} isSubmitting={loading} />
      </div>
    </div>
  );
}
