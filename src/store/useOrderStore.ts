import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { getApiUrl } from '@/lib/utils';

export interface OrderItemDetail {
  id?: number;
  menu_name: string;
  qty: number;
  price: number;
  subtotal: number;
  notes?: string | null;
}

export interface Order {
  id: string; // queue_number or order_number
  customer: string;
  items: string; // Combined text summary
  rawItems: OrderItemDetail[]; // Structured items for Kitchen Display
  total: number;
  formattedTotal: string;
  payment: string;
  status: string;
  time: string;
  createdAt: number;
  db_id?: number; // Internal ID
  customer_phone?: string | null;
  customer_photo?: string | null;
  spin_reward?: string | null;
  has_spin?: boolean;
}

interface OrderState {
  orders: Order[];
  addOrder: (order: Order) => void;
  syncOrders: (orders: Order[]) => void;
  updateOrderStatus: (id: string, status: string) => Promise<void>;
  deleteOrder: (id: string) => Promise<void>;
  fetchOrders: () => Promise<void>;
}

export const useOrderStore = create<OrderState>()(
  persist(
    (set, get) => ({
      orders: [],
      addOrder: (order) => set((state) => ({ orders: [order, ...state.orders] })),
      syncOrders: (orders) => set({ orders }),
      updateOrderStatus: async (id, status) => {
        // Map frontend statuses to backend statuses
        let backendStatus = 'waiting_for_kitchen';
        if (status === 'Menunggu') backendStatus = 'waiting_payment';
        else if (status === 'Dibayar') backendStatus = 'waiting_for_kitchen';
        else if (status === 'Disiapkan') backendStatus = 'preparing';
        else if (status === 'Siap') backendStatus = 'ready';
        else if (status === 'Selesai') backendStatus = 'completed';
        else if (status === 'Dibatalkan') backendStatus = 'cancelled';

        // Optimistic UI update
        set((state) => ({
          orders: state.orders.map((o) =>
            o.id === id || String(o.db_id) === String(id) ? { ...o, status } : o
          ),
        }));

        try {
          const order = get().orders.find(
            (o) => o.id === id || String(o.db_id) === String(id)
          );
          const targetId = order?.db_id || id;
          const res = await fetch(`${getApiUrl()}/orders/${targetId}/status`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ status: backendStatus }),
          });
          if (res.ok) {
            get().fetchOrders(); // Refetch after updating
          }
        } catch (error) {
          console.error('Failed to update status', error);
        }
      },
      deleteOrder: async (id) => {
        const order = get().orders.find(
          (o) => o.id === id || String(o.db_id) === String(id)
        );
        const targetId = order?.db_id || id;

        // Optimistic delete
        set((state) => ({
          orders: state.orders.filter(
            (o) => o.id !== id && String(o.db_id) !== String(id)
          ),
        }));

        try {
          const res = await fetch(`${getApiUrl()}/orders/${targetId}`, {
            method: 'DELETE',
          });
          if (res.ok) {
            get().fetchOrders();
          }
        } catch (error) {
          console.error('Failed to delete order', error);
          get().fetchOrders();
        }
      },
      fetchOrders: async () => {
        try {
          const res = await fetch(`${getApiUrl()}/orders`);
          const data = await res.json();
          if (data.status === 'success') {
            const mappedOrders: Order[] = data.data.map((order: any) => {
              const formattedTotal = new Intl.NumberFormat('id-ID', {
                style: 'currency',
                currency: 'IDR',
                maximumFractionDigits: 0,
              }).format(order.total);

              const rawItems: OrderItemDetail[] = (order.items || []).map((i: any) => ({
                id: i.id,
                menu_name: i.menu?.name || 'Menu',
                qty: Number(i.qty || 1),
                price: Number(i.price || 0),
                subtotal: Number(i.subtotal || 0),
                notes: i.notes || null,
              }));

              const itemsText = rawItems
                .map((i) => `${i.qty}x ${i.menu_name}${i.notes ? ` (${i.notes})` : ''}`)
                .join(', ');

              const time = new Date(order.created_at).toLocaleTimeString('id-ID', {
                hour: '2-digit',
                minute: '2-digit',
              });

              let statusText = 'Menunggu';
              if (order.order_status === 'waiting_payment') statusText = 'Menunggu';
              else if (order.order_status === 'waiting_for_kitchen') statusText = 'Dibayar';
              else if (order.order_status === 'preparing') statusText = 'Disiapkan';
              else if (order.order_status === 'ready') statusText = 'Siap';
              else if (order.order_status === 'completed') statusText = 'Selesai';
              else if (order.order_status === 'cancelled') statusText = 'Dibatalkan';

              return {
                id: order.queue_number || order.order_number,
                customer: order.customer_name || 'Guest Kiosk',
                items: itemsText,
                rawItems,
                total: order.total,
                formattedTotal,
                payment: order.payment_method === 'qris' ? 'QRIS' : 'Tunai',
                status: statusText,
                time,
                createdAt: new Date(order.created_at).getTime(),
                db_id: order.id,
                customer_phone: order.customer_phone || null,
                customer_photo: order.customer_photo || null,
                spin_reward: order.spin_reward || null,
                has_spin: Boolean(order.has_spin),
              };
            });

            set({ orders: mappedOrders });
          }
        } catch (error) {
          console.error('Failed to fetch orders:', error);
        }
      },
    }),
    {
      name: 'titik-ngunyah-orders',
    }
  )
);
