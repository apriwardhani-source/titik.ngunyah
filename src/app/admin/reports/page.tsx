"use client";

import { useOrderStore } from "@/store/useOrderStore";
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  LineChart, Line 
} from "recharts";
import { DollarSign, ShoppingBag, TrendingUp } from "lucide-react";

export default function ReportsPage() {
  const { orders } = useOrderStore();

  // 1. Calculate Summary Stats
  const totalRevenue = orders.reduce((sum, o) => sum + o.total, 0);
  const totalOrders = orders.length;
  const averageOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", maximumFractionDigits: 0 }).format(price);
  };

  // 2. Parse Items for Top Selling Chart
  const itemCounts: Record<string, number> = {};
  orders.forEach(order => {
    const items = order.items.split(', ');
    items.forEach(itemStr => {
      // e.g. "2x Paket Ngunyah Mix"
      const match = itemStr.match(/^(\d+)x\s+(.+)$/);
      if (match) {
        const qty = parseInt(match[1]);
        const name = match[2];
        if (!itemCounts[name]) itemCounts[name] = 0;
        itemCounts[name] += qty;
      }
    });
  });

  const topSellingData = Object.entries(itemCounts)
    .map(([name, count]) => ({ name, terjual: count }))
    .sort((a, b) => b.terjual - a.terjual)
    .slice(0, 5); // Top 5

  // 3. Prepare Sales over time (grouping by hour based on 'time' field like "10:24")
  const salesByHour: Record<string, number> = {};
  orders.forEach(order => {
    const hour = order.time.split(':')[0] + ":00";
    if (!salesByHour[hour]) salesByHour[hour] = 0;
    salesByHour[hour] += order.total;
  });

  const salesTrendData = Object.entries(salesByHour)
    .map(([time, revenue]) => ({ time, pendapatan: revenue }))
    .sort((a, b) => a.time.localeCompare(b.time));

  return (
    <div className="space-y-8">
      <h2 className="text-3xl font-bold text-gray-900">Laporan & Analitik</h2>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center gap-6">
          <div className="w-14 h-14 rounded-xl flex items-center justify-center bg-green-100 text-green-600">
            <DollarSign size={28} />
          </div>
          <div>
            <p className="text-sm font-medium text-gray-500 mb-1">Total Pendapatan</p>
            <p className="text-2xl font-bold text-gray-900">{formatPrice(totalRevenue)}</p>
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center gap-6">
          <div className="w-14 h-14 rounded-xl flex items-center justify-center bg-blue-100 text-blue-600">
            <ShoppingBag size={28} />
          </div>
          <div>
            <p className="text-sm font-medium text-gray-500 mb-1">Total Pesanan</p>
            <p className="text-2xl font-bold text-gray-900">{totalOrders}</p>
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center gap-6">
          <div className="w-14 h-14 rounded-xl flex items-center justify-center bg-purple-100 text-purple-600">
            <TrendingUp size={28} />
          </div>
          <div>
            <p className="text-sm font-medium text-gray-500 mb-1">Rata-rata Nilai Pesanan</p>
            <p className="text-2xl font-bold text-gray-900">{formatPrice(averageOrderValue)}</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Chart 1: Sales Trend */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
          <h3 className="text-xl font-bold text-gray-900 mb-6">Tren Pendapatan Hari Ini</h3>
          <div className="h-80 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={salesTrendData} margin={{ top: 5, right: 20, bottom: 5, left: 20 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                <XAxis dataKey="time" axisLine={false} tickLine={false} tick={{fill: '#6B7280'}} dy={10} />
                <YAxis 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{fill: '#6B7280'}}
                  tickFormatter={(value) => `Rp ${value/1000}k`}
                />
                <Tooltip 
                  formatter={(value: number) => formatPrice(value)}
                  contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                />
                <Line type="monotone" dataKey="pendapatan" stroke="#E53935" strokeWidth={4} dot={{r: 6, fill: '#E53935', strokeWidth: 2, stroke: 'white'}} activeDot={{r: 8}} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Chart 2: Top Selling Items */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
          <h3 className="text-xl font-bold text-gray-900 mb-6">Menu Terlaris</h3>
          <div className="h-80 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={topSellingData} layout="vertical" margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
                <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#E5E7EB" />
                <XAxis type="number" axisLine={false} tickLine={false} tick={{fill: '#6B7280'}} />
                <YAxis dataKey="name" type="category" axisLine={false} tickLine={false} tick={{fill: '#374151', fontWeight: 500}} width={150} />
                <Tooltip 
                  cursor={{fill: '#F3F4F6'}}
                  contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                />
                <Bar dataKey="terjual" fill="#E53935" radius={[0, 4, 4, 0]} barSize={32} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
}
