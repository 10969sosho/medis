# RENCANA PENYELESAIAN 6 MASALAH TESTING

## 1. Routing & Trailing Slash LiteSpeed (Poin 5)
- Di `next.config.ts`: Tambahkan `trailingSlash: true`.
  Dengan ini, `next build` static export menghasilkan:
  `out/rekam-medis/index.html`, `out/antrian/index.html`, `out/master-pasien/index.html`, `out/kasir/index.html`, dll.
  LiteSpeed server ketika menerima request `/rekam-medis/` akan langsung melayani `index.html` dan tidak lagi menampilkan folder directory listing!
- Buat file `public/.htaccess` dengan konfigurasi:
  ```apache
  Options -Indexes
  DirectoryIndex index.html

  <IfModule mod_rewrite.c>
    RewriteEngine On
    RewriteBase /

    # If requested directory exists and has index.html, serve it
    RewriteCond %{REQUEST_FILENAME} -d
    RewriteCond %{REQUEST_FILENAME}/index.html -f
    RewriteRule ^(.*)$ $1/index.html [L]

    # If requested file does not exist, check .html
    RewriteCond %{REQUEST_FILENAME} !-f
    RewriteCond %{REQUEST_FILENAME} !-d
    RewriteCond %{DOCUMENT_ROOT}/$1.html -f
    RewriteRule ^(.*)$ $1.html [L]

    # SPA Fallback
    RewriteCond %{REQUEST_FILENAME} !-f
    RewriteCond %{REQUEST_FILENAME} !-d
    RewriteRule ^ index.html [L]
  </IfModule>
  ```
- Di `src/app/antrian/page.tsx`:
  Tombol "Periksa / Isi RM":
  Gunakan URL `/rekam-medis?patientId=${patientId}&poli=${poliEncoded}` dan gunakan client router atau `window.location.href = '/rekam-medis/?patientId=' + patientId + '&poli=' + poliEncoded`.

## 2. Rename Pendaftaran -> Master Pasien & URL (Poin 2)
- Buat folder `src/app/master-pasien/page.tsx` berisi konten manajemen master pasien.
- Ubah heading di `src/app/master-pasien/page.tsx`:
  `Master Pasien`
  Deskripsi: `Database & Data Induk Pasien Terdaftar`
- Tetap biarkan `src/app/pendaftaran/page.tsx` sebagai redirect / alias ke `/master-pasien`.
- Update link di `Sidebar.tsx`:
  Ganti `/pendaftaran` menjadi `/master-pasien`.
- Update link di `src/app/page.tsx` (dashboard card):
  Ganti `/pendaftaran` menjadi `/master-pasien`.

## 3. Sidebar Sub-Menu Rekam Medis (Poin 6)
- Di `Sidebar.tsx`:
  Sub-menu Rekam Medis harus bisa diakses kapan saja:
  Tampilkan dropdown / expandable menu atau item sub-menu di bawah Rekam Medis:
  - Rekam Medis Ibu (`/rekam-medis?poli=ibu`)
  - Rekam Medis Anak (`/rekam-medis?poli=anak`)
  - Mom and Baby Spa (`/rekam-medis?poli=spa`)
  - Rekam Medis Umum (`/rekam-medis?poli=umum`)
  Pastikan `href` memiliki query string `?poli=...` sehingga saat diklik langsung memfilter tab dan poli yang sesuai!

## 4. Bug Load Pasien di Rekam Medis (Poin 7)
- Di `src/app/rekam-medis/page.tsx`:
  Saat ini `setPatients(patientStore.getAll())` HILANG sehingga daftar pasien selalu kosong (0)!
  Perbaiki `useEffect` inisialisasi:
  ```ts
  useEffect(() => {
    initStore();
    const allPatients = patientStore.getAll();
    setPatients(allPatients);
    setVisits(visitStore.getAll());
    setDrugs(drugStore.getAll());
  }, []);
  ```
  Dan tambahkan sinkronisasi `patientId` dan `poli` dari query URL agar ketika user masuk dari antrian atau submenu:
  - Tab kategori poli otomatis aktif.
  - Pasien dengan `patientId` tersebut langsung terpilih (`selectedPatient`) dan modal input rekam medis langsung terbuka otomatis.

