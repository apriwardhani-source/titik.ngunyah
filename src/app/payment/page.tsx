"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useCartStore } from "@/store/useCartStore";
import { useOrderStore } from "@/store/useOrderStore";
import { motion, AnimatePresence } from "framer-motion";
import { formatPrice, getApiUrl } from "@/lib/utils";
import { QrCode, Banknote, ArrowLeft, CheckCircle, ShieldCheck, AlertCircle } from "lucide-react";

export default function PaymentPage() {
  const router = useRouter();
  const { getTotalPrice, clearCart, items } = useCartStore();
  const { fetchOrders } = useOrderStore();
  const [method, setMethod] = useState<"qris" | "cash" | null>("qris");
  const [isProcessing, setIsProcessing] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const total = getTotalPrice();

  const handleProcessOrder = async (selectedMethod: "qris" | "cash") => {
    if (items.length === 0) {
      router.push("/menu");
      return;
    }

    setIsProcessing(true);
    setErrorMsg(null);

    try {
      const payload = {
        items: items.map((item) => ({
          menu_id: item.id,
          qty: item.quantity,
          price: item.price,
          notes: item.notes || "",
        })),
        customer_name: "Guest Kiosk",
        payment_method: selectedMethod,
      };

      const res = await fetch(`${getApiUrl()}/checkout`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (data.status === "success" && data.data) {
        clearCart();
        fetchOrders();
        router.push(`/queue?id=${data.data.queue_number}`);
      } else {
        setErrorMsg(data.message || "Gagal memproses pesanan. Silakan coba lagi.");
      }
    } catch (error: any) {
      console.error("Checkout error:", error);
      setErrorMsg("Koneksi gagal. Pastikan database TiDB terhubung.");
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="flex h-[100dvh] max-h-[100dvh] bg-gray-50 p-4 md:p-6 lg:p-8 overflow-hidden select-none">
      <div className="max-w-6xl w-full mx-auto flex flex-col h-full min-h-0">
        {/* Header */}
        <div className="flex items-center gap-4 md:gap-6 mb-4 md:mb-6 shrink-0">
          <button
            onClick={() => router.push("/cart")}
            className="w-12 h-12 md:w-14 md:h-14 rounded-2xl bg-white shadow-sm border border-gray-200 flex items-center justify-center text-gray-700 hover:bg-gray-100 hover:scale-105 active:scale-95 transition-all shrink-0"
          >
            <ArrowLeft size={24} />
          </button>
          <div>
            <h1 className="text-2xl md:text-4xl font-black text-gray-900 tracking-tight">Metode Pembayaran</h1>
            <p className="text-gray-500 text-sm md:text-base">Pilih cara bayar yang paling nyaman untukmu</p>
          </div>
        </div>

        {/* Content Area */}
        <div className="flex flex-col md:flex-row flex-1 gap-6 md:gap-8 min-h-0 pb-2 overflow-y-auto md:overflow-hidden touch-scroll">
          {/* Left: Method Selection */}
          <div className="w-full md:w-1/2 space-y-4 md:space-y-5 flex flex-col justify-start shrink-0">
            <h2 className="text-xl md:text-2xl font-bold text-gray-800">Pilihan Bayar</h2>


            {/* QRIS Option */}
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => {
                setMethod("qris");
                setErrorMsg(null);
              }}
              className={`w-full p-6 rounded-3xl border-2 text-left flex items-center justify-between transition-all ${
                method === "qris"
                  ? "border-[#E53935] bg-red-50/60 shadow-lg shadow-red-500/10 ring-4 ring-red-100"
                  : "border-gray-200 bg-white hover:border-gray-300 shadow-sm"
              }`}
            >
              <div className="flex items-center gap-5">
                <div className={`w-16 h-16 rounded-2xl flex items-center justify-center ${
                  method === "qris" ? "bg-[#E53935] text-white" : "bg-gray-100 text-gray-700"
                }`}>
                  <QrCode size={36} />
                </div>
                <div>
                  <h3 className="text-2xl font-bold text-gray-900">QRIS</h3>
                  <p className="text-gray-500 text-base mt-1">BCA, GoPay, OVO, DANA, ShopeePay, Mandiri, dll</p>
                </div>
              </div>
              <div className={`w-7 h-7 rounded-full border-4 flex items-center justify-center ${
                method === "qris" ? "border-[#E53935] bg-[#E53935]" : "border-gray-300"
              }`}>
                {method === "qris" && <div className="w-2.5 h-2.5 bg-white rounded-full" />}
              </div>
            </motion.button>

            {/* Cash Option */}
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => {
                setMethod("cash");
                setErrorMsg(null);
              }}
              className={`w-full p-6 rounded-3xl border-2 text-left flex items-center justify-between transition-all ${
                method === "cash"
                  ? "border-[#E53935] bg-red-50/60 shadow-lg shadow-red-500/10 ring-4 ring-red-100"
                  : "border-gray-200 bg-white hover:border-gray-300 shadow-sm"
              }`}
            >
              <div className="flex items-center gap-5">
                <div className={`w-16 h-16 rounded-2xl flex items-center justify-center ${
                  method === "cash" ? "bg-[#E53935] text-white" : "bg-gray-100 text-gray-700"
                }`}>
                  <Banknote size={36} />
                </div>
                <div>
                  <h3 className="text-2xl font-bold text-gray-900">Tunai di Kasir</h3>
                  <p className="text-gray-500 text-base mt-1">Bayar langsung dengan uang tunai di kasir</p>
                </div>
              </div>
              <div className={`w-7 h-7 rounded-full border-4 flex items-center justify-center ${
                method === "cash" ? "border-[#E53935] bg-[#E53935]" : "border-gray-300"
              }`}>
                {method === "cash" && <div className="w-2.5 h-2.5 bg-white rounded-full" />}
              </div>
            </motion.button>

            {/* Security note */}
            <div className="bg-white p-5 rounded-2xl border border-gray-200 flex items-center gap-4 text-gray-600 shadow-sm mt-auto">
              <ShieldCheck size={32} className="text-green-600 shrink-0" />
              <p className="text-sm">
                Transaksi aman & langsung terhubung dengan antrean dapur <strong>Titik Ngunyah</strong>.
              </p>
            </div>
          </div>

          {/* Right: Payment Detail Card */}
          <div className="w-1/2 bg-white rounded-[2.5rem] shadow-xl border border-gray-100 p-8 flex flex-col items-center justify-between overflow-y-auto">
            <div className="w-full text-center">
              <span className="text-gray-500 font-semibold text-lg uppercase tracking-wider">Total yang Harus Dibayar</span>
              <p className="text-5xl font-black text-[#E53935] mt-2 tracking-tight">{formatPrice(total)}</p>
            </div>

            {errorMsg && (
              <div className="w-full bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-2xl flex items-center gap-3 my-4">
                <AlertCircle size={24} className="shrink-0" />
                <p className="text-sm font-medium">{errorMsg}</p>
              </div>
            )}

            <AnimatePresence mode="wait">
              {method === "qris" && (
                <motion.div
                  key="qris-card"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="flex flex-col items-center w-full my-4"
                >
                  {/* QRIS Card UI */}
                  <div className="bg-gradient-to-b from-gray-900 to-gray-800 text-white rounded-3xl p-6 shadow-2xl flex flex-col items-center max-w-sm w-full border-4 border-gray-900">
                    <div className="flex items-center justify-between w-full mb-3 px-2 border-b border-gray-700 pb-2">
                      <span className="font-black text-xl tracking-widest text-[#E53935]">QRIS</span>
                      <span className="text-xs text-gray-300 font-mono">NMID: ID1020039201948</span>
                    </div>

                    <div className="bg-white p-3 rounded-2xl shadow-inner my-1">
                      {/* Realistic SVG QR Pattern */}
                      <svg className="w-48 h-48" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <rect width="100" height="100" fill="white" />
                        {/* Top-left marker */}
                        <rect x="10" y="10" width="24" height="24" rx="4" fill="#111827" />
                        <rect x="14" y="14" width="16" height="16" rx="2" fill="white" />
                        <rect x="18" y="18" width="8" height="8" rx="1" fill="#E53935" />
                        {/* Top-right marker */}
                        <rect x="66" y="10" width="24" height="24" rx="4" fill="#111827" />
                        <rect x="70" y="14" width="16" height="16" rx="2" fill="white" />
                        <rect x="74" y="18" width="8" height="8" rx="1" fill="#E53935" />
                        {/* Bottom-left marker */}
                        <rect x="10" y="66" width="24" height="24" rx="4" fill="#111827" />
                        <rect x="14" y="70" width="16" height="16" rx="2" fill="white" />
                        <rect x="18" y="74" width="8" height="8" rx="1" fill="#E53935" />
                        {/* QR Data Dots */}
                        <rect x="42" y="12" width="6" height="6" fill="#111827" />
                        <rect x="52" y="12" width="6" height="6" fill="#111827" />
                        <rect x="42" y="24" width="12" height="6" fill="#111827" />
                        <rect x="46" y="36" width="8" height="8" rx="2" fill="#E53935" />
                        <rect x="12" y="42" width="6" height="6" fill="#111827" />
                        <rect x="24" y="42" width="6" height="12" fill="#111827" />
                        <rect x="66" y="42" width="10" height="6" fill="#111827" />
                        <rect x="80" y="42" width="8" height="8" fill="#111827" />
                        <rect x="38" y="52" width="8" height="8" fill="#111827" />
                        <rect x="54" y="52" width="8" height="6" fill="#111827" />
                        <rect x="70" y="54" width="8" height="8" fill="#111827" />
                        <rect x="82" y="58" width="6" height="12" fill="#111827" />
                        <rect x="42" y="68" width="6" height="8" fill="#111827" />
                        <rect x="52" y="74" width="12" height="6" fill="#111827" />
                        <rect x="42" y="82" width="10" height="6" fill="#111827" />
                        <rect x="68" y="76" width="18" height="6" fill="#111827" />
                        <rect x="74" y="86" width="12" height="6" fill="#111827" />
                      </svg>
                    </div>

                    <p className="font-bold text-base mt-2">TITIK NGUNYAH</p>
                    <p className="text-xs text-gray-400">Scan & masukkan nominal manual</p>
                  </div>

                  {/* Step Instructions */}
                  <div className="w-full bg-amber-50 border border-amber-200 rounded-2xl p-3.5 mt-3 text-amber-900 text-sm space-y-1">
                    <p className="font-bold flex items-center gap-1.5 text-amber-800">
                      <span>💡</span> Petunjuk Pembayaran:
                    </p>
                    <p>1. Buka m-banking / e-wallet kamu & scan kode QR di atas.</p>
                    <p>2. Masukkan nominal persis: <strong>{formatPrice(total)}</strong>.</p>
                    <p>3. Jika sudah bayar, tekan tombol konfirmasi di bawah.</p>
                  </div>
                </motion.div>
              )}

              {method === "cash" && (
                <motion.div
                  key="cash-card"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="flex flex-col items-center w-full my-8 text-center"
                >
                  <div className="w-28 h-28 bg-red-100 rounded-full flex items-center justify-center text-5xl text-[#E53935] mb-6 shadow-inner">
                    💵
                  </div>
                  <h4 className="text-2xl font-bold text-gray-900 mb-2">Siapkan Uang Tunai</h4>
                  <p className="text-gray-500 text-lg max-w-md">
                    Pesanan akan langsung dikirim ke dapur. Silakan bayar ke kasir dengan menyebutkan <strong>Nomor Antrean</strong> kamu.
                  </p>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Action Button */}
            <div className="w-full mt-auto pt-2">
              <button
                onClick={() => method && handleProcessOrder(method)}
                disabled={isProcessing || !method}
                className="w-full bg-[#E53935] hover:bg-[#C62828] text-white py-5 rounded-2xl text-2xl font-bold shadow-xl shadow-red-500/20 hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3"
              >
                {isProcessing ? (
                  <span className="flex items-center gap-3">
                    <svg className="animate-spin h-7 w-7 text-white" viewBox="0 0 24 24" fill="none">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"></path>
                    </svg>
                    Memproses Pesanan...
                  </span>
                ) : method === "qris" ? (
                  <>
                    <CheckCircle size={28} />
                    <span>Saya Sudah Bayar (Konfirmasi)</span>
                  </>
                ) : (
                  <>
                    <CheckCircle size={28} />
                    <span>Konfirmasi Pesanan Tunai</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
