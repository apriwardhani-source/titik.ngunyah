"use client";

import { useState, useEffect } from "react";
import { useOrderStore, Order } from "@/store/useOrderStore";
import { useMenuStore } from "@/store/useMenuStore";
import { getStatusColor, formatPrice } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";
import {
  ChefHat,
  Clock,
  CheckCircle,
  AlertCircle,
  RotateCw,
  Search,
  LayoutGrid,
  List,
  Utensils,
  Coffee,
  Flame,
  User,
  CreditCard,
  Banknote,
  Trash2,
  XCircle,
  Ban,
  Phone,
  ArrowRight,
  X,
  Gift,
  Sparkles,
  Plus,
  ShoppingBag,
  Tag,
  Check
} from "lucide-react";

export default function OrdersPage() {
  const { orders, updateOrderStatus, deleteOrder, fetchOrders } = useOrderStore();
  const { products, fetchMenus } = useMenuStore();

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("Aktif");
  const [viewMode, setViewMode] = useState<"kitchen" | "table">("kitchen");
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const prevOrderCountRef = useState<number>(0);
  const statuses = ["Menunggu", "Dibayar", "Disiapkan", "Siap", "Selesai", "Dibatalkan"];

  // State Modal Catat Pre-Order / Manual
  const [isManualModalOpen, setIsManualModalOpen] = useState(false);
  const [manualCustomerName, setManualCustomerName] = useState("");
  const [manualCustomerPhone, setManualCustomerPhone] = useState("");
  const [manualNotes, setManualNotes] = useState("");
  const [manualPaymentMethod, setManualPaymentMethod] = useState<"cash" | "qris">("cash");
  const [manualInitialStatus, setManualInitialStatus] = useState<"waiting_payment" | "waiting_for_kitchen" | "preparing">("waiting_for_kitchen");
  const [manualCart, setManualCart] = useState<{ [productId: string]: { qty: number; notes: string } }>({});
  const [isSubmittingManual, setIsSubmittingManual] = useState(false);
  const [manualError, setManualError] = useState<string | null>(null);

  // Helper to play chime sound when a new order arrives
  const playOrderChime = () => {
    try {
      const soundEnabled = localStorage.getItem("tn_sound_enabled");
      if (soundEnabled === "false") return;
      const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = "sine";
      osc.frequency.setValueAtTime(587.33, ctx.currentTime); // D5
      osc.frequency.setValueAtTime(880, ctx.currentTime + 0.15); // A5
      gain.gain.setValueAtTime(0.35, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.4);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.45);
    } catch (e) {
      console.log("Audio alert not permitted yet", e);
    }
  };

  // Polling auto-refresh every 5 seconds for live orders
  useEffect(() => {
    fetchOrders();
    fetchMenus(true);
    const interval = setInterval(() => {
      fetchOrders();
    }, 5000);

    return () => clearInterval(interval);
  }, [fetchOrders, fetchMenus]);

  // Check for new orders to trigger chime
  useEffect(() => {
    if (orders.length > 0) {
      if (prevOrderCountRef[0] > 0 && orders.length > prevOrderCountRef[0]) {
        playOrderChime();
      }
      prevOrderCountRef[1](orders.length);
    }
  }, [orders]);

  const handleManualRefresh = async () => {
    setIsRefreshing(true);
    await fetchOrders();
    setTimeout(() => setIsRefreshing(false), 500);
  };

  const handleCancelOrder = async (orderId: string) => {
    if (confirm(`Yakin ingin MEMBATALKAN pesanan ${orderId}?`)) {
      await updateOrderStatus(orderId, "Dibatalkan");
      if (selectedOrder && selectedOrder.id === orderId) {
        setSelectedOrder(null);
      }
    }
  };

  const handleDeleteOrder = async (orderId: string) => {
    if (confirm(`Yakin ingin MENGHAPUS pesanan ${orderId} secara PERMANEN dari database? Tindakan ini tidak dapat dibatalkan.`)) {
      await deleteOrder(orderId);
      if (selectedOrder && selectedOrder.id === orderId) {
        setSelectedOrder(null);
      }
    }
  };

  // Helper function for manual pre-order cart
  const updateManualItemQty = (prodId: string | number, delta: number) => {
    const key = String(prodId);
    setManualCart((prev) => {
      const current = prev[key] || { qty: 0, notes: "" };
      const newQty = Math.max(0, current.qty + delta);
      if (newQty === 0) {
        const copy = { ...prev };
        delete copy[key];
        return copy;
      }
      return {
        ...prev,
        [key]: { ...current, qty: newQty },
      };
    });
  };

  const updateManualItemNotes = (prodId: string | number, notes: string) => {
    const key = String(prodId);
    setManualCart((prev) => {
      const current = prev[key] || { qty: 1, notes: "" };
      return {
        ...prev,
        [key]: { ...current, notes },
      };
    });
  };

  const calculateManualTotal = () => {
    return Object.entries(manualCart).reduce((sum, [prodId, data]) => {
      const prod = products.find((p) => String(p.id) === prodId);
      return sum + (prod ? prod.price * data.qty : 0);
    }, 0);
  };

  const handleCreateManualOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    setManualError(null);

    const cartEntries = Object.entries(manualCart);
    if (cartEntries.length === 0) {
      setManualError("Pilih minimal 1 menu untuk dicatat.");
      return;
    }

    setIsSubmittingManual(true);

    try {
      const itemsPayload = cartEntries.map(([prodId, data]) => {
        const prod = products.find((p) => String(p.id) === prodId);
        const itemNote = [data.notes, manualNotes].filter(Boolean).join(" | ");
        return {
          menu_id: Number(prodId),
          qty: data.qty,
          price: prod?.price || 0,
          notes: itemNote || null,
        };
      });

      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          customer_name: manualCustomerName.trim() || "Pre-Order Stand",
          customer_phone: manualCustomerPhone.trim() || null,
          customer_photo: null,
          payment_method: manualPaymentMethod,
          has_spin: false,
          items: itemsPayload,
        }),
      });

      const resData = await res.json();
      if (!res.ok || resData.status === "error") {
        throw new Error(resData.message || "Gagal membuat pesanan manual");
      }

      // If initial status is not default, update status
      if (manualInitialStatus !== "waiting_for_kitchen" && manualPaymentMethod !== "cash") {
        let targetFrontStatus = "Dibayar";
        if (manualInitialStatus === "waiting_payment") targetFrontStatus = "Menunggu";
        if (manualInitialStatus === "preparing") targetFrontStatus = "Disiapkan";
        if (resData.data?.id) {
          await updateOrderStatus(resData.data.queue_number || resData.data.id, targetFrontStatus);
        }
      }

      await fetchOrders();
      // Reset form
      setManualCart({});
      setManualCustomerName("");
      setManualCustomerPhone("");
      setManualNotes("");
      setIsManualModalOpen(false);
    } catch (err: any) {
      setManualError(err.message || "Terjadi kesalahan saat menyimpan pesanan.");
    } finally {
      setIsSubmittingManual(false);
    }
  };

  // Helper initial badge
  const getCustomerInitial = (name: string) => {
    if (!name) return "P";
    const parts = name.trim().split(" ");
    if (parts.length >= 2) return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
    return name.substring(0, 2).toUpperCase();
  };

  const isCustomCustomer = (name: string) => {
    const lower = (name || "").toLowerCase().trim();
    return lower !== "pelanggan kiosk" && lower !== "guest" && lower !== "guest kiosk" && lower !== "";
  };

  // Filter orders
  const filteredOrders = orders.filter((order) => {
    const matchesSearch =
      order.id.toLowerCase().includes(search.toLowerCase()) ||
      order.customer.toLowerCase().includes(search.toLowerCase()) ||
      order.items.toLowerCase().includes(search.toLowerCase());

    if (!matchesSearch) return false;

    if (statusFilter === "Aktif") {
      return ["Menunggu", "Dibayar", "Disiapkan", "Siap"].includes(order.status);
    } else if (statusFilter === "Semua") {
      return true;
    } else {
      return order.status === statusFilter;
    }
  });

  const activeCount = orders.filter((o) =>
    ["Menunggu", "Dibayar", "Disiapkan", "Siap"].includes(o.status)
  ).length;

  return (
    <div className="space-y-6 h-full flex flex-col font-sans">
      {/* Header & Controls */}
      <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-4 shrink-0">
        <div>
          <div className="flex items-center gap-3">
            <h2 className="text-3xl font-black text-gray-900 tracking-tight">Manajemen Pesanan</h2>
            <span className="bg-[#b80000] text-[#ffde59] text-xs font-black px-3 py-1 rounded-full animate-pulse shadow-sm">
              {activeCount} Pesanan Aktif
            </span>
          </div>
          <p className="text-gray-500 text-sm mt-1">Pantau antrean pesanan kiosk, pre-order, & dapur secara real-time</p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {/* Search Box */}
          <div className="relative min-w-[240px] flex-1 sm:flex-none">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
            <input
              type="text"
              placeholder="Cari no. antrean, nama, menu..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2.5 bg-white border border-gray-200 rounded-xl text-xs font-bold focus:outline-none focus:ring-2 focus:ring-[#b80000] focus:border-transparent transition-all shadow-sm"
            />
          </div>

          {/* Tombol Catat Pre-Order / Pesanan Manual */}
          <button
            onClick={() => setIsManualModalOpen(true)}
            className="bg-[#b80000] hover:bg-[#940000] text-[#ffde59] px-4 py-2.5 rounded-xl font-black text-xs shadow-md transition-all active:scale-95 flex items-center gap-2 border border-white/20"
          >
            <Plus size={16} />
            <span>Catat Pre-Order Manual</span>
          </button>

          {/* View Toggle */}
          <div className="flex bg-gray-100 p-1 rounded-xl border border-gray-200 shadow-inner">
            <button
              onClick={() => setViewMode("kitchen")}
              className={`p-2 rounded-lg transition-all flex items-center gap-1 text-xs font-bold ${
                viewMode === "kitchen"
                  ? "bg-white text-[#b80000] shadow-sm"
                  : "text-gray-500 hover:text-gray-900"
              }`}
              title="Tampilan Dapur"
            >
              <LayoutGrid size={16} />
              <span className="hidden sm:inline">Dapur</span>
            </button>
            <button
              onClick={() => setViewMode("table")}
              className={`p-2 rounded-lg transition-all flex items-center gap-1 text-xs font-bold ${
                viewMode === "table"
                  ? "bg-white text-[#b80000] shadow-sm"
                  : "text-gray-500 hover:text-gray-900"
              }`}
              title="Tampilan Tabel Kasir"
            >
              <List size={16} />
              <span className="hidden sm:inline">Tabel</span>
            </button>
          </div>

          {/* Refresh Button */}
          <button
            onClick={handleManualRefresh}
            className="bg-white hover:bg-gray-50 border border-gray-200 text-gray-700 p-2.5 rounded-xl shadow-sm transition-all active:scale-95"
            title="Segarkan Data"
          >
            <RotateCw size={16} className={isRefreshing ? "animate-spin text-[#b80000]" : ""} />
          </button>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 shrink-0 hide-scrollbar">
        {["Aktif", "Semua", ...statuses].map((tab) => (
          <button
            key={tab}
            onClick={() => setStatusFilter(tab)}
            className={`px-4 py-2 rounded-xl font-bold text-xs transition-all shrink-0 flex items-center gap-2 ${
              statusFilter === tab
                ? "bg-[#b80000] text-white shadow-md shadow-red-900/20"
                : tab === "Dibatalkan"
                ? "bg-white text-red-600 border border-red-200 hover:bg-red-50"
                : "bg-white text-gray-600 border border-gray-200 hover:bg-gray-50"
            }`}
          >
            <span>{tab}</span>
            {tab === "Aktif" && activeCount > 0 && (
              <span className="bg-[#ffde59] text-[#b80000] text-[10px] font-black px-1.5 py-0.2 rounded-full">
                {activeCount}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Content Area */}
      <div className="flex-1 overflow-y-auto min-h-0 pr-1">
        {filteredOrders.length === 0 ? (
          <div className="bg-white rounded-3xl p-12 text-center border border-gray-100 shadow-sm flex flex-col items-center justify-center h-64">
            <ChefHat size={48} className="text-gray-300 mb-3" />
            <h3 className="text-xl font-bold text-gray-700">Tidak Ada Pesanan</h3>
            <p className="text-gray-400 text-sm mt-1">
              {statusFilter === "Aktif"
                ? "Semua pesanan aktif sudah selesai atau belum ada pesanan baru."
                : `Tidak ada pesanan dengan filter "${statusFilter}".`}
            </p>
          </div>
        ) : viewMode === "kitchen" ? (
          /* ====================================================
             MODE DAPUR / KITCHEN TICKET CARDS
             ==================================================== */
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 pb-6">
            <AnimatePresence mode="popLayout">
              {filteredOrders.map((order) => {
                const isCancelled = order.status === "Dibatalkan";
                const isCustom = isCustomCustomer(order.customer);

                return (
                  <motion.div
                    layout
                    key={order.id}
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    className={`bg-white rounded-3xl shadow-sm border-2 overflow-hidden flex flex-col justify-between transition-all ${
                      isCancelled
                        ? "border-red-200 opacity-75 bg-red-50/20"
                        : order.status === "Disiapkan"
                        ? "border-blue-400 ring-4 ring-blue-50"
                        : order.status === "Siap"
                        ? "border-green-400 ring-4 ring-green-50"
                        : order.status === "Dibayar"
                        ? "border-amber-400 ring-4 ring-amber-50"
                        : "border-gray-200"
                    }`}
                  >
                    {/* Ticket Header */}
                    <div className="p-5 border-b border-gray-100 flex items-center justify-between bg-gray-50/80">
                      <div className="flex items-center gap-3">
                        {/* Customer Initial Badge */}
                        <div className={`w-12 h-12 rounded-2xl flex items-center justify-center font-black text-base shadow-sm border-2 shrink-0 ${
                          isCustom
                            ? "bg-[#b80000] text-[#ffde59] border-amber-300"
                            : "bg-amber-100 text-amber-900 border-amber-200"
                        }`}>
                          {getCustomerInitial(order.customer)}
                        </div>

                        <div>
                          <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest block">
                            No. Antrean
                          </span>
                          <span className={`text-3xl sm:text-4xl font-black tracking-tight ${isCancelled ? "text-gray-400 line-through" : "text-[#b80000]"}`}>
                            {order.id}
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <div className="text-right">
                          <span
                            className={`inline-block px-3 py-1 rounded-full text-xs font-black border ${getStatusColor(
                              order.status
                            )}`}
                          >
                            {order.status}
                          </span>
                          <p className="text-xs font-medium text-gray-400 mt-1 flex items-center justify-end gap-1">
                            <Clock size={12} /> {order.time}
                          </p>
                        </div>

                        {/* Top Action Buttons (Cancel & Delete) */}
                        <div className="flex flex-col gap-1 pl-2 border-l border-gray-200">
                          {!isCancelled && order.status !== "Selesai" && (
                            <button
                              onClick={() => handleCancelOrder(order.id)}
                              className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                              title="Batalkan Pesanan"
                            >
                              <Ban size={16} />
                            </button>
                          )}
                          <button
                            onClick={() => handleDeleteOrder(order.id)}
                            className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                            title="Hapus Pesanan Permanen"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </div>
                    </div>

                    {/* Customer Name Banner (Highlight Pre-Order) */}
                    <div className={`px-5 py-2.5 border-b flex items-center justify-between text-xs font-bold ${
                      isCustom
                        ? "bg-amber-50/90 text-amber-950 border-amber-200"
                        : "bg-white text-gray-600 border-gray-100"
                    }`}>
                      <span className="flex items-center gap-1.5 font-black text-sm text-gray-900 truncate">
                        <User size={15} className={isCustom ? "text-[#b80000]" : "text-gray-400"} />
                        <span className="truncate">{order.customer}</span>
                        {order.customer_phone && (
                          <span className="text-emerald-700 font-bold text-xs bg-emerald-50 border border-emerald-200 px-1.5 py-0.2 rounded-md shrink-0">
                            📱 {order.customer_phone}
                          </span>
                        )}
                        {isCustom && (
                          <span className="bg-[#ffde59] text-[#b80000] text-[9px] font-black px-2 py-0.5 rounded-full border border-amber-300 shrink-0 uppercase tracking-wider">
                            Pre-Order / Khusus
                          </span>
                        )}
                      </span>
                      <span className="flex items-center gap-1 text-gray-700 shrink-0 ml-2">
                        {order.payment === "Tunai" ? (
                          <Banknote size={14} className="text-green-600" />
                        ) : (
                          <CreditCard size={14} className="text-blue-600" />
                        )}
                        <span>{order.payment}</span>
                      </span>
                    </div>

                    {/* Breakdown Items List */}
                    <div className="p-5 flex-1 space-y-4">
                      {order.rawItems && order.rawItems.length > 0 ? (
                        order.rawItems.map((item, idx) => (
                          <div
                            key={idx}
                            className="p-3.5 bg-gray-50 rounded-2xl border border-gray-100 space-y-2"
                          >
                            <div className="flex items-start justify-between">
                              <span className="text-base font-black text-gray-900">
                                <span className="text-[#b80000] mr-1.5">{item.qty}x</span>
                                {item.menu_name}
                              </span>
                              <span className="text-xs font-bold text-gray-400 shrink-0 mt-1">
                                {formatPrice(item.subtotal)}
                              </span>
                            </div>

                            {/* Opsi / Rincian Paket */}
                            {item.notes && (
                              <div className="text-xs font-bold text-gray-700 space-y-1 pt-1 border-t border-gray-200/60">
                                {item.notes.split(" | ").map((part, pIdx) => {
                                  const isKebab = part.startsWith("Kebab:");
                                  const isDrink = part.startsWith("Minum:");
                                  const isLevel = part.startsWith("Level:") || part.startsWith("Rasa:");
                                  const isMayo = part.startsWith("Mayo:");
                                  const isExtra = part.startsWith("Porsi:");

                                  return (
                                    <div
                                      key={pIdx}
                                      className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg mr-1.5 mb-1 ${
                                        isKebab
                                          ? "bg-orange-100 text-orange-800 border border-orange-200"
                                          : isDrink
                                          ? "bg-blue-100 text-blue-800 border border-blue-200"
                                          : isLevel
                                          ? "bg-red-100 text-red-800 border border-red-200"
                                          : isMayo
                                          ? "bg-emerald-100 text-emerald-800 border border-emerald-200"
                                          : isExtra
                                          ? "bg-purple-100 text-purple-800 border border-purple-200"
                                          : "bg-amber-100 text-amber-900 border border-amber-200"
                                      }`}
                                    >
                                      {isKebab && <Utensils size={12} />}
                                      {isDrink && <Coffee size={12} />}
                                      {isLevel && <Flame size={12} />}
                                      {isMayo && <CheckCircle size={12} />}
                                      <span>{part}</span>
                                    </div>
                                  );
                                })}
                              </div>
                            )}
                          </div>
                        ))
                      ) : (
                        <p className="text-sm text-gray-700 font-medium">{order.items}</p>
                      )}

                      {/* 🎁 HADIAH LUCKY SPIN BADGE */}
                      {order.spin_reward && (
                        <div className="p-3 bg-gradient-to-r from-amber-100 via-yellow-100 to-amber-100 border-2 border-amber-300 rounded-2xl flex items-center gap-2.5 shadow-sm">
                          <div className="w-9 h-9 rounded-xl bg-[#b80000] text-[#ffde59] flex items-center justify-center text-lg shrink-0 shadow-sm">
                            🎁
                          </div>
                          <div>
                            <span className="text-[10px] font-black text-[#b80000] uppercase tracking-wider block">
                              BONUS LUCKY SPIN (+1K)
                            </span>
                            <span className="text-xs sm:text-sm font-black text-gray-900 leading-tight block">
                              {order.spin_reward}
                            </span>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Quick Status Action Buttons */}
                    <div className="p-4 bg-gray-50 border-t border-gray-100 flex items-center gap-2">
                      {order.status === "Menunggu" && (
                        <button
                          onClick={() => updateOrderStatus(order.id, "Dibayar")}
                          className="flex-1 bg-amber-500 hover:bg-amber-600 text-white py-3 rounded-xl font-black text-sm shadow-md transition-all active:scale-95 flex items-center justify-center gap-1.5"
                        >
                          <CheckCircle size={16} /> Terima Pembayaran
                        </button>
                      )}

                      {order.status === "Dibayar" && (
                        <button
                          onClick={() => updateOrderStatus(order.id, "Disiapkan")}
                          className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-xl font-black text-sm shadow-md transition-all active:scale-95 flex items-center justify-center gap-1.5"
                        >
                          <ChefHat size={18} /> Mulai Masak
                        </button>
                      )}

                      {order.status === "Disiapkan" && (
                        <button
                          onClick={() => updateOrderStatus(order.id, "Siap")}
                          className="flex-1 bg-green-600 hover:bg-green-700 text-white py-3 rounded-xl font-black text-sm shadow-md transition-all active:scale-95 flex items-center justify-center gap-1.5"
                        >
                          <CheckCircle size={18} /> Pesanan Siap!
                        </button>
                      )}

                      {order.status === "Siap" && (
                        <button
                          onClick={() => updateOrderStatus(order.id, "Selesai")}
                          className="flex-1 bg-gray-900 hover:bg-gray-800 text-white py-3 rounded-xl font-black text-sm shadow-md transition-all active:scale-95 flex items-center justify-center gap-1.5"
                        >
                          <CheckCircle size={18} /> Selesai Diambil
                        </button>
                      )}

                      {order.status === "Selesai" && (
                        <span className="flex-1 text-center text-xs font-bold text-gray-500 py-2">
                          ✓ Pesanan Selesai ({order.formattedTotal})
                        </span>
                      )}

                      {order.status === "Dibatalkan" && (
                        <div className="flex-1 flex items-center justify-between">
                          <span className="text-xs font-bold text-red-600 flex items-center gap-1">
                            <XCircle size={14} /> Dibatalkan
                          </span>
                          <button
                            onClick={() => handleDeleteOrder(order.id)}
                            className="text-xs font-bold bg-red-50 hover:bg-red-100 text-red-700 px-3 py-1.5 rounded-lg transition-all flex items-center gap-1"
                          >
                            <Trash2 size={13} /> Hapus Permanen
                          </button>
                        </div>
                      )}

                      {/* Dropdown status for manual override */}
                      <select
                        className="bg-white border border-gray-200 rounded-xl px-2.5 py-3 text-xs font-bold text-gray-700 outline-none cursor-pointer hover:bg-gray-100 shrink-0"
                        value={order.status}
                        onChange={(e) => updateOrderStatus(order.id, e.target.value)}
                      >
                        {statuses.map((s) => (
                          <option key={s} value={s}>
                            {s}
                          </option>
                        ))}
                      </select>
                    </div>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>
        ) : (
          /* ====================================================
             MODE TABEL KASIR (Ringkas & Rekap Pembukuan)
             ==================================================== */
          <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden mb-6">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead className="bg-gray-50 text-gray-500 text-xs font-bold uppercase tracking-wider sticky top-0 z-10 border-b border-gray-100">
                  <tr>
                    <th className="px-6 py-4">No Antrean</th>
                    <th className="px-6 py-4">Waktu</th>
                    <th className="px-6 py-4">Pelanggan / Pemesan</th>
                    <th className="px-6 py-4">Rincian Menu & Varian</th>
                    <th className="px-6 py-4">Metode</th>
                    <th className="px-6 py-4">Total</th>
                    <th className="px-6 py-4">Status</th>
                    <th className="px-6 py-4 text-center">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 text-sm">
                  {filteredOrders.map((order) => {
                    const isCustom = isCustomCustomer(order.customer);

                    return (
                      <tr key={order.id} className="hover:bg-gray-50/50 transition-colors">
                        <td className="px-6 py-4 font-black text-xl text-[#b80000]">{order.id}</td>
                        <td className="px-6 py-4 text-gray-500 font-medium text-xs">{order.time}</td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className={`w-9 h-9 rounded-xl flex items-center justify-center font-black text-xs border ${
                              isCustom
                                ? "bg-[#b80000] text-[#ffde59] border-amber-300"
                                : "bg-gray-100 text-gray-600 border-gray-200"
                            }`}>
                              {getCustomerInitial(order.customer)}
                            </div>
                            <div>
                              <p className="font-bold text-gray-900 leading-tight">{order.customer}</p>
                              {order.customer_phone && (
                                <p className="text-[11px] text-emerald-700 font-bold">📱 {order.customer_phone}</p>
                              )}
                              {isCustom ? (
                                <span className="text-[10px] text-[#b80000] font-black bg-amber-50 px-1.5 py-0.5 rounded border border-amber-200 inline-block mt-0.5 uppercase tracking-wider">
                                  Pre-Order
                                </span>
                              ) : (
                                <span className="text-[10px] text-gray-400 font-medium block">
                                  Kiosk
                                </span>
                              )}
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-gray-700 max-w-sm">
                          <div className="space-y-1">
                            {order.rawItems && order.rawItems.length > 0 ? (
                              order.rawItems.map((item, iIdx) => (
                                <div key={iIdx} className="text-xs">
                                  <span className="font-bold text-gray-900">{item.qty}x {item.menu_name}</span>
                                  {item.notes && (
                                    <span className="text-gray-500 block italic">↳ {item.notes}</span>
                                  )}
                                </div>
                              ))
                            ) : (
                              <span className="text-xs text-gray-600">{order.items}</span>
                            )}

                            {order.spin_reward && (
                              <div className="inline-flex items-center gap-1 bg-amber-100 text-amber-900 border border-amber-300 px-2 py-0.5 rounded-md text-[11px] font-black mt-1">
                                🎁 Hadiah Spin: {order.spin_reward}
                              </div>
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-4 font-bold text-xs text-gray-700">{order.payment}</td>
                        <td className="px-6 py-4 font-black text-gray-900">{order.formattedTotal}</td>
                        <td className="px-6 py-4">
                          <select
                            className={`px-3 py-1 rounded-full text-xs font-black border outline-none cursor-pointer ${getStatusColor(
                              order.status
                            )}`}
                            value={order.status}
                            onChange={(e) => updateOrderStatus(order.id, e.target.value)}
                          >
                            {statuses.map((s) => (
                              <option key={s} value={s}>
                                {s}
                              </option>
                            ))}
                          </select>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center justify-center gap-2">
                            <button
                              onClick={() => setSelectedOrder(order)}
                              className="text-blue-600 font-bold text-xs hover:bg-blue-50 px-2.5 py-1 rounded-lg transition-colors"
                            >
                              Detail
                            </button>
                            {order.status !== "Dibatalkan" && order.status !== "Selesai" && (
                              <button
                                onClick={() => handleCancelOrder(order.id)}
                                className="text-red-500 font-bold text-xs hover:bg-red-50 px-2.5 py-1 rounded-lg transition-colors"
                              >
                                Batal
                              </button>
                            )}
                            <button
                              onClick={() => handleDeleteOrder(order.id)}
                              className="text-gray-400 hover:text-red-600 font-bold text-xs hover:bg-red-50 px-2.5 py-1 rounded-lg transition-colors"
                            >
                              Hapus
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {/* MODAL CATAT PRE-ORDER / PESANAN MANUAL */}
      <AnimatePresence>
        {isManualModalOpen && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white p-6 sm:p-8 rounded-3xl w-full max-w-xl shadow-2xl relative border border-gray-100 max-h-[90vh] overflow-y-auto flex flex-col"
            >
              <div className="flex items-start justify-between border-b border-gray-100 pb-4 mb-5">
                <div>
                  <h3 className="text-2xl font-black text-gray-900 flex items-center gap-2">
                    <Plus className="text-[#b80000]" /> Catat Pre-Order / Pesanan Manual
                  </h3>
                  <p className="text-xs text-gray-500 mt-0.5">
                    Gunakan untuk mencatat pesanan dari WhatsApp, pre-order, atau offline.
                  </p>
                </div>
                <button
                  onClick={() => setIsManualModalOpen(false)}
                  className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-all text-xl font-bold"
                >
                  ✕
                </button>
              </div>

              {manualError && (
                <div className="mb-4 bg-red-50 border border-red-200 text-red-700 px-3.5 py-2.5 rounded-xl text-xs font-bold flex items-center gap-2">
                  <AlertCircle size={16} className="shrink-0" />
                  <span>{manualError}</span>
                </div>
              )}

              <form onSubmit={handleCreateManualOrder} className="space-y-4 flex-1 flex flex-col">
                {/* Nama Pelanggan / Pre-order & WhatsApp */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <label className="text-xs font-black text-gray-700 uppercase tracking-wider block">
                      Nama Pemesan <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="Contoh: Bu Ani (Pre-Order)"
                      value={manualCustomerName}
                      onChange={(e) => setManualCustomerName(e.target.value)}
                      className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3.5 py-2.5 text-sm font-bold text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#b80000] focus:border-transparent transition-all"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-black text-gray-700 uppercase tracking-wider block">
                      No. WhatsApp / HP (Opsional)
                    </label>
                    <input
                      type="tel"
                      placeholder="Contoh: 08123456789"
                      value={manualCustomerPhone}
                      onChange={(e) => setManualCustomerPhone(e.target.value)}
                      className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3.5 py-2.5 text-sm font-bold text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#b80000] focus:border-transparent transition-all"
                    />
                  </div>
                </div>

                {/* Pilih Menu & Quantity */}
                <div className="space-y-2">
                  <label className="text-xs font-black text-gray-700 uppercase tracking-wider flex items-center justify-between">
                    <span>Pilih Menu & Jumlah</span>
                    <span className="text-[11px] text-[#b80000] font-bold">
                      {Object.values(manualCart).reduce((a, b) => a + b.qty, 0)} item dipilih
                    </span>
                  </label>
                  
                  <div className="max-h-56 overflow-y-auto border border-gray-200 rounded-2xl p-2 space-y-2 bg-gray-50/50">
                    {products.map((prod) => {
                      const itemData = manualCart[String(prod.id)] || { qty: 0, notes: "" };
                      return (
                        <div
                          key={prod.id}
                          className={`p-3 rounded-xl border transition-all ${
                            itemData.qty > 0
                              ? "bg-white border-[#b80000] shadow-sm"
                              : "bg-white/80 border-gray-200 hover:border-gray-300"
                          }`}
                        >
                          <div className="flex items-center justify-between gap-3">
                            <div className="min-w-0">
                              <h4 className="font-black text-sm text-gray-900 truncate">{prod.name}</h4>
                              <p className="text-xs font-bold text-[#b80000]">{formatPrice(prod.price)}</p>
                            </div>
                            
                            <div className="flex items-center gap-2 shrink-0">
                              {itemData.qty > 0 && (
                                <button
                                  type="button"
                                  onClick={() => updateManualItemQty(prod.id, -1)}
                                  className="w-8 h-8 rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-700 font-black flex items-center justify-center transition-all"
                                >
                                  -
                                </button>
                              )}
                              {itemData.qty > 0 && (
                                <span className="font-black text-sm text-gray-900 w-5 text-center">
                                  {itemData.qty}
                                </span>
                              )}
                              <button
                                type="button"
                                onClick={() => updateManualItemQty(prod.id, 1)}
                                className={`h-8 px-3 rounded-lg font-black text-xs flex items-center justify-center transition-all ${
                                  itemData.qty > 0
                                    ? "bg-[#b80000] text-[#ffde59]"
                                    : "bg-gray-100 hover:bg-gray-200 text-gray-800"
                                }`}
                              >
                                {itemData.qty > 0 ? "+" : "+ Tambah"}
                              </button>
                            </div>
                          </div>

                          {itemData.qty > 0 && (
                            <input
                              type="text"
                              placeholder="Catatan menu (misal: Sedang, Mayo Pedas)"
                              value={itemData.notes}
                              onChange={(e) => updateManualItemNotes(prod.id, e.target.value)}
                              className="mt-2 w-full bg-gray-50 border border-gray-200 rounded-lg px-2.5 py-1 text-xs font-medium text-gray-800 placeholder:text-gray-400 focus:outline-none focus:ring-1 focus:ring-[#b80000]"
                            />
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Metode Pembayaran & Status */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-xs font-black text-gray-700 uppercase tracking-wider block">
                      Metode Pembayaran
                    </label>
                    <select
                      value={manualPaymentMethod}
                      onChange={(e) => setManualPaymentMethod(e.target.value as any)}
                      className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3 py-2.5 text-xs font-bold text-gray-800 outline-none"
                    >
                      <option value="cash">💵 Tunai (Cash)</option>
                      <option value="qris">📱 QRIS / Transfer</option>
                    </select>
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-black text-gray-700 uppercase tracking-wider block">
                      Status Awal
                    </label>
                    <select
                      value={manualInitialStatus}
                      onChange={(e) => setManualInitialStatus(e.target.value as any)}
                      className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3 py-2.5 text-xs font-bold text-gray-800 outline-none"
                    >
                      <option value="waiting_for_kitchen">✅ Dibayar (Masuk Antrean Dapur)</option>
                      <option value="preparing">🍳 Disiapkan (Sedang Dimasak)</option>
                      <option value="waiting_payment">⏳ Menunggu Pembayaran</option>
                    </select>
                  </div>
                </div>

                {/* Catatan Umum */}
                <div className="space-y-1">
                  <label className="text-xs font-black text-gray-700 uppercase tracking-wider block">
                    Catatan Pesanan / Waktu Ambil
                  </label>
                  <input
                    type="text"
                    placeholder="Contoh: Diambil jam 12:45 siang"
                    value={manualNotes}
                    onChange={(e) => setManualNotes(e.target.value)}
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 text-xs font-medium text-gray-800 placeholder:text-gray-400 focus:outline-none focus:ring-1 focus:ring-[#b80000]"
                  />
                </div>

                {/* Total & Submit Button */}
                <div className="pt-3 border-t border-gray-100 flex items-center justify-between gap-4 mt-auto">
                  <div>
                    <span className="text-[10px] font-black text-gray-400 uppercase tracking-wider block">Total Harga</span>
                    <span className="text-xl font-black text-[#b80000]">{formatPrice(calculateManualTotal())}</span>
                  </div>

                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => setIsManualModalOpen(false)}
                      className="px-4 py-2.5 rounded-xl border border-gray-200 font-bold text-xs text-gray-600 hover:bg-gray-50 transition-all"
                    >
                      Batal
                    </button>
                    <button
                      type="submit"
                      disabled={isSubmittingManual}
                      className="bg-[#b80000] hover:bg-[#940000] text-[#ffde59] px-6 py-2.5 rounded-xl font-black text-xs shadow-md transition-all active:scale-95 disabled:opacity-50 flex items-center gap-1.5"
                    >
                      {isSubmittingManual ? "Menyimpan..." : "Simpan Pesanan"}
                    </button>
                  </div>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* MODAL DETAIL PESANAN */}
      <AnimatePresence>
        {selectedOrder && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white p-8 rounded-3xl w-full max-w-lg shadow-2xl relative border border-gray-100 max-h-[90vh] overflow-y-auto"
            >
              <div className="flex items-start justify-between border-b border-gray-100 pb-4 mb-6">
                <div>
                  <span className="text-xs font-bold text-gray-400 uppercase tracking-widest block">
                    Detail Pesanan
                  </span>
                  <h3 className="text-4xl font-black text-[#b80000] mt-1">{selectedOrder.id}</h3>
                </div>
                <button
                  onClick={() => setSelectedOrder(null)}
                  className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-all text-xl font-bold"
                >
                  ✕
                </button>
              </div>

              {/* Customer Box */}
              <div className="mb-6 p-4 bg-amber-50/80 rounded-2xl border-2 border-amber-200 flex items-center gap-4">
                <div className="w-14 h-14 rounded-2xl bg-[#b80000] text-[#ffde59] font-black text-xl flex items-center justify-center shadow-md shrink-0 border border-amber-300">
                  {getCustomerInitial(selectedOrder.customer)}
                </div>
                <div>
                  <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest block">
                    Nama Pemesan / Pelanggan
                  </span>
                  <h4 className="font-black text-gray-900 text-lg leading-tight">
                    {selectedOrder.customer}
                  </h4>
                  {isCustomCustomer(selectedOrder.customer) && (
                    <span className="text-[10px] font-black bg-[#ffde59] text-[#b80000] px-2 py-0.5 rounded-full inline-block mt-1 uppercase tracking-wider">
                      Pesanan Khusus / Pre-Order
                    </span>
                  )}
                </div>
              </div>

              <div className="space-y-4 mb-6">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Nama Pelanggan:</span>
                  <span className="font-bold text-gray-800">{selectedOrder.customer}</span>
                </div>
                {selectedOrder.customer_phone && (
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">No. WhatsApp / HP:</span>
                    <span className="font-bold text-emerald-700">📱 {selectedOrder.customer_phone}</span>
                  </div>
                )}
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Metode Pembayaran:</span>
                  <span className="font-bold text-gray-800">{selectedOrder.payment}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Status Saat Ini:</span>
                  <span className={`px-3 py-1 rounded-full text-xs font-black border ${getStatusColor(selectedOrder.status)}`}>
                    {selectedOrder.status}
                  </span>
                </div>
              </div>

              <div className="border-t border-b border-gray-100 py-4 mb-6">
                <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">Item Pesanan</h4>
                <div className="space-y-3">
                  {selectedOrder.rawItems && selectedOrder.rawItems.length > 0 ? (
                    selectedOrder.rawItems.map((item, idx) => (
                      <div key={idx} className="p-3 bg-gray-50 rounded-xl space-y-1">
                        <div className="flex justify-between font-bold text-sm text-gray-900">
                          <span>{item.qty}x {item.menu_name}</span>
                          <span>{formatPrice(item.subtotal)}</span>
                        </div>
                        {item.notes && (
                          <p className="text-xs text-gray-500 italic">Opsi: {item.notes}</p>
                        )}
                      </div>
                    ))
                  ) : (
                    <p className="text-sm font-medium text-gray-700">{selectedOrder.items}</p>
                  )}
                </div>

                {selectedOrder.spin_reward && (
                  <div className="mt-4 p-3.5 bg-gradient-to-r from-amber-50 to-yellow-50 rounded-2xl border-2 border-[#ffde59] flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-[#b80000] text-[#ffde59] flex items-center justify-center text-xl shrink-0">
                      🎁
                    </div>
                    <div>
                      <span className="text-[10px] font-black text-[#b80000] uppercase tracking-wider block">
                        Hadiah Lucky Spin (+Rp 1.000)
                      </span>
                      <span className="text-sm font-black text-gray-900 leading-tight block">
                        {selectedOrder.spin_reward}
                      </span>
                    </div>
                  </div>
                )}

                <div className="flex justify-between font-black text-lg text-gray-900 mt-4 pt-3 border-t border-gray-100">
                  <span>Total Pembayaran:</span>
                  <span className="text-[#b80000]">{selectedOrder.formattedTotal}</span>
                </div>
              </div>

              <div className="flex gap-3">
                {selectedOrder.status !== "Dibatalkan" && (
                  <button
                    onClick={() => handleCancelOrder(selectedOrder.id)}
                    className="flex-1 bg-amber-50 hover:bg-amber-100 text-amber-700 border border-amber-200 py-3 rounded-2xl font-bold text-sm transition-all"
                  >
                    Batalkan Pesanan
                  </button>
                )}
                <button
                  onClick={() => handleDeleteOrder(selectedOrder.id)}
                  className="flex-1 bg-red-50 hover:bg-red-100 text-red-700 border border-red-200 py-3 rounded-2xl font-bold text-sm transition-all"
                >
                  Hapus Permanen
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
