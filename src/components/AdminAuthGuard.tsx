"use client";

import { useState, useEffect, ReactNode } from "react";
import { Lock, Eye, EyeOff, ShieldCheck } from "lucide-react";

interface AdminAuthGuardProps {
  children: ReactNode;
}

export default function AdminAuthGuard({ children }: AdminAuthGuardProps) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [pin, setPin] = useState("");
  const [error, setError] = useState("");
  const [showPin, setShowPin] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check if already authenticated in this session
    const authToken = sessionStorage.getItem("tn_admin_auth");
    if (authToken === "authenticated") {
      setIsAuthenticated(true);
    }
    setIsLoading(false);
  }, []);

  const getExpectedPin = () => {
    if (typeof window !== "undefined") {
      return localStorage.getItem("tn_admin_custom_pin") || "1234";
    }
    return "1234";
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const expectedPin = getExpectedPin();
    if (pin === expectedPin) {
      sessionStorage.setItem("tn_admin_auth", "authenticated");
      setIsAuthenticated(true);
      setError("");
    } else {
      setError("PIN salah! Coba lagi.");
      setPin("");
    }
  };

  const handleLogout = () => {
    sessionStorage.removeItem("tn_admin_auth");
    setIsAuthenticated(false);
    setPin("");
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-50">
        <div className="w-8 h-8 border-4 border-[#E53935] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 p-6">
        <div className="bg-white rounded-3xl shadow-2xl p-10 w-full max-w-sm text-center animate-in fade-in zoom-in-95 duration-200">
          {/* Logo */}
          <div className="w-20 h-20 bg-white rounded-3xl p-2 flex items-center justify-center mx-auto mb-4 shadow-md border-2 border-[#FBC02D]">
            <img src="/logo.png" alt="Logo Titik Ngunyah" className="w-full h-full object-contain" />
          </div>

          <h1 className="text-2xl font-black text-gray-900 tracking-tight mb-1">
            TITIK<span className="text-[#E53935]">NGUNYAH</span>
          </h1>
          <p className="text-gray-500 text-sm mb-6 font-medium">Masukkan PIN Admin untuk melanjutkan</p>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="relative">
              <input
                type={showPin ? "text" : "password"}
                value={pin}
                onChange={(e) => {
                  setPin(e.target.value.replace(/\D/g, "").slice(0, 6));
                  setError("");
                }}
                placeholder="••••"
                maxLength={6}
                autoFocus
                className="w-full text-center text-3xl font-black tracking-[0.4em] bg-gray-50 border-2 border-gray-200 rounded-2xl py-4 px-6 focus:outline-none focus:border-[#E53935] focus:ring-4 focus:ring-red-100 transition-all placeholder:text-gray-300"
              />
              <button
                type="button"
                onClick={() => setShowPin(!showPin)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors p-1"
              >
                {showPin ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>

            {error && (
              <p className="text-red-500 text-sm font-bold animate-pulse">{error}</p>
            )}

            <button
              type="submit"
              disabled={pin.length < 4}
              className="w-full bg-[#E53935] hover:bg-[#C62828] disabled:bg-gray-200 disabled:text-gray-400 disabled:cursor-not-allowed text-white py-4 rounded-2xl text-base font-bold shadow-xl shadow-red-500/20 transition-all active:scale-95 flex items-center justify-center gap-2"
            >
              <ShieldCheck size={20} />
              Masuk ke Admin
            </button>
          </form>

          <div className="mt-8 pt-6 border-t border-gray-100">
            <p className="text-xs text-gray-400">
              PIN default: <span className="font-bold text-gray-600 bg-gray-100 px-2 py-0.5 rounded">1234</span>
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (typeof window !== "undefined") {
    (window as any).__tn_admin_logout = handleLogout;
  }

  return <>{children}</>;
}
