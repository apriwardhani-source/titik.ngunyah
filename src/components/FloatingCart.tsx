"use client";

import { useCartStore } from "@/store/useCartStore";
import { usePathname, useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { formatPrice } from "@/lib/utils";
import { ShoppingBag, ArrowRight } from "lucide-react";

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
        initial={{ y: 100, opacity: 0, scale: 0.9 }}
        animate={{ y: 0, opacity: 1, scale: 1 }}
        exit={{ y: 100, opacity: 0, scale: 0.9 }}
        transition={{ type: "spring", damping: 20 }}
        className="fixed bottom-6 right-6 md:bottom-8 md:right-8 z-30"
      >
        <button
          onClick={() => router.push("/cart")}
          className="bg-[#b80000] hover:bg-[#940000] text-white rounded-3xl p-5 md:p-6 shadow-2xl flex items-center gap-5 transition-all duration-200 border-2 border-[#ffde59] hover:scale-105 active:scale-95 group ring-4 ring-black/10"
        >
          <div className="w-12 h-12 rounded-2xl bg-[#ffde59] text-[#b80000] flex items-center justify-center font-black text-xl shadow-inner">
            <ShoppingBag size={24} />
          </div>

          <div className="flex flex-col items-start pr-2">
            <span className="text-xs font-bold text-[#ffde59] uppercase tracking-wider">
              {totalItems} Menu Dipilih
            </span>
            <span className="text-xl md:text-2xl font-black text-white tracking-tight">
              {formatPrice(totalPrice)}
            </span>
          </div>

          <div className="bg-[#ffde59] text-[#b80000] px-4 py-2.5 rounded-2xl text-sm font-black uppercase tracking-wider flex items-center gap-1 group-hover:bg-white transition-colors shadow-sm">
            <span>Lihat Pesanan</span>
            <ArrowRight size={16} />
          </div>
        </button>
      </motion.div>
    </AnimatePresence>
  );
}