## 5. Form Rekam Medis Spesifik per Poli & Layanan (Poin 8)
- Jangan hanya menampilkan wizard SOAP generik yang sama!
- Di dalam modal Input Rekam Medis (`NewVisitModal` atau modular components), render form spesifik berdasarkan poli & pilihan layanannya:
  ### A. Poli Ibu
  Pilihan Layanan: ANC / Kehamilan, INC / Persalinan, Nifas, KB, Kespro.
  - **ANC**:
    - Data Kunjungan: Nama pasien, No RM, Tgl kunjungan, Dokter/Bidan
    - Data Kehamilan: Kehamilan ke-, HPHT, HPL, Usia kehamilan, Jumlah anak, Riwayat kehamilan
    - Pemeriksaan: BB, TB, Tekanan darah, Nadi, Suhu, LILA, TFU, DJJ
    - Pemeriksaan Klinis: Keluhan utama, Hasil pemeriksaan, Diagnosa, Tindakan, Rencana, Edukasi, Obat/vitamin, Rencana kontrol, Catatan
  - **INC / Persalinan**:
    - Data Persalinan: Tgl persalinan, Jam persalinan, Usia kehamilan, Jenis persalinan, Penolong persalinan
    - Kondisi Ibu: Tekanan darah, Nadi, Perdarahan, Kondisi ibu
    - Kondisi Bayi: Jenis kelamin, Berat lahir, Panjang badan, Lingkar kepala, APGAR, Kondisi bayi
    - Tindakan: Tindakan persalinan, Komplikasi, Catatan
  - **Nifas**:
    - Pemeriksaan: Hari / minggu nifas, Tanggal pemeriksaan, Tekanan darah, Berat badan, Suhu
    - Kondisi Ibu: Kondisi umum, Kondisi luka / jahitan, Perdarahan / lochea, Kondisi payudara, Kondisi ASI, Keluhan
    - Hasil & Tindakan: Hasil pemeriksaan, Edukasi, Tindakan, Rencana kontrol, Catatan
  - **KB**:
    - Pilihan jenis KB: Suntik 1 Bulan, Suntik 2 Bulan, Suntik 3 Bulan, IUD, Implant, Pil
    - Data Umum KB: Tanggal pelayanan, Jenis KB, Keluhan, Hasil pemeriksaan, Tindakan, Efek samping, Tanggal kontrol berikutnya, Catatan
    - Khusus IUD: Jenis IUD, Tanggal pemasangan, Kondisi, Benang IUD, Tanggal kontrol
    - Khusus Implant: Jenis implant, Jumlah batang, Lokasi pemasangan, Tanggal pemasangan, Tanggal kontrol / pelepasan
    - Khusus Suntik: Jenis suntik, Tanggal pemberian, Tanggal suntik berikutnya
    - Khusus Pil: Jenis pil, Jumlah / periode pemberian, Tanggal kontrol berikutnya
  - **Kespro**:
    - Pilihan: Pap Smear | Spa V
    - Pap Smear: Tanggal pemeriksaan, Keluhan, Hasil pemeriksaan, Sampel, Hasil / kesimpulan, Tindakan, Rekomendasi, Rencana kontrol, Catatan
    - Spa V: Tanggal, Keluhan, Pemeriksaan, Tindakan, Catatan, Rencana kontrol

  ### B. Poli Anak
  Pilihan Layanan: KN / Kontrol Baby, MTBS, Imunisasi.
  - **KN / Kontrol Baby**:
    - Data Anak: Nama pasien, No. rekam medis, Usia, Tanggal kunjungan
    - Pemeriksaan: Berat badan, Panjang / tinggi badan, Lingkar kepala, Suhu, Kondisi umum
    - Pemeriksaan Lanjutan: Keluhan, ASI, Tumbuh kembang, Hasil pemeriksaan, Diagnosa, Tindakan, Rencana, Edukasi, Rencana kontrol, Catatan
  - **MTBS**:
    - Keluhan: Keluhan utama, Durasi keluhan
    - Pemeriksaan: Suhu, Berat badan, Tinggi / panjang badan, Respirasi, Nadi
    - Penilaian MTBS: Batuk / sulit bernapas, Diare, Demam, Masalah telinga, Status gizi, Status imunisasi
    - Hasil: Klasifikasi, Diagnosa, Tindakan, Obat, Edukasi, Rencana kontrol, Catatan
  - **Imunisasi**:
    - Data Imunisasi: Tanggal imunisasi, Jenis imunisasi, Nama vaksin, Dosis, Batch / nomor batch, Cara pemberian, Lokasi pemberian
    - Kondisi: Kondisi sebelum imunisasi, Reaksi setelah imunisasi
    - Rencana: Jadwal imunisasi berikutnya, Catatan

  ### C. Mom & Baby Spa
  Pilihan Layanan: Pijat Bayi, Pijat Anak, Pijat Bumil, Senam / Yoga Hamil.
  - **Pijat Bayi**: Tanggal, Usia bayi, Berat badan, Kondisi sebelum treatment, Jenis treatment, Durasi, Kondisi setelah treatment, Catatan terapis, Jadwal berikutnya
  - **Pijat Anak**: Tanggal, Usia anak, Berat badan, Kondisi sebelum treatment, Jenis treatment, Durasi, Kondisi setelah treatment, Catatan terapis, Jadwal berikutnya
  - **Pijat Bumil**: Tanggal, Usia kehamilan, Keluhan, Kondisi kehamilan, Jenis treatment, Durasi, Kondisi setelah treatment, Catatan, Jadwal berikutnya
  - **Senam / Yoga Hamil**: Tanggal, Usia kehamilan, Jenis kelas, Instruktur, Durasi, Kondisi sebelum, Kondisi setelah, Catatan, Jadwal berikutnya

  ### D. Poli Umum
  - Keluhan: Keluhan utama, Riwayat penyakit, Alergi
  - Pemeriksaan: Tekanan darah, Nadi, Suhu, Respirasi, Berat badan, Tinggi badan
  - Pemeriksaan Dokter: Pemeriksaan fisik, Diagnosa, Tindakan
  - Pengobatan: Obat, Dosis / aturan penggunaan
  - Rencana: Edukasi, Rencana kontrol, Catatan

- Tombol "Simpan Rekam Medis" menyimpan seluruh form data ini ke `visitStore` (bisa disimpan di field JSON / extended field visit), dan menampilkan toast opsi:
  **"Lanjut ke Kasir & Billing"** -> diarahkan ke `/kasir/?patientId=...`
