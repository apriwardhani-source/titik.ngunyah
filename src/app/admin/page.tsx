"use client";

import { useEffect, useState } from "react";
import { DollarSign, ShoppingBag, Clock, CheckCircle2, RotateCw, ExternalLink, ChefHat, ArrowRight, Utensils } from "lucide-react";
import { useOrderStore } from "@/store/useOrderStore";
import { formatPrice, getStatusColor } from "@/lib/utils";
import Link from "next/link";

export default function AdminDashboard() {
  const { orders, fetchOrders } = useOrderStore();
  const [isRefreshing, setIsRefreshing] = useState(false);
  
  useEffect(() => {
    fetchOrders();
    const interval = setInterval(() => {
      fetchOrders();
    }, 10000);
    return () => clearInterval(interval);
  }, [fetchOrders]);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await fetchOrders();
    setTimeout(() => setIsRefreshing(false), 500);
  };

  const isToday = (timestamp: number | string) => {
    try {
      const d = new Date(timestamp);
      return d.toDateString() === new Date().toDateString();
    } catch {
      return false;
    }
  };

  const todaysOrders = orders.filter(o => isToday(o.createdAt));
  // Fallback to all recent orders if today's orders are 0 to keep dashboard informative
  const displayOrders = todaysOrders.length > 0 ? todaysOrders : orders;
  const recentOrders = displayOrders.slice(0, 7);

  const todayRevenue = todaysOrders.reduce((sum, o) => sum + (o.status !== "Dibatalkan" ? o.total : 0), 0);
  const pendingCount = todaysOrders.filter(o => ["Menunggu", "Dibayar", "Disiapkan"].includes(o.status)).length;
  const completedCount = todaysOrders.filter(o => o.status === "Selesai").length;

  const stats = [
    { 
      name: "Pendapatan Hari Ini", 
      value: formatPrice(todayRevenue), 
      desc: todaysOrders.length > 0 ? `${todaysOrders.length} transaksi` : "Belum ada transaksi hari ini",
      icon: DollarSign, 
      color: "text-emerald-600", 
      bg: "bg-emerald-50" 
    },
    { 
      name: "Total Pesanan Hari Ini", 
      value: todaysOrders.length.toString(), 
      desc: "Pesanan masuk hari ini",
      icon: ShoppingBag, 
      color: "text-blue-600", 
      bg: "bg-blue-50" 
    },
    { 
      name: "Pesanan Dalam Proses", 
      value: pendingCount.toString(), 
      desc: "Menunggu / Disiapkan",
      icon: Clock, 
      color: "text-orange-600", 
      bg: "bg-orange-50" 
    },
    { 
      name: "Pesanan Selesai", 
      value: completedCount.toString(), 
      desc: "Siap disajikan / selesai",
      icon: CheckCircle2, 
      color: "text-purple-600", 
      bg: "bg-purple-50" 
    },
  ];

  return (
    <div className="space-y-8 max-w-7xl">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-black text-gray-900 tracking-tight">Ringkasan Dashboard</h2>
          <p className="text-gray-500 text-sm mt-1">Pantau performa penjualan dan antrean bazar secara real-time</p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={handleRefresh}
            className="bg-white hover:bg-gray-50 border border-gray-200 text-gray-700 px-4 py-2.5 rounded-xl font-bold text-sm shadow-sm transition-all active:scale-95 flex items-center gap-2"
          >
            <RotateCw size={16} className={isRefreshing ? "animate-spin text-[#E53935]" : ""} />
            Segarkan Data
          </button>

          <Link
            href="/admin/orders"
            className="bg-[#E53935] hover:bg-[#C62828] text-white px-5 py-2.5 rounded-xl font-bold text-sm shadow-md transition-all active:scale-95 flex items-center gap-2"
          >
            <ChefHat size={18} />
            Layar Dapur / Pesanan
          </Link>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <div key={stat.name} className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 flex items-center gap-5 hover:shadow-md transition-shadow">
              <div className={`w-14 h-14 rounded-2xl flex items-center justify-center shrink-0 ${stat.bg} ${stat.color}`}>
                <Icon size={28} />
              </div>
              <div className="min-w-0">
                <p className="text-xs font-bold uppercase tracking-wider text-gray-400 mb-1">{stat.name}</p>
                <p className="text-2xl font-black text-gray-900 tracking-tight truncate">{stat.value}</p>
                <p className="text-[11px] text-gray-500 mt-0.5">{stat.desc}</p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Recent Orders Section */}
      <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
          <div>
            <h3 className="text-lg font-bold text-gray-900">
              {todaysOrders.length > 0 ? "Pesanan Hari Ini" : "Pesanan Terbaru"}
            </h3>
            <p className="text-xs text-gray-500 mt-0.5">
              {todaysOrders.length > 0 ? `${todaysOrders.length} transaksi tercatat hari ini` : "Menampilkan transaksi terbaru"}
            </p>
          </div>
          <Link 
            href="/admin/orders" 
            className="text-xs font-bold text-[#E53935] hover:text-[#C62828] flex items-center gap-1 bg-red-50 hover:bg-red-100 px-3.5 py-2 rounded-xl transition-all"
          >
            Buka Manajemen Pesanan <ArrowRight size={14} />
          </Link>
        </div>

        {recentOrders.length === 0 ? (
          <div className="py-16 text-center">
            <div className="w-16 h-16 bg-gray-100 text-gray-400 rounded-full flex items-center justify-center mx-auto mb-4">
              <ShoppingBag size={28} />
            </div>
            <p className="text-base font-bold text-gray-700">Belum Ada Pesanan Masuk</p>
            <p className="text-xs text-gray-400 mt-1 max-w-sm mx-auto">
              Pesanan yang dibuat oleh pelanggan dari layar Kiosk akan otomatis tampil di sini secara real-time.
            </p>
            <Link
              href="/menu"
              target="_blank"
              className="inline-flex items-center gap-2 mt-5 text-xs font-bold text-gray-700 bg-gray-100 hover:bg-gray-200 px-4 py-2 rounded-xl transition-colors"
            >
              <ExternalLink size={14} /> Buka Layar Kiosk Menu
            </Link>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-gray-50 text-gray-400 text-[11px] font-bold uppercase tracking-wider">
                <tr>
                  <th className="px-6 py-4">Antrean</th>
                  <th className="px-6 py-4">Pesanan & Pilihan</th>
                  <th className="px-6 py-4">Total</th>
                  <th className="px-6 py-4">Waktu</th>
                  <th className="px-6 py-4">Metode</th>
                  <th className="px-6 py-4">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 text-sm">
                {recentOrders.map((order) => (
                  <tr key={order.id} className="hover:bg-gray-50/70 transition-colors">
                    <td className="px-6 py-4">
                      <span className="font-black text-gray-900 bg-gray-100 px-2.5 py-1 rounded-lg text-xs">
                        {order.id}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <p className="font-bold text-gray-900 line-clamp-1">{order.items}</p>
                      <p className="text-xs text-gray-400 mt-0.5">Pemesan: {order.customer || "Guest"}</p>
                    </td>
                    <td className="px-6 py-4 font-black text-gray-900">{order.formattedTotal}</td>
                    <td className="px-6 py-4 text-xs font-medium text-gray-500">{order.time}</td>
                    <td className="px-6 py-4">
                      <span className={`text-[11px] font-bold px-2 py-0.5 rounded uppercase ${order.payment === 'cash' ? 'bg-amber-100 text-amber-800' : 'bg-blue-100 text-blue-800'}`}>
                        {order.payment || 'QRIS'}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-3 py-1 rounded-full border text-xs font-bold ${getStatusColor(order.status)}`}>
                        {order.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
