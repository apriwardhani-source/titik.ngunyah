"use client";

import { useState, useRef, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { SPIN_SECTORS, getRandomSpinPrize, SpinSector } from "@/lib/spinConfig";
import { Sparkles, Trophy, Gift, ArrowRight, Star, Flame } from "lucide-react";

interface SpinWheelModalProps {
  isOpen: boolean;
  onFinish: (reward: string) => void;
}

// Sound Synthesizer using Web Audio API (Zero external assets needed, ultra-fast & responsive)
class SoundFx {
  private ctx: AudioContext | null = null;

  private getCtx(): AudioContext | null {
    if (typeof window === "undefined") return null;
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (AudioCtx) this.ctx = new AudioCtx();
    }
    if (this.ctx && this.ctx.state === "suspended") {
      this.ctx.resume();
    }
    return this.ctx;
  }

  playTick(pitchShift = 0) {
    try {
      const ctx = this.getCtx();
      if (!ctx) return;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = "triangle";
      osc.frequency.setValueAtTime(700 + pitchShift, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(200, ctx.currentTime + 0.04);

      gain.gain.setValueAtTime(0.3, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.04);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start();
      osc.stop(ctx.currentTime + 0.045);
    } catch (_) {}
  }

  playWinFanfare(isJackpot = false) {
    try {
      const ctx = this.getCtx();
      if (!ctx) return;
      const notes = isJackpot 
        ? [523.25, 659.25, 783.99, 1046.50, 1318.51, 1567.98] // C5 E5 G5 C6 E6 G6
        : [523.25, 659.25, 783.99, 1046.50]; // C5 E5 G5 C6

      notes.forEach((freq, idx) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = isJackpot ? "sawtooth" : "sine";
        osc.frequency.setValueAtTime(freq, ctx.currentTime + idx * 0.1);

        gain.gain.setValueAtTime(0, ctx.currentTime + idx * 0.1);
        gain.gain.linearRampToValueAtTime(0.3, ctx.currentTime + idx * 0.1 + 0.03);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + idx * 0.1 + 0.4);

        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.start(ctx.currentTime + idx * 0.1);
        osc.stop(ctx.currentTime + idx * 0.1 + 0.45);
      });
    } catch (_) {}
  }
}

const sfx = new SoundFx();

