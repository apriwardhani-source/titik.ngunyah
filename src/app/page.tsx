"use client";

import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Sparkles, ChevronRight, Utensils } from "lucide-react";
import Image from "next/image";

export default function SplashPage() {
  const router = useRouter();

  return (
    <div
      className="relative w-full h-[100dvh] overflow-hidden cursor-pointer bg-gradient-to-br from-[#991B1B] via-[#B91C1C] to-[#7F1D1D] select-none flex flex-col justify-between p-6 sm:p-12 text-white"
      onClick={() => router.push("/menu")}
    >
      {/* Background Decorative Circles / Glowing Orbs */}
      <div className="absolute -top-32 -left-32 w-96 h-96 bg-[#FBC02D]/20 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-32 -right-32 w-96 h-96 bg-[#F59E0B]/25 rounded-full blur-3xl pointer-events-none" />

      {/* Top Header Badge */}
      <motion.div
        initial={{ y: -30, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.6 }}
        className="flex items-center justify-between z-10"
      >
        <div className="bg-black/30 backdrop-blur-md px-5 py-2.5 rounded-full border border-white/15 flex items-center gap-2 text-xs sm:text-sm font-bold tracking-wide">
          <span className="w-2.5 h-2.5 bg-[#FBC02D] rounded-full animate-ping" />
          <span>Bazar Technopreneurship 2026</span>
          <span className="opacity-60 hidden sm:inline">• Politala</span>
        </div>

        <div className="bg-white/10 backdrop-blur-md px-4 py-2 rounded-full text-xs font-bold text-[#FEF08A]">
          Kiosk Mandiri
        </div>
      </motion.div>

      {/* Main Hero Section */}
      <div className="relative z-10 flex flex-col items-center justify-center text-center my-auto">
        {/* Logo with White Background Glow Card */}
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.7, ease: "easeOut" }}
          className="relative mb-6"
        >
          <div className="w-32 h-32 sm:w-40 sm:h-40 bg-white rounded-3xl shadow-2xl p-4 flex items-center justify-center border-4 border-[#FBC02D] ring-8 ring-white/10">
            <img
              src="/logo.png"
              alt="Logo Titik Ngunyah"
              className="w-full h-full object-contain drop-shadow-md"
            />
          </div>
        </motion.div>

        {/* Brand Name & Tagline */}
        <motion.div
          initial={{ y: 30, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.7, delay: 0.2 }}
          className="space-y-3 max-w-2xl"
        >
          <h1 className="text-5xl sm:text-7xl font-black tracking-tight drop-shadow-lg font-sans">
            TITIK<span className="text-[#FBC02D]">NGUNYAH</span>
          </h1>

          {/* Banner Tagline Pill */}
          <div className="inline-block bg-[#FBC02D] text-[#991B1B] px-6 py-2 rounded-full shadow-lg transform -rotate-1">
            <p className="text-xl sm:text-3xl font-black tracking-wider uppercase drop-shadow-sm font-sans">
              ENAKNYA BIKIN PENASARAN!
            </p>
          </div>

          <p className="text-base sm:text-xl font-semibold text-[#FEF08A] opacity-90 drop-shadow mt-2">
            Kebab Daging & Sosis Panggang • Minuman Dingin Segar
          </p>
        </motion.div>

        {/* Big Start Button */}
        <motion.div
          initial={{ y: 40, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.7, delay: 0.4 }}
          className="mt-10"
        >
          <button
            onClick={(e) => {
              e.stopPropagation();
              router.push("/menu");
            }}
            className="group relative bg-[#FBC02D] hover:bg-[#F59E0B] text-[#991B1B] px-10 sm:px-14 py-5 sm:py-6 rounded-3xl text-2xl sm:text-3xl font-black shadow-2xl transition-all duration-300 transform hover:scale-105 active:scale-95 flex items-center gap-3 border-2 border-white/50"
          >
            <Utensils size={32} className="text-[#991B1B]" />
            <span>Mulai Pesan</span>
            <ChevronRight size={32} className="transition-transform group-hover:translate-x-1" />
          </button>
        </motion.div>
      </div>

      {/* Bottom Footer Call-to-Action */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1, delay: 0.8, repeat: Infinity, repeatType: "reverse" }}
        className="relative z-10 text-center"
      >
        <p className="text-sm sm:text-base font-bold tracking-[0.25em] text-[#FEF08A]/90 uppercase drop-shadow">
          👉 Sentuh Layar Mana Saja Untuk Memulai 👈
        </p>
      </motion.div>
    </div>
  );
}
