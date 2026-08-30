"use client";

import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { ChevronRight, Utensils } from "lucide-react";

export default function SplashPage() {
  const router = useRouter();

  return (
    <div
      className="relative w-full h-[100dvh] overflow-hidden cursor-pointer bg-gradient-to-br from-[#b80000] via-[#940000] to-[#730000] select-none flex flex-col justify-between p-6 sm:p-12 text-white"
      onClick={() => router.push("/menu")}
    >
      {/* Background Decorative Circles / Glowing Orbs */}
      <div className="absolute -top-32 -left-32 w-96 h-96 bg-[#ffde59]/20 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-32 -right-32 w-96 h-96 bg-[#ffde59]/20 rounded-full blur-3xl pointer-events-none" />

      {/* Top Header Badge */}
      <motion.div
        initial={{ y: -30, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.6 }}
        className="flex items-center justify-between z-10"
      >
        <div className="bg-black/30 backdrop-blur-md px-5 py-2.5 rounded-full border border-white/15 flex items-center gap-2 text-xs sm:text-sm font-bold tracking-wide">
          <span className="w-2.5 h-2.5 bg-[#ffde59] rounded-full animate-ping" />
          <span>Bazar Technopreneurship 2026</span>
          <span className="opacity-60 hidden sm:inline">• Politala</span>
        </div>

        <div className="bg-[#ffde59] text-[#b80000] px-4 py-1.5 rounded-full text-xs font-black uppercase tracking-wider shadow-md">
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
          <div className="w-36 h-36 sm:w-44 sm:h-44 bg-white rounded-3xl shadow-2xl p-4 flex items-center justify-center border-4 border-[#ffde59] ring-8 ring-white/15">
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
          <h1 className="text-5xl sm:text-7xl font-black tracking-tight drop-shadow-lg font-sans text-white">
            TITIK<span className="text-[#ffde59]">NGUNYAH</span>
          </h1>

          {/* Banner Tagline Pill */}
          <div className="inline-block bg-[#ffde59] text-[#b80000] px-7 py-2.5 rounded-full shadow-2xl transform -rotate-1 border-2 border-white/60">
            <p className="text-xl sm:text-3xl font-black tracking-wider uppercase drop-shadow-sm font-sans">
              ENAKNYA BIKIN PENASARAN!
            </p>
          </div>

          <p className="text-base sm:text-xl font-semibold text-[#ffde59] opacity-95 drop-shadow mt-2">
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
            className="group relative bg-[#ffde59] hover:bg-[#facc15] text-[#b80000] px-10 sm:px-14 py-5 sm:py-6 rounded-3xl text-2xl sm:text-3xl font-black shadow-2xl transition-all duration-300 transform hover:scale-105 active:scale-95 flex items-center gap-3 border-2 border-white"
          >
            <Utensils size={32} className="text-[#b80000]" />
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
        <p className="text-sm sm:text-base font-black tracking-[0.25em] text-[#ffde59] uppercase drop-shadow">
          👉 Sentuh Layar Mana Saja Untuk Memulai 👈
        </p>
      </motion.div>
    </div>
  );
}
