'use client';
import React from 'react';

export interface FormAnakData {
  layanan: 'KN' | 'MTBS' | 'Imunisasi';
  // KN / Kontrol Baby
  namaPasien?: string;
  noRm?: string;
  usiaAnak?: string;
  tglKunjunganKn?: string;
  bbKn?: string;
  pbTbKn?: string;
  lkKn?: string;
  suhuKn?: string;
  kondisiUmumKn?: string;
  keluhanKn?: string;
  asiKn?: string;
  tumbuhKembang?: string;
  hasilPemeriksaanKn?: string;
  diagnosaKn?: string;
  tindakanKn?: string;
  rencanaKn?: string;
  edukasiKn?: string;
  rencanaKontrolKn?: string;
  catatanKn?: string;

  // MTBS
  keluhanUtamaMtbs?: string;
  durasiKeluhanMtbs?: string;
  suhuMtbs?: string;
  bbMtbs?: string;
  tbPbMtbs?: string;
  respirasiMtbs?: string;
  nadiMtbs?: string;
  batukNapasMtbs?: string;
  diareMtbs?: string;
  demamMtbs?: string;
  masalahTelingaMtbs?: string;
  statusGiziMtbs?: string;
  statusImunisasiMtbs?: string;
  klasifikasiMtbs?: string;
  diagnosaMtbs?: string;
  tindakanMtbs?: string;
  obatMtbs?: string;
  edukasiMtbs?: string;
  rencanaKontrolMtbs?: string;
  catatanMtbs?: string;

  // Imunisasi
  tglImunisasi?: string;
  jenisImunisasi?: string;
  namaVaksin?: string;
  dosisImunisasi?: string;
  batchImunisasi?: string;
  caraPemberian?: string;
  lokasiPemberian?: string;
  kondisiSebelumImunisasi?: string;
  reaksiSetelahImunisasi?: string;
  jadwalImunisasiBerikutnya?: string;
  catatanImunisasi?: string;
}

