"use client";

import { useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { SPIN_SECTORS, getRandomSpinPrize, SpinSector } from "@/lib/spinConfig";
import { Sparkles, Trophy, Gift, ArrowRight } from "lucide-react";

interface SpinWheelModalProps {
  isOpen: boolean;
  onFinish: (reward: string) => void;
}

export default function SpinWheelModal({ isOpen, onFinish }: SpinWheelModalProps) {
  const [isSpinning, setIsSpinning] = useState(false);
  const [rotation, setRotation] = useState(0);
  const [wonSector, setWonSector] = useState<SpinSector | null>(null);
  const [showPrizeModal, setShowPrizeModal] = useState(false);

  const numSectors = SPIN_SECTORS.length;
  const sectorAngle = 360 / numSectors; // 60 deg each

  const handleStartSpin = () => {
    if (isSpinning) return;
    setIsSpinning(true);

    // 1. Pick prize based on profit-optimized weighted probabilities
    const { sector, index } = getRandomSpinPrize();

    // 2. Calculate target rotation
    // Pointer is at the top (0 deg / 12 o'clock).
    // Sector i center is at `i * sectorAngle + sectorAngle / 2`.
    // To land on sector i at top: rotation % 360 = 360 - (i * sectorAngle + sectorAngle / 2)
    const baseTargetAngle = 360 - (index * sectorAngle + sectorAngle / 2);
    // Add slight random offset within sector (-18 to +18 deg)
    const randomOffset = (Math.random() - 0.5) * (sectorAngle * 0.6);
    
    // Add 5 to 7 full 360 rotations
    const totalExtraRotations = 360 * 6;
    const finalRotation = rotation + totalExtraRotations + (baseTargetAngle - (rotation % 360)) + randomOffset;

    setRotation(finalRotation);

    // 3. Reveal result after 4.5s
    setTimeout(() => {
      setIsSpinning(false);
      setWonSector(sector);
      setShowPrizeModal(true);
    }, 4600);
  };

  const handleClaim = () => {
    if (wonSector) {
      onFinish(wonSector.badgeText);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/85 backdrop-blur-md select-none font-sans">
      <motion.div
        initial={{ scale: 0.85, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        className="relative bg-gradient-to-b from-[#FFFDF0] to-[#FFFBEB] rounded-[2.5rem] p-5 sm:p-7 max-w-md w-full text-center border-4 border-[#ffde59] shadow-2xl overflow-hidden flex flex-col items-center"
      >
        {/* Top Header Badge */}
        <div className="flex items-center gap-2 bg-[#b80000] text-[#ffde59] px-4 py-1.5 rounded-full font-black text-xs uppercase tracking-wider mb-2 shadow-md border border-white/30">
          <Sparkles size={16} />
          <span>Lucky Spin Titik Ngunyah</span>
          <Sparkles size={16} />
        </div>

        <h2 className="text-2xl sm:text-3xl font-black text-gray-900 leading-tight">
          Putar & Raih Hadiahmu!
        </h2>
        <p className="text-xs sm:text-sm text-gray-600 font-medium mt-0.5 mb-4">
          Tekan tombol putar di bawah untuk memutar roda keberuntungan
        </p>

        {/* WHEEL CONTAINER */}
        <div className="relative w-64 h-64 sm:w-72 sm:h-72 my-2 flex items-center justify-center">
          {/* Top Pointer Arrow */}
          <div className="absolute -top-3 z-30 flex flex-col items-center">
            <div className="w-0 h-0 border-l-[14px] border-l-transparent border-r-[14px] border-r-transparent border-t-[26px] border-t-[#b80000] filter drop-shadow-md" />
            <div className="w-3.5 h-3.5 rounded-full bg-[#ffde59] border-2 border-[#b80000] -mt-5" />
          </div>

          {/* Outer Decorative Ring */}
          <div className="absolute inset-0 rounded-full border-8 border-[#ffde59] shadow-2xl bg-amber-900/10 pointer-events-none z-10" />

          {/* Rotating SVG Wheel */}
          <div
            className="w-full h-full rounded-full overflow-hidden shadow-inner"
            style={{
              transform: `rotate(${rotation}deg)`,
              transition: isSpinning ? "transform 4.5s cubic-bezier(0.15, 0.9, 0.2, 1)" : "none",
            }}
          >
            <svg viewBox="0 0 300 300" className="w-full h-full">
              {SPIN_SECTORS.map((sector, i) => {
                const startAngle = i * sectorAngle;
                const endAngle = startAngle + sectorAngle;

                // Trig coordinates on 300x300 circle (radius = 150, center = 150, 150)
                const r = 150;
                const cx = 150;
                const cy = 150;

                const startRad = ((startAngle - 90) * Math.PI) / 180;
                const endRad = ((endAngle - 90) * Math.PI) / 180;

                const x1 = cx + r * Math.cos(startRad);
                const y1 = cy + r * Math.sin(startRad);
                const x2 = cx + r * Math.cos(endRad);
                const y2 = cy + r * Math.sin(endRad);

                const d = `M ${cx} ${cy} L ${x1} ${y1} A ${r} ${r} 0 0 1 ${x2} ${y2} Z`;
                const textAngle = startAngle + sectorAngle / 2;

                return (
                  <g key={sector.id}>
                    {/* Wedge Slice */}
                    <path
                      d={d}
                      fill={sector.color}
                      stroke="#ffffff"
                      strokeWidth="2.5"
                    />

                    {/* Sector Text & Icon */}
                    <g transform={`rotate(${textAngle}, ${cx}, ${cy})`}>
                      <text
                        x={cx}
                        y={cy - 90}
                        fill={sector.textColor}
                        fontSize="11"
                        fontWeight="900"
                        textAnchor="middle"
                        dominantBaseline="middle"
                        fontFamily="sans-serif"
                      >
                        {sector.icon} {sector.shortLabel}
                      </text>
                    </g>
                  </g>
                );
              })}
            </svg>
          </div>

          {/* Center Hub Logo / Pin */}
          <div className="absolute z-20 w-16 h-16 rounded-full bg-white border-4 border-[#ffde59] shadow-xl flex items-center justify-center p-1.5 pointer-events-none">
            <img src="/logo.png" alt="Logo" className="w-full h-full object-contain" />
          </div>
        </div>

        {/* Spin Button */}
        <div className="w-full mt-4">
          <button
            onClick={handleStartSpin}
            disabled={isSpinning}
            className={`w-full py-4 px-6 rounded-2xl text-xl font-black shadow-xl transition-all border-2 border-[#ffde59] flex items-center justify-center gap-2 ${
              isSpinning
                ? "bg-gray-400 text-white cursor-not-allowed"
                : "bg-[#b80000] hover:bg-[#940000] text-[#ffde59] hover:scale-105 active:scale-95 shadow-red-900/30"
            }`}
          >
            {isSpinning ? (
              <span className="flex items-center gap-2">
                <svg className="animate-spin h-6 w-6 text-[#ffde59]" viewBox="0 0 24 24" fill="none">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                </svg>
                Memutar Roda...
              </span>
            ) : (
              <>
                <Gift size={24} />
                <span>PUTAR SEKARANG!</span>
              </>
            )}
          </button>
        </div>

        {/* PRIZE REVEAL MODAL */}
        <AnimatePresence>
          {showPrizeModal && wonSector && (
            <div className="absolute inset-0 z-40 bg-black/90 backdrop-blur-md flex flex-col items-center justify-center p-6 text-center">
              <motion.div
                initial={{ scale: 0.5, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.5, opacity: 0 }}
                className="bg-white rounded-3xl p-6 w-full border-4 border-[#ffde59] shadow-2xl flex flex-col items-center"
              >
                {/* Winner Header Icon */}
                <div className={`w-20 h-20 rounded-full flex items-center justify-center text-5xl mb-3 shadow-inner border-2 ${
                  wonSector.isJackpot ? "bg-amber-100 border-[#ffde59]" : "bg-red-50 border-red-200"
                }`}>
                  {wonSector.icon}
                </div>

                <div className="inline-block bg-[#ffde59] text-[#b80000] px-4 py-1 rounded-full text-xs font-black uppercase tracking-wider mb-2">
                  {wonSector.isJackpot ? "🎉 JACKPOT SPESIAL 🎉" : "✨ HADIAH KAMU ✨"}
                </div>

                <h3 className="text-2xl sm:text-3xl font-black text-gray-900 leading-tight">
                  {wonSector.label}
                </h3>

                <p className="text-xs sm:text-sm text-gray-600 font-medium my-2">
                  {wonSector.desc}
                </p>

                <div className="bg-amber-50 border border-amber-200 rounded-xl p-2.5 text-[11px] font-bold text-amber-900 w-full mb-4">
                  💡 Hadiah sudah otomatis tercatat di dapur & kasir stand!
                </div>

                <button
                  onClick={handleClaim}
                  className="w-full bg-[#b80000] hover:bg-[#940000] text-[#ffde59] py-3.5 rounded-2xl font-black text-base shadow-lg transition-all active:scale-95 flex items-center justify-center gap-2 border-2 border-[#ffde59]"
                >
                  <span>Lihat Nomor Antrean</span>
                  <ArrowRight size={18} />
                </button>
              </motion.div>
            </div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
}
