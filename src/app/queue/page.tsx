"use client";

import { useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import { CheckCircle2, Clock, Home } from "lucide-react";

function QueueContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const queueId = searchParams.get("id") || "A-001";

  useEffect(() => {
    // Automatically go back to splash screen after 15 seconds
    const timeout = setTimeout(() => {
      router.push("/");
    }, 15000);
    return () => clearTimeout(timeout);
  }, [router]);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-b from-[#991B1B] to-[#7F1D1D] p-6 relative overflow-hidden select-none">
      {/* Glow Orbs */}
      <div className="absolute -top-20 -left-20 w-80 h-80 bg-[#FBC02D]/20 rounded-full blur-3xl" />
      <div className="absolute -bottom-20 -right-20 w-80 h-80 bg-[#F59E0B]/20 rounded-full blur-3xl" />

      <motion.div
        initial={{ scale: 0.85, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: "spring", bounce: 0.35, duration: 0.8 }}
        className="bg-white p-8 sm:p-12 rounded-[2.5rem] shadow-2xl flex flex-col items-center text-center max-w-xl w-full border-4 border-[#FBC02D] relative z-10"
      >
        {/* Logo at Top of Card */}
        <div className="flex items-center gap-3 bg-amber-50 px-4 py-2 rounded-2xl border border-amber-200 mb-6">
          <div className="w-10 h-10 p-1 bg-white rounded-xl border border-[#FBC02D] flex items-center justify-center">
            <img src="/logo.png" alt="Logo" className="w-full h-full object-contain" />
          </div>
          <div className="text-left">
            <h2 className="text-base font-black text-gray-900 leading-tight">
              TITIK<span className="text-[#E53935]">NGUNYAH</span>
            </h2>
            <p className="text-[10px] font-bold text-[#E53935] uppercase tracking-wider">
              Enaknya Bikin Penasaran!
            </p>
          </div>
        </div>

        {/* Success Icon */}
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: "spring", delay: 0.2 }}
          className="w-20 h-20 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mb-4 shadow-inner"
        >
          <CheckCircle2 size={48} />
        </motion.div>

        <h1 className="text-3xl sm:text-4xl font-black text-gray-900 mb-2 tracking-tight">
          Pesanan Berhasil!
        </h1>
        <p className="text-gray-500 text-base sm:text-lg mb-8 font-medium">
          Mohon simpan dan ingat nomor antrean kamu
        </p>

        {/* Queue Box */}
        <div className="w-full bg-gradient-to-br from-red-50 to-amber-50/50 py-8 px-6 rounded-3xl mb-8 border-2 border-red-200 shadow-inner">
          <p className="text-sm sm:text-base text-gray-600 font-black uppercase tracking-[0.2em] mb-2">
            NOMOR ANTREAN
          </p>
          <p className="text-7xl sm:text-8xl font-black text-[#E53935] tracking-tight drop-shadow-sm font-sans">
            {queueId}
          </p>
        </div>

        {/* Wait Time Info */}
        <div className="flex items-center justify-center gap-2 text-base text-gray-700 bg-gray-100 px-5 py-3 rounded-2xl font-medium w-full">
          <Clock size={20} className="text-[#E53935] animate-pulse" />
          <span>Estimasi waktu tunggu: <strong className="text-gray-900 font-bold">10 - 15 menit</strong></span>
        </div>
      </motion.div>

      {/* Return Button */}
      <motion.button
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.6 }}
        onClick={() => router.push("/")}
        className="mt-8 text-base sm:text-lg font-bold text-white/90 hover:text-white bg-white/15 backdrop-blur-md px-6 py-3 rounded-full border border-white/20 hover:bg-white/25 transition-all flex items-center gap-2 z-10"
      >
        <Home size={18} />
        <span>Kembali ke Halaman Utama</span>
      </motion.button>
    </div>
  );
}

export default function QueuePage() {
  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center h-screen bg-[#991B1B]">
          <p className="text-2xl text-white font-bold animate-pulse">Memuat Antrean...</p>
        </div>
      }
    >
      <QueueContent />
    </Suspense>
  );
}
