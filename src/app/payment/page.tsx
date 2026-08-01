"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useCartStore } from "@/store/useCartStore";
import { useOrderStore } from "@/store/useOrderStore";
import { motion, AnimatePresence } from "framer-motion";

export default function PaymentPage() {
  const router = useRouter();
  const { getTotalPrice, clearCart, items } = useCartStore();
  const { addOrder, orders } = useOrderStore();
  const [method, setMethod] = useState<"qris" | "cash" | null>(null);
  const [timer, setTimer] = useState(300);

  const total = getTotalPrice();

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", maximumFractionDigits: 0 }).format(price);
  };

  const handleSuccess = () => {
    const todayOrders = orders.filter(o => new Date(o.createdAt).toDateString() === new Date().toDateString());
    const queueNo = `A-${(todayOrders.length + 1).toString().padStart(3, '0')}`;
    
    const itemsSummary = items.map(item => `${item.quantity}x ${item.name}`).join(", ");
    
    addOrder({
      id: queueNo,
      customer: "Guest",
      items: itemsSummary,
      total: total,
      formattedTotal: formatPrice(total),
      payment: method === "qris" ? "QRIS" : "Tunai",
      status: method === "qris" ? "Dibayar" : "Menunggu",
      time: new Date().toLocaleTimeString("id-ID", { hour: '2-digit', minute: '2-digit' }),
      createdAt: Date.now()
    });

    clearCart();
    router.push(`/queue?id=${queueNo}`);
  };

  useEffect(() => {
    let interval: any;
    if (method === "qris" && timer > 0) {
      interval = setInterval(() => {
        setTimer((prev) => prev - 1);
      }, 1000);
    }
    
    if (method === "qris") {
      const timeout = setTimeout(() => {
        handleSuccess();
      }, 5000);
      return () => {
        clearInterval(interval);
        clearTimeout(timeout);
      };
    }
    
    return () => clearInterval(interval);
  }, [method, timer]);

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s.toString().padStart(2, "0")}`;
  };

  return (
    <div className="flex h-screen bg-background p-12">
      <div className="max-w-5xl w-full mx-auto flex flex-col">
        <div className="flex items-center gap-6 mb-12">
          <button
            onClick={() => router.push("/cart")}
            className="w-16 h-16 rounded-full bg-white shadow-sm flex items-center justify-center text-3xl font-bold text-gray-600 hover:bg-gray-50 transition-colors"
          >
            ←
          </button>
          <h1 className="text-5xl font-black text-gray-900 tracking-tight">Pembayaran</h1>
        </div>

        <div className="flex flex-1 gap-12">
          {/* Left: Methods */}
          <div className="flex-1 space-y-6">
            <h2 className="text-3xl font-bold text-gray-800 mb-8">Pilih Metode</h2>
            
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => {
                setMethod("qris");
                setTimer(300);
              }}
              className={`w-full p-8 rounded-[2rem] border-2 text-left flex items-center justify-between transition-all ${
                method === "qris" ? "border-[#E53935] bg-red-50 shadow-lg" : "border-gray-200 bg-white hover:border-gray-300"
              }`}
            >
              <div>
                <h3 className="text-3xl font-bold text-gray-900">QRIS</h3>
                <p className="text-gray-500 mt-2 text-xl">Bayar dengan e-wallet atau mobile banking</p>
              </div>
              <div className={`w-8 h-8 rounded-full border-4 ${method === "qris" ? "border-[#E53935] bg-[#E53935]" : "border-gray-300"}`} />
            </motion.button>

            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setMethod("cash")}
              className={`w-full p-8 rounded-[2rem] border-2 text-left flex items-center justify-between transition-all ${
                method === "cash" ? "border-[#E53935] bg-red-50 shadow-lg" : "border-gray-200 bg-white hover:border-gray-300"
              }`}
            >
              <div>
                <h3 className="text-3xl font-bold text-gray-900">Tunai di Kasir</h3>
                <p className="text-gray-500 mt-2 text-xl">Bayar langsung ke kasir</p>
              </div>
              <div className={`w-8 h-8 rounded-full border-4 ${method === "cash" ? "border-[#E53935] bg-[#E53935]" : "border-gray-300"}`} />
            </motion.button>
          </div>

          {/* Right: Payment Detail / QR */}
          <div className="w-[500px] bg-white rounded-[2rem] shadow-xl p-10 flex flex-col items-center justify-center text-center">
            <h3 className="text-2xl font-bold text-gray-600 mb-4">Total Pembayaran</h3>
            <p className="text-5xl font-black text-[#E53935] mb-12">{formatPrice(total)}</p>

            <AnimatePresence mode="wait">
              {method === "qris" && (
                <motion.div
                  key="qris"
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  className="flex flex-col items-center"
                >
                  <div className="w-64 h-64 bg-gray-100 rounded-3xl mb-8 flex items-center justify-center border-4 border-gray-200">
                    <img src="https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=TitikNgunyahOrder" alt="QRIS" className="rounded-2xl" />
                  </div>
                  <p className="text-2xl font-bold text-gray-900 mb-2">Menunggu Pembayaran...</p>
                  <p className="text-xl text-gray-500 mb-6">Scan kode QR di atas dengan aplikasi kamu</p>
                  <div className="bg-red-50 text-[#E53935] px-6 py-3 rounded-full text-xl font-bold">
                    Sisa waktu: {formatTime(timer)}
                  </div>
                </motion.div>
              )}

              {method === "cash" && (
                <motion.div
                  key="cash"
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  className="flex flex-col items-center"
                >
                  <div className="w-32 h-32 bg-gray-100 rounded-full mb-8 flex items-center justify-center">
                    <span className="text-6xl text-gray-400">Rp</span>
                  </div>
                  <p className="text-2xl font-bold text-gray-900 mb-4">Siapkan uang tunai</p>
                  <p className="text-xl text-gray-500 mb-8">Bayar ke kasir dengan nomor antrean kamu nanti.</p>
                  <button
                    onClick={handleSuccess}
                    className="w-full bg-[#E53935] text-white py-6 rounded-full text-2xl font-bold hover:bg-[#C62828] shadow-xl"
                  >
                    Konfirmasi Pesanan
                  </button>
                </motion.div>
              )}

              {!method && (
                <motion.div
                  key="empty"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="text-gray-400 text-xl"
                >
                  Silakan pilih metode pembayaran di sebelah kiri.
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </div>
  );
}
