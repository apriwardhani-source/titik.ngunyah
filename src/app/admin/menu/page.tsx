"use client";

import { useState, useEffect } from "react";
import { useMenuStore, Product, Category } from "@/store/useMenuStore";
import { formatPrice } from "@/lib/utils";
import { 
  UploadCloud, 
  Sparkles, 
  Image as ImageIcon, 
  Trash2, 
  Edit3, 
  Plus, 
  RefreshCw,
  Check
} from "lucide-react";

const PRESET_PHOTOS = [
  { name: "Paket Ngunyah Mix", url: "/photos/paket-ngunyah-mix.png" },
  { name: "Paket Ngunyah Puas", url: "/photos/paket-ngunyah-puas.png" },
  { name: "Paket Sultan Ngunyah", url: "/photos/paket-sultan-ngunyah.png" },
  { name: "Kebab Daging", url: "/photos/kebab-daging-besar.png" },
  { name: "Kebab Sosis", url: "/photos/kebab-sosis-besar.png" },
  { name: "Kebab Mix", url: "/photos/kebab-mix-besar.png" },
  { name: "Es Teh", url: "/photos/es-teh.png" },
  { name: "Es Squash Jeruk", url: "/photos/es-milo.png" },
  { name: "Es Moka", url: "/photos/es-milo.png" },
  { name: "Air Es (Acqua)", url: "/photos/air-es.png" },
];

