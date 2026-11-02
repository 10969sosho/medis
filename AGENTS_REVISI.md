# Tugas Implementasi Lengkap Revisi Form & Navigasi Klinik

OpenCode worker sebelumnya telah berhasil:
- Mengubah PoliType di types.ts, store.ts, antrian, pendaftaran, riwayat, rekam-medis menjadi 4: 'Ibu', 'Anak', 'Mom and Baby Spa', 'Umum'.
- Mengubah label menu di Sidebar: 'Master Pasien'.
- Build Next.js sudah lulus tanpa error TypeScript.

SEKARANG, implementasikan fitur inti yang diminta user:

### 1. Navigasi Sidebar - Submenu Rekam Medis:
Di `src/components/Sidebar.tsx`:
Rekam Medis memiliki sub-menu yang interaktif dan jelas:
- Rekam Medis Ibu (`/rekam-medis?poli=ibu`)
- Rekam Medis Anak (`/rekam-medis?poli=anak`)
- Mom and Baby Spa (`/rekam-medis?poli=spa`)
- Rekam Medis Umum (`/rekam-medis?poli=umum`)

### 2. Flow Panggil Antrian -> Isi Rekam Medis:
Di `src/app/antrian/page.tsx`:
- Saat status antrian adalah 'called' (Dipanggil), sediakan tombol tindakan:
  **"Periksa / Isi Rekam Medis"** -> tombol ini link/redirect ke:
  `/rekam-medis?patientId=${item.patientId}&poli=${encodeURIComponent(item.poli)}` dan update antrian menjadi 'in-progress'.
- Di halaman `/rekam-medis/page.tsx`:
  - Baca `useSearchParams()` (bungkus Suspense jika diperlukan agar lolos Next.js prerender).
  - Jika ada `patientId`, otomatis set `selectedPatient` dan buka modal `setShowModal(true)`.
  - Jika ada parameter `poli`, sinkronkan kategori rekam medis aktif sesuai poli antrian tersebut ('ibu', 'anak', 'spa', 'umum').

### 3. Selesai Simpan Rekam Medis -> Kasir & Billing:
Di modal Rekam Medis:
- Setelah simpan data rekam medis berhasil (tombol "Simpan Rekam Medis"), berikan toast / modal konfirmasi sukses dengan tombol aksi:
  **"Lanjut ke Kasir & Billing"** -> tombol link/redirect ke `/kasir?patientId=${patient.id}`.

### 4. Implementasi Form Detail Spesifik per Poli di Rekam Medis:
Di modal/komponen Rekam Medis (`NewVisitModal` atau modular component), buat tampilan form yang dinamis dan lengkap sesuai poli & pilihan layanan:

#### A. REKAM MEDIS IBU
Pilihan Layanan (Dropdown/Segmented Control):
1. **ANC / Kehamilan**
   - Data Kunjungan: Nama pasien, No. rekam medis, Tanggal kunjungan, Dokter / Bidan
   - Data Kehamilan: Kehamilan ke-, HPHT, HPL, Usia kehamilan, Jumlah anak, Riwayat kehamilan
   - Pemeriksaan: Berat badan, Tinggi badan, Tekanan darah, Nadi, Suhu, LILA, TFU, DJJ
   - Pemeriksaan Klinis: Keluhan utama, Hasil pemeriksaan, Diagnosa, Tindakan, Rencana, Edukasi, Obat / vitamin, Rencana kontrol, Catatan
2. **INC / Persalinan**
   - Data Persalinan: Tanggal persalinan, Jam persalinan, Usia kehamilan, Jenis persalinan, Penolong persalinan
   - Kondisi Ibu: Tekanan darah, Nadi, Perdarahan, Kondisi ibu
   - Kondisi Bayi: Jenis kelamin, Berat lahir, Panjang badan, Lingkar kepala, APGAR, Kondisi bayi
   - Tindakan: Tindakan persalinan, Komplikasi, Catatan
3. **Nifas**
   - Pemeriksaan: Hari / minggu nifas, Tanggal pemeriksaan, Tekanan darah, Berat badan, Suhu
   - Kondisi Ibu: Kondisi umum, Kondisi luka / jahitan, Perdarahan / lochea, Kondisi payudara, Kondisi ASI, Keluhan
   - Hasil & Tindakan: Hasil pemeriksaan, Edukasi, Tindakan, Rencana kontrol, Catatan
