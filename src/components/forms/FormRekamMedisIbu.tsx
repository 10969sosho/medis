'use client';
import React from 'react';

export interface FormIbuData {
  layanan: 'ANC' | 'INC' | 'Nifas' | 'KB' | 'Kespro';
  // ANC
  tglKunjungan?: string;
  dokterBidan?: string;
  kehamilanKe?: string;
  hpht?: string;
  hpl?: string;
  usiaKehamilan?: string;
  jumlahAnak?: string;
  riwayatKehamilan?: string;
  bb?: string;
  tb?: string;
  td?: string;
  nadi?: string;
  suhu?: string;
  lila?: string;
  tfu?: string;
  djj?: string;
  keluhanUtama?: string;
  hasilPemeriksaan?: string;
  diagnosa?: string;
  tindakan?: string;
  rencana?: string;
  edukasi?: string;
  obatVitamin?: string;
  rencanaKontrol?: string;
  catatan?: string;

  // INC
  tglPersalinan?: string;
  jamPersalinan?: string;
  usiaKehamilanInc?: string;
  jenisPersalinan?: string;
  penolongPersalinan?: string;
  tdIbuInc?: string;
  nadiIbuInc?: string;
  perdarahan?: string;
  kondisiIbuInc?: string;
  jkBayi?: string;
  beratLahir?: string;
  panjangBadan?: string;
  lingkarKepala?: string;
  apgar?: string;
  kondisiBayi?: string;
  tindakanPersalinan?: string;
  komplikasi?: string;
  catatanInc?: string;

  // Nifas
  hariMingguNifas?: string;
  tglPemeriksaanNifas?: string;
  tdNifas?: string;
  bbNifas?: string;
  suhuNifas?: string;
  kondisiUmumNifas?: string;
  kondisiLukaJahitan?: string;
  perdarahanLochea?: string;
  kondisiPayudara?: string;
  kondisiAsi?: string;
  keluhanNifas?: string;
  hasilPemeriksaanNifas?: string;
  edukasiNifas?: string;
  tindakanNifas?: string;
  rencanaKontrolNifas?: string;
  catatanNifas?: string;

  // KB
  jenisKb?: 'Suntik 1 Bulan' | 'Suntik 2 Bulan' | 'Suntik 3 Bulan' | 'IUD' | 'Implant' | 'Pil';
  tglPelayananKb?: string;
  keluhanKb?: string;
  hasilPemeriksaanKb?: string;
  tindakanKb?: string;
  efekSampingKb?: string;
  tglKontrolKb?: string;
  catatanKb?: string;
  // IUD
  jenisIud?: string;
  tglPemasanganIud?: string;
  kondisiIud?: string;
  benangIud?: string;
  // Implant
  jenisImplant?: string;
  jumlahBatangImplant?: string;
  lokasiImplant?: string;
  tglPemasanganImplant?: string;
  tglPelepasanImplant?: string;
  // Suntik
  jenisSuntik?: string;
  tglPemberianSuntik?: string;
  tglSuntikBerikutnya?: string;
  // Pil
  jenisPil?: string;
  jumlahPeriodePil?: string;

  // Kespro
  jenisKespro?: 'Pap Smear' | 'Spa V';
  tglKespro?: string;
  keluhanKespro?: string;
  hasilPemeriksaanKespro?: string;
  sampelPapSmear?: string;
  hasilKesimpulanPapSmear?: string;
  tindakanKespro?: string;
  rekomendasiPapSmear?: string;
  rencanaKontrolKespro?: string;
  catatanKespro?: string;
}

