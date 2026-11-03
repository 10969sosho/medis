'use client';

import React, { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { initStore, letterStore, fmtDate } from '@/lib/store';
import type { Letter } from '@/lib/types';
import { LETTER_META, LETTER_TYPES } from '@/lib/letterConfig';
import { LetterPrint } from './LetterPrint';
import {
  FileText,
  ArrowRight,
  Search,
  Printer,
  X,
  Eye,
  CalendarDays,
  Stethoscope,
  Baby,
  HeartPulse,
  Cross,
  ClipboardList,
} from 'lucide-react';

const ICONS = {
  sakit: Stethoscope,
  sehat: HeartPulse,
  lahir: Baby,
  'cuti-hamil': ClipboardList,
  kematian: Cross,
} as const;

export function SuratIndexPage() {
  const [letters, setLetters] = useState<Letter[]>([]);
  const [loaded, setLoaded] = useState(false);
  const [query, setQuery] = useState('');
  const [preview, setPreview] = useState<Letter | null>(null);

  useEffect(() => {
    initStore();
    setLetters(letterStore.getAll());
    setLoaded(true);
  }, []);

  const filtered = useMemo(() => {
    const q = query.toLowerCase().trim();
    if (!q) return letters;
    return letters.filter(
      (l) =>
        l.number.toLowerCase().includes(q) ||
        l.patientName.toLowerCase().includes(q) ||
        l.patientRM.toLowerCase().includes(q) ||
        LETTER_META[l.type].label.toLowerCase().includes(q) ||
        fmtDate(l.date).toLowerCase().includes(q),
    );
  }, [letters, query]);

  const byType = useMemo(
    () =>
      Object.fromEntries(
        LETTER_TYPES.map((t) => [t, letters.filter((l) => l.type === t).length]),
      ) as Record<string, number>,
    [letters],
  );

  function handlePrint() {
    window.print();
  }

  return (
    <>
      <style>{`
        @media print {
          body * { visibility: hidden !important; }
          .letter-print, .letter-print * { visibility: visible !important; }
          .letter-print {
            position: fixed !important;
            left: 0; top: 0;
            width: 100%;
            padding: 0;
          }
          .no-print { display: none !important; }
        }
      `}</style>

      <div className="min-h-screen bg-slate-50 p-4 sm:p-6 space-y-5">
        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm">
          <div className="flex items-start gap-3">
            <span className="w-11 h-11 rounded-2xl bg-teal-50 text-teal-600 flex items-center justify-center">
              <FileText className="w-5 h-5" />
            </span>
            <div>
              <h1 className="text-xl sm:text-2xl font-bold text-slate-800">Surat Keterangan</h1>
              <p className="text-xs text-slate-500 mt-1">
                Kelola surat sakit, sehat, lahir, cuti hamil, dan kematian. Tersimpan sebagai
                riwayat dan siap dicetak.
              </p>
            </div>
          </div>
        </div>

        {/* Kartu jenis surat */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-3">
          {LETTER_TYPES.map((t) => {
            const meta = LETTER_META[t];
            const Icon = ICONS[t];
            return (
              <Link
                key={t}
                href={`/surat/${meta.slug}/`}
                className="group bg-white border border-slate-200 rounded-2xl p-4 hover:border-teal-300 hover:shadow-md transition-all"
              >
                <div className="flex items-start justify-between">
                  <span className="w-9 h-9 rounded-xl bg-teal-50 text-teal-600 flex items-center justify-center">
                    <Icon className="w-4 h-4" />
                  </span>
                  <span className="text-xs font-bold text-slate-400 group-hover:text-teal-600">
                    {byType[t] ?? 0}
                  </span>
                </div>
                <p className="mt-3 text-sm font-bold text-slate-800 leading-snug">{meta.label}</p>
                <p className="text-[11px] text-slate-400 mt-1 line-clamp-2">{meta.description}</p>
                <p className="mt-3 text-[11px] font-semibold text-teal-600 flex items-center gap-1">
                  Buka <ArrowRight className="w-3 h-3" />
                </p>
              </Link>
            );
          })}
        </div>

        {/* Search */}
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Cari nomor surat, nama pasien, jenis surat, atau tanggal..."
            className="w-full border border-slate-200 rounded-xl pl-9 pr-3 py-2.5 text-xs bg-white shadow-sm focus:ring-2 focus:ring-teal-500"
          />
        </div>

        {/* Riwayat semua surat */}
        {!loaded ? (
          <div className="rounded-2xl border border-slate-200 bg-white p-12 text-center text-xs text-slate-400">
            Memuat surat...
          </div>
        ) : filtered.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-12 text-center space-y-3">
            <div className="w-16 h-16 rounded-3xl bg-teal-50 text-teal-600 flex items-center justify-center mx-auto">
              <FileText className="w-8 h-8" />
            </div>
            <div>
              <p className="text-sm font-bold text-slate-700">
                {query ? 'Surat tidak ditemukan' : 'Belum ada surat'}
              </p>
              <p className="text-xs text-slate-400 mt-1">
                {query ? 'Coba kata kunci lain.' : 'Pilih jenis surat di atas untuk membuat surat baru.'}
              </p>
            </div>
          </div>
        ) : (
          <div className="rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden">
            <div className="px-5 py-3 border-b border-slate-100 flex items-center justify-between">
              <span className="text-xs font-bold text-slate-600 uppercase tracking-wider">
                Riwayat Semua Surat ({filtered.length})
              </span>
              <span className="w-2.5 h-2.5 rounded-full bg-teal-500" />
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-slate-100 bg-slate-50/60">
                    {['Tanggal', 'Jenis Surat', 'Nomor', 'Pasien', 'No RM', 'Aksi'].map((h) => (
                      <th
                        key={h}
                        className={`px-4 py-3 text-[11px] font-semibold text-slate-500 uppercase tracking-widest whitespace-nowrap ${
                          h === 'Aksi' ? 'text-right' : 'text-left'
                        }`}
                      >
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {filtered.map((l) => {
                    const meta = LETTER_META[l.type];
                    return (
                      <tr key={l.id} className="hover:bg-slate-50/70 transition-colors align-top">
                        <td className="px-4 py-3.5 text-xs font-semibold text-slate-800 whitespace-nowrap">
                          {fmtDate(l.date)}
                        </td>
                        <td className="px-4 py-3.5">
                          <span className="inline rounded-full px-2.5 py-0.5 text-[11px] font-bold bg-teal-50 text-teal-700">
                            {meta.shortLabel}
                          </span>
                        </td>
                        <td className="px-4 py-3.5 font-mono text-xs text-slate-600 whitespace-nowrap">
                          {l.number}
                        </td>
                        <td className="px-4 py-3.5 font-medium text-slate-800 whitespace-nowrap">
                          {l.patientName}
                        </td>
                        <td className="px-4 py-3.5 font-mono text-xs text-slate-500 whitespace-nowrap">
                          {l.patientRM}
                        </td>
                        <td className="px-4 py-3.5">
                          <div className="flex items-center justify-end">
                            <button
                              type="button"
                              onClick={() => setPreview(l)}
                              className="flex items-center gap-1 bg-white border border-slate-200 hover:bg-teal-50 hover:border-teal-300 hover:text-teal-700 text-slate-600 px-2.5 py-1.5 rounded-lg text-[11px] font-bold transition-colors whitespace-nowrap"
                            >
                              <Eye className="w-3.5 h-3.5" />
                              Lihat / Cetak
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {/* Preview / print modal */}
      {preview && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-3 sm:p-4 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[92vh] flex flex-col overflow-hidden">
            <div className="no-print px-6 py-4 bg-slate-900 text-white flex items-center justify-between">
              <div>
                <h2 className="text-base font-bold">Preview {LETTER_META[preview.type].label}</h2>
                <p className="text-xs text-slate-400 mt-0.5">No. {preview.number}</p>
              </div>
              <button
                type="button"
                onClick={() => setPreview(null)}
                className="p-1.5 rounded-xl hover:bg-slate-800 text-slate-400 hover:text-white transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto p-4 sm:p-6 bg-slate-100">
              <div className="letter-print">
                <LetterPrint letter={preview} />
              </div>
            </div>
            <div className="no-print px-6 py-4 bg-white border-t border-slate-200 flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => setPreview(null)}
                className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition-colors"
              >
                Tutup
              </button>
              <button
                type="button"
                onClick={handlePrint}
                className="px-5 py-2.5 bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold rounded-xl transition-all shadow-md shadow-teal-600/20 flex items-center gap-1.5"
              >
                <Printer className="w-4 h-4" />
                Cetak Surat
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