export function FormRekamMedisAnak({
  data,
  onChange,
}: {
  data: FormAnakData;
  onChange: (data: FormAnakData) => void;
}) {
  const setField = (field: keyof FormAnakData, val: any) => {
    onChange({ ...data, [field]: val });
  };

  return (
    <div className="space-y-6">
      {/* Pilihan Layanan Anak */}
      <div>
        <label className="block text-xs font-semibold uppercase tracking-wider text-violet-800 mb-2">
          Pilihan Layanan Poli Anak
        </label>
        <div className="grid grid-cols-3 gap-2">
          {(['KN', 'MTBS', 'Imunisasi'] as const).map((l) => (
            <button
              key={l}
              type="button"
              onClick={() => setField('layanan', l)}
              className={`py-2.5 px-3 rounded-xl text-xs font-bold border transition-all ${
                data.layanan === l
                  ? 'bg-violet-600 text-white border-violet-600 shadow-sm shadow-violet-100'
                  : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
              }`}
            >
              {l === 'KN' && 'KN / Kontrol Baby'}
              {l === 'MTBS' && 'MTBS (Manajemen Terpadu Balita Sakit)'}
              {l === 'Imunisasi' && 'Imunisasi'}
            </button>
          ))}
        </div>
      </div>

      {/* ── 1. KN / KONTROL BABY ── */}
      {data.layanan === 'KN' && (
        <div className="space-y-4">
          <div className="bg-violet-50/50 p-4 rounded-2xl border border-violet-100 space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-violet-700">1. Data Anak & Pemeriksaan Fisik</h4>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div>
                <label className="text-xs font-medium text-slate-600 mb-1 block">Tanggal Kunjungan</label>
                <input
                  type="date"
                  value={data.tglKunjunganKn || ''}
                  onChange={(e) => setField('tglKunjunganKn', e.target.value)}
                  className="w-full text-xs p-2.5 rounded-xl border border-slate-200 bg-white"
                />
              </div>
              <div>
                <label className="text-xs font-medium text-slate-600 mb-1 block">Usia Anak</label>
                <input
                  type="text"
                  placeholder="Contoh: 2 bulan 10 hari"
                  value={data.usiaAnak || ''}
                  onChange={(e) => setField('usiaAnak', e.target.value)}
                  className="w-full text-xs p-2.5 rounded-xl border border-slate-200 bg-white"
                />
              </div>
              <div>
                <label className="text-xs font-medium text-slate-600 mb-1 block">Berat Badan (kg)</label>
                <input
                  type="text"
                  placeholder="5.2 kg"
                  value={data.bbKn || ''}
                  onChange={(e) => setField('bbKn', e.target.value)}
                  className="w-full text-xs p-2.5 rounded-xl border border-slate-200 bg-white"
                />
              </div>
              <div>
                <label className="text-xs font-medium text-slate-600 mb-1 block">Panjang / Tinggi Badan (cm)</label>
                <input
                  type="text"
                  placeholder="58 cm"
                  value={data.pbTbKn || ''}
                  onChange={(e) => setField('pbTbKn', e.target.value)}
                  className="w-full text-xs p-2.5 rounded-xl border border-slate-200 bg-white"
                />
              </div>
              <div>
                <label className="text-xs font-medium text-slate-600 mb-1 block">Lingkar Kepala (cm)</label>
                <input
                  type="text"
                  placeholder="38 cm"
                  value={data.lkKn || ''}
                  onChange={(e) => setField('lkKn', e.target.value)}
                  className="w-full text-xs p-2.5 rounded-xl border border-slate-200 bg-white"
                />
              </div>
              <div>
                <label className="text-xs font-medium text-slate-600 mb-1 block">Suhu (°C)</label>
                <input
                  type="text"
                  placeholder="36.8"
                  value={data.suhuKn || ''}
                  onChange={(e) => setField('suhuKn', e.target.value)}
                  className="w-full text-xs p-2.5 rounded-xl border border-slate-200 bg-white"
                />
              </div>
              <div className="sm:col-span-2">
                <label className="text-xs font-medium text-slate-600 mb-1 block">Kondisi Umum</label>
                <input
                  type="text"
                  placeholder="Aktif, menangis kuat, warna kulit kemerahan"
                  value={data.kondisiUmumKn || ''}
                  onChange={(e) => setField('kondisiUmumKn', e.target.value)}
                  className="w-full text-xs p-2.5 rounded-xl border border-slate-200 bg-white"
                />
              </div>
            </div>
          </div>

          <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700">2. Pemeriksaan Lanjutan & Tumbuh Kembang</h4>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="text-xs font-medium text-slate-600 mb-1 block">Keluhan</label>
                <input
                  type="text"
                  placeholder="Gumoh, rewel, ruam popok, dll"
                  value={data.keluhanKn || ''}
                  onChange={(e) => setField('keluhanKn', e.target.value)}
                  className="w-full text-xs p-2.5 rounded-xl border border-slate-200 bg-white"
                />
              </div>
              <div>
                <label className="text-xs font-medium text-slate-600 mb-1 block">Pemberian ASI / Nutrisi</label>
                <input
                  type="text"
                  placeholder="ASI Eksklusif / Formula / Campuran"
                  value={data.asiKn || ''}
                  onChange={(e) => setField('asiKn', e.target.value)}
                  className="w-full text-xs p-2.5 rounded-xl border border-slate-200 bg-white"
                />
              </div>
              <div>
                <label className="text-xs font-medium text-slate-600 mb-1 block">Tumbuh Kembang</label>
                <input
                  type="text"
                  placeholder="Bisa menatap mata, tersenyum sosial"
                  value={data.tumbuhKembang || ''}
                  onChange={(e) => setField('tumbuhKembang', e.target.value)}
                  className="w-full text-xs p-2.5 rounded-xl border border-slate-200 bg-white"
                />
              </div>
              <div className="sm:col-span-2">
                <label className="text-xs font-medium text-slate-600 mb-1 block">Hasil Pemeriksaan Fisik</label>
                <input
                  type="text"
                  placeholder="Mata tidak kuning, tali pusat kering, refleks isap baik"
                  value={data.hasilPemeriksaanKn || ''}
                  onChange={(e) => setField('hasilPemeriksaanKn', e.target.value)}
                  className="w-full text-xs p-2.5 rounded-xl border border-slate-200 bg-white"
                />
              </div>
              <div>
                <label className="text-xs font-medium text-slate-600 mb-1 block">Diagnosa</label>
                <input
                  type="text"
                  placeholder="Neonatus Cukup Bulan Sehat"
                  value={data.diagnosaKn || ''}
                  onChange={(e) => setField('diagnosaKn', e.target.value)}
                  className="w-full text-xs p-2.5 rounded-xl border border-slate-200 bg-white"
                />
              </div>
              <div>
                <label className="text-xs font-medium text-slate-600 mb-1 block">Tindakan</label>
                <input
                  type="text"
                  placeholder="KIE perawatan bayi baru lahir, penimbangan"
                  value={data.tindakanKn || ''}
                  onChange={(e) => setField('tindakanKn', e.target.value)}
                  className="w-full text-xs p-2.5 rounded-xl border border-slate-200 bg-white"
                />
              </div>
              <div>
                <label className="text-xs font-medium text-slate-600 mb-1 block">Edukasi</label>
                <input
                  type="text"
                  placeholder="Pelekatan menyusui yang benar, jemur pagi"
                  value={data.edukasiKn || ''}
                  onChange={(e) => setField('edukasiKn', e.target.value)}
                  className="w-full text-xs p-2.5 rounded-xl border border-slate-200 bg-white"
                />
              </div>
              <div>
                <label className="text-xs font-medium text-slate-600 mb-1 block">Rencana Kontrol</label>
                <input
                  type="date"
                  value={data.rencanaKontrolKn || ''}
                  onChange={(e) => setField('rencanaKontrolKn', e.target.value)}
                  className="w-full text-xs p-2.5 rounded-xl border border-slate-200 bg-white"
                />
              </div>
            </div>
            <div>
              <label className="text-xs font-medium text-slate-600 mb-1 block">Catatan Tambahan</label>
              <textarea
                rows={2}
                placeholder="Catatan perkembangan bayi"
                value={data.catatanKn || ''}
                onChange={(e) => setField('catatanKn', e.target.value)}
                className="w-full text-xs p-2.5 rounded-xl border border-slate-200 bg-white"
              />
            </div>
          </div>
        </div>
      )}

      {/* ── 2. MTBS ── */}
      {data.layanan === 'MTBS' && (
        <div className="space-y-4">
          <div className="bg-amber-50/50 p-4 rounded-2xl border border-amber-100 space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-amber-800">1. Keluhan & Tanda Vital</h4>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="sm:col-span-2">
                <label className="text-xs font-medium text-slate-600 mb-1 block">Keluhan Utama</label>
                <input
                  type="text"
                  placeholder="Demam 3 hari, batuk pilek"
                  value={data.keluhanUtamaMtbs || ''}
                  onChange={(e) => setField('keluhanUtamaMtbs', e.target.value)}
                  className="w-full text-xs p-2.5 rounded-xl border border-slate-200 bg-white"
                />
              </div>
              <div>
                <label className="text-xs font-medium text-slate-600 mb-1 block">Durasi Keluhan</label>
                <input
                  type="text"
                  placeholder="3 hari"
                  value={data.durasiKeluhanMtbs || ''}
                  onChange={(e) => setField('durasiKeluhanMtbs', e.target.value)}
                  className="w-full text-xs p-2.5 rounded-xl border border-slate-200 bg-white"
                />
              </div>
              <div>
                <label className="text-xs font-medium text-slate-600 mb-1 block">Suhu (°C)</label>
                <input
                  type="text"
                  placeholder="38.5"
                  value={data.suhuMtbs || ''}
                  onChange={(e) => setField('suhuMtbs', e.target.value)}
                  className="w-full text-xs p-2.5 rounded-xl border border-slate-200 bg-white"
                />
              </div>
              <div>
                <label className="text-xs font-medium text-slate-600 mb-1 block">Berat Badan (kg)</label>
                <input
                  type="text"
                  placeholder="11.5 kg"
                  value={data.bbMtbs || ''}
                  onChange={(e) => setField('bbMtbs', e.target.value)}
                  className="w-full text-xs p-2.5 rounded-xl border border-slate-200 bg-white"
                />
              </div>
              <div>
                <label className="text-xs font-medium text-slate-600 mb-1 block">Tinggi / Panjang (cm)</label>
                <input
                  type="text"
                  placeholder="85 cm"
                  value={data.tbPbMtbs || ''}
                  onChange={(e) => setField('tbPbMtbs', e.target.value)}
                  className="w-full text-xs p-2.5 rounded-xl border border-slate-200 bg-white"
                />
              </div>
              <div>
                <label className="text-xs font-medium text-slate-600 mb-1 block">Respirasi (/menit)</label>
                <input
                  type="text"
                  placeholder="36 x/menit"
                  value={data.respirasiMtbs || ''}
                  onChange={(e) => setField('respirasiMtbs', e.target.value)}
                  className="w-full text-xs p-2.5 rounded-xl border border-slate-200 bg-white"
                />
              </div>
              <div>
                <label className="text-xs font-medium text-slate-600 mb-1 block">Nadi (/menit)</label>
                <input
                  type="text"
                  placeholder="100 x/menit"
                  value={data.nadiMtbs || ''}
                  onChange={(e) => setField('nadiMtbs', e.target.value)}
                  className="w-full text-xs p-2.5 rounded-xl border border-slate-200 bg-white"
                />
              </div>
            </div>
          </div>

          <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700">2. Penilaian MTBS Terpadu</h4>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="text-xs font-medium text-slate-600 mb-1 block">Batuk / Sulit Bernapas</label>
                <input
                  type="text"
                  placeholder="Ada batuk, tidak ada tarikan dinding dada"
                  value={data.batukNapasMtbs || ''}
                  onChange={(e) => setField('batukNapasMtbs', e.target.value)}
                  className="w-full text-xs p-2.5 rounded-xl border border-slate-200 bg-white"
                />
              </div>
              <div>
                <label className="text-xs font-medium text-slate-600 mb-1 block">Diare</label>
                <input
                  type="text"
                  placeholder="Tidak diare / 3x cair tanpa darah"
                  value={data.diareMtbs || ''}
                  onChange={(e) => setField('diareMtbs', e.target.value)}
                  className="w-full text-xs p-2.5 rounded-xl border border-slate-200 bg-white"
                />
              </div>
              <div>
                <label className="text-xs font-medium text-slate-600 mb-1 block">Demam</label>
                <input
                  type="text"
                  placeholder="Demam tinggi mendadak / terus menerus"
                  value={data.demamMtbs || ''}
                  onChange={(e) => setField('demamMtbs', e.target.value)}
                  className="w-full text-xs p-2.5 rounded-xl border border-slate-200 bg-white"
                />
              </div>
              <div>
                <label className="text-xs font-medium text-slate-600 mb-1 block">Masalah Telinga</label>
                <input
                  type="text"
                  placeholder="Tidak ada cairan / nyeri telinga"
                  value={data.masalahTelingaMtbs || ''}
                  onChange={(e) => setField('masalahTelingaMtbs', e.target.value)}
                  className="w-full text-xs p-2.5 rounded-xl border border-slate-200 bg-white"
                />
              </div>
              <div>
                <label className="text-xs font-medium text-slate-600 mb-1 block">Status Gizi</label>
                <input
                  type="text"
                  placeholder="Gizi Baik / Garis Hijau KMS"
                  value={data.statusGiziMtbs || ''}
                  onChange={(e) => setField('statusGiziMtbs', e.target.value)}
                  className="w-full text-xs p-2.5 rounded-xl border border-slate-200 bg-white"
                />
              </div>
              <div>
                <label className="text-xs font-medium text-slate-600 mb-1 block">Status Imunisasi</label>
                <input
                  type="text"
                  placeholder="Lengkap sesuai usia"
                  value={data.statusImunisasiMtbs || ''}
                  onChange={(e) => setField('statusImunisasiMtbs', e.target.value)}
                  className="w-full text-xs p-2.5 rounded-xl border border-slate-200 bg-white"
                />
              </div>
            </div>
          </div>

          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700">3. Klasifikasi, Tindakan & Terapi</h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-medium text-slate-600 mb-1 block">Klasifikasi MTBS</label>
                <input
                  type="text"
                  placeholder="Demam Bukan Malaria, Batuk Bukan Pneumonia"
                  value={data.klasifikasiMtbs || ''}
                  onChange={(e) => setField('klasifikasiMtbs', e.target.value)}
                  className="w-full text-xs p-2.5 rounded-xl border border-slate-200 bg-white"
                />
              </div>
              <div>
                <label className="text-xs font-medium text-slate-600 mb-1 block">Diagnosa Medis</label>
                <input
                  type="text"
                  placeholder="ISPA / Nasofaringitis Akut"
                  value={data.diagnosaMtbs || ''}
                  onChange={(e) => setField('diagnosaMtbs', e.target.value)}
                  className="w-full text-xs p-2.5 rounded-xl border border-slate-200 bg-white"
                />
              </div>
              <div>
                <label className="text-xs font-medium text-slate-600 mb-1 block">Tindakan</label>
                <input
                  type="text"
                  placeholder="Kompres hangat, beri cairan ekstra"
                  value={data.tindakanMtbs || ''}
                  onChange={(e) => setField('tindakanMtbs', e.target.value)}
                  className="w-full text-xs p-2.5 rounded-xl border border-slate-200 bg-white"
                />
              </div>
              <div>
                <label className="text-xs font-medium text-slate-600 mb-1 block">Obat</label>
                <input
                  type="text"
                  placeholder="Paracetamol drop 3x0.6ml, Saline nasal drop"
                  value={data.obatMtbs || ''}
                  onChange={(e) => setField('obatMtbs', e.target.value)}
                  className="w-full text-xs p-2.5 rounded-xl border border-slate-200 bg-white"
                />
              </div>
              <div>
                <label className="text-xs font-medium text-slate-600 mb-1 block">Edukasi Ibu</label>
                <input
                  type="text"
                  placeholder="Kapan harus segera kembali / tanda bahaya"
                  value={data.edukasiMtbs || ''}
                  onChange={(e) => setField('edukasiMtbs', e.target.value)}
                  className="w-full text-xs p-2.5 rounded-xl border border-slate-200 bg-white"
                />
              </div>
              <div>
                <label className="text-xs font-medium text-slate-600 mb-1 block">Rencana Kontrol</label>
                <input
                  type="date"
                  value={data.rencanaKontrolMtbs || ''}
                  onChange={(e) => setField('rencanaKontrolMtbs', e.target.value)}
                  className="w-full text-xs p-2.5 rounded-xl border border-slate-200 bg-white"
                />
              </div>
            </div>
            <div>
              <label className="text-xs font-medium text-slate-600 mb-1 block">Catatan MTBS</label>
              <textarea
                rows={2}
                placeholder="Catatan penanganan"
                value={data.catatanMtbs || ''}
                onChange={(e) => setField('catatanMtbs', e.target.value)}
                className="w-full text-xs p-2.5 rounded-xl border border-slate-200 bg-white"
              />
            </div>
          </div>
        </div>
      )}

      {/* ── 3. IMUNISASI ── */}
      {data.layanan === 'Imunisasi' && (
        <div className="space-y-4">
          <div className="bg-teal-50/50 p-4 rounded-2xl border border-teal-100 space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-teal-700">1. Data Imunisasi</h4>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="text-xs font-medium text-slate-600 mb-1 block">Tanggal Imunisasi</label>
                <input
                  type="date"
                  value={data.tglImunisasi || ''}
                  onChange={(e) => setField('tglImunisasi', e.target.value)}
                  className="w-full text-xs p-2.5 rounded-xl border border-slate-200 bg-white"
                />
              </div>
              <div>
                <label className="text-xs font-medium text-slate-600 mb-1 block">Jenis Imunisasi</label>
                <input
                  type="text"
                  placeholder="BCG / Polio / DPT-HB-Hib / Campak / PCV / Rotavirus"
                  value={data.jenisImunisasi || ''}
                  onChange={(e) => setField('jenisImunisasi', e.target.value)}
                  className="w-full text-xs p-2.5 rounded-xl border border-slate-200 bg-white"
                />
              </div>
              <div>
                <label className="text-xs font-medium text-slate-600 mb-1 block">Nama Vaksin</label>
                <input
                  type="text"
                  placeholder="Pentabio / Bio Farma"
                  value={data.namaVaksin || ''}
                  onChange={(e) => setField('namaVaksin', e.target.value)}
                  className="w-full text-xs p-2.5 rounded-xl border border-slate-200 bg-white"
                />
              </div>
              <div>
                <label className="text-xs font-medium text-slate-600 mb-1 block">Dosis</label>
                <input
                  type="text"
                  placeholder="0.5 ml / 2 tetes"
                  value={data.dosisImunisasi || ''}
                  onChange={(e) => setField('dosisImunisasi', e.target.value)}
                  className="w-full text-xs p-2.5 rounded-xl border border-slate-200 bg-white"
                />
              </div>
              <div>
                <label className="text-xs font-medium text-slate-600 mb-1 block">Batch / Nomor Batch</label>
                <input
                  type="text"
                  placeholder="Contoh: B-202610-09"
                  value={data.batchImunisasi || ''}
                  onChange={(e) => setField('batchImunisasi', e.target.value)}
                  className="w-full text-xs p-2.5 rounded-xl border border-slate-200 bg-white"
                />
              </div>
              <div>
                <label className="text-xs font-medium text-slate-600 mb-1 block">Cara Pemberian</label>
                <select
                  value={data.caraPemberian || 'Intramuskular (IM)'}
                  onChange={(e) => setField('caraPemberian', e.target.value)}
                  className="w-full text-xs p-2.5 rounded-xl border border-slate-200 bg-white"
                >
                  <option value="Intramuskular (IM)">Intramuskular (IM)</option>
                  <option value="Subkutan (SC)">Subkutan (SC)</option>
                  <option value="Intrakutan (IC/ID)">Intrakutan (IC/ID)</option>
                  <option value="Oral">Oral (Tetes Mulut)</option>
                </select>
              </div>
              <div>
                <label className="text-xs font-medium text-slate-600 mb-1 block">Lokasi Pemberian</label>
                <input
                  type="text"
                  placeholder="Paha kiri anterolateral / Lengan kanan"
                  value={data.lokasiPemberian || ''}
                  onChange={(e) => setField('lokasiPemberian', e.target.value)}
                  className="w-full text-xs p-2.5 rounded-xl border border-slate-200 bg-white"
                />
              </div>
              <div>
                <label className="text-xs font-medium text-slate-600 mb-1 block">Kondisi Sebelum Imunisasi</label>
                <input
                  type="text"
                  placeholder="Sehat, tidak demam (Suhu 36.6°C)"
                  value={data.kondisiSebelumImunisasi || ''}
                  onChange={(e) => setField('kondisiSebelumImunisasi', e.target.value)}
                  className="w-full text-xs p-2.5 rounded-xl border border-slate-200 bg-white"
                />
              </div>
              <div>
                <label className="text-xs font-medium text-slate-600 mb-1 block">Reaksi Setelah Imunisasi (KIPI)</label>
                <input
                  type="text"
                  placeholder="Kemerahan ringan / Demam ringan / Tidak ada"
                  value={data.reaksiSetelahImunisasi || ''}
                  onChange={(e) => setField('reaksiSetelahImunisasi', e.target.value)}
                  className="w-full text-xs p-2.5 rounded-xl border border-slate-200 bg-white"
                />
              </div>
            </div>
          </div>

          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700">2. Rencana Jadwal Berikutnya</h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-medium text-slate-600 mb-1 block">Jadwal Imunisasi Berikutnya</label>
                <input
                  type="date"
                  value={data.jadwalImunisasiBerikutnya || ''}
                  onChange={(e) => setField('jadwalImunisasiBerikutnya', e.target.value)}
                  className="w-full text-xs p-2.5 rounded-xl border border-slate-200 bg-white"
                />
              </div>
              <div>
                <label className="text-xs font-medium text-slate-600 mb-1 block">Catatan Imunisasi</label>
                <input
                  type="text"
                  placeholder="Edukasi paracetamol jika demam pasca DPT"
                  value={data.catatanImunisasi || ''}
                  onChange={(e) => setField('catatanImunisasi', e.target.value)}
                  className="w-full text-xs p-2.5 rounded-xl border border-slate-200 bg-white"
                />
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
