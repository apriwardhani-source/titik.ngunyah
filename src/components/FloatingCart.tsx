"use client";

import { useCartStore } from "@/store/useCartStore";
import { usePathname, useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { formatPrice } from "@/lib/utils";

export default function FloatingCart() {
  const pathname = usePathname();
  const router = useRouter();
  const { getTotalItems, getTotalPrice } = useCartStore();

  // Only show floating cart on /menu page
  if (pathname !== "/menu") return null;

  const totalItems = getTotalItems();
  const totalPrice = getTotalPrice();

  if (totalItems === 0) return null;

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