export function FormRekamMedisIbu({
  data,
  onChange,
}: {
  data: FormIbuData;
  onChange: (data: FormIbuData) => void;
}) {
  const setField = (field: keyof FormIbuData, val: any) => {
    onChange({ ...data, [field]: val });
  };

  return (
    <div className="space-y-6">
      {/* Pilihan Layanan Ibu */}
      <div>
        <label className="block text-xs font-semibold uppercase tracking-wider text-teal-800 mb-2">
          Pilihan Layanan Ibu
        </label>
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
          {(['ANC', 'INC', 'Nifas', 'KB', 'Kespro'] as const).map((l) => (
            <button
              key={l}
              type="button"
              onClick={() => setField('layanan', l)}
              className={`py-2 px-3 rounded-xl text-xs font-bold border transition-all ${
                data.layanan === l
                  ? 'bg-teal-600 text-white border-teal-600 shadow-sm shadow-teal-100'
                  : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
              }`}
            >
              {l === 'ANC' && 'ANC / Kehamilan'}
              {l === 'INC' && 'INC / Persalinan'}
              {l === 'Nifas' && 'Nifas'}
              {l === 'KB' && 'KB'}
              {l === 'Kespro' && 'Kespro'}
            </button>
          ))}
        </div>
      </div>

      {/* ── 1. ANC / KEHAMILAN ── */}
      {data.layanan === 'ANC' && (
        <div className="space-y-4">
          <div className="bg-teal-50/50 p-4 rounded-2xl border border-teal-100/70 space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-teal-700">1. Data Kunjungan & Kehamilan</h4>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="text-xs font-medium text-slate-600 mb-1 block">Tanggal Kunjungan</label>
                <input
                  type="date"
                  value={data.tglKunjungan || ''}
                  onChange={(e) => setField('tglKunjungan', e.target.value)}
                  className="w-full text-xs p-2.5 rounded-xl border border-slate-200 bg-white focus:ring-2 focus:ring-teal-500"
                />
              </div>

              <div>
                <label className="text-xs font-medium text-slate-600 mb-1 block">Kehamilan ke- (G...P...A...)</label>
                <input
                  type="text"
                  placeholder="Contoh: G2P1A0"
                  value={data.kehamilanKe || ''}
                  onChange={(e) => setField('kehamilanKe', e.target.value)}
                  className="w-full text-xs p-2.5 rounded-xl border border-slate-200 bg-white focus:ring-2 focus:ring-teal-500"
                />
              </div>
              <div>
                <label className="text-xs font-medium text-slate-600 mb-1 block">HPHT</label>
                <input
                  type="date"
                  value={data.hpht || ''}
                  onChange={(e) => setField('hpht', e.target.value)}
                  className="w-full text-xs p-2.5 rounded-xl border border-slate-200 bg-white focus:ring-2 focus:ring-teal-500"
                />
              </div>
              <div>
                <label className="text-xs font-medium text-slate-600 mb-1 block">HPL</label>
                <input
                  type="date"
                  value={data.hpl || ''}
                  onChange={(e) => setField('hpl', e.target.value)}
                  className="w-full text-xs p-2.5 rounded-xl border border-slate-200 bg-white focus:ring-2 focus:ring-teal-500"
                />
              </div>
              <div>
                <label className="text-xs font-medium text-slate-600 mb-1 block">Usia Kehamilan (Minggu)</label>
                <input
                  type="text"
                  placeholder="Contoh: 28 Minggu"
                  value={data.usiaKehamilan || ''}
                  onChange={(e) => setField('usiaKehamilan', e.target.value)}
                  className="w-full text-xs p-2.5 rounded-xl border border-slate-200 bg-white focus:ring-2 focus:ring-teal-500"
                />
              </div>
              <div>
                <label className="text-xs font-medium text-slate-600 mb-1 block">Jumlah Anak</label>
                <input
                  type="number"
                  placeholder="Jumlah anak hidup"
                  value={data.jumlahAnak || ''}
                  onChange={(e) => setField('jumlahAnak', e.target.value)}
                  className="w-full text-xs p-2.5 rounded-xl border border-slate-200 bg-white focus:ring-2 focus:ring-teal-500"
                />
              </div>
              <div className="sm:col-span-2">
                <label className="text-xs font-medium text-slate-600 mb-1 block">Riwayat Kehamilan / Persalinan Lalu</label>
                <input
                  type="text"
                  placeholder="Normal / SC / Komplikasi sebelumnya"
                  value={data.riwayatKehamilan || ''}
                  onChange={(e) => setField('riwayatKehamilan', e.target.value)}
                  className="w-full text-xs p-2.5 rounded-xl border border-slate-200 bg-white focus:ring-2 focus:ring-teal-500"
                />
              </div>
            </div>
          </div>

          <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700">2. Pemeriksaan Fisik & Kebidanan</h4>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div>
                <label className="text-xs font-medium text-slate-600 mb-1 block">Berat Badan (kg)</label>
                <input
                  type="text"
                  placeholder="kg"
                  value={data.bb || ''}
                  onChange={(e) => setField('bb', e.target.value)}
                  className="w-full text-xs p-2.5 rounded-xl border border-slate-200 bg-white focus:ring-2 focus:ring-teal-500"
                />
              </div>
              <div>
                <label className="text-xs font-medium text-slate-600 mb-1 block">Tinggi Badan (cm)</label>
                <input
                  type="text"
                  placeholder="cm"
                  value={data.tb || ''}
                  onChange={(e) => setField('tb', e.target.value)}
                  className="w-full text-xs p-2.5 rounded-xl border border-slate-200 bg-white focus:ring-2 focus:ring-teal-500"
                />
              </div>
              <div>
                <label className="text-xs font-medium text-slate-600 mb-1 block">Tekanan Darah (mmHg)</label>
                <input
                  type="text"
                  placeholder="120/80"
                  value={data.td || ''}
                  onChange={(e) => setField('td', e.target.value)}
                  className="w-full text-xs p-2.5 rounded-xl border border-slate-200 bg-white focus:ring-2 focus:ring-teal-500"
                />
              </div>
              <div>
                <label className="text-xs font-medium text-slate-600 mb-1 block">Nadi (/menit)</label>
                <input
                  type="text"
                  placeholder="80"
                  value={data.nadi || ''}
                  onChange={(e) => setField('nadi', e.target.value)}
                  className="w-full text-xs p-2.5 rounded-xl border border-slate-200 bg-white focus:ring-2 focus:ring-teal-500"
                />
              </div>
              <div>
                <label className="text-xs font-medium text-slate-600 mb-1 block">Suhu (°C)</label>
                <input
                  type="text"
                  placeholder="36.5"
                  value={data.suhu || ''}
                  onChange={(e) => setField('suhu', e.target.value)}
                  className="w-full text-xs p-2.5 rounded-xl border border-slate-200 bg-white focus:ring-2 focus:ring-teal-500"
                />
              </div>
              <div>
                <label className="text-xs font-medium text-slate-600 mb-1 block">LILA (cm)</label>
                <input
                  type="text"
                  placeholder="Lingkar Lengan Atas"
                  value={data.lila || ''}
                  onChange={(e) => setField('lila', e.target.value)}
                  className="w-full text-xs p-2.5 rounded-xl border border-slate-200 bg-white focus:ring-2 focus:ring-teal-500"
                />
              </div>
              <div>
                <label className="text-xs font-medium text-slate-600 mb-1 block">TFU (cm)</label>
                <input
                  type="text"
                  placeholder="Tinggi Fundus Uteri"
                  value={data.tfu || ''}
                  onChange={(e) => setField('tfu', e.target.value)}
                  className="w-full text-xs p-2.5 rounded-xl border border-slate-200 bg-white focus:ring-2 focus:ring-teal-500"
                />
              </div>
              <div>
                <label className="text-xs font-medium text-slate-600 mb-1 block">DJJ (/menit)</label>
                <input
                  type="text"
                  placeholder="Denyut Jantung Janin"
                  value={data.djj || ''}
                  onChange={(e) => setField('djj', e.target.value)}
                  className="w-full text-xs p-2.5 rounded-xl border border-slate-200 bg-white focus:ring-2 focus:ring-teal-500"
                />
              </div>
            </div>
          </div>

          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700">3. Pemeriksaan Klinis & Rencana</h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-medium text-slate-600 mb-1 block">Keluhan Utama</label>
                <textarea
                  rows={2}
                  placeholder="Mual, pusing, kencang-kencang, dll"
                  value={data.keluhanUtama || ''}
                  onChange={(e) => setField('keluhanUtama', e.target.value)}
                  className="w-full text-xs p-2.5 rounded-xl border border-slate-200 bg-white focus:ring-2 focus:ring-teal-500"
                />
              </div>
              <div>
                <label className="text-xs font-medium text-slate-600 mb-1 block">Hasil Pemeriksaan</label>
                <textarea
                  rows={2}
                  placeholder="Kondisi janin aktif, letak kepala, dll"
                  value={data.hasilPemeriksaan || ''}
                  onChange={(e) => setField('hasilPemeriksaan', e.target.value)}
                  className="w-full text-xs p-2.5 rounded-xl border border-slate-200 bg-white focus:ring-2 focus:ring-teal-500"
                />
              </div>
              <div>
                <label className="text-xs font-medium text-slate-600 mb-1 block">Diagnosa</label>
                <input
                  type="text"
                  placeholder="G1P0A0 Hamil 28 Minggu Janin Tunggal Hidup"
                  value={data.diagnosa || ''}
                  onChange={(e) => setField('diagnosa', e.target.value)}
                  className="w-full text-xs p-2.5 rounded-xl border border-slate-200 bg-white focus:ring-2 focus:ring-teal-500"
                />
              </div>
              <div>
                <label className="text-xs font-medium text-slate-600 mb-1 block">Tindakan</label>
                <input
                  type="text"
                  placeholder="Konseling, pemeriksaan leopold, USG"
                  value={data.tindakan || ''}
                  onChange={(e) => setField('tindakan', e.target.value)}
                  className="w-full text-xs p-2.5 rounded-xl border border-slate-200 bg-white focus:ring-2 focus:ring-teal-500"
                />
              </div>
              <div>
                <label className="text-xs font-medium text-slate-600 mb-1 block">Rencana</label>
                <input
                  type="text"
                  placeholder="Rencana ANC terpadu, lab darah"
                  value={data.rencana || ''}
                  onChange={(e) => setField('rencana', e.target.value)}
                  className="w-full text-xs p-2.5 rounded-xl border border-slate-200 bg-white focus:ring-2 focus:ring-teal-500"
                />
              </div>
              <div>
                <label className="text-xs font-medium text-slate-600 mb-1 block">Edukasi</label>
                <input
                  type="text"
                  placeholder="Gizi seimbang, tanda bahaya kehamilan"
                  value={data.edukasi || ''}
                  onChange={(e) => setField('edukasi', e.target.value)}
                  className="w-full text-xs p-2.5 rounded-xl border border-slate-200 bg-white focus:ring-2 focus:ring-teal-500"
                />
              </div>
              <div>
                <label className="text-xs font-medium text-slate-600 mb-1 block">Obat / Vitamin</label>
                <input
                  type="text"
                  placeholder="Tablet Fe, Asam Folat, Kalsium"
                  value={data.obatVitamin || ''}
                  onChange={(e) => setField('obatVitamin', e.target.value)}
                  className="w-full text-xs p-2.5 rounded-xl border border-slate-200 bg-white focus:ring-2 focus:ring-teal-500"
                />
              </div>
              <div>
                <label className="text-xs font-medium text-slate-600 mb-1 block">Rencana Kontrol</label>
                <input
                  type="date"
                  value={data.rencanaKontrol || ''}
                  onChange={(e) => setField('rencanaKontrol', e.target.value)}
                  className="w-full text-xs p-2.5 rounded-xl border border-slate-200 bg-white focus:ring-2 focus:ring-teal-500"
                />
              </div>
            </div>
            <div>
              <label className="text-xs font-medium text-slate-600 mb-1 block">Catatan Tambahan</label>
              <textarea
                rows={2}
                placeholder="Catatan khusus bidan/dokter"
                value={data.catatan || ''}
                onChange={(e) => setField('catatan', e.target.value)}
                className="w-full text-xs p-2.5 rounded-xl border border-slate-200 bg-white focus:ring-2 focus:ring-teal-500"
              />
            </div>
          </div>
        </div>
      )}

      {/* ── 2. INC / PERSALINAN ── */}
      {data.layanan === 'INC' && (
        <div className="space-y-4">
          <div className="bg-pink-50/50 p-4 rounded-2xl border border-pink-100 space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-pink-700">1. Data Persalinan</h4>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="text-xs font-medium text-slate-600 mb-1 block">Tanggal Persalinan</label>
                <input
                  type="date"
                  value={data.tglPersalinan || ''}
                  onChange={(e) => setField('tglPersalinan', e.target.value)}
                  className="w-full text-xs p-2.5 rounded-xl border border-slate-200 bg-white focus:ring-2 focus:ring-pink-500"
                />
              </div>
              <div>
                <label className="text-xs font-medium text-slate-600 mb-1 block">Jam Persalinan</label>
                <input
                  type="time"
                  value={data.jamPersalinan || ''}
                  onChange={(e) => setField('jamPersalinan', e.target.value)}
                  className="w-full text-xs p-2.5 rounded-xl border border-slate-200 bg-white focus:ring-2 focus:ring-pink-500"
                />
              </div>
              <div>
                <label className="text-xs font-medium text-slate-600 mb-1 block">Usia Kehamilan</label>
                <input
                  type="text"
                  placeholder="39 Minggu"
                  value={data.usiaKehamilanInc || ''}
                  onChange={(e) => setField('usiaKehamilanInc', e.target.value)}
                  className="w-full text-xs p-2.5 rounded-xl border border-slate-200 bg-white focus:ring-2 focus:ring-pink-500"
                />
              </div>
              <div>
                <label className="text-xs font-medium text-slate-600 mb-1 block">Jenis Persalinan</label>
                <select
                  value={data.jenisPersalinan || 'Spontan'}
                  onChange={(e) => setField('jenisPersalinan', e.target.value)}
                  className="w-full text-xs p-2.5 rounded-xl border border-slate-200 bg-white focus:ring-2 focus:ring-pink-500"
                >
                  <option value="Spontan">Spontan / Normal</option>
                  <option value="SC">Sectio Caesarea (SC)</option>
                  <option value="Vakum">Ekstraksi Vakum</option>
                  <option value="Lainnya">Lainnya</option>
                </select>
              </div>
              <div className="sm:col-span-2">
                <label className="text-xs font-medium text-slate-600 mb-1 block">Penolong Persalinan</label>
                <input
                  type="text"
                  placeholder="Bidan / dr. Sp.OG"
                  value={data.penolongPersalinan || ''}
                  onChange={(e) => setField('penolongPersalinan', e.target.value)}
                  className="w-full text-xs p-2.5 rounded-xl border border-slate-200 bg-white focus:ring-2 focus:ring-pink-500"
                />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-3">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700">2. Kondisi Ibu</h4>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-xs font-medium text-slate-600 mb-1 block">Tekanan Darah</label>
                  <input
                    type="text"
                    placeholder="120/80"
                    value={data.tdIbuInc || ''}
                    onChange={(e) => setField('tdIbuInc', e.target.value)}
                    className="w-full text-xs p-2.5 rounded-xl border border-slate-200 bg-white"
                  />
                </div>
                <div>
                  <label className="text-xs font-medium text-slate-600 mb-1 block">Nadi (/menit)</label>
                  <input
                    type="text"
                    placeholder="84"
                    value={data.nadiIbuInc || ''}
                    onChange={(e) => setField('nadiIbuInc', e.target.value)}
                    className="w-full text-xs p-2.5 rounded-xl border border-slate-200 bg-white"
                  />
                </div>
                <div>
                  <label className="text-xs font-medium text-slate-600 mb-1 block">Perdarahan (cc)</label>
                  <input
                    type="text"
                    placeholder="150 cc"
                    value={data.perdarahan || ''}
                    onChange={(e) => setField('perdarahan', e.target.value)}
                    className="w-full text-xs p-2.5 rounded-xl border border-slate-200 bg-white"
                  />
                </div>
                <div>
                  <label className="text-xs font-medium text-slate-600 mb-1 block">Kondisi Ibu</label>
                  <input
                    type="text"
                    placeholder="Baik / Stabil"
                    value={data.kondisiIbuInc || ''}
                    onChange={(e) => setField('kondisiIbuInc', e.target.value)}
                    className="w-full text-xs p-2.5 rounded-xl border border-slate-200 bg-white"
                  />
                </div>
              </div>
            </div>

            <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-3">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700">3. Kondisi Bayi</h4>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-xs font-medium text-slate-600 mb-1 block">Jenis Kelamin</label>
                  <select
                    value={data.jkBayi || 'L'}
                    onChange={(e) => setField('jkBayi', e.target.value)}
                    className="w-full text-xs p-2.5 rounded-xl border border-slate-200 bg-white"
                  >
                    <option value="L">Laki-Laki</option>
                    <option value="P">Perempuan</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs font-medium text-slate-600 mb-1 block">Berat Lahir (gram)</label>
                  <input
                    type="text"
                    placeholder="3100 gr"
                    value={data.beratLahir || ''}
                    onChange={(e) => setField('beratLahir', e.target.value)}
                    className="w-full text-xs p-2.5 rounded-xl border border-slate-200 bg-white"
                  />
                </div>
                <div>
                  <label className="text-xs font-medium text-slate-600 mb-1 block">Panjang Badan (cm)</label>
                  <input
                    type="text"
                    placeholder="49 cm"
                    value={data.panjangBadan || ''}
                    onChange={(e) => setField('panjangBadan', e.target.value)}
                    className="w-full text-xs p-2.5 rounded-xl border border-slate-200 bg-white"
                  />
                </div>
                <div>
                  <label className="text-xs font-medium text-slate-600 mb-1 block">Lingkar Kepala (cm)</label>
                  <input
                    type="text"
                    placeholder="33 cm"
                    value={data.lingkarKepala || ''}
                    onChange={(e) => setField('lingkarKepala', e.target.value)}
                    className="w-full text-xs p-2.5 rounded-xl border border-slate-200 bg-white"
                  />
                </div>
                <div>
                  <label className="text-xs font-medium text-slate-600 mb-1 block">Skor APGAR</label>
                  <input
                    type="text"
                    placeholder="8/9/10"
                    value={data.apgar || ''}
                    onChange={(e) => setField('apgar', e.target.value)}
                    className="w-full text-xs p-2.5 rounded-xl border border-slate-200 bg-white"
                  />
                </div>
                <div>
                  <label className="text-xs font-medium text-slate-600 mb-1 block">Kondisi Bayi</label>
                  <input
                    type="text"
                    placeholder="Menangis kuat, bugar"
                    value={data.kondisiBayi || ''}
                    onChange={(e) => setField('kondisiBayi', e.target.value)}
                    className="w-full text-xs p-2.5 rounded-xl border border-slate-200 bg-white"
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700">4. Tindakan & Komplikasi</h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-medium text-slate-600 mb-1 block">Tindakan Persalinan</label>
                <input
                  type="text"
                  placeholder="Episiotomi, heacting perineum grade II, IMD"
                  value={data.tindakanPersalinan || ''}
                  onChange={(e) => setField('tindakanPersalinan', e.target.value)}
                  className="w-full text-xs p-2.5 rounded-xl border border-slate-200 bg-white"
                />
              </div>
              <div>
                <label className="text-xs font-medium text-slate-600 mb-1 block">Komplikasi</label>
                <input
                  type="text"
                  placeholder="Tidak ada / Atonia / Retensio"
                  value={data.komplikasi || ''}
                  onChange={(e) => setField('komplikasi', e.target.value)}
                  className="w-full text-xs p-2.5 rounded-xl border border-slate-200 bg-white"
                />
              </div>
            </div>
            <div>
              <label className="text-xs font-medium text-slate-600 mb-1 block">Catatan Persalinan</label>
              <textarea
                rows={2}
                placeholder="Catatan proses persalinan"
                value={data.catatanInc || ''}
                onChange={(e) => setField('catatanInc', e.target.value)}
                className="w-full text-xs p-2.5 rounded-xl border border-slate-200 bg-white"
              />
            </div>
          </div>
        </div>
      )}

      {/* ── 3. NIFAS ── */}
      {data.layanan === 'Nifas' && (
        <div className="space-y-4">
          <div className="bg-amber-50/50 p-4 rounded-2xl border border-amber-100 space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-amber-800">1. Pemeriksaan Nifas</h4>
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
              <div>
                <label className="text-xs font-medium text-slate-600 mb-1 block">Hari / Minggu Nifas</label>
                <input
                  type="text"
                  placeholder="Hari ke-6 / KF 2"
                  value={data.hariMingguNifas || ''}
                  onChange={(e) => setField('hariMingguNifas', e.target.value)}
                  className="w-full text-xs p-2.5 rounded-xl border border-slate-200 bg-white"
                />
              </div>
              <div>
                <label className="text-xs font-medium text-slate-600 mb-1 block">Tanggal Pemeriksaan</label>
                <input
                  type="date"
                  value={data.tglPemeriksaanNifas || ''}
                  onChange={(e) => setField('tglPemeriksaanNifas', e.target.value)}
                  className="w-full text-xs p-2.5 rounded-xl border border-slate-200 bg-white"
                />
              </div>
              <div>
                <label className="text-xs font-medium text-slate-600 mb-1 block">Tekanan Darah</label>
                <input
                  type="text"
                  placeholder="110/70"
                  value={data.tdNifas || ''}
                  onChange={(e) => setField('tdNifas', e.target.value)}
                  className="w-full text-xs p-2.5 rounded-xl border border-slate-200 bg-white"
                />
              </div>
              <div>
                <label className="text-xs font-medium text-slate-600 mb-1 block">Berat Badan (kg)</label>
                <input
                  type="text"
                  placeholder="58 kg"
                  value={data.bbNifas || ''}
                  onChange={(e) => setField('bbNifas', e.target.value)}
                  className="w-full text-xs p-2.5 rounded-xl border border-slate-200 bg-white"
                />
              </div>
              <div>
                <label className="text-xs font-medium text-slate-600 mb-1 block">Suhu (°C)</label>
                <input
                  type="text"
                  placeholder="36.6"
                  value={data.suhuNifas || ''}
                  onChange={(e) => setField('suhuNifas', e.target.value)}
                  className="w-full text-xs p-2.5 rounded-xl border border-slate-200 bg-white"
                />
              </div>
            </div>
          </div>

          <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700">2. Kondisi Ibu & ASI</h4>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="text-xs font-medium text-slate-600 mb-1 block">Kondisi Umum</label>
                <input
                  type="text"
                  placeholder="Baik / Mandiri"
                  value={data.kondisiUmumNifas || ''}
                  onChange={(e) => setField('kondisiUmumNifas', e.target.value)}
                  className="w-full text-xs p-2.5 rounded-xl border border-slate-200 bg-white"
                />
              </div>
              <div>
                <label className="text-xs font-medium text-slate-600 mb-1 block">Kondisi Luka / Jahitan</label>
                <input
                  type="text"
                  placeholder="Kering, bersih, tidak ada nanah"
                  value={data.kondisiLukaJahitan || ''}
                  onChange={(e) => setField('kondisiLukaJahitan', e.target.value)}
                  className="w-full text-xs p-2.5 rounded-xl border border-slate-200 bg-white"
                />
              </div>
              <div>
                <label className="text-xs font-medium text-slate-600 mb-1 block">Perdarahan / Lochea</label>
                <input
                  type="text"
                  placeholder="Rubra / Serosa / Normal"
                  value={data.perdarahanLochea || ''}
                  onChange={(e) => setField('perdarahanLochea', e.target.value)}
                  className="w-full text-xs p-2.5 rounded-xl border border-slate-200 bg-white"
                />
              </div>
              <div>
                <label className="text-xs font-medium text-slate-600 mb-1 block">Kondisi Payudara</label>
                <input
                  type="text"
                  placeholder="Lembek / Bengkak / Puting lecet"
                  value={data.kondisiPayudara || ''}
                  onChange={(e) => setField('kondisiPayudara', e.target.value)}
                  className="w-full text-xs p-2.5 rounded-xl border border-slate-200 bg-white"
                />
              </div>
              <div>
                <label className="text-xs font-medium text-slate-600 mb-1 block">Kondisi ASI</label>
                <input
                  type="text"
                  placeholder="Lancar / Kolostrum / Kurang"
                  value={data.kondisiAsi || ''}
                  onChange={(e) => setField('kondisiAsi', e.target.value)}
                  className="w-full text-xs p-2.5 rounded-xl border border-slate-200 bg-white"
                />
              </div>
              <div>
                <label className="text-xs font-medium text-slate-600 mb-1 block">Keluhan Nifas</label>
                <input
                  type="text"
                  placeholder="Nyeri jahitan, lemas, dll"
                  value={data.keluhanNifas || ''}
                  onChange={(e) => setField('keluhanNifas', e.target.value)}
                  className="w-full text-xs p-2.5 rounded-xl border border-slate-200 bg-white"
                />
              </div>
            </div>
          </div>

          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700">3. Hasil, Edukasi & Rencana</h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-medium text-slate-600 mb-1 block">Hasil Pemeriksaan</label>
                <input
                  type="text"
                  placeholder="Involusi uteri baik, TFU 2 jari bawah pusat"
                  value={data.hasilPemeriksaanNifas || ''}
                  onChange={(e) => setField('hasilPemeriksaanNifas', e.target.value)}
                  className="w-full text-xs p-2.5 rounded-xl border border-slate-200 bg-white"
                />
              </div>
              <div>
                <label className="text-xs font-medium text-slate-600 mb-1 block">Edukasi</label>
                <input
                  type="text"
                  placeholder="Perawatan payudara, personal hygiene, ASI Eksklusif"
                  value={data.edukasiNifas || ''}
                  onChange={(e) => setField('edukasiNifas', e.target.value)}
                  className="w-full text-xs p-2.5 rounded-xl border border-slate-200 bg-white"
                />
              </div>
              <div>
                <label className="text-xs font-medium text-slate-600 mb-1 block">Tindakan</label>
                <input
                  type="text"
                  placeholder="Perawatan luka, pemberian vitamin A"
                  value={data.tindakanNifas || ''}
                  onChange={(e) => setField('tindakanNifas', e.target.value)}
                  className="w-full text-xs p-2.5 rounded-xl border border-slate-200 bg-white"
                />
              </div>
              <div>
                <label className="text-xs font-medium text-slate-600 mb-1 block">Rencana Kontrol</label>
                <input
                  type="date"
                  value={data.rencanaKontrolNifas || ''}
                  onChange={(e) => setField('rencanaKontrolNifas', e.target.value)}
                  className="w-full text-xs p-2.5 rounded-xl border border-slate-200 bg-white"
                />
              </div>
            </div>
            <div>
              <label className="text-xs font-medium text-slate-600 mb-1 block">Catatan Nifas</label>
              <textarea
                rows={2}
                placeholder="Catatan tambahan"
                value={data.catatanNifas || ''}
                onChange={(e) => setField('catatanNifas', e.target.value)}
                className="w-full text-xs p-2.5 rounded-xl border border-slate-200 bg-white"
              />
            </div>
          </div>
        </div>
      )}

      {/* ── 4. KB ── */}
      {data.layanan === 'KB' && (
        <div className="space-y-4">
          <div className="bg-purple-50/50 p-4 rounded-2xl border border-purple-100 space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-purple-700">1. Pilihan Jenis KB</h4>
            <div className="grid grid-cols-2 sm:grid-cols-6 gap-2">
              {(['Suntik 1 Bulan', 'Suntik 2 Bulan', 'Suntik 3 Bulan', 'IUD', 'Implant', 'Pil'] as const).map((k) => (
                <button
                  key={k}
                  type="button"
                  onClick={() => setField('jenisKb', k)}
                  className={`py-2 px-2 rounded-xl text-xs font-semibold border transition-all ${
                    data.jenisKb === k
                      ? 'bg-purple-600 text-white border-purple-600 shadow-sm'
                      : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                  }`}
                >
                  {k}
                </button>
              ))}
            </div>
          </div>

          <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700">2. Data Umum KB</h4>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="text-xs font-medium text-slate-600 mb-1 block">Tanggal Pelayanan</label>
                <input
                  type="date"
                  value={data.tglPelayananKb || ''}
                  onChange={(e) => setField('tglPelayananKb', e.target.value)}
                  className="w-full text-xs p-2.5 rounded-xl border border-slate-200 bg-white"
                />
              </div>
              <div>
                <label className="text-xs font-medium text-slate-600 mb-1 block">Keluhan</label>
                <input
                  type="text"
                  placeholder="Flek, pusing, mual, dll"
                  value={data.keluhanKb || ''}
                  onChange={(e) => setField('keluhanKb', e.target.value)}
                  className="w-full text-xs p-2.5 rounded-xl border border-slate-200 bg-white"
                />
              </div>
              <div>
                <label className="text-xs font-medium text-slate-600 mb-1 block">Hasil Pemeriksaan</label>
                <input
                  type="text"
                  placeholder="TD 120/80, BB 55 kg"
                  value={data.hasilPemeriksaanKb || ''}
                  onChange={(e) => setField('hasilPemeriksaanKb', e.target.value)}
                  className="w-full text-xs p-2.5 rounded-xl border border-slate-200 bg-white"
                />
              </div>
              <div>
                <label className="text-xs font-medium text-slate-600 mb-1 block">Tindakan</label>
                <input
                  type="text"
                  placeholder="Pemberian injeksi, pasang IUD/implant, konseling"
                  value={data.tindakanKb || ''}
                  onChange={(e) => setField('tindakanKb', e.target.value)}
                  className="w-full text-xs p-2.5 rounded-xl border border-slate-200 bg-white"
                />
              </div>
              <div>
                <label className="text-xs font-medium text-slate-600 mb-1 block">Efek Samping</label>
                <input
                  type="text"
                  placeholder="Spotting / tidak ada"
                  value={data.efekSampingKb || ''}
                  onChange={(e) => setField('efekSampingKb', e.target.value)}
                  className="w-full text-xs p-2.5 rounded-xl border border-slate-200 bg-white"
                />
              </div>
              <div>
                <label className="text-xs font-medium text-slate-600 mb-1 block">Tanggal Kontrol Berikutnya</label>
                <input
                  type="date"
                  value={data.tglKontrolKb || ''}
                  onChange={(e) => setField('tglKontrolKb', e.target.value)}
                  className="w-full text-xs p-2.5 rounded-xl border border-slate-200 bg-white"
                />
              </div>
            </div>
            <div>
              <label className="text-xs font-medium text-slate-600 mb-1 block">Catatan</label>
              <textarea
                rows={2}
                placeholder="Catatan pelayanan KB"
                value={data.catatanKb || ''}
                onChange={(e) => setField('catatanKb', e.target.value)}
                className="w-full text-xs p-2.5 rounded-xl border border-slate-200 bg-white"
              />
            </div>
          </div>

          {/* Dinamis Sesuai Jenis KB */}
          {data.jenisKb === 'IUD' && (
            <div className="bg-teal-50/50 p-4 rounded-2xl border border-teal-200 space-y-3">
              <h4 className="text-xs font-bold uppercase tracking-wider text-teal-800">Detail Khusus IUD</h4>
              <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
                <div>
                  <label className="text-xs font-medium text-slate-600 mb-1 block">Jenis IUD</label>
                  <input
                    type="text"
                    placeholder="Copper T / Mirena"
                    value={data.jenisIud || ''}
                    onChange={(e) => setField('jenisIud', e.target.value)}
                    className="w-full text-xs p-2.5 rounded-xl border border-slate-200 bg-white"
                  />
                </div>
                <div>
                  <label className="text-xs font-medium text-slate-600 mb-1 block">Tanggal Pemasangan</label>
                  <input
                    type="date"
                    value={data.tglPemasanganIud || ''}
                    onChange={(e) => setField('tglPemasanganIud', e.target.value)}
                    className="w-full text-xs p-2.5 rounded-xl border border-slate-200 bg-white"
                  />
                </div>
                <div>
                  <label className="text-xs font-medium text-slate-600 mb-1 block">Kondisi IUD</label>
                  <input
                    type="text"
                    placeholder="Baik / In situ"
                    value={data.kondisiIud || ''}
                    onChange={(e) => setField('kondisiIud', e.target.value)}
                    className="w-full text-xs p-2.5 rounded-xl border border-slate-200 bg-white"
                  />
                </div>
                <div>
                  <label className="text-xs font-medium text-slate-600 mb-1 block">Benang IUD</label>
                  <input
                    type="text"
                    placeholder="Terlihat (+), panjang 3 cm"
                    value={data.benangIud || ''}
                    onChange={(e) => setField('benangIud', e.target.value)}
                    className="w-full text-xs p-2.5 rounded-xl border border-slate-200 bg-white"
                  />
                </div>
              </div>
            </div>
          )}

          {data.jenisKb === 'Implant' && (
            <div className="bg-teal-50/50 p-4 rounded-2xl border border-teal-200 space-y-3">
              <h4 className="text-xs font-bold uppercase tracking-wider text-teal-800">Detail Khusus Implant</h4>
              <div className="grid grid-cols-1 sm:grid-cols-5 gap-3">
                <div>
                  <label className="text-xs font-medium text-slate-600 mb-1 block">Jenis Implant</label>
                  <input
                    type="text"
                    placeholder="Implanon / Norplant / Jadelle"
                    value={data.jenisImplant || ''}
                    onChange={(e) => setField('jenisImplant', e.target.value)}
                    className="w-full text-xs p-2.5 rounded-xl border border-slate-200 bg-white"
                  />
                </div>
                <div>
                  <label className="text-xs font-medium text-slate-600 mb-1 block">Jumlah Batang</label>
                  <input
                    type="text"
                    placeholder="1 batang / 2 batang"
                    value={data.jumlahBatangImplant || ''}
                    onChange={(e) => setField('jumlahBatangImplant', e.target.value)}
                    className="w-full text-xs p-2.5 rounded-xl border border-slate-200 bg-white"
                  />
                </div>
                <div>
                  <label className="text-xs font-medium text-slate-600 mb-1 block">Lokasi Pemasangan</label>
                  <input
                    type="text"
                    placeholder="Lengan kiri atas"
                    value={data.lokasiImplant || ''}
                    onChange={(e) => setField('lokasiImplant', e.target.value)}
                    className="w-full text-xs p-2.5 rounded-xl border border-slate-200 bg-white"
                  />
                </div>
                <div>
                  <label className="text-xs font-medium text-slate-600 mb-1 block">Tanggal Pemasangan</label>
                  <input
                    type="date"
                    value={data.tglPemasanganImplant || ''}
                    onChange={(e) => setField('tglPemasanganImplant', e.target.value)}
                    className="w-full text-xs p-2.5 rounded-xl border border-slate-200 bg-white"
                  />
                </div>
                <div>
                  <label className="text-xs font-medium text-slate-600 mb-1 block">Tanggal Kontrol / Pelepasan</label>
                  <input
                    type="date"
                    value={data.tglPelepasanImplant || ''}
                    onChange={(e) => setField('tglPelepasanImplant', e.target.value)}
                    className="w-full text-xs p-2.5 rounded-xl border border-slate-200 bg-white"
                  />
                </div>
              </div>
            </div>
          )}

          {data.jenisKb && data.jenisKb.startsWith('Suntik') && (
            <div className="bg-teal-50/50 p-4 rounded-2xl border border-teal-200 space-y-3">
              <h4 className="text-xs font-bold uppercase tracking-wider text-teal-800">Detail Khusus Suntik</h4>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="text-xs font-medium text-slate-600 mb-1 block">Jenis Suntik</label>
                  <input
                    type="text"
                    placeholder="Cyclofem / Depo Provera"
                    value={data.jenisSuntik || data.jenisKb}
                    onChange={(e) => setField('jenisSuntik', e.target.value)}
                    className="w-full text-xs p-2.5 rounded-xl border border-slate-200 bg-white"
                  />
                </div>
                <div>
                  <label className="text-xs font-medium text-slate-600 mb-1 block">Tanggal Pemberian</label>
                  <input
                    type="date"
                    value={data.tglPemberianSuntik || ''}
                    onChange={(e) => setField('tglPemberianSuntik', e.target.value)}
                    className="w-full text-xs p-2.5 rounded-xl border border-slate-200 bg-white"
                  />
                </div>
                <div>
                  <label className="text-xs font-medium text-slate-600 mb-1 block">Tanggal Suntik Berikutnya</label>
                  <input
                    type="date"
                    value={data.tglSuntikBerikutnya || ''}
                    onChange={(e) => setField('tglSuntikBerikutnya', e.target.value)}
                    className="w-full text-xs p-2.5 rounded-xl border border-slate-200 bg-white"
                  />
                </div>
              </div>
            </div>
          )}

          {data.jenisKb === 'Pil' && (
            <div className="bg-teal-50/50 p-4 rounded-2xl border border-teal-200 space-y-3">
              <h4 className="text-xs font-bold uppercase tracking-wider text-teal-800">Detail Khusus Pil KB</h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-medium text-slate-600 mb-1 block">Jenis Pil</label>
                  <input
                    type="text"
                    placeholder="Pil Kombinasi / Mini Pil (Laktasi)"
                    value={data.jenisPil || ''}
                    onChange={(e) => setField('jenisPil', e.target.value)}
                    className="w-full text-xs p-2.5 rounded-xl border border-slate-200 bg-white"
                  />
                </div>
                <div>
                  <label className="text-xs font-medium text-slate-600 mb-1 block">Jumlah / Periode Pemberian</label>
                  <input
                    type="text"
                    placeholder="1 Blister (28 tablet)"
                    value={data.jumlahPeriodePil || ''}
                    onChange={(e) => setField('jumlahPeriodePil', e.target.value)}
                    className="w-full text-xs p-2.5 rounded-xl border border-slate-200 bg-white"
                  />
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ── 5. KESPRO ── */}
      {data.layanan === 'Kespro' && (
        <div className="space-y-4">
          <div className="bg-rose-50/50 p-4 rounded-2xl border border-rose-100 space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-rose-800">Pilihan Layanan Kespro</h4>
            <div className="flex gap-2">
              {(['Pap Smear', 'Spa V'] as const).map((k) => (
                <button
                  key={k}
                  type="button"
                  onClick={() => setField('jenisKespro', k)}
                  className={`py-2 px-4 rounded-xl text-xs font-bold border transition-all ${
                    data.jenisKespro === k
                      ? 'bg-rose-600 text-white border-rose-600 shadow-sm'
                      : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                  }`}
                >
                  {k}
                </button>
              ))}
            </div>
          </div>

          {data.jenisKespro === 'Pap Smear' && (
            <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-3">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700">Form Pap Smear</h4>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="text-xs font-medium text-slate-600 mb-1 block">Tanggal Pemeriksaan</label>
                  <input
                    type="date"
                    value={data.tglKespro || ''}
                    onChange={(e) => setField('tglKespro', e.target.value)}
                    className="w-full text-xs p-2.5 rounded-xl border border-slate-200 bg-white"
                  />
                </div>
                <div>
                  <label className="text-xs font-medium text-slate-600 mb-1 block">Keluhan</label>
                  <input
                    type="text"
                    placeholder="Keputihan, perdarahan kontak"
                    value={data.keluhanKespro || ''}
                    onChange={(e) => setField('keluhanKespro', e.target.value)}
                    className="w-full text-xs p-2.5 rounded-xl border border-slate-200 bg-white"
                  />
                </div>
                <div>
                  <label className="text-xs font-medium text-slate-600 mb-1 block">Hasil Pemeriksaan</label>
                  <input
                    type="text"
                    placeholder="Porsio licin / erosi"
                    value={data.hasilPemeriksaanKespro || ''}
                    onChange={(e) => setField('hasilPemeriksaanKespro', e.target.value)}
                    className="w-full text-xs p-2.5 rounded-xl border border-slate-200 bg-white"
                  />
                </div>
                <div>
                  <label className="text-xs font-medium text-slate-600 mb-1 block">Sampel</label>
                  <input
                    type="text"
                    placeholder="Apusan serviks / ektoserviks"
                    value={data.sampelPapSmear || ''}
                    onChange={(e) => setField('sampelPapSmear', e.target.value)}
                    className="w-full text-xs p-2.5 rounded-xl border border-slate-200 bg-white"
                  />
                </div>
                <div>
                  <label className="text-xs font-medium text-slate-600 mb-1 block">Hasil / Kesimpulan</label>
                  <input
                    type="text"
                    placeholder="Negatif keganasan / Radang non spesifik"
                    value={data.hasilKesimpulanPapSmear || ''}
                    onChange={(e) => setField('hasilKesimpulanPapSmear', e.target.value)}
                    className="w-full text-xs p-2.5 rounded-xl border border-slate-200 bg-white"
                  />
                </div>
                <div>
                  <label className="text-xs font-medium text-slate-600 mb-1 block">Tindakan</label>
                  <input
                    type="text"
                    placeholder="Pengambilan spesimen"
                    value={data.tindakanKespro || ''}
                    onChange={(e) => setField('tindakanKespro', e.target.value)}
                    className="w-full text-xs p-2.5 rounded-xl border border-slate-200 bg-white"
                  />
                </div>
                <div>
                  <label className="text-xs font-medium text-slate-600 mb-1 block">Rekomendasi</label>
                  <input
                    type="text"
                    placeholder="Ulang 1 tahun lagi / terapi antibiotik"
                    value={data.rekomendasiPapSmear || ''}
                    onChange={(e) => setField('rekomendasiPapSmear', e.target.value)}
                    className="w-full text-xs p-2.5 rounded-xl border border-slate-200 bg-white"
                  />
                </div>
                <div>
                  <label className="text-xs font-medium text-slate-600 mb-1 block">Rencana Kontrol</label>
                  <input
                    type="date"
                    value={data.rencanaKontrolKespro || ''}
                    onChange={(e) => setField('rencanaKontrolKespro', e.target.value)}
                    className="w-full text-xs p-2.5 rounded-xl border border-slate-200 bg-white"
                  />
                </div>
              </div>
              <div>
                <label className="text-xs font-medium text-slate-600 mb-1 block">Catatan</label>
                <textarea
                  rows={2}
                  value={data.catatanKespro || ''}
                  onChange={(e) => setField('catatanKespro', e.target.value)}
                  className="w-full text-xs p-2.5 rounded-xl border border-slate-200 bg-white"
                />
              </div>
            </div>
          )}

          {data.jenisKespro === 'Spa V' && (
            <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-3">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700">Form Spa V (Vagina Spa)</h4>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="text-xs font-medium text-slate-600 mb-1 block">Tanggal</label>
                  <input
                    type="date"
                    value={data.tglKespro || ''}
                    onChange={(e) => setField('tglKespro', e.target.value)}
                    className="w-full text-xs p-2.5 rounded-xl border border-slate-200 bg-white"
                  />
                </div>
                <div>
                  <label className="text-xs font-medium text-slate-600 mb-1 block">Keluhan</label>
                  <input
                    type="text"
                    placeholder="Relaksasi / kelembaban / bau tak sedap"
                    value={data.keluhanKespro || ''}
                    onChange={(e) => setField('keluhanKespro', e.target.value)}
                    className="w-full text-xs p-2.5 rounded-xl border border-slate-200 bg-white"
                  />
                </div>
                <div>
                  <label className="text-xs font-medium text-slate-600 mb-1 block">Pemeriksaan</label>
                  <input
                    type="text"
                    placeholder="Kebersihan area organ intim luar"
                    value={data.hasilPemeriksaanKespro || ''}
                    onChange={(e) => setField('hasilPemeriksaanKespro', e.target.value)}
                    className="w-full text-xs p-2.5 rounded-xl border border-slate-200 bg-white"
                  />
                </div>
                <div>
                  <label className="text-xs font-medium text-slate-600 mb-1 block">Tindakan Treatment</label>
                  <input
                    type="text"
                    placeholder="Ratus Vagina / Uap Herbal / Pembersihan"
                    value={data.tindakanKespro || ''}
                    onChange={(e) => setField('tindakanKespro', e.target.value)}
                    className="w-full text-xs p-2.5 rounded-xl border border-slate-200 bg-white"
                  />
                </div>
                <div>
                  <label className="text-xs font-medium text-slate-600 mb-1 block">Rencana Kontrol</label>
                  <input
                    type="date"
                    value={data.rencanaKontrolKespro || ''}
                    onChange={(e) => setField('rencanaKontrolKespro', e.target.value)}
                    className="w-full text-xs p-2.5 rounded-xl border border-slate-200 bg-white"
                  />
                </div>
              </div>
              <div>
                <label className="text-xs font-medium text-slate-600 mb-1 block">Catatan</label>
                <textarea
                  rows={2}
                  placeholder="Catatan respon pasien setelah treatment"
                  value={data.catatanKespro || ''}
                  onChange={(e) => setField('catatanKespro', e.target.value)}
                  className="w-full text-xs p-2.5 rounded-xl border border-slate-200 bg-white"
                />
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
