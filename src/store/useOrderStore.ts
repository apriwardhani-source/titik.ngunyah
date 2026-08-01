import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface Order {
  id: string; // queue_number or order_number
  customer: string;
  items: string;
  total: number;
  formattedTotal: string;
  payment: string;
  status: string;
  time: string;
  createdAt: number;
  db_id?: number; // Internal ID
}

interface OrderState {
  orders: Order[];
  addOrder: (order: Order) => void;
  updateOrderStatus: (id: string, status: string) => void;
  fetchOrders: () => Promise<void>;
}

export const useOrderStore = create<OrderState>()(
  persist(
    (set) => ({
      orders: [],
      addOrder: (order) => set((state) => ({ orders: [order, ...state.orders] })),
      updateOrderStatus: async (id, status) => {
        // Map frontend statuses to backend statuses
        let backendStatus = 'waiting_for_kitchen';
        if (status === 'Menunggu') backendStatus = 'pending';
        else if (status === 'Dibayar' || status === 'Disiapkan') backendStatus = 'preparing';
        else if (status === 'Siap') backendStatus = 'ready';
        else if (status === 'Selesai') backendStatus = 'completed';
        else if (status === 'Dibatalkan') backendStatus = 'cancelled';

        try {
          const order = get().orders.find(o => o.id === id);
          if (order && order.db_id) {
            const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8000/api';
            await fetch(`${apiUrl}/orders/${order.db_id}/status`, {
              method: 'PUT',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ status: backendStatus })
            });
            get().fetchOrders(); // Refetch after updating
          }
        } catch (error) {
          console.error("Failed to update status", error);
        }
      },
      fetchOrders: async () => {
        try {
          const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8000/api';
          const res = await fetch(`${apiUrl}/orders`);
          const data = await res.json();
          if (data.status === 'success') {
            const mappedOrders = data.data.map((order: any) => {
              const formattedTotal = new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", maximumFractionDigits: 0 }).format(order.total);
              const itemsText = order.items.map((i: any) => `${i.qty}x ${i.menu.name}`).join(", ");
              const time = new Date(order.created_at).toLocaleTimeString("id-ID", { hour: '2-digit', minute: '2-digit' });
              
              let statusText = "Menunggu";
              if (order.order_status === "waiting_for_kitchen" || order.order_status === "preparing") statusText = "Disiapkan";
              else if (order.order_status === "ready") statusText = "Siap";
              else if (order.order_status === "completed") statusText = "Selesai";
              else if (order.order_status === "cancelled") statusText = "Dibatalkan";
              
              return {
                id: order.queue_number || order.order_number,
                customer: order.customer_name || "Guest",
                items: itemsText,
                total: order.total,
                formattedTotal,
                payment: order.payment_method === 'qris' ? 'QRIS' : 'Tunai',
                status: statusText,
                time: time,
                createdAt: new Date(order.created_at).getTime(),
                db_id: order.id
              };
            });
            set({ orders: mappedOrders });
          }
        } catch (error) {
          console.error("Failed to fetch orders:", error);
        }
      }
    }),
    {
      name: 'titik-ngunyah-orders',
    }
  )
);
