"use client";

import { useEffect } from "react";
import { useOrderStore } from "@/store/useOrderStore";

export default function SyncOrders() {
  const { syncOrders } = useOrderStore();

  useEffect(() => {
    const handleStorage = (e: StorageEvent) => {
      if (e.key === "titik-ngunyah-orders") {
        if (e.newValue) {
          try {
            const parsed = JSON.parse(e.newValue);
            if (parsed && parsed.state && parsed.state.orders) {
              syncOrders(parsed.state.orders);
            }
          } catch (err) {}
        }
      }
    };
    window.addEventListener("storage", handleStorage);
    return () => window.removeEventListener("storage", handleStorage);
  }, [syncOrders]);

  return null;
}
