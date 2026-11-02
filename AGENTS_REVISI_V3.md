# Instruksi Refactor Form Rekam Medis & Sempurnakan Sistem

Tujuan:
1. Menyelesaikan seluruh form spesifik per Poli & Layanan (Poli Ibu, Poli Anak, Mom & Baby Spa, Umum) agar BUKAN hanya wizard SOAP generik 4 langkah. Form harus memiliki field-field asli sesuai spesifikasi klinis.
2. Memperbaiki Sidebar Sub-Menu agar selalu tampil dan navigable.
3. Memastikan filter pasien di halaman Rekam Medis tidak membuat list kosong (jika filter aktif, pasien tetap bisa dicari/ditampilkan).
4. Memastikan trailing slash dan .htaccess deploy berfungsi sempurna di server LiteSpeed.

---

### DETAIL FORM REKAM MEDIS PER POLI & LAYANAN

Simpan seluruh data detail ini ke `objective` (dalam bentuk JSON string) atau ke record Visit.
Di modal Rekam Medis (`NewVisitModal`), ketika user memilih poli / layanan:

#### 1. POLI IBU
Pilihan Layanan:
- **ANC / Kehamilan**
  * Data Kunjungan: Nama pasien, No RM, Tanggal kunjungan, Dokter / Bidan
  * Data Kehamilan: Kehamilan ke- (G...P...A...), HPHT, HPL, Usia kehamilan (minggu), Jumlah anak, Riwayat kehamilan
  * Pemeriksaan Fisik: Berat badan (kg), Tinggi badan (cm), Tekanan darah (mmHg), Nadi (/menit), Suhu (°C), LILA (cm), TFU (cm), DJJ (/menit)
  * Pemeriksaan Klinis & Rencana: Keluhan utama, Hasil pemeriksaan, Diagnosa, Tindakan, Rencana, Edukasi, Obat / vitamin, Rencana kontrol, Catatan
- **INC / Persalinan**
  * Data Persalinan: Tanggal persalinan, Jam persalinan, Usia kehamilan, Jenis persalinan (Spontan/SC/Vakum), Penolong persalinan (Dokter/Bidan)
  * Kondisi Ibu: Tekanan darah, Nadi, Perdarahan (cc), Kondisi ibu
  * Kondisi Bayi: Jenis kelamin (L/P), Berat lahir (gram), Panjang badan (cm), Lingkar kepala (cm), Skor APGAR, Kondisi bayi
  * Tindakan: Tindakan persalinan, Komplikasi, Catatan
- **Nifas**
  * Pemeriksaan: Hari / minggu nifas, Tanggal pemeriksaan, Tekanan darah, Berat badan, Suhu
  * Kondisi Ibu: Kondisi umum, Kondisi luka / jahitan, Perdarahan / lochea, Kondisi payudara, Kondisi ASI, Keluhan
  * Hasil & Tindakan: Hasil pemeriksaan, Edukasi, Tindakan, Rencana kontrol, Catatan
- **KB**
  * Pilihan jenis KB: Suntik 1 Bulan | Suntik 2 Bulan | Suntik 3 Bulan | IUD | Implant | Pil
  * Data Umum: Tanggal pelayanan, Jenis KB, Keluhan, Hasil pemeriksaan, Tindakan, Efek samping, Tanggal kontrol berikutnya, Catatan
  * Field Dinamis:
    - Jika IUD: Jenis IUD, Tanggal pemasangan, Kondisi, Benang IUD, Tanggal kontrol
    - Jika Implant: Jenis implant, Jumlah batang, Lokasi pemasangan, Tanggal pemasangan, Tanggal kontrol / pelepasan
    - Jika Suntik: Jenis suntik, Tanggal pemberian, Tanggal suntik berikutnya
    - Jika Pil: Jenis pil, Jumlah / periode pemberian, Tanggal kontrol berikutnya
- **Kespro**
  * Pilihan: Pap Smear | Spa V
  * Pap Smear: Tanggal pemeriksaan, Keluhan, Hasil pemeriksaan, Sampel, Hasil / kesimpulan, Tindakan, Rekomendasi, Rencana kontrol, Catatan
  * Spa V: Tanggal, Keluhan, Pemeriksaan, Tindakan, Catatan, Rencana kontrol

