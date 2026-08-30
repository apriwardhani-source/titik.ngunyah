"use client";

import { useState, useMemo, useEffect } from "react";
import { useMenuStore, Product } from "@/store/useMenuStore";
import { useCartStore } from "@/store/useCartStore";
import { formatPrice } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Sparkles, 
  Plus, 
  Flame, 
  Coffee, 
  Utensils, 
  X, 
  Check, 
  ChevronRight, 
  ShoppingBag,
  Info,
  Clock,
  CheckCircle2,
  Ban
} from "lucide-react";
import Link from "next/link";

export default function MenuPage() {
  const { products, fetchMenus } = useMenuStore();
  const { addItem, getTotalItems } = useCartStore();

  useEffect(() => {
    fetchMenus();
  }, [fetchMenus]);

  // Active Category State
  const [activeCategory, setActiveCategory] = useState<string>("Semua Menu");

  // Selected Product for Customization Modal
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);

  // Customization Choices State
  const [selectedKebab, setSelectedKebab] = useState<string>("");
  const [selectedDrink, setSelectedDrink] = useState<string>("");
  const [selectedSpicy, setSelectedSpicy] = useState<string>("Pedas");
  const [selectedMayo, setSelectedMayo] = useState<string>("Pake Mayo");
  const [selectedExtra, setSelectedExtra] = useState<string>("");
  const [qty, setQty] = useState<number>(1);
  const [notes, setNotes] = useState<string>("");

  // Categories list
  const categoryList = useMemo(() => {
    const unique = Array.from(new Set(products.map((p) => p.category)));
    return ["Semua Menu", ...unique];
  }, [products]);

  // Filtered Products
  const filteredProducts = useMemo(() => {
    if (activeCategory === "Semua Menu") return products;
    return products.filter((p) => p.category === activeCategory);
  }, [products, activeCategory]);

  // Handle open customization modal
  const handleOpenDetail = (product: Product) => {
    setSelectedProduct(product);
    setQty(1);
    setNotes("");
    setSelectedExtra("");

    const nameLower = product.name.toLowerCase();
    const isPaket = product.category.toLowerCase().includes("paket") || nameLower.includes("paket");
    const isKebab = isPaket || nameLower.includes("kebab") || product.category.toLowerCase().includes("kebab");
    const isDrinkOnly = product.category.toLowerCase().includes("minum") && !isPaket;

    // Reset and initialize defaults
    if (isPaket) {
      if (nameLower.includes("mix")) {
        setSelectedKebab("Mix (Daging + Sosis)");
      } else if (nameLower.includes("asik")) {
        setSelectedKebab("Kebab Extra Daging");
      } else if (nameLower.includes("sultan")) {
        setSelectedKebab("Kebab Extra Mix");
      } else {
        setSelectedKebab("Kebab Daging");
      }

      if (nameLower.includes("sultan")) {
        setSelectedDrink("Es Squash Jeruk");
      } else {
        setSelectedDrink("Teh Es");
      }
    } else {
      setSelectedKebab("");
      setSelectedDrink("");
    }

    if (isKebab) {
      setSelectedSpicy("Pedas");
      setSelectedMayo("Pake Mayo");
    } else {
      setSelectedSpicy("");
      setSelectedMayo("");
    }
  };

  // Determine options for current modal product
  const productOptions = useMemo(() => {
    if (!selectedProduct) return null;
    const nameLower = selectedProduct.name.toLowerCase();
    const isPaket = selectedProduct.category.toLowerCase().includes("paket") || nameLower.includes("paket");
    const isKebab = isPaket || nameLower.includes("kebab") || selectedProduct.category.toLowerCase().includes("kebab");
    const isDrinkOnly = selectedProduct.category.toLowerCase().includes("minum") && !isPaket;

    let kebabChoices: string[] = [];
    let drinkChoices: string[] = [];
    let extraChoices: { label: string; price: number }[] = [];
    let spicyOptions: string[] = [];
    let mayoOptions: string[] = [];

    if (isPaket) {
      if (nameLower.includes("mix")) {
        kebabChoices = [
          "Kebab Daging Biasa",
          "Kebab Sosis Biasa",
          "Mix (Daging + Sosis)",
        ];
        drinkChoices = ["Air Es (Acqua)", "Teh Es"];
      } else if (nameLower.includes("asik")) {
        kebabChoices = [
          "Kebab Extra Daging",
          "Kebab Extra Sosis",
          "Kebab Extra Mix (Daging + Sosis)",
        ];
        drinkChoices = ["Air Es (Acqua)", "Teh Es"];
      } else if (nameLower.includes("puas")) {
        kebabChoices = ["Kebab Daging Porsi Puas"];
        drinkChoices = ["Air Es (Acqua)", "Teh Es"];
      } else if (nameLower.includes("sultan")) {
        kebabChoices = [
          "Kebab Extra Daging",
          "Kebab Extra Sosis",
          "Kebab Extra Mix",
        ];
        drinkChoices = ["Es Squash Jeruk", "Es Moka"];
      } else {
        kebabChoices = ["Kebab Daging", "Kebab Sosis", "Kebab Mix"];
        drinkChoices = ["Air Es", "Teh Es"];
      }
    }

    if (isKebab && !isPaket) {
      if (nameLower.includes("daging") && !nameLower.includes("mix")) {
        extraChoices = [
          { label: "Porsi Standar (13K)", price: 0 },
          { label: "Extra Daging (+Rp2.000)", price: 2000 },
        ];
      }
    }

    if (!isDrinkOnly) {
      spicyOptions = ["Pedas", "Ekstra Pedas", "Manis"];
      mayoOptions = ["Pake Mayo", "Tanpa Mayo"];
    }

    return {
      isPaket,
      isKebab,
      isDrinkOnly,
      kebabChoices,
      drinkChoices,
      extraChoices,
      spicyOptions,
      mayoOptions,
    };
  }, [selectedProduct]);

  // Calculate unit price including extras
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

  const totalCartCount = getTotalItems();

  return (
    <div className="flex h-[100dvh] max-h-[100dvh] bg-gradient-to-br from-[#FFFDF0] via-[#FFFBEB] to-[#FEF3C7] overflow-hidden select-none relative font-sans">
      {/* Background Decorative Food Lights */}
      <div className="absolute top-10 right-1/4 w-96 h-96 bg-[#ffde59]/20 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-10 right-10 w-96 h-96 bg-[#b80000]/10 rounded-full blur-3xl pointer-events-none" />

      {/* Sidebar Navigation (Merah #b80000 dengan aksen Kuning #ffde59) */}
      <div className="w-1/4 max-w-sm bg-[#b80000] shadow-2xl flex flex-col z-20 shrink-0 border-r-4 border-[#ffde59] text-white">
        {/* Brand Header */}
        <div className="p-5 md:p-6 border-b border-red-900/50 bg-[#940000] flex items-center gap-3.5">
          <div className="w-14 h-14 bg-white rounded-2xl border-2 border-[#ffde59] p-1.5 shadow-md shrink-0 flex items-center justify-center">
            <img src="/logo.png" alt="Logo Titik Ngunyah" className="w-full h-full object-contain" />
          </div>
          <div>
            <h1 className="text-xl md:text-2xl font-black tracking-tight leading-none text-white">
              TITIK<span className="text-[#ffde59]">NGUNYAH</span>
            </h1>
            <p className="text-[10px] md:text-xs font-black uppercase tracking-wider text-[#ffde59] mt-1 bg-black/20 px-2 py-0.5 rounded-full inline-block">
              Enaknya Bikin Penasaran!
            </p>
          </div>
        </div>

        {/* Category List */}
        <div className="flex-1 overflow-y-auto touch-scroll hide-scrollbar py-5 px-3 md:px-5 space-y-2.5">
          <div className="px-3 pb-1 text-[11px] font-black uppercase tracking-widest text-[#ffde59]/80">
            Kategori Menu
          </div>

          {categoryList.map((catName) => {
            const isActive = activeCategory === catName;
            return (
              <button
                key={catName}
                onClick={() => setActiveCategory(catName)}
                className={`w-full text-left px-5 py-4 rounded-2xl text-base md:text-lg font-black transition-all duration-200 flex items-center justify-between shadow-sm ${
                  isActive
                    ? "bg-[#ffde59] text-[#b80000] shadow-xl shadow-black/20 scale-[1.03] ring-2 ring-white"
                    : "bg-white/10 text-white/90 hover:bg-white/20 hover:text-white"
                }`}
              >
                <span>{catName}</span>
                {isActive && <span className="text-xl font-black text-[#b80000]">➔</span>}
              </button>
            );
          })}
        </div>

        {/* Sidebar Footer Link */}
        <div className="p-4 border-t border-red-900/50 bg-[#940000]/70 flex items-center justify-between text-xs text-[#ffde59] font-bold">
          <span>Bazar Technopreneurship 2026</span>
          <Link href="/" className="hover:underline opacity-80">Home</Link>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-h-0 overflow-hidden relative">
        {/* Top Promotional Header Bar */}
        <div className="bg-[#b80000] text-white px-6 py-4 shadow-md flex items-center justify-between shrink-0 border-b border-[#ffde59]/30">
          <div className="flex items-center gap-4">
            <div className="bg-[#ffde59] text-[#b80000] px-4 py-1.5 rounded-full font-black text-xs md:text-sm uppercase tracking-wider shadow-sm transform -rotate-1">
              ★ ENAKNYA BIKIN PENASARAN! ★
            </div>
            <p className="text-xs md:text-sm font-semibold text-[#ffde59] hidden sm:block">
              Panggang Fresh • Porsi Puas • Saus Spesial
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Link
              href="/cart"
              className="bg-[#ffde59] hover:bg-[#facc15] text-[#b80000] px-4 py-2 rounded-xl font-black text-sm flex items-center gap-2 shadow-md transition-all active:scale-95"
            >
              <ShoppingBag size={18} />
              <span>Keranjang</span>
              {totalCartCount > 0 && (
                <span className="bg-[#b80000] text-[#ffde59] text-xs px-2 py-0.5 rounded-full font-black">
                  {totalCartCount}
                </span>
              )}
            </Link>
          </div>
        </div>

        {/* Product Cards Grid Area */}
        <div className="flex-1 p-6 md:p-8 overflow-y-auto touch-scroll hide-scrollbar">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-3xl md:text-4xl font-black text-[#b80000] tracking-tight">
                {activeCategory}
              </h2>
              <p className="text-gray-600 text-sm font-medium mt-0.5">
                Sentuh menu favoritmu untuk memilih varian rasa & tingkat kepedasan
              </p>
            </div>
            <div className="bg-white/80 border border-[#ffde59] px-4 py-1.5 rounded-full text-xs font-black text-[#b80000] shadow-sm">
              {filteredProducts.length} Pilihan Menu
            </div>
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-3 gap-6 md:gap-7 pb-36">
            {filteredProducts.map((product) => (
              <motion.div
                key={product.id}
                whileHover={{ scale: 1.02, y: -4 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => handleOpenDetail(product)}
                className="bg-white rounded-[2rem] shadow-md hover:shadow-2xl transition-all cursor-pointer overflow-hidden border-2 border-[#ffde59]/70 hover:border-[#ffde59] flex flex-col h-[460px] group relative"
              >
                {/* Image Container */}
                <div className="relative h-60 w-full bg-amber-50 overflow-hidden">
                  <img
                    src={product.img}
                    alt={product.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />

                  {/* Best Seller Ribbon Tag */}
                  {product.best_seller && (
                    <div className="absolute top-3 left-3 bg-[#ffde59] text-[#b80000] px-3.5 py-1 rounded-full text-xs font-black shadow-lg uppercase tracking-wider flex items-center gap-1 border border-white/60">
                      <Sparkles size={13} /> Terlaris
                    </div>
                  )}

                  {/* Category Pill Tag */}
                  {product.category.toLowerCase().includes("paket") && (
                    <div className="absolute top-3 right-3 bg-[#b80000] text-white px-3 py-1 rounded-full text-xs font-black shadow-md">
                      Combo Hemat
                    </div>
                  )}
                </div>

                {/* Card Content */}
                <div className="p-5 md:p-6 flex flex-col flex-1 justify-between bg-gradient-to-b from-white to-amber-50/20">
                  <div>
                    <h3 className="text-xl md:text-2xl font-black text-gray-900 group-hover:text-[#b80000] transition-colors line-clamp-1">
                      {product.name}
                    </h3>
                    <p className="text-gray-500 text-xs md:text-sm line-clamp-2 mt-1.5 leading-relaxed">
                      {product.desc}
                    </p>
                  </div>

                  <div className="flex items-center justify-between mt-4 pt-3 border-t border-amber-100">
                    <div>
                      <span className="text-[10px] text-gray-400 font-bold block uppercase tracking-wider">Harga</span>
                      <span className="bg-[#b80000] text-[#ffde59] px-3.5 py-1 rounded-xl text-lg md:text-xl font-black shadow-sm tracking-tight inline-block">
                        {formatPrice(product.price)}
                      </span>
                    </div>

                    <button className="bg-[#ffde59] hover:bg-[#facc15] text-[#b80000] w-12 h-12 rounded-full flex items-center justify-center font-black transition-all shadow-md active:scale-90 border-2 border-white">
                      <Plus size={24} />
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>

      {/* Slide-over Detail & Package Option Builder Modal */}
      <AnimatePresence>
        {selectedProduct && productOptions && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/70 z-40 backdrop-blur-sm"
              onClick={() => setSelectedProduct(null)}
            />

            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="fixed top-0 right-0 w-full max-w-xl md:max-w-2xl h-[100dvh] bg-white z-50 shadow-2xl flex flex-col justify-between overflow-hidden"
            >
              {/* Modal Hero Image & Top Bar */}
              <div className="relative h-60 sm:h-64 w-full bg-amber-100 overflow-hidden shrink-0">
                <img
                  src={selectedProduct.img}
                  alt={selectedProduct.name}
                  className="w-full h-full object-cover"
                />
                {/* Gradient Dark Overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/40 to-black/20" />

                {/* Close Button */}
                <button
                  onClick={() => setSelectedProduct(null)}
                  className="absolute top-4 right-4 w-11 h-11 rounded-full bg-black/60 hover:bg-black/90 text-white flex items-center justify-center transition-all shadow-lg backdrop-blur-sm active:scale-90 z-10 border border-white/20"
                >
                  <X size={22} />
                </button>

                {/* Category Pill & Product Title */}
                <div className="absolute bottom-4 left-6 right-6 z-10">
                  <span className="bg-[#ffde59] text-[#b80000] px-3.5 py-1 rounded-full text-xs font-black uppercase tracking-wider shadow-md inline-block mb-1.5 border border-white/40">
                    {selectedProduct.category}
                  </span>
                  <h3 className="text-2xl sm:text-3xl font-black text-white drop-shadow-md leading-tight">
                    {selectedProduct.name}
                  </h3>
                  {selectedProduct.desc && (
                    <p className="text-xs sm:text-sm text-gray-200 line-clamp-1 mt-1 font-medium">
                      {selectedProduct.desc}
                    </p>
                  )}
                </div>
              </div>

              {/* Modal Scrollable Body */}
              <div className="flex-1 overflow-y-auto p-6 md:p-8 space-y-6 touch-scroll hide-scrollbar">
                {/* 1. Kebab Choice in Package */}
                {productOptions.kebabChoices.length > 0 && (
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <h4 className="text-base sm:text-lg font-black text-gray-900 flex items-center gap-2">
                        <Utensils size={18} className="text-[#b80000]" />
                        Pilih Varian Kebab <span className="text-[#b80000] text-xs font-bold">*Wajib</span>
                      </h4>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {productOptions.kebabChoices.map((choice) => (
                        <button
                          key={choice}
                          type="button"
                          onClick={() => setSelectedKebab(choice)}
                          className={`p-4 rounded-2xl border-2 text-left font-bold transition-all flex items-center justify-between ${
                            selectedKebab === choice
                              ? "border-[#b80000] bg-red-50 text-[#b80000] shadow-sm ring-2 ring-[#ffde59]"
                              : "border-gray-200 bg-white text-gray-700 hover:border-gray-300"
                          }`}
                        >
                          <span className="text-sm md:text-base">{choice}</span>
                          {selectedKebab === choice && <Check size={18} className="text-[#b80000]" />}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* 2. Drink Choice in Package */}
                {productOptions.drinkChoices.length > 0 && (
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <h4 className="text-base sm:text-lg font-black text-gray-900 flex items-center gap-2">
                        <Coffee size={18} className="text-[#b80000]" />
                        Pilih Minuman Pendamping <span className="text-[#b80000] text-xs font-bold">*Wajib</span>
                      </h4>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      {productOptions.drinkChoices.map((drink) => (
                        <button
                          key={drink}
                          type="button"
                          onClick={() => setSelectedDrink(drink)}
                          className={`p-4 rounded-2xl border-2 text-left font-bold transition-all flex items-center justify-between ${
                            selectedDrink === drink
                              ? "border-[#b80000] bg-red-50 text-[#b80000] shadow-sm ring-2 ring-[#ffde59]"
                              : "border-gray-200 bg-white text-gray-700 hover:border-gray-300"
                          }`}
                        >
                          <span className="text-sm md:text-base">{drink}</span>
                          {selectedDrink === drink && <Check size={18} className="text-[#b80000]" />}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* 3. Extra Meat Option for Single Kebab */}
                {productOptions.extraChoices.length > 0 && (
                  <div className="space-y-3">
                    <h4 className="text-base sm:text-lg font-black text-gray-900 flex items-center gap-2">
                      <Sparkles size={18} className="text-[#b80000]" />
                      Pilihan Porsi Daging
                    </h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {productOptions.extraChoices.map((extra) => (
                        <button
                          key={extra.label}
                          type="button"
                          onClick={() => setSelectedExtra(extra.label)}
                          className={`p-4 rounded-2xl border-2 text-left font-bold transition-all flex items-center justify-between ${
                            selectedExtra === extra.label
                              ? "border-[#b80000] bg-red-50 text-[#b80000] shadow-sm ring-2 ring-[#ffde59]"
                              : "border-gray-200 bg-white text-gray-700 hover:border-gray-300"
                          }`}
                        >
                          <span className="text-sm md:text-base">{extra.label}</span>
                          <div
                            className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${
                              selectedExtra === extra.label ? "border-[#b80000] bg-[#b80000]" : "border-gray-300"
                            }`}
                          >
                            {selectedExtra === extra.label && <Check size={14} className="text-white" />}
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* 4. Taste / Spicy Level (No Emojis, Pure Visual Indicators) */}
                {productOptions.spicyOptions.length > 0 && (
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <h4 className="text-base sm:text-lg font-black text-gray-900 flex items-center gap-2">
                        <Flame size={20} className="text-[#b80000]" />
                        Pilihan Rasa / Pedas <span className="text-[#b80000] text-xs font-bold">*Wajib</span>
                      </h4>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      {/* Pedas Option */}
                      <button
                        type="button"
                        onClick={() => setSelectedSpicy("Pedas")}
                        className={`p-4 rounded-2xl border-2 text-left transition-all relative flex flex-col justify-between gap-3 ${
                          selectedSpicy === "Pedas"
                            ? "border-orange-500 bg-orange-50/90 shadow-md ring-2 ring-orange-200"
                            : "border-gray-200 bg-white hover:border-gray-300"
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <div className="w-8 h-8 rounded-xl bg-orange-100 text-orange-600 flex items-center justify-center shrink-0">
                              <Flame size={18} className="fill-orange-500" />
                            </div>
                            <span className="font-black text-base text-gray-900">Pedas</span>
                          </div>
                          {selectedSpicy === "Pedas" && (
                            <div className="w-5 h-5 rounded-full bg-orange-500 text-white flex items-center justify-center shrink-0">
                              <Check size={12} />
                            </div>
                          )}
                        </div>
                        <div className="flex items-center gap-1.5 text-xs font-bold text-orange-700 bg-orange-100/60 px-2.5 py-1 rounded-lg">
                          <span className="w-2 h-2 rounded-full bg-orange-500 inline-block" />
                          <span className="w-2 h-2 rounded-full bg-gray-300 inline-block" />
                          <span className="ml-1 text-[11px]">Level 1 Standar</span>
                        </div>
                      </button>

                      {/* Ekstra Pedas Option */}
                      <button
                        type="button"
                        onClick={() => setSelectedSpicy("Ekstra Pedas")}
                        className={`p-4 rounded-2xl border-2 text-left transition-all relative flex flex-col justify-between gap-3 ${
                          selectedSpicy === "Ekstra Pedas"
                            ? "border-[#b80000] bg-red-50 shadow-md ring-2 ring-red-200"
                            : "border-gray-200 bg-white hover:border-gray-300"
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <div className="w-8 h-8 rounded-xl bg-red-100 text-[#b80000] flex items-center justify-center shrink-0">
                              <Flame size={18} className="fill-[#b80000]" />
                            </div>
                            <span className="font-black text-base text-[#b80000]">Ekstra Pedas</span>
                          </div>
                          {selectedSpicy === "Ekstra Pedas" && (
                            <div className="w-5 h-5 rounded-full bg-[#b80000] text-white flex items-center justify-center shrink-0">
                              <Check size={12} />
                            </div>
                          )}
                        </div>
                        <div className="flex items-center gap-1.5 text-xs font-bold text-[#b80000] bg-red-100/80 px-2.5 py-1 rounded-lg">
                          <span className="w-2 h-2 rounded-full bg-[#b80000] inline-block" />
                          <span className="w-2 h-2 rounded-full bg-[#b80000] inline-block" />
                          <span className="ml-1 text-[11px]">Level 2 Ekstra Panas</span>
                        </div>
                      </button>

                      {/* Manis Option */}
                      <button
                        type="button"
                        onClick={() => setSelectedSpicy("Manis")}
                        className={`p-4 rounded-2xl border-2 text-left transition-all relative flex flex-col justify-between gap-3 ${
                          selectedSpicy === "Manis"
                            ? "border-amber-400 bg-amber-50/90 shadow-md ring-2 ring-amber-200"
                            : "border-gray-200 bg-white hover:border-gray-300"
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <div className="w-8 h-8 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center shrink-0">
                              <Sparkles size={18} className="text-amber-600" />
                            </div>
                            <span className="font-black text-base text-gray-900">Manis</span>
                          </div>
                          {selectedSpicy === "Manis" && (
                            <div className="w-5 h-5 rounded-full bg-amber-500 text-white flex items-center justify-center shrink-0">
                              <Check size={12} />
                            </div>
                          )}
                        </div>
                        <div className="flex items-center gap-1.5 text-xs font-bold text-amber-800 bg-amber-100/60 px-2.5 py-1 rounded-lg">
                          <span className="w-2 h-2 rounded-full bg-amber-400 inline-block" />
                          <span className="w-2 h-2 rounded-full bg-gray-300 inline-block" />
                          <span className="ml-1 text-[11px]">Tidak Pedas</span>
                        </div>
                      </button>
                    </div>
                  </div>
                )}

                {/* 5. Mayo Option (No Emojis, Pure Visual Indicators) */}
                {productOptions.mayoOptions.length > 0 && (
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <h4 className="text-base sm:text-lg font-black text-gray-900 flex items-center gap-2">
                        <Sparkles size={18} className="text-[#b80000]" />
                        Pilihan Mayonaise <span className="text-[#b80000] text-xs font-bold">*Wajib</span>
                      </h4>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <button
                        type="button"
                        onClick={() => setSelectedMayo("Pake Mayo")}
                        className={`p-4 rounded-2xl border-2 text-left transition-all flex items-center justify-between ${
                          selectedMayo === "Pake Mayo"
                            ? "border-emerald-500 bg-emerald-50 shadow-md ring-2 ring-emerald-200"
                            : "border-gray-200 bg-white hover:border-gray-300"
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0">
                            <CheckCircle2 size={18} />
                          </div>
                          <div>
                            <p className="font-black text-base text-gray-900 leading-tight">Pake Mayonaise</p>
                            <p className="text-xs text-gray-500 mt-0.5">Saus mayo lembut & gurih</p>
                          </div>
                        </div>
                        {selectedMayo === "Pake Mayo" && (
                          <div className="w-5 h-5 rounded-full bg-emerald-500 text-white flex items-center justify-center shrink-0">
                            <Check size={12} />
                          </div>
                        )}
                      </button>

                      <button
                        type="button"
                        onClick={() => setSelectedMayo("Tanpa Mayo")}
                        className={`p-4 rounded-2xl border-2 text-left transition-all flex items-center justify-between ${
                          selectedMayo === "Tanpa Mayo"
                            ? "border-gray-400 bg-gray-100 shadow-md ring-2 ring-gray-200"
                            : "border-gray-200 bg-white hover:border-gray-300"
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-xl bg-gray-200 text-gray-700 flex items-center justify-center shrink-0">
                            <Ban size={18} />
                          </div>
                          <div>
                            <p className="font-black text-base text-gray-900 leading-tight">Tanpa Mayonaise</p>
                            <p className="text-xs text-gray-500 mt-0.5">Hanya saus bumbu asli</p>
                          </div>
                        </div>
                        {selectedMayo === "Tanpa Mayo" && (
                          <div className="w-5 h-5 rounded-full bg-gray-500 text-white flex items-center justify-center shrink-0">
                            <Check size={12} />
                          </div>
                        )}
                      </button>
                    </div>
                  </div>
                )}

                {/* 6. Custom Notes */}
                <div className="space-y-2">
                  <h4 className="text-base sm:text-lg font-black text-gray-900">Catatan Khusus (Opsional)</h4>
                  <textarea
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="Contoh: Saus sedikit saja, jangan pakai bawang bombay..."
                    className="w-full bg-gray-50 border border-gray-200 rounded-2xl p-4 text-sm sm:text-base focus:outline-none focus:ring-2 focus:ring-[#b80000] resize-none h-24"
                  />
                </div>
              </div>

              {/* Bottom Action Bar */}
              <div className="p-5 md:p-6 bg-amber-50/80 backdrop-blur border-t-2 border-amber-200 flex items-center justify-between shrink-0 gap-4">
                {/* Quantity Counter */}
                <div className="flex items-center gap-3 bg-white rounded-full p-1.5 border border-gray-200 shadow-sm shrink-0">
                  <button
                    onClick={() => setQty(Math.max(1, qty - 1))}
                    className="w-11 h-11 rounded-full bg-gray-100 flex items-center justify-center text-gray-700 hover:bg-gray-200 active:scale-90 transition-all font-bold text-xl"
                  >
                    -
                  </button>
                  <span className="font-black text-xl w-7 text-center text-gray-900">{qty}</span>
                  <button
                    onClick={() => setQty(qty + 1)}
                    className="w-11 h-11 rounded-full bg-[#b80000] text-white flex items-center justify-center hover:bg-[#940000] active:scale-90 transition-all font-bold text-xl"
                  >
                    +
                  </button>
                </div>

                {/* Add to Cart Button */}
                <button
                  onClick={handleAddToCart}
                  className="flex-1 bg-[#b80000] hover:bg-[#940000] text-[#ffde59] py-4 sm:py-5 px-6 rounded-2xl font-black text-base sm:text-xl shadow-xl shadow-red-900/20 transition-all flex items-center justify-between active:scale-[0.98] border-2 border-[#ffde59]"
                >
                  <span className="flex items-center gap-2">
                    <ShoppingBag size={22} />
                    <span>Tambahkan Pesanan</span>
                  </span>
                  <span className="font-black text-white bg-black/30 px-3 py-1 rounded-xl text-sm sm:text-base">
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
