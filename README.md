# 🍖 Titik Ngunyah — Self-Order Kiosk (Fullstack Monorepo)

Aplikasi **Self-Order Kiosk** untuk restoran Titik Ngunyah (Kebab & Kentang Goreng). Pelanggan bisa memesan langsung dari layar kiosk, memilih metode pembayaran (QRIS / Tunai), dan mendapatkan nomor antrean otomatis secara realtime.

---

## 🏗️ Struktur Project (Monorepo)

Semua kode frontend dan backend sekarang berada dalam **1 repository**:

```
titik.ngunyah/
├── backend/                  # Backend API (Laravel 11, Reverb WebSocket)
│   ├── app/
│   ├── routes/
│   ├── .env.example
│   └── artisan
│
├── src/                      # Frontend Kiosk (Next.js 16, React 19, Tailwind v4)
│   ├── app/                  # Routes (kiosk pages & admin)
│   ├── components/
│   ├── store/                # Zustand state stores
│   └── lib/
│
├── public/                   # Static assets & images
├── package.json
└── README.md
```

| Komponen | Tech Stack | Cloud / Hosting |
|---|---|---|
| **Frontend** | Next.js 16, React 19, TypeScript, Tailwind CSS v4, Zustand | **Vercel** |
| **Backend** | Laravel 11 (PHP 8.2+), Laravel Reverb (WebSocket) | **Local / VPS / Cloud** |
| **Database** | MySQL (Kompatibel 100%) | **TiDB Cloud (Serverless Free)** |
| **Payment Gateway** | Midtrans (QRIS & Core API) | **Midtrans Sandbox** |

---

## 🚀 Cara Setup & Menjalankan (Step by Step)

### 1. Clone Repository (Hanya 1 Kali Clone)

```bash
cd C:\laragon\www
git clone https://github.com/apriwardhani-source/titik.ngunyah.git
cd titik.ngunyah
```

---

### 2. Setup Database & Backend (Laravel)

```bash
cd backend
composer install
```

#### Buat file `.env` backend:
Copy file `.env.example` menjadi `.env`:
```bash
cp .env.example .env
php artisan key:generate
```

Database sudah menggunakan **TiDB Cloud (Serverless)**, pastikan konfigurasi di `backend/.env` terisi:
```env
DB_CONNECTION=mysql
DB_HOST=gateway01.ap-southeast-1.prod.aws.tidbcloud.com
DB_PORT=4000
DB_DATABASE=titik_ngunyah
DB_USERNAME=2mutHwzd3LgsP27.root
DB_PASSWORD=GBi554ID2Jx6OGlK
```

#### Jalankan migrasi & seed awal:
```bash
php artisan migrate --seed
```

---

### 3. Setup Frontend (Next.js)

Buka terminal di root folder project (`titik.ngunyah`):

```bash
npm install
```

Pastikan file `.env.local` di root berisi:
```env
NEXT_PUBLIC_API_URL=http://127.0.0.1:8000/api
NEXT_PUBLIC_REVERB_APP_KEY=mj47xsyfbdkdaoy8xsyp
NEXT_PUBLIC_REVERB_HOST=localhost
NEXT_PUBLIC_REVERB_PORT=8080
NEXT_PUBLIC_REVERB_SCHEME=http
```

---

## 🖥️ Cara Menjalankan Sehari-hari

Buka **3 terminal**:

| Terminal | Lokasi Folder | Perintah | Fungsi |
|---|---|---|---|
| 1️⃣ | `titik.ngunyah/backend` | `php artisan serve` | API Backend (`http://127.0.0.1:8000`) |
| 2️⃣ | `titik.ngunyah/backend` | `php artisan reverb:start` | WebSocket Realtime (`port 8080`) |
| 3️⃣ | `titik.ngunyah` (root) | `npm run dev` | Frontend Kiosk (`http://localhost:3000`) |

---

## 🌐 Deploy ke Vercel (Frontend)

1. Import repository `titik.ngunyah` ke akun Vercel kamu.
2. Di bagian **Environment Variables** Vercel, masukkan:
   - `NEXT_PUBLIC_API_URL` = `https://url-backend-kamu/api`
   - `NEXT_PUBLIC_REVERB_APP_KEY` = `mj47xsyfbdkdaoy8xsyp`
   - `NEXT_PUBLIC_REVERB_HOST` = `url-backend-kamu`
   - `NEXT_PUBLIC_REVERB_PORT` = `8080`
   - `NEXT_PUBLIC_REVERB_SCHEME` = `https`
3. Klik **Deploy**! 🚀

---

## 🔗 Halaman Penting

- **Kiosk Pelanggan:** `http://localhost:3000`
- **Menu Pelanggan:** `http://localhost:3000/menu`
- **Dashboard Admin:** `http://localhost:3000/admin`
- **Manajemen Pesanan:** `http://localhost:3000/admin/orders`
- **Laporan Penjualan:** `http://localhost:3000/admin/reports`
