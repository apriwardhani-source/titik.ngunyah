"use client";

import { useRouter } from "next/navigation";
import { motion } from "framer-motion";

export default function SplashPage() {
  const router = useRouter();

  return (
    <div className="relative w-full h-screen overflow-hidden cursor-pointer" onClick={() => router.push("/menu")}>
      {/* Background Image placeholder. I'll use a high-quality placeholder for kebab & fries. */}
      <div
        className="absolute inset-0 bg-cover bg-center"
        style={{ backgroundImage: "url('/homepage.png')" }}
      />
      {/* Dark overlay for better text readability */}
      <div className="absolute inset-0 bg-black/50" />

      {/* Content */}
      <div className="relative z-10 w-full h-full flex flex-col items-center justify-center text-white">
        <motion.div
          initial={{ y: -50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="text-center"
        >
          <h1 className="text-8xl font-black tracking-tight mb-4 drop-shadow-lg text-white">
            TITIK<span className="text-[#E53935]">NGUNYAH</span>
          </h1>
          <p className="text-2xl font-medium opacity-90 drop-shadow-md">
            Kebab & Kentang Goreng Terenak!
          </p>
        </motion.div>

        <motion.button
          initial={{ y: 50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.2, ease: "easeOut" }}
          onClick={(e) => {
            e.stopPropagation();
            router.push("/menu");
          }}
          className="mt-16 bg-[#E53935] hover:bg-[#C62828] text-white px-16 py-6 rounded-full text-3xl font-bold shadow-2xl transition-transform hover:scale-105 active:scale-95"
        >
          Mulai Pesan
        </motion.button>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1, delay: 0.8, repeat: Infinity, repeatType: "reverse" }}
          className="absolute bottom-12 text-xl font-medium tracking-widest text-white/80"
        >
          SENTUH LAYAR UNTUK MULAI
        </motion.p>
      </div>
    </div>
  );
}