#### 2. POLI ANAK
Pilihan Layanan:
- **KN / Kontrol Baby**
  * Data Anak: Nama pasien, No RM, Usia, Tanggal kunjungan
  * Pemeriksaan: Berat badan (kg), Panjang / tinggi badan (cm), Lingkar kepala (cm), Suhu (°C), Kondisi umum
  * Pemeriksaan Lanjutan: Keluhan, ASI (Eksklusif/Sufor/Campur), Tumbuh kembang, Hasil pemeriksaan, Diagnosa, Tindakan, Rencana, Edukasi, Rencana kontrol, Catatan
- **MTBS**
  * Keluhan: Keluhan utama, Durasi keluhan
  * Pemeriksaan Tanda Vital: Suhu (°C), Berat badan (kg), Tinggi / panjang badan (cm), Respirasi (/menit), Nadi (/menit)
  * Penilaian MTBS: Batuk / sulit bernapas, Diare, Demam, Masalah telinga, Status gizi, Status imunisasi
  * Hasil & Terapi: Klasifikasi, Diagnosa, Tindakan, Obat, Edukasi, Rencana kontrol, Catatan
- **Imunisasi**
  * Data Imunisasi: Tanggal imunisasi, Jenis imunisasi, Nama vaksin, Dosis, Batch / nomor batch, Cara pemberian (IM/SC/Oral/ID), Lokasi pemberian (Paha kiri/kanan/Lengan)
  * Kondisi: Kondisi sebelum imunisasi, Reaksi setelah imunisasi (KIPI)
  * Rencana: Jadwal imunisasi berikutnya, Catatan

#### 3. POLI MOM & BABY SPA
Pilihan Layanan:
- **Pijat Bayi**: Tanggal, Usia bayi, Berat badan, Kondisi sebelum treatment, Jenis treatment, Durasi (menit), Kondisi setelah treatment, Catatan terapis, Jadwal berikutnya
- **Pijat Anak**: Tanggal, Usia anak, Berat badan, Kondisi sebelum treatment, Jenis treatment, Durasi (menit), Kondisi setelah treatment, Catatan terapis, Jadwal berikutnya
- **Pijat Bumil**: Tanggal, Usia kehamilan, Keluhan, Kondisi kehamilan, Jenis treatment, Durasi (menit), Kondisi setelah treatment, Catatan, Jadwal berikutnya
- **Senam / Yoga Hamil**: Tanggal, Usia kehamilan, Jenis kelas, Instruktur, Durasi (menit), Kondisi sebelum, Kondisi setelah, Catatan, Jadwal berikutnya

#### 4. POLI UMUM
Form Pemeriksaan Lengkap:
- Keluhan: Keluhan utama, Riwayat penyakit sekarang & dahulu, Riwayat Alergi
- Pemeriksaan Tanda Vital & Fisik: Tekanan darah, Nadi, Suhu, Respirasi, Berat badan, Tinggi badan, Pemeriksaan fisik
- Diagnosa & Tindakan: Diagnosa (ICD-10 / klinis), Tindakan
- Pengobatan: Obat, Dosis / aturan penggunaan, E-resep
- Rencana: Edukasi, Rencana kontrol, Catatan

---

### SIMPAN & FLOW KE KASIR
- Semua form di atas memiliki tombol `Simpan Rekam Medis`.
- Setelah data disimpan ke store (`visitStore`), tampilkan toast sukses dengan tombol aksi:
  `Lanjut ke Kasir & Billing` -> yang mengarahkan ke `/kasir/?patientId=${patient.id}`.

### SIDEBAR SUB-MENU
- Di `Sidebar.tsx`:
  Sub-menu Rekam Medis (Ibu, Anak, Mom and Baby Spa, Umum) harus selalu tampil / bisa diklik dari mana saja:
  - Ibu -> `/rekam-medis/?poli=ibu`
  - Anak -> `/rekam-medis/?poli=anak`
  - Mom and Baby Spa -> `/rekam-medis/?poli=spa`
  - Umum -> `/rekam-medis/?poli=umum`
  Ketika dibuka, query param `?poli=...` langsung mengaktifkan tab filter yang sesuai dan saat menambah kunjungan, otomatis membuka form poli & layanan tersebut!

### PERBAIKAN FILTER PASIEN
- Di `src/app/rekam-medis/page.tsx`:
  Saat tab kategori tertentu dipilih (misal 'ibu' atau 'anak'), jika pasien belum punya kunjungan, jangan disaring sampai 0 pasien!
  Filter gender/usia sebaiknya tidak terlalu restriktif atau sediakan tombol toggle "Tampilkan Semua Pasien" agar daftar pasien selalu mudah ditemukan.
