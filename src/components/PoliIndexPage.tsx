'use client';

import { Suspense, useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { initStore, patientStore, visitStore, drugStore, idr, calcAge, fmtDate, fmtDateTime, uid } from '@/lib/store';
import type { Patient, Visit, Prescription, Drug } from '@/lib/types';
import { NewVisitModal } from '@/components/forms/NewVisitModal';
import {
  Activity,
  AlertTriangle,
  Baby,
  CalendarDays,
  CheckCircle2,
  ClipboardList,
  CreditCard,
  Eye,
  FileText,
  HeartPulse,
  Pill,
  PlusCircle,
  Scale,
  Search,
  Sparkles,
  Stethoscope,
  Users,
  X,
} from 'lucide-react';

export type PoliKey = 'ibu' | 'anak' | 'spa' | 'umum';

export interface PoliCfg {
  key: PoliKey;
  label: string;
  title: string;
  desc: string;
  path: string;
  badge: string;
  dot: string;
  match: string[];
  icon: typeof Baby;
}

export const POLI_CONFIG: Record<PoliKey, PoliCfg> = {
  ibu: {
    key: 'ibu',
    label: 'Ibu',
    title: 'Rekam Medis Poli Ibu',
    desc: 'Pemeriksaan ibu: ANC, Ibu Nifas, KB, & Kesehatan Reproduksi',
    path: '/rekam-medis/ibu/',
    badge: 'bg-pink-100 text-pink-700',
    dot: 'bg-pink-500',
    match: ['ibu', 'kia'],
    icon: HeartPulse,
  },
  anak: {
    key: 'anak',
    label: 'Anak',
    title: 'Rekam Medis Poli Anak',
    desc: 'Kunjungan anak: Kunjungan Anak (KN), MTBS, & Imunisasi',
    path: '/rekam-medis/anak/',
    badge: 'bg-violet-100 text-violet-700',
    dot: 'bg-violet-500',
    match: ['anak'],
    icon: Baby,
  },
  spa: {
    key: 'spa',
    label: 'Mom & Baby Spa',
    title: 'Rekam Medis Mom & Baby Spa',
    desc: 'Layanan pijat bayi, anak, ibu hamil, & senam ibu',
    path: '/rekam-medis/spa/',
    badge: 'bg-rose-100 text-rose-700',
    dot: 'bg-rose-500',
    match: ['spa'],
    icon: Sparkles,
  },
  umum: {
    key: 'umum',
    label: 'Umum',
    title: 'Rekam Medis Poli Umum',
    desc: 'Pemeriksaan umum: SOAP, pemeriksaan fisik, & rujukan',
    path: '/rekam-medis/umum/',
    badge: 'bg-teal-100 text-teal-700',
    dot: 'bg-teal-500',
    match: ['umum'],
    icon: Stethoscope,
  },
};

export const POLI_KEYS: PoliKey[] = ['ibu', 'anak', 'spa', 'umum'];

// ─── Helpers ──────────────────────────────────────────────────────────────────

export function belongsToPoli(visit: Visit, key: PoliKey): boolean {
  if (visit.category) return visit.category === key;
  const p = (visit.poli || '').toLowerCase();
  return POLI_CONFIG[key].match.some((m) => p.includes(m));
}

export function visitsForPoli(visits: Visit[], key: PoliKey): Visit[] {
  return visits
    .filter((v) => belongsToPoli(v, key))
    .sort((a, b) => b.date.localeCompare(a.date));
}

export { calcAge, fmtDate, fmtDateTime } from '@/lib/store';

function parseVitals(objective: string): Record<string, any> {
  try {
    return JSON.parse(objective);
  } catch {
    return {};
  }
}

const VITAL_LABEL: Record<string, string> = {
  td: 'TD (mmHg)',
  nadi: 'Nadi (/mnt)',
  suhu: 'Suhu (°C)',
  rr: 'RR (/mnt)',
  respirasi: 'RR (/mnt)',
  bb: 'BB (kg)',
  tb: 'TB (cm)',
  pb: 'PB (cm)',
  lila: 'LILA (cm)',
  tfu: 'TFU (cm)',
  djj: 'DJJ (/mnt)',
  lk: 'LK (cm)',
  usia: 'Usia',
  usiaKehamilan: 'Usia Kehamilan',
  durasi: 'Durasi',
};

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

// ─── Detail Modal (SOAP / Tanda Vital / Resep) ────────────────────────────────

export function VisitDetailModal({
  visit,
  patient,
  onClose,
  onUpdated,
}: {
  visit: Visit;
  patient?: Patient;
  onClose: () => void;
  onUpdated?: () => void;
}) {
  const cfg =
    POLI_KEYS.map((k) => POLI_CONFIG[k]).find((c) => belongsToPoli(visit, c.key)) ??
    POLI_CONFIG.umum;
  const vitals = parseVitals(visit.objective);
  const nested: Record<string, any> =
    vitals.data && typeof vitals.data === 'object' ? vitals.data : {};
  const topVitals = Object.entries(vitals).filter(
    ([k, v]) => k !== 'data' && k !== 'layanan' && v && VITAL_LABEL[k],
  );
  const dataEntries = Object.entries(nested).filter(
    ([k, v]) => k !== 'layanan' && v !== '' && v !== null && v !== undefined,
  );

  const isDrugDetailPending = Boolean(
    visit.drugDetailPending ||
      ((visit.drugGlobalFee || 0) > 0 &&
        (!visit.prescriptions || visit.prescriptions.length === 0)),
  );

  const [detailDrugs, setDetailDrugs] = useState<Array<Prescription & { _key: string }>>([]);
  const [detailDrugSearch, setDetailDrugSearch] = useState('');
  const allDrugs = useMemo(() => drugStore.getAll(), []);

  useEffect(() => {
    setDetailDrugs([]);
    setDetailDrugSearch('');
  }, [visit.id]);

  const filteredDetailDrugs = useMemo(
    () =>
      allDrugs.filter((d) =>
        d.name.toLowerCase().includes(detailDrugSearch.toLowerCase()),
      ),
    [allDrugs, detailDrugSearch],
  );

  function addDetailDrug(drug: Drug) {
    if (detailDrugs.find((d) => d.drugId === drug.id)) return;
    setDetailDrugs((prev) => [
      ...prev,
      {
        _key: uid(),
        drugId: drug.id,
        drugName: drug.name,
        quantity: 1,
        unit: drug.unit,
        dosage: '3x1 sesudah makan',
        pricePerUnit: drug.sellPrice,
      },
    ]);
  }
  function removeDetailDrug(key: string) {
    setDetailDrugs((prev) => prev.filter((d) => d._key !== key));
  }
  function updateDetailDrug(key: string, field: 'quantity' | 'dosage', val: string | number) {
    setDetailDrugs((prev) =>
      prev.map((d) =>
        d._key === key
          ? { ...d, [field]: field === 'quantity' ? Number(val) : val }
          : d,
      ),
    );
  }
  function saveDrugDetail() {
    if (detailDrugs.length === 0) return;
    detailDrugs.forEach((rx) => drugStore.deductStock(rx.drugId, rx.quantity));
    visitStore.update({
      ...visit,
      prescriptions: detailDrugs.map(({ _key: _k, ...rest }) => rest),
      drugGlobalFee: 0,
      drugDetailPending: false,
    });
    onUpdated?.();
    onClose();
  }

  const Section = ({ title, children }: { title: string; children: React.ReactNode }) => (
    <div className="bg-white p-4 rounded-2xl border border-slate-200">
      <p className="text-[11px] font-bold text-slate-500 uppercase tracking-widest mb-2">
        {title}
      </p>
      <div className="text-sm text-slate-700 space-y-1">{children}</div>
    </div>
  );

  return (
    <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-3 sm:p-4 backdrop-blur-sm">
      <div className="bg-slate-50 rounded-2xl shadow-2xl w-full max-w-3xl max-h-[92vh] flex flex-col overflow-hidden">
        {/* Header */}
        <div className="px-5 py-4 bg-slate-900 text-white flex items-start justify-between gap-3">
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <h2 className="text-base font-bold">Detail Rekam Medis</h2>
              <span className={`text-[11px] px-2.5 py-0.5 rounded-full font-bold ${cfg.badge}`}>
                {visit.poli}
                {visit.subCategory ? ` — ${visit.subCategory}` : ''}
              </span>
              <PaymentBadge status={visit.paymentStatus} />
            </div>
            <p className="text-xs text-slate-400 mt-1">{fmtDateTime(visit.date)}</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-xl hover:bg-slate-800 text-slate-400 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-4">
          {/* Patient strip */}
          {patient && (
            <div className="rounded-2xl border border-slate-200 bg-white p-4 flex flex-wrap items-center gap-x-5 gap-y-1 text-xs text-slate-500">
              <span className="text-sm font-bold text-slate-800">{patient.name}</span>
              <span className="font-mono">{patient.rm}</span>
              <span>NIK: {patient.nik}</span>
              <span>{calcAge(patient.dob)} · {patient.gender === 'P' ? 'Perempuan' : 'Laki-Laki'}</span>
              <span>Penjamin: <strong className="text-slate-700">{patient.insurance}</strong></span>
              <span>
                Alergi:{' '}
                <strong className={patient.allergy && patient.allergy !== '-' ? 'text-red-600' : 'text-slate-700'}>
                  {patient.allergy || '-'}
                </strong>
              </span>
            </div>
          )}

          {/* SOAP */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Section title="S — Subjective (Keluhan)">
              <p>{visit.subjective || '-'}</p>
            </Section>

            <Section title="O — Objective (Tanda Vital)">
              {topVitals.length > 0 ? (
                <div className="flex flex-wrap gap-2">
                  {topVitals.map(([k, v]) => (
                    <span
                      key={k}
                      className="inline-flex items-center gap-1 rounded-xl bg-slate-50 border border-slate-200 px-2.5 py-1 text-xs font-semibold text-slate-700"
                    >
                      {k === 'td' && <HeartPulse className="w-3.5 h-3.5 text-red-400" />}
                      {k === 'suhu' && <Scale className="w-3.5 h-3.5 text-orange-400" />}
                      <span className="text-slate-400 font-medium">{VITAL_LABEL[k]}:</span>
                      {String(v)}
                    </span>
                  ))}
                </div>
              ) : (
                <p className="text-slate-400">-</p>
              )}
              {dataEntries.length > 0 && (
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 pt-1">
                  {dataEntries.map(([k, v]) => (
                    <div key={k} className="bg-slate-50 p-2 rounded-xl border border-slate-100">
                      <span className="text-slate-400 font-medium block uppercase text-[10px]">{k}</span>
                      <span className="font-semibold text-slate-800 text-xs">{String(v)}</span>
                    </div>
                  ))}
                </div>
              )}
            </Section>

            <Section title="A — Assessment (Diagnosa)">
              <p className="font-semibold text-slate-800">{visit.assessment || '-'}</p>
              {visit.icdCode && (
                <p className="text-xs text-slate-500 font-mono">ICD-10: {visit.icdCode}</p>
              )}
            </Section>

            <Section title="P — Plan (Tindakan & Terapi)">
              <p>{visit.plan || '-'}</p>
              {visit.controlDate && (
                <p className="text-xs text-slate-500 flex items-center gap-1">
                  <CalendarDays className="w-3.5 h-3.5 text-blue-500" />
                  Kontrol: <strong>{fmtDate(visit.controlDate)}</strong>
                </p>
              )}
            </Section>
          </div>

          {/* Lengkapi Detail Obat (jika masih global) */}
          {isDrugDetailPending && (
            <div className="bg-white p-4 rounded-2xl border border-slate-200 space-y-3">
              <p className="text-[11px] font-bold text-slate-500 uppercase tracking-widest">
                Lengkapi Detail Obat (Biaya Global: {idr(visit.drugGlobalFee || 0)})
              </p>
              <p className="text-xs text-slate-500">
                Obat belum dirinci. Cari dan tambahkan obat yang sebenarnya; total tagihan tidak berubah.
              </p>
              <input
                type="text"
                placeholder="Ketik nama obat untuk mencari..."
                value={detailDrugSearch}
                onChange={(e) => setDetailDrugSearch(e.target.value)}
                className="w-full text-xs p-2.5 rounded-xl border border-slate-200 bg-white focus:ring-2 focus:ring-teal-500"
              />
              {detailDrugSearch && (
                <div className="bg-white border border-slate-200 rounded-xl max-h-40 overflow-y-auto divide-y shadow-lg">
                  {filteredDetailDrugs.length === 0 ? (
                    <p className="p-3 text-xs text-slate-400 text-center">Obat tidak ditemukan</p>
                  ) : (
                    filteredDetailDrugs.map((d) => (
                      <button
                        key={d.id}
                        type="button"
                        onClick={() => addDetailDrug(d)}
                        className="w-full text-left p-2.5 hover:bg-slate-50 text-xs flex justify-between items-center transition-colors"
                      >
                        <div>
                          <span className="font-bold text-slate-800">{d.name}</span>
                          <span className="text-slate-400 ml-2">({d.unit}) · Stok: {d.stock}</span>
                        </div>
                        <span className="font-bold text-teal-600">{idr(d.sellPrice)}</span>
                      </button>
                    ))
                  )}
                </div>
              )}
              {detailDrugs.length > 0 && (
                <div className="space-y-2">
                  {detailDrugs.map((rx) => (
                    <div
                      key={rx._key}
                      className="p-3 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-between gap-3 text-xs"
                    >
                      <div className="flex-1 min-w-0">
                        <p className="font-bold text-slate-800 truncate">{rx.drugName}</p>
                        <p className="text-slate-500">{idr(rx.pricePerUnit)} / {rx.unit}</p>
                      </div>
                      <div className="w-20">
                        <input
                          type="number"
                          min={1}
                          value={rx.quantity}
                          onChange={(e) => updateDetailDrug(rx._key, 'quantity', e.target.value)}
                          className="w-full p-1.5 border border-slate-200 rounded-lg text-center font-bold bg-white"
                        />
                      </div>
                      <div className="flex-1">
                        <input
                          type="text"
                          placeholder="Aturan pakai"
                          value={rx.dosage}
                          onChange={(e) => updateDetailDrug(rx._key, 'dosage', e.target.value)}
                          className="w-full p-1.5 border border-slate-200 rounded-lg bg-white"
                        />
                      </div>
                      <span className="font-bold text-slate-700 min-w-[70px] text-right">
                        {idr(rx.quantity * rx.pricePerUnit)}
                      </span>
                      <button
                        type="button"
                        onClick={() => removeDetailDrug(rx._key)}
                        className="p-1 text-red-500 hover:text-red-700 rounded-lg hover:bg-red-50"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
              <button
                type="button"
                onClick={saveDrugDetail}
                disabled={detailDrugs.length === 0}
                className="w-full bg-teal-600 hover:bg-teal-700 disabled:opacity-50 disabled:cursor-not-allowed text-white text-xs font-bold py-2 rounded-xl transition-all"
              >
                Simpan Detail Obat
              </button>
            </div>
          )}

          {/* Resep */}
          <div className="bg-white p-4 rounded-2xl border border-slate-200">
            <p className="text-[11px] font-bold text-slate-500 uppercase tracking-widest mb-2">
              Resep Obat ({visit.prescriptions.length})
            </p>
            {visit.prescriptions.length === 0 ? (
              <p className="text-xs text-slate-400 italic">Tidak ada resep obat</p>
            ) : (
              <div className="space-y-1.5">
                {visit.prescriptions.map((rx, i) => (
                  <div
                    key={i}
                    className="flex items-center justify-between gap-3 text-sm bg-slate-50 border border-slate-200 rounded-xl px-3 py-2"
                  >
                    <div className="flex items-center gap-2 min-w-0">
                      <Pill className="w-4 h-4 text-teal-500 shrink-0" />
                      <span className="font-medium text-slate-700 truncate">{rx.drugName}</span>
                      <span className="text-slate-500 text-xs shrink-0">
                        {rx.quantity} {rx.unit} — {rx.dosage}
                      </span>
                    </div>
                    <span className="text-slate-600 font-medium font-mono text-xs shrink-0">
                      {idr(rx.quantity * rx.pricePerUnit)}
                    </span>
                  </div>
                ))}
              </div>
            )}
            {visit.notes && (
              <p className="text-xs text-slate-500 mt-2">Catatan: {visit.notes}</p>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="px-5 py-4 bg-white border-t border-slate-200 flex flex-wrap items-center justify-between gap-3">
          <div className="text-xs text-slate-500 flex flex-wrap items-center gap-x-4 gap-y-1">
            <span>
              Konsultasi:{' '}
              <strong className="text-slate-700 font-mono">{idr(visit.konsultasiFee ?? 0)}</strong>
            </span>
            <span>
              Total Biaya:{' '}
              <strong className="text-slate-700 font-mono text-sm">{idr(visit.totalBill)}</strong>
            </span>
            <PaymentBadge status={visit.paymentStatus} />
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition-colors"
            >
              Tutup
            </button>
            <Link
              href={`/kasir/?patientId=${visit.patientId}`}
              className="px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold rounded-xl transition-all flex items-center gap-1.5 shadow-sm"
            >
              <CreditCard className="w-3.5 h-3.5" />
              Kasir
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Content (dijalankan di dalam Suspense karena pakai useSearchParams) ─────

function PoliContent({ cfg }: { cfg: PoliCfg }) {
  const searchParams = useSearchParams();
  const [patients, setPatients] = useState<Patient[]>([]);
  const [visits, setVisits] = useState<Visit[]>([]);
  const [query, setQuery] = useState('');
  const [loaded, setLoaded] = useState(false);
  const [lockedPatientId, setLockedPatientId] = useState<string | undefined>();
  const [showAdd, setShowAdd] = useState(false);
  const [detail, setDetail] = useState<Visit | null>(null);
  const [saved, setSaved] = useState<Visit | null>(null);

  const load = () => {
    initStore();
    setPatients(patientStore.getAll());
    setVisits(visitStore.getAll());
    setLoaded(true);
  };

  useEffect(() => {
    load();
    const pid = searchParams.get('patientId');
    if (pid && patientStore.get(pid)) {
      setLockedPatientId(pid);
      setShowAdd(true);
    } else if (searchParams.get('tambah')) {
      setShowAdd(true);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams]);

  useEffect(() => {
    if (!saved) return;
    const t = setTimeout(() => setSaved(null), 6000);
    return () => clearTimeout(t);
  }, [saved]);

  const patientById = useMemo(
    () => Object.fromEntries(patients.map((p) => [p.id, p])),
    [patients],
  );

  const poliVisits = useMemo(() => visitsForPoli(visits, cfg.key), [visits, cfg.key]);

  const filtered = useMemo(() => {
    const q = query.toLowerCase().trim();
    if (!q) return poliVisits;
    return poliVisits.filter((v) => {
      const p = patientById[v.patientId];
      return (
        (p?.rm.toLowerCase().includes(q) ?? false) ||
        (p?.name.toLowerCase().includes(q) ?? false) ||
        v.assessment.toLowerCase().includes(q) ||
        (v.subCategory ?? '').toLowerCase().includes(q)
      );
    });
  }, [poliVisits, query, patientById]);

  const stats = useMemo(() => {
    const unpaid = poliVisits.filter((v) => v.paymentStatus === 'unpaid');
    return {
      kunjungan: poliVisits.length,
      pasien: new Set(poliVisits.map((v) => v.patientId)).size,
      belumBayar: unpaid.length,
      total: poliVisits.reduce((s, v) => s + (v.totalBill ?? 0), 0),
    };
  }, [poliVisits]);

  const statCards = [
    { label: 'Kunjungan', value: String(stats.kunjungan), icon: ClipboardList, cls: 'text-slate-700 bg-slate-100' },
    { label: 'Pasien', value: String(stats.pasien), icon: Users, cls: 'text-blue-600 bg-blue-100' },
    { label: 'Belum Bayar', value: String(stats.belumBayar), icon: AlertTriangle, cls: 'text-red-600 bg-red-100' },
    { label: 'Total Biaya', value: idr(stats.total), icon: CheckCircle2, cls: 'text-teal-600 bg-teal-100' },
  ];

  const Icon = cfg.icon;

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Toast sukses */}
      {saved && (
        <div className="fixed top-5 right-5 z-[60] bg-slate-900 text-white rounded-2xl p-4 shadow-2xl flex items-center gap-4 border border-teal-500/40 max-w-md">
          <div className="w-10 h-10 rounded-xl bg-teal-500 flex items-center justify-center shrink-0">
            <CheckCircle2 className="w-6 h-6 text-white" />
          </div>
          <div className="min-w-0">
            <p className="text-sm font-bold text-white">Rekam Medis Berhasil Disimpan!</p>
            <p className="text-xs text-slate-400">Tagihan otomatis diteruskan ke modul kasir.</p>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <Link
              href={`/kasir/?patientId=${saved.patientId}`}
              className="bg-teal-600 hover:bg-teal-500 text-white px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 shadow-md"
            >
              <CreditCard className="w-3.5 h-3.5" />
              Kasir
            </Link>
            <button
              type="button"
              onClick={() => setSaved(null)}
              className="text-slate-400 hover:text-white p-1 text-xs"
            >
              ✕
            </button>
          </div>
        </div>
      )}

      {/* Header poli */}
      <div className="bg-white border-b border-slate-200 px-6 py-5">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <div className="flex items-center gap-2.5 flex-wrap">
                <span className={`w-10 h-10 rounded-2xl ${cfg.badge} flex items-center justify-center`}>
                  <Icon className="w-5 h-5" />
                </span>
                <h1 className="text-2xl font-bold text-slate-800">{cfg.title}</h1>
                <span className={`inline rounded-full px-2.5 py-0.5 text-xs font-bold ${cfg.badge}`}>
                  {cfg.label}
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-1.5">{cfg.desc}</p>
            </div>

            <button
              type="button"
              onClick={() => setShowAdd(true)}
              className="bg-teal-600 hover:bg-teal-700 text-white px-4 py-2.5 rounded-xl text-xs font-bold flex items-center gap-2 transition-all shadow-md shadow-teal-600/20"
            >
              <PlusCircle className="w-4 h-4" />
              Tambah Rekam Medis {cfg.label}
            </button>
          </div>

          {/* Statistik ringkas poli */}
          <div className="mt-4 grid grid-cols-2 lg:grid-cols-4 gap-3">
            {statCards.map((s) => (
              <div
                key={s.label}
                className="rounded-2xl border border-slate-200 bg-slate-50/70 p-3.5 flex items-center gap-3"
              >
                <div className={`rounded-xl p-2 ${s.cls}`}>
                  <s.icon className="w-4 h-4" />
                </div>
                <div className="min-w-0">
                  <p className="text-[11px] text-slate-500">{s.label}</p>
                  <p className="text-base font-bold text-slate-800 truncate">{s.value}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Konten */}
      <div className="max-w-7xl mx-auto p-4 sm:p-6 space-y-4">
        {/* Search bar */}
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Cari No RM, nama pasien, atau diagnosa..."
            className="w-full border border-slate-200 rounded-xl pl-9 pr-3 py-2.5 text-xs bg-white shadow-sm focus:ring-2 focus:ring-teal-500"
          />
        </div>

        {!loaded ? (
          <div className="rounded-2xl border border-slate-200 bg-white p-12 text-center text-xs text-slate-400">
            Memuat rekam medis {cfg.label}...
          </div>
        ) : filtered.length === 0 ? (
          /* Empty state */
          <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-12 text-center space-y-3">
            <div className={`w-16 h-16 rounded-3xl ${cfg.badge} flex items-center justify-center mx-auto`}>
              <FileText className="w-8 h-8" />
            </div>
            <div>
              <p className="text-sm font-bold text-slate-700">
                {query
                  ? 'Rekam medis tidak ditemukan'
                  : `Belum ada rekam medis di Poli ${cfg.label}`}
              </p>
              <p className="text-xs text-slate-400 mt-1">
                {query
                  ? 'Coba kata kunci lain (No RM, nama, atau diagnosa)'
                  : 'Mulai catat kunjungan pertama pasien di poli ini'}
              </p>
            </div>
            {!query && (
              <button
                type="button"
                onClick={() => setShowAdd(true)}
                className="inline-flex items-center gap-2 bg-teal-600 hover:bg-teal-700 text-white px-4 py-2.5 rounded-xl text-xs font-bold transition-all shadow-md shadow-teal-600/20"
              >
                <PlusCircle className="w-4 h-4" />
                Tambah Rekam Medis Pertama
              </button>
            )}
          </div>
        ) : (
          /* Tabel rekam medis poli */
          <div className="rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden">
            <div className="px-5 py-3 border-b border-slate-100 flex items-center justify-between">
              <span className="text-xs font-bold text-slate-600 uppercase tracking-wider">
                Tabel Rekam Medis {cfg.label} ({filtered.length})
              </span>
              <span className={`w-2.5 h-2.5 rounded-full ${cfg.dot}`} />
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-slate-100 bg-slate-50/60">
                    {[
                      'Tanggal & Waktu',
                      'No RM',
                      'Nama Pasien',
                      'Layanan / Sub-Layanan',
                      'Dokter / Bidan / Terapis',
                      'Diagnosa / Keluhan Utama',
                    ].map((h) => (
                      <th
                        key={h}
                        className="text-left px-4 py-3 text-[11px] font-semibold text-slate-500 uppercase tracking-widest whitespace-nowrap"
                      >
                        {h}
                      </th>
                    ))}
                    <th className="text-right px-4 py-3 text-[11px] font-semibold text-slate-500 uppercase tracking-widest whitespace-nowrap">
                      Total Biaya
                    </th>
                    <th className="text-left px-4 py-3 text-[11px] font-semibold text-slate-500 uppercase tracking-widest whitespace-nowrap">
                      Status Pembayaran
                    </th>
                    <th className="text-right px-4 py-3 text-[11px] font-semibold text-slate-500 uppercase tracking-widest whitespace-nowrap">
                      Aksi
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {filtered.map((v) => {
                    const p = patientById[v.patientId];
                    return (
                      <tr key={v.id} className="hover:bg-slate-50/70 transition-colors align-top">
                        <td className="px-4 py-3.5 whitespace-nowrap text-xs font-semibold text-slate-800">
                          {fmtDateTime(v.date)}
                        </td>
                        <td className="px-4 py-3.5 font-mono text-xs text-slate-600 whitespace-nowrap">
                          {p?.rm ?? '-'}
                        </td>
                        <td className="px-4 py-3.5 font-medium text-slate-800 whitespace-nowrap">
                          {p?.name ?? '-'}
                          <span className="block text-[11px] font-normal text-slate-400">
                            {p ? `${calcAge(p.dob)} · ${p.insurance}` : ''}
                          </span>
                        </td>
                        <td className="px-4 py-3.5">
                          <span
                            className={`inline rounded-full px-2.5 py-0.5 text-[11px] font-bold ${cfg.badge}`}
                          >
                            {v.subCategory || v.poli}
                          </span>
                          {v.subCategory && (
                            <span className="block text-[11px] text-slate-400 mt-1">{v.poli}</span>
                          )}
                        </td>
                        <td className="px-4 py-3.5 text-xs text-slate-700 whitespace-nowrap">
                          {v.doctorName || '-'}
                        </td>
                        <td className="px-4 py-3.5 max-w-[240px]">
                          <p className="text-xs font-semibold text-slate-800 line-clamp-2">
                            {v.assessment || '-'}
                          </p>
                          <p className="text-[11px] text-slate-500 line-clamp-1">{v.subjective}</p>
                        </td>
                        <td className="px-4 py-3.5 text-right font-mono text-xs font-bold text-slate-800 whitespace-nowrap">
                          {idr(v.totalBill)}
                        </td>
                        <td className="px-4 py-3.5 whitespace-nowrap">
                          <PaymentBadge status={v.paymentStatus} />
                        </td>
                        <td className="px-4 py-3.5">
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              type="button"
                              onClick={() => setDetail(v)}
                              className="flex items-center gap-1 bg-white border border-slate-200 hover:bg-teal-50 hover:border-teal-300 hover:text-teal-700 text-slate-600 px-2.5 py-1.5 rounded-lg text-[11px] font-bold transition-colors whitespace-nowrap"
                            >
                              <Eye className="w-3.5 h-3.5" />
                              Lihat Detail
                            </button>
                            <Link
                              href={`/kasir/?patientId=${v.patientId}`}
                              className="flex items-center gap-1 bg-teal-600 hover:bg-teal-700 text-white px-2.5 py-1.5 rounded-lg text-[11px] font-bold transition-colors shadow-sm whitespace-nowrap"
                            >
                              <CreditCard className="w-3.5 h-3.5" />
                              Kasir
                            </Link>
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

      {/* Modal tambah rekam medis */}
      {showAdd && (
        <NewVisitModal
          patientId={lockedPatientId}
          initialPoli={cfg.key}
          lockPoli
          onClose={() => setShowAdd(false)}
          onSave={(v) => {
            load();
            setSaved(v);
            setShowAdd(false);
          }}
        />
      )}

      {/* Modal detail */}
      {detail && (
        <VisitDetailModal
          visit={detail}
          patient={patientById[detail.patientId]}
          onClose={() => setDetail(null)}
          onUpdated={() => {
            load();
            setDetail(null);
          }}
        />
      )}
    </div>
  );
}

export function PoliIndexPage({ poli }: { poli: PoliKey }) {
  return (
    <Suspense
      fallback={
        <div className="p-10 text-center text-xs text-slate-400">Memuat Rekam Medis...</div>
      }
    >
      <PoliContent cfg={POLI_CONFIG[poli]} />
    </Suspense>
  );
}
