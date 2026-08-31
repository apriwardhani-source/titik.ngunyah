"use client";

import { useState, useEffect } from "react";
import { useCartStore } from "@/store/useCartStore";
import { useRouter } from "next/navigation";
import { formatPrice } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";
import SpinWheelModal from "@/components/SpinWheelModal";
import { 
  ArrowLeft, 
  QrCode, 
  Banknote, 
  CheckCircle2, 
  AlertCircle, 
  ShieldCheck,
  Clock,
  Utensils,
  Sparkles,
  Gift,
  User
} from "lucide-react";

export default function PaymentPage() {
  const router = useRouter();
  const { items, hasSpin, getTotalPrice, clearCart } = useCartStore();
  const total = getTotalPrice();

  const [method, setMethod] = useState<"qris" | "cash">("qris");
  const [customerName, setCustomerName] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Lucky Spin Modal State
  const [isSpinOpen, setIsSpinOpen] = useState(false);
  const [pendingOrderInfo, setPendingOrderInfo] = useState<{
    id: number;
    order_number: string;
    queue_number: string;
    total: number;
    payment_method: string;
    spin_reward?: string | null;
  } | null>(null);

  // Success Order Popup State
  const [successOrder, setSuccessOrder] = useState<{
    id?: number;
    order_number: string;
    queue_number: string;
    total: number;
    payment_method: string;
    spin_reward?: string | null;
  } | null>(null);
  const [countdown, setCountdown] = useState<number>(15);

  // Countdown timer when success popup is open
  useEffect(() => {
    if (!successOrder) return;

    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          router.push("/");
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [successOrder, router]);

  // If cart is empty and not in success/spin popup, redirect to menu
  if (items.length === 0 && !successOrder && !isSpinOpen) {
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
        customer_name: customerName.trim() || "Pelanggan Kiosk",
        customer_photo: null,
        payment_method: selectedMethod,
        has_spin: hasSpin,
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

      const orderData = {
        id: data.data?.id,
        order_number: data.data?.order_number || data.order_number || "ORD-001",
        queue_number: data.data?.queue_number || data.queue_number || "A-001",
        total: total,
        payment_method: selectedMethod,
      };

      const hadSpin = hasSpin;

      // Clear local cart
      clearCart();
      setIsProcessing(false);

      if (hadSpin && orderData.id) {
        // Show Lucky Spin Wheel first!
        setPendingOrderInfo(orderData);
        setIsSpinOpen(true);
      } else {
        // Show Queue Number directly!
        setSuccessOrder(orderData);
        setCountdown(15);
      }
    } catch (err: any) {
      console.error("Checkout error:", err);
      setErrorMsg(err.message || "Terjadi kesalahan saat memproses pesanan. Silakan coba lagi.");
      setIsProcessing(false);
    }
  };

  // Called when user finishes spinning the wheel
  const handleSpinFinish = async (rewardBadgeText: string) => {
    if (!pendingOrderInfo) return;

    try {
      // Record spin reward in database
      await fetch(`/api/orders/${pendingOrderInfo.id}/spin`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ spin_reward: rewardBadgeText }),
      });
    } catch (e) {
      console.error("Failed to persist spin reward:", e);
    }

    setIsSpinOpen(false);
    setSuccessOrder({
      ...pendingOrderInfo,
      spin_reward: rewardBadgeText,
    });
    setCountdown(15);
  };

  return (
    <div className="flex flex-col h-[100dvh] max-h-[100dvh] bg-gradient-to-br from-[#FFFDF0] via-[#FFFBEB] to-[#FEF3C7] p-3 sm:p-5 md:p-6 overflow-hidden select-none font-sans relative">
      {/* Top Header Bar */}
      <div className="flex items-center justify-between mb-3 shrink-0">
        <div className="flex items-center gap-3 sm:gap-4">
          <button
            onClick={() => router.push("/cart")}
            className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-white shadow-sm border-2 border-amber-200 flex items-center justify-center text-gray-700 hover:bg-amber-50 active:scale-95 transition-all shrink-0"
          >
            <ArrowLeft size={20} />
          </button>
          <div>
            <h1 className="text-xl sm:text-2xl md:text-3xl font-black text-[#b80000] tracking-tight leading-tight">
              Metode Pembayaran
            </h1>
            <p className="text-gray-600 text-[11px] sm:text-xs font-medium">
              Pilih cara bayar dan selesaikan pesananmu
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2.5 bg-white px-3.5 py-1.5 rounded-xl border-2 border-[#ffde59] shadow-sm">
          <div className="w-8 h-8 p-0.5 rounded-lg border border-[#ffde59] bg-white flex items-center justify-center">
            <img src="/logo.png" alt="Logo" className="w-full h-full object-contain" />
          </div>
          <span className="font-black text-xs sm:text-sm text-gray-900">
            TITIK<span className="text-[#b80000]">NGUNYAH</span>
          </span>
        </div>
      </div>

      {/* Main Content Layout */}
      <div className="flex flex-col md:flex-row flex-1 gap-4 md:gap-6 min-h-0 overflow-hidden">
        {/* Left Column: Customer Name, Method Selection & Total */}
        <div className="w-full md:w-80 lg:w-96 flex flex-col justify-between shrink-0 space-y-3">
          <div className="space-y-2.5">
            {/* Optional Customer Name Input */}
            <div className="bg-white p-3.5 rounded-2xl border-2 border-amber-200 shadow-sm space-y-1.5">
              <label className="text-[11px] font-black text-gray-700 flex items-center justify-between uppercase tracking-wider">
                <span className="flex items-center gap-1.5 text-[#b80000]">
                  <User size={14} /> Nama Pemesan
                </span>
                <span className="text-gray-400 font-bold normal-case text-[10px] bg-amber-50 px-2 py-0.5 rounded-md border border-amber-200">
                  Opsional / Pre-Order
                </span>
              </label>
              <input
                type="text"
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
                placeholder="Contoh: Dhani (Pre-Order) / Budi"
                className="w-full bg-amber-50/60 border border-amber-200 rounded-xl px-3 py-2 text-sm font-bold text-gray-900 placeholder:text-gray-400 placeholder:font-normal focus:outline-none focus:ring-2 focus:ring-[#b80000] focus:border-transparent transition-all"
                maxLength={40}
              />
            </div>

            <span className="text-xs font-black text-gray-800 uppercase tracking-wider block">
              Pilihan Bayar:
            </span>

            {/* QRIS Option */}
            <button
              type="button"
              onClick={() => {
                setMethod("qris");
                setErrorMsg(null);
              }}
              className={`w-full p-3.5 sm:p-4 rounded-2xl border-2 text-left flex items-center justify-between transition-all ${
                method === "qris"
                  ? "border-[#b80000] bg-red-50/90 shadow-md ring-2 ring-[#ffde59]"
                  : "border-amber-200 bg-white hover:border-amber-300 shadow-sm"
              }`}
            >
              <div className="flex items-center gap-3">
                <div className={`w-11 h-11 rounded-xl flex items-center justify-center shrink-0 ${
                  method === "qris" ? "bg-[#b80000] text-[#ffde59]" : "bg-amber-100 text-amber-900"
                }`}>
                  <QrCode size={24} />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-base sm:text-lg font-black text-gray-900 leading-tight">QRIS Statis</h3>
                    <span className="bg-[#ffde59] text-[#b80000] text-[10px] font-black px-2 py-0.5 rounded-full uppercase">
                      Praktis
                    </span>
                  </div>
                  <p className="text-gray-500 text-[11px]">BCA, GoPay, OVO, DANA, ShopeePay, Mandiri, dll</p>
                </div>
              </div>
              <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 ${
                method === "qris" ? "border-[#b80000] bg-[#b80000]" : "border-gray-300"
              }`}>
                {method === "qris" && <div className="w-2 h-2 bg-[#ffde59] rounded-full" />}
              </div>
            </button>

            {/* Cash Option */}
            <button
              type="button"
              onClick={() => {
                setMethod("cash");
                setErrorMsg(null);
              }}
              className={`w-full p-3.5 sm:p-4 rounded-2xl border-2 text-left flex items-center justify-between transition-all ${
                method === "cash"
                  ? "border-[#b80000] bg-red-50/90 shadow-md ring-2 ring-[#ffde59]"
                  : "border-amber-200 bg-white hover:border-amber-300 shadow-sm"
              }`}
            >
              <div className="flex items-center gap-3">
                <div className={`w-11 h-11 rounded-xl flex items-center justify-center shrink-0 ${
                  method === "cash" ? "bg-[#b80000] text-[#ffde59]" : "bg-amber-100 text-amber-900"
                }`}>
                  <Banknote size={24} />
                </div>
                <div>
                  <h3 className="text-base sm:text-lg font-black text-gray-900 leading-tight">Tunai di Kasir</h3>
                  <p className="text-gray-500 text-[11px]">Bayar langsung dengan uang tunai di kasir stand</p>
                </div>
              </div>
              <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 ${
                method === "cash" ? "border-[#b80000] bg-[#b80000]" : "border-gray-300"
              }`}>
                {method === "cash" && <div className="w-2 h-2 bg-[#ffde59] rounded-full" />}
              </div>
            </button>
          </div>

          {/* Total Payment Summary */}
          <div className="bg-white p-4 rounded-2xl border-2 border-[#ffde59] shadow-sm space-y-1">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold text-gray-500 uppercase tracking-wider">
                Total Tagihan ({items.reduce((acc, i) => acc + i.quantity, 0)} Menu)
              </span>
              {hasSpin && (
                <span className="text-[10px] font-black bg-[#ffde59] text-[#b80000] px-2 py-0.5 rounded-full">
                  +1x Spin
                </span>
              )}
            </div>
            <span className="text-2xl sm:text-3xl font-black text-[#b80000] tracking-tight block">
              {formatPrice(total)}
            </span>
          </div>

          {/* Security Notice */}
          <div className="bg-amber-50/80 p-3 rounded-xl border border-amber-200 flex items-center gap-2.5 text-gray-600">
            <ShieldCheck size={22} className="text-emerald-600 shrink-0" />
            <p className="text-[11px] leading-tight">
              Pesanan langsung otomatis terhubung ke antrean dapur <strong>Titik Ngunyah</strong>.
            </p>
          </div>
        </div>

        {/* Right Column: EXTRA LARGE QRIS Standee & Action Button */}
        <div className="flex-1 flex flex-col items-center justify-between min-h-0 h-full">
          {errorMsg && (
            <div className="w-full bg-red-50 border border-red-200 text-red-700 px-3.5 py-2 rounded-xl flex items-center gap-2 mb-2 shrink-0">
              <AlertCircle size={18} className="shrink-0" />
              <p className="text-xs font-bold">{errorMsg}</p>
            </div>
          )}

          <div className="flex-1 w-full flex flex-col items-center justify-center min-h-0 py-0.5">
            <AnimatePresence mode="wait">
              {method === "qris" && (
                <motion.div
                  key="qris-display"
                  initial={{ opacity: 0, scale: 0.96 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.96 }}
                  className="flex flex-col items-center justify-center w-full h-full min-h-0"
                >
                  {/* Nominal Badge */}
                  <div className="bg-[#b80000] text-[#ffde59] px-6 py-1.5 rounded-full font-black text-sm sm:text-base mb-1.5 shadow-md flex items-center gap-2 shrink-0 border-2 border-white/50">
                    <span>Nominal Transfer:</span>
                    <span className="text-white text-base sm:text-xl font-black">{formatPrice(total)}</span>
                  </div>

                  {/* EXTRA LARGE QRIS IMAGE (MAX HEIGHT UP TO 65vh) */}
                  <div className="flex-1 flex items-center justify-center min-h-0 w-full p-0.5">
                    <img
                      src="/qris-statis.jpg"
                      alt="QRIS Statis Titik Ngunyah"
                      className="h-full max-h-[58dvh] sm:max-h-[62dvh] md:max-h-[65dvh] w-auto object-contain rounded-2xl shadow-2xl border-4 border-[#b80000] bg-white"
                    />
                  </div>
                </motion.div>
              )}

              {method === "cash" && (
                <motion.div
                  key="cash-display"
                  initial={{ opacity: 0, scale: 0.96 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.96 }}
                  className="flex flex-col items-center justify-center w-full h-full text-center px-4"
                >
                  <div className="w-24 h-24 bg-red-100 rounded-full flex items-center justify-center text-5xl text-[#b80000] mb-4 shadow-inner border-2 border-[#ffde59]">
                    💵
                  </div>
                  <h3 className="text-2xl sm:text-3xl font-black text-gray-900">
                    Pembayaran Tunai di Kasir
                  </h3>
                  <div className="bg-[#b80000] text-[#ffde59] px-6 py-2 rounded-2xl text-2xl font-black my-3 shadow-md">
                    Total: {formatPrice(total)}
                  </div>
                  <p className="text-gray-600 text-sm sm:text-base max-w-md leading-relaxed mt-1">
                    Silakan selesaikan pembayaran ke kasir stand dengan menyebutkan <strong>Nomor Antrean</strong> yang akan muncul setelah konfirmasi.
                  </p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Action Button */}
          <div className="w-full pt-2 shrink-0">
            <button
              onClick={() => method && handleProcessOrder(method)}
              disabled={isProcessing || !method}
              className="w-full bg-[#b80000] hover:bg-[#940000] text-[#ffde59] py-3.5 sm:py-4 px-6 rounded-2xl text-base sm:text-xl font-black shadow-xl shadow-red-900/20 hover:scale-[1.01] active:scale-[0.99] transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2.5 border-2 border-[#ffde59]"
            >
              {isProcessing ? (
                <span className="flex items-center gap-2.5 text-white">
                  <svg className="animate-spin h-5 w-5 text-white" viewBox="0 0 24 24" fill="none">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"></path>
                  </svg>
                  Memproses Antrean...
                </span>
              ) : method === "qris" ? (
                <>
                  <CheckCircle2 size={24} />
                  <span>Saya Sudah Bayar (Dapatkan Antrean)</span>
                </>
              ) : (
                <>
                  <CheckCircle2 size={24} />
                  <span>Konfirmasi & Dapatkan Antrean</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* 🎡 LUCKY SPIN WHEEL MODAL */}
      <SpinWheelModal
        isOpen={isSpinOpen}
        onFinish={handleSpinFinish}
      />

      {/* POPUP MODAL NOMOR ANTREAN */}
      <AnimatePresence>
        {successOrder && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
            <motion.div
              initial={{ scale: 0.8, opacity: 0, y: 30 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.8, opacity: 0 }}
              transition={{ type: "spring", damping: 22, stiffness: 280 }}
              className="bg-white rounded-[2.5rem] shadow-2xl p-6 sm:p-8 max-w-lg w-full text-center border-4 border-[#ffde59] flex flex-col items-center relative overflow-hidden"
            >
              {/* Brand Top Header */}
              <div className="flex items-center gap-2.5 bg-amber-50 px-4 py-1.5 rounded-full border border-amber-200 mb-3">
                <div className="w-7 h-7 p-0.5 bg-white rounded-lg border border-[#ffde59] flex items-center justify-center">
                  <img src="/logo.png" alt="Logo" className="w-full h-full object-contain" />
                </div>
                <span className="text-xs font-black text-gray-900 tracking-tight">
                  TITIK<span className="text-[#b80000]">NGUNYAH</span>
                </span>
                <span className="text-[10px] font-bold text-[#b80000] uppercase tracking-wider">• Kiosk</span>
              </div>

              {/* Success Icon */}
              <div className="w-14 h-14 sm:w-16 sm:h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mb-2 shadow-inner">
                <CheckCircle2 size={36} />
              </div>

              <h2 className="text-2xl sm:text-3xl font-black text-gray-900 leading-tight">
                Pesanan Diterima!
              </h2>
              <p className="text-gray-500 text-xs sm:text-sm font-medium mt-0.5">
                Silakan simpan & foto nomor antrean ini
              </p>

              {/* BIG QUEUE NUMBER DISPLAY */}
              <div className="w-full bg-gradient-to-br from-red-50 to-amber-50 py-4 sm:py-5 px-6 rounded-3xl my-3 border-2 border-red-200 shadow-inner">
                <span className="text-xs font-black text-gray-500 uppercase tracking-[0.25em] block mb-0.5">
                  NOMOR ANTREAN KAMU
                </span>
                <p className="text-6xl sm:text-7xl font-black text-[#b80000] tracking-tight drop-shadow-sm font-sans">
                  {successOrder.queue_number}
                </p>
                <div className="flex items-center justify-center gap-3 mt-2 text-xs font-bold text-gray-600">
                  <span className="bg-white px-2.5 py-1 rounded-lg border border-gray-200">
                    No. Order: {successOrder.order_number}
                  </span>
                  <span className="bg-[#ffde59] text-[#b80000] px-2.5 py-1 rounded-lg">
                    {formatPrice(successOrder.total)}
                  </span>
                </div>
              </div>

              {/* 🎁 WON SPIN REWARD BADGE (IF PLAYED) */}
              {successOrder.spin_reward && (
                <div className="w-full bg-gradient-to-r from-amber-50 via-yellow-50 to-amber-50 border-2 border-[#ffde59] p-3 rounded-2xl mb-3 flex items-center justify-center gap-2 shadow-sm animate-pulse">
                  <Sparkles size={18} className="text-[#b80000] shrink-0" />
                  <span className="text-xs sm:text-sm font-black text-[#b80000]">
                    HADIAH SPIN: {successOrder.spin_reward}
                  </span>
                </div>
              )}

              {/* Estimated Time Info */}
              <div className="flex items-center justify-center gap-2 bg-amber-50/80 text-gray-700 px-4 py-2 rounded-xl border border-amber-200 text-xs font-medium w-full mb-3">
                <Clock size={16} className="text-[#b80000] animate-pulse shrink-0" />
                <span>Estimasi penyajian: <strong className="text-gray-900 font-bold">10 - 15 menit</strong></span>
              </div>

              {/* Finish Actions */}
              <div className="w-full space-y-2">
                <button
                  onClick={() => router.push("/menu")}
                  className="w-full bg-[#b80000] hover:bg-[#940000] text-[#ffde59] py-3.5 rounded-2xl font-black text-base shadow-lg transition-all active:scale-95 flex items-center justify-center gap-2 border-2 border-[#ffde59]"
                >
                  <Utensils size={18} />
                  <span>Selesai & Pesan Lagi</span>
                </button>

                <p className="text-[11px] text-gray-400 font-medium">
                  Kembali otomatis ke Beranda dalam <strong className="text-gray-700">{countdown}</strong> detik...
                </p>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
