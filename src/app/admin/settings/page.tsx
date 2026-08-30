"use client";

import { useState, useEffect } from "react";
import { 
  KeyRound, 
  Volume2, 
  VolumeX, 
  Store, 
  RefreshCw, 
  CheckCircle2, 
  AlertCircle, 
  Save, 
  RotateCcw,
  Sparkles,
  ShieldCheck,
  BellRing
} from "lucide-react";

export default function SettingsPage() {
  // 1. PIN Management State
  const [currentPin, setCurrentPin] = useState("");
  const [newPin, setNewPin] = useState("");
  const [confirmPin, setConfirmPin] = useState("");
  const [pinMessage, setPinMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  // 2. Sound notification setting
  const [soundEnabled, setSoundEnabled] = useState(true);

  // 3. Store info
  const [storeName, setStoreName] = useState("TITIK NGUNYAH");
  const [eventName, setEventName] = useState("Bazar Technopreneurship 2026");
  const [storeMessage, setStoreMessage] = useState<string | null>(null);

  // 4. Sync Database State
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncStatus, setSyncStatus] = useState<string | null>(null);

  useEffect(() => {
    // Load existing settings from localStorage
    if (typeof window !== "undefined") {
      const savedSound = localStorage.getItem("tn_sound_enabled");
      if (savedSound !== null) setSoundEnabled(savedSound === "true");

      const savedStoreName = localStorage.getItem("tn_store_name");
      if (savedStoreName) setStoreName(savedStoreName);

      const savedEventName = localStorage.getItem("tn_event_name");
      if (savedEventName) setEventName(savedEventName);
    }
  }, []);

  // Helper to play test audio tone
  const playTestSound = () => {
    try {
      const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = "sine";
      osc.frequency.setValueAtTime(587.33, ctx.currentTime); // D5
      osc.frequency.setValueAtTime(880, ctx.currentTime + 0.15); // A5
      gain.gain.setValueAtTime(0.3, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.4);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.45);
    } catch (e) {
      console.log("Audio not supported or blocked", e);
    }
  };

  const handleSoundToggle = (enabled: boolean) => {
    setSoundEnabled(enabled);
    localStorage.setItem("tn_sound_enabled", String(enabled));
    if (enabled) playTestSound();
  };

  const handleSavePin = (e: React.FormEvent) => {
    e.preventDefault();
    setPinMessage(null);

    const savedPin = localStorage.getItem("tn_admin_custom_pin") || "1234";

    if (currentPin !== savedPin) {
      setPinMessage({ type: "error", text: "PIN saat ini tidak sesuai!" });
      return;
    }

    if (newPin.length < 4) {
      setPinMessage({ type: "error", text: "PIN baru minimal 4 angka!" });
      return;
    }

    if (newPin !== confirmPin) {
      setPinMessage({ type: "error", text: "Konfirmasi PIN baru tidak cocok!" });
      return;
    }

    localStorage.setItem("tn_admin_custom_pin", newPin);
    setCurrentPin("");
    setNewPin("");
    setConfirmPin("");
    setPinMessage({ type: "success", text: "PIN Admin berhasil diperbarui!" });
    setTimeout(() => setPinMessage(null), 4000);
  };

  const handleResetPinDefault = () => {
    if (confirm("Reset PIN admin kembali ke default (1234)?")) {
      localStorage.removeItem("tn_admin_custom_pin");
      setCurrentPin("");
      setNewPin("");
      setConfirmPin("");
      setPinMessage({ type: "success", text: "PIN berhasil direset ke 1234." });
      setTimeout(() => setPinMessage(null), 4000);
    }
  };

  const handleSaveStoreInfo = (e: React.FormEvent) => {
    e.preventDefault();
    localStorage.setItem("tn_store_name", storeName);
    localStorage.setItem("tn_event_name", eventName);
    setStoreMessage("Informasi stand berhasil disimpan!");
    setTimeout(() => setStoreMessage(null), 3000);
  };

  const handleSyncFlyerMenu = async () => {
    if (!confirm("Sinkronkan semua menu ke 11 menu resmi Brosur & Banner Technopreneurship 2026?")) {
      return;
    }

    try {
      setIsSyncing(true);
      setSyncStatus(null);
      const res = await fetch("/api/menus/seed-flyer", { method: "POST" });
      const data = await res.json();
      if (res.ok) {
        setSyncStatus("✅ " + (data.message || "Menu berhasil disinkronkan ke TiDB Cloud!"));
      } else {
        setSyncStatus("❌ Gagal: " + (data.message || "Terjadi kesalahan"));
      }
    } catch (err: any) {
      setSyncStatus("❌ Error: " + err.message);
    } finally {
      setIsSyncing(false);
    }
  };

  const handleClearCache = () => {
    if (confirm("Bersihkan cache lokal keranjang dan antrean di browser ini?")) {
      localStorage.removeItem("titik-ngunyah-cart");
      alert("Cache berhasil dibersihkan!");
      window.location.reload();
    }
  };

  return (
    <div className="space-y-8 max-w-5xl">
      <div>
        <h2 className="text-3xl font-black text-gray-900 tracking-tight">Pengaturan Sistem</h2>
        <p className="text-gray-500 text-sm mt-1">Kelola keamanan admin, suara notifikasi, dan data stand bazar</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Card 1: Ganti PIN Admin */}
        <div className="bg-white p-7 rounded-3xl shadow-sm border border-gray-100 flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 rounded-2xl bg-red-50 text-[#E53935] flex items-center justify-center">
                <KeyRound size={24} />
              </div>
              <div>
                <h3 className="text-lg font-bold text-gray-900">Keamanan & PIN Admin</h3>
                <p className="text-xs text-gray-500">Ubah PIN untuk mengunci akses panel admin</p>
              </div>
            </div>

            <form onSubmit={handleSavePin} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
                  PIN Saat Ini
                </label>
                <input
                  type="password"
                  value={currentPin}
                  onChange={(e) => setCurrentPin(e.target.value.replace(/\D/g, "").slice(0, 6))}
                  placeholder="PIN lama (Default: 1234)"
                  maxLength={6}
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm font-semibold focus:outline-none focus:border-[#E53935] focus:ring-2 focus:ring-red-100"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
                    PIN Baru
                  </label>
                  <input
                    type="password"
                    value={newPin}
                    onChange={(e) => setNewPin(e.target.value.replace(/\D/g, "").slice(0, 6))}
                    placeholder="4-6 digit"
                    maxLength={6}
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm font-semibold focus:outline-none focus:border-[#E53935] focus:ring-2 focus:ring-red-100"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
                    Ulangi PIN
                  </label>
                  <input
                    type="password"
                    value={confirmPin}
                    onChange={(e) => setConfirmPin(e.target.value.replace(/\D/g, "").slice(0, 6))}
                    placeholder="4-6 digit"
                    maxLength={6}
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm font-semibold focus:outline-none focus:border-[#E53935] focus:ring-2 focus:ring-red-100"
                  />
                </div>
              </div>

              {pinMessage && (
                <div
                  className={`p-3.5 rounded-xl text-xs font-bold flex items-center gap-2 ${
                    pinMessage.type === "success"
                      ? "bg-green-50 text-green-700 border border-green-200"
                      : "bg-red-50 text-red-700 border border-red-200"
                  }`}
                >
                  {pinMessage.type === "success" ? <CheckCircle2 size={16} /> : <AlertCircle size={16} />}
                  {pinMessage.text}
                </div>
              )}

              <div className="flex items-center gap-3 pt-2">
                <button
                  type="submit"
                  className="flex-1 bg-[#E53935] hover:bg-[#C62828] text-white py-3 rounded-xl font-bold text-sm shadow-md transition-all active:scale-95 flex items-center justify-center gap-2"
                >
                  <Save size={16} />
                  Simpan PIN Baru
                </button>
                <button
                  type="button"
                  onClick={handleResetPinDefault}
                  title="Reset ke PIN default 1234"
                  className="bg-gray-100 hover:bg-gray-200 text-gray-700 p-3 rounded-xl font-bold text-sm transition-all"
                >
                  <RotateCcw size={16} />
                </button>
              </div>
            </form>
          </div>
        </div>

        {/* Card 2: Suara Notifikasi */}
        <div className="bg-white p-7 rounded-3xl shadow-sm border border-gray-100 flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center">
                <BellRing size={24} />
              </div>
              <div>
                <h3 className="text-lg font-bold text-gray-900">Audio Notifikasi Pesanan</h3>
                <p className="text-xs text-gray-500">Bunyi bell saat ada pesanan baru masuk di dapur</p>
              </div>
            </div>

            <div className="space-y-6">
              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-2xl border border-gray-100">
                <div className="flex items-center gap-3">
                  {soundEnabled ? (
                    <Volume2 className="text-green-600" size={24} />
                  ) : (
                    <VolumeX className="text-gray-400" size={24} />
                  )}
                  <div>
                    <p className="text-sm font-bold text-gray-900">
                      {soundEnabled ? "Suara Notifikasi Aktif" : "Suara Notifikasi Senyap"}
                    </p>
                    <p className="text-xs text-gray-500">
                      {soundEnabled ? "Bunyi chime berdering saat order baru tiba" : "Tidak ada suara"}
                    </p>
                  </div>
                </div>

                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    className="sr-only peer"
                    checked={soundEnabled}
                    onChange={(e) => handleSoundToggle(e.target.checked)}
                  />
                  <div className="w-12 h-7 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-6 after:w-6 after:transition-all peer-checked:bg-green-500"></div>
                </label>
              </div>

              <button
                type="button"
                onClick={playTestSound}
                className="w-full bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200 py-3 rounded-xl font-bold text-sm transition-all active:scale-95 flex items-center justify-center gap-2"
              >
                <Sparkles size={16} />
                Tes Bunyi Notifikasi
              </button>
            </div>
          </div>

          <p className="text-xs text-gray-400 mt-6">
            💡 Pastikan volume tablet / laptop admin dinyalakan agar suara terdengar jelas di stand bazar.
          </p>
        </div>

        {/* Card 3: Informasi Stand Bazar */}
        <div className="bg-white p-7 rounded-3xl shadow-sm border border-gray-100">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center">
              <Store size={24} />
            </div>
            <div>
              <h3 className="text-lg font-bold text-gray-900">Informasi Stand & Event</h3>
              <p className="text-xs text-gray-500">Label nama stand dan acara di sistem</p>
            </div>
          </div>

          <form onSubmit={handleSaveStoreInfo} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
                Nama Stand / Brand
              </label>
              <input
                type="text"
                value={storeName}
                onChange={(e) => setStoreName(e.target.value)}
                className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm font-semibold focus:outline-none focus:border-[#E53935] focus:ring-2 focus:ring-red-100"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
                Nama Acara / Bazar
              </label>
              <input
                type="text"
                value={eventName}
                onChange={(e) => setEventName(e.target.value)}
                className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm font-semibold focus:outline-none focus:border-[#E53935] focus:ring-2 focus:ring-red-100"
              />
            </div>

            {storeMessage && (
              <div className="p-3 rounded-xl bg-green-50 text-green-700 border border-green-200 text-xs font-bold flex items-center gap-2">
                <CheckCircle2 size={16} />
                {storeMessage}
              </div>
            )}

            <button
              type="submit"
              className="w-full bg-gray-900 hover:bg-black text-white py-3 rounded-xl font-bold text-sm shadow-md transition-all active:scale-95 flex items-center justify-center gap-2"
            >
              <Save size={16} />
              Simpan Info Stand
            </button>
          </form>
        </div>

        {/* Card 4: Manajemen Database & Data */}
        <div className="bg-white p-7 rounded-3xl shadow-sm border border-gray-100 flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 rounded-2xl bg-purple-50 text-purple-600 flex items-center justify-center">
                <RefreshCw size={24} />
              </div>
              <div>
                <h3 className="text-lg font-bold text-gray-900">Alat Data & Sinkronisasi</h3>
                <p className="text-xs text-gray-500">Aksi darurat dan pemeliharaan database</p>
              </div>
            </div>

            <div className="space-y-4">
              <div className="p-4 bg-gray-50 rounded-2xl border border-gray-100 space-y-3">
                <p className="text-sm font-bold text-gray-800">Sinkronkan 11 Menu Flyer</p>
                <p className="text-xs text-gray-500 leading-relaxed">
                  Gunakan tombol ini jika menu di kiosk teracak atau database TiDB Cloud perlu disinkronkan ulang ke 11 menu resmi brosur.
                </p>
                <button
                  type="button"
                  onClick={handleSyncFlyerMenu}
                  disabled={isSyncing}
                  className="w-full bg-amber-500 hover:bg-amber-600 disabled:bg-gray-300 text-white py-2.5 rounded-xl font-bold text-sm shadow-sm transition-all active:scale-95 flex items-center justify-center gap-2"
                >
                  <RefreshCw size={16} className={isSyncing ? "animate-spin" : ""} />
                  {isSyncing ? "Menyinkronkan..." : "⚡ Sinkronkan 11 Menu Flyer"}
                </button>
              </div>

              {syncStatus && (
                <div className="p-3 bg-gray-50 border border-gray-200 rounded-xl text-xs font-bold text-gray-700">
                  {syncStatus}
                </div>
              )}

              <button
                type="button"
                onClick={handleClearCache}
                className="w-full bg-gray-100 hover:bg-red-50 hover:text-red-600 text-gray-700 py-3 rounded-xl font-bold text-xs transition-all active:scale-95 border border-transparent hover:border-red-200"
              >
                🗑️ Bersihkan Cache Kiosk & Keranjang
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
