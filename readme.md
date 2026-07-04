# 🌱 SeumpamaBayar

**Aplikasi Web Pembayaran Tagihan Multi-Layanan & Pengisian Pulsa**

Aplikasi frontend simulasi pembayaran tagihan (PLN, PDAM, Internet, Seminar) dan pengisian pulsa/paket data. Dibangun dengan **HTML5, CSS3, Bootstrap 5, dan Vanilla JavaScript (ES6+)**. Seluruh data disimpan di **LocalStorage**.

---

## 🚀 Demo Live

🔗 **Live Demo:** [https://quinc3.github.io/SeumpamaBayar](https://quinc3.github.io/SeumpamaBayar)

---

## ✨ Fitur Utama

### 🔹 Dashboard
- Ringkasan saldo, statistik transaksi, grafik pengeluaran (Chart.js)
- Quick access 6 layanan, promo banner, riwayat terakhir

### 🔹 Bayar Tagihan
- 4 kategori: PLN, PDAM, Internet, Seminar
- Cek tagihan, detail lengkap, 3 metode pembayaran (VA, QRIS, Teller)
- QR Code QRIS asli (QRCode.js), countdown 5 menit
- Cetak struk (Print & Download PDF via jsPDF)

### 🔹 Biaya Kuliah (SPP)
- Input NIM, daftar cicilan 6-8 item, progress bar, multi-select

### 🔹 Isi Pulsa & Paket Data
- 6 provider, deteksi otomatis, pulsa & paket data, custom nominal

### 🔹 Riwayat Transaksi
- Filter, search, sort, export CSV, cetak ulang struk

### 🔹 Profil & FAQ
- Edit profil, statistik pribadi, halaman bantuan

### 🔹 Dark Mode
- Toggle light/dark, preferensi disimpan

---

## 🛠 Teknologi

| Teknologi | Via |
|-----------|-----|
| HTML5, CSS3, JavaScript ES6+ | Native |
| Bootstrap 5.3, Bootstrap Icons 1.11 | CDN |
| Chart.js 4.x, QRCode.js 1.0, jsPDF 2.5 | CDN |
| LocalStorage | Browser API |

---

## 📁 Struktur Proyek

SeumpamaBayar/
├── index.html # Dashboard
├── bayar-tagihan.html # Bayar Tagihan
├── spp.html # Biaya Kuliah
├── pulsa.html # Isi Pulsa
├── riwayat.html # Riwayat Transaksi
├── profil.html # Profil
├── faq.html # Bantuan
├── README.md
└── assets/
├── css/
│ └── style.css
└── js/
├── data.js # Data dummy
├── storage.js # LocalStorage helper
├── utils.js # Fungsi utilitas
├── dashboard.js # Logic Dashboard
├── tagihan.js # Logic Bayar Tagihan
├── spp.js # Logic SPP
├── pulsa.js # Logic Isi Pulsa
└── riwayat.js # Logic Riwayat


---

## 🔧 Cara Menjalankan

### Metode 1: Buka Langsung
1. Clone atau download repository ini
2. Ekstrak file ZIP (jika download)
3. Buka `index.html` di browser (Chrome/Firefox/Edge)
4. Tidak perlu server atau database

### Metode 2: Live Server (VS Code)
1. Buka folder project di VS Code
2. Install extension Live Server
3. Klik kanan `index.html` → Open with Live Server

---

## 📋 Data Dummy

### Tagihan
| Kategori | ID Contoh |
|----------|-----------|
| PLN | `123456789012` |
| PDAM | `PDAM001` |
| Internet | `INET001` |
| Seminar | `EVT2024` (bebas) |

### SPP (NIM)
| NIM | Nama | Cicilan |
|-----|------|---------|
| `2024001` | Andi Pratama | 6 cicilan @Rp 2.500.000 |
| `2024002` | Bunga Citra | 8 cicilan @Rp 2.000.000 |
| `2024003` | Cindy Permata | 6 cicilan @Rp 3.000.000 |

### Provider Pulsa (Deteksi Otomatis)
| Provider | Prefix |
|----------|--------|
| Telkomsel | 0812, 0813, 0821, 0822, dst. |
| Indosat | 0814, 0815, 0855, dst. |
| XL | 0817, 0818, 0877, dst. |
| Tri | 0895, 0896, 0897, dst. |
| Smartfren | 0881-0888 |
| Axis | 0831, 0832, 0833, 0838 |

---

## 🎯 Checklist Fitur

### Fitur Wajib (100%)
- [x] Dashboard dengan saldo & statistik
- [x] Bayar Tagihan (PLN, PDAM, Internet, Seminar)
- [x] Biaya Kuliah / SPP (NIM, cicilan, progress bar, multi-select)
- [x] Isi Pulsa & Paket Data (6 provider, deteksi otomatis)
- [x] Riwayat Transaksi (filter, search, sort, export)
- [x] 3 Metode Pembayaran (VA, QRIS, Teller)
- [x] Validasi form real-time
- [x] Loading spinner, toast notification
- [x] Modal konfirmasi & sukses
- [x] Cetak struk (Print & PDF via jsPDF)
- [x] QR Code QRIS asli (QRCode.js)
- [x] Responsive design (mobile, tablet, desktop)
- [x] LocalStorage

### Nilai Tambah
- [x] Chart.js grafik pengeluaran
- [x] Dark/Light mode toggle
- [x] Halaman Profil (edit + statistik)
- [x] Halaman FAQ / Bantuan (search, accordion)
- [x] Export CSV riwayat
- [x] Filter by date range
- [x] Copy VA / kode bayar
- [x] Countdown timer QRIS 5 menit
- [x] VA per bank (BCA, BNI, Mandiri)
- [x] Custom input nominal pulsa
- [x] Hover effects + animasi
- [x] Progress bar SPP
- [x] Keyboard accessible + ARIA labels
- [x] Edge cases handling

---

## 👤 Author

| | |
|---|---|
| **Nama** | Fariz Afdilah Muhamad |
| **NIM** | 221011450661 |
| **Kelas** | TPLE 002 |
| **Mata Kuliah** | Pemrograman Web 2 / Frontend Development |
| **Semester** | 7 |
| **GitHub** | [@Quinc3](https://github.com/Quinc3) |

---

## 📝 Lisensi

Proyek ini dibuat untuk keperluan **akademis** (UAS Pemrograman Web 2). Tidak untuk produksi.

---

© 2026 SeumpamaBayar. All rights reserved.