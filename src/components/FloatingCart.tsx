"use client";

import { useCartStore } from "@/store/useCartStore";
import { usePathname, useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";

export default function FloatingCart() {
  const pathname = usePathname();
  const router = useRouter();
  const { getTotalItems, getTotalPrice } = useCartStore();

  // Hide cart on specific pages
  const hiddenPages = ["/", "/admin", "/admin/orders", "/admin/menu", "/admin/reports", "/cart", "/payment", "/queue"];
  if (hiddenPages.some(page => pathname?.startsWith(page) && page !== "/menu") && pathname !== "/menu") {
      // Actually we just want it to be visible on /menu maybe.
      // Let's explicitly define allowed pages.
  }

  // A safer check: only show on /menu
  if (pathname !== "/menu") return null;

  const totalItems = getTotalItems();
  const totalPrice = getTotalPrice();

  if (totalItems === 0) return null;

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      maximumFractionDigits: 0,
    }).format(price);
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ y: 100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 100, opacity: 0 }}
        className="fixed bottom-8 right-8 z-30"
      >
        <button
          onClick={() => router.push("/cart")}
          className="bg-[#E53935] hover:bg-[#C62828] text-white rounded-2xl p-6 shadow-2xl flex items-center gap-6 transition-colors duration-300"
        >
          <div className="flex flex-col items-start">
            <span className="text-sm font-medium opacity-90">{totalItems} Item</span>
            <span className="text-xl font-bold">{formatPrice(totalPrice)}</span>
          </div>
          <div className="bg-white/20 px-4 py-2 rounded-xl text-lg font-semibold uppercase tracking-wider">
            Pesan
          </div>
        </button>
      </motion.div>
    </AnimatePresence>
  );
}
