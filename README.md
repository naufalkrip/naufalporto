# Personal Portfolio Website + Hidden Admin CMS Dashboard

Website portfolio personal modern dan elegan dengan sistem Content Management System (CMS) tersembunyi.
Menggunakan **Google Spreadsheet** sebagai database utama, **Google Apps Script** sebagai API/Backend, dan **Google Drive** sebagai penyimpanan media/gambar.

---

## 🚀 Fitur Utama

- **Public Portfolio Website (`/`)**:
  - Desain modern 2026 yang minimalis, clean, dan profesional.
  - Tipografi Google Fonts: *Plus Jakarta Sans* (Heading) dan *Inter* (Body).
  - Bagian: **Navbar**, **Hero**, **About Me**, **Selected Works**, **Contact Me**, dan **Footer**.
  - Filter kategori portfolio dinamis dengan hover micro-animations halus.
  - Mode Maintenance: jika diaktifkan dari admin, pengunjung melihat halaman maintenance sementara admin tetap dapat mengakses dashboard.
  - Auto-sync: pembaruan otomatis setiap 20-30 detik tanpa perlu refresh halaman.
  - Tanpa link login/admin pada navigasi publik.

- **Hidden Admin CMS (`/secret-login` & `/admin/*`)**:
  - Jalur login tersembunyi dengan proteksi autentikasi token.
  - **Overview Dashboard**: Statistik total karya, status published, draft, dan log aktivitas real-time.
  - **Profile Manager**: Edit nama, role, short intro, biografi lengkap, skills, dan upload foto profil ke Google Drive.
  - **Portfolio Manager**: CRUD lengkap (tambah karya, edit, hapus dengan dialog konfirmasi, atur urutan tampil, dan toggle publish/draft).
  - **Contact Manager**: Aktifkan/nonaktifkan saluran kontak (Email, WhatsApp, Instagram, LinkedIn, GitHub, Website).
  - **Settings Manager**: Ganti warna aksen tema visual langsung, ubah meta SEO, aktifkan Maintenance Mode.

- **Zero-Config Demo Mode**:
  - Jika belum terhubung ke Google Apps Script, website otomatis berjalan dalam **Demo Mode** dengan data dummy lengkap sehingga dapat langsung dicoba secara lokal tanpa error atau layar kosong!

---

## 🛠️ Stack Teknologi

- **Frontend**: React 19 + TypeScript + Vite + Tailwind CSS + Lucide Icons
- **Backend**: Google Apps Script Web App
- **Database**: Google Spreadsheet (Sheets: `PROFILE`, `PORTFOLIO`, `SETTINGS`, `ADMIN`, `ACTIVITY_LOG`)
- **Media Storage**: Google Drive

---

## 📖 Panduan Lengkap Setup Google Apps Script (Untuk Non-Programmer)

Ikuti 7 langkah praktis berikut untuk menghubungkan website Anda ke Google Spreadsheet & Google Drive Anda sendiri:

