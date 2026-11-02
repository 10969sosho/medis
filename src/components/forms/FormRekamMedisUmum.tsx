'use client';
import React from 'react';

export interface FormUmumData {
  keluhanUtama?: string;
  riwayatPenyakit?: string;
  riwayatAlergi?: string;
  td?: string;
  nadi?: string;
  suhu?: string;
  respirasi?: string;
  bb?: string;
  tb?: string;
  pemeriksaanFisik?: string;
  diagnosa?: string;
  tindakan?: string;
  obat?: string;
  dosisAturan?: string;
  edukasi?: string;
  rencanaKontrol?: string;
  catatan?: string;
}

export function FormRekamMedisUmum({
  data,
  onChange,
}: {
  data: FormUmumData;
  onChange: (data: FormUmumData) => void;
}) {
  const setField = (field: keyof FormUmumData, val: any) => {
    onChange({ ...data, [field]: val });
  };

  return (
    <div className="space-y-6">
      <div className="bg-blue-50/40 p-4 rounded-2xl border border-blue-100 space-y-3">
        <h4 className="text-xs font-bold uppercase tracking-wider text-blue-800">1. Keluhan & Riwayat Pasien</h4>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="sm:col-span-2">
            <label className="text-xs font-medium text-slate-600 mb-1 block">Keluhan Utama</label>
            <input
              type="text"
              placeholder="Keluhan yang dirasakan pasien"
              value={data.keluhanUtama || ''}
              onChange={(e) => setField('keluhanUtama', e.target.value)}
              className="w-full text-xs p-2.5 rounded-xl border border-slate-200 bg-white"
            />
          </div>
          <div>
            <label className="text-xs font-medium text-slate-600 mb-1 block">Riwayat Alergi</label>
            <input
              type="text"
              placeholder="Alergi obat / makanan (jika ada)"
              value={data.riwayatAlergi || ''}
              onChange={(e) => setField('riwayatAlergi', e.target.value)}
              className="w-full text-xs p-2.5 rounded-xl border border-slate-200 bg-white"
            />
          </div>
          <div className="sm:col-span-3">
            <label className="text-xs font-medium text-slate-600 mb-1 block">Riwayat Penyakit (Dahulu & Sekarang)</label>
            <input
              type="text"
              placeholder="Hipertensi, Diabetes Melitus, Asma, dll"
              value={data.riwayatPenyakit || ''}
              onChange={(e) => setField('riwayatPenyakit', e.target.value)}
              className="w-full text-xs p-2.5 rounded-xl border border-slate-200 bg-white"
            />
          </div>
        </div>
      </div>

      <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-3">
        <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700">2. Pemeriksaan Tanda Vital</h4>
        <div className="grid grid-cols-2 sm:grid-cols-6 gap-3">
          <div>
            <label className="text-xs font-medium text-slate-600 mb-1 block">Tekanan Darah</label>
            <input
              type="text"
              placeholder="120/80 mmHg"
              value={data.td || ''}
              onChange={(e) => setField('td', e.target.value)}
              className="w-full text-xs p-2.5 rounded-xl border border-slate-200 bg-white"
            />
          </div>
          <div>
            <label className="text-xs font-medium text-slate-600 mb-1 block">Nadi (/menit)</label>
            <input
              type="text"
              placeholder="80 x/menit"
              value={data.nadi || ''}
              onChange={(e) => setField('nadi', e.target.value)}
              className="w-full text-xs p-2.5 rounded-xl border border-slate-200 bg-white"
            />
          </div>
          <div>
            <label className="text-xs font-medium text-slate-600 mb-1 block">Suhu (°C)</label>
            <input
              type="text"
              placeholder="36.5 °C"
              value={data.suhu || ''}
              onChange={(e) => setField('suhu', e.target.value)}
              className="w-full text-xs p-2.5 rounded-xl border border-slate-200 bg-white"
            />
          </div>
          <div>
            <label className="text-xs font-medium text-slate-600 mb-1 block">Respirasi (/m)</label>
            <input
              type="text"
              placeholder="20 x/menit"
              value={data.respirasi || ''}
              onChange={(e) => setField('respirasi', e.target.value)}
              className="w-full text-xs p-2.5 rounded-xl border border-slate-200 bg-white"
            />
          </div>
          <div>
            <label className="text-xs font-medium text-slate-600 mb-1 block">Berat Badan (kg)</label>
            <input
              type="text"
              placeholder="60 kg"
              value={data.bb || ''}
              onChange={(e) => setField('bb', e.target.value)}
              className="w-full text-xs p-2.5 rounded-xl border border-slate-200 bg-white"
            />
          </div>
          <div>
            <label className="text-xs font-medium text-slate-600 mb-1 block">Tinggi (cm)</label>
            <input
              type="text"
              placeholder="165 cm"
              value={data.tb || ''}
              onChange={(e) => setField('tb', e.target.value)}
              className="w-full text-xs p-2.5 rounded-xl border border-slate-200 bg-white"
            />
          </div>
        </div>
      </div>

      <div className="space-y-3">
        <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700">3. Pemeriksaan Fisik, Diagnosa & Tindakan</h4>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="text-xs font-medium text-slate-600 mb-1 block">Pemeriksaan Fisik Dokter</label>
            <textarea
              rows={2}
              placeholder="Kepala, leher, thoraks, abdomen, ekstremitas"
              value={data.pemeriksaanFisik || ''}
              onChange={(e) => setField('pemeriksaanFisik', e.target.value)}
              className="w-full text-xs p-2.5 rounded-xl border border-slate-200 bg-white"
            />
          </div>
          <div>
            <label className="text-xs font-medium text-slate-600 mb-1 block">Diagnosa Medis</label>
            <textarea
              rows={2}
              placeholder="Diagnosa kerja dan diferensial"
              value={data.diagnosa || ''}
              onChange={(e) => setField('diagnosa', e.target.value)}
              className="w-full text-xs p-2.5 rounded-xl border border-slate-200 bg-white"
            />
          </div>
          <div className="sm:col-span-2">
            <label className="text-xs font-medium text-slate-600 mb-1 block">Tindakan Medis</label>
            <input
              type="text"
              placeholder="Injeksi, perawatan luka, hecting, nebulizer"
              value={data.tindakan || ''}
              onChange={(e) => setField('tindakan', e.target.value)}
              className="w-full text-xs p-2.5 rounded-xl border border-slate-200 bg-white"
            />
          </div>
        </div>
      </div>

      <div className="space-y-3">
        <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700">4. Pengobatan, Edukasi & Rencana Kontrol</h4>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="text-xs font-medium text-slate-600 mb-1 block">Obat</label>
            <input
              type="text"
              placeholder="Nama obat yang diresepkan"
              value={data.obat || ''}
              onChange={(e) => setField('obat', e.target.value)}
              className="w-full text-xs p-2.5 rounded-xl border border-slate-200 bg-white"
            />
          </div>
          <div>
            <label className="text-xs font-medium text-slate-600 mb-1 block">Dosis / Aturan Penggunaan</label>
            <input
              type="text"
              placeholder="Contoh: 3 x 1 tablet sesudah makan"
              value={data.dosisAturan || ''}
              onChange={(e) => setField('dosisAturan', e.target.value)}
              className="w-full text-xs p-2.5 rounded-xl border border-slate-200 bg-white"
            />
          </div>
          <div>
            <label className="text-xs font-medium text-slate-600 mb-1 block">Edukasi Pasien</label>
            <input
              type="text"
              placeholder="Istirahat cukup, minum air putih 2L, hindari pedas"
              value={data.edukasi || ''}
              onChange={(e) => setField('edukasi', e.target.value)}
              className="w-full text-xs p-2.5 rounded-xl border border-slate-200 bg-white"
            />
          </div>
          <div>
            <label className="text-xs font-medium text-slate-600 mb-1 block">Rencana Kontrol</label>
            <input
              type="date"
              value={data.rencanaKontrol || ''}
              onChange={(e) => setField('rencanaKontrol', e.target.value)}
              className="w-full text-xs p-2.5 rounded-xl border border-slate-200 bg-white"
            />
          </div>
        </div>
        <div>
          <label className="text-xs font-medium text-slate-600 mb-1 block">Catatan Dokter</label>
          <textarea
            rows={2}
            placeholder="Catatan perkembangan medis pasien"
            value={data.catatan || ''}
            onChange={(e) => setField('catatan', e.target.value)}
            className="w-full text-xs p-2.5 rounded-xl border border-slate-200 bg-white"
          />
        </div>
      </div>
    </div>
  );
}
