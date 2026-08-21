"use client";

import { useCartStore } from "@/store/useCartStore";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { formatPrice } from "@/lib/utils";
import { ArrowLeft, Trash2, ShoppingBag, Plus, Minus } from "lucide-react";

export default function CartPage() {
  const router = useRouter();
  const { items, removeItem, updateQuantity, getTotalPrice } = useCartStore();

  const total = getTotalPrice();

  if (items.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-[100dvh] bg-background p-6 text-center">
        <div className="w-28 h-28 bg-red-50 text-[#E53935] rounded-full flex items-center justify-center mb-6 shadow-inner">
          <ShoppingBag size={56} />
        </div>
        <h2 className="text-3xl md:text-4xl font-bold text-gray-800 mb-4">Keranjang Kamu Kosong</h2>
        <p className="text-gray-500 text-lg mb-8 max-w-sm">Yuk pilih kebab dan cemilan favoritmu sekarang!</p>
        <button
          onClick={() => router.push("/menu")}
          className="bg-[#E53935] hover:bg-[#C62828] text-white px-8 py-4 rounded-full text-xl font-bold transition-all shadow-lg hover:scale-105 active:scale-95"
        >
          Kembali ke Menu
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col md:flex-row h-[100dvh] max-h-[100dvh] bg-background overflow-hidden select-none">
      {/* Left: Cart Items List */}
      <div className="flex-1 flex flex-col min-h-0 overflow-hidden p-6 md:p-8 lg:p-10">
        {/* Top Header */}
        <div className="flex items-center gap-4 md:gap-6 mb-6 shrink-0">
          <button
            onClick={() => router.push("/menu")}
            className="w-12 h-12 md:w-14 md:h-14 rounded-2xl bg-white shadow-sm border border-gray-200 flex items-center justify-center text-gray-700 hover:bg-gray-100 hover:scale-105 active:scale-95 transition-all shrink-0"
          >
            <ArrowLeft size={24} />
          </button>
          <div>
            <h1 className="text-3xl md:text-4xl font-black text-gray-900 tracking-tight">Pesanan Saya</h1>
            <p className="text-gray-500 text-sm md:text-base">Periksa kembali item yang kamu pilih</p>
          </div>
        </div>

        {/* Scrollable Items Container */}
        <div className="flex-1 overflow-y-auto touch-scroll hide-scrollbar space-y-4 pr-1">
          <AnimatePresence mode="popLayout">
            {items.map((item) => (
              <motion.div
                layout
                key={item.id}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, x: -50 }}
                transition={{ duration: 0.2 }}
                className="bg-white rounded-3xl p-4 md:p-5 shadow-sm border border-gray-100 flex gap-4 md:gap-6 items-center"
              >
                <img
                  src={item.image}
                  alt={item.name}
                  className="w-20 h-20 md:w-24 md:h-24 rounded-2xl object-cover shrink-0 bg-gray-100 border border-gray-100"
                />
                <div className="flex-1 min-w-0">
                  <h3 className="text-lg md:text-xl font-bold text-gray-900 truncate">{item.name}</h3>
                  <p className="text-base md:text-lg font-black text-[#E53935] mt-0.5">{formatPrice(item.price)}</p>
                  {item.notes && (
                    <p className="text-gray-500 italic text-xs md:text-sm mt-1 line-clamp-1">
                      Catatan: {item.notes}
                    </p>
                  )}
                </div>

                {/* Qty Controls */}
                <div className="flex items-center gap-2 md:gap-3 bg-gray-50 rounded-full p-1.5 border border-gray-200 shrink-0">
                  <button
                    onClick={() => updateQuantity(item.id, item.quantity - 1)}
                    className="w-9 h-9 md:w-10 md:h-10 rounded-full bg-white shadow-sm flex items-center justify-center text-gray-700 hover:bg-gray-100 active:scale-90 transition-all"
                  >
                    <Minus size={16} />
                  </button>
                  <span className="text-base md:text-lg font-bold w-6 text-center text-gray-900">{item.quantity}</span>
                  <button
                    onClick={() => updateQuantity(item.id, item.quantity + 1)}
                    className="w-9 h-9 md:w-10 md:h-10 rounded-full bg-[#E53935] shadow-sm flex items-center justify-center text-white hover:bg-[#C62828] active:scale-90 transition-all"
                  >
                    <Plus size={16} />
                  </button>
                </div>

                {/* Remove Button */}
                <button
                  onClick={() => removeItem(item.id)}
                  className="w-10 h-10 md:w-12 md:h-12 shrink-0 rounded-2xl bg-red-50 flex items-center justify-center text-red-500 hover:bg-red-100 hover:scale-105 active:scale-95 transition-all"
                >
                  <Trash2 size={20} />
                </button>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      </div>

      {/* Right / Bottom: Order Summary */}
      <div className="w-full md:w-[360px] lg:w-[400px] bg-white shadow-2xl z-10 flex flex-col justify-between shrink-0 border-t md:border-t-0 md:border-l border-gray-100 max-h-[35vh] md:max-h-full">
        <div className="p-5 md:p-8 border-b border-gray-100 shrink-0">
          <h2 className="text-xl md:text-2xl font-black text-gray-900">Ringkasan Pembayaran</h2>
        </div>

        <div className="p-5 md:p-8 flex-1 flex flex-col justify-center gap-3 md:gap-4 overflow-y-auto">
          <div className="flex justify-between items-center text-gray-500 text-base md:text-lg">
            <span>Total Item</span>
            <span className="font-bold text-gray-900">{items.reduce((acc, i) => acc + i.quantity, 0)} Porsi</span>
          </div>
          <div className="h-px bg-gray-100 my-1" />
          <div className="flex justify-between items-baseline">
            <span className="text-lg md:text-xl font-bold text-gray-900">Total Tagihan</span>
            <span className="text-3xl md:text-4xl font-black text-[#E53935]">{formatPrice(total)}</span>
          </div>
        </div>

        {/* Proceed Button */}
        <div className="p-4 md:p-6 lg:p-8 bg-gray-50/80 border-t border-gray-100 shrink-0">
          <button
            onClick={() => router.push("/payment")}
            className="w-full bg-[#E53935] hover:bg-[#C62828] text-white py-4 md:py-5 rounded-2xl text-xl md:text-2xl font-bold shadow-xl shadow-red-500/20 transition-all hover:scale-[1.02] active:scale-[0.98]"
          >
            Lanjut ke Pembayaran →
          </button>
        </div>
      </div>
    </div>
  );
}
