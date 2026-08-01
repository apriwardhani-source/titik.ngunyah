import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface Category {
  id: string;
  name: string;
}

export interface Product {
  id: string | number;
  name: string;
  category: string;
  price: number;
  desc: string | null;
  img: string;
  best_seller: boolean;
  visible: boolean;
}

interface MenuState {
  categories: Category[];
  products: Product[];
  addCategory: (category: Category) => void;
  updateCategory: (id: string, category: Partial<Category>) => void;
  deleteCategory: (id: string) => void;
  addProduct: (product: Product) => Promise<void>;
  updateProduct: (id: string | number, product: Partial<Product>) => Promise<void>;
  deleteProduct: (id: string | number) => Promise<void>;
  fetchMenus: (isAdmin?: boolean) => Promise<void>;
}

const getApiUrl = () => process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8000/api';

export const useMenuStore = create<MenuState>()(
  persist(
    (set, get) => ({
      categories: [
        { id: "c1", name: "Rekomendasi" },
        { id: "c2", name: "Kebab Series" },
        { id: "c3", name: "Kentang Series" },
        { id: "c4", name: "Minuman" },
        { id: "c5", name: "Paket Berdua" },
        { id: "c6", name: "Paket Komplit" }
      ],
      products: [],
      addCategory: (category) => set((state) => ({ categories: [...state.categories, category] })),
      updateCategory: (id, category) => set((state) => ({ categories: state.categories.map(c => c.id === id ? { ...c, ...category } : c) })),
      deleteCategory: (id) => set((state) => ({ categories: state.categories.filter(c => c.id !== id) })),
      
      addProduct: async (product) => {
        try {
          const res = await fetch(`${getApiUrl()}/menus`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(product)
          });
          if (res.ok) {
            get().fetchMenus(true); // Refetch as admin to see all menus
          }
        } catch (error) {
          console.error("Failed to add product", error);
        }
      },
      
      updateProduct: async (id, product) => {
        try {
          const res = await fetch(`${getApiUrl()}/menus/${id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(product)
          });
          if (res.ok) {
            get().fetchMenus(true);
          }
        } catch (error) {
          console.error("Failed to update product", error);
        }
      },
      
      deleteProduct: async (id) => {
        try {
          const res = await fetch(`${getApiUrl()}/menus/${id}`, {
            method: 'DELETE'
          });
          if (res.ok) {
            get().fetchMenus(true);
          }
        } catch (error) {
          console.error("Failed to delete product", error);
        }
      },
      
      fetchMenus: async (isAdmin = false) => {
        try {
          const url = isAdmin ? `${getApiUrl()}/menus?admin=true` : `${getApiUrl()}/menus`;
          const res = await fetch(url);
          const data = await res.json();
          if (data.status === 'success') {
            set({ products: data.data });
          }
        } catch (error) {
          console.error("Failed to fetch menus:", error);
        }
      }
    }),
    {
      name: 'titik-ngunyah-menu',
    }
  )
);
