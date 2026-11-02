'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { initStore, patientStore, visitStore, idr } from '@/lib/store';
import type { Patient, Visit } from '@/lib/types';
import {
  POLI_CONFIG,
  POLI_KEYS,
  calcAge,
  fmtDateTime,
  visitsForPoli,
  VisitDetailModal,
} from '@/components/PoliIndexPage';
import { FileText, PlusCircle, ChevronRight, Eye } from 'lucide-react';

function PaymentBadge({ status }: { status: Visit['paymentStatus'] }) {
  return status === 'paid' ? (
    <span className="inline rounded-full bg-emerald-100 px-2.5 py-0.5 text-xs font-medium text-emerald-700">
      Lunas
    </span>
  ) : (
    <span className="inline rounded-full bg-red-100 px-2.5 py-0.5 text-xs font-medium text-red-600">
      Belum Bayar
    </span>
  );
}

export default function RekamMedisHubPage() {
  const [patients, setPatients] = useState<Patient[]>([]);
  const [visits, setVisits] = useState<Visit[]>([]);
  const [loaded, setLoaded] = useState(false);
  const [detail, setDetail] = useState<Visit | null>(null);

  useEffect(() => {
    initStore();
    setPatients(patientStore.getAll());
    setVisits(visitStore.getAll());
    setLoaded(true);
  }, []);

  const patientById = useMemo(
    () => Object.fromEntries(patients.map((p) => [p.id, p])),
    [patients],
  );

  const recent = useMemo(
    () => [...visits].sort((a, b) => b.date.localeCompare(a.date)).slice(0, 8),
    [visits],
  );

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <div className="bg-white border-b border-slate-200 px-6 py-5">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
              <FileText className="w-7 h-7 text-teal-600" />
              Rekam Medis
            </h1>
            <p className="text-xs text-slate-500 mt-0.5">
              Dashboard ringkasan rekam medis seluruh poli: Ibu, Anak, Mom &amp; Baby Spa, dan Umum
            </p>
          </div>
          <div className="text-right">
            <p className="text-[11px] text-slate-400 uppercase tracking-widest font-bold">
              Total Kunjungan
            </p>
            <p className="text-2xl font-black text-slate-800 font-mono">{visits.length}</p>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto p-4 sm:p-6 space-y-6">
        {/* 4 Card Poli */}
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
          {POLI_KEYS.map((key) => {
            const cfg = POLI_CONFIG[key];
            const list = visitsForPoli(visits, key);
            const stat = {
              kunjungan: list.length,
              pasien: new Set(list.map((v) => v.patientId)).size,
              belumBayar: list.filter((v) => v.paymentStatus === 'unpaid').length,
              total: list.reduce((s, v) => s + (v.totalBill ?? 0), 0),
            };
            const Icon = cfg.icon;
            return (
              <div
                key={key}
                className="rounded-2xl border border-slate-200 bg-white shadow-sm p-5 flex flex-col gap-4"
              >
                <div className="flex items-start justify-between gap-2">
                  <div className={`w-11 h-11 rounded-2xl ${cfg.badge} flex items-center justify-center`}>
                    <Icon className="w-5 h-5" />
                  </div>
                  <span className={`inline rounded-full px-2.5 py-0.5 text-[11px] font-bold ${cfg.badge}`}>
                    {cfg.label}
                  </span>
                </div>

                <div>
                  <p className="text-sm font-bold text-slate-800">{cfg.title}</p>
                  <p className="text-[11px] text-slate-400 leading-snug mt-0.5 line-clamp-2">
                    {cfg.desc}
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-2 text-center">
                  <div className="bg-slate-50 rounded-xl py-2 border border-slate-100">
                    <p className="text-lg font-black text-slate-800 font-mono">{stat.kunjungan}</p>
                    <p className="text-[10px] text-slate-500 uppercase tracking-wider">Kunjungan</p>
                  </div>
                  <div className="bg-slate-50 rounded-xl py-2 border border-slate-100">
                    <p className="text-lg font-black text-slate-800 font-mono">{stat.pasien}</p>
                    <p className="text-[10px] text-slate-500 uppercase tracking-wider">Pasien</p>
                  </div>
                  <div className="bg-red-50 rounded-xl py-2 border border-red-100">
                    <p className="text-lg font-black text-red-600 font-mono">{stat.belumBayar}</p>
                    <p className="text-[10px] text-red-400 uppercase tracking-wider">Belum Bayar</p>
                  </div>
                  <div className="bg-teal-50 rounded-xl py-2 border border-teal-100">
                    <p className="text-sm font-black text-teal-700 font-mono leading-6">
                      {idr(stat.total)}
                    </p>
                    <p className="text-[10px] text-teal-500 uppercase tracking-wider">Total Biaya</p>
                  </div>
                </div>

                <div className="flex items-center gap-2 mt-auto">
                  <Link
                    href={cfg.path}
                    className="flex-1 inline-flex items-center justify-center gap-1.5 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 px-3 py-2 rounded-xl text-xs font-bold transition-colors"
                  >
                    Buka Poli
                    <ChevronRight className="w-3.5 h-3.5" />
                  </Link>
                  <Link
                    href={`${cfg.path}?tambah=1`}
                    className="flex-1 inline-flex items-center justify-center gap-1.5 bg-teal-600 hover:bg-teal-700 text-white px-3 py-2 rounded-xl text-xs font-bold transition-all shadow-sm shadow-teal-600/20"
                  >
                    <PlusCircle className="w-3.5 h-3.5" />
                    Tambah RM
                  </Link>
                </div>
              </div>
            );
          })}
        </div>

        {/* Rekam medis terbaru */}
        <div className="rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden">
          <div className="px-5 py-3.5 border-b border-slate-100 flex items-center justify-between">
            <span className="text-xs font-bold text-slate-600 uppercase tracking-wider">
              Rekam Medis Terbaru
            </span>
            <span className="text-[11px] text-slate-400">{recent.length} data</span>
          </div>

          {!loaded ? (
            <div className="p-10 text-center text-xs text-slate-400">Memuat rekam medis...</div>
          ) : recent.length === 0 ? (
            <div className="p-10 text-center space-y-2">
              <FileText className="w-8 h-8 text-slate-300 mx-auto" />
              <p className="text-xs text-slate-500">Belum ada rekam medis tersimpan</p>
            </div>
          ) : (
            <ul className="divide-y divide-slate-50">
              {recent.map((v) => {
                const cfg =
                  POLI_KEYS.map((k) => POLI_CONFIG[k]).find((c) => {
                    if (v.category) return c.key === v.category;
                    return c.match.some((m) => (v.poli || '').toLowerCase().includes(m));
                  }) ?? POLI_CONFIG.umum;
                const p = patientById[v.patientId];
                return (
                  <li
                    key={v.id}
                    className="px-5 py-3 flex flex-wrap items-center gap-x-4 gap-y-1.5 hover:bg-slate-50/70 transition-colors"
                  >
                    <span className="text-xs font-semibold text-slate-700 w-40 shrink-0">
                      {fmtDateTime(v.date)}
                    </span>
                    <span className={`inline rounded-full px-2.5 py-0.5 text-[11px] font-bold ${cfg.badge} shrink-0`}>
                      {v.subCategory || v.poli}
                    </span>
                    <span className="text-sm font-medium text-slate-800 min-w-0 truncate">
                      {p?.name ?? '-'}
                      <span className="text-[11px] font-normal text-slate-400 font-mono ml-1.5">
                        {p?.rm ?? ''}
                      </span>
                    </span>
                    <span className="text-xs text-slate-500 min-w-0 flex-1 truncate">
                      {v.assessment}
                      {p ? ` · ${calcAge(p.dob)}` : ''}
                    </span>
                    <span className="font-mono text-xs font-bold text-slate-700 shrink-0">
                      {idr(v.totalBill)}
                    </span>
                    <PaymentBadge status={v.paymentStatus} />
                    <button
                      type="button"
                      onClick={() => setDetail(v)}
                      className="flex items-center gap-1 bg-white border border-slate-200 hover:bg-teal-50 hover:border-teal-300 hover:text-teal-700 text-slate-600 px-2.5 py-1.5 rounded-lg text-[11px] font-bold transition-colors shrink-0"
                    >
                      <Eye className="w-3.5 h-3.5" />
                      Detail
                    </button>
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      </div>

      {detail && (
        <VisitDetailModal
          visit={detail}
          patient={patientById[detail.patientId]}
          onClose={() => setDetail(null)}
        />
      )}
    </div>
  );
}
