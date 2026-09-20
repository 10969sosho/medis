# SIM-Klinik Pro

Sistem Informasi Manajemen Klinik — Aplikasi Demo Lengkap dengan semua fitur aktif dan data dummy realistis.

## 🚀 Cara Menjalankan

```bash
cd klinik-app
npm install
npm run dev
```

Buka [http://localhost:3000](http://localhost:3000)

---

## 📋 Modul & Fitur

| Modul | URL | Fitur |
|---|---|---|
| Dashboard | `/` | Ringkasan statistik, antrian hari ini, kunjungan terbaru, alert stok |
| Pendaftaran | `/pendaftaran` | Daftar & cari pasien, tambah pasien baru, daftarkan ke antrian |
| Rekam Medis | `/rekam-medis` | Input SOAP EMR, diagnosa ICD-10, e-Resep, tanda vital |
| Riwayat Pasien | `/riwayat` | Timeline kunjungan lengkap, profil pasien, riwayat resep |
| Antrian | `/antrian` | Display antrian, pemanggilan TTS audio, multi-poli |
| Apotek | `/apotek` | Manajemen stok obat, alert kritis & expired |
| Kasir | `/kasir` | Pembayaran, cetak invoice, riwayat transaksi |
| Reminder & ANC | `/reminder` | Reminder WA pasien kontrol, jadwal kehamilan ANC |
| Laporan | `/laporan` | Kunjungan, morbiditas 10 besar, pendapatan, grafik |

---

## 🛠 Tech Stack

- **Next.js 16** (App Router)
- **TypeScript**
- **Tailwind CSS v4**
- **Lucide React** (icons)
- **Recharts** (grafik laporan)
- **LocalStorage** (data persistence, zero-config demo)

---

## 👤 Demo Data (Pre-loaded)

7 pasien terdaftar dengan riwayat kunjungan, stok obat 10 item, dan antrian hari ini sudah terisi untuk keperluan demo.

Untuk reset data ke kondisi awal: buka browser console dan jalankan:
```js
Object.keys(localStorage).filter(k => k.startsWith('klinik_')).forEach(k => localStorage.removeItem(k))
location.reload()
```
