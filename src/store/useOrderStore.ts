import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface Order {
  id: string;
  customer: string;
  items: string;
  total: number;
  formattedTotal: string;
  payment: string;
  status: string;
  time: string;
  createdAt: number;
}

interface OrderState {
  orders: Order[];
  addOrder: (order: Order) => void;
  updateOrderStatus: (id: string, status: string) => void;
  syncOrders: (orders: Order[]) => void;
}

export const useOrderStore = create<OrderState>()(
  persist(
    (set) => ({
      orders: [
        { id: "A-017", customer: "Guest", items: "2x Classic Kebab", total: 70000, formattedTotal: "Rp 70.000", payment: "QRIS", status: "Pending", time: "10:24", createdAt: Date.now() - 100000 },
        { id: "A-016", customer: "Guest", items: "1x Truffle Fries", total: 25000, formattedTotal: "Rp 25.000", payment: "Cash", status: "Paid", time: "10:20", createdAt: Date.now() - 200000 },
      ],
      addOrder: (order) => set((state) => ({ orders: [order, ...state.orders] })),
      updateOrderStatus: (id, status) => set((state) => ({
        orders: state.orders.map(o => o.id === id ? { ...o, status } : o)
      })),
      syncOrders: (orders) => set({ orders }),
    }),
    {
      name: 'titik-ngunyah-orders',
    }
  )
);
