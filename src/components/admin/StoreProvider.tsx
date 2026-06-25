"use client";

import { createContext, useContext, useState, useEffect, useCallback, ReactNode } from "react";
import { useRouter } from "next/navigation";

interface StoreInfo {
  id: string;
  name: string;
  slug: string;
  customDomain?: string | null;
}

interface StoreContextValue {
  activeStore: StoreInfo;
  allStores: StoreInfo[];
  switchStore: (storeId: string) => Promise<void>;
}

const StoreContext = createContext<StoreContextValue | null>(null);

export function StoreProvider({
  activeStore,
  allStores,
  children,
}: {
  activeStore: StoreInfo;
  allStores: StoreInfo[];
  children: ReactNode;
}) {
  const router = useRouter();
  const [current, setCurrent] = useState<StoreInfo>(activeStore);

  useEffect(() => {
    setCurrent(activeStore);
  }, [activeStore.id]);

  const switchStore = useCallback(async (storeId: string) => {
    try {
      const res = await fetch("/api/stores/switch", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ storeId }),
      });
      if (!res.ok) return;
      const match = allStores.find(s => s.id === storeId);
      if (match) setCurrent(match);
      router.refresh();
    } catch {}
  }, [allStores, router]);

  return (
    <StoreContext.Provider value={{ activeStore: current, allStores, switchStore }}>
      {children}
    </StoreContext.Provider>
  );
}

export function useStore() {
  const ctx = useContext(StoreContext);
  if (!ctx) throw new Error("useStore must be used within StoreProvider");
  return ctx;
}
