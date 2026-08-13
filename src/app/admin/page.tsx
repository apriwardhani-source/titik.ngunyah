"use client";

import { useEffect } from "react";
import { DollarSign, ShoppingBag, Clock, CheckCircle2 } from "lucide-react";
import { useOrderStore } from "@/store/useOrderStore";
import { formatPrice, getStatusColor } from "@/lib/utils";
import Link from "next/link";

export default function AdminDashboard() {
  const { orders, fetchOrders } = useOrderStore();
  
  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  const recentOrders = orders.slice(0, 5); // Take the latest 5 orders
  
  // Calculate dynamic stats
  const todaysOrders = orders.filter(o => new Date(o.createdAt).toDateString() === new Date().toDateString());
  const todayRevenue = todaysOrders.reduce((sum, o) => sum + o.total, 0);
  const pendingCount = todaysOrders.filter(o => o.status === "Menunggu").length;
  const completedCount = todaysOrders.filter(o => o.status === "Selesai").length;

  const stats = [
    { name: "Pendapatan Hari Ini", value: formatPrice(todayRevenue), icon: DollarSign, color: "text-green-600", bg: "bg-green-100" },
    { name: "Total Pesanan", value: todaysOrders.length.toString(), icon: ShoppingBag, color: "text-blue-600", bg: "bg-blue-100" },
    { name: "Pesanan Menunggu", value: pendingCount.toString(), icon: Clock, color: "text-orange-600", bg: "bg-orange-100" },
    { name: "Pesanan Selesai", value: completedCount.toString(), icon: CheckCircle2, color: "text-purple-600", bg: "bg-purple-100" },
  ];

  return (
    <div className="space-y-8">
      <h2 className="text-3xl font-bold text-gray-900">Ringkasan Dashboard</h2>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <div key={stat.name} className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center gap-6">
              <div className={`w-14 h-14 rounded-xl flex items-center justify-center ${stat.bg} ${stat.color}`}>
                <Icon size={28} />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500 mb-1">{stat.name}</p>
                <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Recent Orders Table */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-6 border-b border-gray-100 flex justify-between items-center">
          <h3 className="text-xl font-bold text-gray-900">Pesanan Terbaru</h3>
          <Link href="/admin/orders" className="text-sm font-semibold text-[#E53935] hover:text-[#C62828]">Lihat Semua</Link>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-gray-50 text-gray-500 text-sm font-medium">
              <tr>
                <th className="px-6 py-4">No Antrean</th>
                <th className="px-6 py-4">Pesanan</th>
                <th className="px-6 py-4">Total</th>
                <th className="px-6 py-4">Waktu</th>
                <th className="px-6 py-4">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 text-sm">
              {recentOrders.map((order) => (
                <tr key={order.id} className="hover:bg-gray-50/50 transition-colors">
                  <td className="px-6 py-4 font-bold text-gray-900">{order.id}</td>
                  <td className="px-6 py-4 text-gray-600">{order.items}</td>
                  <td className="px-6 py-4 font-medium text-gray-900">{order.formattedTotal}</td>
                  <td className="px-6 py-4 text-gray-500">{order.time}</td>
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
      </div>
    </div>
  );
}
