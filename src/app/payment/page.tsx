"use client";

import { useState } from "react";
import { useCartStore } from "@/store/useCartStore";
import { useRouter } from "next/navigation";
import { formatPrice } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";
import { 
  ArrowLeft, 
  QrCode, 
  Banknote, 
  CheckCircle2, 
  AlertCircle, 
  ShieldCheck,
  Sparkles,
  Info,
  ExternalLink
} from "lucide-react";

export default function PaymentPage() {
  const router = useRouter();
  const { items, getTotalPrice, clearCart } = useCartStore();
  const total = getTotalPrice();

  const [method, setMethod] = useState<"qris" | "cash">("qris");
  const [isProcessing, setIsProcessing] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // If cart is empty, redirect to menu
  if (items.length === 0) {
    if (typeof window !== "undefined") {
      router.replace("/menu");
    }
    return null;
  }

  const handleProcessOrder = async (selectedMethod: "qris" | "cash") => {
    setIsProcessing(true);
    setErrorMsg(null);

    try {
      const payload = {
        items: items.map((item) => {
          const optionParts: string[] = [];
          if (item.options?.kebab) optionParts.push(`Kebab: ${item.options.kebab}`);
          if (item.options?.drink) optionParts.push(`Minum: ${item.options.drink}`);
          if (item.options?.spicy) optionParts.push(`Rasa: ${item.options.spicy}`);
          if (item.options?.mayo) optionParts.push(`Mayo: ${item.options.mayo}`);
          if (item.options?.extra) optionParts.push(`Porsi: ${item.options.extra}`);
          if (item.notes) optionParts.push(`Note: ${item.notes}`);

          return {
            menu_id: item.productId || Number(String(item.id).split("-")[0]) || item.id,
            qty: item.quantity,
            price: item.price,
            notes: optionParts.join(" | "),
          };
        }),
        customer_name: "Pelanggan Kiosk",
        payment_method: selectedMethod,
      };

      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (!res.ok || data.status === "error") {
        throw new Error(data.message || "Gagal memproses pesanan");
      }

      // Clear local cart
      clearCart();

      // Redirect to queue page with queue ID
      const queueNumber = data.queue_number || data.data?.queue_number || "A-001";
      router.push(`/queue?id=${queueNumber}`);
    } catch (err: any) {
      console.error("Checkout error:", err);
      setErrorMsg(err.message || "Terjadi kesalahan saat memproses pesanan. Silakan coba lagi.");
      setIsProcessing(false);
    }
  };

  return (
    <div className="flex h-[100dvh] max-h-[100dvh] bg-gradient-to-br from-[#FFFDF0] via-[#FFFBEB] to-[#FEF3C7] p-4 md:p-6 lg:p-8 overflow-hidden select-none font-sans">
      <div className="max-w-6xl w-full mx-auto flex flex-col h-full min-h-0">
        {/* Header */}
        <div className="flex items-center justify-between mb-4 md:mb-6 shrink-0">
          <div className="flex items-center gap-4 md:gap-5">
            <button
              onClick={() => router.push("/cart")}
              className="w-12 h-12 md:w-14 md:h-14 rounded-2xl bg-white shadow-sm border-2 border-amber-200 flex items-center justify-center text-gray-700 hover:bg-amber-50 hover:scale-105 active:scale-95 transition-all shrink-0"
            >
              <ArrowLeft size={24} />
            </button>
            <div>
              <h1 className="text-2xl md:text-4xl font-black text-[#b80000] tracking-tight">
                Metode Pembayaran
              </h1>
              <p className="text-gray-600 text-xs md:text-sm font-medium">
                Pilih cara bayar dan selesaikan pesananmu
              </p>
            </div>
          </div>

          <div className="hidden sm:flex items-center gap-3 bg-white px-4 py-2 rounded-2xl border-2 border-[#ffde59] shadow-sm">
            <div className="w-10 h-10 p-1 rounded-xl border border-[#ffde59] bg-white flex items-center justify-center">
              <img src="/logo.png" alt="Logo" className="w-full h-full object-contain" />
            </div>
            <span className="font-black text-sm text-gray-900">
              TITIK<span className="text-[#b80000]">NGUNYAH</span>
            </span>
          </div>
        </div>

        {/* Content Area */}
        <div className="flex flex-col md:flex-row flex-1 gap-6 md:gap-8 min-h-0 pb-2 overflow-y-auto md:overflow-hidden touch-scroll">
          {/* Left: Method Selection */}
          <div className="w-full md:w-5/12 space-y-4 flex flex-col justify-start shrink-0">
            <div className="flex items-center justify-between">
              <h2 className="text-lg md:text-xl font-black text-gray-900 uppercase tracking-wider">
                Pilih Cara Bayar
              </h2>
            </div>

            {/* QRIS Option */}
            <motion.button
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.99 }}
              onClick={() => {
                setMethod("qris");
                setErrorMsg(null);
              }}
              className={`w-full p-5 rounded-3xl border-2 text-left flex items-center justify-between transition-all ${
                method === "qris"
                  ? "border-[#b80000] bg-red-50/90 shadow-lg ring-2 ring-[#ffde59]"
                  : "border-amber-200/80 bg-white hover:border-amber-300 shadow-sm"
              }`}
            >
              <div className="flex items-center gap-4">
                <div className={`w-14 h-14 rounded-2xl flex items-center justify-center shrink-0 ${
                  method === "qris" ? "bg-[#b80000] text-[#ffde59]" : "bg-amber-100 text-amber-900"
                }`}>
                  <QrCode size={30} />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-xl font-black text-gray-900">QRIS Statis</h3>
                    <span className="bg-[#ffde59] text-[#b80000] text-[10px] font-black px-2 py-0.5 rounded-full uppercase">
                      Praktis
                    </span>
                  </div>
                  <p className="text-gray-500 text-xs mt-0.5">BCA, GoPay, OVO, DANA, ShopeePay, Mandiri, BRI, dll</p>
                </div>
              </div>
              <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center shrink-0 ${
                method === "qris" ? "border-[#b80000] bg-[#b80000]" : "border-gray-300"
              }`}>
                {method === "qris" && <div className="w-2 h-2 bg-[#ffde59] rounded-full" />}
              </div>
            </motion.button>

            {/* Cash Option */}
            <motion.button
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.99 }}
              onClick={() => {
                setMethod("cash");
                setErrorMsg(null);
              }}
              className={`w-full p-5 rounded-3xl border-2 text-left flex items-center justify-between transition-all ${
                method === "cash"
                  ? "border-[#b80000] bg-red-50/90 shadow-lg ring-2 ring-[#ffde59]"
                  : "border-amber-200/80 bg-white hover:border-amber-300 shadow-sm"
              }`}
            >
              <div className="flex items-center gap-4">
                <div className={`w-14 h-14 rounded-2xl flex items-center justify-center shrink-0 ${
                  method === "cash" ? "bg-[#b80000] text-[#ffde59]" : "bg-amber-100 text-amber-900"
                }`}>
                  <Banknote size={30} />
                </div>
                <div>
                  <h3 className="text-xl font-black text-gray-900">Tunai di Kasir</h3>
                  <p className="text-gray-500 text-xs mt-0.5">Bayar langsung dengan uang tunai ke kasir stand</p>
                </div>
              </div>
              <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center shrink-0 ${
                method === "cash" ? "border-[#b80000] bg-[#b80000]" : "border-gray-300"
              }`}>
                {method === "cash" && <div className="w-2 h-2 bg-[#ffde59] rounded-full" />}
              </div>
            </motion.button>

            {/* Total Payment Summary Box */}
            <div className="bg-white p-5 rounded-3xl border-2 border-[#ffde59] shadow-md space-y-2 mt-2">
              <span className="text-xs font-bold text-gray-500 uppercase tracking-wider block">
                Total Pembayaran
              </span>
              <div className="flex items-baseline justify-between">
                <span className="text-sm font-bold text-gray-600">
                  {items.reduce((acc, i) => acc + i.quantity, 0)} Menu
                </span>
                <span className="text-3xl font-black text-[#b80000] tracking-tight">
                  {formatPrice(total)}
                </span>
              </div>
            </div>

            {/* Security note */}
            <div className="bg-amber-50/70 p-4 rounded-2xl border border-amber-200 flex items-center gap-3 text-gray-600 mt-auto">
              <ShieldCheck size={28} className="text-emerald-600 shrink-0" />
              <p className="text-xs leading-relaxed">
                Pesanan otomatis dicatat dan langsung dikirim ke layar antrean dapur <strong>Titik Ngunyah</strong>.
              </p>
            </div>
          </div>

          {/* Right: Payment Detail / Large Static QRIS Card */}
          <div className="w-full md:w-7/12 bg-white rounded-[2.5rem] shadow-xl border-2 border-[#ffde59] p-6 md:p-8 flex flex-col items-center justify-between overflow-y-auto touch-scroll hide-scrollbar">
            {errorMsg && (
              <div className="w-full bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-2xl flex items-center gap-3 mb-4 shrink-0">
                <AlertCircle size={24} className="shrink-0" />
                <p className="text-xs md:text-sm font-bold">{errorMsg}</p>
              </div>
            )}

            <AnimatePresence mode="wait">
              {method === "qris" && (
                <motion.div
                  key="qris-card"
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  className="flex flex-col items-center w-full"
                >
                  {/* Large Static QRIS Card Header */}
                  <div className="text-center mb-3">
                    <p className="text-xs font-black uppercase tracking-widest text-[#b80000]">
                      Scan QRIS TITIK.NGUNYAH
                    </p>
                    <div className="inline-flex items-center gap-2 bg-[#b80000] text-[#ffde59] px-4 py-1 rounded-full font-black text-base md:text-lg mt-1 shadow-sm">
                      <span>Nominal: {formatPrice(total)}</span>
                    </div>
                  </div>

                  {/* LARGE STATIC QRIS IMAGE CONTAINER */}
                  <div className="bg-white p-2.5 rounded-3xl shadow-2xl border-4 border-[#b80000] max-w-[320px] sm:max-w-[360px] w-full flex flex-col items-center">
                    <div className="relative w-full aspect-[3/4] rounded-2xl overflow-hidden bg-white">
                      <img
                        src="/qris-statis.jpg"
                        alt="QRIS Statis Titik Ngunyah"
                        className="w-full h-full object-contain"
                      />
                    </div>
                  </div>

                  {/* Step Instructions */}
                  <div className="w-full bg-amber-50 border border-amber-200 rounded-2xl p-3.5 mt-4 text-amber-950 text-xs space-y-1 max-w-md">
                    <p className="font-black flex items-center gap-1.5 text-[#b80000]">
                      <Info size={15} /> Langkah Pembayaran:
                    </p>
                    <p>1. Buka aplikasi m-Banking atau E-Wallet apa saja.</p>
                    <p>2. Arahkan kamera & scan kode QRIS statis di atas.</p>
                    <p>3. Masukkan nominal persis <strong>{formatPrice(total)}</strong> lalu konfirmasi transfer.</p>
                    <p>4. Tekan tombol <strong>Saya Sudah Bayar</strong> di bawah.</p>
                  </div>
                </motion.div>
              )}

              {method === "cash" && (
                <motion.div
                  key="cash-card"
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  className="flex flex-col items-center justify-center w-full my-auto text-center py-8"
                >
                  <div className="w-28 h-28 bg-red-100 rounded-full flex items-center justify-center text-5xl text-[#b80000] mb-6 shadow-inner border-2 border-[#ffde59]">
                    💵
                  </div>
                  <h4 className="text-2xl md:text-3xl font-black text-gray-900 mb-2">
                    Pembayaran Tunai di Kasir
                  </h4>
                  <div className="bg-[#b80000] text-[#ffde59] px-6 py-2 rounded-2xl text-2xl font-black my-3 shadow-md">
                    Total: {formatPrice(total)}
                  </div>
                  <p className="text-gray-600 text-sm md:text-base max-w-md leading-relaxed mt-2 font-medium">
                    Pesananmu akan langsung dikirim ke antrean dapur. Silakan menuju kasir untuk melakukan pembayaran dengan menyebutkan <strong>Nomor Antrean</strong> yang akan muncul.
                  </p>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Action Button */}
            <div className="w-full mt-6 pt-2 shrink-0">
              <button
                onClick={() => method && handleProcessOrder(method)}
                disabled={isProcessing || !method}
                className="w-full bg-[#b80000] hover:bg-[#940000] text-[#ffde59] py-4 sm:py-5 rounded-2xl text-lg sm:text-2xl font-black shadow-xl shadow-red-900/20 hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3 border-2 border-[#ffde59]"
              >
                {isProcessing ? (
                  <span className="flex items-center gap-3 text-white">
                    <svg className="animate-spin h-7 w-7 text-white" viewBox="0 0 24 24" fill="none">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"></path>
                    </svg>
                    Memproses Antrean...
                  </span>
                ) : method === "qris" ? (
                  <>
                    <CheckCircle2 size={26} />
                    <span>Saya Sudah Bayar (Dapatkan Antrean)</span>
                  </>
                ) : (
                  <>
                    <CheckCircle2 size={26} />
                    <span>Konfirmasi & Dapatkan Antrean</span>
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
