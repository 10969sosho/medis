'use client';
import React from 'react';

export interface FormSpaData {
  layanan: 'Pijat Bayi' | 'Pijat Anak' | 'Pijat Bumil' | 'Senam Yoga';
  // Pijat Bayi & Anak
  tanggal?: string;
  usia?: string;
  bb?: string;
  kondisiSebelum?: string;
  jenisTreatment?: string;
  durasi?: string;
  kondisiSetelah?: string;
  catatanTerapis?: string;
  jadwalBerikutnya?: string;

  // Pijat Bumil
  usiaKehamilan?: string;
  keluhanBumil?: string;
  kondisiKehamilan?: string;

  // Senam / Yoga Hamil
  jenisKelas?: string;
  instruktur?: string;
}

export function FormRekamMedisSpa({
  data,
  onChange,
}: {
  data: FormSpaData;
  onChange: (data: FormSpaData) => void;
}) {
  const setField = (field: keyof FormSpaData, val: any) => {
    onChange({ ...data, [field]: val });
  };

  return (
    <div className="space-y-6">
      {/* Pilihan Layanan Mom & Baby Spa */}
      <div>
        <label className="block text-xs font-semibold uppercase tracking-wider text-pink-800 mb-2">
          Pilihan Layanan Mom & Baby Spa
        </label>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          {(['Pijat Bayi', 'Pijat Anak', 'Pijat Bumil', 'Senam Yoga'] as const).map((l) => (
            <button
              key={l}
              type="button"
              onClick={() => setField('layanan', l)}
              className={`py-2 px-3 rounded-xl text-xs font-bold border transition-all ${
                data.layanan === l
                  ? 'bg-pink-600 text-white border-pink-600 shadow-sm shadow-pink-100'
                  : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
              }`}
            >
              {l === 'Pijat Bayi' && 'Pijat Bayi'}
              {l === 'Pijat Anak' && 'Pijat Anak'}
              {l === 'Pijat Bumil' && 'Pijat Bumil'}
              {l === 'Senam Yoga' && 'Senam / Yoga Hamil'}
            </button>
          ))}
        </div>
      </div>

      {/* ── 1. PIJAT BAYI & 2. PIJAT ANAK ── */}
      {(data.layanan === 'Pijat Bayi' || data.layanan === 'Pijat Anak') && (
        <div className="space-y-4">
          <div className="bg-pink-50/50 p-4 rounded-2xl border border-pink-100 space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-pink-700">
              Form {data.layanan}
            </h4>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div>
                <label className="text-xs font-medium text-slate-600 mb-1 block">Tanggal</label>
                <input
                  type="date"
                  value={data.tanggal || ''}
                  onChange={(e) => setField('tanggal', e.target.value)}
                  className="w-full text-xs p-2.5 rounded-xl border border-slate-200 bg-white"
                />
              </div>
              <div>
                <label className="text-xs font-medium text-slate-600 mb-1 block">Usia {data.layanan === 'Pijat Bayi' ? 'Bayi' : 'Anak'}</label>
                <input
                  type="text"
                  placeholder="Contoh: 6 bulan / 3 tahun"
                  value={data.usia || ''}
                  onChange={(e) => setField('usia', e.target.value)}
                  className="w-full text-xs p-2.5 rounded-xl border border-slate-200 bg-white"
                />
              </div>
              <div>
                <label className="text-xs font-medium text-slate-600 mb-1 block">Berat Badan (kg)</label>
                <input
                  type="text"
                  placeholder="kg"
                  value={data.bb || ''}
                  onChange={(e) => setField('bb', e.target.value)}
                  className="w-full text-xs p-2.5 rounded-xl border border-slate-200 bg-white"
                />
              </div>
              <div>
                <label className="text-xs font-medium text-slate-600 mb-1 block">Durasi (Menit)</label>
                <input
                  type="text"
                  placeholder="30 - 45 Menit"
                  value={data.durasi || ''}
                  onChange={(e) => setField('durasi', e.target.value)}
                  className="w-full text-xs p-2.5 rounded-xl border border-slate-200 bg-white"
                />
              </div>
              <div className="sm:col-span-2">
                <label className="text-xs font-medium text-slate-600 mb-1 block">Jenis Treatment</label>
                <input
                  type="text"
                  placeholder="Pijat Stimulasi Tumbuh Kembang / Pijat Batuk Pilek / Relaksasi"
                  value={data.jenisTreatment || ''}
                  onChange={(e) => setField('jenisTreatment', e.target.value)}
                  className="w-full text-xs p-2.5 rounded-xl border border-slate-200 bg-white"
                />
              </div>
              <div className="sm:col-span-2">
                <label className="text-xs font-medium text-slate-600 mb-1 block">Kondisi Sebelum Treatment</label>
                <input
                  type="text"
                  placeholder="Rewel, susah tidur, perut kembung, dll"
                  value={data.kondisiSebelum || ''}
                  onChange={(e) => setField('kondisiSebelum', e.target.value)}
                  className="w-full text-xs p-2.5 rounded-xl border border-slate-200 bg-white"
                />
              </div>
              <div className="sm:col-span-2">
                <label className="text-xs font-medium text-slate-600 mb-1 block">Kondisi Setelah Treatment</label>
                <input
                  type="text"
                  placeholder="Rileks, tidur nyenyak, ceria"
                  value={data.kondisiSetelah || ''}
                  onChange={(e) => setField('kondisiSetelah', e.target.value)}
                  className="w-full text-xs p-2.5 rounded-xl border border-slate-200 bg-white"
                />
              </div>
              <div className="sm:col-span-2">
                <label className="text-xs font-medium text-slate-600 mb-1 block">Jadwal Berikutnya</label>
                <input
                  type="date"
                  value={data.jadwalBerikutnya || ''}
                  onChange={(e) => setField('jadwalBerikutnya', e.target.value)}
                  className="w-full text-xs p-2.5 rounded-xl border border-slate-200 bg-white"
                />
              </div>
            </div>
            <div>
              <label className="text-xs font-medium text-slate-600 mb-1 block">Catatan Terapis</label>
              <textarea
                rows={2}
                placeholder="Titik penekanan, minyak hangat yang digunakan, respon anak"
                value={data.catatanTerapis || ''}
                onChange={(e) => setField('catatanTerapis', e.target.value)}
                className="w-full text-xs p-2.5 rounded-xl border border-slate-200 bg-white"
              />
            </div>
          </div>
        </div>
      )}

      {/* ── 3. PIJAT BUMIL ── */}
      {data.layanan === 'Pijat Bumil' && (
        <div className="space-y-4">
          <div className="bg-pink-50/50 p-4 rounded-2xl border border-pink-100 space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-pink-700">Form Pijat Ibu Hamil (Pregnancy Massage)</h4>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div>
                <label className="text-xs font-medium text-slate-600 mb-1 block">Tanggal</label>
                <input
                  type="date"
                  value={data.tanggal || ''}
                  onChange={(e) => setField('tanggal', e.target.value)}
                  className="w-full text-xs p-2.5 rounded-xl border border-slate-200 bg-white"
                />
              </div>
              <div>
                <label className="text-xs font-medium text-slate-600 mb-1 block">Usia Kehamilan</label>
                <input
                  type="text"
                  placeholder="24 Minggu (Trimester 2)"
                  value={data.usiaKehamilan || ''}
                  onChange={(e) => setField('usiaKehamilan', e.target.value)}
                  className="w-full text-xs p-2.5 rounded-xl border border-slate-200 bg-white"
                />
              </div>
              <div>
                <label className="text-xs font-medium text-slate-600 mb-1 block">Durasi (Menit)</label>
                <input
                  type="text"
                  placeholder="60 Menit"
                  value={data.durasi || ''}
                  onChange={(e) => setField('durasi', e.target.value)}
                  className="w-full text-xs p-2.5 rounded-xl border border-slate-200 bg-white"
                />
              </div>
              <div>
                <label className="text-xs font-medium text-slate-600 mb-1 block">Jadwal Berikutnya</label>
                <input
                  type="date"
                  value={data.jadwalBerikutnya || ''}
                  onChange={(e) => setField('jadwalBerikutnya', e.target.value)}
                  className="w-full text-xs p-2.5 rounded-xl border border-slate-200 bg-white"
                />
              </div>
              <div className="sm:col-span-2">
                <label className="text-xs font-medium text-slate-600 mb-1 block">Keluhan Ibu Hamil</label>
                <input
                  type="text"
                  placeholder="Pegal pinggang, kram kaki, bengkak betis"
                  value={data.keluhanBumil || ''}
                  onChange={(e) => setField('keluhanBumil', e.target.value)}
                  className="w-full text-xs p-2.5 rounded-xl border border-slate-200 bg-white"
                />
              </div>
              <div className="sm:col-span-2">
                <label className="text-xs font-medium text-slate-600 mb-1 block">Kondisi Kehamilan</label>
                <input
                  type="text"
                  placeholder="Normal, tidak ada kontraksi/flek"
                  value={data.kondisiKehamilan || ''}
                  onChange={(e) => setField('kondisiKehamilan', e.target.value)}
                  className="w-full text-xs p-2.5 rounded-xl border border-slate-200 bg-white"
                />
              </div>
              <div className="sm:col-span-2">
                <label className="text-xs font-medium text-slate-600 mb-1 block">Jenis Treatment</label>
                <input
                  type="text"
                  placeholder="Pijat Relaksasi Bumil / Pijat Oksitosin / Foot Bath"
                  value={data.jenisTreatment || ''}
                  onChange={(e) => setField('jenisTreatment', e.target.value)}
                  className="w-full text-xs p-2.5 rounded-xl border border-slate-200 bg-white"
                />
              </div>
              <div className="sm:col-span-2">
                <label className="text-xs font-medium text-slate-600 mb-1 block">Kondisi Setelah Treatment</label>
                <input
                  type="text"
                  placeholder="Rileks, pegal berkurang, badan enteng"
                  value={data.kondisiSetelah || ''}
                  onChange={(e) => setField('kondisiSetelah', e.target.value)}
                  className="w-full text-xs p-2.5 rounded-xl border border-slate-200 bg-white"
                />
              </div>
            </div>
            <div>
              <label className="text-xs font-medium text-slate-600 mb-1 block">Catatan Tambahan</label>
              <textarea
                rows={2}
                placeholder="Catatan terapis"
                value={data.catatanTerapis || ''}
                onChange={(e) => setField('catatanTerapis', e.target.value)}
                className="w-full text-xs p-2.5 rounded-xl border border-slate-200 bg-white"
              />
            </div>
          </div>
        </div>
      )}

      {/* ── 4. SENAM / YOGA HAMIL ── */}
      {data.layanan === 'Senam Yoga' && (
        <div className="space-y-4">
          <div className="bg-pink-50/50 p-4 rounded-2xl border border-pink-100 space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-pink-700">Form Senam / Yoga Hamil</h4>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div>
                <label className="text-xs font-medium text-slate-600 mb-1 block">Tanggal</label>
                <input
                  type="date"
                  value={data.tanggal || ''}
                  onChange={(e) => setField('tanggal', e.target.value)}
                  className="w-full text-xs p-2.5 rounded-xl border border-slate-200 bg-white"
                />
              </div>
              <div>
                <label className="text-xs font-medium text-slate-600 mb-1 block">Usia Kehamilan</label>
                <input
                  type="text"
                  placeholder="28 Minggu"
                  value={data.usiaKehamilan || ''}
                  onChange={(e) => setField('usiaKehamilan', e.target.value)}
                  className="w-full text-xs p-2.5 rounded-xl border border-slate-200 bg-white"
                />
              </div>
              <div>
                <label className="text-xs font-medium text-slate-600 mb-1 block">Jenis Kelas</label>
                <input
                  type="text"
                  placeholder="Prenatal Gentle Yoga / Senam Hamil"
                  value={data.jenisKelas || ''}
                  onChange={(e) => setField('jenisKelas', e.target.value)}
                  className="w-full text-xs p-2.5 rounded-xl border border-slate-200 bg-white"
                />
              </div>
              <div>
                <label className="text-xs font-medium text-slate-600 mb-1 block">Instruktur</label>
                <input
                  type="text"
                  placeholder="Bidan / Instruktur Bersertifikat"
                  value={data.instruktur || ''}
                  onChange={(e) => setField('instruktur', e.target.value)}
                  className="w-full text-xs p-2.5 rounded-xl border border-slate-200 bg-white"
                />
              </div>
              <div>
                <label className="text-xs font-medium text-slate-600 mb-1 block">Durasi (Menit)</label>
                <input
                  type="text"
                  placeholder="60 Menit"
                  value={data.durasi || ''}
                  onChange={(e) => setField('durasi', e.target.value)}
                  className="w-full text-xs p-2.5 rounded-xl border border-slate-200 bg-white"
                />
              </div>
              <div>
                <label className="text-xs font-medium text-slate-600 mb-1 block">Jadwal Berikutnya</label>
                <input
                  type="date"
                  value={data.jadwalBerikutnya || ''}
                  onChange={(e) => setField('jadwalBerikutnya', e.target.value)}
                  className="w-full text-xs p-2.5 rounded-xl border border-slate-200 bg-white"
                />
              </div>
              <div className="sm:col-span-2">
                <label className="text-xs font-medium text-slate-600 mb-1 block">Kondisi Sebelum</label>
                <input
                  type="text"
                  placeholder="TD 110/70, DJJ 140x/m, tidak ada keluhan"
                  value={data.kondisiSebelum || ''}
                  onChange={(e) => setField('kondisiSebelum', e.target.value)}
                  className="w-full text-xs p-2.5 rounded-xl border border-slate-200 bg-white"
                />
              </div>
              <div className="sm:col-span-2">
                <label className="text-xs font-medium text-slate-600 mb-1 block">Kondisi Setelah</label>
                <input
                  type="text"
                  placeholder="Nadi stabil, pernapasan teratur, rileks"
                  value={data.kondisiSetelah || ''}
                  onChange={(e) => setField('kondisiSetelah', e.target.value)}
                  className="w-full text-xs p-2.5 rounded-xl border border-slate-200 bg-white"
                />
              </div>
            </div>
            <div>
              <label className="text-xs font-medium text-slate-600 mb-1 block">Catatan Instruktur</label>
              <textarea
                rows={2}
                placeholder="Postur panggul, latihan pernapasan persalinan"
                value={data.catatanTerapis || ''}
                onChange={(e) => setField('catatanTerapis', e.target.value)}
                className="w-full text-xs p-2.5 rounded-xl border border-slate-200 bg-white"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
