"use client";

import { useCartStore } from "@/store/useCartStore";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { formatPrice } from "@/lib/utils";
import { ArrowLeft, Trash2, ShoppingBag, Plus, Minus, Utensils, Coffee, Flame } from "lucide-react";

export default function CartPage() {
  const router = useRouter();
  const { items, removeItem, updateQuantity, getTotalPrice } = useCartStore();

  const total = getTotalPrice();

  if (items.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-[100dvh] bg-[#FFFDF0] p-6 text-center">
        <div className="w-28 h-28 bg-red-50 text-[#b80000] rounded-full flex items-center justify-center mb-6 shadow-inner border-2 border-[#ffde59]">
          <ShoppingBag size={56} />
        </div>
        <h2 className="text-3xl md:text-4xl font-black text-gray-900 mb-2">Keranjang Kamu Kosong</h2>
        <p className="text-gray-500 text-base md:text-lg mb-8 max-w-sm">Yuk pilih kebab dan minuman favoritmu sekarang!</p>
        <button
          onClick={() => router.push("/menu")}
          className="bg-[#b80000] hover:bg-[#940000] text-[#ffde59] px-8 py-4 rounded-2xl text-xl font-black transition-all shadow-xl hover:scale-105 active:scale-95 border-2 border-[#ffde59]"
        >
          Kembali ke Menu
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col md:flex-row h-[100dvh] max-h-[100dvh] bg-[#FFFDF0] overflow-hidden select-none">
      {/* Left: Cart Items List */}
      <div className="flex-1 flex flex-col min-h-0 overflow-hidden p-6 md:p-8 lg:p-10">
        {/* Top Header */}
        <div className="flex items-center justify-between mb-6 shrink-0">
          <div className="flex items-center gap-4 md:gap-5">
            <button
              onClick={() => router.push("/menu")}
              className="w-12 h-12 md:w-14 md:h-14 rounded-2xl bg-white shadow-sm border border-gray-200 flex items-center justify-center text-gray-700 hover:bg-gray-100 hover:scale-105 active:scale-95 transition-all shrink-0"
            >
              <ArrowLeft size={24} />
            </button>
            <div>
              <h1 className="text-3xl md:text-4xl font-black text-[#b80000] tracking-tight">Pesanan Saya</h1>
              <p className="text-gray-500 text-sm md:text-base font-medium">Periksa kembali item & varian pilihanmu</p>
            </div>
          </div>

          <div className="hidden sm:flex items-center gap-3 bg-white px-4 py-2 rounded-2xl border-2 border-[#ffde59] shadow-sm">
            <div className="w-10 h-10 p-0.5 rounded-xl border border-[#ffde59] bg-white flex items-center justify-center">
              <img src="/logo.png" alt="Logo" className="w-full h-full object-contain" />
            </div>
            <span className="font-black text-sm text-gray-900">
              TITIK<span className="text-[#b80000]">NGUNYAH</span>
            </span>
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
                className="bg-white rounded-3xl p-5 md:p-6 shadow-sm border-2 border-[#ffde59]/50 flex gap-4 md:gap-6 items-center"
              >
                <img
                  src={item.image}
                  alt={item.name}
                  className="w-20 h-20 md:w-24 md:h-24 rounded-2xl object-cover shrink-0 bg-amber-50 border border-amber-100 self-start mt-1"
                />
                <div className="flex-1 min-w-0">
                  <div className="flex items-baseline justify-between gap-2">
                    <h3 className="text-lg md:text-xl font-black text-gray-900 truncate">{item.name}</h3>
                    <p className="text-base md:text-lg font-black text-[#b80000] shrink-0">
                      {formatPrice(item.price * item.quantity)}
                    </p>
                  </div>

                  {/* Selected Options Badges */}
                  {item.options && (
                    <div className="flex flex-wrap gap-1.5 mt-2">
                      {item.options.kebab && (
                        <span className="inline-flex items-center gap-1 text-xs font-bold bg-orange-50 text-orange-700 px-2.5 py-1 rounded-lg border border-orange-100">
                          <Utensils size={12} /> {item.options.kebab}
                        </span>
                      )}
                      {item.options.drink && (
                        <span className="inline-flex items-center gap-1 text-xs font-bold bg-blue-50 text-blue-700 px-2.5 py-1 rounded-lg border border-blue-100">
                          <Coffee size={12} /> {item.options.drink}
                        </span>
                      )}
                      {item.options.spicy && (
                        <span className="inline-flex items-center gap-1 text-xs font-bold bg-red-50 text-[#b80000] px-2.5 py-1 rounded-lg border border-red-100">
                          <Flame size={12} /> {item.options.spicy}
                        </span>
                      )}
                      {item.options.mayo && (
                        <span className="inline-flex items-center gap-1 text-xs font-bold bg-amber-50 text-amber-800 px-2.5 py-1 rounded-lg border border-amber-200">
                          {item.options.mayo}
                        </span>
                      )}
                      {item.options.extra && (
                        <span className="inline-flex items-center gap-1 text-xs font-bold bg-purple-50 text-purple-700 px-2.5 py-1 rounded-lg border border-purple-100">
                          {item.options.extra}
                        </span>
                      )}
                    </div>
                  )}

                  {item.notes && (
                    <p className="text-gray-500 italic text-xs md:text-sm mt-2 line-clamp-1 bg-gray-50 px-3 py-1 rounded-lg border border-gray-100">
                      Catatan: {item.notes}
                    </p>
                  )}
                </div>

                {/* Qty Controls */}
                <div className="flex items-center gap-2 bg-gray-50 rounded-2xl p-1.5 border border-gray-200 shrink-0">
                  <button
                    onClick={() => updateQuantity(item.id, item.quantity - 1)}
                    className="w-8 h-8 rounded-xl bg-white shadow-sm flex items-center justify-center text-gray-700 hover:bg-gray-100 active:scale-90 transition-all font-bold"
                  >
                    <Minus size={16} />
                  </button>
                  <span className="font-black text-base w-6 text-center text-gray-900">{item.quantity}</span>
                  <button
                    onClick={() => updateQuantity(item.id, item.quantity + 1)}
                    className="w-8 h-8 rounded-xl bg-[#b80000] text-white shadow-sm flex items-center justify-center hover:bg-[#940000] active:scale-90 transition-all font-bold"
                  >
                    <Plus size={16} />
                  </button>
                </div>

                {/* Remove Button */}
                <button
                  onClick={() => removeItem(item.id)}
                  className="w-10 h-10 md:w-12 md:h-12 shrink-0 rounded-2xl bg-red-50 flex items-center justify-center text-[#b80000] hover:bg-red-100 hover:scale-105 active:scale-95 transition-all border border-red-100"
                >
                  <Trash2 size={20} />
                </button>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      </div>

      {/* Right / Bottom: Order Summary */}
      <div className="w-full md:w-[360px] lg:w-[400px] bg-white shadow-2xl z-10 flex flex-col justify-between shrink-0 border-t md:border-t-0 md:border-l-4 border-[#ffde59] max-h-[35vh] md:max-h-full">
        <div className="p-5 md:p-8 border-b border-gray-100 shrink-0 bg-gradient-to-r from-red-50/40 to-white">
          <h2 className="text-xl md:text-2xl font-black text-gray-900">Ringkasan Pembayaran</h2>
        </div>

        <div className="p-5 md:p-8 flex-1 flex flex-col justify-center gap-3 md:gap-4 overflow-y-auto">
          <div className="flex justify-between items-center text-gray-500 text-base md:text-lg font-medium">
            <span>Total Item</span>
            <span className="font-black text-gray-900">{items.reduce((acc, i) => acc + i.quantity, 0)} Porsi</span>
          </div>
          <div className="h-px bg-gray-100 my-1" />
          <div className="flex justify-between items-baseline">
            <span className="text-lg md:text-xl font-bold text-gray-900">Total Tagihan</span>
            <span className="text-3xl md:text-4xl font-black text-[#b80000]">{formatPrice(total)}</span>
          </div>
        </div>

        {/* Proceed Button */}
        <div className="p-4 md:p-6 lg:p-8 bg-amber-50/50 border-t border-amber-100 shrink-0">
          <button
            onClick={() => router.push("/payment")}
            className="w-full bg-[#b80000] hover:bg-[#940000] text-[#ffde59] py-4 md:py-5 rounded-2xl text-xl md:text-2xl font-black shadow-xl shadow-red-900/20 transition-all hover:scale-[1.02] active:scale-[0.98] border-2 border-[#ffde59]"
          >
            Lanjut ke Pembayaran →
          </button>
        </div>
      </div>
    </div>
  );
}
