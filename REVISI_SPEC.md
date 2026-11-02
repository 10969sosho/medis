# Rencana Revisi Sistem Klinik

## 1. Perubahan Poli (4 Poli)
- Poli yang tersedia di seluruh sistem:
  1. Ibu
  2. Anak
  3. Mom and Baby Spa
  4. Umum
- Hapus/ganti poli lama yang tidak sesuai agar konsisten di antrean, pendaftaran/master pasien, rekam medis, dan billing.

## 2. Navigasi & Alur Program
1. **Master Pasien** (sebelumnya pendaftaran pasien):
   - Ubah label/menu Pendaftaran menjadi Master Pasien.
   - Manajemen data pasien (tambah, edit, list pasien).
2. **Daftarkan Antrean**:
   - Dari master pasien atau menu antrean, pasien didaftarkan ke poli yang dituju (Ibu / Anak / Mom and Baby Spa / Umum).
3. **Panggil Antrean & Masuk Rekam Medis**:
   - Ketika antrean dipanggil, status antrean berubah & ada tombol aksi untuk langsung lanjutkan ke "Isi Rekam Medis" sesuai poli antrean pasien tersebut.
4. **Kasir & Billing**:
   - Setelah rekam medis selesai disimpan, pasien otomatis/dapat dialihkan ke alur Billing / Kasir untuk pembayaran layanan & obat.

## 3. Submenu & Struktur Rekam Medis (4 Poli)
Jadikan sub menu dari Rekam Medis di sidebar/navigasi atau tab:
- **Rekam Medis Ibu**
- **Rekam Medis Anak**
- **Mom and Baby Spa**
- **Rekam Medis Umum**

### A. Rekam Medis Ibu
Pilihan Layanan:
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
   - Pilihan jenis KB: Suntik 1 Bulan, Suntik 2 Bulan, Suntik 3 Bulan, IUD, Implant, Pil
   - Data Umum: Tanggal pelayanan, Jenis KB, Keluhan, Hasil pemeriksaan, Tindakan, Efek samping, Tanggal kontrol berikutnya, Catatan
   - Field kondisional:
     * Jika IUD: Jenis IUD, Tanggal pemasangan, Kondisi, Benang IUD, Tanggal kontrol
     * Jika Implant: Jenis implant, Jumlah batang, Lokasi pemasangan, Tanggal pemasangan, Tanggal kontrol / pelepasan
     * Jika Suntik: Jenis suntik, Tanggal pemberian, Tanggal suntik berikutnya
     * Jika Pil: Jenis pil, Jumlah / periode pemberian, Tanggal kontrol berikutnya
5. **Kespro**
   - Pilihan: Pap Smear, Spa V
   - Jika Pap Smear: Tanggal pemeriksaan, Keluhan, Hasil pemeriksaan, Sampel, Hasil / kesimpulan, Tindakan, Rekomendasi, Rencana kontrol, Catatan
   - Jika Spa V: Tanggal, Keluhan, Pemeriksaan, Tindakan, Catatan, Rencana kontrol

### B. Rekam Medis Anak
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

### C. Mom & Baby Spa
Pilihan Layanan:
1. **Pijat Bayi**: Tanggal, Usia bayi, Berat badan, Kondisi sebelum treatment, Jenis treatment, Durasi, Kondisi setelah treatment, Catatan terapis, Jadwal berikutnya
2. **Pijat Anak**: Tanggal, Usia anak, Berat badan, Kondisi sebelum treatment, Jenis treatment, Durasi, Kondisi setelah treatment, Catatan terapis, Jadwal berikutnya
3. **Pijat Bumil**: Tanggal, Usia kehamilan, Keluhan, Kondisi kehamilan, Jenis treatment, Durasi, Kondisi setelah treatment, Catatan, Jadwal berikutnya
4. **Senam / Yoga Hamil**: Tanggal, Usia kehamilan, Jenis kelas, Instruktur, Durasi, Kondisi sebelum, Kondisi setelah, Catatan, Jadwal berikutnya

### D. Rekam Medis Umum
Form:
- Keluhan: Keluhan utama, Riwayat penyakit, Alergi
- Pemeriksaan: Tekanan darah, Nadi, Suhu, Respirasi, Berat badan, Tinggi badan
- Pemeriksaan Dokter: Pemeriksaan fisik, Diagnosa, Tindakan
- Pengobatan: Obat, Dosis / aturan penggunaan
- Rencana: Edukasi, Rencana kontrol, Catatan
