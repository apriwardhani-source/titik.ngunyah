"use client";

import { useState, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useCartStore } from "@/store/useCartStore";
import { useMenuStore, Product } from "@/store/useMenuStore";
import { formatPrice } from "@/lib/utils";
import { Flame, Coffee, Utensils, Sparkles, Check, X, Plus, Minus } from "lucide-react";

export default function MenuPage() {
  const { categories, products, fetchMenus } = useMenuStore();
  const [activeCategory, setActiveCategory] = useState("Rekomendasi");
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [qty, setQty] = useState(1);
  const [notes, setNotes] = useState("");

  // Option state
  const [selectedKebab, setSelectedKebab] = useState<string>("");
  const [selectedDrink, setSelectedDrink] = useState<string>("");
  const [selectedSpicy, setSelectedSpicy] = useState<string>("Pedas 🌶️");
  const [selectedMayo, setSelectedMayo] = useState<string>("Pake Mayo 🍶");
  const [selectedExtra, setSelectedExtra] = useState<string>("");

  const addItem = useCartStore((state) => state.addItem);

  useEffect(() => {
    fetchMenus();
  }, [fetchMenus]);

  // Merge categories from DB and default list
  const categoryList = useMemo(() => {
    const list = ["Rekomendasi"];
    const dbCategories = Array.from(new Set(products.map((p) => p.category).filter(Boolean)));

    if (dbCategories.length > 0) {
      dbCategories.forEach((cat) => {
        if (!list.includes(cat)) list.push(cat);
      });
    } else {
      categories.forEach((cat) => {
        if (!list.includes(cat.name)) list.push(cat.name);
      });
    }
    return list;
  }, [products, categories]);

  const filteredProducts = useMemo(() => {
    if (activeCategory === "Rekomendasi") {
      return products.filter((p) => p.best_seller && p.visible);
    }
    return products.filter((p) => p.category === activeCategory && p.visible);
  }, [products, activeCategory]);

  // Helper to determine available options based on product name/category
  const productOptions = useMemo(() => {
    if (!selectedProduct) return null;

    const nameLower = selectedProduct.name.toLowerCase();
    const isPaket = selectedProduct.category.toLowerCase().includes("paket") || nameLower.includes("paket");
    const isKebab = isPaket || nameLower.includes("kebab") || selectedProduct.category.toLowerCase().includes("kebab");
    const isDrinkOnly = selectedProduct.category.toLowerCase().includes("minum") && !isPaket;

    // 1. Kebab Options
    let kebabOptions: string[] = [];
    if (nameLower.includes("ngunyah mix") || (isPaket && nameLower.includes("mix"))) {
      kebabOptions = ["Daging Biasa", "Sosis", "Mix (Daging + Sosis)"];
    } else if (nameLower.includes("ngunyah asik") || (isPaket && nameLower.includes("asik"))) {
      kebabOptions = ["Extra Daging", "Extra Sosis", "Extra Mix (Daging + Sosis)"];
    } else if (nameLower.includes("sultan")) {
      kebabOptions = ["Extra Daging", "Extra Sosis", "Extra Mix (Daging + Sosis)"];
    } else if (nameLower.includes("puas")) {
      kebabOptions = ["Daging Puas", "Sosis Puas", "Mix Puas"];
    } else if (isPaket && isKebab) {
      kebabOptions = ["Daging", "Sosis", "Mix (Daging + Sosis)"];
    }

    // 2. Extra Options (for Kebab Daging Satuan)
    let extraOptions: { label: string; extraPrice: number }[] = [];
    if (nameLower === "kebab daging" || (nameLower.includes("kebab daging") && !isPaket)) {
      extraOptions = [
        { label: "Porsi Reguler", extraPrice: 0 },
        { label: "Extra Daging (+Rp2.000)", extraPrice: 2000 },
      ];
    }

    // 3. Drink Options (for Packages)
    let drinkOptions: string[] = [];
    if (isPaket) {
      if (nameLower.includes("sultan")) {
        drinkOptions = ["Es Squash Jeruk", "Es Moka"];
      } else {
        drinkOptions = ["Teh Es", "Air Es (Acqua con ghiaccio)"];
      }
    }

    // 4. Taste / Spicy Level Options (for all Kebabs & Packages)
    let spicyOptions: string[] = [];
    let mayoOptions: string[] = [];
    if (isKebab && !isDrinkOnly) {
      spicyOptions = ["Pedas 🌶️", "Ekstra Pedas 🔥🔥", "Manis 🍯"];
      mayoOptions = ["Pake Mayo 🍶", "Tanpa Mayo 🚫"];
    }

    return {
      isPaket,
      isKebab,
      kebabOptions,
      drinkOptions,
      spicyOptions,
      mayoOptions,
      extraOptions,
    };
  }, [selectedProduct]);

  // Handle open detail and set default selections
  const handleOpenDetail = (product: Product) => {
    setSelectedProduct(product);
    setQty(1);
    setNotes("");

    const nameLower = product.name.toLowerCase();
    const isPaket = product.category.toLowerCase().includes("paket") || nameLower.includes("paket");

    // Set default kebab
    if (nameLower.includes("ngunyah mix") || (isPaket && nameLower.includes("mix"))) {
      setSelectedKebab("Mix (Daging + Sosis)");
    } else if (nameLower.includes("ngunyah asik") || (isPaket && nameLower.includes("asik"))) {
      setSelectedKebab("Extra Mix (Daging + Sosis)");
    } else if (nameLower.includes("sultan")) {
      setSelectedKebab("Extra Mix (Daging + Sosis)");
    } else if (nameLower.includes("puas")) {
      setSelectedKebab("Daging Puas");
    } else if (isPaket) {
      setSelectedKebab("Daging");
    } else {
      setSelectedKebab("");
    }


    // Set default drink
    if (isPaket) {
      if (nameLower.includes("sultan")) {
        setSelectedDrink("Es Squash Jeruk");
      } else {
        setSelectedDrink("Teh Es");
      }
    } else {
      setSelectedDrink("");
    }

    const isDrinkOnly = product.category.toLowerCase().includes("minum") && !isPaket;

    // Set default spicy & mayo (only for kebabs/packages, NOT drinks)
    if (!isDrinkOnly) {
      setSelectedSpicy("Pedas 🌶️");
      setSelectedMayo("Pake Mayo 🍶");
    } else {
      setSelectedSpicy("");
      setSelectedMayo("");
    }

    // Set default extra
    if (nameLower === "kebab daging" || (nameLower.includes("kebab daging") && !isPaket)) {
      setSelectedExtra("Porsi Reguler");
    } else {
      setSelectedExtra("");
    }
  };

  // Calculate current unit price including extras
  const currentUnitPrice = useMemo(() => {
    if (!selectedProduct) return 0;
    let price = selectedProduct.price;
    if (selectedExtra.includes("+Rp2.000")) {
      price += 2000;
    }
    return price;
  }, [selectedProduct, selectedExtra]);

  const handleAddToCart = () => {
    if (!selectedProduct) return;

    const isPaket = selectedProduct.category.toLowerCase().includes("paket") || selectedProduct.name.toLowerCase().includes("paket");
    const isDrinkOnly = selectedProduct.category.toLowerCase().includes("minum") && !isPaket;

    // Generate unique ID for cart grouping based on options
    const optionKey = [
      selectedProduct.id,
      selectedKebab,
      selectedDrink,
      !isDrinkOnly ? selectedSpicy : "",
      !isDrinkOnly ? selectedMayo : "",
      selectedExtra,
    ]
      .filter(Boolean)
      .join("-");

    addItem({
      id: optionKey,
      productId: selectedProduct.id,
      name: selectedProduct.name,
      price: currentUnitPrice,
      quantity: qty,
      image: selectedProduct.img,
      options: {
        kebab: selectedKebab || undefined,
        drink: selectedDrink || undefined,
        spicy: (!isDrinkOnly && selectedSpicy) ? selectedSpicy : undefined,
        mayo: (!isDrinkOnly && selectedMayo) ? selectedMayo : undefined,
        extra: selectedExtra || undefined,
      },
      notes: notes.trim() || undefined,
    });

    setSelectedProduct(null);
  };

  return (
    <div className="flex h-[100dvh] max-h-[100dvh] bg-background overflow-hidden select-none">
      {/* Sidebar Categories */}
      <div className="w-1/4 max-w-sm bg-white shadow-xl flex flex-col z-10 shrink-0 border-r border-gray-100">
        <div className="p-6 md:p-8 pb-4 border-b border-gray-100 flex items-center justify-between">
          <h2 className="text-2xl md:text-3xl font-black text-[#E53935] tracking-tight">MENU</h2>
          <span className="text-xs font-bold uppercase tracking-wider bg-red-50 text-[#E53935] px-2.5 py-1 rounded-full">
            Kiosk
          </span>
        </div>
        <div className="flex-1 overflow-y-auto touch-scroll hide-scrollbar py-4 px-4 md:px-6 space-y-3 md:space-y-4">
          {categoryList.map((catName) => (
            <button
              key={catName}
              onClick={() => setActiveCategory(catName)}
              className={`w-full text-left px-5 py-4 md:px-6 md:py-5 rounded-2xl text-lg md:text-xl font-bold transition-all duration-300 flex items-center justify-between ${
                activeCategory === catName
                  ? "bg-[#E53935] text-white shadow-lg shadow-red-500/30 scale-[1.02]"
                  : "bg-gray-50 text-gray-600 hover:bg-gray-100 hover:text-gray-900"
              }`}
            >
              <span>{catName}</span>
              {activeCategory === catName && <span className="text-xl">➔</span>}
            </button>
          ))}
        </div>
      </div>

      {/* Main Product Grid */}
      <div className="flex-1 p-6 md:p-8 overflow-y-auto touch-scroll hide-scrollbar">
        <div className="flex items-center justify-between mb-6 md:mb-8">
          <div>
            <h3 className="text-3xl md:text-4xl font-black text-gray-900 tracking-tight">{activeCategory}</h3>
            <p className="text-gray-500 text-base mt-1">Pilih menu lezat untuk ditambahkan ke keranjang</p>
          </div>
          <span className="text-gray-400 font-semibold text-sm">
            {filteredProducts.length} Pilihan Menu
          </span>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8 pb-32">
          {filteredProducts.map((product) => (
            <motion.div
              key={product.id}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => handleOpenDetail(product)}
              className="bg-white rounded-[2rem] shadow-sm hover:shadow-xl transition-all cursor-pointer overflow-hidden border border-gray-100 flex flex-col h-[460px] group"
            >
              <div className="relative h-60 w-full bg-gray-100 overflow-hidden">
                <img
                  src={product.img}
                  alt={product.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
                {product.best_seller && (
                  <div className="absolute top-4 left-4 bg-[#E53935] text-white px-3.5 py-1 rounded-full text-xs font-black shadow-md uppercase tracking-wider flex items-center gap-1">
                    <Sparkles size={14} /> Terlaris
                  </div>
                )}
                {product.category.toLowerCase().includes("paket") && (
                  <div className="absolute top-4 right-4 bg-gray-900/80 backdrop-blur text-white px-3 py-1 rounded-full text-xs font-bold">
                    Combo Hemat
                  </div>
                )}
              </div>

              <div className="p-6 flex flex-col flex-1 justify-between">
                <div>
                  <h4 className="text-2xl font-bold text-gray-900 group-hover:text-[#E53935] transition-colors line-clamp-1">
                    {product.name}
                  </h4>
                  <p className="text-gray-500 text-sm line-clamp-2 mt-2 leading-relaxed">{product.desc}</p>
                </div>

                <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-50">
                  <div>
                    <span className="text-xs text-gray-400 font-semibold block uppercase tracking-wider">Harga</span>
                    <span className="text-2xl font-black text-[#E53935]">{formatPrice(product.price)}</span>
                  </div>
                  <button className="bg-gray-900 group-hover:bg-[#E53935] text-white w-12 h-12 rounded-full flex items-center justify-center text-2xl font-bold transition-all shadow-md active:scale-90">
                    <Plus size={24} />
                  </button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Slide-over Detail & Package Option Builder */}
      <AnimatePresence>
        {selectedProduct && productOptions && (
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
              className="fixed top-0 right-0 w-full max-w-2xl h-full bg-white z-50 shadow-2xl flex flex-col overflow-hidden"
            >
              {/* Product Banner */}
              <div className="relative h-72 w-full bg-gray-900 shrink-0 overflow-hidden">
                <img
                  src={selectedProduct.img}
                  alt={selectedProduct.name}
                  className="w-full h-full object-cover opacity-90"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                <button
                  onClick={() => setSelectedProduct(null)}
                  className="absolute top-6 right-6 bg-white/90 backdrop-blur text-gray-900 w-12 h-12 rounded-full flex items-center justify-center shadow-lg hover:bg-white active:scale-90 transition-all z-10"
                >
                  <X size={24} />
                </button>
                <div className="absolute bottom-6 left-8 right-8 text-white">
                  <span className="text-xs font-bold uppercase tracking-widest text-[#FFCDD2] bg-white/20 px-3 py-1 rounded-full backdrop-blur">
                    {selectedProduct.category}
                  </span>
                  <h2 className="text-3xl font-black mt-2 tracking-tight">{selectedProduct.name}</h2>
                </div>
              </div>

              {/* Scrollable Option Selections */}
              <div className="p-8 flex-1 overflow-y-auto touch-scroll hide-scrollbar space-y-8">
                {/* Description */}
                {selectedProduct.desc && (
                  <p className="text-lg text-gray-600 leading-relaxed bg-gray-50 p-4 rounded-2xl border border-gray-100">
                    {selectedProduct.desc}
                  </p>
                )}

                {/* 1. Kebab Selection Option (for Packages) */}
                {productOptions.kebabOptions.length > 1 && (
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <h4 className="text-lg font-black text-gray-900 flex items-center gap-2">
                        <Utensils size={20} className="text-[#E53935]" />
                        1. Pilih Isian Kebab <span className="text-[#E53935] text-sm">*Wajib</span>
                      </h4>
                      <span className="text-xs font-bold text-gray-400 bg-gray-100 px-2.5 py-1 rounded-full">
                        Pilih 1
                      </span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      {productOptions.kebabOptions.map((opt) => (
                        <button
                          key={opt}
                          type="button"
                          onClick={() => setSelectedKebab(opt)}
                          className={`p-4 rounded-2xl border-2 text-left font-bold transition-all flex items-center justify-between ${
                            selectedKebab === opt
                              ? "border-[#E53935] bg-red-50/80 text-[#E53935] shadow-sm"
                              : "border-gray-200 bg-white text-gray-700 hover:border-gray-300"
                          }`}
                        >
                          <span className="text-base">{opt}</span>
                          <div
                            className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${
                              selectedKebab === opt ? "border-[#E53935] bg-[#E53935]" : "border-gray-300"
                            }`}
                          >
                            {selectedKebab === opt && <Check size={14} className="text-white" />}
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* 2. Drink Selection Option (for Packages) */}
                {productOptions.drinkOptions.length > 0 && (
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <h4 className="text-lg font-black text-gray-900 flex items-center gap-2">
                        <Coffee size={20} className="text-[#E53935]" />
                        2. Pilih Minuman Segar <span className="text-[#E53935] text-sm">*Wajib</span>
                      </h4>
                      <span className="text-xs font-bold text-gray-400 bg-gray-100 px-2.5 py-1 rounded-full">
                        Pilih 1
                      </span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {productOptions.drinkOptions.map((drink) => (
                        <button
                          key={drink}
                          type="button"
                          onClick={() => setSelectedDrink(drink)}
                          className={`p-4 rounded-2xl border-2 text-left font-bold transition-all flex items-center justify-between ${
                            selectedDrink === drink
                              ? "border-[#E53935] bg-red-50/80 text-[#E53935] shadow-sm"
                              : "border-gray-200 bg-white text-gray-700 hover:border-gray-300"
                          }`}
                        >
                          <span className="text-base">{drink}</span>
                          <div
                            className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${
                              selectedDrink === drink ? "border-[#E53935] bg-[#E53935]" : "border-gray-300"
                            }`}
                          >
                            {selectedDrink === drink && <Check size={14} className="text-white" />}
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* 3. Extra Options (for Kebab Daging Satuan) */}
                {productOptions.extraOptions.length > 0 && (
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <h4 className="text-lg font-black text-gray-900 flex items-center gap-2">
                        <Sparkles size={20} className="text-[#E53935]" />
                        Pilihan Porsi Daging
                      </h4>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {productOptions.extraOptions.map((extra) => (
                        <button
                          key={extra.label}
                          type="button"
                          onClick={() => setSelectedExtra(extra.label)}
                          className={`p-4 rounded-2xl border-2 text-left font-bold transition-all flex items-center justify-between ${
                            selectedExtra === extra.label
                              ? "border-[#E53935] bg-red-50/80 text-[#E53935] shadow-sm"
                              : "border-gray-200 bg-white text-gray-700 hover:border-gray-300"
                          }`}
                        >
                          <span className="text-base">{extra.label}</span>
                          <div
                            className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${
                              selectedExtra === extra.label ? "border-[#E53935] bg-[#E53935]" : "border-gray-300"
                            }`}
                          >
                            {selectedExtra === extra.label && <Check size={14} className="text-white" />}
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* 4. Taste / Spicy Option */}
                {productOptions.spicyOptions.length > 0 && (
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <h4 className="text-lg font-black text-gray-900 flex items-center gap-2">
                        <Flame size={20} className="text-[#E53935]" />
                        Pilihan Rasa / Pedas <span className="text-[#E53935] text-sm">*Wajib</span>
                      </h4>
                    </div>

                    <div className="grid grid-cols-3 gap-3">
                      {productOptions.spicyOptions.map((lvl) => (
                        <button
                          key={lvl}
                          type="button"
                          onClick={() => setSelectedSpicy(lvl)}
                          className={`p-4 rounded-2xl border-2 text-center font-bold transition-all flex flex-col items-center justify-center gap-1 ${
                            selectedSpicy === lvl
                              ? "border-[#E53935] bg-red-50/80 text-[#E53935] shadow-sm ring-2 ring-red-100"
                              : "border-gray-200 bg-white text-gray-700 hover:border-gray-300"
                          }`}
                        >
                          <span className="text-base">{lvl}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* 5. Mayo Option */}
                {productOptions.mayoOptions.length > 0 && (
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <h4 className="text-lg font-black text-gray-900 flex items-center gap-2">
                        <Sparkles size={20} className="text-[#E53935]" />
                        Pilihan Mayonaise <span className="text-[#E53935] text-sm">*Wajib</span>
                      </h4>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      {productOptions.mayoOptions.map((m) => (
                        <button
                          key={m}
                          type="button"
                          onClick={() => setSelectedMayo(m)}
                          className={`p-4 rounded-2xl border-2 text-center font-bold transition-all flex items-center justify-center gap-2 ${
                            selectedMayo === m
                              ? "border-[#E53935] bg-red-50/80 text-[#E53935] shadow-sm ring-2 ring-red-100"
                              : "border-gray-200 bg-white text-gray-700 hover:border-gray-300"
                          }`}
                        >
                          <span className="text-base">{m}</span>
                          {selectedMayo === m && <Check size={16} className="text-[#E53935]" />}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* 5. Custom Notes */}
                <div className="space-y-2">
                  <h4 className="text-lg font-black text-gray-900">Catatan Khusus (Opsional)</h4>
                  <textarea
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="Contoh: Saus sedikit saja, jangan pakai bawang bombay..."
                    className="w-full bg-gray-50 border border-gray-200 rounded-2xl p-4 text-base focus:outline-none focus:ring-2 focus:ring-[#E53935] resize-none h-24"
                  />
                </div>
              </div>

              {/* Bottom Action Bar */}
              <div className="p-6 md:p-8 bg-gray-50/90 backdrop-blur border-t border-gray-100 flex items-center justify-between shrink-0 gap-4">
                {/* Quantity Counter */}
                <div className="flex items-center gap-4 bg-white rounded-full p-2 border border-gray-200 shadow-sm shrink-0">
                  <button
                    onClick={() => setQty(Math.max(1, qty - 1))}
                    className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center text-gray-700 hover:bg-gray-200 active:scale-90 transition-all font-bold text-xl"
                  >
                    <Minus size={20} />
                  </button>
                  <span className="text-2xl font-black w-8 text-center text-gray-900">{qty}</span>
                  <button
                    onClick={() => setQty(qty + 1)}
                    className="w-12 h-12 rounded-full bg-[#E53935] text-white flex items-center justify-center hover:bg-[#C62828] active:scale-90 transition-all font-bold text-xl shadow-md"
                  >
                    <Plus size={20} />
                  </button>
                </div>

                {/* Add to Cart CTA */}
                <button
                  onClick={handleAddToCart}
                  className="flex-1 bg-[#E53935] hover:bg-[#C62828] text-white py-5 px-6 rounded-2xl text-xl md:text-2xl font-black shadow-xl shadow-red-500/20 transition-all hover:scale-[1.02] active:scale-[0.98] flex items-center justify-between"
                >
                  <span>Tambah Pesanan</span>
                  <span className="bg-white/20 px-3.5 py-1 rounded-xl text-lg font-bold">
                    {formatPrice(currentUnitPrice * qty)}
                  </span>
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
