"use client";

import { useState, useEffect } from "react";
import { useOrderStore, Order } from "@/store/useOrderStore";
import { echo } from "@/lib/echo";

export default function OrdersPage() {
  const { orders, updateOrderStatus, fetchOrders } = useOrderStore();
  const [search, setSearch] = useState("");
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

  const statuses = ["Menunggu", "Dibayar", "Disiapkan", "Siap", "Selesai", "Dibatalkan"];

  const getStatusColor = (status: string) => {
    switch(status) {
      case "Menunggu": return "bg-orange-100 text-orange-700 border-orange-200";
      case "Dibayar": return "bg-yellow-100 text-yellow-700 border-yellow-200";
      case "Disiapkan": return "bg-blue-100 text-blue-700 border-blue-200";
      case "Siap": return "bg-green-100 text-green-700 border-green-200";
      case "Selesai": return "bg-gray-100 text-gray-700 border-gray-200";
      case "Dibatalkan": return "bg-red-100 text-red-700 border-red-200";
      default: return "bg-gray-100 text-gray-700";
    }
  };

  useEffect(() => {
    fetchOrders();

    if (echo) {
      const channel = echo.channel('orders');
      channel.listen('OrderPaid', (e: any) => {
        // Refresh orders when a payment is successful
        fetchOrders();
      });

      return () => {
        channel.stopListening('OrderPaid');
      };
    }
  }, [fetchOrders]);

  const filteredOrders = orders.filter(order => 
    order.id.toLowerCase().includes(search.toLowerCase()) || 
    order.customer.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-8 h-full flex flex-col relative">
      <div className="flex justify-between items-center shrink-0">
        <h2 className="text-3xl font-bold text-gray-900">Manajemen Pesanan</h2>
        <div className="flex gap-4">
          <input 
            type="text" 
            placeholder="Cari No Antrean..." 
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#E53935]"
          />
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 flex-1 flex flex-col overflow-hidden">
        <div className="overflow-x-auto flex-1">
          <table className="w-full text-left border-collapse">
            <thead className="bg-gray-50 text-gray-500 text-sm font-medium sticky top-0 z-10 shadow-sm">
              <tr>
                <th className="px-6 py-4 border-b border-gray-100">No Antrean</th>
                <th className="px-6 py-4 border-b border-gray-100">Pelanggan</th>
                <th className="px-6 py-4 border-b border-gray-100">Pesanan</th>
                <th className="px-6 py-4 border-b border-gray-100">Pembayaran</th>
                <th className="px-6 py-4 border-b border-gray-100">Waktu</th>
                <th className="px-6 py-4 border-b border-gray-100">Status</th>
                <th className="px-6 py-4 border-b border-gray-100">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 text-sm">
              {filteredOrders.length > 0 ? filteredOrders.map((order) => (
                <tr key={order.id} className="hover:bg-gray-50/50 transition-colors">
                  <td className="px-6 py-4 font-black text-lg text-gray-900">{order.id}</td>
                  <td className="px-6 py-4 text-gray-700 font-medium">{order.customer}</td>
                  <td className="px-6 py-4 text-gray-600 max-w-xs truncate">{order.items}</td>
                  <td className="px-6 py-4 font-semibold text-gray-700">{order.payment}</td>
                  <td className="px-6 py-4 text-gray-500 font-medium">{order.time}</td>
                  <td className="px-6 py-4">
                    <select
                      className={`px-3 py-1.5 rounded-full text-xs font-bold border outline-none cursor-pointer appearance-none ${getStatusColor(order.status)}`}
                      value={order.status}
                      onChange={(e) => {
                        updateOrderStatus(order.id, e.target.value);
                      }}
                    >
                      {statuses.map(s => <option key={s} value={s}>{s}</option>)}
                    </select>
                  </td>
                  <td className="px-6 py-4">
                    <button 
                      onClick={() => setSelectedOrder(order)}
                      className="text-[#E53935] font-bold hover:text-[#C62828] transition-colors"
                    >
                      Lihat Detail
                    </button>
                  </td>
                </tr>
              )) : (
                <tr>
                  <td colSpan={7} className="px-6 py-8 text-center text-gray-500">
                    Tidak ada pesanan yang ditemukan.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal Detail Pesanan */}
      {selectedOrder && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white p-8 rounded-2xl w-full max-w-md shadow-2xl relative">
            <h3 className="text-2xl font-bold mb-2">Detail Pesanan</h3>
            <p className="text-[#E53935] font-black text-3xl mb-6">{selectedOrder.id}</p>
            
            <div className="space-y-4 mb-8">
              <div className="flex justify-between border-b pb-2">
                <span className="text-gray-500">Waktu</span>
                <span className="font-semibold text-gray-900">{selectedOrder.time}</span>
              </div>
              <div className="flex justify-between border-b pb-2">
                <span className="text-gray-500">Pelanggan</span>
                <span className="font-semibold text-gray-900">{selectedOrder.customer}</span>
              </div>
              <div className="flex justify-between border-b pb-2">
                <span className="text-gray-500">Pembayaran</span>
                <span className="font-semibold text-gray-900">{selectedOrder.payment} ({selectedOrder.status})</span>
              </div>
              <div>
                <span className="text-gray-500 block mb-2">Daftar Item:</span>
                <p className="font-medium text-gray-900 bg-gray-50 p-3 rounded-lg border leading-relaxed">
                  {selectedOrder.items}
                </p>
              </div>
              <div className="flex justify-between border-t pt-4 mt-4">
                <span className="text-gray-900 font-bold text-xl">Total</span>
                <span className="text-[#E53935] font-black text-xl">{selectedOrder.formattedTotal}</span>
              </div>
            </div>

            <button 
              onClick={() => setSelectedOrder(null)} 
              className="w-full py-3 font-bold bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 transition-colors"
            >
              Tutup
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
