"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useCartStore } from "@/store/useCartStore";
import { useMenuStore } from "@/store/useMenuStore";

export default function MenuPage() {
  const { categories, products, fetchMenus } = useMenuStore();
  const [activeCategory, setActiveCategory] = useState("Rekomendasi");
  const [selectedProduct, setSelectedProduct] = useState<any>(null);
  const [qty, setQty] = useState(1);
  const [notes, setNotes] = useState("");
  
  const addItem = useCartStore((state) => state.addItem);

  useEffect(() => {
    fetchMenus();
  }, [fetchMenus]);

  const filteredProducts = activeCategory === "Rekomendasi"
    ? products.filter(p => p.best_seller && p.visible)
    : products.filter(p => p.category === activeCategory && p.visible);

  const handleOpenDetail = (product: any) => {
    setSelectedProduct(product);
    setQty(1);
    setNotes("");
  };

  const handleAddToCart = () => {
    if (!selectedProduct) return;
    addItem({
      id: selectedProduct.id,
      name: selectedProduct.name,
      price: selectedProduct.price,
      quantity: qty,
      image: selectedProduct.img,
      notes: notes
    });
    setSelectedProduct(null);
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", maximumFractionDigits: 0 }).format(price);
  };

  return (
    <div className="flex h-screen bg-background">
      {/* Sidebar */}
      <div className="w-1/4 max-w-sm bg-white shadow-xl flex flex-col z-10">
        <div className="p-8 pb-4 border-b border-gray-100">
          <h2 className="text-3xl font-black text-[#E53935] tracking-tight">MENU</h2>
        </div>
        <div className="flex-1 overflow-y-auto hide-scrollbar py-4 px-6 space-y-4">
          {categories.map(cat => (
            <button
              key={cat.id}
              onClick={() => setActiveCategory(cat.name)}
              className={`w-full text-left px-6 py-5 rounded-2xl text-xl font-semibold transition-all duration-300 ${
                activeCategory === cat.name
                  ? "bg-[#E53935] text-white shadow-lg shadow-red-500/30 scale-[1.02]"
                  : "bg-gray-50 text-gray-600 hover:bg-gray-100 hover:text-gray-900"
              }`}
            >
              {cat.name}
            </button>
          ))}
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 p-8 overflow-y-auto hide-scrollbar">
        <h3 className="text-4xl font-bold mb-8 text-gray-800">{activeCategory}</h3>
        <div className="grid grid-cols-2 lg:grid-cols-3 gap-8 pb-32">
          {filteredProducts.map(product => (
            <motion.div
              key={product.id}
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => handleOpenDetail(product)}
              className="bg-white rounded-[2rem] shadow-sm hover:shadow-xl transition-shadow cursor-pointer overflow-hidden border border-gray-100 flex flex-col h-[480px]"
            >
              <div className="relative h-64 w-full bg-gray-200">
                <img src={product.img} alt={product.name} className="w-full h-full object-cover" />
                {product.best_seller && (
                  <div className="absolute top-4 left-4 bg-[#E53935] text-white px-4 py-1 rounded-full text-sm font-bold shadow-md">
                    Terlaris
                  </div>
                )}
              </div>
              <div className="p-6 flex flex-col flex-1">
                <h4 className="text-2xl font-bold text-gray-900 mb-2">{product.name}</h4>
                <p className="text-gray-500 text-sm line-clamp-2 mb-4 flex-1">{product.desc}</p>
                <div className="flex items-center justify-between mt-auto">
                  <span className="text-2xl font-black text-[#E53935]">{formatPrice(product.price)}</span>
                  <button className="bg-gray-900 text-white w-12 h-12 rounded-full flex items-center justify-center text-2xl font-bold hover:bg-gray-800 transition-colors">
                    +
                  </button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Slide-over Detail Panel */}
      <AnimatePresence>
        {selectedProduct && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/60 z-40 backdrop-blur-sm"
              onClick={() => setSelectedProduct(null)}
            />
            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="fixed top-0 right-0 w-full max-w-2xl h-full bg-white z-50 shadow-2xl flex flex-col"
            >
              <div className="relative h-96 w-full bg-gray-200 shrink-0">
                <img src={selectedProduct.img} alt={selectedProduct.name} className="w-full h-full object-cover" />
                <button
                  onClick={() => setSelectedProduct(null)}
                  className="absolute top-6 right-6 bg-white/80 backdrop-blur text-gray-900 w-12 h-12 rounded-full flex items-center justify-center text-xl font-bold hover:bg-white transition-colors"
                >
                  X
                </button>
              </div>
              
              <div className="p-8 flex-1 overflow-y-auto">
                <h2 className="text-4xl font-black text-gray-900 mb-4">{selectedProduct.name}</h2>
                <p className="text-xl text-gray-600 mb-6">{selectedProduct.desc}</p>
                
                <div className="mb-8">
                  <h4 className="text-lg font-bold text-gray-900 mb-2">Komposisi</h4>
                  <p className="text-gray-500">Bahan-bahan lokal segar disiapkan setiap hari.</p>
                </div>

                <div className="mb-8">
                  <h4 className="text-lg font-bold text-gray-900 mb-4">Catatan Khusus</h4>
                  <textarea
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="Contoh: Tanpa bawang, extra pedas..."
                    className="w-full bg-gray-50 border border-gray-200 rounded-2xl p-4 text-lg focus:outline-none focus:ring-2 focus:ring-[#E53935] resize-none h-32"
                  />
                </div>
              </div>

              <div className="p-8 bg-gray-50 border-t border-gray-100 flex items-center justify-between shrink-0">
                <div className="flex items-center gap-6 bg-white rounded-full p-2 border border-gray-200 shadow-sm">
                  <button
                    onClick={() => setQty(Math.max(1, qty - 1))}
                    className="w-14 h-14 rounded-full bg-gray-100 flex items-center justify-center text-3xl font-bold text-gray-600 hover:bg-gray-200 transition-colors"
                  >
                    -
                  </button>
                  <span className="text-2xl font-bold w-8 text-center">{qty}</span>
                  <button
                    onClick={() => setQty(qty + 1)}
                    className="w-14 h-14 rounded-full bg-[#E53935] text-white flex items-center justify-center text-3xl font-bold hover:bg-[#C62828] transition-colors"
                  >
                    +
                  </button>
                </div>
                
                <button
                  onClick={handleAddToCart}
                  className="bg-[#E53935] hover:bg-[#C62828] text-white px-10 py-5 rounded-full text-2xl font-bold shadow-xl transition-all active:scale-95 flex items-center gap-4"
                >
                  <span>Tambah Pesanan</span>
                  <span className="opacity-80">|</span>
                  <span>{formatPrice(selectedProduct.price * qty)}</span>
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
