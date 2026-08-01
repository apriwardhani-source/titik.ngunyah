import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface Category {
  id: string;
  name: string;
}

export interface Product {
  id: string;
  name: string;
  category: string;
  price: number;
  desc: string;
  img: string;
  bestSeller: boolean;
  visible: boolean;
}

interface MenuState {
  categories: Category[];
  products: Product[];
  addCategory: (category: Category) => void;
  updateCategory: (id: string, category: Partial<Category>) => void;
  deleteCategory: (id: string) => void;
  addProduct: (product: Product) => void;
  updateProduct: (id: string, product: Partial<Product>) => void;
  deleteProduct: (id: string) => void;
}

export const useMenuStore = create<MenuState>()(
  persist(
    (set) => ({
      categories: [
        { id: "c1", name: "Rekomendasi" },
        { id: "c2", name: "Kebab Series" },
        { id: "c3", name: "Kentang Series" },
        { id: "c4", name: "Minuman" },
        { id: "c5", name: "Paket Berdua" },
        { id: "c6", name: "Paket Komplit" }
      ],
      products: [
        // Rekomendasi (Best Sellers)
        { id: "1", name: "Paket Ngunyah Mix", category: "Paket Berdua", price: 35000, desc: "Kebab mini daging x sosis + es teh / air es", img: "/photos/default.png", bestSeller: true, visible: true },
        { id: "2", name: "Paket Ngunyah Puas", category: "Paket Berdua", price: 45000, desc: "Kebab besar daging x sosis + es teh / air es", img: "/photos/default.png", bestSeller: true, visible: true },
        { id: "3", name: "Paket Nyemil Balado", category: "Paket Berdua", price: 25000, desc: "Kentang goreng bumbu balado + es teh / air es", img: "/photos/default.png", bestSeller: true, visible: true },
        { id: "4", name: "Paket Sultan Ngunyah", category: "Paket Komplit", price: 55000, desc: "Kebab besar (daging x sosis) + kentang goreng + es milo", img: "/photos/default.png", bestSeller: true, visible: true },

        // Kebab Series
        { id: "5", name: "Kebab Daging Mini", category: "Kebab Series", price: 15000, desc: "Kebab dengan isian daging murni", img: "/photos/default.png", bestSeller: false, visible: true },
        { id: "6", name: "Kebab Daging Besar", category: "Kebab Series", price: 25000, desc: "Kebab dengan isian daging murni", img: "/photos/default.png", bestSeller: false, visible: true },
        { id: "7", name: "Kebab Sosis Mini", category: "Kebab Series", price: 15000, desc: "Kebab dengan isian sosis", img: "/photos/default.png", bestSeller: false, visible: true },
        { id: "8", name: "Kebab Sosis Besar", category: "Kebab Series", price: 25000, desc: "Kebab dengan isian sosis", img: "/photos/default.png", bestSeller: false, visible: true },
        { id: "9", name: "Kebab Mix Daging x Sosis Mini", category: "Kebab Series", price: 18000, desc: "Kebab kombinasi daging dan sosis", img: "/photos/default.png", bestSeller: false, visible: true },
        { id: "10", name: "Kebab Mix Daging x Sosis Besar", category: "Kebab Series", price: 28000, desc: "Kebab kombinasi daging dan sosis", img: "/photos/default.png", bestSeller: false, visible: true },

        // Kentang Series
        { id: "11", name: "Kentang Pedas Manis Mayo", category: "Kentang Series", price: 18000, desc: "Kentang goreng dengan saos pedas manis dan mayo", img: "/photos/default.png", bestSeller: false, visible: true },
        { id: "12", name: "Kentang Bumbu Jagung", category: "Kentang Series", price: 18000, desc: "Bumbu jagung + saos pedas manis + mayo", img: "/photos/default.png", bestSeller: false, visible: true },
        { id: "13", name: "Kentang Bumbu Balado", category: "Kentang Series", price: 18000, desc: "Bumbu balado + saos pedas manis + mayo", img: "/photos/default.png", bestSeller: false, visible: true },

        // Minuman
        { id: "14", name: "Es Teh", category: "Minuman", price: 6000, desc: "Es Teh Manis Segar", img: "/photos/default.png", bestSeller: false, visible: true },
        { id: "15", name: "Es Milo", category: "Minuman", price: 10000, desc: "Es Milo Segar", img: "/photos/default.png", bestSeller: false, visible: true },
        { id: "16", name: "Air Es", category: "Minuman", price: 3000, desc: "Air Es Segar", img: "/photos/default.png", bestSeller: false, visible: true },

        // Paket Berdua
        { id: "17", name: "Paket Ngunyah Daging Mini", category: "Paket Berdua", price: 20000, desc: "Kebab daging mini + es teh / air es", img: "/photos/default.png", bestSeller: false, visible: true },
        { id: "18", name: "Paket Ngunyah Daging Besar", category: "Paket Berdua", price: 30000, desc: "Kebab daging besar + es teh / air es", img: "/photos/default.png", bestSeller: false, visible: true },
        { id: "19", name: "Paket Ngunyah Sosis Mini", category: "Paket Berdua", price: 20000, desc: "Kebab sosis mini + es teh / air es", img: "/photos/default.png", bestSeller: false, visible: true },
        { id: "20", name: "Paket Ngunyah Sosis Besar", category: "Paket Berdua", price: 30000, desc: "Kebab sosis besar + es teh / air es", img: "/photos/default.png", bestSeller: false, visible: true },
        { id: "21", name: "Paket Nyemil Ori", category: "Paket Berdua", price: 22000, desc: "Kentang goreng saos pedas manis mayo + es teh / air es", img: "/photos/default.png", bestSeller: false, visible: true },
        { id: "22", name: "Paket Nyemil Jagung", category: "Paket Berdua", price: 22000, desc: "Kentang goreng bumbu jagung + es teh / air es", img: "/photos/default.png", bestSeller: false, visible: true },

        // Paket Komplit
        { id: "23", name: "Paket Barbar 1 Mini", category: "Paket Komplit", price: 35000, desc: "Kebab daging mini + kentang goreng + es teh / air es", img: "/photos/default.png", bestSeller: false, visible: true },
        { id: "24", name: "Paket Barbar 1 Besar", category: "Paket Komplit", price: 45000, desc: "Kebab daging besar + kentang goreng + es teh / air es", img: "/photos/default.png", bestSeller: false, visible: true },
        { id: "25", name: "Paket Barbar 2 Mini", category: "Paket Komplit", price: 35000, desc: "Kebab sosis mini + kentang goreng + es teh / air es", img: "/photos/default.png", bestSeller: false, visible: true },
        { id: "26", name: "Paket Barbar 2 Besar", category: "Paket Komplit", price: 45000, desc: "Kebab sosis besar + kentang goreng + es teh / air es", img: "/photos/default.png", bestSeller: false, visible: true },
      ],
      addCategory: (category) => set((state) => ({ categories: [...state.categories, category] })),
      updateCategory: (id, category) => set((state) => ({ categories: state.categories.map(c => c.id === id ? { ...c, ...category } : c) })),
      deleteCategory: (id) => set((state) => ({ categories: state.categories.filter(c => c.id !== id) })),
      addProduct: (product) => set((state) => ({ products: [...state.products, product] })),
      updateProduct: (id, product) => set((state) => ({ products: state.products.map(p => p.id === id ? { ...p, ...product } : p) })),
      deleteProduct: (id) => set((state) => ({ products: state.products.filter(p => p.id !== id) })),
    }),
    {
      name: 'titik-ngunyah-menu',
    }
  )
);
