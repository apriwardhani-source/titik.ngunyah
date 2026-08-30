"use client";

import { useState, useEffect, useMemo } from "react";
import { useOrderStore, Order } from "@/store/useOrderStore";
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  LineChart, Line 
} from "recharts";
import { 
  DollarSign, 
  ShoppingBag, 
  TrendingUp, 
  Download, 
  Printer, 
  Calendar, 
  Filter, 
  RotateCw,
  Layers,
  Utensils
} from "lucide-react";
import { formatPrice } from "@/lib/utils";

export default function ReportsPage() {
  const { orders, fetchOrders } = useOrderStore();
  const [dateFilter, setDateFilter] = useState<"today" | "yesterday" | "week" | "all">("today");
  const [statusFilter, setStatusFilter] = useState<"success" | "all">("success");
  const [isRefreshing, setIsRefreshing] = useState(false);

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await fetchOrders();
    setTimeout(() => setIsRefreshing(false), 500);
  };

  // Filter orders based on date & status
  const filteredOrders = useMemo(() => {
    const now = new Date();
    const todayStr = now.toDateString();
    
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayStr = yesterday.toDateString();

    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    return orders.filter((o) => {
      // 1. Status filter
      if (statusFilter === "success") {
        if (o.status === "Dibatalkan" || o.status === "Menunggu") return false;
      }

      // 2. Date filter
      const orderDate = new Date(o.createdAt);
      if (isNaN(orderDate.getTime())) return true; // fallback

      if (dateFilter === "today") {
        return orderDate.toDateString() === todayStr;
      } else if (dateFilter === "yesterday") {
        return orderDate.toDateString() === yesterdayStr;
      } else if (dateFilter === "week") {
        return orderDate >= sevenDaysAgo;
      }
      return true; // "all"
    });
  }, [orders, dateFilter, statusFilter]);

  // 1. Calculate Summary Stats
  const totalRevenue = useMemo(() => {
    return filteredOrders.reduce((sum, o) => sum + o.total, 0);
  }, [filteredOrders]);

  const totalOrders = filteredOrders.length;
  const averageOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;

  // 2. Parse Items for Top Selling Chart & Total Items Count
  const { topSellingData, totalItemsCount } = useMemo(() => {
    const itemCounts: Record<string, number> = {};
    let totalItems = 0;

    filteredOrders.forEach((order) => {
      if (order.rawItems && order.rawItems.length > 0) {
        order.rawItems.forEach((raw) => {
          const name = raw.menu_name || "Menu";
          const qty = Number(raw.qty || 1);
          itemCounts[name] = (itemCounts[name] || 0) + qty;
          totalItems += qty;
        });
      } else {
        const items = order.items.split(", ");
        items.forEach((itemStr) => {
          const match = itemStr.match(/^(\d+)x\s+(.+)$/);
          if (match) {
            const qty = parseInt(match[1]);
            const name = match[2];
            itemCounts[name] = (itemCounts[name] || 0) + qty;
            totalItems += qty;
          } else {
            itemCounts[itemStr] = (itemCounts[itemStr] || 0) + 1;
            totalItems += 1;
          }
        });
      }
    });

    const topSelling = Object.entries(itemCounts)
      .map(([name, count]) => ({ name, terjual: count }))
      .sort((a, b) => b.terjual - a.terjual)
      .slice(0, 6);

    return { topSellingData: topSelling, totalItemsCount: totalItems };
  }, [filteredOrders]);

  // 3. Prepare Sales Trend Data (by Hour or by Date)
  const salesTrendData = useMemo(() => {
    if (dateFilter === "all" || dateFilter === "week") {
      // Group by Date
      const salesByDate: Record<string, number> = {};
      filteredOrders.forEach((order) => {
        const dateKey = new Date(order.createdAt).toLocaleDateString("id-ID", {
          day: "numeric",
          month: "short",
        });
        salesByDate[dateKey] = (salesByDate[dateKey] || 0) + order.total;
      });

      return Object.entries(salesByDate).map(([time, revenue]) => ({
        time,
        pendapatan: revenue,
      }));
    } else {
      // Group by Hour
      const salesByHour: Record<string, number> = {};
      filteredOrders.forEach((order) => {
        const hour = (order.time || "00:00").split(":")[0] + ":00";
        salesByHour[hour] = (salesByHour[hour] || 0) + order.total;
      });

      return Object.entries(salesByHour)
        .map(([time, revenue]) => ({ time, pendapatan: revenue }))
        .sort((a, b) => a.time.localeCompare(b.time));
    }
  }, [filteredOrders, dateFilter]);

  // 4. Export CSV Handler
  const handleExportCSV = () => {
    if (filteredOrders.length === 0) {
      alert("Tidak ada data untuk diekspor.");
      return;
    }

    const headers = ["No Antrean", "Tanggal", "Waktu", "Pelanggan", "Pesanan & Opsi", "Total (Rp)", "Metode Bayar", "Status"];
    const rows = filteredOrders.map((o) => [
      `"${o.id}"`,
      `"${new Date(o.createdAt).toLocaleDateString("id-ID")}"`,
      `"${o.time}"`,
      `"${o.customer.replace(/"/g, '""')}"`,
      `"${o.items.replace(/"/g, '""')}"`,
      o.total,
      `"${o.payment || "QRIS"}"`,
      `"${o.status}"`,
    ]);

    const csvContent = "data:text/csv;charset=utf-8," + [headers.join(","), ...rows.map((e) => e.join(","))].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `Laporan_Penjualan_TitikNgunyah_${dateFilter}_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // 5. Print Handler
  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-8 max-w-7xl">
      {/* Header & Controls */}
      <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-black text-gray-900 tracking-tight">Laporan & Analitik</h2>
          <p className="text-gray-500 text-sm mt-1">Rekapitulasi penjualan, porsi terjual, dan performa omset stand</p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {/* Date Filter Buttons */}
          <div className="bg-white border border-gray-200 p-1 rounded-2xl flex items-center shadow-sm">
            <button
              onClick={() => setDateFilter("today")}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
                dateFilter === "today" ? "bg-[#E53935] text-white shadow-sm" : "text-gray-600 hover:text-gray-900"
              }`}
            >
              Hari Ini
            </button>
            <button
              onClick={() => setDateFilter("yesterday")}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
                dateFilter === "yesterday" ? "bg-[#E53935] text-white shadow-sm" : "text-gray-600 hover:text-gray-900"
              }`}
            >
              Kemarin
            </button>
            <button
              onClick={() => setDateFilter("week")}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
                dateFilter === "week" ? "bg-[#E53935] text-white shadow-sm" : "text-gray-600 hover:text-gray-900"
              }`}
            >
              7 Hari
            </button>
            <button
              onClick={() => setDateFilter("all")}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
                dateFilter === "all" ? "bg-[#E53935] text-white shadow-sm" : "text-gray-600 hover:text-gray-900"
              }`}
            >
              Semua
            </button>
          </div>

          {/* Action Buttons */}
          <button
            onClick={handleExportCSV}
            className="bg-white hover:bg-gray-50 border border-gray-200 text-gray-700 px-4 py-2 rounded-xl font-bold text-xs shadow-sm transition-all active:scale-95 flex items-center gap-2"
          >
            <Download size={14} /> Export CSV
          </button>

          <button
            onClick={handlePrint}
            className="bg-gray-900 hover:bg-black text-white px-4 py-2 rounded-xl font-bold text-xs shadow-sm transition-all active:scale-95 flex items-center gap-2"
          >
            <Printer size={14} /> Cetak Rekap
          </button>

          <button
            onClick={handleRefresh}
            className="bg-white hover:bg-gray-50 border border-gray-200 text-gray-700 p-2 rounded-xl shadow-sm transition-all active:scale-95"
            title="Segarkan data"
          >
            <RotateCw size={16} className={isRefreshing ? "animate-spin text-[#E53935]" : ""} />
          </button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5">
        <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 flex items-center gap-5">
          <div className="w-14 h-14 rounded-2xl flex items-center justify-center bg-emerald-50 text-emerald-600 shrink-0">
            <DollarSign size={28} />
          </div>
          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-gray-400 mb-1">Total Omset</p>
            <p className="text-2xl font-black text-gray-900 tracking-tight">{formatPrice(totalRevenue)}</p>
          </div>
        </div>

        <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 flex items-center gap-5">
          <div className="w-14 h-14 rounded-2xl flex items-center justify-center bg-blue-50 text-blue-600 shrink-0">
            <ShoppingBag size={28} />
          </div>
          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-gray-400 mb-1">Total Transaksi</p>
            <p className="text-2xl font-black text-gray-900 tracking-tight">{totalOrders}</p>
          </div>
        </div>

        <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 flex items-center gap-5">
          <div className="w-14 h-14 rounded-2xl flex items-center justify-center bg-purple-50 text-purple-600 shrink-0">
            <TrendingUp size={28} />
          </div>
          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-gray-400 mb-1">Rata-rata Order</p>
            <p className="text-2xl font-black text-gray-900 tracking-tight">{formatPrice(averageOrderValue)}</p>
          </div>
        </div>

        <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 flex items-center gap-5">
          <div className="w-14 h-14 rounded-2xl flex items-center justify-center bg-amber-50 text-amber-600 shrink-0">
            <Layers size={28} />
          </div>
          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-gray-400 mb-1">Total Porsi Terjual</p>
            <p className="text-2xl font-black text-gray-900 tracking-tight">{totalItemsCount} Porsi</p>
          </div>
        </div>
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Chart 1: Sales Trend */}
        <div className="bg-white p-7 rounded-3xl shadow-sm border border-gray-100 flex flex-col justify-between">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-bold text-gray-900">
              {dateFilter === "all" || dateFilter === "week" ? "Tren Penjualan Harian" : "Tren Penjualan Per Jam"}
            </h3>
            <span className="text-xs font-bold bg-gray-100 text-gray-600 px-3 py-1 rounded-full">
              {filteredOrders.length} transaksi
            </span>
          </div>

          <div className="h-80 w-full">
            {salesTrendData.length === 0 ? (
              <div className="h-full flex items-center justify-center text-gray-400 text-sm">
                Tidak ada data pada periode ini
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={salesTrendData} margin={{ top: 10, right: 20, bottom: 5, left: 10 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F3F4F6" />
                  <XAxis dataKey="time" axisLine={false} tickLine={false} tick={{ fill: "#6B7280", fontSize: 12 }} dy={10} />
                  <YAxis
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: "#6B7280", fontSize: 12 }}
                    tickFormatter={(val) => `Rp ${val / 1000}k`}
                  />
                  <Tooltip
                    formatter={(val) => formatPrice(Number(val))}
                    contentStyle={{ borderRadius: "16px", border: "none", boxShadow: "0 10px 25px -5px rgb(0 0 0 / 0.1)" }}
                  />
                  <Line
                    type="monotone"
                    dataKey="pendapatan"
                    stroke="#E53935"
                    strokeWidth={4}
                    dot={{ r: 5, fill: "#E53935", strokeWidth: 2, stroke: "#FFF" }}
                    activeDot={{ r: 8 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        {/* Chart 2: Top Selling Items */}
        <div className="bg-white p-7 rounded-3xl shadow-sm border border-gray-100 flex flex-col justify-between">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-bold text-gray-900">Menu & Paket Paling Laris</h3>
            <span className="text-xs font-bold bg-red-50 text-[#E53935] px-3 py-1 rounded-full">
              Top Terlaris
            </span>
          </div>

          <div className="h-80 w-full">
            {topSellingData.length === 0 ? (
              <div className="h-full flex items-center justify-center text-gray-400 text-sm">
                Belum ada menu yang terjual pada periode ini
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={topSellingData} layout="vertical" margin={{ top: 5, right: 20, bottom: 5, left: 10 }}>
                  <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#F3F4F6" />
                  <XAxis type="number" axisLine={false} tickLine={false} tick={{ fill: "#6B7280", fontSize: 12 }} />
                  <YAxis
                    dataKey="name"
                    type="category"
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: "#374151", fontSize: 12, fontWeight: 600 }}
                    width={140}
                  />
                  <Tooltip
                    cursor={{ fill: "#F9FAFB" }}
                    formatter={(val) => [`${val} porsi terjual`, "Jumlah"]}
                    contentStyle={{ borderRadius: "16px", border: "none", boxShadow: "0 10px 25px -5px rgb(0 0 0 / 0.1)" }}
                  />
                  <Bar dataKey="terjual" fill="#E53935" radius={[0, 8, 8, 0]} barSize={26} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
