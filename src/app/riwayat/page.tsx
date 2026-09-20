'use client';

import { useEffect, useState, useCallback } from 'react';
import {
  Search,
  User,
  Phone,
  MapPin,
  Droplets,
  AlertTriangle,
  Calendar,
  ChevronDown,
  ChevronUp,
  Printer,
  ClipboardList,
  Pill,
  Stethoscope,
  Activity,
  CreditCard,
  RotateCcw,
  FileText,
} from 'lucide-react';
import {
  initStore,
  patientStore,
  visitStore,
  fmtDate,
  idr,
} from '@/lib/store';
import type { Patient, Visit } from '@/lib/types';

// ─── helpers ────────────────────────────────────────────────────────────────

function calcAge(dob: string): string {
  const birth = new Date(dob);
  const today = new Date();
  let years = today.getFullYear() - birth.getFullYear();
  const m = today.getMonth() - birth.getMonth();
  if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) years--;
  if (years < 2) {
    const months =
      (today.getFullYear() - birth.getFullYear()) * 12 +
      (today.getMonth() - birth.getMonth());
    return `${months} bln`;
  }
  return `${years} thn`;
}

function fmtDateTime(iso: string): string {
  return new Intl.DateTimeFormat('id-ID', {
    dateStyle: 'long',
    timeStyle: 'short',
  }).format(new Date(iso));
}

function parseVital(raw: string): Record<string, string> {
  try {
    return JSON.parse(raw);
  } catch {
    return {};
  }
}

// ─── poli colors ────────────────────────────────────────────────────────────

const POLI_STYLE: Record<string, { badge: string; border: string }> = {
  'Poli Umum': { badge: 'bg-blue-100 text-blue-700', border: 'border-l-blue-400' },
  'Poli KIA':  { badge: 'bg-pink-100 text-pink-700', border: 'border-l-pink-400' },
  'Poli Gigi': { badge: 'bg-purple-100 text-purple-700', border: 'border-l-purple-400' },
  'Farmasi':   { badge: 'bg-teal-100 text-teal-700', border: 'border-l-teal-400' },
};

function getPoliStyle(poli: string) {
  return (
    POLI_STYLE[poli] ?? {
      badge: 'bg-slate-100 text-slate-600',
      border: 'border-l-slate-300',
    }
  );
}

// ─── insurance badge ────────────────────────────────────────────────────────

function insuranceBadge(ins: string) {
  if (ins === 'BPJS')
    return (
      <span className="inline-flex items-center rounded-full bg-blue-100 px-2.5 py-0.5 text-xs font-medium text-blue-700">
        BPJS
      </span>
    );
  if (ins === 'Asuransi')
    return (
      <span className="inline-flex items-center rounded-full bg-violet-100 px-2.5 py-0.5 text-xs font-medium text-violet-700">
        Asuransi
      </span>
    );
  return (
    <span className="inline-flex items-center rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-medium text-slate-600">
      Umum
    </span>
  );
}

// ─── single visit card ───────────────────────────────────────────────────────

interface VisitCardProps {
  visit: Visit;
  defaultOpen: boolean;
}