4. **KB**
   - Pilihan jenis KB: Suntik 1 Bulan | Suntik 2 Bulan | Suntik 3 Bulan | IUD | Implant | Pil
   - Data Umum KB: Tanggal pelayanan, Jenis KB, Keluhan, Hasil pemeriksaan, Tindakan, Efek samping, Tanggal kontrol berikutnya, Catatan
   - Dinamis sesuai jenis KB:
     * Jika IUD: Jenis IUD, Tanggal pemasangan, Kondisi, Benang IUD, Tanggal kontrol
     * Jika Implant: Jenis implant, Jumlah batang, Lokasi pemasangan, Tanggal pemasangan, Tanggal kontrol / pelepasan
     * Jika Suntik: Jenis suntik, Tanggal pemberian, Tanggal suntik berikutnya
     * Jika Pil: Jenis pil, Jumlah / periode pemberian, Tanggal kontrol berikutnya
5. **Kespro**
   - Pilihan: Pap Smear | Spa V
   - Jika Pap Smear: Tanggal pemeriksaan, Keluhan, Hasil pemeriksaan, Sampel, Hasil / kesimpulan, Tindakan, Rekomendasi, Rencana kontrol, Catatan
   - Jika Spa V: Tanggal, Keluhan, Pemeriksaan, Tindakan, Catatan, Rencana kontrol

#### B. REKAM MEDIS ANAK
Pilihan Layanan:
1. **KN / Kontrol Baby**
   - Data Anak: Nama pasien, No. rekam medis, Usia, Tanggal kunjungan
   - Pemeriksaan: Berat badan, Panjang / tinggi badan, Lingkar kepala, Suhu, Kondisi umum
   - Pemeriksaan Lanjutan: Keluhan, ASI, Tumbuh kembang, Hasil pemeriksaan, Diagnosa, Tindakan, Rencana, Edukasi, Rencana kontrol, Catatan
2. **MTBS**
   - Keluhan: Keluhan utama, Durasi keluhan
   - Pemeriksaan: Suhu, Berat badan, Tinggi / panjang badan, Respirasi, Nadi
   - Penilaian MTBS: Batuk / sulit bernapas, Diare, Demam, Masalah telinga, Status gizi, Status imunisasi
   - Hasil: Klasifikasi, Diagnosa, Tindakan, Obat, Edukasi, Rencana kontrol, Catatan
3. **Imunisasi**
   - Data Imunisasi: Tanggal imunisasi, Jenis imunisasi, Nama vaksin, Dosis, Batch / nomor batch, Cara pemberian, Lokasi pemberian
   - Kondisi: Kondisi sebelum imunisasi, Reaksi setelah imunisasi
   - Rencana: Jadwal imunisasi berikutnya, Catatan

#### C. MOM & BABY SPA
Pilihan Layanan:
1. **Pijat Bayi**: Tanggal, Usia bayi, Berat badan, Kondisi sebelum treatment, Jenis treatment, Durasi, Kondisi setelah treatment, Catatan terapis, Jadwal berikutnya
2. **Pijat Anak**: Tanggal, Usia anak, Berat badan, Kondisi sebelum treatment, Jenis treatment, Durasi, Kondisi setelah treatment, Catatan terapis, Jadwal berikutnya
3. **Pijat Bumil**: Tanggal, Usia kehamilan, Keluhan, Kondisi kehamilan, Jenis treatment, Durasi, Kondisi setelah treatment, Catatan, Jadwal berikutnya
4. **Senam / Yoga Hamil**: Tanggal, Usia kehamilan, Jenis kelas, Instruktur, Durasi, Kondisi sebelum, Kondisi setelah, Catatan, Jadwal berikutnya

#### D. REKAM MEDIS UMUM
Form:
- Keluhan: Keluhan utama, Riwayat penyakit, Alergi
- Pemeriksaan: Tekanan darah, Nadi, Suhu, Respirasi, Berat badan, Tinggi badan
- Pemeriksaan Dokter: Pemeriksaan fisik, Diagnosa, Tindakan
- Pengobatan: Obat, Dosis / aturan penggunaan
- Rencana: Edukasi, Rencana kontrol, Catatan

Semua form memiliki tombol "Simpan Rekam Medis" yang menyimpan data ke Visit / visitStore dengan tepat, dan setelah disimpan bisa lanjut ke Kasir & Billing.

Pastikan jalankan 'npm run build' di akhir dan pastikan lolos tanpa error.