### LANGKAH 1: Buat Google Spreadsheet Baru
1. Buka [Google Sheets](https://sheets.new) di browser Anda.
2. Beri nama spreadsheet Anda, misalnya: `My Portfolio Database`.
3. Salin **Spreadsheet ID** dari URL browser Anda:
   - Contoh URL: `https://docs.google.com/spreadsheets/d/1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgvE2upms/edit`
   - Maka Spreadsheet ID adalah: `1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgvE2upms`

---

### LANGKAH 2: Buka Apps Script Editor
1. Di Google Spreadsheet Anda, klik menu bar atas: **Extensions** (Ekstensi) → **Apps Script**.
2. Beri nama proyek Apps Script, misalnya: `Portfolio Backend API`.

---

### LANGKAH 3: Salin Kode Backend dari Folder `apps-script/`
Di dalam editor Apps Script, buat file script (.gs) dan salin kode dari folder `apps-script/` pada proyek ini:

1. `Code.gs` → Salin isi dari `apps-script/Code.gs`
2. `Auth.gs` → Salin isi dari `apps-script/Auth.gs`
3. `Utils.gs` → Salin isi dari `apps-script/Utils.gs`
4. `Profile.gs` → Salin isi dari `apps-script/Profile.gs`
5. `Portfolio.gs` → Salin isi dari `apps-script/Portfolio.gs`
6. `Settings.gs` → Salin isi dari `apps-script/Settings.gs`
7. `Drive.gs` → Salin isi dari `apps-script/Drive.gs`
8. `ActivityLog.gs` → Salin isi dari `apps-script/ActivityLog.gs`
9. `Setup.gs` → Salin isi dari `apps-script/Setup.gs`

---

### LANGKAH 4: Jalankan Otomatisasi `setupSpreadsheet()` (1-Click Setup)
Anda **tidak perlu membuat sheet dan kolom secara manual satu per satu**!
1. Di editor Apps Script, buka file `Setup.gs`.
2. Di dropdown fungsi bagian atas, pilih fungsi **`setupSpreadsheet`**.
3. Klik tombol **Run** (Jalankan).
4. Google akan meminta izin akses (Review Permissions) → Pilih akun Google Anda → Klik *Advanced* → Klik *Go to Portfolio Backend API (unsafe)* → Klik *Allow*.
5. Selesai! Buka kembali tab Google Spreadsheet Anda: seluruh 5 sheet (`PROFILE`, `PORTFOLIO`, `SETTINGS`, `ADMIN`, `ACTIVITY_LOG`) sudah terbuat otomatis dengan header dan data awal!

> 💡 **Akun Admin Default Pertama Anda:**
> - **Username**: `admin`
> - **Password**: `admin123`
> *(Password ini sudah otomatis di-hash dengan algoritma SHA-256 di database).*

---

### LANGKAH 5: Konfigurasi Script Properties (Keamanan)
1. Di Apps Script Editor, klik ikon **Project Settings** (ikon roda gigi / gerigi di sidebar kiri).
2. Gulir ke bawah ke bagian **Script Properties**.
3. Klik **Add script property** dan masukkan 3 konfigurasi:
   - Property: `SPREADSHEET_ID` → Value: *(Paste Spreadsheet ID Anda dari Langkah 1)*
   - Property: `SECRET_KEY` → Value: *(Masukkan string acak rahasia Anda, misal: `rahasia_portfolio_2026`)*
   - Property: `DRIVE_FOLDER_ID` → *(Opsional, kosongkan jika ingin otomatis dibuatkan folder 'Portfolio Website' di Google Drive Anda)*
4. Klik **Save script properties**.

---

### LANGKAH 6: Deploy Sebagai Web App
1. Klik tombol **Deploy** (kanan atas) → **New deployment**.
2. Klik ikon gerigi di sebelah *Select type* → Pilih **Web app**.
3. Isi kolom berikut:
   - **Description**: `Portfolio API v1`
   - **Execute as**: `Me (email Anda)`
   - **Who has access**: `Anyone` *(Penting agar website frontend dapat memuat data portfolio tanpa login akun Google)*
4. Klik **Deploy**.
5. Salin **Web app URL** yang muncul (berakhiran `/exec`).
   - Contoh: `https://script.google.com/macros/s/AKfycby.../exec`

---

### LANGKAH 7: Hubungkan ke Frontend Website
1. Di folder proyek frontend ini, buat file `.env` (atau duplikasi dari `.env.example`):
   ```bash
   cp .env.example .env
   ```
2. Buka file `.env` dan masukkan URL Web App Anda:
   ```env
   VITE_APPS_SCRIPT_URL=https://script.google.com/macros/s/AKfycby.../exec
   ```
3. Simpan file `.env`. Selesai! Website Anda sekarang terhubung penuh ke Google Sheets dan Google Drive Anda!

---

## 💻 Menjalankan Project Frontend Secara Lokal

Pastikan Anda telah menginstal **Node.js** (versi 18 ke atas).

```bash
# 1. Masuk ke direktori proyek
cd /Users/abay/Desktop/Portofolio

# 2. Instal dependensi (jika belum)
npm install

# 3. Jalankan server development lokal
npm run dev
```

Buka browser di:
- **Public Portfolio**: `http://localhost:5173/`
- **Admin Login Tersembunyi**: `http://localhost:5173/secret-login`

---

## 📦 Build Production & Deploy Website

### Build Bundle
```bash
npm run build
```
Folder hasil build terletak di direktori `dist/`.

### Cara Deploy ke Hosting Gratis (Vercel / Netlify / Cloudflare Pages)

#### Opsi 1: Vercel
1. Upload proyek ke GitHub / GitLab.
2. Masuk ke [vercel.com](https://vercel.com) → *Add New Project* → Import repository.
3. Di bagian **Environment Variables**, tambahkan:
   - Name: `VITE_APPS_SCRIPT_URL`
   - Value: *(URL Web App Google Apps Script Anda)*
4. Klik **Deploy**.

#### Opsi 2: Netlify
1. Buka [netlify.com](https://netlify.com) → *Add new site* → *Import an existing project*.
2. Build command: `npm run build`
3. Publish directory: `dist`
4. Tambahkan Environment Variable `VITE_APPS_SCRIPT_URL`.
5. Klik **Deploy Site**.

---

## 🔐 Keamanan & Akses Admin
- Rute admin `/secret-login` dan `/admin` tidak ditampilkan di menu publik manapun.
- Autentikasi dilindungi token berbasis session timeout.
- Password admin disimpan dalam bentuk hash SHA-256 dengan salt rahasia di sheet `ADMIN`.
- Setiap aksi modifikasi (Create, Update, Delete) dicatat secara otomatis ke sheet `ACTIVITY_LOG`.

---

© 2026. Arsitektur modular portofolio modern berbasis Google Workspace Stack.
