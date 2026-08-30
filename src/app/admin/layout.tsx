"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, ShoppingBag, UtensilsCrossed, BarChart3, Settings, Bell, UserCircle, LogOut } from "lucide-react";
import AdminAuthGuard from "@/components/AdminAuthGuard";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  const navigation = [
    { name: "Dashboard", href: "/admin", icon: LayoutDashboard },
    { name: "Pesanan", href: "/admin/orders", icon: ShoppingBag },
    { name: "Manajemen Menu", href: "/admin/menu", icon: UtensilsCrossed },
    { name: "Laporan", href: "/admin/reports", icon: BarChart3 },
    { name: "Pengaturan", href: "/admin/settings", icon: Settings },
  ];

  const handleLogout = () => {
    if (typeof window !== "undefined" && (window as any).__tn_admin_logout) {
      (window as any).__tn_admin_logout();
    }
  };

  return (
    <AdminAuthGuard>
      <div className="flex h-screen bg-gray-50 text-gray-900 font-sans">
        {/* Sidebar */}
        <div className="w-72 bg-white border-r border-gray-200 flex flex-col">
          <div className="h-20 flex items-center px-8 border-b border-gray-100">
            <h1 className="text-2xl font-black tracking-tight text-gray-900">
              TITIK<span className="text-[#E53935]">NGUNYAH</span>
            </h1>
          </div>
          <nav className="flex-1 px-4 py-8 space-y-2 overflow-y-auto">
            {navigation.map((item) => {
              const isActive = pathname === item.href;
              const Icon = item.icon;
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`flex items-center gap-4 px-4 py-3 rounded-xl font-medium transition-all ${
                    isActive
                      ? "bg-[#E53935] text-white shadow-md"
                      : "text-gray-500 hover:bg-red-50 hover:text-[#E53935]"
                  }`}
                >
                  <Icon size={20} className={isActive ? "text-white" : ""} />
                  {item.name}
                </Link>
              );
            })}
          </nav>

          {/* Logout Button */}
          <div className="px-4 pb-6 border-t border-gray-100 pt-4">
            <button
              onClick={handleLogout}
              className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-gray-500 hover:bg-red-50 hover:text-red-600 font-medium transition-all"
            >
              <LogOut size={20} />
              Keluar
            </button>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Top Navbar */}
          <header className="h-20 bg-white border-b border-gray-200 flex items-center justify-between px-8 shrink-0">
            <div className="text-gray-500 font-medium">
              {new Date().toLocaleDateString("id-ID", { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
            </div>
            <div className="flex items-center gap-6">
              <button className="relative p-2 text-gray-400 hover:text-gray-600 transition-colors">
                <Bell size={24} />
                <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-[#E53935] rounded-full border-2 border-white" />
              </button>
              <div className="flex items-center gap-3 pl-6 border-l border-gray-200">
                <UserCircle size={32} className="text-gray-400" />
                <div>
                  <p className="text-sm font-bold text-gray-700">Admin</p>
                  <p className="text-xs text-gray-500">Titik Ngunyah</p>
                </div>
              </div>
            </div>
          </header>

          {/* Page Content */}
          <main className="flex-1 overflow-y-auto p-8 bg-gray-50">
            {children}
          </main>
        </div>
      </div>
    </AdminAuthGuard>
  );
}
