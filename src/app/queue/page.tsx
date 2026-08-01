"use client";

import { useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import { Suspense } from "react";

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
    <div className="flex flex-col items-center justify-center h-screen bg-background relative overflow-hidden">
      {/* Decorative background elements */}
      <div className="absolute top-0 left-0 w-full h-1/2 bg-[#E53935] -z-10 transform -skew-y-6 -translate-y-24 shadow-2xl" />
      
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: "spring", bounce: 0.4 }}
        className="bg-white p-16 rounded-[3rem] shadow-2xl flex flex-col items-center text-center max-w-2xl w-full border border-gray-100"
      >
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          <div className="w-24 h-24 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-8 text-5xl">
            ✓
          </div>
          <h1 className="text-4xl font-bold text-gray-800 mb-2">Pesanan Diterima!</h1>
          <p className="text-xl text-gray-500 mb-12">Silakan tunggu nomor antrean kamu dipanggil</p>
        </motion.div>

        <div className="w-full bg-gray-50 py-12 rounded-[2rem] mb-12 border-2 border-gray-100">
          <p className="text-2xl text-gray-500 font-medium mb-4 uppercase tracking-widest">Nomor Antrean</p>
          <p className="text-8xl font-black text-[#E53935] tracking-tighter">{queueId}</p>
        </div>

        <div className="flex items-center gap-4 text-xl text-gray-600">
          <span className="animate-pulse">⏱</span>
          <span>Estimasi waktu tunggu: <strong>10 - 15 menit</strong></span>
        </div>
      </motion.div>

      <motion.button
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1 }}
        onClick={() => router.push("/")}
        className="mt-12 text-xl font-medium text-gray-500 hover:text-gray-900 transition-colors"
      >
        Tap untuk kembali ke Home
      </motion.button>
    </div>
  );
}

export default function QueuePage() {
  return (
    <Suspense fallback={
      <div className="flex items-center justify-center h-screen bg-background">
        <p className="text-2xl text-gray-400">Loading...</p>
      </div>
    }>
      <QueueContent />
    </Suspense>
  );
}
