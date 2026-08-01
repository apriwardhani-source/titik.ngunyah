"use client";

import { Settings } from "lucide-react";

export default function SettingsPage() {
  return (
    <div className="flex flex-col items-center justify-center h-[70vh] text-center">
      <div className="w-24 h-24 bg-gray-100 text-gray-400 rounded-full flex items-center justify-center mb-6">
        <Settings size={48} />
      </div>
      <h2 className="text-3xl font-bold text-gray-900 mb-2">Pengaturan Sistem</h2>
      <p className="text-gray-500 text-lg max-w-md">
        Fitur ini sedang dalam tahap pengembangan. Nantinya Anda dapat mengubah pengaturan jam operasional, pajak, dan profil toko di sini.
      </p>
    </div>
  );
}
