"use client";

import { useState, useEffect } from "react";
import { useMenuStore, Product, Category } from "@/store/useMenuStore";
import { formatPrice } from "@/lib/utils";

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

  // Form States - Menu (using snake_case to match API/Product type)
  const [editMenuId, setEditMenuId] = useState<string | number | null>(null);
  const [menuForm, setMenuForm] = useState({
    name: "",
    category: "",
    price: 0,
    desc: "",
    img: "/photos/default.png",
    best_seller: false,
    visible: true,
  });
  const [uploading, setUploading] = useState(false);

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
        img: product.img,
        best_seller: product.best_seller,
        visible: product.visible,
      });
    } else {
      setEditMenuId(null);
      setMenuForm({
        name: "",
        category: categories[0]?.name || "",
        price: 0,
        desc: "",
        img: "/photos/default.png",
        best_seller: false,
        visible: true,
      });
    }
    setIsMenuModalOpen(true);
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type and size
    const allowedTypes = ["image/jpeg", "image/png", "image/webp", "image/gif"];
    if (!allowedTypes.includes(file.type)) {
      alert("Format file tidak didukung. Gunakan JPEG, PNG, WebP, atau GIF.");
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      alert("Ukuran file maks 5MB.");
      return;
    }

    setUploading(true);
    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });
      const data = await res.json();
      if (data.url) {
        setMenuForm(prev => ({ ...prev, img: data.url }));
      }
    } catch (error) {
      console.error("Upload failed", error);
      alert("Gagal mengunggah gambar");
    } finally {
      setUploading(false);
    }
  };

  const saveMenu = async () => {
    if (!menuForm.name || !menuForm.category) return alert("Nama dan kategori wajib diisi");
    if (editMenuId) {
      await updateProduct(editMenuId, menuForm);
    } else {
      await addProduct(menuForm); // Backend generates ID
    }
    setIsMenuModalOpen(false);
  };

  return (
    <div className="space-y-8 h-full flex flex-col relative">
      <div className="flex justify-between items-center shrink-0">
        <h2 className="text-3xl font-bold text-gray-900">Manajemen Menu</h2>
        <button 
          onClick={() => activeTab === "menu" ? openMenuModal() : openCategoryModal()}
          className="bg-[#E53935] hover:bg-[#C62828] text-white px-6 py-2.5 rounded-lg font-bold shadow-md transition-colors"
        >
          + Tambah {activeTab === "menu" ? "Menu" : "Kategori"}
        </button>
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
                      <img src={menu.img} alt={menu.name} className="w-12 h-12 rounded object-cover border" />
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
                      <button onClick={() => deleteProduct(menu.id)} className="text-red-600 font-bold hover:text-red-800">Hapus</button>
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
                      <button onClick={() => deleteCategory(cat.id)} className="text-red-600 font-bold hover:text-red-800">Hapus</button>
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
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center">
          <div className="bg-white p-8 rounded-2xl w-full max-w-md">
            <h3 className="text-2xl font-bold mb-6">{editCategoryId ? "Edit Kategori" : "Tambah Kategori"}</h3>
            <input
              type="text"
              value={categoryName}
              onChange={(e) => setCategoryName(e.target.value)}
              placeholder="Nama kategori..."
              className="w-full border rounded-lg p-3 mb-6 focus:ring-2 focus:ring-red-500 outline-none"
            />
            <div className="flex justify-end gap-4">
              <button onClick={() => setIsCategoryModalOpen(false)} className="px-4 py-2 font-bold text-gray-500 hover:text-gray-700">Batal</button>
              <button onClick={saveCategory} className="px-4 py-2 font-bold bg-[#E53935] text-white rounded-lg hover:bg-red-700">Simpan</button>
            </div>
          </div>
        </div>
      )}

      {isMenuModalOpen && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center">
          <div className="bg-white p-8 rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <h3 className="text-2xl font-bold mb-6">{editMenuId ? "Edit Menu" : "Tambah Menu"}</h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">Gambar</label>
                <div className="flex items-center gap-4">
                  <img src={menuForm.img} alt="Preview" className="w-24 h-24 object-cover rounded-lg border" />
                  <div className="flex-1">
                    <input type="file" accept="image/jpeg,image/png,image/webp,image/gif" onChange={handleFileUpload} className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-red-50 file:text-red-700 hover:file:bg-red-100" />
                    {uploading && <p className="text-sm text-blue-500 mt-2">Mengunggah...</p>}
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">Nama Menu</label>
                <input type="text" value={menuForm.name} onChange={e => setMenuForm({...menuForm, name: e.target.value})} className="w-full border rounded-lg p-3 focus:ring-2 focus:ring-red-500 outline-none" />
              </div>

              <div className="flex gap-4">
                <div className="flex-1">
                  <label className="block text-sm font-bold text-gray-700 mb-1">Kategori</label>
                  <select value={menuForm.category} onChange={e => setMenuForm({...menuForm, category: e.target.value})} className="w-full border rounded-lg p-3 focus:ring-2 focus:ring-red-500 outline-none">
                    {categories.map(c => <option key={c.id} value={c.name}>{c.name}</option>)}
                  </select>
                </div>
                <div className="flex-1">
                  <label className="block text-sm font-bold text-gray-700 mb-1">Harga (Rp)</label>
                  <input type="number" value={menuForm.price} onChange={e => setMenuForm({...menuForm, price: Number(e.target.value)})} className="w-full border rounded-lg p-3 focus:ring-2 focus:ring-red-500 outline-none" />
                </div>
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">Deskripsi</label>
                <textarea value={menuForm.desc} onChange={e => setMenuForm({...menuForm, desc: e.target.value})} className="w-full border rounded-lg p-3 focus:ring-2 focus:ring-red-500 outline-none h-24 resize-none" />
              </div>

              <div className="flex gap-6 pt-2">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" checked={menuForm.best_seller} onChange={e => setMenuForm({...menuForm, best_seller: e.target.checked})} className="w-5 h-5 text-red-600 rounded focus:ring-red-500" />
                  <span className="font-bold text-gray-700">Terlaris</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" checked={menuForm.visible} onChange={e => setMenuForm({...menuForm, visible: e.target.checked})} className="w-5 h-5 text-red-600 rounded focus:ring-red-500" />
                  <span className="font-bold text-gray-700">Tampilkan Menu</span>
                </label>
              </div>
            </div>

            <div className="flex justify-end gap-4 mt-8 pt-4 border-t">
              <button onClick={() => setIsMenuModalOpen(false)} className="px-4 py-2 font-bold text-gray-500 hover:text-gray-700">Batal</button>
              <button onClick={saveMenu} className="px-4 py-2 font-bold bg-[#E53935] text-white rounded-lg hover:bg-red-700" disabled={uploading}>
                Simpan
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
