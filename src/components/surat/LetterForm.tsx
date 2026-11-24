'use client';

import React, { useEffect, useMemo, useState, useRef } from 'react';
import type { Letter, Patient, Doctor } from '@/lib/types';
import { calcAge, doctorStore } from '@/lib/store';
import { LetterMeta } from '@/lib/letterConfig';
import { Save, User, Stethoscope, Search, CheckCircle2, ChevronDown, X } from 'lucide-react';

const inputCls =
  'w-full text-xs p-2.5 rounded-xl border border-slate-200 bg-white focus:ring-2 focus:ring-teal-500';
const labelCls = 'text-xs font-medium text-slate-600 mb-1 block';

function Field({
  label,
  children,
  className = '',
}: {
  label: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={className}>
      <label className={labelCls}>{label}</label>
      {children}
    </div>
  );
}

function todayISO() {
  return new Date().toISOString().slice(0, 10);
}

export interface LetterFormProps {
  meta: LetterMeta;
  initial?: Letter | null;
  patients: Patient[];
  nextNumber: string;
  onSubmit: (payload: {
    number: string;
    date: string;
    patientId: string;
    patientName: string;
    patientRM: string;
    data: Record<string, string>;
  }) => void;
  onCancel: () => void;
}

export function LetterForm({
  meta,
  initial,
  patients,
  nextNumber,
  onSubmit,
  onCancel,
}: LetterFormProps) {
  const [patientId, setPatientId] = useState(initial?.patientId ?? '');
  const [number, setNumber] = useState(initial?.number ?? nextNumber);
  const [date, setDate] = useState(initial?.date ?? todayISO());
  const [signer, setSigner] = useState(
    initial?.data?.signer || meta.defaultSigner,
  );
  const [data, setData] = useState<Record<string, string>>(initial?.data ?? {});
  const [patientSearch, setPatientSearch] = useState('');
  const [isPatientDropdownOpen, setIsPatientDropdownOpen] = useState(false);
  const patientDropdownRef = useRef<HTMLDivElement>(null);

  // Ambil daftar dokter dari doctorStore
  const doctors = useMemo(() => {
    return doctorStore.getAll();
  }, []);

  // Tutup dropdown ketika klik di luar area
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        patientDropdownRef.current &&
        !patientDropdownRef.current.contains(event.target as Node)
      ) {
        setIsPatientDropdownOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const selectedPatient = useMemo(
    () => patients.find((p) => p.id === patientId),
    [patients, patientId],
  );

  const patientOptions = useMemo(() => {
    const q = patientSearch.toLowerCase().trim();
    if (!q) return patients;
    return patients.filter(
      (p) =>
        p.name.toLowerCase().includes(q) ||
        p.rm.toLowerCase().includes(q) ||
        p.nik.includes(q),
    );
  }, [patients, patientSearch]);

  // Auto-fill identitas pasien saat pasien dipilih.
  useEffect(() => {
    if (!selectedPatient) return;
    setData((d) => ({
      ...d,
      nama: d.nama || selectedPatient.name,
      umur: d.umur || calcAge(selectedPatient.dob),
      jenisKelamin:
        d.jenisKelamin || (selectedPatient.gender === 'P' ? 'Perempuan' : 'Laki-Laki'),
      alamat: d.alamat || selectedPatient.address,
    }));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedPatient?.id]);

  const setField = (key: string, val: string) =>
    setData((d) => ({ ...d, [key]: val }));

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const patientName =
      selectedPatient?.name || data.nama || data.namaBayi || data.namaAlmarhum || '-';
    const patientRM = selectedPatient?.rm || '-';
    onSubmit({
      number,
      date,
      patientId,
      patientName,
      patientRM,
      data: { ...data, signer },
    });
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {/* Pasien & nomor */}
      <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 space-y-3">
        <p className="text-[11px] font-bold uppercase tracking-widest text-slate-500 flex items-center gap-2">
          <User className="w-3.5 h-3.5" />
          Data Surat
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <Field label="Nomor Surat">
            <input
              type="text"
              value={number}
              onChange={(e) => setNumber(e.target.value)}
              className={inputCls}
            />
          </Field>
          <Field label="Tanggal Surat">
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className={inputCls}
            />
          </Field>
          <Field label={`${meta.signerLabel}`}>
            <div className="relative">
              <select
                value={signer}
                onChange={(e) => setSigner(e.target.value)}
                className={inputCls}
              >
                {/* Opsi default/initial jika belum ada di list */}
                {signer && !doctors.some((d) => d.name === signer) && (
                  <option value={signer}>{signer}</option>
                )}
                {doctors.map((d) => (
                  <option key={d.id} value={d.name}>
                    {d.name} {d.role ? `(${d.role})` : ''}
                  </option>
                ))}
              </select>
            </div>
          </Field>
        </div>

        {/* 1 Field Dropdown Search Pasien */}
        <div className="relative" ref={patientDropdownRef}>
          <Field label="Pasien (Cari Nama / No RM / NIK)">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
              <input
                type="text"
                value={
                  isPatientDropdownOpen || patientSearch
                    ? patientSearch
                    : selectedPatient
                    ? `${selectedPatient.name} (${selectedPatient.rm}) — ${selectedPatient.insurance}`
                    : ''
                }
                onChange={(e) => {
                  setPatientSearch(e.target.value);
                  if (!isPatientDropdownOpen) setIsPatientDropdownOpen(true);
                }}
                onFocus={() => setIsPatientDropdownOpen(true)}
                placeholder="-- Pilih / Cari Pasien (Ketik nama, RM, NIK) --"
                className={`w-full text-xs pl-9 pr-16 py-2.5 rounded-xl border bg-white focus:outline-none focus:ring-2 focus:ring-teal-500 transition-all ${
                  selectedPatient && !isPatientDropdownOpen && !patientSearch
                    ? 'border-teal-400 font-semibold text-teal-950 bg-teal-50/30'
                    : 'border-slate-200 text-slate-800 placeholder-slate-400'
                }`}
              />

              <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1">
                {(selectedPatient || patientSearch) && (
                  <button
                    type="button"
                    onClick={() => {
                      setPatientId('');
                      setPatientSearch('');
                      setIsPatientDropdownOpen(true);
                    }}
                    className="p-1 text-slate-400 hover:text-red-600 rounded-lg hover:bg-slate-100 transition-colors"
                    title="Hapus / Cari Ulang"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => setIsPatientDropdownOpen((prev) => !prev)}
                  className="p-1 text-slate-400 hover:text-slate-600 rounded-lg transition-colors"
                  title="Buka / Tutup Daftar"
                >
                  <ChevronDown
                    className={`w-3.5 h-3.5 transition-transform duration-200 ${
                      isPatientDropdownOpen ? 'rotate-180 text-teal-600' : ''
                    }`}
                  />
                </button>
              </div>

              {/* Dropdown Popover List Pasien */}
              {isPatientDropdownOpen && (
                <div className="absolute left-0 right-0 top-full mt-1.5 bg-white border border-slate-200 rounded-2xl shadow-2xl z-50 max-h-64 overflow-y-auto divide-y divide-slate-100 animate-in fade-in-50 duration-150">
                  <div
                    onClick={() => {
                      setPatientId('');
                      setPatientSearch('');
                      setIsPatientDropdownOpen(false);
                    }}
                    className="px-4 py-2 text-xs text-slate-400 hover:bg-slate-50 cursor-pointer italic"
                  >
                    -- Tanpa data pasien (isi manual) --
                  </div>
                  {patientOptions.length === 0 ? (
                    <div className="p-4 text-center text-xs text-slate-400">
                      Pasien tidak ditemukan dengan kata kunci &quot;{patientSearch}&quot;
                    </div>
                  ) : (
                    patientOptions.map((p) => {
                      const isSelected = p.id === patientId;
                      return (
                        <div
                          key={p.id}
                          onClick={() => {
                            setPatientId(p.id);
                            setPatientSearch('');
                            setIsPatientDropdownOpen(false);
                          }}
                          className={`px-4 py-2.5 text-xs cursor-pointer transition-colors flex items-center justify-between gap-3 ${
                            isSelected
                              ? 'bg-teal-50 text-teal-900 font-semibold'
                              : 'hover:bg-slate-50 text-slate-800'
                          }`}
                        >
                          <div className="min-w-0">
                            <div className="flex items-center gap-2">
                              <span className="font-semibold text-slate-900 truncate">
                                {p.name}
                              </span>
                              <span className="font-mono text-[10px] font-bold px-1.5 py-0.5 rounded bg-teal-100 text-teal-800 shrink-0">
                                {p.rm}
                              </span>
                            </div>
                            <p className="text-[11px] text-slate-500 mt-0.5 truncate">
                              NIK: {p.nik} · {calcAge(p.dob)} · {p.gender === 'P' ? 'Perempuan' : 'Laki-Laki'} · {p.insurance}
                            </p>
                          </div>
                          {isSelected && (
                            <CheckCircle2 className="w-4 h-4 text-teal-600 shrink-0" />
                          )}
                        </div>
                      );
                    })
                  )}
                </div>
              )}
            </div>
          </Field>
        </div>

        {selectedPatient && (
          <p className="text-[11px] text-teal-700 bg-teal-50/70 border border-teal-200/60 rounded-xl px-3 py-1.5 flex items-center justify-between">
            <span>
              Terpilih: <strong>{selectedPatient.name}</strong> · {selectedPatient.rm} · NIK: {selectedPatient.nik} · {calcAge(selectedPatient.dob)}
            </span>
          </p>
        )}
      </div>

      {/* Field per jenis surat */}
      {meta.type === 'sakit' && (
        <div className="bg-white border border-slate-200 rounded-2xl p-4 space-y-3">
          <p className="text-[11px] font-bold uppercase tracking-widest text-slate-500 flex items-center gap-2">
            <Stethoscope className="w-3.5 h-3.5" />
            Data Pasien Sakit
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Field label="Nama">
              <input value={data.nama || ''} onChange={(e) => setField('nama', e.target.value)} className={inputCls} />
            </Field>
            <Field label="Jenis Kelamin">
              <select value={data.jenisKelamin || ''} onChange={(e) => setField('jenisKelamin', e.target.value)} className={inputCls}>
                <option value="">-- Pilih --</option>
                <option value="Laki-Laki">Laki-Laki</option>
                <option value="Perempuan">Perempuan</option>
              </select>
            </Field>
            <Field label="Umur">
              <input value={data.umur || ''} onChange={(e) => setField('umur', e.target.value)} placeholder="contoh: 30 tahun" className={inputCls} />
            </Field>
            <Field label="Pekerjaan">
              <input value={data.pekerjaan || ''} onChange={(e) => setField('pekerjaan', e.target.value)} className={inputCls} />
            </Field>
            <Field label="Alamat" className="sm:col-span-2">
              <input value={data.alamat || ''} onChange={(e) => setField('alamat', e.target.value)} className={inputCls} />
            </Field>
            <Field label="Lama Istirahat (hari)">
              <input
                type="number"
                min={1}
                value={data.lamaIstirahat || ''}
                onChange={(e) => setField('lamaIstirahat', e.target.value)}
                className={inputCls}
              />
            </Field>
            <Field label="Keterangan / Diagnosa (opsional)">
              <input value={data.keterangan || ''} onChange={(e) => setField('keterangan', e.target.value)} className={inputCls} />
            </Field>
            <Field label="Istirahat Mulai Tanggal">
              <input type="date" value={data.mulaiTanggal || ''} onChange={(e) => setField('mulaiTanggal', e.target.value)} className={inputCls} />
            </Field>
            <Field label="Istirahat Sampai Tanggal">
              <input type="date" value={data.sampaiTanggal || ''} onChange={(e) => setField('sampaiTanggal', e.target.value)} className={inputCls} />
            </Field>
          </div>
        </div>
      )}

      {meta.type === 'sehat' && (
        <div className="bg-white border border-slate-200 rounded-2xl p-4 space-y-3">
          <p className="text-[11px] font-bold uppercase tracking-widest text-slate-500 flex items-center gap-2">
            <Stethoscope className="w-3.5 h-3.5" />
            Hasil Pemeriksaan Kesehatan
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Field label="Nama">
              <input value={data.nama || ''} onChange={(e) => setField('nama', e.target.value)} className={inputCls} />
            </Field>
            <Field label="Umur">
              <input value={data.umur || ''} onChange={(e) => setField('umur', e.target.value)} className={inputCls} />
            </Field>
            <Field label="Pekerjaan">
              <input value={data.pekerjaan || ''} onChange={(e) => setField('pekerjaan', e.target.value)} className={inputCls} />
            </Field>
            <Field label="Alamat">
              <input value={data.alamat || ''} onChange={(e) => setField('alamat', e.target.value)} className={inputCls} />
            </Field>
            <Field label="Hasil Pemeriksaan">
              <select value={data.hasil || ''} onChange={(e) => setField('hasil', e.target.value)} className={inputCls}>
                <option value="">-- Pilih --</option>
                <option value="baik">Baik</option>
                <option value="tidak baik">Tidak Baik</option>
              </select>
            </Field>
            <Field label="Mata">
              <input value={data.mata || ''} onChange={(e) => setField('mata', e.target.value)} placeholder="Baik / Tidak Baik" className={inputCls} />
            </Field>
            <Field label="Telinga">
              <input value={data.telinga || ''} onChange={(e) => setField('telinga', e.target.value)} placeholder="Baik / Tidak Baik" className={inputCls} />
            </Field>
            <Field label="Berat Badan">
              <input value={data.berat || ''} onChange={(e) => setField('berat', e.target.value)} placeholder="kg" className={inputCls} />
            </Field>
            <Field label="Tinggi Badan">
              <input value={data.tinggi || ''} onChange={(e) => setField('tinggi', e.target.value)} placeholder="cm" className={inputCls} />
            </Field>
            <Field label="Tensi (mmHg)">
              <input value={data.tensi || ''} onChange={(e) => setField('tensi', e.target.value)} placeholder="120/80" className={inputCls} />
            </Field>
            <Field label="Berlaku Selama">
              <input value={data.berlaku || '3 (tiga) bulan'} onChange={(e) => setField('berlaku', e.target.value)} className={inputCls} />
            </Field>
          </div>
        </div>
      )}

      {meta.type === 'lahir' && (
        <div className="bg-white border border-slate-200 rounded-2xl p-4 space-y-3">
          <p className="text-[11px] font-bold uppercase tracking-widest text-slate-500">
            Data Kelahiran
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Field label="Nama Bayi">
              <input value={data.namaBayi || ''} onChange={(e) => setField('namaBayi', e.target.value)} className={inputCls} />
            </Field>
            <Field label="Jenis Kelamin Bayi">
              <select value={data.jenisKelaminBayi || ''} onChange={(e) => setField('jenisKelaminBayi', e.target.value)} className={inputCls}>
                <option value="">-- Pilih --</option>
                <option value="Laki-Laki">Laki-Laki</option>
                <option value="Perempuan">Perempuan</option>
              </select>
            </Field>
            <Field label="Hari Lahir">
              <input value={data.hariLahir || ''} onChange={(e) => setField('hariLahir', e.target.value)} placeholder="contoh: Selasa" className={inputCls} />
            </Field>
            <Field label="Tanggal Lahir">
              <input type="date" value={data.tanggalLahir || ''} onChange={(e) => setField('tanggalLahir', e.target.value)} className={inputCls} />
            </Field>
            <Field label="Jam Lahir">
              <input type="time" value={data.jamLahir || ''} onChange={(e) => setField('jamLahir', e.target.value)} className={inputCls} />
            </Field>
            <Field label="Kelahiran Ke">
              <input value={data.kelahiranKe || ''} onChange={(e) => setField('kelahiranKe', e.target.value)} className={inputCls} />
            </Field>
            <Field label="Jenis Kelahiran">
              <select value={data.jenisKelahiran || ''} onChange={(e) => setField('jenisKelahiran', e.target.value)} className={inputCls}>
                <option value="">-- Pilih --</option>
                <option value="Tunggal">Tunggal</option>
                <option value="Ganda">Ganda</option>
              </select>
            </Field>
            <Field label="Berat Lahir (gram)">
              <input value={data.beratLahir || ''} onChange={(e) => setField('beratLahir', e.target.value)} className={inputCls} />
            </Field>
            <Field label="Panjang Badan (cm)">
              <input value={data.panjangBadan || ''} onChange={(e) => setField('panjangBadan', e.target.value)} className={inputCls} />
            </Field>
          </div>

          <p className="text-[11px] font-bold uppercase tracking-widest text-slate-500 pt-2">Data Orang Tua</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Field label="Nama Ibu">
              <input value={data.namaIbu || ''} onChange={(e) => setField('namaIbu', e.target.value)} className={inputCls} />
            </Field>
            <Field label="Umur Ibu">
              <input value={data.umurIbu || ''} onChange={(e) => setField('umurIbu', e.target.value)} className={inputCls} />
            </Field>
            <Field label="NIK Ibu">
              <input value={data.nikIbu || ''} onChange={(e) => setField('nikIbu', e.target.value)} className={inputCls} />
            </Field>
            <Field label="Pekerjaan Ibu">
              <input value={data.pekerjaanIbu || ''} onChange={(e) => setField('pekerjaanIbu', e.target.value)} className={inputCls} />
            </Field>
            <Field label="Nama Ayah">
              <input value={data.namaAyah || ''} onChange={(e) => setField('namaAyah', e.target.value)} className={inputCls} />
            </Field>
            <Field label="Umur Ayah">
              <input value={data.umurAyah || ''} onChange={(e) => setField('umurAyah', e.target.value)} className={inputCls} />
            </Field>
            <Field label="NIK Ayah">
              <input value={data.nikAyah || ''} onChange={(e) => setField('nikAyah', e.target.value)} className={inputCls} />
            </Field>
            <Field label="Pekerjaan Ayah">
              <input value={data.pekerjaanAyah || ''} onChange={(e) => setField('pekerjaanAyah', e.target.value)} className={inputCls} />
            </Field>
            <Field label="Alamat" className="sm:col-span-2">
              <input value={data.alamat || ''} onChange={(e) => setField('alamat', e.target.value)} className={inputCls} />
            </Field>
            <Field label="Kel/Desa">
              <input value={data.kelDesa || ''} onChange={(e) => setField('kelDesa', e.target.value)} className={inputCls} />
            </Field>
            <Field label="Kecamatan">
              <input value={data.kecamatan || ''} onChange={(e) => setField('kecamatan', e.target.value)} className={inputCls} />
            </Field>
            <Field label="Kab/Kota">
              <input value={data.kabKota || ''} onChange={(e) => setField('kabKota', e.target.value)} className={inputCls} />
            </Field>
            <Field label="Saksi I">
              <input value={data.saksi1 || ''} onChange={(e) => setField('saksi1', e.target.value)} className={inputCls} />
            </Field>
            <Field label="Saksi II">
              <input value={data.saksi2 || ''} onChange={(e) => setField('saksi2', e.target.value)} className={inputCls} />
            </Field>
          </div>
        </div>
      )}

      {meta.type === 'cuti-hamil' && (
        <div className="bg-white border border-slate-200 rounded-2xl p-4 space-y-3">
          <p className="text-[11px] font-bold uppercase tracking-widest text-slate-500">
            Data Kehamilan & Cuti
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Field label="Nama">
              <input value={data.nama || ''} onChange={(e) => setField('nama', e.target.value)} className={inputCls} />
            </Field>
            <Field label="Umur">
              <input value={data.umur || ''} onChange={(e) => setField('umur', e.target.value)} className={inputCls} />
            </Field>
            <Field label="Pekerjaan">
              <input value={data.pekerjaan || ''} onChange={(e) => setField('pekerjaan', e.target.value)} className={inputCls} />
            </Field>
            <Field label="Alamat">
              <input value={data.alamat || ''} onChange={(e) => setField('alamat', e.target.value)} className={inputCls} />
            </Field>
            <Field label="Tanggal Pemeriksaan">
              <input type="date" value={data.tglPemeriksaan || ''} onChange={(e) => setField('tglPemeriksaan', e.target.value)} className={inputCls} />
            </Field>
            <Field label="Usia Kehamilan (bulan)">
              <input value={data.usiaKehamilan || ''} onChange={(e) => setField('usiaKehamilan', e.target.value)} className={inputCls} />
            </Field>
            <Field label="Cuti Mulai Tanggal">
              <input type="date" value={data.cutiMulai || ''} onChange={(e) => setField('cutiMulai', e.target.value)} className={inputCls} />
            </Field>
            <Field label="Cuti Sampai Tanggal">
              <input type="date" value={data.cutiSelesai || ''} onChange={(e) => setField('cutiSelesai', e.target.value)} className={inputCls} />
            </Field>
            <Field label="Lama Cuti (bulan)">
              <input value={data.lamaCuti || ''} onChange={(e) => setField('lamaCuti', e.target.value)} className={inputCls} />
            </Field>
          </div>
        </div>
      )}

      {meta.type === 'kematian' && (
        <div className="bg-white border border-slate-200 rounded-2xl p-4 space-y-3">
          <p className="text-[11px] font-bold uppercase tracking-widest text-slate-500">
            Data Kematian
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Field label="Nama Almarhum/Almarhumah">
              <input value={data.nama || ''} onChange={(e) => setField('nama', e.target.value)} className={inputCls} />
            </Field>
            <Field label="Umur">
              <input value={data.umur || ''} onChange={(e) => setField('umur', e.target.value)} className={inputCls} />
            </Field>
            <Field label="Jenis Kelamin">
              <select value={data.jenisKelamin || ''} onChange={(e) => setField('jenisKelamin', e.target.value)} className={inputCls}>
                <option value="">-- Pilih --</option>
                <option value="Laki-Laki">Laki-Laki</option>
                <option value="Perempuan">Perempuan</option>
              </select>
            </Field>
            <Field label="Tanggal Meninggal">
              <input type="date" value={data.tanggalMeninggal || ''} onChange={(e) => setField('tanggalMeninggal', e.target.value)} className={inputCls} />
            </Field>
            <Field label="Alamat" className="sm:col-span-2">
              <input value={data.alamat || ''} onChange={(e) => setField('alamat', e.target.value)} className={inputCls} />
            </Field>
            <Field label="Prasangka Kematian" className="sm:col-span-2">
              <input value={data.prasangkaKematian || ''} onChange={(e) => setField('prasangkaKematian', e.target.value)} className={inputCls} />
            </Field>
            <Field label="Alamat Praktik (bidan)">
              <input value={data.alamatPraktik || 'Perum Kedungturi Permai II Blok U-23 Taman Sidoarjo'} onChange={(e) => setField('alamatPraktik', e.target.value)} className={inputCls} />
            </Field>
            <Field label="Jabatan (bidan)">
              <input value={data.jabatan || 'Bidan Pemeriksa'} onChange={(e) => setField('jabatan', e.target.value)} className={inputCls} />
            </Field>
          </div>
        </div>
      )}

      <div className="flex items-center justify-end gap-2 pt-1">
        <button
          type="button"
          onClick={onCancel}
          className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition-colors"
        >
          Batal
        </button>
        <button
          type="submit"
          className="px-5 py-2.5 bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold rounded-xl transition-all shadow-md shadow-teal-600/20 flex items-center gap-1.5"
        >
          <Save className="w-4 h-4" />
          Simpan Surat
        </button>
      </div>
    </form>
  );
}