function VisitCard({ visit, defaultOpen }: VisitCardProps) {
  const [open, setOpen] = useState(defaultOpen);
  const { badge, border } = getPoliStyle(visit.poli);
  const vital = parseVital(visit.objective);

  return (
    <div
      className={`rounded-2xl border border-slate-200 bg-white shadow-sm border-l-4 ${border} overflow-hidden print:break-inside-avoid`}
    >
      {/* header */}
      <div className="flex items-start justify-between gap-3 px-5 pt-4 pb-3">
        <div className="flex flex-wrap items-center gap-2 min-w-0">
          <Calendar className="h-4 w-4 shrink-0 text-slate-400" />
          <span className="text-sm font-semibold text-slate-800">
            {fmtDateTime(visit.date)}
          </span>
          <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${badge}`}>
            {visit.poli}
          </span>
        </div>
        <button
          onClick={() => setOpen((p) => !p)}
          className="shrink-0 rounded-lg p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600 print:hidden"
          aria-label={open ? 'Collapse' : 'Expand'}
        >
          {open ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
        </button>
      </div>

      {/* doctor */}
      <div className="flex items-center gap-2 px-5 pb-3">
        <Stethoscope className="h-3.5 w-3.5 text-teal-500 shrink-0" />
        <span className="text-xs text-slate-500">{visit.doctorName}</span>
      </div>

      {/* collapsed summary */}
      {!open && (
        <div className="px-5 pb-4">
          <p className="text-xs text-slate-500 line-clamp-1">
            <span className="font-semibold text-slate-700">A: </span>
            {visit.assessment}
            {visit.icdCode && (
              <span className="ml-1.5 rounded bg-slate-100 px-1.5 py-0.5 font-mono text-[10px] text-slate-500">
                {visit.icdCode}
              </span>
            )}
          </p>
        </div>
      )}

      {/* expanded detail */}
      {open && (
        <div className="space-y-4 border-t border-slate-100 px-5 py-4">
          {/* S */}
          <div>
            <p className="mb-1 text-xs font-semibold uppercase tracking-widest text-slate-500">
              S — Subjektif
            </p>
            <p className="rounded-xl bg-slate-50 px-3 py-2 text-sm text-slate-700 leading-relaxed">
              {visit.subjective}
            </p>
          </div>

          {/* O */}
          <div>
            <p className="mb-1 text-xs font-semibold uppercase tracking-widest text-slate-500">
              O — Objektif / Tanda Vital
            </p>
            <div className="flex flex-wrap gap-2 rounded-xl bg-slate-50 px-3 py-2">
              {vital.td && (
                <span className="flex items-center gap-1 text-xs text-slate-700">
                  <Activity className="h-3 w-3 text-red-400" />
                  <span className="font-medium">TD:</span> {vital.td} mmHg
                </span>
              )}
              {vital.nadi && (
                <span className="text-xs text-slate-700">
                  <span className="font-medium">Nadi:</span> {vital.nadi} ×/mnt
                </span>
              )}
              {vital.suhu && (
                <span className="text-xs text-slate-700">
                  <span className="font-medium">Suhu:</span> {vital.suhu} °C
                </span>
              )}
              {vital.rr && (
                <span className="text-xs text-slate-700">
                  <span className="font-medium">RR:</span> {vital.rr} ×/mnt
                </span>
              )}
              {vital.bb && (
                <span className="text-xs text-slate-700">
                  <span className="font-medium">BB:</span> {vital.bb} kg
                </span>
              )}
              {vital.tb && (
                <span className="text-xs text-slate-700">
                  <span className="font-medium">TB:</span> {vital.tb} cm
                </span>
              )}
              {Object.keys(vital).length === 0 && (
                <span className="text-xs text-slate-400 italic">—</span>
              )}
            </div>
          </div>

          {/* A */}
          <div>
            <p className="mb-1 text-xs font-semibold uppercase tracking-widest text-slate-500">
              A — Assessment / Diagnosis
            </p>
            <div className="flex flex-wrap items-center gap-2 rounded-xl bg-slate-50 px-3 py-2">
              <span className="text-sm text-slate-700">{visit.assessment}</span>
              {visit.icdCode && (
                <span className="rounded bg-slate-200 px-1.5 py-0.5 font-mono text-[10px] font-medium text-slate-600">
                  ICD: {visit.icdCode}
                </span>
              )}
            </div>
          </div>

          {/* P */}
          <div>
            <p className="mb-1 text-xs font-semibold uppercase tracking-widest text-slate-500">
              P — Plan / Tindakan
            </p>
            <p className="rounded-xl bg-slate-50 px-3 py-2 text-sm text-slate-700 leading-relaxed">
              {visit.plan}
            </p>
          </div>

          {/* Prescriptions */}
          {visit.prescriptions && visit.prescriptions.length > 0 && (
            <div>
              <p className="mb-2 flex items-center gap-1.5 text-xs font-semibold uppercase tracking-widest text-slate-500">
                <Pill className="h-3.5 w-3.5 text-teal-500" />
                Resep Obat
              </p>
              <div className="space-y-1.5 rounded-xl bg-slate-50 px-3 py-2">
                {visit.prescriptions.map((rx, i) => (
                  <div key={i} className="flex items-start gap-2 text-sm">
                    <span className="mt-0.5 h-1.5 w-1.5 shrink-0 rounded-full bg-teal-400" />
                    <span className="text-slate-800 font-medium">{rx.drugName}</span>
                    <span className="text-slate-500">
                      × {rx.quantity} {rx.unit}
                    </span>
                    {rx.dosage && (
                      <span className="text-slate-400 italic">({rx.dosage})</span>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* notes */}
          {visit.notes && (
            <div className="flex items-start gap-2 rounded-xl border border-amber-100 bg-amber-50 px-3 py-2">
              <FileText className="h-3.5 w-3.5 mt-0.5 text-amber-500 shrink-0" />
              <p className="text-xs text-amber-700">{visit.notes}</p>
            </div>
          )}

          {/* billing */}
          <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-slate-100 bg-slate-50 px-3 py-2">
            <div className="flex items-center gap-2">
              <CreditCard className="h-4 w-4 text-slate-400" />
              <span className="text-sm font-semibold text-slate-800">
                {idr(visit.totalBill)}
              </span>
              {visit.paymentMethod && (
                <span className="text-xs text-slate-500">via {visit.paymentMethod}</span>
              )}
            </div>
            <span
              className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                visit.paymentStatus === 'paid'
                  ? 'bg-emerald-100 text-emerald-700'
                  : 'bg-red-100 text-red-600'
              }`}
            >
              {visit.paymentStatus === 'paid' ? 'Lunas' : 'Belum Lunas'}
            </span>
          </div>

          {/* control date */}
          {visit.controlDate && (
            <div className="flex items-center gap-2 rounded-xl border border-teal-100 bg-teal-50 px-3 py-2">
              <RotateCcw className="h-3.5 w-3.5 text-teal-500 shrink-0" />
              <p className="text-xs text-teal-700">
                <span className="font-semibold">Jadwal Kontrol Berikutnya:</span>{' '}
                {fmtDate(visit.controlDate)}
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ─── main page ───────────────────────────────────────────────────────────────

export default function RiwayatPage() {
  const [allPatients, setAllPatients] = useState<Patient[]>([]);
  const [query, setQuery] = useState('');
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [visits, setVisits] = useState<Visit[]>([]);

  useEffect(() => {
    initStore();
    setAllPatients(patientStore.getAll());
  }, []);

  const filtered = allPatients.filter((p) => {
    if (!query.trim()) return true;
    const q = query.toLowerCase();
    return (
      p.name.toLowerCase().includes(q) ||
      p.rm.toLowerCase().includes(q) ||
      p.nik.includes(q) ||
      p.phone.includes(q)
    );
  });

  const selectedPatient = selectedId
    ? allPatients.find((p) => p.id === selectedId) ?? null
    : null;

  const handleSelect = useCallback((id: string) => {
    setSelectedId(id);
    setVisits(visitStore.getByPatient(id));
  }, []);

  const handlePrint = () => window.print();

  const initials = (name: string) =>
    name
      .split(' ')
      .slice(0, 2)
      .map((w) => w[0])
      .join('')
      .toUpperCase();

  const hasAllergy = (a?: string) => a && a.trim() !== '' && a.trim() !== '-';

  return (
    <>
      {/* print styles */}
      <style>{`
        @media print {
          .no-print { display: none !important; }
          body { background: white; }
        }
      `}</style>

      <div className="flex h-full min-h-screen gap-0 bg-slate-50">
        {/* ── LEFT PANEL ─────────────────────────────────────────── */}
        <aside className="no-print flex w-80 shrink-0 flex-col border-r border-slate-200 bg-white">
          {/* header */}
          <div className="border-b border-slate-100 px-4 pt-6 pb-4">
            <h1 className="text-2xl font-bold text-slate-800">Riwayat Pasien</h1>
            <p className="mt-0.5 text-xs text-slate-500">
              Rekam medis & riwayat kunjungan
            </p>
          </div>

          {/* search */}
          <div className="px-4 py-3 border-b border-slate-100">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Nama, RM, NIK, No HP..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                className="w-full border border-slate-200 rounded-xl pl-9 pr-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
              />
            </div>
            <p className="mt-2 text-xs text-slate-400">
              {filtered.length} pasien ditemukan
            </p>
          </div>

          {/* patient list */}
          <div className="flex-1 overflow-y-auto">
            {filtered.length === 0 ? (
              <div className="flex flex-col items-center justify-center gap-2 py-16 text-slate-400">
                <User className="h-8 w-8" />
                <p className="text-sm">Tidak ada pasien</p>
              </div>
            ) : (
              <ul className="divide-y divide-slate-100">
                {filtered.map((p) => {
                  const visitCount = visitStore.getByPatient(p.id).length;
                  const active = selectedId === p.id;
                  return (
                    <li key={p.id}>
                      <button
                        onClick={() => handleSelect(p.id)}
                        className={`w-full text-left px-4 py-3 transition-colors hover:bg-slate-50 ${
                          active ? 'bg-teal-50 border-l-4 border-l-teal-500' : ''
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          {/* avatar */}
                          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-teal-600 text-xs font-bold text-white">
                            {initials(p.name)}
                          </div>
                          <div className="min-w-0 flex-1">
                            <p
                              className={`truncate text-sm font-semibold ${
                                active ? 'text-teal-700' : 'text-slate-800'
                              }`}
                            >
                              {p.name}
                            </p>
                            <p className="text-xs text-slate-500">{p.rm}</p>
                            <div className="mt-1 flex flex-wrap items-center gap-1.5">
                              <span
                                className={`inline-flex rounded-full px-2 py-0.5 text-[10px] font-medium ${
                                  p.gender === 'L'
                                    ? 'bg-sky-100 text-sky-700'
                                    : 'bg-rose-100 text-rose-600'
                                }`}
                              >
                                {p.gender === 'L' ? 'Laki-laki' : 'Perempuan'}
                              </span>
                              <span className="text-[10px] text-slate-400">
                                {calcAge(p.dob)}
                              </span>
                              {insuranceBadge(p.insurance)}
                              <span className="text-[10px] text-slate-400">
                                {visitCount} kunjungan
                              </span>
                            </div>
                          </div>
                        </div>
                      </button>
                    </li>
                  );
                })}
              </ul>
            )}
          </div>
        </aside>

        {/* ── RIGHT PANEL ────────────────────────────────────────── */}
        <main className="flex-1 overflow-y-auto">
          {!selectedPatient ? (
            /* empty state */
            <div className="flex h-full min-h-[60vh] flex-col items-center justify-center gap-4 text-slate-400">
              <ClipboardList className="h-16 w-16 text-slate-200" />
              <p className="text-lg font-medium text-slate-400">
                Pilih pasien untuk melihat riwayat lengkap
              </p>
              <p className="text-sm text-slate-400">
                Gunakan kolom pencarian di sebelah kiri
              </p>
            </div>
          ) : (
            <div className="mx-auto max-w-3xl space-y-6 px-6 py-6">
              {/* print button */}
              <div className="no-print flex justify-end">
                <button
                  onClick={handlePrint}
                  className="flex items-center gap-2 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 px-4 py-2 rounded-xl text-sm font-medium shadow-sm transition-colors"
                >
                  <Printer className="h-4 w-4" />
                  Cetak Riwayat
                </button>
              </div>

              {/* ─ Patient Identity Card ─ */}
              <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                {/* top row */}
                <div className="flex items-start gap-4">
                  <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-teal-600 text-xl font-bold text-white shadow">
                    {initials(selectedPatient.name)}
                  </div>
                  <div className="min-w-0 flex-1">
                    <h2 className="text-xl font-bold text-slate-800">
                      {selectedPatient.name}
                    </h2>
                    <p className="text-sm text-slate-500 font-medium">
                      {selectedPatient.rm}
                    </p>
                    <div className="mt-1 flex flex-wrap gap-2">
                      <span
                        className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium ${
                          selectedPatient.gender === 'L'
                            ? 'bg-sky-100 text-sky-700'
                            : 'bg-rose-100 text-rose-600'
                        }`}
                      >
                        {selectedPatient.gender === 'L' ? '♂ Laki-laki' : '♀ Perempuan'}
                      </span>
                      {insuranceBadge(selectedPatient.insurance)}
                      {hasAllergy(selectedPatient.allergy) && (
                        <span className="inline-flex items-center gap-1 rounded-full bg-red-100 px-2.5 py-0.5 text-xs font-semibold text-red-700">
                          <AlertTriangle className="h-3 w-3" />
                          Alergi: {selectedPatient.allergy}
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* divider */}
                <div className="my-4 border-t border-slate-100" />

                {/* detail grid */}
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                  <div className="flex items-start gap-2">
                    <User className="mt-0.5 h-4 w-4 shrink-0 text-slate-400" />
                    <div>
                      <p className="text-[10px] font-semibold uppercase tracking-widest text-slate-400">
                        NIK
                      </p>
                      <p className="text-sm text-slate-700 font-mono">
                        {selectedPatient.nik}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-2">
                    <Calendar className="mt-0.5 h-4 w-4 shrink-0 text-slate-400" />
                    <div>
                      <p className="text-[10px] font-semibold uppercase tracking-widest text-slate-400">
                        Tanggal Lahir &amp; Usia
                      </p>
                      <p className="text-sm text-slate-700">
                        {fmtDate(selectedPatient.dob)}{' '}
                        <span className="text-slate-400">({calcAge(selectedPatient.dob)})</span>
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-2">
                    <Droplets className="mt-0.5 h-4 w-4 shrink-0 text-slate-400" />
                    <div>
                      <p className="text-[10px] font-semibold uppercase tracking-widest text-slate-400">
                        Golongan Darah
                      </p>
                      <p className="text-sm text-slate-700">
                        {selectedPatient.bloodType || '—'}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-2">
                    <AlertTriangle
                      className={`mt-0.5 h-4 w-4 shrink-0 ${
                        hasAllergy(selectedPatient.allergy)
                          ? 'text-red-500'
                          : 'text-slate-400'
                      }`}
                    />
                    <div>
                      <p className="text-[10px] font-semibold uppercase tracking-widest text-slate-400">
                        Alergi
                      </p>
                      {hasAllergy(selectedPatient.allergy) ? (
                        <p className="text-sm font-semibold text-red-600">
                          {selectedPatient.allergy}
                        </p>
                      ) : (
                        <p className="text-sm text-slate-400 italic">Tidak ada</p>
                      )}
                    </div>
                  </div>

                  <div className="flex items-start gap-2">
                    <Phone className="mt-0.5 h-4 w-4 shrink-0 text-slate-400" />
                    <div>
                      <p className="text-[10px] font-semibold uppercase tracking-widest text-slate-400">
                        No HP
                      </p>
                      <p className="text-sm text-slate-700">
                        {selectedPatient.phone}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-2 sm:col-span-1">
                    <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-slate-400" />
                    <div>
                      <p className="text-[10px] font-semibold uppercase tracking-widest text-slate-400">
                        Alamat
                      </p>
                      <p className="text-sm text-slate-700">
                        {selectedPatient.address}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* ─ Visit Timeline ─ */}
              <div>
                <div className="mb-3 flex items-center justify-between">
                  <p className="text-xs font-semibold uppercase tracking-widest text-slate-500">
                    Riwayat Kunjungan ({visits.length})
                  </p>
                </div>

                {visits.length === 0 ? (
                  <div className="rounded-2xl border border-slate-200 bg-white p-10 text-center shadow-sm">
                    <ClipboardList className="mx-auto mb-2 h-10 w-10 text-slate-200" />
                    <p className="text-sm text-slate-400">Belum ada kunjungan tercatat</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {visits.map((v, idx) => (
                      <VisitCard
                        key={v.id}
                        visit={v}
                        defaultOpen={idx === 0}
                      />
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}
        </main>
      </div>
    </>
  );
}