export default function SpinWheelModal({ isOpen, onFinish }: SpinWheelModalProps) {
  const [isSpinning, setIsSpinning] = useState(false);
  const [rotation, setRotation] = useState(0);
  const [wonSector, setWonSector] = useState<SpinSector | null>(null);
  const [showPrizeModal, setShowPrizeModal] = useState(false);
  const [pointerWobble, setPointerWobble] = useState(0);
  const [ledPattern, setLedPattern] = useState(0);

  const numSectors = SPIN_SECTORS.length;
  const sectorAngle = 360 / numSectors; // 60 deg each

  // LED Bulbs animation around the rim
  useEffect(() => {
    if (!isOpen) return;
    const interval = setInterval(() => {
      setLedPattern((prev) => (prev + 1) % 2);
    }, isSpinning ? 100 : 400);
    return () => clearInterval(interval);
  }, [isOpen, isSpinning]);

  const handleStartSpin = () => {
    if (isSpinning) return;
    setIsSpinning(true);

    // 1. Pick prize based on profit-optimized weighted probabilities
    const { sector, index } = getRandomSpinPrize();

    // 2. Calculate target rotation
    // Pointer is at the top (0 deg / 12 o'clock).
    // Sector i center is at `i * sectorAngle + sectorAngle / 2`.
    const baseTargetAngle = 360 - (index * sectorAngle + sectorAngle / 2);
    const randomOffset = (Math.random() - 0.5) * (sectorAngle * 0.5);
    
    // Add 8 full 360 rotations for intense excitement
    const totalExtraRotations = 360 * 8;
    const finalRotation = rotation + totalExtraRotations + (baseTargetAngle - (rotation % 360)) + randomOffset;

    setRotation(finalRotation);

    // 3. Audio Tick interval simulation
    let currentDeg = rotation;
    const totalDiff = finalRotation - rotation;
    const duration = 5000;
    const startTime = performance.now();

    const tickAudioLoop = (now: number) => {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);
      // Cubic bezier ease-out approximation: 1 - (1 - p)^4
      const easeOut = 1 - Math.pow(1 - progress, 4);
      const newDeg = rotation + totalDiff * easeOut;

      // Check if we crossed a sector boundary
      const prevSector = Math.floor(currentDeg / sectorAngle);
      const nextSector = Math.floor(newDeg / sectorAngle);

      if (nextSector > prevSector) {
        sfx.playTick(Math.random() * 150);
        // Wobble the top pointer
        setPointerWobble(18);
        setTimeout(() => setPointerWobble(0), 60);
      }

      currentDeg = newDeg;

      if (progress < 1) {
        requestAnimationFrame(tickAudioLoop);
      }
    };

    requestAnimationFrame(tickAudioLoop);

    // 4. Reveal result after 5.2s
    setTimeout(() => {
      setIsSpinning(false);
      setWonSector(sector);
      setShowPrizeModal(true);
      sfx.playWinFanfare(sector.isJackpot);
    }, 5200);
  };

  const handleClaim = () => {
    if (wonSector) {
      onFinish(wonSector.badgeText);
    }
  };

  if (!isOpen) return null;

  // 16 Decorative LED bulbs around the perimeter
  const numLeds = 16;
  const leds = Array.from({ length: numLeds });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/90 backdrop-blur-lg select-none font-sans overflow-hidden">
      {/* Background Animated Floating Stars / Glow */}
      <div className="absolute -top-20 -left-20 w-80 h-80 bg-[#ffde59]/20 rounded-full blur-3xl pointer-events-none animate-pulse" />
      <div className="absolute -bottom-20 -right-20 w-80 h-80 bg-[#b80000]/30 rounded-full blur-3xl pointer-events-none animate-pulse" />

      <motion.div
        initial={{ scale: 0.8, opacity: 0, y: 30 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        transition={{ type: "spring", damping: 20, stiffness: 260 }}
        className="relative bg-gradient-to-b from-[#2A0808] via-[#1A0000] to-[#0D0000] rounded-[3rem] p-5 sm:p-7 max-w-md w-full text-center border-4 border-[#ffde59] shadow-[0_0_50px_rgba(255,222,89,0.4)] flex flex-col items-center text-white"
      >
        {/* Shiny Top Arcade Header Pill */}
        <motion.div 
          animate={{ scale: [1, 1.04, 1] }}
          transition={{ repeat: Infinity, duration: 2 }}
          className="flex items-center gap-2 bg-gradient-to-r from-[#b80000] via-[#ffde59] to-[#b80000] p-[2px] rounded-full shadow-lg mb-3"
        >
          <div className="bg-[#1A0000] px-5 py-1.5 rounded-full flex items-center gap-2 text-[#ffde59] font-black text-xs sm:text-sm uppercase tracking-widest">
            <Sparkles size={16} className="text-[#ffde59] animate-spin" />
            <span>RODA KEBERUNTUNGAN</span>
            <Sparkles size={16} className="text-[#ffde59] animate-spin" />
          </div>
        </motion.div>

        <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight drop-shadow-md">
          PUTAR & <span className="text-[#ffde59]">MENANGKAN!</span>
        </h2>
        <p className="text-xs sm:text-sm text-amber-200/90 font-semibold mt-0.5 mb-3">
          Raih <strong>Jackpot 1 Kebab Daging</strong>, Es Teh, atau Hadiah Manis!
        </p>

        {/* ====================================================
            THE ULTIMATE ARCADE WHEEL CASINO DISPLAY
            ==================================================== */}
        <div className="relative w-72 h-72 sm:w-80 sm:h-80 my-1 flex items-center justify-center">
          
          {/* Top Pointer Needle with 3D Shadow & Dynamic Wobble Physics */}
          <div 
            className="absolute -top-3 z-40 flex flex-col items-center filter drop-shadow-[0_5px_10px_rgba(0,0,0,0.8)] transition-transform duration-75 origin-top"
            style={{ transform: `rotate(${pointerWobble}deg)` }}
          >
            {/* Pointer Arrow Head */}
            <div className="w-0 h-0 border-l-[16px] border-l-transparent border-r-[16px] border-r-transparent border-t-[34px] border-t-[#ffde59]" />
            <div className="w-0 h-0 border-l-[11px] border-l-transparent border-r-[11px] border-r-transparent border-t-[26px] border-t-[#b80000] -mt-[31px]" />
            {/* Center Pivot of Pointer */}
            <div className="w-5 h-5 rounded-full bg-gradient-to-br from-[#ffde59] to-amber-600 border-2 border-white shadow-md -mt-6" />
          </div>

          {/* Outer Gold Bezel with Flashing Neon LED Bulbs */}
          <div className="absolute inset-0 rounded-full border-[12px] border-gradient-to-r from-amber-400 via-[#ffde59] to-amber-600 shadow-[0_0_30px_rgba(255,222,89,0.6),inset_0_0_20px_rgba(0,0,0,0.8)] bg-[#2e0505] p-1">
            {/* Render 16 perimeter LED lights */}
            {leds.map((_, i) => {
              const angle = (i * 360) / numLeds;
              const isLit = (i + ledPattern) % 2 === 0;
              const rad = ((angle - 90) * Math.PI) / 180;
              // Circle radius is around 47% from center
              const x = 50 + 47 * Math.cos(rad);
              const y = 50 + 47 * Math.sin(rad);

              return (
                <div
                  key={i}
                  className={`absolute w-3 h-3 rounded-full transform -translate-x-1/2 -translate-y-1/2 transition-colors duration-150 border border-black/50 ${
                    isLit
                      ? "bg-[#ffde59] shadow-[0_0_8px_#ffde59]"
                      : "bg-white/40 shadow-none"
                  }`}
                  style={{ left: `${x}%`, top: `${y}%` }}
                />
              );
            })}
          </div>

          {/* ROTATING WHEEL SVG */}
          <div
            className="w-[88%] h-[88%] rounded-full overflow-hidden shadow-2xl relative z-10"
            style={{
              transform: `rotate(${rotation}deg)`,
              transition: isSpinning ? "transform 5.2s cubic-bezier(0.12, 0.95, 0.18, 1)" : "none",
            }}
          >
            <svg viewBox="0 0 400 400" className="w-full h-full filter drop-shadow-lg">
              <defs>
                {/* 3D Radial Highlighting for Rich Arcade Look */}
                <radialGradient id="wheelShine" cx="50%" cy="50%" r="50%">
                  <stop offset="0%" stopColor="#ffffff" stopOpacity="0.35" />
                  <stop offset="70%" stopColor="#000000" stopOpacity="0.0" />
                  <stop offset="100%" stopColor="#000000" stopOpacity="0.45" />
                </radialGradient>

                {/* Slices Gradients */}
                <linearGradient id="grad-red" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#d90429" />
                  <stop offset="100%" stopColor="#7a0000" />
                </linearGradient>
                <linearGradient id="grad-gold" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#ffde59" />
                  <stop offset="100%" stopColor="#d97706" />
                </linearGradient>
                <linearGradient id="grad-green" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#10b981" />
                  <stop offset="100%" stopColor="#047857" />
                </linearGradient>
                <linearGradient id="grad-orange" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#fb923c" />
                  <stop offset="100%" stopColor="#c2410c" />
                </linearGradient>
                <linearGradient id="grad-purple" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#ec4899" />
                  <stop offset="100%" stopColor="#831843" />
                </linearGradient>
                <linearGradient id="grad-blue" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#38bdf8" />
                  <stop offset="100%" stopColor="#0284c7" />
                </linearGradient>
              </defs>

              {SPIN_SECTORS.map((sector, i) => {
                const startAngle = i * sectorAngle;
                const endAngle = startAngle + sectorAngle;
                const r = 200;
                const cx = 200;
                const cy = 200;

                const startRad = ((startAngle - 90) * Math.PI) / 180;
                const endRad = ((endAngle - 90) * Math.PI) / 180;

                const x1 = cx + r * Math.cos(startRad);
                const y1 = cy + r * Math.sin(startRad);
                const x2 = cx + r * Math.cos(endRad);
                const y2 = cy + r * Math.sin(endRad);

                const d = `M ${cx} ${cy} L ${x1} ${y1} A ${r} ${r} 0 0 1 ${x2} ${y2} Z`;
                const textAngle = startAngle + sectorAngle / 2;

                const gradId = 
                  i === 0 ? "url(#grad-red)" :
                  i === 1 ? "url(#grad-gold)" :
                  i === 2 ? "url(#grad-green)" :
                  i === 3 ? "url(#grad-orange)" :
                  i === 4 ? "url(#grad-purple)" : "url(#grad-blue)";

                return (
                  <g key={sector.id}>
                    {/* Wedge Slice with metallic border */}
                    <path
                      d={d}
                      fill={gradId}
                      stroke="#ffe484"
                      strokeWidth="3.5"
                    />

                    {/* Sector Text & Icon */}
                    <g transform={`rotate(${textAngle}, ${cx}, ${cy})`}>
                      {/* Sector Icon (Large) */}
                      <text
                        x={cx}
                        y={cy - 128}
                        fontSize="28"
                        textAnchor="middle"
                        dominantBaseline="middle"
                      >
                        {sector.icon}
                      </text>

                      {/* Sector Label (Bold) */}
                      <text
                        x={cx}
                        y={cy - 92}
                        fill={sector.textColor === "#ffde59" ? "#ffffff" : sector.textColor}
                        fontSize="14"
                        fontWeight="900"
                        letterSpacing="1"
                        textAnchor="middle"
                        dominantBaseline="middle"
                        fontFamily="system-ui, sans-serif"
                        filter="drop-shadow(0 2px 3px rgba(0,0,0,0.8))"
                      >
                        {sector.shortLabel}
                      </text>

                      {/* Special Jackpot Tag for Kebab */}
                      {sector.isJackpot && (
                        <text
                          x={cx}
                          y={cy - 72}
                          fill="#ffde59"
                          fontSize="9"
                          fontWeight="900"
                          letterSpacing="0.5"
                          textAnchor="middle"
                          dominantBaseline="middle"
                        >
                          ⭐ JACKPOT ⭐
                        </text>
                      )}
                    </g>
                  </g>
                );
              })}

              {/* 3D Radial Highlight Overlay */}
              <circle cx="200" cy="200" r="200" fill="url(#wheelShine)" pointerEvents="none" />
            </svg>
          </div>

          {/* Center Hub: Metallic Gold Dome with Brand Logo & Pulse */}
          <div className="absolute z-30 w-20 h-20 rounded-full bg-gradient-to-b from-[#ffde59] via-amber-400 to-amber-700 p-1.5 shadow-[0_0_20px_rgba(0,0,0,0.8),inset_0_2px_4px_rgba(255,255,255,0.8)] flex items-center justify-center pointer-events-none">
            <div className="w-full h-full rounded-full bg-[#1A0000] border-2 border-[#ffde59] flex items-center justify-center p-2 shadow-inner">
              <img src="/logo.png" alt="Logo" className="w-full h-full object-contain filter drop-shadow" />
            </div>
          </div>
        </div>

        {/* Action Button: Glowing Pulsating Arcade Button */}
        <div className="w-full mt-4">
          <button
            onClick={handleStartSpin}
            disabled={isSpinning}
            className={`group relative w-full py-4 px-6 rounded-2xl text-xl sm:text-2xl font-black transition-all duration-300 flex items-center justify-center gap-3 overflow-hidden border-2 ${
              isSpinning
                ? "bg-gray-700/80 text-gray-400 border-gray-600 cursor-not-allowed"
                : "bg-gradient-to-r from-[#ffde59] via-[#facc15] to-[#fbbf24] text-[#b80000] border-white hover:scale-105 active:scale-95 shadow-[0_0_25px_rgba(255,222,89,0.5)]"
            }`}
          >
            {/* Shiny light reflection animation across button */}
            {!isSpinning && (
              <span className="absolute top-0 left-0 w-full h-full bg-gradient-to-r from-transparent via-white/40 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
            )}

            {isSpinning ? (
              <span className="flex items-center gap-3">
                <svg className="animate-spin h-6 w-6 text-amber-400" viewBox="0 0 24 24" fill="none">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                </svg>
                <span>MEMUTAR RODA...</span>
              </span>
            ) : (
              <>
                <Flame size={28} className="text-[#b80000] animate-bounce" />
                <span>PUTAR SEKARANG!</span>
                <Flame size={28} className="text-[#b80000] animate-bounce" />
              </>
            )}
          </button>
        </div>

        {/* ====================================================
            CONFETTI & VICTORY PRIZE REVEAL MODAL
            ==================================================== */}
        <AnimatePresence>
          {showPrizeModal && wonSector && (
            <div className="absolute inset-0 z-50 bg-black/95 backdrop-blur-md flex flex-col items-center justify-center p-5 text-center overflow-hidden">
              
              {/* Confetti Explosion Shower */}
              <div className="absolute inset-0 pointer-events-none overflow-hidden">
                {Array.from({ length: 40 }).map((_, i) => (
                  <motion.div
                    key={i}
                    initial={{
                      x: "50%",
                      y: "50%",
                      scale: 0,
                      rotate: 0,
                    }}
                    animate={{
                      x: `${(Math.random() - 0.5) * 100}%`,
                      y: `${(Math.random() - 0.5) * 100}%`,
                      scale: [0, 1.2, 0.8],
                      rotate: Math.random() * 720,
                    }}
                    transition={{
                      duration: 2.5 + Math.random() * 1.5,
                      repeat: Infinity,
                      ease: "easeOut",
                    }}
                    className={`absolute w-3.5 h-3.5 rounded-sm ${
                      ["bg-[#ffde59]", "bg-[#b80000]", "bg-emerald-400", "bg-sky-400", "bg-purple-400"][i % 5]
                    }`}
                    style={{
                      left: `${50 + (Math.random() - 0.5) * 80}%`,
                      top: `${50 + (Math.random() - 0.5) * 80}%`,
                    }}
                  />
                ))}
              </div>

              <motion.div
                initial={{ scale: 0.4, opacity: 0, y: 30 }}
                animate={{ scale: 1, opacity: 1, y: 0 }}
                exit={{ scale: 0.4, opacity: 0 }}
                transition={{ type: "spring", damping: 18, stiffness: 280 }}
                className="relative bg-gradient-to-b from-[#FFFDF0] to-[#FFFBEB] rounded-[2.5rem] p-6 w-full max-w-sm border-4 border-[#ffde59] shadow-[0_0_50px_rgba(255,222,89,0.6)] flex flex-col items-center text-gray-900"
              >
                {/* Big Animated Icon */}
                <motion.div 
                  animate={{ scale: [1, 1.15, 1], rotate: [0, 5, -5, 0] }}
                  transition={{ repeat: Infinity, duration: 1.5 }}
                  className={`w-24 h-24 rounded-full flex items-center justify-center text-6xl mb-3 shadow-inner border-4 ${
                    wonSector.isJackpot 
                      ? "bg-gradient-to-br from-amber-200 to-yellow-400 border-[#b80000]" 
                      : "bg-red-50 border-red-200"
                  }`}
                >
                  {wonSector.icon}
                </motion.div>

                {/* Pill Title */}
                <div className="bg-[#b80000] text-[#ffde59] px-4 py-1 rounded-full text-xs font-black uppercase tracking-wider mb-2 shadow-sm">
                  {wonSector.isJackpot ? "🎉 JACKPOT UTAMA! 🎉" : "✨ SELAMAT! KAMU DAPAT ✨"}
                </div>

                <h3 className="text-3xl sm:text-4xl font-black text-gray-900 leading-tight">
                  {wonSector.label}
                </h3>

                <p className="text-xs sm:text-sm text-gray-600 font-semibold my-2 px-2">
                  {wonSector.desc}
                </p>

                <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-2.5 text-xs font-bold text-emerald-800 w-full mb-4 flex items-center justify-center gap-1.5">
                  <span>✅</span>
                  <span>Hadiah otomatis terhubung ke pesanan dapur!</span>
                </div>

                {/* Claim Button */}
                <button
                  onClick={handleClaim}
                  className="w-full bg-[#b80000] hover:bg-[#940000] text-[#ffde59] py-4 rounded-2xl font-black text-lg shadow-xl transition-all active:scale-95 flex items-center justify-center gap-2 border-2 border-[#ffde59]"
                >
                  <span>Dapatkan Nomor Antrean</span>
                  <ArrowRight size={20} />
                </button>
              </motion.div>
            </div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
}
