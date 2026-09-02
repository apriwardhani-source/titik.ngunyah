"use client";

import { useState } from "react";
import { useCartStore } from "@/store/useCartStore";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { formatPrice } from "@/lib/utils";
import { SPIN_PRICE } from "@/lib/spinConfig";
import { 
  ArrowLeft, 
  Trash2, 
  ShoppingBag, 
  Plus, 
  Minus, 
  Utensils, 
  Coffee, 
  Flame, 
  Sparkles, 
  Gift, 
  CheckCircle2,
  User,
  Phone,
  ArrowRight,
  X
} from "lucide-react";

export default function CartPage() {
  const router = useRouter();
  const { items, hasSpin, customerName, setCustomerName, customerPhone, setCustomerPhone, toggleSpin, removeItem, updateQuantity, getTotalPrice } = useCartStore();

  const total = getTotalPrice();

  // Fullscreen Name/Phone Modal
  const [isNameModalOpen, setIsNameModalOpen] = useState(false);
  const [inputName, setInputName] = useState(customerName || "");
  const [inputPhone, setInputPhone] = useState(customerPhone || "");

  const handleProceedClick = () => {
    setInputName(customerName || "");
    setInputPhone(customerPhone || "");
    setIsNameModalOpen(true);
  };

  const handleConfirmName = () => {
    const finalName = inputName.trim();
    if (!finalName) return; // wajib isi
    setCustomerName(finalName);
    setCustomerPhone(inputPhone.trim());
    setIsNameModalOpen(false);
    router.push("/payment");
  };

  const handleSkipName = () => {
    setCustomerName("Pelanggan Kiosk");
    setCustomerPhone("");
    setIsNameModalOpen(false);
    router.push("/payment");
  };

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
    <div className="flex flex-col md:flex-row h-[100dvh] max-h-[100dvh] bg-[#FFFDF0] overflow-hidden select-none font-sans">
      {/* Left: Cart Items List */}
      <div className="flex-1 flex flex-col min-h-0 overflow-hidden p-4 sm:p-6 md:p-8 lg:p-10">
        {/* Top Header */}
        <div className="flex items-center justify-between mb-4 md:mb-6 shrink-0">
          <div className="flex items-center gap-3 sm:gap-4 md:gap-5">
            <button
              onClick={() => router.push("/menu")}
              className="w-10 h-10 sm:w-12 sm:h-12 md:w-14 md:h-14 rounded-2xl bg-white shadow-sm border border-gray-200 flex items-center justify-center text-gray-700 hover:bg-gray-100 hover:scale-105 active:scale-95 transition-all shrink-0"
            >
              <ArrowLeft size={22} />
            </button>
            <div>
              <h1 className="text-2xl sm:text-3xl md:text-4xl font-black text-[#b80000] tracking-tight">Pesanan Saya</h1>
              <p className="text-gray-500 text-xs sm:text-sm md:text-base font-medium">Periksa kembali item & varian pilihanmu</p>
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
        <div className="flex-1 overflow-y-auto touch-scroll hide-scrollbar space-y-3 sm:space-y-4 pr-1">
          <AnimatePresence mode="popLayout">
            {items.map((item) => (
              <motion.div
                layout
                key={item.id}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, x: -50 }}
                transition={{ duration: 0.2 }}
                className="bg-white rounded-3xl p-4 sm:p-5 md:p-6 shadow-sm border-2 border-[#ffde59]/50 flex gap-3 sm:gap-4 md:gap-6 items-center"
              >
                <img
                  src={item.image}
                  alt={item.name}
                  className="w-16 h-16 sm:w-20 sm:h-20 md:w-24 md:h-24 rounded-2xl object-cover shrink-0 bg-amber-50 border border-amber-100 self-start mt-1"
                />
                <div className="flex-1 min-w-0">
                  <div className="flex items-baseline justify-between gap-2">
                    <h3 className="text-base sm:text-lg md:text-xl font-black text-gray-900 truncate">{item.name}</h3>
                    <p className="text-sm sm:text-base md:text-lg font-black text-[#b80000] shrink-0">
                      {formatPrice(item.price * item.quantity)}
                    </p>
                  </div>

                  {/* Selected Options Badges */}
                  {item.options && (
                    <div className="flex flex-wrap gap-1.5 mt-2">
                      {item.options.kebab && (
                        <span className="inline-flex items-center gap-1 text-xs font-bold bg-orange-50 text-orange-700 px-2.5 py-0.5 sm:py-1 rounded-lg border border-orange-100">
                          <Utensils size={12} /> {item.options.kebab}
                        </span>
                      )}
                      {item.options.drink && (
                        <span className="inline-flex items-center gap-1 text-xs font-bold bg-blue-50 text-blue-700 px-2.5 py-0.5 sm:py-1 rounded-lg border border-blue-100">
                          <Coffee size={12} /> {item.options.drink}
                        </span>
                      )}
                      {item.options.spicy && (
                        <span className="inline-flex items-center gap-1 text-xs font-bold bg-red-50 text-[#b80000] px-2.5 py-0.5 sm:py-1 rounded-lg border border-red-100">
                          <Flame size={12} /> {item.options.spicy}
                        </span>
                      )}
                      {item.options.mayo && (
                        <span className="inline-flex items-center gap-1 text-xs font-bold bg-amber-50 text-amber-800 px-2.5 py-0.5 sm:py-1 rounded-lg border border-amber-200">
                          {item.options.mayo}
                        </span>
                      )}
                      {item.options.extra && (
                        <span className="inline-flex items-center gap-1 text-xs font-bold bg-purple-50 text-purple-700 px-2.5 py-0.5 sm:py-1 rounded-lg border border-purple-100">
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
                <div className="flex items-center gap-1.5 sm:gap-2 bg-gray-50 rounded-2xl p-1 sm:p-1.5 border border-gray-200 shrink-0">
                  <button
                    onClick={() => updateQuantity(item.id, item.quantity - 1)}
                    className="w-7 h-7 sm:w-8 sm:h-8 rounded-xl bg-white shadow-sm flex items-center justify-center text-gray-700 hover:bg-gray-100 active:scale-90 transition-all font-bold"
                  >
                    <Minus size={15} />
                  </button>
                  <span className="font-black text-sm sm:text-base w-5 sm:w-6 text-center text-gray-900">{item.quantity}</span>
                  <button
                    onClick={() => updateQuantity(item.id, item.quantity + 1)}
                    className="w-7 h-7 sm:w-8 sm:h-8 rounded-xl bg-[#b80000] text-white shadow-sm flex items-center justify-center hover:bg-[#940000] active:scale-90 transition-all font-bold"
                  >
                    <Plus size={15} />
                  </button>
                </div>

                {/* Remove Button */}
                <button
                  onClick={() => removeItem(item.id)}
                  className="w-9 h-9 sm:w-10 sm:h-10 md:w-12 md:h-12 shrink-0 rounded-2xl bg-red-50 flex items-center justify-center text-[#b80000] hover:bg-red-100 hover:scale-105 active:scale-95 transition-all border border-red-100"
                >
                  <Trash2 size={18} />
                </button>
              </motion.div>
            ))}
          </AnimatePresence>

          {/* 🎡 LUCKY SPIN UPSELL CARD */}
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            className={`rounded-3xl p-4 sm:p-5 border-3 transition-all cursor-pointer shadow-md ${
              hasSpin
                ? "bg-gradient-to-r from-[#ffde59] via-[#facc15] to-[#fbbf24] border-[#b80000] ring-4 ring-red-100"
                : "bg-white border-dashed border-amber-300 hover:border-amber-400"
            }`}
            onClick={toggleSpin}
          >
            <div className="flex items-center justify-between gap-3 sm:gap-4">
              <div className="flex items-center gap-3.5">
                <div className={`w-12 h-12 sm:w-14 sm:h-14 rounded-2xl flex items-center justify-center text-2xl sm:text-3xl shrink-0 shadow-sm border ${
                  hasSpin ? "bg-[#b80000] text-[#ffde59] border-white/40" : "bg-amber-100 border-amber-200"
                }`}>
                  🎡
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-base sm:text-lg font-black text-gray-900">
                      Lucky Spin Game
                    </h3>
                    <span className="bg-[#b80000] text-[#ffde59] text-[10px] sm:text-xs font-black px-2 py-0.5 rounded-full uppercase tracking-wider shadow-sm">
                      +Rp 1.000
                    </span>
                  </div>
                  <p className="text-xs sm:text-sm text-gray-700 font-medium mt-0.5">
                    Putar roda setelah bayar! Raih <strong>Jackpot 1 Kebab Daging</strong>, Es Teh, Extra Daging, atau Permen!
                  </p>
                </div>
              </div>

              {/* Checkbox / Toggle Status */}
              <div className={`w-7 h-7 sm:w-8 sm:h-8 rounded-full border-2 flex items-center justify-center shrink-0 transition-all ${
                hasSpin
                  ? "bg-[#b80000] border-[#b80000] text-[#ffde59] shadow-md"
                  : "border-gray-300 bg-white"
              }`}>
                {hasSpin ? <CheckCircle2 size={20} /> : <Plus size={18} className="text-gray-400" />}
              </div>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Right / Bottom: Order Summary */}
      <div className="w-full md:w-[360px] lg:w-[400px] bg-white shadow-2xl z-10 flex flex-col justify-between shrink-0 border-t md:border-t-0 md:border-l-4 border-[#ffde59] max-h-[40vh] md:max-h-full">
        <div className="p-4 sm:p-6 md:p-8 border-b border-gray-100 shrink-0 bg-gradient-to-r from-red-50/40 to-white">
          <h2 className="text-lg sm:text-xl md:text-2xl font-black text-gray-900">Ringkasan Pembayaran</h2>
        </div>

        <div className="p-4 sm:p-6 md:p-8 flex-1 flex flex-col justify-center gap-2.5 sm:gap-3 md:gap-4 overflow-y-auto">
          <div className="flex justify-between items-center text-gray-500 text-sm sm:text-base md:text-lg font-medium">
            <span>Total Menu</span>
            <span className="font-black text-gray-900">{items.reduce((acc, i) => acc + i.quantity, 0)} Porsi</span>
          </div>

          {hasSpin && (
            <div className="flex justify-between items-center text-amber-900 bg-amber-50/90 px-3 py-1.5 rounded-xl border border-amber-200 text-xs sm:text-sm font-bold">
              <span className="flex items-center gap-1.5">
                <Sparkles size={14} className="text-[#b80000]" />
                Lucky Spin Game (1x)
              </span>
              <span className="font-black text-[#b80000]">+{formatPrice(SPIN_PRICE)}</span>
            </div>
          )}

          {/* Customer name preview (if already set) */}
          {customerName && customerName !== "Pelanggan Kiosk" && (
            <div className="bg-amber-50/80 p-3 rounded-2xl border-2 border-amber-200 flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-[#b80000] text-[#ffde59] flex items-center justify-center font-black text-sm shrink-0">
                {customerName.substring(0, 2).toUpperCase()}
              </div>
              <div className="min-w-0">
                <p className="text-xs font-black text-gray-900 truncate">{customerName}</p>
                {customerPhone && (
                  <p className="text-[11px] text-emerald-700 font-bold">📱 {customerPhone}</p>
                )}
              </div>
              <button
                onClick={() => { setInputName(customerName); setInputPhone(customerPhone); setIsNameModalOpen(true); }}
                className="ml-auto text-[10px] font-bold text-[#b80000] bg-white px-2 py-1 rounded-lg border border-red-200 hover:bg-red-50 transition-colors shrink-0"
              >
                Ubah
              </button>
            </div>
          )}

          <div className="h-px bg-gray-100 my-0.5" />
          <div className="flex justify-between items-baseline">
            <span className="text-base sm:text-lg md:text-xl font-bold text-gray-900">Total Tagihan</span>
            <span className="text-2xl sm:text-3xl md:text-4xl font-black text-[#b80000]">{formatPrice(total)}</span>
          </div>
        </div>

        {/* Proceed Button */}
        <div className="p-3.5 sm:p-5 md:p-6 lg:p-8 bg-amber-50/50 border-t border-amber-100 shrink-0">
          <button
            onClick={handleProceedClick}
            className="w-full bg-[#b80000] hover:bg-[#940000] text-[#ffde59] py-3.5 sm:py-4 md:py-5 rounded-2xl text-lg sm:text-xl md:text-2xl font-black shadow-xl shadow-red-900/20 transition-all hover:scale-[1.02] active:scale-[0.98] border-2 border-[#ffde59] flex items-center justify-center gap-2"
          >
            <span>Lanjut ke Pembayaran</span>
            <span>→</span>
          </button>
        </div>
      </div>

      {/* 👤 FULL-SCREEN POPUP MODAL NAMA & NO TELEPON */}
      <AnimatePresence>
        {isNameModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
            <motion.div
              initial={{ scale: 0.85, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.85, opacity: 0 }}
              transition={{ type: "spring", damping: 24, stiffness: 300 }}
              className="bg-white rounded-[2.5rem] shadow-2xl p-6 sm:p-8 max-w-lg w-full text-left border-4 border-[#ffde59] relative overflow-hidden flex flex-col"
            >
              {/* Close Button */}
              <button
                onClick={() => setIsNameModalOpen(false)}
                className="absolute top-5 right-5 w-10 h-10 rounded-full bg-gray-100 hover:bg-gray-200 text-gray-600 flex items-center justify-center font-black transition-all active:scale-90"
              >
                <X size={20} />
              </button>

              {/* Brand Top Header Badge */}
              <div className="flex items-center gap-2 bg-amber-50 px-3.5 py-1.5 rounded-full border border-amber-200 w-fit mb-4">
                <div className="w-6 h-6 p-0.5 bg-white rounded-md border border-[#ffde59] flex items-center justify-center">
                  <img src="/logo.png" alt="Logo" className="w-full h-full object-contain" />
                </div>
                <span className="text-xs font-black text-gray-900 tracking-tight">
                  TITIK<span className="text-[#b80000]">NGUNYAH</span>
                </span>
                <span className="text-[10px] font-bold text-[#b80000] uppercase tracking-wider">• Konfirmasi Data</span>
              </div>

              {/* Title & Subtitle */}
              <h3 className="text-2xl sm:text-3xl font-black text-gray-900 leading-tight">
                Siapa Namamu? 👋
              </h3>
              <p className="text-gray-500 text-xs sm:text-sm font-medium mt-1 mb-6">
                Nama akan ditampilkan di layar antrean dapur saat pesananmu dipersiapkan.
              </p>

              {/* Input Form */}
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  handleConfirmName();
                }}
                className="space-y-4"
              >
                {/* 1. Nama Pemesan (AutoFocused, Required) */}
                <div className="space-y-1.5">
                  <label className="text-xs font-black text-gray-800 uppercase tracking-wider flex items-center gap-1.5">
                    <User size={15} className="text-[#b80000]" />
                    Nama Lengkap / Panggilan <span className="text-[#b80000]">*Wajib</span>
                  </label>
                  <input
                    type="text"
                    autoFocus
                    required
                    value={inputName}
                    onChange={(e) => setInputName(e.target.value)}
                    placeholder="Contoh: Dhani / Siti (Pre-order)"
                    className="w-full bg-amber-50/60 border-2 border-amber-200 focus:border-[#b80000] rounded-2xl px-4 py-3.5 text-base font-black text-gray-900 placeholder:text-gray-400 placeholder:font-normal focus:outline-none focus:ring-4 focus:ring-red-100 transition-all shadow-inner"
                    maxLength={40}
                  />
                </div>

                {/* 2. No Telepon / WhatsApp (Opsional) */}
                <div className="space-y-1.5">
                  <label className="text-xs font-black text-gray-800 uppercase tracking-wider flex items-center justify-between">
                    <span className="flex items-center gap-1.5 text-emerald-700">
                      <Phone size={15} />
                      No. WhatsApp / HP
                    </span>
                    <span className="text-[10px] font-bold text-gray-400 bg-gray-100 px-2 py-0.5 rounded-md">
                      Opsional
                    </span>
                  </label>
                  <input
                    type="tel"
                    value={inputPhone}
                    onChange={(e) => setInputPhone(e.target.value)}
                    placeholder="Contoh: 08123456789 (Bisa dikosongkan)"
                    className="w-full bg-gray-50 border-2 border-gray-200 focus:border-emerald-600 rounded-2xl px-4 py-3 text-sm font-bold text-gray-900 placeholder:text-gray-400 placeholder:font-normal focus:outline-none focus:ring-4 focus:ring-emerald-100 transition-all shadow-inner"
                    maxLength={20}
                  />
                </div>

                {/* Action Buttons */}
                <div className="pt-3 space-y-2">
                  <button
                    type="submit"
                    className="w-full bg-[#b80000] hover:bg-[#940000] text-[#ffde59] py-4 rounded-2xl font-black text-base sm:text-lg shadow-xl shadow-red-900/20 active:scale-[0.98] transition-all flex items-center justify-center gap-2 border-2 border-[#ffde59]"
                  >
                    <span>Lanjut ke Pembayaran</span>
                    <ArrowRight size={20} />
                  </button>

                  <button
                    type="button"
                    onClick={handleSkipName}
                    className="w-full py-2.5 text-xs font-bold text-gray-400 hover:text-gray-700 transition-colors"
                  >
                    Lewati (Pesan Tanpa Nama)
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
