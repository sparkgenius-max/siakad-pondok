# SIPPIA - Sistem Informasi Pondok Pesantren Imam Ad-Damanhuri

SIPPIA adalah platform manajemen akademik modern yang dirancang khusus untuk Pondok Pesantren, memberikan solusi efisien untuk pengelolaan data santri, absensi, nilai, pembayaran, hingga cetak raport secara otomatis.

## ✨ Fitur Utama

-   **Dashboard Intelijen**: Ringkasan data santri aktif, statistik pembayaran bulanan, dan perizinan terbaru dalam satu tampilan.
-   **Manajemen Santri**: Pengelolaan database santri yang komprehensif (NIS, Kelas, Program, Status).
-   **Absensi Digital**: Sistem absensi harian untuk program Diniyah dan Tahfidz dengan rekapitulasi otomatis (Hadir, Sakit, Izin, Alfa).
-   **Monitoring Tahfidz**: Pencatatan progres hafalan santri (Ziyadah & Murojaah) secara harian.
-   **Manajemen Nilai (Grades)**: Input nilai akademik (Teori & Praktik) secara massal (Bulk Input) yang efisien.
-   **Syahriah & Pembayaran**: Pelacakan status pembayaran bulanan santri dengan laporan tunggakan.
-   **Sistem Perizinan**: Pengelolaan izin keluar/masuk santri yang terintegrasi.
-   **Generator Raport PDF**: Cetak raport resmi (Diniyah & Tahfidz) dalam format PDF secara instan dengan data nilai dan absensi yang akurat.
-   **Desain Responsif (Mobile-First)**: Optimasi antarmuka ganda (Dual-View) — tampilan Kartu yang elegan untuk Mobile dan Tabel padat untuk Desktop.
-   **Role-Based Access Control (RBAC)**: Hak akses berbeda untuk **Admin**, **Pengasuh**, dan **Guru/Ustadz**.

## 🚀 Teknologi Utama

-   **Framework**: [Next.js 15 (App Router)](https://nextjs.org/)
-   **Language**: [TypeScript](https://www.typescriptlang.org/)
-   **Backend & Database**: [Supabase](https://supabase.com/) (PostgreSQL & Auth)
-   **Styling**: [Tailwind CSS](https://tailwindcss.com/) + [shadcn/ui](https://ui.shadcn.com/)
-   **PDF Generation**: [@react-pdf/renderer](https://react-pdf.org/)
-   **State Management & Data Fetching**: Server Components & Server Actions

## 🛠️ Panduan Instalasi

### 1. Prasyarat
Pastikan Anda memiliki Node.js dan akun Supabase.

### 2. Variabel Lingkungan
Buat file `.env.local` di root direktori:

```bash
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key (untuk bypass RLS di Dashboard)
```

### 3. Setup Database
Eksekusi script SQL yang tersedia di `SUPABASE_SCHEMA.sql` pada SQL Editor Supabase Anda. Ini akan membuat tabel:
-   `profiles`: Data pengguna & role.
-   `santri`: Master data santri.
-   `payments`: Data syahriah.
-   `permissions`: Data perizinan.
-   `grades`: Nilai akademik Diniyah.
-   `monitoring_tahfidz`: Log hafalan.
-   `attendance`: Data absensi harian.

### 4. Instalasi & Menjalankan Aplikasi
```bash
# Install dependensi
npm install

# Jalankan mode pengembangan
npm run dev
```

## 📂 Struktur Folder Utama

```
/src
  /app
    /(auth)         -> Alur login dan autentikasi.
    /(dashboard)    -> Halaman utama aplikasi (Protected).
      /santri       -> Pengelolaan Santri.
      /payments     -> Pengelolaan Pembayaran Syahriah.
      /permissions  -> Manajemen Perizinan.
      /grades       -> Input & Lihat Nilai.
      /monitoring   -> Log Hafalan Tahfidz.
      /reports      -> Generator Raport.
      /attendance   -> Sistem Absensi.
  /components
    /layout         -> Header, Sidebar (Responsive).
    /ui             -> Komponen atomik (shadcn).
    /reports        -> Logika PDF & Template Raport.
    /[feature]      -> Komponen spesifik fitur (e.g., /grades, /attendance).
  /lib
    /supabase       -> Konfigurasi klien Supabase (Client, Server, Admin).
  /types            -> Type definitions global.
```

## 📝 Catatan Rilis (Maret 2026)
-   Implementasi **Mobile-First Design** untuk semua tabel data.
-   Penyatuan deteksi Role untuk konsistensi tampilan Mobile/Desktop.
-   Optimasi template Raport Diniyah (perbaikan wrapping teks & spacing).
-   Penambahan link navigasi cepat dari tabel ke profil detail santri.

## 📄 Lisensi
[MIT License](LICENSE)
