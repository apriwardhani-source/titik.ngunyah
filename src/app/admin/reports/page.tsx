"use client";

import { useState, useEffect, useMemo } from "react";
import { useOrderStore, Order } from "@/store/useOrderStore";
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  AreaChart, Area 
} from "recharts";
import { 
  DollarSign, 
  ShoppingBag, 
  TrendingUp, 
  Download, 
  Printer, 
  Calendar, 
  RotateCw,
  Layers,
  Utensils,
  CreditCard,
  Banknote,
  Gift,
  Sparkles,
  Search,
  CheckCircle2,
  FileSpreadsheet,
  User,
  Coffee,
  Flame,
  Award
} from "lucide-react";
import { formatPrice, getStatusColor } from "@/lib/utils";

export default function ReportsPage() {
  const { orders, fetchOrders } = useOrderStore();
  const [dateFilter, setDateFilter] = useState<"today" | "yesterday" | "week" | "all">("today");
  const [statusFilter, setStatusFilter] = useState<"success" | "all">("success");
  const [paymentFilter, setPaymentFilter] = useState<"all" | "cash" | "qris">("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [isRefreshing, setIsRefreshing] = useState(false);

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await fetchOrders();
    setTimeout(() => setIsRefreshing(false), 500);
  };

  // 1. Filter orders based on date, status & payment method
  const filteredOrders = useMemo(() => {
    const now = new Date();
    const todayStr = now.toDateString();
    
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayStr = yesterday.toDateString();

    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    return orders.filter((o) => {
      // Status filter
      if (statusFilter === "success") {
        if (o.status === "Dibatalkan" || o.status === "Menunggu") return false;
      }

      // Payment method filter
      if (paymentFilter === "cash" && o.payment !== "Tunai") return false;
      if (paymentFilter === "qris" && o.payment !== "QRIS") return false;

      // Search filter
      if (searchTerm.trim() !== "") {
        const term = searchTerm.toLowerCase();
        const matchId = o.id.toLowerCase().includes(term);
        const matchCust = (o.customer || "").toLowerCase().includes(term);
        const matchItems = (o.items || "").toLowerCase().includes(term);
        if (!matchId && !matchCust && !matchItems) return false;
      }

      // Date filter
      const orderDate = new Date(o.createdAt);
      if (isNaN(orderDate.getTime())) return true;

      if (dateFilter === "today") {
        return orderDate.toDateString() === todayStr;
      } else if (dateFilter === "yesterday") {
        return orderDate.toDateString() === yesterdayStr;
      } else if (dateFilter === "week") {
        return orderDate >= sevenDaysAgo;
      }
      return true; // "all"
    });
  }, [orders, dateFilter, statusFilter, paymentFilter, searchTerm]);

  // 2. Financial Metrics Calculations
  const metrics = useMemo(() => {
    let totalRev = 0;
    let cashRev = 0;
    let qrisRev = 0;
    let cashCount = 0;
    let qrisCount = 0;
    let spinCount = 0;
    let spinRev = 0;

    filteredOrders.forEach((o) => {
      totalRev += o.total;
      if (o.payment === "Tunai") {
        cashRev += o.total;
        cashCount += 1;
      } else {
        qrisRev += o.total;
        qrisCount += 1;
      }

      if (o.has_spin || o.spin_reward) {
        spinCount += 1;
        spinRev += 1000;
      }
    });

    const totalCount = filteredOrders.length;
    const aov = totalCount > 0 ? Math.round(totalRev / totalCount) : 0;

    return {
      totalRev,
      cashRev,
      qrisRev,
      cashCount,
      qrisCount,
      totalCount,
      aov,
      spinCount,
      spinRev,
    };
  }, [filteredOrders]);

  // 3. Parse Items for Top Selling Chart & Total Portions
  const { topSellingData, totalPortions } = useMemo(() => {
    const itemCounts: Record<string, number> = {};
    let portions = 0;

    filteredOrders.forEach((order) => {
      if (order.rawItems && order.rawItems.length > 0) {
        order.rawItems.forEach((raw) => {
          const name = raw.menu_name || "Menu";
          const qty = Number(raw.qty || 1);
          itemCounts[name] = (itemCounts[name] || 0) + qty;
          portions += qty;
        });
      } else {
        const items = (order.items || "").split(", ");
        items.forEach((itemStr) => {
          const match = itemStr.match(/^(\d+)x\s+(.+)$/);
          if (match) {
            const qty = parseInt(match[1]);
            const name = match[2];
            itemCounts[name] = (itemCounts[name] || 0) + qty;
            portions += qty;
          } else if (itemStr.trim()) {
            itemCounts[itemStr] = (itemCounts[itemStr] || 0) + 1;
            portions += 1;
          }
        });
      }
    });

    const topSelling = Object.entries(itemCounts)
      .map(([name, count]) => ({ name, terjual: count }))
      .sort((a, b) => b.terjual - a.terjual)
      .slice(0, 6);

    return { topSellingData: topSelling, totalPortions: portions };
  }, [filteredOrders]);

  // 4. Sales Trend Data
  const salesTrendData = useMemo(() => {
    if (dateFilter === "all" || dateFilter === "week") {
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

  // Helper check custom name / pre-order
  const isCustomCustomer = (name: string) => {
    const lower = (name || "").toLowerCase().trim();
    return lower !== "pelanggan kiosk" && lower !== "guest" && lower !== "guest kiosk" && lower !== "";
  };

  // 5. Export to Formatted CSV / Excel (with BOM UTF-8)
  const handleExportCSV = () => {
    if (filteredOrders.length === 0) {
      alert("Tidak ada data transaksi untuk diekspor pada filter ini.");
      return;
    }

    const dateTitle = dateFilter === "today" ? "Hari Ini" : dateFilter === "yesterday" ? "Kemarin" : dateFilter === "week" ? "7 Hari Terakhir" : "Semua Periode";
    const exportTime = new Date().toLocaleString("id-ID");

    const lines: string[] = [];

    // Title & Metadata header in Excel
    lines.push(`"REKAPITULASI PENJUALAN TITIK NGUNYAH"`);
    lines.push(`"Periode Data:","${dateTitle}"`);
    lines.push(`"Waktu Unduh:","${exportTime}"`);
    lines.push(`"Total Omzet:","Rp ${metrics.totalRev.toLocaleString('id-ID')}"`);
    lines.push(`"Total Kas Tunai:","Rp ${metrics.cashRev.toLocaleString('id-ID')} (${metrics.cashCount} transaksi)"`);
    lines.push(`"Total Saldo QRIS:","Rp ${metrics.qrisRev.toLocaleString('id-ID')} (${metrics.qrisCount} transaksi)"`);
    lines.push(`"Total Transaksi:","${metrics.totalCount}"`);
    lines.push(`"Total Porsi Terjual:","${totalPortions} Porsi"`);
    lines.push(`""`); // Empty line

    // Table Column Headers
    const headers = [
      "No",
      "No Antrean",
      "Tanggal",
      "Jam",
      "Nama Pemesan / Pelanggan",
      "Tipe Order",
      "Rincian Menu & Catatan",
      "Porsi",
      "Hadiah Lucky Spin",
      "Metode Pembayaran",
      "Status Pesanan",
      "Total Omzet (Rp)"
    ];
    lines.push(headers.map(h => `"${h}"`).join(","));

    // Table Data Rows
    filteredOrders.forEach((o, idx) => {
      const isPreOrder = isCustomCustomer(o.customer);
      const dateStr = new Date(o.createdAt).toLocaleDateString("id-ID");
      const cleanItems = (o.items || "").replace(/"/g, '""');
      const cleanCustomer = (o.customer || "Pelanggan Kiosk").replace(/"/g, '""');
      const spinReward = o.spin_reward ? `"${o.spin_reward.replace(/"/g, '""')}"` : `"-"`;
      
      const itemPortionCount = (o.rawItems && o.rawItems.length > 0)
        ? o.rawItems.reduce((sum, item) => sum + (item.qty || 1), 0)
        : 1;

      const row = [
        idx + 1,
        `"${o.id}"`,
        `"${dateStr}"`,
        `"${o.time || "-"}"`,
        `"${cleanCustomer}"`,
        `"${isPreOrder ? "Pre-Order / Khusus" : "Kiosk Stand"}"`,
        `"${cleanItems}"`,
        itemPortionCount,
        spinReward,
        `"${o.payment || "QRIS"}"`,
        `"${o.status}"`,
        o.total // Numeric for Excel formulas
      ];
      lines.push(row.join(","));
    });

    // Summary Footer Rows in Excel
    lines.push(`""`);
    lines.push(`"RINGKASAN AKHIR"`);
    lines.push(`"","","","","","","TOTAL OMZET KESELURUHAN:","${totalPortions} Porsi","","","","${metrics.totalRev}"`);
    lines.push(`"","","","","","","TOTAL KAS TUNAI (LACI):","${metrics.cashCount} Trx","","","","${metrics.cashRev}"`);
    lines.push(`"","","","","","","TOTAL SALDO QRIS (BANK):","${metrics.qrisCount} Trx","","","","${metrics.qrisRev}"`);

    // Add UTF-8 BOM so Excel opens with proper Indonesian accents & symbols
    const csvContent = "\uFEFF" + lines.join("\r\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", `Laporan_TitikNgunyah_${dateFilter}_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  // 6. Print Handler
  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-7 max-w-7xl font-sans pb-10">
      {/* Header & Controls (Hidden in Print) */}
      <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-4 print:hidden">
        <div>
          <div className="flex items-center gap-3">
            <h2 className="text-3xl font-black text-gray-900 tracking-tight">Laporan & Analitik Keuangan</h2>
            <span className="bg-[#b80000] text-[#ffde59] text-xs font-black px-3 py-1 rounded-full shadow-sm">
              Live Real-Time
            </span>
          </div>
          <p className="text-gray-500 text-sm mt-1">Rekapitulasi penjualan stand bazar, kas tunai vs QRIS, dan performa menu</p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {/* Date Filter Buttons */}
          <div className="bg-white border-2 border-amber-200 p-1 rounded-2xl flex items-center shadow-sm">
            <button
              onClick={() => setDateFilter("today")}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-black transition-all ${
                dateFilter === "today" ? "bg-[#b80000] text-[#ffde59] shadow-sm" : "text-gray-600 hover:text-gray-900"
              }`}
            >
              Hari Ini
            </button>
            <button
              onClick={() => setDateFilter("yesterday")}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-black transition-all ${
                dateFilter === "yesterday" ? "bg-[#b80000] text-[#ffde59] shadow-sm" : "text-gray-600 hover:text-gray-900"
              }`}
            >
              Kemarin
            </button>
            <button
              onClick={() => setDateFilter("week")}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-black transition-all ${
                dateFilter === "week" ? "bg-[#b80000] text-[#ffde59] shadow-sm" : "text-gray-600 hover:text-gray-900"
              }`}
            >
              7 Hari
            </button>
            <button
              onClick={() => setDateFilter("all")}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-black transition-all ${
                dateFilter === "all" ? "bg-[#b80000] text-[#ffde59] shadow-sm" : "text-gray-600 hover:text-gray-900"
              }`}
            >
              Semua
            </button>
          </div>

          {/* Export to Excel / CSV */}
          <button
            onClick={handleExportCSV}
            className="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2.5 rounded-xl font-black text-xs shadow-md transition-all active:scale-95 flex items-center gap-2"
            title="Download file Excel (.csv)"
          >
            <FileSpreadsheet size={16} />
            <span>Export Excel</span>
          </button>

          {/* Cetak Rekap */}
          <button
            onClick={handlePrint}
            className="bg-gray-900 hover:bg-black text-white px-4 py-2.5 rounded-xl font-black text-xs shadow-md transition-all active:scale-95 flex items-center gap-2"
          >
            <Printer size={16} />
            <span>Cetak Rekap</span>
          </button>

          {/* Refresh Data */}
          <button
            onClick={handleRefresh}
            className="bg-white hover:bg-gray-50 border border-gray-200 text-gray-700 p-2.5 rounded-xl shadow-sm transition-all active:scale-95"
            title="Segarkan data"
          >
            <RotateCw size={16} className={isRefreshing ? "animate-spin text-[#b80000]" : ""} />
          </button>
        </div>
      </div>

      {/* PRINT HEADER ONLY (Visible when Printing) */}
      <div className="hidden print:block border-b-2 border-black pb-4 mb-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-black uppercase tracking-wider">TITIK NGUNYAH — LAPORAN PENJUALAN</h1>
            <p className="text-sm font-bold text-gray-700 mt-0.5">Bazar Technopreneurship Politala 2026</p>
          </div>
          <div className="text-right text-xs">
            <p><strong>Periode:</strong> {dateFilter.toUpperCase()}</p>
            <p><strong>Dicetak:</strong> {new Date().toLocaleString("id-ID")}</p>
          </div>
        </div>
      </div>

      {/* 6 Key Financial KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        {/* Total Omzet */}
        <div className="bg-white p-5 rounded-3xl shadow-sm border-2 border-amber-200 flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-black uppercase tracking-wider text-gray-500">Total Omzet</span>
            <div className="w-9 h-9 rounded-xl flex items-center justify-center bg-red-50 text-[#b80000]">
              <DollarSign size={20} />
            </div>
          </div>
          <div className="mt-3">
            <p className="text-2xl font-black text-[#b80000] tracking-tight">{formatPrice(metrics.totalRev)}</p>
            <p className="text-[10px] font-bold text-gray-400 mt-0.5">Semua metode bayar</p>
          </div>
        </div>

        {/* Uang Kas Tunai (Laci) */}
        <div className="bg-white p-5 rounded-3xl shadow-sm border-2 border-emerald-200 flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-black uppercase tracking-wider text-emerald-800">Kas Tunai (Laci)</span>
            <div className="w-9 h-9 rounded-xl flex items-center justify-center bg-emerald-50 text-emerald-600">
              <Banknote size={20} />
            </div>
          </div>
          <div className="mt-3">
            <p className="text-2xl font-black text-emerald-700 tracking-tight">{formatPrice(metrics.cashRev)}</p>
            <p className="text-[10px] font-bold text-emerald-600 mt-0.5">{metrics.cashCount} transaksi tunai</p>
          </div>
        </div>

        {/* Saldo QRIS / Bank */}
        <div className="bg-white p-5 rounded-3xl shadow-sm border-2 border-blue-200 flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-black uppercase tracking-wider text-blue-800">Saldo QRIS</span>
            <div className="w-9 h-9 rounded-xl flex items-center justify-center bg-blue-50 text-blue-600">
              <CreditCard size={20} />
            </div>
          </div>
          <div className="mt-3">
            <p className="text-2xl font-black text-blue-700 tracking-tight">{formatPrice(metrics.qrisRev)}</p>
            <p className="text-[10px] font-bold text-blue-600 mt-0.5">{metrics.qrisCount} transaksi QRIS</p>
          </div>
        </div>

        {/* Total Transaksi */}
        <div className="bg-white p-5 rounded-3xl shadow-sm border border-gray-100 flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-black uppercase tracking-wider text-gray-500">Total Transaksi</span>
            <div className="w-9 h-9 rounded-xl flex items-center justify-center bg-purple-50 text-purple-600">
              <ShoppingBag size={20} />
            </div>
          </div>
          <div className="mt-3">
            <p className="text-2xl font-black text-gray-900 tracking-tight">{metrics.totalCount}</p>
            <p className="text-[10px] font-bold text-gray-400 mt-0.5">Rata-rata: {formatPrice(metrics.aov)}</p>
          </div>
        </div>

        {/* Total Porsi Terjual */}
        <div className="bg-white p-5 rounded-3xl shadow-sm border border-gray-100 flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-black uppercase tracking-wider text-gray-500">Porsi Terjual</span>
            <div className="w-9 h-9 rounded-xl flex items-center justify-center bg-amber-50 text-amber-600">
              <Layers size={20} />
            </div>
          </div>
          <div className="mt-3">
            <p className="text-2xl font-black text-gray-900 tracking-tight">{totalPortions} Porsi</p>
            <p className="text-[10px] font-bold text-gray-400 mt-0.5">Kebab, porsi & minuman</p>
          </div>
        </div>

        {/* Omzet Spin Tambahan */}
        <div className="bg-gradient-to-br from-amber-50 to-yellow-50 p-5 rounded-3xl shadow-sm border-2 border-amber-300 flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-black uppercase tracking-wider text-[#b80000]">Lucky Spin (1k)</span>
            <div className="w-9 h-9 rounded-xl flex items-center justify-center bg-[#b80000] text-[#ffde59]">
              <Gift size={18} />
            </div>
          </div>
          <div className="mt-3">
            <p className="text-2xl font-black text-gray-900 tracking-tight">+{formatPrice(metrics.spinRev)}</p>
            <p className="text-[10px] font-black text-[#b80000] mt-0.5">{metrics.spinCount} pelanggan spin</p>
          </div>
        </div>
      </div>

      {/* Visual Charts Grid (Screen Only) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-7 print:hidden">
        {/* Chart 1: Sales Trend */}
        <div className="bg-white p-6 sm:p-7 rounded-3xl shadow-sm border border-gray-100 flex flex-col justify-between">
          <div className="flex items-center justify-between mb-5">
            <div>
              <h3 className="text-lg font-black text-gray-900">
                {dateFilter === "all" || dateFilter === "week" ? "Tren Penjualan Harian" : "Tren Penjualan Per Jam"}
              </h3>
              <p className="text-xs text-gray-400 mt-0.5">Grafik pergerakan omset masuk</p>
            </div>
            <span className="text-xs font-black bg-amber-50 text-[#b80000] border border-amber-200 px-3 py-1 rounded-full">
              {filteredOrders.length} transaksi
            </span>
          </div>

          <div className="h-72 w-full">
            {salesTrendData.length === 0 ? (
              <div className="h-full flex items-center justify-center text-gray-400 text-sm font-bold">
                Tidak ada data transaksi pada periode ini
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={salesTrendData} margin={{ top: 10, right: 10, bottom: 5, left: 10 }}>
                  <defs>
                    <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#b80000" stopOpacity={0.4}/>
                      <stop offset="95%" stopColor="#b80000" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F3F4F6" />
                  <XAxis dataKey="time" axisLine={false} tickLine={false} tick={{ fill: "#6B7280", fontSize: 11, fontWeight: 600 }} dy={10} />
                  <YAxis
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: "#6B7280", fontSize: 11, fontWeight: 600 }}
                    tickFormatter={(val) => `Rp ${val / 1000}k`}
                  />
                  <Tooltip
                    formatter={(val) => [formatPrice(Number(val)), "Omzet"]}
                    contentStyle={{ borderRadius: "16px", border: "2px solid #ffde59", boxShadow: "0 10px 25px -5px rgb(0 0 0 / 0.1)" }}
                  />
                  <Area
                    type="monotone"
                    dataKey="pendapatan"
                    stroke="#b80000"
                    strokeWidth={3}
                    fillOpacity={1}
                    fill="url(#colorRevenue)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        {/* Chart 2: Top Selling Items */}
        <div className="bg-white p-6 sm:p-7 rounded-3xl shadow-sm border border-gray-100 flex flex-col justify-between">
          <div className="flex items-center justify-between mb-5">
            <div>
              <h3 className="text-lg font-black text-gray-900">Menu Paling Laris (Top 6)</h3>
              <p className="text-xs text-gray-400 mt-0.5">Berdasarkan total porsi yang terjual</p>
            </div>
            <span className="text-xs font-black bg-red-50 text-[#b80000] border border-red-100 px-3 py-1 rounded-full flex items-center gap-1">
              <Award size={13} /> Terfavorit
            </span>
          </div>

          <div className="h-72 w-full">
            {topSellingData.length === 0 ? (
              <div className="h-full flex items-center justify-center text-gray-400 text-sm font-bold">
                Belum ada menu yang terjual pada periode ini
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={topSellingData} layout="vertical" margin={{ top: 5, right: 20, bottom: 5, left: 10 }}>
                  <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#F3F4F6" />
                  <XAxis type="number" axisLine={false} tickLine={false} tick={{ fill: "#6B7280", fontSize: 11 }} />
                  <YAxis
                    dataKey="name"
                    type="category"
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: "#374151", fontSize: 12, fontWeight: 700 }}
                    width={150}
                  />
                  <Tooltip
                    cursor={{ fill: "#FFFDF0" }}
                    formatter={(val) => [`${val} porsi terjual`, "Jumlah"]}
                    contentStyle={{ borderRadius: "16px", border: "2px solid #ffde59", boxShadow: "0 10px 25px -5px rgb(0 0 0 / 0.1)" }}
                  />
                  <Bar dataKey="terjual" fill="#b80000" radius={[0, 8, 8, 0]} barSize={24} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>
      </div>

      {/* REKAP DETAIL TRANSAKSI (Tabel Lengkap Siap Cetak & Pantau) */}
      <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
        {/* Table Header Filter (Screen only) */}
        <div className="p-5 sm:p-6 border-b border-gray-100 flex flex-col md:flex-row md:items-center justify-between gap-4 print:hidden bg-gray-50/50">
          <div>
            <h3 className="text-xl font-black text-gray-900">Rincian Transaksi Penjualan</h3>
            <p className="text-xs text-gray-500 mt-0.5">Daftar transaksi pesanan masuk, pre-order, dan detail menu</p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {/* Search */}
            <div className="relative min-w-[200px]">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={14} />
              <input
                type="text"
                placeholder="Cari antrean / pemesan..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-8 pr-3 py-2 bg-white border border-gray-200 rounded-xl text-xs font-bold focus:outline-none focus:ring-2 focus:ring-[#b80000]"
              />
            </div>

            {/* Payment Filter */}
            <select
              value={paymentFilter}
              onChange={(e) => setPaymentFilter(e.target.value as any)}
              className="bg-white border border-gray-200 rounded-xl px-3 py-2 text-xs font-bold text-gray-700 outline-none"
            >
              <option value="all">Semua Metode</option>
              <option value="cash">💵 Hanya Tunai</option>
              <option value="qris">📱 Hanya QRIS</option>
            </select>
          </div>
        </div>

        {/* Table content */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-sm">
            <thead className="bg-gray-100/80 text-gray-600 text-xs font-black uppercase tracking-wider border-b border-gray-200">
              <tr>
                <th className="px-5 py-3.5">No Antrean</th>
                <th className="px-5 py-3.5">Waktu</th>
                <th className="px-5 py-3.5">Nama Pemesan / Pelanggan</th>
                <th className="px-5 py-3.5">Rincian Menu & Catatan</th>
                <th className="px-5 py-3.5">Metode Bayar</th>
                <th className="px-5 py-3.5">Hadiah Spin</th>
                <th className="px-5 py-3.5">Status</th>
                <th className="px-5 py-3.5 text-right">Total (Rp)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredOrders.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-6 py-12 text-center text-gray-400 font-bold">
                    Tidak ada riwayat transaksi yang cocok dengan filter.
                  </td>
                </tr>
              ) : (
                filteredOrders.map((order, idx) => {
                  const isPreOrder = isCustomCustomer(order.customer);

                  return (
                    <tr key={order.id || idx} className="hover:bg-gray-50/70 transition-colors">
                      <td className="px-5 py-3.5 font-black text-base text-[#b80000]">{order.id}</td>
                      <td className="px-5 py-3.5 text-xs text-gray-500 font-medium whitespace-nowrap">
                        {order.time || "-"}
                        <span className="block text-[10px] text-gray-400">
                          {new Date(order.createdAt).toLocaleDateString("id-ID", { day: "numeric", month: "short" })}
                        </span>
                      </td>
                      <td className="px-5 py-3.5">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-gray-900 leading-tight">{order.customer}</span>
                          {isPreOrder && (
                            <span className="bg-[#ffde59] text-[#b80000] text-[9px] font-black px-1.5 py-0.2 rounded border border-amber-300 uppercase tracking-wider shrink-0">
                              Pre-Order
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="px-5 py-3.5 max-w-xs text-xs text-gray-700">
                        {order.rawItems && order.rawItems.length > 0 ? (
                          <div className="space-y-0.5">
                            {order.rawItems.map((item, iIdx) => (
                              <div key={iIdx}>
                                <span className="font-bold text-gray-900">{item.qty}x {item.menu_name}</span>
                                {item.notes && <span className="text-gray-500 block italic text-[11px]">↳ {item.notes}</span>}
                              </div>
                            ))}
                          </div>
                        ) : (
                          <span>{order.items}</span>
                        )}
                      </td>
                      <td className="px-5 py-3.5 text-xs font-bold text-gray-700 whitespace-nowrap">
                        <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg ${
                          order.payment === "Tunai" ? "bg-emerald-50 text-emerald-700 border border-emerald-200" : "bg-blue-50 text-blue-700 border border-blue-200"
                        }`}>
                          {order.payment === "Tunai" ? <Banknote size={13} /> : <CreditCard size={13} />}
                          {order.payment}
                        </span>
                      </td>
                      <td className="px-5 py-3.5 text-xs font-bold">
                        {order.spin_reward ? (
                          <span className="inline-flex items-center gap-1 text-[#b80000] bg-amber-100 border border-amber-300 px-2 py-0.5 rounded-md text-[11px]">
                            🎁 {order.spin_reward}
                          </span>
                        ) : (
                          <span className="text-gray-400">-</span>
                        )}
                      </td>
                      <td className="px-5 py-3.5 whitespace-nowrap">
                        <span className={`inline-block px-2.5 py-0.5 rounded-full text-[11px] font-black border ${getStatusColor(order.status)}`}>
                          {order.status}
                        </span>
                      </td>
                      <td className="px-5 py-3.5 text-right font-black text-gray-900 whitespace-nowrap">
                        {formatPrice(order.total)}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
            {/* Table Footer Total */}
            {filteredOrders.length > 0 && (
              <tfoot className="bg-gray-50 border-t-2 border-gray-200 font-black text-sm">
                <tr>
                  <td colSpan={4} className="px-5 py-4 text-gray-900">
                    TOTAL KESELURUHAN ({filteredOrders.length} Transaksi, {totalPortions} Porsi)
                  </td>
                  <td colSpan={3} className="px-5 py-4 text-xs text-gray-600">
                    Tunai: {formatPrice(metrics.cashRev)} | QRIS: {formatPrice(metrics.qrisRev)}
                  </td>
                  <td className="px-5 py-4 text-right text-base text-[#b80000]">
                    {formatPrice(metrics.totalRev)}
                  </td>
                </tr>
              </tfoot>
            )}
          </table>
        </div>
      </div>

      {/* PRINT FOOTER SIGNATURE SECTION */}
      <div className="hidden print:flex justify-between items-center mt-12 pt-6 border-t border-gray-300 text-xs text-gray-700">
        <div className="text-center w-48">
          <p className="font-bold mb-16">Petugas Kasir,</p>
          <p className="border-t border-gray-400 pt-1 font-bold">( .................................... )</p>
        </div>
        <div className="text-center w-48">
          <p className="font-bold mb-16">Penanggung Jawab Stand,</p>
          <p className="border-t border-gray-400 pt-1 font-bold">( .................................... )</p>
        </div>
      </div>
    </div>
  );
}
