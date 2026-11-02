# SIM-Klinik Pro — Dokumentasi Lengkap

## Daftar Isi

1. [Arsitektur & Tech Stack](#1-arsitektur--tech-stack)
2. [Data Model (Types)](#2-data-model-types)
3. [Data Persistence (Store)](#3-data-persistence-store)
4. [Modul Dashboard](#4-modul-dashboard)
5. [Modul Pendaftaran Pasien](#5-modul-pendaftaran-pasien)
6. [Modul Antrian](#6-modul-antrian)
7. [Modul Rekam Medis](#7-modul-rekam-medis)
8. [Modul Riwayat Pasien](#8-modul-riwayat-pasien)
9. [Modul Reminder & ANC](#9-modul-reminder--anc)
10. [Modul Kasir & Billing](#10-modul-kasir--billing)
11. [Modul Apotek & Obat](#11-modul-apotek--obat)
12. [Modul Laporan & Analitik](#12-modul-laporan--analitik)
13. [Sidebar & Navigasi](#13-sidebar--navigasi)
14. [Utility Functions](#14-utility-functions)

---

## 1. Arsitektur & Tech Stack

### Framework
- **Next.js 16.3.5** (App Router)
- **React 19.2.8**
- **TypeScript 5**

### UI
- **Tailwind CSS 4** via `@tailwindcss/postcss`
- **Lucide React** — icon library
- **Recharts 3.10** — charting (bar chart di modul Laporan)

### State Management
- **localStorage** — semua data disimpan di browser (client-only, demo mode)
- Tidak ada backend/database — aplikasi murni client-side

### Layout
- **Sidebar kiri** (fixed width 64/256px) + **Main content area** (flex-1, scrollable)
- Root layout di `src/app/layout.tsx` — membungkus semua halaman dengan Sidebar

### Struktur Halaman
```
src/
├── app/
│   ├── layout.tsx          # Root layout + Sidebar
│   ├── page.tsx            # Dashboard
│   ├── globals.css         # Global styles
│   ├── pendaftaran/page.tsx
│   ├── antrian/page.tsx
│   ├── rekam-medis/page.tsx
│   ├── riwayat/page.tsx
│   ├── reminder/page.tsx
│   ├── kasir/page.tsx
│   ├── apotek/page.tsx
│   └── laporan/page.tsx
├── components/
│   └── Sidebar.tsx
└── lib/
    ├── types.ts            # TypeScript interfaces
    └── store.ts            # localStorage CRUD + seed data
```

---

## 2. Data Model (Types)

Semua type didefinisikan di `src/lib/types.ts`.

### Patient
| Field | Tipe | Keterangan |
|-------|------|------------|
| `id` | `string` | UUID unik (random 8 char) |
| `rm` | `string` | Nomor Rekam Medis, format `RM-YYYY-NNN` |
| `name` | `string` | Nama lengkap pasien |
| `nik` | `string` | Nomor Induk Kependudukan (16 digit) |
| `dob` | `string` | Tanggal lahir (ISO date) |
| `gender` | `'L' \| 'P'` | Laki-laki / Perempuan |
| `phone` | `string` | Nomor HP |
| `address` | `string` | Alamat lengkap |
| `insurance` | `'BPJS' \| 'Asuransi' \| 'Umum'` | Penjamin biaya |
| `bloodType` | `'A' \| 'B' \| 'AB' \| 'O'` (optional) | Golongan darah |
| `allergy` | `string` (optional) | Riwayat alergi |
| `createdAt` | `string` | Waktu pendaftaran (ISO datetime) |

### Visit
| Field | Tipe | Keterangan |
|-------|------|------------|
| `id` | `string` | UUID unik |
| `patientId` | `string` | FK ke Patient |
| `date` | `string` | Tanggal kunjungan (ISO datetime) |
| `poli` | `string` | Poli tujuan |
| `doctorName` | `string` | Dokter pemeriksa |
| `subjective` | `string` | Keluhan utama (S) |
| `objective` | `string` | Tanda vital — JSON string `{td, nadi, suhu, rr, bb, tb}` |
| `assessment` | `string` | Diagnosis (A) |
| `icdCode` | `string` | Kode ICD-10 |
| `plan` | `string` | Rencana tindakan (P) |
| `prescriptions` | `Prescription[]` | Daftar resep obat |
| `totalBill` | `number` | Total tagihan (Rupiah) |
| `paymentStatus` | `'unpaid' \| 'paid'` | Status pembayaran |
| `paymentMethod` | `'Tunai' \| 'QRIS' \| 'BPJS' \| 'Asuransi'` (optional) | Metode bayar |
| `controlDate` | `string` (optional) | Jadwal kontrol berikutnya |
| `notes` | `string` (optional) | Catatan tambahan dokter |

### Prescription
| Field | Tipe | Keterangan |
|-------|------|------------|
| `drugId` | `string` | FK ke Drug |
| `drugName` | `string` | Nama obat |
| `quantity` | `number` | Jumlah yang diresepkan |
| `unit` | `string` | Satuan (tablet, kapsul, dll) |
| `dosage` | `string` | Aturan minum, contoh: "3x1 sesudah makan" |
| `pricePerUnit` | `number` | Harga jual per unit |

### Drug
| Field | Tipe | Keterangan |
|-------|------|------------|
| `id` | `string` | UUID unik |
| `name` | `string` | Nama obat |
| `category` | `string` | Kategori farmakologi |
| `stock` | `number` | Stok saat ini |
| `minStock` | `number` | Batas minimum stok (trigger kritis) |
| `unit` | `string` | Satuan (tablet, kapsul, botol) |
| `buyPrice` | `number` | Harga beli per unit |
| `sellPrice` | `number` | Harga jual per unit |
| `expiryDate` | `string` | Tanggal kadaluarsa (ISO date) |

### QueueItem
| Field | Tipe | Keterangan |
|-------|------|------------|
| `id` | `string` | UUID unik |
| `ticketNumber` | `string` | Nomor tiket, format `A-01`, `K-02`, dll |
| `patientId` | `string` | FK ke Patient |
| `patientName` | `string` | Nama pasien (denormalized) |
| `poli` | `string` | Poli tujuan |
| `status` | `'waiting' \| 'called' \| 'in-progress' \| 'done' \| 'skipped'` | Status antrian |
| `createdAt` | `string` | Waktu pembuatan tiket |

### Transaction
| Field | Tipe | Keterangan |
|-------|------|------------|
| `id` | `string` | Format `INV-{timestamp}` |
| `visitId` | `string` | FK ke Visit |
| `patientId` | `string` | FK ke Patient |
| `patientName` | `string` | Nama pasien (denormalized) |
| `date` | `string` | Tanggal transaksi |
| `items` | `{ label: string; amount: number }[]` | Rincian tagihan |
| `total` | `number` | Total pembayaran |
| `paymentMethod` | `'Tunai' \| 'QRIS' \| 'BPJS' \| 'Asuransi'` | Metode bayar |
| `paidAmount` | `number` | Jumlah yang dibayar |
| `change` | `number` | Kembalian (untuk tunai) |
| `createdAt` | `string` | Waktu transaksi |

### ANCRecord
| Field | Tipe | Keterangan |
|-------|------|------------|
| `patientId` | `string` | FK ke Patient (pasien hamil) |
| `lmpDate` | `string` | HPHT — Hari Pertama Haid Terakhir |
| `edd` | `string` | HPL — Hari Perkiraan Lahir (dihitung +280 hari dari HPHT) |
| `gravida` | `number` | Jumlah kehamilan (G) |
| `para` | `number` | Jumlah persalinan (P) |
| `abortus` | `number` | Jumlah keguguran (A) |
| `visits` | `ANCVisit[]` | Riwayat kunjungan ANC |

### ANCVisit
| Field | Tipe | Keterangan |
|-------|------|------------|
| `id` | `string` | UUID unik |
| `date` | `string` | Tanggal kunjungan |
| `ageWeeks` | `number` | Usia kehamilan (minggu) |
| `weight` | `number` | Berat badan (kg) |
| `bloodPressure` | `string` | Tekanan darah (contoh: "110/70") |
| `fetalHeartRate` | `number` | Detak Jantung Janin (DJJ, bpm) |
| `uterineFundus` | `number` | Tinggi Fundus Uterus (TFU, cm) |
| `presentation` | `string` | Presentasi janin (Kepala/Bokong/Lintang) |
| `notes` | `string` | Catatan kunjungan |

### PoliType
```typescript
type PoliType = 'Poli Umum' | 'Poli Gigi' | 'Poli KIA' | 'Farmasi';
```

---

## 3. Data Persistence (Store)

File: `src/lib/store.ts`

### Konsep
- Semua data disimpan di `localStorage` browser dengan prefix `klinik_`
- Saat pertama kali dimuat, store mengisi **seed data** (7 pasien, 4 kunjungan, 10 obat, 6 antrian, 1 data ANC)
- `initStore()` dipanggil di `useEffect` setiap halaman — tidak akan menimpa data yang sudah ada

### localStorage Keys
| Key | Tipe Data |
|-----|-----------|
| `klinik_patients` | `Patient[]` |
| `klinik_visits` | `Visit[]` |
| `klinik_drugs` | `Drug[]` |
| `klinik_queue` | `QueueItem[]` |
| `klinik_transactions` | `Transaction[]` |
| `klinik_anc` | `ANCRecord[]` |

### Store API

#### patientStore
| Method | Keterangan |
|--------|------------|
| `getAll()` | Ambil semua pasien |
| `get(id)` | Ambil satu pasien by ID |
| `add(patient)` | Tambah pasien baru |
| `update(patient)` | Update pasien by ID |
| `nextRM()` | Generate nomor RM berikutnya (`RM-YYYY-NNN`) |

#### visitStore
| Method | Keterangan |
|--------|------------|
| `getAll()` | Ambil semua kunjungan |
| `getByPatient(patientId)` | Ambil kunjungan per pasien (sorted terbaru dulu) |
| `getUnpaid()` | Ambil kunjungan yang belum bayar |
| `add(visit)` | Tambah kunjungan baru |
| `update(visit)` | Update kunjungan |

#### drugStore
| Method | Keterangan |
|--------|------------|
| `getAll()` | Ambil semua obat |
| `get(id)` | Ambil satu obat |
| `add(drug)` | Tambah obat baru |
| `update(drug)` | Update data obat |
| `deductStock(drugId, qty)` | Kurangi stok (otomatis Math.max(0, stock-qty)) |
| `getLowStock()` | Filter obat yang stock <= minStock |
| `getNearExpiry()` | Filter obat yang expired dalam 60 hari |

#### queueStore
| Method | Keterangan |
|--------|------------|
| `getAll()` | Ambil semua antrian |
| `getToday()` | Ambil antrian hari ini |
| `add(queueItem)` | Tambah antrian baru |
| `update(queueItem)` | Update status antrian |
| `nextTicket(prefix)` | Generate nomor tiket berikutnya per prefix per hari |

#### transactionStore
| Method | Keterangan |
|--------|------------|
| `getAll()` | Ambil semua transaksi |
| `getToday()` | Ambil transaksi hari ini |
| `add(transaction)` | Tambah transaksi baru |
| `totalToday()` | Hitung total pendapatan hari ini |

#### ancStore
| Method | Keterangan |
|--------|------------|
| `getAll()` | Ambil semua data ANC |
| `getByPatient(patientId)` | Ambil data ANC per pasien |
| `upsert(record)` | Insert atau update data ANC |

### Utility Functions
| Fungsi | Keterangan |
|--------|------------|
| `initStore()` | Inisialisasi semua key dengan seed data jika kosong |
| `resetStore()` | Hapus semua data lalu inisialisasi ulang |
| `idr(n)` | Format angka ke Rupiah (`Rp 50.000`) |
| `fmtDate(iso)` | Format ISO date ke string Indonesia panjang |
| `uid()` | Generate random 8-char ID |
| `calcEDD(lmpDate)` | Hitung HPL dari HPHT (+280 hari) |
| `gestationalAge(lmpDate)` | Hitung usia kehamilan dalam minggu+hari |

---

## 4. Modul Dashboard

**Route:** `/`
**File:** `src/app/page.tsx`

### Fungsi
Dashboard utama yang menampilkan ringkasan real-time dari seluruh klinik.

### Stat Cards (6 kartu, clickable ke modul terkait)
| Card | Data | Link |
|------|------|------|
| Total Pasien Terdaftar | `patientStore.getAll().length` | `/pendaftaran` |
| Kunjungan Hari Ini | `visitStore.getAll()` filtered by today | `/rekam-medis` |
| Pendapatan Hari Ini | `transactionStore.totalToday()` (format IDR) | `/laporan` |
| Antrian Menunggu | `queueStore.getToday()` filtered `waiting` | `/antrian` |
| Stok Obat Kritis | `drugStore.getLowStock().length` | `/apotek` |
| Tagihan Belum Lunas | `visitStore.getUnpaid().length` | `/kasir` |

### Panel Bawah (2 kolom)
1. **Kunjungan Terbaru** — 4 kunjungan terakhir (sorted by date desc), tampilkan nama pasien, diagnosis, poli, tanggal
2. **Antrian Hari Ini** — 5 antrian aktif (bukan `done`), tampilkan nomor tiket, nama pasien, poli, status badge

### Alert Banner
- Muncul di bagian bawah jika ada obat stok kritis (`lowStockCount > 0`)
- Klik menuju halaman Apotek

### Color Scheme
- Blue: Pasien | Teal: Kunjungan | Emerald: Pendapatan | Amber: Antrian | Rose: Stok Kritis | Purple: Tagihan

---

## 5. Modul Pendaftaran Pasien

**Route:** `/pendaftaran`
**File:** `src/app/pendaftaran/page.tsx`

### Fungsi
Mengelola data pasien baru dan mendaftarkan pasien ke antrian poli.

### Stat Bar (4 kartu)
- Total Pasien | BPJS | Asuransi | Umum

### Fitur Utama

#### 1. Tabel Daftar Pasien
- Kolom: RM, Nama (+tanggal lahir), NIK, Gender (badge L/P), No HP, Penjamin (badge), Aksi
- **Search**: filter by nama, NIK, atau nomor RM
- **Filter Penjamin**: dropdown Semua/BPJS/Asuransi/Umum
- Tombol "Daftarkan Antrian" di setiap baris — buka modal antrian untuk pasien tersebut

#### 2. Modal "Pasien Baru" (2 Step Wizard)

**Step 1 — Form Identitas:**
| Field | Required | Validasi |
|-------|----------|---------|
| Nama Lengkap | Ya | Wajib diisi |
| NIK | Ya | 16 digit, auto-filter non-numeric |
| Tanggal Lahir | Ya | Date picker |
| Jenis Kelamin | Ya | Dropdown L/P |
| No. HP | Ya | Wajib diisi |
| Alamat | Ya | Textarea |
| Penjamin | Tidak | Dropdown (default: Umum) |
| Golongan Darah | Tidak | Dropdown A/B/AB/O |
| Alergi | Tidak | Text input |

- Nomor RM otomatis di-generate: `patientStore.nextRM()` → format `RM-2026-001`, `RM-2026-002`, dst.

**Step 2 — Daftar ke Antrian:**
- Setelah pasien berhasil didaftarkan, lanjut ke step 2
- Pilih poli: **Poli Umum (A)**, **Poli Gigi (G)**, **Poli KIA (K)**, **Farmasi (F)**
- Klik "Ya, Daftarkan Antrian" → buat `QueueItem` dengan nomor tiket otomatis
- Tampilan tiket: nomor besar + nama + poli
- Bisa "Lewati" (tutup modal tanpa daftar antrian)

#### 3. Modal Antrian (Existing Patient)
- Dibuka dari tombol "Daftarkan Antrian" di tabel
- Pilih poli → buat nomor antrian → tampilkan tiket

### Flow
```
[Daftar Pasien Baru] → [Isi Form] → [Simpan ke Store] → [Pilih Poli] → [Buat Tiket Antrian]
                                              atau
[Daftar Antrian Pasien Lama] → [Pilih Poli] → [Buat Tiket Antrian]
```

---

## 6. Modul Antrian

**Route:** `/antrian`
**File:** `src/app/antrian/page.tsx`

### Fungsi
Manajemen antrian real-time dengan tampilan layar publik (live display) dan kontrol admin.

### Stat Bar (4 kartu)
| Stat | Keterangan |
|------|------------|
| Total | Semua antrian hari ini |
| Menunggu | Status `waiting` |
| Dalam Pemeriksaan | Status `in-progress` |
| Selesai | Status `done` |

### Live Display Panel
Panel tampilan besar dengan gradient gelap (untuk TV monitor klinik):
- **Nomor Dipanggil**: tiket yang status `in-progress` atau terakhir `called`, ditampilkan besar (font 72-96px)
- **Berikutnya**: 2 antrian berikutnya yang masih `waiting`
- **Fullscreen toggle**: klik icon untuk mode fullscreen (API Fullscreen browser)
- **TTS (Text-to-Speech)**: saat memanggil pasien, browser mengucapkan: *"Nomor antrian {nomor}, {nama}, silakan menuju {poli}"*

### Manajemen Antrian (Tabel)
- **Tab filter**: Semua, Poli Umum, Poli Gigi, Poli KIA, Farmasi — setiap tab menampilkan jumlah waiting
- **Tabel kolom**: Nomor (badge gelap), Pasien, Poli, Status (badge warna), Waktu, Aksi

### Status Flow & Aksi
```
waiting → [Panggil] → called → [Masuk Periksa] → in-progress → [Selesai] → done
                     → [Lewati] → skipped
```

| Status | Badge | Aksi Tersedia |
|--------|-------|---------------|
| `waiting` | Amber | Panggil |
| `called` | Blue | Masuk Periksa, Lewati |
| `in-progress` | Teal | Selesai |
| `done` | Slate | — |
| `skipped` | Rose | — |

### Tambah Antrian (Modal)
- Pilih pasien dari dropdown
- Pilih poli (grid 2x2 dengan prefix huruf)
- Preview nomor tiket yang akan diberikan
- Klik "Daftarkan" → simpan ke store

### Poli Prefix
| Poli | Prefix | Format Tiket |
|------|--------|-------------|
| Poli Umum | A | A-01, A-02, ... |
| Poli Gigi | G | G-01, G-02, ... |
| Poli KIA | K | K-01, K-02, ... |
| Farmasi | F | F-01, F-02, ... |

---

## 7. Modul Rekam Medis

**Route:** `/rekam-medis`
**File:** `src/app/rekam-medis/page.tsx`

### Fungsi
Modul inti klinik — pencatatan kunjungan pasien dengan alur kerja SOAP (Subjective, Objective, Assessment, Plan) dan e-resep digital.

### Layout
- **Left Panel (320px)**: Daftar pasien dengan search, menampilkan nama, RM, penjamin, badge alergi, jumlah kunjungan
- **Right Panel**: Detail pasien + timeline kunjungan + tombol "Tambah Kunjungan Baru"

### VisitCard (Kunjungan Tersimpan)
Setiap kunjungan ditampilkan sebagai kartu yang bisa di-expand:
- **Header**: Tanggal/waktu, poli badge (warna per poli), status bayar (Lunas/Belum Bayar)
- **Dokter**: Nama dokter pemeriksa
- **Diagnosis**: Assessment + kode ICD-10
- **Vital Signs** (ringkas): TD, Nadi, Suhu, RR, BB, TB — setiap item dengan icon berbeda
- **Expanded**: SOAP lengkap + daftar resep + total tagihan + jadwal kontrol + catatan

### Modal "Kunjungan Baru" (4 Step Wizard)

#### Step 1: Anamnesis (S)
| Field | Required | Keterangan |
|-------|----------|------------|
| Poli | Ya | Dropdown 4 poli |
| Dokter | Ya | Dropdown 4 dokter |
| Keluhan Utama (S) | Ya | Textarea |
| Riwayat Alergi | — | Read-only dari data pasien, ditampilkan dengan warning jika ada |

#### Step 2: Tanda Vital (O)
| Field | Required | Unit |
|-------|----------|------|
| Tekanan Darah (TD) | Ya | mmHg (contoh: 120/80) |
| Nadi | Ya | bpm |
| Suhu | Ya | °C |
| Laju Napas (RR) | Tidak | x/mnt |
| Berat Badan (BB) | Tidak | kg |
| Tinggi Badan (TB) | Tidak | cm |

#### Step 3: Diagnosa & Plan (A+P)
| Field | Required | Keterangan |
|-------|----------|------------|
| Kode ICD-10 | Ya | Searchable dropdown — 12 kode ICD tersedia |
| Rencana Tindakan (P) | Ya | Textarea |
| Jadwal Kontrol | Tidak | Date picker |
| Catatan Tambahan | Tidak | Textarea |

**ICD-10 Codes Tersedia:**
| Kode | Nama |
|------|------|
| J06.9 | ISPA |
| I10 | Hipertensi Primer |
| E11.9 | Diabetes Mellitus Tipe 2 |
| K21.0 | GERD |
| J45.9 | Asma |
| L30.9 | Dermatitis |
| N39.0 | ISK |
| Z34.2 | Kehamilan Normal |
| A09 | Diare |
| R51 | Sakit Kepala |
| M79.3 | Myalgia |
| J00 | Common Cold |

#### Step 4: E-Resep & Biaya
- **Search obat**: ketik nama → dropdown hasil pencarian dari `drugStore`
- Klik obat → ditambahkan ke daftar resep
- Setiap resep: jumlah (input) + aturan minum (input) + subtotal
- **Komponen Biaya:**
  - Jasa Konsultasi: **Rp 50.000** (fixed)
  - Tindakan Medis: input manual (opsional)
  - Total Obat: otomatis dari jumlah x harga jual
  - **Total Tagihan** = Konsultasi + Tindakan + Obat
- Status otomatis: `unpaid` — akan diteruskan ke modul Kasir

### Flow
```
Pilih Pasien → [+] Kunjungan Baru → Isi SOAP 4 Langkah → Simpan → Otomatis muncul di Kasir
```

---

## 8. Modul Riwayat Pasien

**Route:** `/riwayat`
**File:** `src/app/riwayat/page.tsx`

### Fungsi
Menampilkan riwayat medis lengkap per pasien — identitas + seluruh kunjungan dalam format timeline.

### Layout
- **Left Panel (320px)**: Daftar pasien dengan search (nama, RM, NIK, HP), menampilkan avatar inisial, gender badge, usia, penjamin badge, jumlah kunjungan
- **Right Panel**: Detail pasien + timeline kunjungan

### Kartu Identitas Pasien
- Avatar inisial (2 huruf pertama, background teal)
- Nama + RM
- Badge gender + penjamin + alergi (merah jika ada)
- Grid info: NIK, Tanggal Lahir & Usia, Golongan Darah, Alergi, No HP, Alamat

### Timeline Kunjungan
Setiap kunjungan ditampilkan sebagai kartu dengan **border-left warna per poli**:
| Poli | Warna Border |
|------|-------------|
| Poli Umum | Biru |
| Poli KIA | Pink |
| Poli Gigi | Ungu |
| Farmasi | Teal |

### VisitCard (Detail per Kunjungan)
Card yang bisa di-expand/collapse:
- **Collapsed**: Tanggal, poli badge, assessment + ICD code
- **Expanded**: Full SOAP + Resep + Catatan + Billing + Jadwal Kontrol

### Fitur
- **Print**: tombol "Cetak Riwayat" → `window.print()`, dengan print-only CSS
- **Default open**: kunjungan terbaru otomatis terbuka

---

## 9. Modul Reminder & ANC

**Route:** `/reminder`
**File:** `src/app/reminder/page.tsx`

### Fungsi
Dua sub-modul dalam satu halaman:
1. **Reminder Kontrol** — pengingat jadwal kontrol pasien
2. **Jadwal ANC (Antenatal Care)** — manajemen kehamilan & kunjungan ibu hamil

---

### Tab 1: Reminder Kontrol

#### Stat Bar
| Stat | Keterangan |
|------|------------|
| Total Reminder | Pasien dengan kontrol dalam 14 hari ke depan |
| Sudah Dihubungi | Ditandai kontak hari ini |
| Belum Dihubungi | Perlu tindak lanjut |

#### Daftar Reminder
- Mengambil semua kunjungan yang punya `controlDate`
- Filter: `controlDate` dalam 14 hari ke depan atau sudah lewat (overdue)
- Sort by: tanggal kontrol (terdekat dulu)

#### Per Entry:
- **Info**: Nama pasien, RM, badge hari (merah=terlambat, amber=hari ini/besok, hijau=masih lama), badge "sudah dihubungi"
- **Detail**: No HP, tanggal kontrol, poli, diagnosis
- **Aksi**:
  - **Kirim WhatsApp**: buka `api.whatsapp.com/send` dengan pesan template: *"Halo {nama}, kami dari Klinik Pratama Sehat Bersama mengingatkan jadwal kontrol Anda pada {tanggal}. Harap datang tepat waktu."*
  - **Tandai Dihubungi**: toggle status kontak

---

### Tab 2: Jadwal ANC

#### Layout
- **Left Column (288px)**: Daftar pasien hamil + tombol "Tambah Data ANC Baru"
- **Right Column**: Detail ANC pasien yang dipilih

#### Tambah Data ANC Baru (Modal)
| Field | Keterangan |
|-------|------------|
| Pasien Wanita | Dropdown (hanya pasien perempuan yang belum punya data ANC) |
| HPHT | Date picker — otomatis hitung HPL (+280 hari) |
| Gravida (G) | Number input |
| Para (P) | Number input |
| Abortus (A) | Number input |

#### Detail ANC (ANCDetail)

**Ringkasan:**
- Nama pasien, RM, trimester badge (T1/T2/T3)
- Status kehamilan: G{x}P{y}A{z}
- 3 info box: HPHT, HPL, Usia Kehamilan (minggu + hari)
- **Progress bar**: 0-40 minggu dengan marker trimester

**Jadwal Kunjungan ANC (Standar WHO):**
| Trimester | Usia | Kunjungan Minimal |
|-----------|------|-------------------|
| Trimester 1 | 6-13 minggu | 1 kunjungan |
| Trimester 2 | 14-27 minggu | 2 kunjungan |
| Trimester 3 | 28-40 minggu | 3 kunjungan |

Ditampilkan sebagai kartu dengan dot indicator (filled jika sudah tercapai).

**Tabel Riwayat Kunjungan ANC:**
| Kolom | Keterangan |
|-------|------------|
| Tanggal | Tanggal kunjungan |
| Usia (mgg) | Usia kehamilan saat kunjungan |
| BB (kg) | Berat badan |
| TD | Tekanan darah |
| DJJ | Detak Jantung Janin (bpm) |
| TFU | Tinggi Fundus Uterus (cm) |
| Presentasi | Presentasi janin |
| Catatan | Catatan dokter |

**Tambah Kunjungan ANC (Modal):**
| Field | Keterangan |
|-------|------------|
| Tanggal Kunjungan | Date picker |
| Berat Badan (kg) | Number input |
| Tekanan Darah (mmHg) | Text (contoh: 110/70) |
| DJJ (bpm) | Number input |
| TFU (cm) | Number input |
| Presentasi Janin | Dropdown: Kepala/Bokong/Lintang |
| Catatan | Textarea |

---

## 10. Modul Kasir & Billing

**Route:** `/kasir`
**File:** `src/app/kasir/page.tsx`

### Fungsi
Pemrosesan pembayaran tagihan kunjungan + riwayat transaksi.

### Tab: Belum Lunas

#### Daftar Tagihan
Setiap tagihan ditampilkan sebagai kartu:
- **Info Pasien**: Nama, RM, poli, dokter, tanggal kunjungan, badge "Belum Lunas"
- **Diagnosis**: Assessment + ICD code
- **Resep**: Badge per obat (nama × jumlah)
- **Total Tagihan**: ditampilkan besar
- **Rincian Obat**: jumlah obat dalam Rupiah
- Tombol "Proses Pembayaran"

#### Modal Pembayaran

**Rincian Tagihan (otomatis dihitung):**
| Komponen | Sumber |
|----------|--------|
| Jasa Konsultasi | Rp 50.000 (fixed) |
| Tindakan Medis | Selisih total - konsultasi - obat |
| Obat × [nama] × [jumlah] | Dari prescriptions |

**Metode Pembayaran:**
| Metode | Keterangan |
|--------|------------|
| Tunai | Input jumlah bayar → hitung kembalian |
| QRIS | Bayar = total, kembalian = 0 |
| BPJS | Bayar = total, kembalian = 0 |
| Asuransi | Bayar = total, kembalian = 0 |

**Proses Pembayaran:**
1. Validasi jumlah bayar (untuk tunai: minimal = total)
2. Hitung kembalian
3. Buat transaksi (`INV-{timestamp}`)
4. **Kurangi stok obat** via `drugStore.deductStock()`
5. Update visit → `paymentStatus: 'paid'`, `paymentMethod`
6. Simpan transaksi
7. Tampilkan modal sukses + invoice

#### Invoice / Struk
Format struk kasir (print-only):
```
================================
  Klinik Pratama Sehat Bersama
  Jl. Kesehatan No. 10, Bandung
  Telp: (022) 123-4567
--------------------------------
No. Invoice : INV-xxx
Tanggal     : ...
Pasien      : ...
No. RM      : ...
Poli        : ...
--------------------------------
Jasa Konsultasi    Rp 50.000
Obat x 10 tablet   Rp 15.000
--------------------------------
TOTAL              Rp 65.000
Metode Bayar       Tunai
Dibayar            Rp 70.000
Kembalian          Rp  5.000
--------------------------------
Terima kasih atas kunjungan Anda.
Semoga lekas sembuh!
================================
```

- Cetak: `window.print()` dengan print CSS khusus (80mm width, font monospace)

### Tab: Riwayat Transaksi

#### Stat Cards
- Transaksi Hari Ini (jumlah)
- Pendapatan Hari Ini (total Rupiah)

#### Tabel Riwayat
| Kolom | Keterangan |
|-------|------------|
| No | Nomor urut |
| No. Invoice | `INV-{timestamp}` |
| Tanggal | Waktu transaksi |
| Pasien | Nama pasien |
| Total | Total Rupiah (teal) |
| Metode | Badge + icon per metode |
| Status | Badge "Lunas" |

- Highlight baris transaksi hari ini dengan background teal tipis
- Sort by: tanggal terbaru dulu

---

## 11. Modul Apotek & Obat

**Route:** `/apotek`
**File:** `src/app/apotek/page.tsx`

### Fungsi
Manajemen inventaris obat klinik — stok, harga, kadaluarsa.

### Alert Banners
1. **Stok Kritis** (merah): jumlah obat yang `stock <= minStock`
2. **Mendekati Expired** (amber): jumlah obat yang expired dalam 60 hari

### Stat Cards (4)
| Stat | Keterangan |
|------|------------|
| Total Item Obat | Jumlah semua obat |
| Total Nilai Stok | `sum(stock × buyPrice)` format IDR |
| Stok Kritis | Jumlah obat di bawah minimum |
| Near Expiry | Jumat obat < 60 hari expired |

### Filter & Search
- **Tab filter**: Semua, Stok Kritis (dengan badge count), Mendekati Expired (dengan badge count)
- **Search**: filter by nama obat atau kategori

### Tabel Obat
| Kolom | Keterangan |
|-------|------------|
| Nama Obat | + icon warning jika kritis/expired |
| Kategori | Badge |
| Stok | Progress bar + angka (hijau=aman, amber=waspada, merah=kritis) |
| Min Stok | Angka |
| Satuan | tablet/kapsul/botol |
| Harga Beli | Format IDR |
| Harga Jual | Format IDR (teal) |
| Expired | Badge tanggal + countdown (merah<30hari, amber<60hari) |
| Aksi | Tombol "Restock" |

### Fitur Restock (Inline)
- Klik "Restock" → muncul input inline (number + confirm/cancel)
- Masukkan jumlah → konfirmasi → stok bertambah
- Support keyboard: Enter=confirm, Escape=cancel

### Tambah Obat Baru (Modal)
| Field | Required | Keterangan |
|-------|----------|------------|
| Nama Obat | Ya | Text input |
| Kategori | Ya | Dropdown (11 kategori) |
| Stok Awal | Ya | Number |
| Min Stok | Ya | Number |
| Satuan | Ya | Text (default: tablet) |
| Harga Beli (Rp) | Ya | Number |
| Harga Jual (Rp) | Ya | Number |
| Tanggal Expired | Ya | Date picker |

**Kategori Tersedia:**
Analgesik/Antipiretik, Antibiotik, Antasida, Antihistamin, Antihipertensi, Antidiabetik, Vitamin & Suplemen, Kortikosteroid, Bronkodilator, Antasida/PPI, Lainnya

### Stock Bar Visual
- Progress bar berwarna:
  - **Hijau**: stok > 1.5x minStock
  - **Amber**: stok 1x-1.5x minStock
  - **Merah**: stok <= minStock
- Lebar bar = `stock / (minStock × 3)` (max 100%)

---

## 12. Modul Laporan & Analitik

**Route:** `/laporan`
**File:** `src/app/laporan/page.tsx`

### Fungsi
Dashboard analitik klinik — keuangan, kunjungan, morbiditas, poli, dan obat terlaris.

### Period Selector
| Periode | Keterangan |
|---------|------------|
| Hari Ini | Mulai jam 00:00 hari ini |
| Minggu Ini | Senin - Minggu minggu berjalan |
| Bulan Ini | 1 - akhir bulan berjalan |
| Semua | Seluruh data |

### Section 1: Ringkasan Keuangan (4 Stat Cards)
| Card | Keterangan |
|------|------------|
| Total Pendapatan | `sum(totalBill)` dari kunjungan lunas |
| Rata-rata per Kunjungan | `totalRevenue / paidVisits.length` |
| Total Kunjungan | Jumlah kunjungan (lunas + belum) |
| Pasien Baru | Pasien yang `createdAt` dalam periode |

### Section 2: Grafik Kunjungan (Bar Chart)
- **Recharts BarChart** — 7 hari terakhir
- X-axis: tanggal (format "01 Jan")
- Y-axis: jumlah kunjungan
- Custom tooltip: nama tanggal + jumlah kunjungan
- Bar warna teal dengan border radius atas

### Section 3: Top Morbiditas (10 Besar Penyakit)
Tabel ranking berdasarkan jumlah kunjungan per diagnosis:
| Kolom | Keterangan |
|-------|------------|
| # | Rank (1=teal solid, 2-3=teal light, lain=slate) |
| Diagnosa | Nama diagnosis |
| ICD-10 | Kode ICD badge |
| Jumlah | Jumlah kasus |
| Visual | Progress bar relatif |

### Section 4: Pendapatan per Poli
- Bar horizontal per poli
- Total Rupiah + persentase dari poli terbesar
- Progress bar visual

### Section 5: Obat Terlaris (Top 5)
- Ranking berdasarkan total jumlah diresepkan
- Nomor urut badge + nama obat + jumlah unit

### Print / Export
- Tombol "Cetak / Export" → `window.print()`
- Print CSS: hide selector, background putih, font 12px
- Footer cetak: waktu cetak + disclaimer

---

## 13. Sidebar & Navigasi

**File:** `src/components/Sidebar.tsx`

### Struktur Navigasi
```
🏠 Dashboard

── MODUL INTI ──
📝 Pendaftaran
📋 Rekam Medis
👤 Riwayat Pasien

── OPERASIONAL ──
🔢 Antrian
💊 Apotek & Obat
💳 Kasir & Billing

── SERVICE ──
🔔 Reminder & ANC

── PELAPORAN ──
📊 Laporan & Analitik
```

### Fitur Sidebar
- **Logo**: Icon stethoscope + "SIM-Klinik" + "Pro — Demo v1.0"
- **Active state**: Background teal transparan + border teal + icon teal + teks teal + chevron kanan
- **Hover state**: Background slate-800 + teks lebih terang
- **Section headers**: Font 10px uppercase tracking-widest
- **Footer**: "© 2026 SIM-Klinik Pro"
- **Width**: 256px (w-64), fixed, min-h-screen
- **Background**: slate-900 (gelap)

---

## 14. Utility Functions

### Format
| Fungsi | Input | Output | Contoh |
|--------|-------|--------|--------|
| `idr(n)` | number | string | `idr(50000)` → `"Rp 50.000"` |
| `fmtDate(iso)` | ISO date string | string | `fmtDate("2026-09-15")` → `"15 September 2026"` |

### ID Generation
| Fungsi | Output | Contoh |
|--------|--------|--------|
| `uid()` | 8-char random alphanumeric | `"a3xk9m2b"` |
| `patientStore.nextRM()` | `RM-YYYY-NNN` | `"RM-2026-008"` |
| `queueStore.nextTicket(prefix)` | `{P}-NN` | `"A-07"` |

### Date/Time
| Fungsi | Keterangan |
|--------|------------|
| `calcEDD(lmpDate)` | Hitung HPL = HPHT + 280 hari |
| `gestationalAge(lmpDate)` | Return `{ weeks, days }` dari HPHT |

### Display Helpers (per halaman)
| Fungsi | Keterangan |
|--------|------------|
| `calcAge(dob)` | Hitung usia: `< 2 tahun → "X bln"`, else `"X thn"` |
| `fmtDateTime(iso)` | Format: "15 September 2026 09.30" |
| `fmtDateShort(iso)` | Format: "15 Sep 2026" |
| `fmtTime(iso)` | Format: "09.30" |
| `parseVitals(objective)` | Parse JSON string tanda vital ke object |
| `formatPhoneWA(phone)` | Konversi 08xxx → 628xxx (format WhatsApp) |
| `diffDays(isoDate)` | Hitung selisih hari dari hari ini (negatif = terlambat) |
| `daysUntilExpiry(date)` | Hitung hari sampai kadaluarsa |
| `buildBillLines(visit)` | Bangun rincian tagihan dari kunjungan |

### Seed Data
Aplikasi dilengkapi data demo:
- **7 pasien** (3 L, 4 P; mix BPJS/Asuransi/Umum; 2 dengan alergi)
- **4 kunjungan** (ISPA, Hipertensi, DM Type 2, Kehamilan Normal)
- **10 obat** (dari Paracetamol sampai Dexamethasone)
- **6 antrian** (3 done/in-progress, 3 waiting)
- **1 data ANC** (Ny. Sari Indah, 28 minggu, 4 kunjungan)

---

*Terakhir diperbarui: 21 September 2026*
