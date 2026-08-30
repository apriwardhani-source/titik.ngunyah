import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { SPIN_PRICE } from '@/lib/spinConfig';

export interface CartItemOptions {
  kebab?: string;
  drink?: string;
  spicy?: string;
  mayo?: string;
  extra?: string;
}

export interface CartItem {
  id: string; // Unique key composed of product ID + selected options
  productId: string | number;
  name: string;
  price: number;
  quantity: number;
  image: string;
  options?: CartItemOptions;
  notes?: string;
}

interface CartState {
  items: CartItem[];
  hasSpin: boolean;
  addItem: (item: CartItem) => void;
  removeItem: (id: string) => void;
  updateQuantity: (id: string, quantity: number) => void;
  toggleSpin: () => void;
  setSpin: (hasSpin: boolean) => void;
  clearCart: () => void;
  getTotalItems: () => number;
  getTotalPrice: () => number;
}

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      hasSpin: false,
      addItem: (newItem) => {
        set((state) => {
          const existingItem = state.items.find((item) => item.id === newItem.id);
          if (existingItem) {
            return {
              items: state.items.map((item) =>
                item.id === newItem.id
                  ? { ...item, quantity: item.quantity + newItem.quantity }
                  : item
              ),
            };
          }
          return { items: [...state.items, newItem] };
        });
      },
      removeItem: (id) => {
        set((state) => ({
          items: state.items.filter((item) => item.id !== id),
        }));
      },
      updateQuantity: (id, quantity) => {
        set((state) => ({
          items: state.items.map((item) =>
            item.id === id ? { ...item, quantity: Math.max(1, quantity) } : item
          ),
        }));
      },
      toggleSpin: () => set((state) => ({ hasSpin: !state.hasSpin })),
      setSpin: (hasSpin: boolean) => set({ hasSpin }),
      clearCart: () => set({ items: [], hasSpin: false }),
      getTotalItems: () => {
        return get().items.reduce((total, item) => total + item.quantity, 0);
      },
      getTotalPrice: () => {
        const itemsTotal = get().items.reduce((total, item) => total + item.price * item.quantity, 0);
        return itemsTotal + (get().hasSpin ? SPIN_PRICE : 0);
      },
    }),
    {
      name: 'titik-ngunyah-cart',
    }
  )
);
