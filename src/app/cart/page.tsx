"use client";

import { useCartStore } from "@/store/useCartStore";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";

export default function CartPage() {
  const router = useRouter();
  const { items, removeItem, updateQuantity, getTotalPrice } = useCartStore();

  const total = getTotalPrice();

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", maximumFractionDigits: 0 }).format(price);
  };

  if (items.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-screen bg-background">
        <h2 className="text-4xl font-bold text-gray-800 mb-8">Keranjang kamu kosong</h2>
        <button
          onClick={() => router.push("/menu")}
          className="bg-[#E53935] text-white px-10 py-5 rounded-full text-2xl font-bold hover:bg-[#C62828] transition-colors"
        >
          Kembali ke Menu
        </button>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-background">
      {/* Left: Cart Items */}
      <div className="flex-1 p-12 overflow-y-auto">
        <div className="flex items-center gap-6 mb-12">
          <button
            onClick={() => router.push("/menu")}
            className="w-16 h-16 rounded-full bg-white shadow-sm flex items-center justify-center text-3xl font-bold text-gray-600 hover:bg-gray-50 transition-colors"
          >
            ←
          </button>
          <h1 className="text-5xl font-black text-gray-900 tracking-tight">Pesanan Saya</h1>
        </div>

        <div className="space-y-6">
          {items.map((item) => (
            <motion.div
              layout
              key={item.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, x: -100 }}
              className="bg-white rounded-[2rem] p-6 shadow-sm border border-gray-100 flex gap-8 items-center"
            >
              <img src={item.image} alt={item.name} className="w-32 h-32 rounded-2xl object-cover shrink-0 bg-gray-100" />
              <div className="flex-1">
                <h3 className="text-2xl font-bold text-gray-900 mb-2">{item.name}</h3>
                <p className="text-xl font-bold text-[#E53935] mb-2">{formatPrice(item.price)}</p>
                {item.notes && <p className="text-gray-500 italic text-sm">Catatan: {item.notes}</p>}
              </div>
              
              <div className="flex items-center gap-4 bg-gray-50 rounded-full p-2 border border-gray-200">
                <button
                  onClick={() => updateQuantity(item.id, item.quantity - 1)}
                  className="w-12 h-12 rounded-full bg-white shadow-sm flex items-center justify-center text-2xl font-bold text-gray-600 hover:bg-gray-100"
                >
                  -
                </button>
                <span className="text-xl font-bold w-6 text-center">{item.quantity}</span>
                <button
                  onClick={() => updateQuantity(item.id, item.quantity + 1)}
                  className="w-12 h-12 rounded-full bg-[#E53935] shadow-sm flex items-center justify-center text-2xl font-bold text-white hover:bg-[#C62828]"
                >
                  +
                </button>
              </div>

              <button
                onClick={() => removeItem(item.id)}
                className="w-16 h-16 shrink-0 rounded-full bg-red-50 flex items-center justify-center text-xl font-bold text-red-500 hover:bg-red-100 transition-colors ml-4"
              >
                X
              </button>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Right: Order Summary */}
      <div className="w-[450px] bg-white shadow-2xl z-10 flex flex-col">
        <div className="p-10 border-b border-gray-100">
          <h2 className="text-3xl font-black text-gray-900">Ringkasan</h2>
        </div>
        
        <div className="p-10 flex-1 flex flex-col gap-6 text-xl text-gray-600">
          <div className="flex justify-between items-end">
            <span className="text-2xl font-bold text-gray-900">Total</span>
            <span className="text-4xl font-black text-[#E53935]">{formatPrice(total)}</span>
          </div>
        </div>

        <div className="p-10 bg-gray-50 border-t border-gray-100">
          <button
            onClick={() => router.push("/payment")}
            className="w-full bg-[#E53935] hover:bg-[#C62828] text-white py-6 rounded-full text-2xl font-bold shadow-xl transition-transform active:scale-95"
          >
            Lanjut ke Pembayaran
          </button>
        </div>
      </div>
    </div>
  );
}
