'use client';

import React, { useEffect, useMemo, useState } from 'react';
import { initStore, letterStore, patientStore, fmtDate, uid } from '@/lib/store';
import type { Letter, Patient } from '@/lib/types';
import { LetterMeta } from '@/lib/letterConfig';
import { LetterForm } from './LetterForm';
import { LetterPrint } from './LetterPrint';
import {
  FileText,
  PlusCircle,
  Search,
  Printer,
  Trash2,
  X,
  Eye,
  CalendarDays,
  User,
  ClipboardList,
} from 'lucide-react';

export function LetterPage({ meta }: { meta: LetterMeta }) {
  const [letters, setLetters] = useState<Letter[]>([]);
  const [patients, setPatients] = useState<Patient[]>([]);
  const [loaded, setLoaded] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [preview, setPreview] = useState<Letter | null>(null);
  const [query, setQuery] = useState('');
  const [nextNumber, setNextNumber] = useState('');

  const load = () => {
    initStore();
    setLetters(letterStore.getAll().filter((l) => l.type === meta.type));
    setPatients(patientStore.getAll());
    setNextNumber(letterStore.nextNumber(meta.prefix));
    setLoaded(true);
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [meta.type]);

  const filtered = useMemo(() => {
    const q = query.toLowerCase().trim();
    if (!q) return letters;
    return letters.filter(
      (l) =>
        l.number.toLowerCase().includes(q) ||
        l.patientName.toLowerCase().includes(q) ||
        l.patientRM.toLowerCase().includes(q) ||
        fmtDate(l.date).toLowerCase().includes(q),
    );
  }, [letters, query]);

  function handleSave(payload: {
    number: string;
    date: string;
    patientId: string;
    patientName: string;
    patientRM: string;
    data: Record<string, string>;
  }) {
    const letter: Letter = {
      id: uid(),
      type: meta.type,
      number: payload.number,
      patientId: payload.patientId,
      patientName: payload.patientName,
      patientRM: payload.patientRM,
      date: payload.date,
      data: payload.data,
      createdAt: new Date().toISOString(),
    };
    letterStore.add(letter);
    load();
    setShowForm(false);
    setPreview(letter);
  }

  function handleDelete(letter: Letter) {
    if (!window.confirm(`Hapus ${meta.label} No. ${letter.number}?`)) return;
    letterStore.delete(letter.id);
    load();
  }

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
        {/* Header */}
        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div className="flex items-start gap-3">
              <span className="w-11 h-11 rounded-2xl bg-teal-50 text-teal-600 flex items-center justify-center">
                <FileText className="w-5 h-5" />
              </span>
              <div>
                <h1 className="text-xl sm:text-2xl font-bold text-slate-800">{meta.label}</h1>
                <p className="text-xs text-slate-500 mt-1">{meta.description}</p>
                <p className="text-[11px] text-slate-400 mt-1">
                  Kop: {meta.kop === 'al-faruq' ? 'Klinik Medis Al Faruq' : 'Praktek Mandiri Bidan Mulyani'}
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setShowForm(true)}
              className="bg-teal-600 hover:bg-teal-700 text-white px-4 py-2.5 rounded-xl text-xs font-bold flex items-center gap-2 transition-all shadow-md shadow-teal-600/20"
            >
              <PlusCircle className="w-4 h-4" />
              Buat {meta.label}
            </button>
          </div>

          <div className="mt-4 grid grid-cols-2 sm:grid-cols-3 gap-3">
            <div className="rounded-2xl border border-slate-200 bg-slate-50/70 p-3.5 flex items-center gap-3">
              <div className="rounded-xl p-2 text-slate-700 bg-slate-100">
                <ClipboardList className="w-4 h-4" />
              </div>
              <div>
                <p className="text-[11px] text-slate-500">Total Surat</p>
                <p className="text-base font-bold text-slate-800">{letters.length}</p>
              </div>
            </div>
            <div className="rounded-2xl border border-slate-200 bg-slate-50/70 p-3.5 flex items-center gap-3">
              <div className="rounded-xl p-2 text-blue-600 bg-blue-100">
                <User className="w-4 h-4" />
              </div>
              <div>
                <p className="text-[11px] text-slate-500">Pasien</p>
                <p className="text-base font-bold text-slate-800">
                  {new Set(letters.map((l) => l.patientId).filter(Boolean)).size}
                </p>
              </div>
            </div>
            <div className="rounded-2xl border border-slate-200 bg-slate-50/70 p-3.5 flex items-center gap-3 col-span-2 sm:col-span-1">
              <div className="rounded-xl p-2 text-teal-600 bg-teal-100">
                <CalendarDays className="w-4 h-4" />
              </div>
              <div>
                <p className="text-[11px] text-slate-500">Surat Hari Ini</p>
                <p className="text-base font-bold text-slate-800">
                  {letters.filter((l) => l.date === new Date().toISOString().slice(0, 10)).length}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Search */}
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Cari nomor surat, nama pasien, No RM, atau tanggal..."
            className="w-full border border-slate-200 rounded-xl pl-9 pr-3 py-2.5 text-xs bg-white shadow-sm focus:ring-2 focus:ring-teal-500"
          />
        </div>

        {/* List */}
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
                {query ? 'Surat tidak ditemukan' : `Belum ada ${meta.label}`}
              </p>
              <p className="text-xs text-slate-400 mt-1">
                {query ? 'Coba kata kunci lain.' : 'Buat surat pertama untuk pasien.'}
              </p>
            </div>
            {!query && (
              <button
                type="button"
                onClick={() => setShowForm(true)}
                className="inline-flex items-center gap-2 bg-teal-600 hover:bg-teal-700 text-white px-4 py-2.5 rounded-xl text-xs font-bold transition-all shadow-md shadow-teal-600/20"
              >
                <PlusCircle className="w-4 h-4" />
                Buat {meta.label}
              </button>
            )}
          </div>
        ) : (
          <div className="rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden">
            <div className="px-5 py-3 border-b border-slate-100 flex items-center justify-between">
              <span className="text-xs font-bold text-slate-600 uppercase tracking-wider">
                Riwayat {meta.label} ({filtered.length})
              </span>
              <span className="w-2.5 h-2.5 rounded-full bg-teal-500" />
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-slate-100 bg-slate-50/60">
                    {['Tanggal', 'Nomor Surat', 'Pasien', 'No RM', 'Dibuat', 'Aksi'].map((h) => (
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
                  {filtered.map((l) => (
                    <tr key={l.id} className="hover:bg-slate-50/70 transition-colors align-top">
                      <td className="px-4 py-3.5 text-xs font-semibold text-slate-800 whitespace-nowrap">
                        {fmtDate(l.date)}
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
                      <td className="px-4 py-3.5 text-xs text-slate-500 whitespace-nowrap">
                        {new Intl.DateTimeFormat('id-ID', {
                          dateStyle: 'medium',
                          timeStyle: 'short',
                        }).format(new Date(l.createdAt))}
                      </td>
                      <td className="px-4 py-3.5">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            type="button"
                            onClick={() => setPreview(l)}
                            className="flex items-center gap-1 bg-white border border-slate-200 hover:bg-teal-50 hover:border-teal-300 hover:text-teal-700 text-slate-600 px-2.5 py-1.5 rounded-lg text-[11px] font-bold transition-colors whitespace-nowrap"
                          >
                            <Eye className="w-3.5 h-3.5" />
                            Lihat / Cetak
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDelete(l)}
                            className="p-1.5 text-red-500 hover:text-red-700 rounded-lg hover:bg-red-50"
                            title="Hapus surat"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {/* Form modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-3 sm:p-4 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[92vh] flex flex-col overflow-hidden">
            <div className="px-6 py-4 bg-slate-900 text-white flex items-center justify-between">
              <div>
                <h2 className="text-base font-bold">{meta.label}</h2>
                <p className="text-xs text-slate-400 mt-0.5">
                  {meta.kop === 'al-faruq' ? 'Kop Klinik Medis Al Faruq' : 'Kop Praktek Mandiri Bidan Mulyani'}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setShowForm(false)}
                className="p-1.5 rounded-xl hover:bg-slate-800 text-slate-400 hover:text-white transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto p-6 bg-slate-50/50">
              <LetterForm
                meta={meta}
                patients={patients}
                nextNumber={nextNumber}
                onSubmit={handleSave}
                onCancel={() => setShowForm(false)}
              />
            </div>
          </div>
        </div>
      )}

      {/* Preview / print modal */}
      {preview && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-3 sm:p-4 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[92vh] flex flex-col overflow-hidden">
            <div className="no-print px-6 py-4 bg-slate-900 text-white flex items-center justify-between">
              <div>
                <h2 className="text-base font-bold">Preview {meta.label}</h2>
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
