# 🍖 Titik Ngunyah — Self-Order Kiosk (Next.js + TiDB Cloud)

Aplikasi **Self-Order Kiosk** untuk restoran Titik Ngunyah (Kebab & Kentang Goreng). Dibangun fullstack 100% menggunakan **Next.js 16** dan **TiDB Cloud (MySQL Serverless)** yang siap dideploy langsung ke **Vercel**.

---

## 📸 Fitur Utama

- **Kiosk Pelanggan** — Splash screen → Katalog menu → Keranjang → Pembayaran → Nomor antrean
- **Pembayaran QRIS Statis** — Tampilan QRIS statis dengan petunjuk input nominal manual & tombol konfirmasi instan
- **Pembayaran Tunai** — Konfirmasi pesanan tunai untuk bayar di kasir
- **Admin Dashboard** — Ringkasan omzet, kelola antrean/pesanan, CRUD menu, dan laporan
- **Database Cloud (TiDB)** — Database MySQL online serverless gratis selamanya, tanpa perlu setup database lokal

---

## 🏗️ Tech Stack & Hosting

| Komponen | Teknologi | Hosting |
|---|---|---|
| **Fullstack App (Frontend + API)** | Next.js 16 (App Router), React 19, TypeScript, Tailwind CSS v4, Zustand | **Vercel** (Gratis) |
| **Database** | MySQL Compatible | **TiDB Cloud Serverless** (Gratis Selamanya) |

> 💡 **Tanpa server backend PHP/Laravel terpisah!** Seluruh API (`/api/menus`, `/api/orders`, `/api/checkout`) sudah terintegrasi langsung di dalam Next.js.

---

## 🚀 Cara Menjalankan di Lokal (Development)

### 1. Clone Repository

```bash
git clone https://github.com/apriwardhani-source/titik.ngunyah.git
cd titik.ngunyah
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Buat File `.env.local`

Buat file `.env.local` di root folder dengan isi:

```env
NEXT_PUBLIC_API_URL=/api

TIDB_HOST=gateway01.ap-southeast-1.prod.aws.tidbcloud.com
TIDB_PORT=4000
TIDB_USER=2mutHwzd3LgsP27.root
TIDB_PASSWORD=GBi554ID2Jx6OGlK
TIDB_DATABASE=titik_ngunyah
```

### 4. Jalankan Aplikasi

```bash
npm run dev
```

Buka browser di: **`http://localhost:3000`** (atau port yang tampil di terminal).

---

## 🌐 Cara Deploy ke Vercel (100% Online)

1. Buka **[vercel.com](https://vercel.com)** dan login dengan akun GitHub kamu.
2. Klik tombol **"Add New" → "Project"**.
3. Pilih repository **`titik.ngunyah`**.
4. Di bagian **Environment Variables**, tambahkan variabel berikut:

   | Key | Value |
   |---|---|
   | `NEXT_PUBLIC_API_URL` | `/api` |
   | `TIDB_HOST` | `gateway01.ap-southeast-1.prod.aws.tidbcloud.com` |
   | `TIDB_PORT` | `4000` |
   | `TIDB_USER` | `2mutHwzd3LgsP27.root` |
   | `TIDB_PASSWORD` | `GBi554ID2Jx6OGlK` |
   | `TIDB_DATABASE` | `titik_ngunyah` |

5. Klik tombol **"Deploy"**! 🚀

---

## 🔗 Halaman Penting

- **Kiosk Pelanggan:** `/`
- **Pilih Menu:** `/menu`
- **Keranjang:** `/cart`
- **Pembayaran:** `/payment`
- **Nomor Antrean:** `/queue`
- **Dashboard Admin:** `/admin`
- **Kelola Pesanan:** `/admin/orders`
- **Kelola Menu:** `/admin/menu`