export default function MenuManagementPage() {
  const [activeTab, setActiveTab] = useState<"menu" | "category">("menu");
  const { categories, products, addCategory, updateCategory, deleteCategory, addProduct, updateProduct, deleteProduct, fetchMenus } = useMenuStore();

  useEffect(() => {
    fetchMenus(true); // Fetch all menus including hidden ones for admin
  }, [fetchMenus]);

  // Modal States
  const [isMenuModalOpen, setIsMenuModalOpen] = useState(false);
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
  
  // Form States - Category
  const [editCategoryId, setEditCategoryId] = useState<string | null>(null);
  const [categoryName, setCategoryName] = useState("");

  // Form States - Menu
  const [editMenuId, setEditMenuId] = useState<string | number | null>(null);
  const [menuForm, setMenuForm] = useState({
    name: "",
    category: "",
    price: 0,
    desc: "",
    img: "/photos/paket-ngunyah-mix.png",
    best_seller: false,
    visible: true,
  });
  const [uploading, setUploading] = useState(false);
  const [showPresets, setShowPresets] = useState(false);

  // --- Category Actions ---
  const openCategoryModal = (cat?: Category) => {
    if (cat) {
      setEditCategoryId(cat.id);
      setCategoryName(cat.name);
    } else {
      setEditCategoryId(null);
      setCategoryName("");
    }
    setIsCategoryModalOpen(true);
  };

  const saveCategory = () => {
    if (!categoryName) return;
    if (editCategoryId) {
      updateCategory(editCategoryId, { name: categoryName });
    } else {
      addCategory({ id: Date.now().toString(), name: categoryName });
    }
    setIsCategoryModalOpen(false);
  };

  // --- Menu Actions ---
  const openMenuModal = (product?: Product) => {
    if (product) {
      setEditMenuId(product.id);
      setMenuForm({
        name: product.name,
        category: product.category,
        price: product.price,
        desc: product.desc || "",
        img: product.img || "/photos/paket-ngunyah-mix.png",
        best_seller: product.best_seller,
        visible: product.visible,
      });
    } else {
      setEditMenuId(null);
      setMenuForm({
        name: "",
        category: categories[0]?.name || "Menu Paket",
        price: 0,
        desc: "",
        img: "/photos/paket-ngunyah-mix.png",
        best_seller: false,
        visible: true,
      });
    }
    setShowPresets(false);
    setIsMenuModalOpen(true);
  };

  // Direct client-side compression to WebP/JPEG data URL (100% reliable on Vercel)
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const allowedTypes = ["image/jpeg", "image/png", "image/webp", "image/gif"];
    if (!allowedTypes.includes(file.type)) {
      alert("Format file tidak didukung. Gunakan JPEG, PNG, WebP, atau GIF.");
      return;
    }

    setUploading(true);

    const reader = new FileReader();
    reader.onload = (readerEvent) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement("canvas");
        const MAX_DIM = 600;
        let width = img.width;
        let height = img.height;

        if (width > height) {
          if (width > MAX_DIM) {
            height *= MAX_DIM / width;
            width = MAX_DIM;
          }
        } else {
          if (height > MAX_DIM) {
            width *= MAX_DIM / height;
            height = MAX_DIM;
          }
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext("2d");
        if (ctx) {
          ctx.drawImage(img, 0, 0, width, height);
          const dataUrl = canvas.toDataURL("image/webp", 0.85);
          setMenuForm((prev) => ({ ...prev, img: dataUrl }));
        }
        setUploading(false);
      };
      img.onerror = () => {
        alert("Gagal membaca file gambar.");
        setUploading(false);
      };
      img.src = readerEvent.target?.result as string;
    };
    reader.onerror = () => {
      alert("Gagal membaca file.");
      setUploading(false);
    };
    reader.readAsDataURL(file);
  };

  const saveMenu = async () => {
    if (!menuForm.name || !menuForm.category) return alert("Nama dan kategori wajib diisi");
    if (editMenuId) {
      await updateProduct(editMenuId, menuForm);
    } else {
      await addProduct(menuForm);
    }
    setIsMenuModalOpen(false);
  };

  return (
    <div className="space-y-8 h-full flex flex-col relative">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 shrink-0">
        <div>
          <h2 className="text-3xl font-bold text-gray-900">Manajemen Menu</h2>
          <p className="text-gray-500 text-sm mt-1">Kelola harga, foto, visibilitas, dan status terlaris</p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <button
            onClick={async () => {
              if (confirm("Reset & sinkronkan semua menu ke 11 menu resmi sesuai Brosur Bazar Technopreneurship?")) {
                const res = await fetch("/api/menus/seed-flyer", { method: "POST" });
                const data = await res.json();
                alert(data.message || "Menu berhasil disinkronkan!");
                fetchMenus(true);
              }
            }}
            className="bg-amber-500 hover:bg-amber-600 text-white px-5 py-2.5 rounded-xl font-bold text-sm shadow-md transition-all active:scale-95 flex items-center gap-1.5"
          >
            <span>⚡</span> Sinkronkan Sesuai Brosur
          </button>

          <button 
            onClick={() => activeTab === "menu" ? openMenuModal() : openCategoryModal()}
            className="bg-[#E53935] hover:bg-[#C62828] text-white px-6 py-2.5 rounded-xl font-bold shadow-md transition-all active:scale-95 flex items-center gap-1.5"
          >
            <Plus size={18} /> Tambah {activeTab === "menu" ? "Menu" : "Kategori"}
          </button>
        </div>
      </div>

      <div className="flex gap-4 shrink-0 border-b border-gray-200">
        <button
          onClick={() => setActiveTab("menu")}
          className={`pb-4 px-2 text-lg font-bold border-b-4 transition-colors ${
            activeTab === "menu" ? "border-[#E53935] text-[#E53935]" : "border-transparent text-gray-500 hover:text-gray-700"
          }`}
        >
          Daftar Menu
        </button>
        <button
          onClick={() => setActiveTab("category")}
          className={`pb-4 px-2 text-lg font-bold border-b-4 transition-colors ${
            activeTab === "category" ? "border-[#E53935] text-[#E53935]" : "border-transparent text-gray-500 hover:text-gray-700"
          }`}
        >
          Kategori
        </button>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 flex-1 flex flex-col overflow-hidden">
        <div className="overflow-x-auto flex-1 p-6">
          {activeTab === "menu" ? (
            <table className="w-full text-left border-collapse">
              <thead className="bg-gray-50 text-gray-500 text-sm font-medium">
                <tr>
                  <th className="px-6 py-4 rounded-tl-xl">Gambar</th>
                  <th className="px-6 py-4">Nama Menu</th>
                  <th className="px-6 py-4">Kategori</th>
                  <th className="px-6 py-4">Harga</th>
                  <th className="px-6 py-4">Tags</th>
                  <th className="px-6 py-4">Visibilitas</th>
                  <th className="px-6 py-4 rounded-tr-xl">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 text-sm">
                {products.map((menu) => (
                  <tr key={menu.id} className="hover:bg-gray-50/50">
                    <td className="px-6 py-4">
                      <img src={menu.img} alt={menu.name} className="w-14 h-14 rounded-xl object-cover border border-gray-200 bg-gray-50" />
                    </td>
                    <td className="px-6 py-4 font-bold text-gray-900">{menu.name}</td>
                    <td className="px-6 py-4 text-gray-600">{menu.category}</td>
                    <td className="px-6 py-4 font-medium text-gray-900">
                      {formatPrice(menu.price)}
                    </td>
                    <td className="px-6 py-4">
                      {menu.best_seller && <span className="bg-red-100 text-red-700 px-2 py-1 rounded-md text-xs font-bold mr-2">Terlaris</span>}
                    </td>
                    <td className="px-6 py-4">
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input 
                          type="checkbox" 
                          className="sr-only peer" 
                          checked={menu.visible} 
                          onChange={() => updateProduct(menu.id, { visible: !menu.visible })}
                        />
                        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-green-500"></div>
                      </label>
                    </td>
                    <td className="px-6 py-4">
                      <button onClick={() => openMenuModal(menu)} className="text-blue-600 font-bold hover:text-blue-800 mr-4">Edit</button>
                      <button 
                        onClick={() => {
                          if (confirm(`Yakin ingin menghapus menu "${menu.name}"? Tindakan ini tidak dapat dibatalkan.`)) {
                            deleteProduct(menu.id);
                          }
                        }} 
                        className="text-red-600 font-bold hover:text-red-800"
                      >
                        Hapus
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <table className="w-full text-left border-collapse">
              <thead className="bg-gray-50 text-gray-500 text-sm font-medium">
                <tr>
                  <th className="px-6 py-4 rounded-tl-xl">Nama Kategori</th>
                  <th className="px-6 py-4">Total Menu</th>
                  <th className="px-6 py-4 rounded-tr-xl">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 text-sm">
                {categories.map((cat) => (
                  <tr key={cat.id} className="hover:bg-gray-50/50">
                    <td className="px-6 py-4 font-bold text-gray-900">{cat.name}</td>
                    <td className="px-6 py-4 text-gray-600">{products.filter(p => p.category === cat.name).length} menu</td>
                    <td className="px-6 py-4">
                      <button onClick={() => openCategoryModal(cat)} className="text-blue-600 font-bold hover:text-blue-800 mr-4">Edit</button>
                      <button 
                        onClick={() => {
                          if (confirm(`Yakin ingin menghapus kategori "${cat.name}"?`)) {
                            deleteCategory(cat.id);
                          }
                        }} 
                        className="text-red-600 font-bold hover:text-red-800"
                      >
                        Hapus
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* MODALS */}
      {isCategoryModalOpen && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
          <div className="bg-white p-8 rounded-3xl w-full max-w-md shadow-2xl">
            <h3 className="text-2xl font-bold mb-6">{editCategoryId ? "Edit Kategori" : "Tambah Kategori"}</h3>
            <input
              type="text"
              value={categoryName}
              onChange={(e) => setCategoryName(e.target.value)}
              placeholder="Nama kategori..."
              className="w-full border rounded-xl p-3 mb-6 focus:ring-2 focus:ring-red-500 outline-none"
            />
            <div className="flex justify-end gap-4">
              <button onClick={() => setIsCategoryModalOpen(false)} className="px-4 py-2 font-bold text-gray-500 hover:text-gray-700">Batal</button>
              <button onClick={saveCategory} className="px-5 py-2.5 font-bold bg-[#E53935] text-white rounded-xl hover:bg-red-700 shadow-md">Simpan</button>
            </div>
          </div>
        </div>
      )}

      {isMenuModalOpen && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
          <div className="bg-white p-8 rounded-3xl w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl">
            <h3 className="text-2xl font-black mb-6 text-gray-900">{editMenuId ? "Edit Menu" : "Tambah Menu"}</h3>
            
            <div className="space-y-5">
              {/* Gambar Picker */}
              <div className="p-4 bg-gray-50 rounded-2xl border border-gray-100 space-y-4">
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider">Foto Produk</label>
                <div className="flex flex-col sm:flex-row items-center gap-5">
                  <img 
                    src={menuForm.img} 
                    alt="Preview" 
                    className="w-28 h-28 object-cover rounded-2xl border-2 border-gray-200 shadow-sm bg-white shrink-0" 
                  />
                  
                  <div className="flex-1 w-full space-y-3">
                    <label className="block">
                      <span className="sr-only">Pilih foto dari perangkat</span>
                      <input 
                        type="file" 
                        accept="image/jpeg,image/png,image/webp,image/gif" 
                        onChange={handleFileUpload} 
                        className="block w-full text-xs text-gray-500 file:mr-3 file:py-2.5 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-bold file:bg-[#E53935] file:text-white hover:file:bg-[#C62828] file:cursor-pointer cursor-pointer" 
                      />
                    </label>
                    {uploading && <p className="text-xs font-bold text-blue-600 animate-pulse">Memproses foto...</p>}
                    
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => setShowPresets(!showPresets)}
                        className="text-xs font-bold text-gray-600 hover:text-[#E53935] bg-white border border-gray-200 px-3 py-1.5 rounded-lg shadow-sm flex items-center gap-1.5 transition-colors"
                      >
                        <ImageIcon size={14} />
                        {showPresets ? "Tutup Galeri Foto" : "Pilih dari Galeri Foto Brosur"}
                      </button>
                    </div>
                  </div>
                </div>

                {/* Preset Gallery Picker */}
                {showPresets && (
                  <div className="pt-3 border-t border-gray-200 space-y-2">
                    <p className="text-[11px] font-bold text-gray-500 uppercase tracking-wider">Klik foto untuk memilih:</p>
                    <div className="grid grid-cols-5 gap-2 max-h-40 overflow-y-auto p-1">
                      {PRESET_PHOTOS.map((p) => (
                        <button
                          key={p.name}
                          type="button"
                          onClick={() => {
                            setMenuForm((prev) => ({ ...prev, img: p.url }));
                          }}
                          className={`group relative rounded-xl overflow-hidden border-2 aspect-square p-1 transition-all ${
                            menuForm.img === p.url ? "border-[#E53935] ring-2 ring-red-100" : "border-gray-200 hover:border-gray-400"
                          }`}
                          title={p.name}
                        >
                          <img src={p.url} alt={p.name} className="w-full h-full object-cover rounded-lg" />
                          {menuForm.img === p.url && (
                            <div className="absolute inset-0 bg-red-600/30 flex items-center justify-center">
                              <Check size={16} className="text-white drop-shadow" />
                            </div>
                          )}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">Nama Menu</label>
                <input 
                  type="text" 
                  value={menuForm.name} 
                  onChange={e => setMenuForm({...menuForm, name: e.target.value})} 
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm font-bold focus:ring-2 focus:ring-red-500 outline-none" 
                  placeholder="Nama menu..."
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">Kategori</label>
                  <select 
                    value={menuForm.category} 
                    onChange={e => setMenuForm({...menuForm, category: e.target.value})} 
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm font-bold focus:ring-2 focus:ring-red-500 outline-none cursor-pointer"
                  >
                    {categories.map(c => <option key={c.id} value={c.name}>{c.name}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">Harga (Rp)</label>
                  <input 
                    type="number" 
                    value={menuForm.price} 
                    onChange={e => setMenuForm({...menuForm, price: Number(e.target.value)})} 
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm font-bold focus:ring-2 focus:ring-red-500 outline-none" 
                    placeholder="18000"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">Deskripsi / Rincian Menu</label>
                <textarea 
                  value={menuForm.desc} 
                  onChange={e => setMenuForm({...menuForm, desc: e.target.value})} 
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl p-4 text-sm font-medium focus:ring-2 focus:ring-red-500 outline-none h-24 resize-none" 
                  placeholder="Deskripsi bahan dan isi menu..."
                />
              </div>

              <div className="flex gap-6 pt-2">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" checked={menuForm.best_seller} onChange={e => setMenuForm({...menuForm, best_seller: e.target.checked})} className="w-5 h-5 text-red-600 rounded focus:ring-red-500" />
                  <span className="font-bold text-sm text-gray-700">Tandai Terlaris</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" checked={menuForm.visible} onChange={e => setMenuForm({...menuForm, visible: e.target.checked})} className="w-5 h-5 text-red-600 rounded focus:ring-red-500" />
                  <span className="font-bold text-sm text-gray-700">Tampilkan di Kiosk</span>
                </label>
              </div>
            </div>

            <div className="flex justify-end gap-3 mt-8 pt-4 border-t border-gray-100">
              <button onClick={() => setIsMenuModalOpen(false)} className="px-5 py-2.5 font-bold text-sm text-gray-500 hover:text-gray-700">Batal</button>
              <button onClick={saveMenu} className="px-6 py-2.5 font-bold text-sm bg-[#E53935] hover:bg-[#C62828] text-white rounded-xl shadow-md transition-all active:scale-95" disabled={uploading}>
                Simpan Perubahan
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
