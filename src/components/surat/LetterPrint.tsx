'use client';

import React from 'react';
import type { Letter } from '@/lib/types';
import { KOP, LETTER_META } from '@/lib/letterConfig';

function fmt(iso?: string) {
  if (!iso) return '........................';
  try {
    return new Intl.DateTimeFormat('id-ID', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    }).format(new Date(iso));
  } catch {
    return iso;
  }
}

function hari(iso?: string) {
  if (!iso) return '........................';
  try {
    return new Intl.DateTimeFormat('id-ID', { weekday: 'long' }).format(new Date(iso));
  } catch {
    return '........................';
  }
}

function Line({ label, value }: { label: string; value?: string }) {
  return (
    <div className="flex gap-2 text-[13px] leading-relaxed">
      <span className="w-32 shrink-0">{label}</span>
      <span className="w-3 shrink-0">:</span>
      <span className="flex-1 border-b border-dotted border-slate-400 min-h-[18px]">
        {value || '\u00A0'}
      </span>
    </div>
  );
}

export function LetterPrint({ letter }: { letter: Letter }) {
  const meta = LETTER_META[letter.type];
  const d = letter.data;
  const kop = KOP[meta.kop];

  return (
    <div className="bg-white text-slate-900 w-full max-w-[210mm] mx-auto p-6 sm:p-8 print:p-0 print:max-w-none">
      <img src={kop.src} alt={kop.alt} className="w-full object-contain mb-3" />

      <h1 className="text-center text-lg font-bold underline tracking-wide mb-1">
        {meta.label.toUpperCase()}
      </h1>
      <p className="text-center text-xs mb-5">No: {letter.number || '........................'}</p>

      {letter.type === 'sakit' && (
        <>
          <p className="text-[13px] leading-relaxed mb-3">
            Yang bertanda tangan di bawah ini menerangkan bahwa:
          </p>
          <div className="space-y-1 mb-4">
            <Line label="Nama" value={d.nama} />
            <Line label="Jenis Kelamin" value={d.jenisKelamin} />
            <Line label="Umur" value={d.umur} />
            <Line label="Pekerjaan" value={d.pekerjaan} />
            <Line label="Alamat" value={d.alamat} />
          </div>
          <p className="text-[13px] leading-relaxed text-justify mb-4">
            Pada pemeriksaan yang bersangkutan dalam keadaan sakit
            {d.keterangan ? ` (${d.keterangan})` : ''}, sehingga perlu istirahat
            selama <strong>{d.lamaIstirahat || '......'}</strong> hari, dari tanggal{' '}
            <strong>{fmt(d.mulaiTanggal)}</strong> sampai dengan tanggal{' '}
            <strong>{fmt(d.sampaiTanggal)}</strong>.
          </p>
          <p className="text-[13px] leading-relaxed mb-10">
            Demikianlah surat keterangan ini dibuat untuk dapat dipergunakan
            sebagaimana mestinya.
          </p>
        </>
      )}

      {letter.type === 'sehat' && (
        <>
          <p className="text-[13px] leading-relaxed mb-3">
            Yang bertanda tangan di bawah ini menerangkan bahwa:
          </p>
          <div className="space-y-1 mb-4">
            <Line label="Nama" value={d.nama} />
            <Line label="Umur" value={d.umur} />
            <Line label="Pekerjaan" value={d.pekerjaan} />
            <Line label="Alamat" value={d.alamat} />
          </div>
          <p className="text-[13px] leading-relaxed mb-3">
            Dengan hasil baik / tidak baik: <strong>{d.hasil || '................'}</strong>
          </p>
          <div className="space-y-1 mb-4">
            <Line label="Mata" value={d.mata} />
            <Line label="Telinga" value={d.telinga} />
            <Line label="Berat Badan" value={d.berat ? `${d.berat} kg` : ''} />
            <Line label="Tinggi Badan" value={d.tinggi ? `${d.tinggi} cm` : ''} />
            <Line label="Tensi" value={d.tensi ? `${d.tensi} mmHg` : ''} />
          </div>
          <p className="text-[13px] leading-relaxed mb-10">
            Surat keterangan ini berlaku selama <strong>{d.berlaku || '3 (tiga) bulan'}</strong>,
            demikian harap yang berkepentingan maklum.
          </p>
        </>
      )}

      {letter.type === 'lahir' && (
        <>
          <p className="text-[13px] leading-relaxed mb-3">
            Pada hari <strong>{d.hariLahir || hari(d.tanggalLahir)}</strong>, tanggal{' '}
            <strong>{fmt(d.tanggalLahir)}</strong> pukul{' '}
            <strong>{d.jamLahir || '......'}</strong> WIB telah lahir seorang bayi:
          </p>
          <div className="space-y-1 mb-4">
            <Line label="Jenis Kelamin" value={d.jenisKelaminBayi} />
            <Line label="Kelahiran Ke" value={d.kelahiranKe} />
            <Line label="Jenis Kelahiran" value={d.jenisKelahiran} />
            <Line label="Berat Lahir" value={d.beratLahir ? `${d.beratLahir} gram` : ''} />
            <Line label="Panjang Badan" value={d.panjangBadan ? `${d.panjangBadan} cm` : ''} />
            <Line label="Diberi Nama" value={d.namaBayi} />
          </div>
          <p className="text-[13px] font-semibold mb-2">Orang Tua:</p>
          <div className="space-y-1 mb-4">
            <Line label="Nama Ibu" value={d.namaIbu} />
            <Line label="Umur" value={d.umurIbu} />
            <Line label="NIK Ibu" value={d.nikIbu} />
            <Line label="Pekerjaan" value={d.pekerjaanIbu} />
            <Line label="Nama Ayah" value={d.namaAyah} />
            <Line label="Umur" value={d.umurAyah} />
            <Line label="NIK Ayah" value={d.nikAyah} />
            <Line label="Pekerjaan" value={d.pekerjaanAyah} />
            <Line label="Alamat" value={d.alamat} />
            <Line label="Kel/Desa" value={d.kelDesa} />
            <Line label="Kecamatan" value={d.kecamatan} />
            <Line label="Kab/Kota" value={d.kabKota} />
          </div>
          <div className="grid grid-cols-2 gap-6 text-[13px] mt-8">
            <div>
              <p>Saksi I</p>
              <div className="h-12" />
              <p className="border-t border-slate-400 pt-1">..............................</p>
            </div>
            <div>
              <p>Saksi II</p>
              <div className="h-12" />
              <p className="border-t border-slate-400 pt-1">..............................</p>
            </div>
          </div>
          <div className="mt-6 text-[13px]">
            <p>Penolong Persalinan</p>
            <div className="h-12" />
            <p className="font-semibold">{d.signer}</p>
          </div>
        </>
      )}

      {letter.type === 'cuti-hamil' && (
        <>
          <p className="text-[13px] leading-relaxed mb-3">
            Yang bertanda tangan di bawah ini BIDAN PRAKTEK SWASTA menerangkan bahwa:
          </p>
          <div className="space-y-1 mb-4">
            <Line label="Nama" value={d.nama} />
            <Line label="Umur" value={d.umur} />
            <Line label="Pekerjaan" value={d.pekerjaan} />
            <Line label="Alamat" value={d.alamat} />
          </div>
          <p className="text-[13px] leading-relaxed text-justify mb-4">
            Sesuai hasil pemeriksaan tanggal <strong>{fmt(d.tglPemeriksaan)}</strong> telah
            hamil <strong>{d.usiaKehamilan || '......'}</strong> bulan, maka perlu mendapatkan
            ijin cuti bersalin mulai tanggal <strong>{fmt(d.cutiMulai)}</strong> s/d{' '}
            <strong>{fmt(d.cutiSelesai)}</strong> (selama{' '}
            <strong>{d.lamaCuti || '......'}</strong> bulan).
          </p>
          <p className="text-[13px] leading-relaxed mb-10">
            Demikian untuk dapat dipergunakan seperlunya.
          </p>
        </>
      )}

      {letter.type === 'kematian' && (
        <>
          <p className="text-[13px] leading-relaxed mb-3">
            Yang bertanda tangan di bawah ini:
          </p>
          <div className="space-y-1 mb-4">
            <Line label="Nama" value={d.signer} />
            <Line label="Alamat Praktek" value={d.alamatPraktik} />
            <Line label="Jabatan" value={d.jabatan} />
          </div>
          <p className="text-[13px] leading-relaxed mb-3">
            Menerangkan bahwa, telah meninggal:
          </p>
          <div className="space-y-1 mb-10">
            <Line label="Nama" value={d.nama} />
            <Line label="Umur" value={d.umur} />
            <Line label="Jenis Kelamin" value={d.jenisKelamin} />
            <Line label="Alamat" value={d.alamat} />
            <Line label="Tanggal" value={fmt(d.tanggalMeninggal)} />
            <Line label="Prasangka Kematian" value={d.prasangkaKematian} />
          </div>
        </>
      )}

      <div className="flex justify-end mt-6">
        <div className="text-center text-[13px] min-w-[220px]">
          <p>Sidoarjo, {fmt(letter.date)}</p>
          <p className="mt-1">{meta.signerLabel}</p>
          <div className="h-16" />
          <p className="font-semibold underline">{d.signer || meta.defaultSigner}</p>
        </div>
      </div>
    </div>
  );
}
