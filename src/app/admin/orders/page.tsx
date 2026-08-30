"use client";

import { useState, useEffect } from "react";
import { useOrderStore, Order } from "@/store/useOrderStore";
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
} from "lucide-react";

export default function OrdersPage() {
  const { orders, updateOrderStatus, deleteOrder, fetchOrders } = useOrderStore();
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("Aktif");
  const [viewMode, setViewMode] = useState<"kitchen" | "table">("kitchen");
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const prevOrderCountRef = useState<number>(0);
  const statuses = ["Menunggu", "Dibayar", "Disiapkan", "Siap", "Selesai", "Dibatalkan"];

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
    const interval = setInterval(() => {
      fetchOrders();
    }, 5000);

    return () => clearInterval(interval);
  }, [fetchOrders]);

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
    <div className="space-y-6 h-full flex flex-col">
      {/* Header & Controls */}
      <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-4 shrink-0">
        <div>
          <div className="flex items-center gap-3">
            <h2 className="text-3xl font-black text-gray-900 tracking-tight">Manajemen Pesanan</h2>
            <span className="bg-red-500 text-white text-xs font-black px-3 py-1 rounded-full animate-pulse shadow-sm">
              {activeCount} Pesanan Aktif
            </span>
          </div>
          <p className="text-gray-500 text-sm mt-1">Pantau antrean pesanan kiosk & dapur secara real-time</p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {/* Search Box */}
          <div className="relative min-w-[240px] flex-1 sm:flex-none">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
            <input
              type="text"
              placeholder="Cari No Antrean / Menu..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-white border border-gray-200 rounded-xl pl-9 pr-4 py-2.5 text-xs font-semibold focus:outline-none focus:border-[#E53935] focus:ring-2 focus:ring-red-100 shadow-sm"
            />
          </div>

          {/* View Toggle */}
          <div className="bg-gray-100 p-1 rounded-xl flex items-center border border-gray-200">
            <button
              onClick={() => setViewMode("kitchen")}
              className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all ${
                viewMode === "kitchen"
                  ? "bg-white text-[#E53935] shadow-sm"
                  : "text-gray-600 hover:text-gray-900"
              }`}
            >
              <ChefHat size={16} /> Mode Dapur
            </button>
            <button
              onClick={() => setViewMode("table")}
              className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all ${
                viewMode === "table"
                  ? "bg-white text-[#E53935] shadow-sm"
                  : "text-gray-600 hover:text-gray-900"
              }`}
            >
              <List size={16} /> Tabel Kasir
            </button>
          </div>

          {/* Refresh Button */}
          <button
            onClick={handleManualRefresh}
            className="p-2.5 bg-gray-50 hover:bg-gray-100 text-gray-700 rounded-xl border border-gray-200 shadow-sm active:scale-95 transition-all"
            title="Refresh Data"
          >
            <RotateCw size={18} className={isRefreshing ? "animate-spin text-[#E53935]" : ""} />
          </button>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex gap-2 overflow-x-auto pb-1 shrink-0 hide-scrollbar">
        {["Aktif", "Semua", "Menunggu", "Dibayar", "Disiapkan", "Siap", "Selesai", "Dibatalkan"].map((tab) => (
          <button
            key={tab}
            onClick={() => setStatusFilter(tab)}
            className={`px-4 py-2 rounded-xl font-bold text-xs transition-all shrink-0 flex items-center gap-2 ${
              statusFilter === tab
                ? "bg-[#E53935] text-white shadow-md shadow-red-500/20"
                : tab === "Dibatalkan"
                ? "bg-white text-red-600 border border-red-200 hover:bg-red-50"
                : "bg-white text-gray-600 border border-gray-200 hover:bg-gray-50"
            }`}
          >
            <span>{tab}</span>
            {tab === "Aktif" && activeCount > 0 && (
              <span className="bg-white text-[#E53935] text-[10px] font-black px-1.5 py-0.2 rounded-full">
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
                    <div className="p-5 border-b border-gray-100 flex items-center justify-between bg-gray-50/70">
                      <div>
                        <span className="text-xs font-bold text-gray-400 uppercase tracking-widest block">
                          No. Antrean
                        </span>
                        <span className={`text-4xl font-black tracking-tight ${isCancelled ? "text-gray-400 line-through" : "text-[#E53935]"}`}>
                          {order.id}
                        </span>
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

                    {/* Customer & Total Info */}
                    <div className="px-5 py-3 bg-white border-b border-gray-100 flex items-center justify-between text-xs font-bold text-gray-600">
                      <span className="flex items-center gap-1.5">
                        <User size={14} className="text-gray-400" />
                        {order.customer}
                      </span>
                      <span className="flex items-center gap-1 text-gray-900">
                        {order.payment === "Tunai" ? (
                          <Banknote size={14} className="text-green-600" />
                        ) : (
                          <CreditCard size={14} className="text-blue-600" />
                        )}
                        {order.payment} ({order.formattedTotal})
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
                                <span className="text-[#E53935] mr-1.5">{item.qty}x</span>
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
                          ✓ Pesanan Selesai
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
                    <th className="px-6 py-4">Pelanggan</th>
                    <th className="px-6 py-4">Rincian Menu & Varian</th>
                    <th className="px-6 py-4">Metode</th>
                    <th className="px-6 py-4">Total</th>
                    <th className="px-6 py-4">Status</th>
                    <th className="px-6 py-4 text-center">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 text-sm">
                  {filteredOrders.map((order) => (
                    <tr key={order.id} className="hover:bg-gray-50/50 transition-colors">
                      <td className="px-6 py-4 font-black text-xl text-[#E53935]">{order.id}</td>
                      <td className="px-6 py-4 text-gray-500 font-medium text-xs">{order.time}</td>
                      <td className="px-6 py-4 font-bold text-gray-900">{order.customer}</td>
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
                              className="text-amber-600 font-bold text-xs hover:bg-amber-50 p-1 rounded-lg transition-colors"
                              title="Batalkan Pesanan"
                            >
                              <Ban size={15} />
                            </button>
                          )}
                          <button
                            onClick={() => handleDeleteOrder(order.id)}
                            className="text-red-600 font-bold text-xs hover:bg-red-50 p-1 rounded-lg transition-colors"
                            title="Hapus Pesanan"
                          >
                            <Trash2 size={15} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {/* Modal Detail Pop-up */}
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
                  <h3 className="text-4xl font-black text-[#E53935] mt-1">{selectedOrder.id}</h3>
                </div>
                <button
                  onClick={() => setSelectedOrder(null)}
                  className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-all text-xl font-bold"
                >
                  ✕
                </button>
              </div>

              <div className="space-y-4 mb-6">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Waktu Pemesanan:</span>
                  <span className="font-bold text-gray-800">{selectedOrder.time}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Nama Pelanggan:</span>
                  <span className="font-bold text-gray-800">{selectedOrder.customer}</span>
                </div>
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
                <div className="flex justify-between font-black text-lg text-gray-900 mt-4 pt-3 border-t border-gray-100">
                  <span>Total Pembayaran:</span>
                  <span className="text-[#E53935]">{selectedOrder.formattedTotal}</span>
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
