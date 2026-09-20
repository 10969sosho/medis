'use client';

import { useEffect, useState, useMemo } from 'react';
import {
  initStore,
  patientStore,
  visitStore,
  drugStore,
  uid,
  idr,
} from '@/lib/store';
import type { Patient, Visit, Drug, Prescription } from '@/lib/types';
import {
  Search,
  UserCircle2,
  ChevronDown,
  ChevronUp,
  PlusCircle,
  X,
  Stethoscope,
  Pill,
  FlaskConical,
  CalendarDays,
  HeartPulse,
  Thermometer,
  Wind,
  Scale,
  Ruler,
  AlertTriangle,
  CheckCircle2,
  Clock,
  ChevronRight,
  Trash2,
  ShieldCheck,
  FileText,
  Activity,
} from 'lucide-react';

// ─── Constants ────────────────────────────────────────────────────────────────

const ICD10_CODES = [
  { code: 'J06.9', name: 'ISPA' },
  { code: 'I10', name: 'Hipertensi Primer' },
  { code: 'E11.9', name: 'Diabetes Mellitus Tipe 2' },
  { code: 'K21.0', name: 'GERD' },
  { code: 'J45.9', name: 'Asma' },
  { code: 'L30.9', name: 'Dermatitis' },
  { code: 'N39.0', name: 'ISK' },
  { code: 'Z34.2', name: 'Kehamilan Normal' },
  { code: 'A09', name: 'Diare' },
  { code: 'R51', name: 'Sakit Kepala' },
  { code: 'M79.3', name: 'Myalgia' },
  { code: 'J00', name: 'Common Cold' },
];

const DOCTORS = [
  'dr. Andi Saputra, Sp.PD',
  'dr. Rina Sari, Sp.OG',
  'drg. Hendra Kusuma',
  'dr. Maya Dewi, Sp.A',
];

const POLI_LIST = ['Poli Umum', 'Poli Gigi', 'Poli KIA', 'Farmasi'];

const KONSULTASI_FEE = 50000;

const POLI_COLORS: Record<string, string> = {
  'Poli Umum': 'bg-teal-100 text-teal-700',
  'Poli Gigi': 'bg-violet-100 text-violet-700',
  'Poli KIA': 'bg-pink-100 text-pink-700',
  Farmasi: 'bg-amber-100 text-amber-700',
};

const POLI_DOT: Record<string, string> = {
  'Poli Umum': 'bg-teal-500',
  'Poli Gigi': 'bg-violet-500',
  'Poli KIA': 'bg-pink-500',
  Farmasi: 'bg-amber-500',
};

// ─── Helpers ──────────────────────────────────────────────────────────────────

function calcAge(dob: string): string {
  const birth = new Date(dob);
  const now = new Date();
  let years = now.getFullYear() - birth.getFullYear();
  const m = now.getMonth() - birth.getMonth();
  if (m < 0 || (m === 0 && now.getDate() < birth.getDate())) years--;
  if (years < 1) {
    const months =
      (now.getFullYear() - birth.getFullYear()) * 12 +
      now.getMonth() -
      birth.getMonth();
    return `${months} bulan`;
  }
  return `${years} tahun`;
}

function fmtDate(iso: string): string {
  return new Intl.DateTimeFormat('id-ID', { dateStyle: 'long' }).format(
    new Date(iso),
  );
}

function fmtDateTime(iso: string): string {
  return new Intl.DateTimeFormat('id-ID', {
    dateStyle: 'long',
    timeStyle: 'short',
  }).format(new Date(iso));
}

function parseVitals(objective: string): Record<string, string> {
  try {
    return JSON.parse(objective);
  } catch {
    return {};
  }
}

// ─── Types ────────────────────────────────────────────────────────────────────

interface DraftPrescription extends Prescription {
  _key: string;
}

interface FormState {
  // Step 1
  poli: string;
  doctorName: string;
  subjective: string;
  // Step 2
  td: string;
  nadi: string;
  suhu: string;
  rr: string;
  bb: string;
  tb: string;
  // Step 3
  icdCode: string;
  assessment: string;
  plan: string;
  controlDate: string;
  // Step 4
  tindakanFee: string;
  prescriptions: DraftPrescription[];
  notes: string;
}

const defaultForm = (): FormState => ({
  poli: '',
  doctorName: '',
  subjective: '',
  td: '',
  nadi: '',
  suhu: '',
  rr: '',
  bb: '',
  tb: '',
  icdCode: '',
  assessment: '',
  plan: '',
  controlDate: '',
  tindakanFee: '',
  prescriptions: [],
  notes: '',
});

// ─── Sub-components ───────────────────────────────────────────────────────────

function InsuranceBadge({ insurance }: { insurance: string }) {
  const cls =
    insurance === 'BPJS'
      ? 'bg-blue-100 text-blue-700'
      : insurance === 'Asuransi'
        ? 'bg-purple-100 text-purple-700'
        : 'bg-slate-100 text-slate-600';
  return (
    <span className={`inline rounded-full px-2.5 py-0.5 text-xs font-medium ${cls}`}>
      {insurance}
    </span>
  );
}

function PaymentBadge({ status }: { status: 'unpaid' | 'paid' }) {
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

// ─── Visit Card ───────────────────────────────────────────────────────────────

function VisitCard({ visit }: { visit: Visit }) {
  const [expanded, setExpanded] = useState(false);
  const vitals = parseVitals(visit.objective);
  const poliColor = POLI_COLORS[visit.poli] ?? 'bg-slate-100 text-slate-600';
  const poliDot = POLI_DOT[visit.poli] ?? 'bg-slate-400';

  return (
    <div className="rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden">
      {/* Header */}
      <button
        onClick={() => setExpanded((e) => !e)}
        className="w-full text-left p-4 flex items-start gap-3 hover:bg-slate-50 transition-colors"
      >
        {/* Timeline dot */}
        <div className="mt-1 flex flex-col items-center shrink-0">
          <div className={`w-3 h-3 rounded-full ${poliDot}`} />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex flex-wrap items-center gap-2 mb-1">
            <span className="text-sm font-semibold text-slate-800">
              {fmtDateTime(visit.date)}
            </span>
            <span
              className={`inline rounded-full px-2.5 py-0.5 text-xs font-medium ${poliColor}`}
            >
              {visit.poli}
            </span>
            <PaymentBadge status={visit.paymentStatus} />
          </div>
          <p className="text-xs text-slate-500 mb-1">
            <span className="font-medium text-slate-700">{visit.doctorName}</span>
          </p>
          <p className="text-sm text-slate-700 font-medium">
            [{visit.icdCode}] {visit.assessment}
          </p>
          {/* Vitals summary */}
          {vitals.td && (
            <div className="flex flex-wrap gap-3 mt-2">
              {vitals.td && (
                <span className="flex items-center gap-1 text-xs text-slate-500">
                  <HeartPulse className="w-3.5 h-3.5 text-red-400" />
                  {vitals.td} mmHg
                </span>
              )}
              {vitals.nadi && (
                <span className="flex items-center gap-1 text-xs text-slate-500">
                  <Activity className="w-3.5 h-3.5 text-pink-400" />
                  {vitals.nadi} bpm
                </span>
              )}
              {vitals.suhu && (
                <span className="flex items-center gap-1 text-xs text-slate-500">
                  <Thermometer className="w-3.5 h-3.5 text-orange-400" />
                  {vitals.suhu} °C
                </span>
              )}
              {vitals.rr && (
                <span className="flex items-center gap-1 text-xs text-slate-500">
                  <Wind className="w-3.5 h-3.5 text-sky-400" />
                  {vitals.rr} x/mnt
                </span>
              )}
              {vitals.bb && (
                <span className="flex items-center gap-1 text-xs text-slate-500">
                  <Scale className="w-3.5 h-3.5 text-slate-400" />
                  {vitals.bb} kg
                </span>
              )}
              {vitals.tb && (
                <span className="flex items-center gap-1 text-xs text-slate-500">
                  <Ruler className="w-3.5 h-3.5 text-slate-400" />
                  {vitals.tb} cm
                </span>
              )}
            </div>
          )}
        </div>
        <div className="shrink-0 mt-1">
          {expanded ? (
            <ChevronUp className="w-4 h-4 text-slate-400" />
          ) : (
            <ChevronDown className="w-4 h-4 text-slate-400" />
          )}
        </div>
      </button>

      {/* Expanded detail */}
      {expanded && (
        <div className="px-5 pb-5 space-y-4 border-t border-slate-100 pt-4">
          {/* SOAP */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-widest mb-1">
                Subjektif (S)
              </p>
              <p className="text-sm text-slate-700">{visit.subjective}</p>
            </div>
            <div>
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-widest mb-1">
                Rencana (P)
              </p>
              <p className="text-sm text-slate-700">{visit.plan}</p>
            </div>
          </div>

          {/* Prescriptions */}
          {visit.prescriptions.length > 0 && (
            <div>
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-widest mb-2">
                Resep
              </p>
              <div className="space-y-1">
                {visit.prescriptions.map((rx, i) => (
                  <div
                    key={i}
                    className="flex items-center justify-between text-sm bg-slate-50 rounded-xl px-3 py-2"
                  >
                    <div className="flex items-center gap-2">
                      <Pill className="w-4 h-4 text-teal-500 shrink-0" />
                      <span className="font-medium text-slate-700">
                        {rx.drugName}
                      </span>
                      <span className="text-slate-500">
                        {rx.quantity} {rx.unit} — {rx.dosage}
                      </span>
                    </div>
                    <span className="text-slate-600 font-medium">
                      {idr(rx.quantity * rx.pricePerUnit)}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Footer info */}
          <div className="flex flex-wrap items-center gap-4 text-xs text-slate-500 pt-2 border-t border-slate-100">
            <span className="flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5" />
              Total: <strong className="text-slate-700 ml-1">{idr(visit.totalBill)}</strong>
            </span>
            {visit.controlDate && (
              <span className="flex items-center gap-1">
                <CalendarDays className="w-3.5 h-3.5" />
                Kontrol: {fmtDate(visit.controlDate)}
              </span>
            )}
            {visit.notes && (
              <span className="flex items-center gap-1">
                <FileText className="w-3.5 h-3.5" />
                {visit.notes}
              </span>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

// ─── New Visit Modal ──────────────────────────────────────────────────────────

interface NewVisitModalProps {
  patient: Patient;
  drugs: Drug[];
  onClose: () => void;
  onSave: (visit: Visit) => void;
}

function NewVisitModal({ patient, drugs, onClose, onSave }: NewVisitModalProps) {
  const [step, setStep] = useState(1);
  const [form, setForm] = useState<FormState>(defaultForm());
  const [icdSearch, setIcdSearch] = useState('');
  const [drugSearch, setDrugSearch] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});

  const totalSteps = 4;

  const filteredICD = useMemo(
    () =>
      ICD10_CODES.filter(
        (c) =>
          c.code.toLowerCase().includes(icdSearch.toLowerCase()) ||
          c.name.toLowerCase().includes(icdSearch.toLowerCase()),
      ),
    [icdSearch],
  );

  const filteredDrugs = useMemo(
    () =>
      drugs.filter((d) =>
        d.name.toLowerCase().includes(drugSearch.toLowerCase()),
      ),
    [drugSearch, drugs],
  );

  const setField = (key: keyof FormState, value: FormState[keyof FormState]) => {
    setForm((f) => ({ ...f, [key]: value }));
    setErrors((e) => ({ ...e, [key]: '' }));
  };

  // Bill calculation
  const drugTotal = form.prescriptions.reduce(
    (sum, rx) => sum + rx.quantity * rx.pricePerUnit,
    0,
  );
  const tindakanFee = parseInt(form.tindakanFee || '0', 10) || 0;
  const totalBill = KONSULTASI_FEE + tindakanFee + drugTotal;

  function addDrug(drug: Drug) {
    const already = form.prescriptions.find((p) => p.drugId === drug.id);
    if (already) return;
    setField('prescriptions', [
      ...form.prescriptions,
      {
        _key: uid(),
        drugId: drug.id,
        drugName: drug.name,
        quantity: 1,
        unit: drug.unit,
        dosage: '',
        pricePerUnit: drug.sellPrice,
      },
    ]);
    setDrugSearch('');
  }

  function removeDrug(key: string) {
    setField(
      'prescriptions',
      form.prescriptions.filter((p) => p._key !== key),
    );
  }

  function updateRx(key: string, field: 'quantity' | 'dosage', val: string | number) {
    setField(
      'prescriptions',
      form.prescriptions.map((p) =>
        p._key === key ? { ...p, [field]: field === 'quantity' ? Number(val) : val } : p,
      ),
    );
  }

  function validateStep(s: number): boolean {
    const errs: Record<string, string> = {};
    if (s === 1) {
      if (!form.poli) errs.poli = 'Pilih poli';
      if (!form.doctorName) errs.doctorName = 'Pilih dokter';
      if (!form.subjective.trim()) errs.subjective = 'Masukkan keluhan utama';
    }
    if (s === 2) {
      if (!form.td.trim()) errs.td = 'Wajib diisi';
      if (!form.nadi.trim()) errs.nadi = 'Wajib diisi';
      if (!form.suhu.trim()) errs.suhu = 'Wajib diisi';
    }
    if (s === 3) {
      if (!form.icdCode) errs.icdCode = 'Pilih kode ICD-10';
      if (!form.plan.trim()) errs.plan = 'Masukkan rencana tindakan';
    }
    setErrors(errs);
    return Object.keys(errs).length === 0;
  }

  function handleNext() {
    if (validateStep(step)) setStep((s) => Math.min(s + 1, totalSteps));
  }

  function handleBack() {
    setStep((s) => Math.max(s - 1, 1));
  }

  function handleSave() {
    if (!validateStep(4)) return;
    const now = new Date().toISOString();
    const objective = JSON.stringify({
      td: form.td,
      nadi: form.nadi,
      suhu: form.suhu,
      rr: form.rr,
      bb: form.bb,
      tb: form.tb,
    });
    const visit: Visit = {
      id: uid(),
      patientId: patient.id,
      date: now,
      poli: form.poli,
      doctorName: form.doctorName,
      subjective: form.subjective,
      objective,
      assessment: form.assessment,
      icdCode: form.icdCode,
      plan: form.plan,
      prescriptions: form.prescriptions.map(({ _key: _k, ...rest }) => rest),
      totalBill,
      paymentStatus: 'unpaid',
      controlDate: form.controlDate || undefined,
      notes: form.notes || undefined,
    };
    onSave(visit);
  }

  const stepLabels = ['Anamnesis', 'Tanda Vital', 'Diagnosa', 'E-Resep'];

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl max-h-[90vh] flex flex-col">
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 pt-6 pb-4 border-b border-slate-100">
          <div>
            <h2 className="text-lg font-bold text-slate-800">Kunjungan Baru</h2>
            <p className="text-sm text-slate-500">{patient.name} — {patient.rm}</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl hover:bg-slate-100 text-slate-500 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Step indicator */}
        <div className="px-6 py-4 border-b border-slate-100">
          <div className="flex items-center gap-0">
            {stepLabels.map((label, idx) => {
              const n = idx + 1;
              const isActive = n === step;
              const isDone = n < step;
              return (
                <div key={n} className="flex items-center flex-1">
                  <div className="flex flex-col items-center flex-1">
                    <div
                      className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-colors
                        ${isActive ? 'bg-teal-600 text-white' : isDone ? 'bg-teal-100 text-teal-700' : 'bg-slate-100 text-slate-400'}`}
                    >
                      {isDone ? <CheckCircle2 className="w-4 h-4" /> : n}
                    </div>
                    <span
                      className={`text-xs mt-1 font-medium ${isActive ? 'text-teal-600' : isDone ? 'text-teal-500' : 'text-slate-400'}`}
                    >
                      {label}
                    </span>
                  </div>
                  {idx < stepLabels.length - 1 && (
                    <div
                      className={`h-0.5 flex-1 mx-1 rounded transition-colors ${n < step ? 'bg-teal-400' : 'bg-slate-200'}`}
                    />
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Step content */}
        <div className="flex-1 overflow-y-auto px-6 py-5 space-y-4">
          {/* ── Step 1: Anamnesis ── */}
          {step === 1 && (
            <>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1.5">
                    Poli <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={form.poli}
                    onChange={(e) => setField('poli', e.target.value)}
                    className={`w-full border rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500
                      ${errors.poli ? 'border-red-400' : 'border-slate-200'}`}
                  >
                    <option value="">Pilih Poli</option>
                    {POLI_LIST.map((p) => (
                      <option key={p} value={p}>{p}</option>
                    ))}
                  </select>
                  {errors.poli && (
                    <p className="text-xs text-red-500 mt-1">{errors.poli}</p>
                  )}
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1.5">
                    Dokter Pemeriksa <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={form.doctorName}
                    onChange={(e) => setField('doctorName', e.target.value)}
                    className={`w-full border rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500
                      ${errors.doctorName ? 'border-red-400' : 'border-slate-200'}`}
                  >
                    <option value="">Pilih Dokter</option>
                    {DOCTORS.map((d) => (
                      <option key={d} value={d}>{d}</option>
                    ))}
                  </select>
                  {errors.doctorName && (
                    <p className="text-xs text-red-500 mt-1">{errors.doctorName}</p>
                  )}
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1.5">
                  Keluhan Utama (S) <span className="text-red-500">*</span>
                </label>
                <textarea
                  rows={4}
                  value={form.subjective}
                  onChange={(e) => setField('subjective', e.target.value)}
                  placeholder="Pasien datang dengan keluhan..."
                  className={`w-full border rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 resize-none
                    ${errors.subjective ? 'border-red-400' : 'border-slate-200'}`}
                />
                {errors.subjective && (
                  <p className="text-xs text-red-500 mt-1">{errors.subjective}</p>
                )}
              </div>

              {/* Allergy read-only */}
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1.5">
                  Riwayat Alergi
                </label>
                <div
                  className={`flex items-center gap-2 rounded-xl px-3 py-2.5 text-sm border
                    ${patient.allergy && patient.allergy !== '-'
                      ? 'bg-red-50 border-red-200 text-red-700'
                      : 'bg-slate-50 border-slate-200 text-slate-500'}`}
                >
                  <AlertTriangle
                    className={`w-4 h-4 shrink-0 ${patient.allergy && patient.allergy !== '-' ? 'text-red-500' : 'text-slate-300'}`}
                  />
                  {patient.allergy && patient.allergy !== '-'
                    ? <><span className="font-semibold">PERHATIAN:</span>&nbsp;{patient.allergy}</>
                    : 'Tidak ada riwayat alergi yang tercatat'}
                </div>
              </div>
            </>
          )}

          {/* ── Step 2: Tanda Vital ── */}
          {step === 2 && (
            <>
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-widest">
                Pemeriksaan Fisik & Tanda Vital (O)
              </p>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1.5 flex items-center gap-1">
                    <HeartPulse className="w-3.5 h-3.5 text-red-400" />
                    Tekanan Darah (TD) <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      value={form.td}
                      onChange={(e) => setField('td', e.target.value)}
                      placeholder="120/80"
                      className={`w-full border rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500
                        ${errors.td ? 'border-red-400' : 'border-slate-200'}`}
                    />
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-400">mmHg</span>
                  </div>
                  {errors.td && <p className="text-xs text-red-500 mt-1">{errors.td}</p>}
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1.5 flex items-center gap-1">
                    <Activity className="w-3.5 h-3.5 text-pink-400" />
                    Nadi <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <input
                      type="number"
                      value={form.nadi}
                      onChange={(e) => setField('nadi', e.target.value)}
                      placeholder="80"
                      className={`w-full border rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500
                        ${errors.nadi ? 'border-red-400' : 'border-slate-200'}`}
                    />
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-400">bpm</span>
                  </div>
                  {errors.nadi && <p className="text-xs text-red-500 mt-1">{errors.nadi}</p>}
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1.5 flex items-center gap-1">
                    <Thermometer className="w-3.5 h-3.5 text-orange-400" />
                    Suhu <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <input
                      type="number"
                      step="0.1"
                      value={form.suhu}
                      onChange={(e) => setField('suhu', e.target.value)}
                      placeholder="36.5"
                      className={`w-full border rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500
                        ${errors.suhu ? 'border-red-400' : 'border-slate-200'}`}
                    />
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-400">°C</span>
                  </div>
                  {errors.suhu && <p className="text-xs text-red-500 mt-1">{errors.suhu}</p>}
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1.5 flex items-center gap-1">
                    <Wind className="w-3.5 h-3.5 text-sky-400" />
                    Laju Napas (RR)
                  </label>
                  <div className="relative">
                    <input
                      type="number"
                      value={form.rr}
                      onChange={(e) => setField('rr', e.target.value)}
                      placeholder="18"
                      className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
                    />
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-400">x/mnt</span>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1.5 flex items-center gap-1">
                    <Scale className="w-3.5 h-3.5 text-slate-400" />
                    Berat Badan (BB)
                  </label>
                  <div className="relative">
                    <input
                      type="number"
                      value={form.bb}
                      onChange={(e) => setField('bb', e.target.value)}
                      placeholder="60"
                      className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
                    />
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-400">kg</span>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1.5 flex items-center gap-1">
                    <Ruler className="w-3.5 h-3.5 text-slate-400" />
                    Tinggi Badan (TB)
                  </label>
                  <div className="relative">
                    <input
                      type="number"
                      value={form.tb}
                      onChange={(e) => setField('tb', e.target.value)}
                      placeholder="165"
                      className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
                    />
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-400">cm</span>
                  </div>
                </div>
              </div>
            </>
          )}

          {/* ── Step 3: Diagnosa & Plan ── */}
          {step === 3 && (
            <>
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1.5">
                  Kode ICD-10 / Diagnosa (A) <span className="text-red-500">*</span>
                </label>
                <div className="relative mb-2">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    type="text"
                    value={icdSearch}
                    onChange={(e) => setIcdSearch(e.target.value)}
                    placeholder="Cari kode atau nama diagnosa..."
                    className="w-full border border-slate-200 rounded-xl pl-9 pr-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
                  />
                </div>
                <div className="border border-slate-200 rounded-xl overflow-hidden max-h-44 overflow-y-auto">
                  {filteredICD.map((icd) => (
                    <button
                      key={icd.code}
                      onClick={() => {
                        setField('icdCode', icd.code);
                        setField('assessment', icd.name);
                        setIcdSearch('');
                        setErrors((e) => ({ ...e, icdCode: '' }));
                      }}
                      className={`w-full text-left flex items-center justify-between px-4 py-2.5 text-sm hover:bg-teal-50 transition-colors border-b border-slate-100 last:border-0
                        ${form.icdCode === icd.code ? 'bg-teal-50 text-teal-700 font-medium' : 'text-slate-700'}`}
                    >
                      <span>{icd.name}</span>
                      <span
                        className={`text-xs font-mono px-2 py-0.5 rounded-full ${form.icdCode === icd.code ? 'bg-teal-200 text-teal-800' : 'bg-slate-100 text-slate-500'}`}
                      >
                        {icd.code}
                      </span>
                    </button>
                  ))}
                  {filteredICD.length === 0 && (
                    <p className="px-4 py-3 text-sm text-slate-400 text-center">
                      Tidak ditemukan
                    </p>
                  )}
                </div>
                {errors.icdCode && (
                  <p className="text-xs text-red-500 mt-1">{errors.icdCode}</p>
                )}
                {form.icdCode && (
                  <div className="mt-2 flex items-center gap-2 text-sm text-teal-700 font-medium">
                    <CheckCircle2 className="w-4 h-4 text-teal-500" />
                    [{form.icdCode}] {form.assessment}
                  </div>
                )}
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1.5">
                  Rencana Tindakan (P) <span className="text-red-500">*</span>
                </label>
                <textarea
                  rows={3}
                  value={form.plan}
                  onChange={(e) => setField('plan', e.target.value)}
                  placeholder="Rencana terapi, tindakan, rujukan..."
                  className={`w-full border rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 resize-none
                    ${errors.plan ? 'border-red-400' : 'border-slate-200'}`}
                />
                {errors.plan && (
                  <p className="text-xs text-red-500 mt-1">{errors.plan}</p>
                )}
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1.5">
                  Jadwal Kontrol
                </label>
                <input
                  type="date"
                  value={form.controlDate}
                  onChange={(e) => setField('controlDate', e.target.value)}
                  className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1.5">
                  Catatan Tambahan
                </label>
                <textarea
                  rows={2}
                  value={form.notes}
                  onChange={(e) => setField('notes', e.target.value)}
                  placeholder="Instruksi khusus, catatan dokter..."
                  className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 resize-none"
                />
              </div>
            </>
          )}

          {/* ── Step 4: E-Resep ── */}
          {step === 4 && (
            <>
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-widest">
                Tambah Obat
              </p>

              {/* Drug search */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="text"
                  value={drugSearch}
                  onChange={(e) => setDrugSearch(e.target.value)}
                  placeholder="Cari nama obat..."
                  className="w-full border border-slate-200 rounded-xl pl-9 pr-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
                />
              </div>

              {/* Drug dropdown results */}
              {drugSearch.trim().length > 0 && (
                <div className="border border-slate-200 rounded-xl overflow-hidden max-h-44 overflow-y-auto -mt-2">
                  {filteredDrugs.map((d) => {
                    const alreadyAdded = form.prescriptions.some((p) => p.drugId === d.id);
                    return (
                      <button
                        key={d.id}
                        disabled={alreadyAdded}
                        onClick={() => addDrug(d)}
                        className={`w-full text-left flex items-center justify-between px-4 py-2.5 text-sm border-b border-slate-100 last:border-0 transition-colors
                          ${alreadyAdded ? 'bg-slate-50 text-slate-400 cursor-default' : 'hover:bg-teal-50 text-slate-700'}`}
                      >
                        <div>
                          <p className="font-medium">{d.name}</p>
                          <p className="text-xs text-slate-400">
                            Stok: {d.stock} {d.unit} · {idr(d.sellPrice)}/{d.unit}
                          </p>
                        </div>
                        {alreadyAdded ? (
                          <span className="text-xs text-slate-400">Sudah ditambah</span>
                        ) : (
                          <PlusCircle className="w-4 h-4 text-teal-500" />
                        )}
                      </button>
                    );
                  })}
                  {filteredDrugs.length === 0 && (
                    <p className="px-4 py-3 text-sm text-slate-400 text-center">
                      Obat tidak ditemukan
                    </p>
                  )}
                </div>
              )}

              {/* Prescription list */}
              {form.prescriptions.length > 0 ? (
                <div className="space-y-2">
                  {form.prescriptions.map((rx) => (
                    <div
                      key={rx._key}
                      className="rounded-xl border border-slate-200 bg-slate-50 p-3 space-y-2"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Pill className="w-4 h-4 text-teal-500 shrink-0" />
                          <span className="text-sm font-medium text-slate-800">{rx.drugName}</span>
                        </div>
                        <button
                          onClick={() => removeDrug(rx._key)}
                          className="p-1 hover:bg-red-100 rounded-lg text-slate-400 hover:text-red-500 transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <label className="text-xs text-slate-500 mb-1 block">
                            Jumlah ({rx.unit})
                          </label>
                          <input
                            type="number"
                            min={1}
                            value={rx.quantity}
                            onChange={(e) => updateRx(rx._key, 'quantity', e.target.value)}
                            className="w-full border border-slate-200 rounded-xl px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
                          />
                        </div>
                        <div>
                          <label className="text-xs text-slate-500 mb-1 block">
                            Aturan Minum
                          </label>
                          <input
                            type="text"
                            value={rx.dosage}
                            onChange={(e) => updateRx(rx._key, 'dosage', e.target.value)}
                            placeholder="3x1 sesudah makan"
                            className="w-full border border-slate-200 rounded-xl px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
                          />
                        </div>
                      </div>
                      <div className="text-right text-xs text-slate-500">
                        Subtotal: <span className="font-semibold text-slate-700">{idr(rx.quantity * rx.pricePerUnit)}</span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="rounded-xl border border-dashed border-slate-200 py-6 text-center text-sm text-slate-400">
                  Belum ada obat ditambahkan
                </div>
              )}

              {/* Fee inputs */}
              <div className="border-t border-slate-100 pt-4 space-y-3">
                <p className="text-xs font-semibold text-slate-500 uppercase tracking-widest">
                  Komponen Biaya
                </p>
                <div className="flex items-center justify-between text-sm">
                  <span className="flex items-center gap-1.5 text-slate-600">
                    <Stethoscope className="w-4 h-4 text-teal-500" />
                    Jasa Konsultasi
                  </span>
                  <span className="font-medium text-slate-700">{idr(KONSULTASI_FEE)}</span>
                </div>

                <div className="flex items-center justify-between text-sm gap-4">
                  <span className="flex items-center gap-1.5 text-slate-600 shrink-0">
                    <FlaskConical className="w-4 h-4 text-violet-500" />
                    Tindakan Medis
                  </span>
                  <input
                    type="number"
                    value={form.tindakanFee}
                    onChange={(e) => setField('tindakanFee', e.target.value)}
                    placeholder="0"
                    className="w-40 border border-slate-200 rounded-xl px-3 py-1.5 text-sm text-right focus:outline-none focus:ring-2 focus:ring-teal-500"
                  />
                </div>

                <div className="flex items-center justify-between text-sm">
                  <span className="flex items-center gap-1.5 text-slate-600">
                    <Pill className="w-4 h-4 text-emerald-500" />
                    Total Obat
                  </span>
                  <span className="font-medium text-slate-700">{idr(drugTotal)}</span>
                </div>

                <div className="flex items-center justify-between bg-teal-50 rounded-xl px-4 py-3">
                  <span className="text-sm font-bold text-teal-800">Total Tagihan</span>
                  <span className="text-lg font-bold text-teal-700">{idr(totalBill)}</span>
                </div>
                <p className="text-xs text-slate-400 flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5" />
                  Status pembayaran: <strong className="text-slate-600 ml-1">Belum Bayar</strong> — akan diteruskan ke Kasir
                </p>
              </div>
            </>
          )}
        </div>

        {/* Modal Footer */}
        <div className="flex items-center justify-between px-6 py-4 border-t border-slate-100">
          <button
            onClick={step === 1 ? onClose : handleBack}
            className="bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 px-4 py-2 rounded-xl text-sm font-medium transition-colors"
          >
            {step === 1 ? 'Batal' : '← Kembali'}
          </button>

          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-400">
              Langkah {step} dari {totalSteps}
            </span>
            {step < totalSteps ? (
              <button
                onClick={handleNext}
                className="bg-teal-600 hover:bg-teal-700 text-white px-5 py-2 rounded-xl text-sm font-medium transition-colors flex items-center gap-1"
              >
                Lanjut <ChevronRight className="w-4 h-4" />
              </button>
            ) : (
              <button
                onClick={handleSave}
                className="bg-teal-600 hover:bg-teal-700 text-white px-5 py-2 rounded-xl text-sm font-medium transition-colors flex items-center gap-1"
              >
                <CheckCircle2 className="w-4 h-4" />
                Simpan & Kirim ke Kasir
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function RekamMedisPage() {
  const [patients, setPatients] = useState<Patient[]>([]);
  const [visits, setVisits] = useState<Visit[]>([]);
  const [drugs, setDrugs] = useState<Drug[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [savedToast, setSavedToast] = useState(false);

  useEffect(() => {
    initStore();
    setPatients(patientStore.getAll());
    setVisits(visitStore.getAll());
    setDrugs(drugStore.getAll());
  }, []);

  const filteredPatients = useMemo(() => {
    const q = searchQuery.toLowerCase().trim();
    if (!q) return patients;
    return patients.filter(
      (p) =>
        p.name.toLowerCase().includes(q) ||
        p.rm.toLowerCase().includes(q) ||
        p.nik.includes(q),
    );
  }, [patients, searchQuery]);

  const patientVisits = useMemo(() => {
    if (!selectedPatient) return [];
    return visits
      .filter((v) => v.patientId === selectedPatient.id)
      .sort((a, b) => b.date.localeCompare(a.date));
  }, [visits, selectedPatient]);

  function handleSaveVisit(visit: Visit) {
    visitStore.add(visit);
    const updatedVisits = visitStore.getAll();
    setVisits(updatedVisits);
    setShowModal(false);
    setSavedToast(true);
    setTimeout(() => setSavedToast(false), 3500);
  }

  function selectPatient(p: Patient) {
    setSelectedPatient(p);
    setShowModal(false);
  }

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Toast */}
      {savedToast && (
        <div className="fixed top-4 right-4 z-50 bg-teal-600 text-white rounded-2xl px-5 py-3 shadow-xl flex items-center gap-2 animate-in slide-in-from-top-2">
          <CheckCircle2 className="w-5 h-5" />
          <span className="text-sm font-medium">
            Kunjungan berhasil disimpan & diteruskan ke Kasir
          </span>
        </div>
      )}

      {/* Page Header */}
      <div className="bg-white border-b border-slate-200 px-6 py-5">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
                <FileText className="w-7 h-7 text-teal-600" />
                Rekam Medis Elektronik
              </h1>
              <p className="text-sm text-slate-500 mt-0.5">
                Riwayat kunjungan & catatan medis pasien
              </p>
            </div>
            {selectedPatient && (
              <button
                onClick={() => setShowModal(true)}
                className="bg-teal-600 hover:bg-teal-700 text-white px-4 py-2 rounded-xl text-sm font-medium flex items-center gap-2 transition-colors shadow-sm"
              >
                <PlusCircle className="w-4 h-4" />
                Tambah Kunjungan Baru
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Main Layout */}
      <div className="max-w-7xl mx-auto p-6">
        <div className="flex gap-5 h-[calc(100vh-160px)]">
          {/* ── Left Panel: Patient List ── */}
          <div className="w-80 shrink-0 flex flex-col gap-4">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Cari nama / No. RM..."
                className="w-full border border-slate-200 rounded-xl pl-9 pr-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 bg-white shadow-sm"
              />
            </div>

            {/* Patient List */}
            <div className="rounded-2xl border border-slate-200 bg-white shadow-sm flex-1 overflow-y-auto">
              <div className="px-4 py-3 border-b border-slate-100">
                <p className="text-xs font-semibold text-slate-500 uppercase tracking-widest">
                  Daftar Pasien ({filteredPatients.length})
                </p>
              </div>
              <div className="divide-y divide-slate-100">
                {filteredPatients.length === 0 ? (
                  <div className="py-12 text-center text-sm text-slate-400">
                    <UserCircle2 className="w-10 h-10 mx-auto mb-2 text-slate-300" />
                    Pasien tidak ditemukan
                  </div>
                ) : (
                  filteredPatients.map((p) => {
                    const isSelected = selectedPatient?.id === p.id;
                    const visitCount = visits.filter(
                      (v) => v.patientId === p.id,
                    ).length;
                    return (
                      <button
                        key={p.id}
                        onClick={() => selectPatient(p)}
                        className={`w-full text-left px-4 py-3 hover:bg-slate-50 transition-colors
                          ${isSelected ? 'bg-teal-50 border-l-2 border-teal-500' : ''}`}
                      >
                        <div className="flex items-start justify-between gap-2">
                          <div className="min-w-0">
                            <p
                              className={`text-sm font-semibold truncate ${isSelected ? 'text-teal-700' : 'text-slate-800'}`}
                            >
                              {p.name}
                            </p>
                            <p className="text-xs text-slate-500 mt-0.5">{p.rm}</p>
                            <div className="flex items-center gap-1.5 mt-1">
                              <InsuranceBadge insurance={p.insurance} />
                              {p.allergy && p.allergy !== '-' && (
                                <span className="inline rounded-full bg-red-100 px-2 py-0.5 text-xs font-medium text-red-600 flex items-center gap-0.5">
                                  <AlertTriangle className="w-2.5 h-2.5" />
                                  Alergi
                                </span>
                              )}
                            </div>
                          </div>
                          <div className="shrink-0 text-right">
                            <span className="text-xs text-slate-400">{calcAge(p.dob)}</span>
                            <p className="text-xs text-slate-400 mt-1">
                              {visitCount} kunjungan
                            </p>
                          </div>
                        </div>
                      </button>
                    );
                  })
                )}
              </div>
            </div>
          </div>

          {/* ── Right Panel: Patient Detail & Visit History ── */}
          <div className="flex-1 min-w-0 flex flex-col gap-4 overflow-y-auto">
            {!selectedPatient ? (
              /* Empty state */
              <div className="flex-1 flex flex-col items-center justify-center text-center rounded-2xl border border-dashed border-slate-200 bg-white p-12">
                <UserCircle2 className="w-16 h-16 text-slate-200 mb-4" />
                <h3 className="text-lg font-semibold text-slate-400 mb-1">
                  Pilih Pasien
                </h3>
                <p className="text-sm text-slate-400 max-w-xs">
                  Klik nama pasien di daftar sebelah kiri untuk melihat rekam medisnya
                </p>
              </div>
            ) : (
              <>
                {/* Patient Info Card */}
                <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm shrink-0">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-start gap-4">
                      {/* Avatar */}
                      <div className="w-14 h-14 rounded-2xl bg-teal-100 flex items-center justify-center shrink-0">
                        <UserCircle2 className="w-8 h-8 text-teal-600" />
                      </div>
                      <div>
                        <h2 className="text-xl font-bold text-slate-800">
                          {selectedPatient.name}
                        </h2>
                        <div className="flex flex-wrap items-center gap-2 mt-1">
                          <span className="text-sm text-slate-500 font-mono font-medium">
                            {selectedPatient.rm}
                          </span>
                          <span className="text-slate-300">·</span>
                          <span className="text-sm text-slate-600">
                            {selectedPatient.gender === 'L' ? 'Laki-laki' : 'Perempuan'}
                          </span>
                          <span className="text-slate-300">·</span>
                          <span className="text-sm text-slate-600">
                            {calcAge(selectedPatient.dob)}
                          </span>
                          <span className="text-slate-300">·</span>
                          <span className="text-sm text-slate-600">
                            Gol. {selectedPatient.bloodType ?? '-'}
                          </span>
                        </div>
                        <div className="flex flex-wrap items-center gap-2 mt-2">
                          <InsuranceBadge insurance={selectedPatient.insurance} />
                          {selectedPatient.allergy && selectedPatient.allergy !== '-' ? (
                            <span className="inline-flex items-center gap-1 rounded-full bg-red-100 px-2.5 py-0.5 text-xs font-medium text-red-700">
                              <AlertTriangle className="w-3 h-3" />
                              Alergi: {selectedPatient.allergy}
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-medium text-slate-500">
                              <ShieldCheck className="w-3 h-3" />
                              Tidak ada alergi
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="shrink-0 text-right">
                      <p className="text-xs text-slate-500 mb-1">Total Kunjungan</p>
                      <p className="text-3xl font-bold text-teal-600">
                        {patientVisits.length}
                      </p>
                    </div>
                  </div>

                  {/* Quick info row */}
                  <div className="grid grid-cols-3 gap-3 mt-4 pt-4 border-t border-slate-100">
                    <div>
                      <p className="text-xs text-slate-400">NIK</p>
                      <p className="text-sm font-mono text-slate-700">
                        {selectedPatient.nik}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-slate-400">No. Telepon</p>
                      <p className="text-sm text-slate-700">{selectedPatient.phone}</p>
                    </div>
                    <div>
                      <p className="text-xs text-slate-400">Tanggal Lahir</p>
                      <p className="text-sm text-slate-700">
                        {fmtDate(selectedPatient.dob)}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Visit History */}
                <div>
                  <p className="text-xs font-semibold text-slate-500 uppercase tracking-widest mb-3 flex items-center gap-2">
                    <Clock className="w-3.5 h-3.5" />
                    Riwayat Kunjungan
                    {patientVisits.length > 0 && (
                      <span className="font-normal normal-case tracking-normal text-slate-400">
                        ({patientVisits.length} total, terbaru lebih dulu)
                      </span>
                    )}
                  </p>

                  {patientVisits.length === 0 ? (
                    <div className="rounded-2xl border border-dashed border-slate-200 bg-white py-12 text-center">
                      <FileText className="w-10 h-10 mx-auto mb-2 text-slate-200" />
                      <p className="text-sm text-slate-400">
                        Belum ada riwayat kunjungan
                      </p>
                      <button
                        onClick={() => setShowModal(true)}
                        className="mt-3 bg-teal-600 hover:bg-teal-700 text-white px-4 py-2 rounded-xl text-sm font-medium transition-colors inline-flex items-center gap-1.5"
                      >
                        <PlusCircle className="w-4 h-4" />
                        Tambah Kunjungan Pertama
                      </button>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {patientVisits.map((visit) => (
                        <VisitCard key={visit.id} visit={visit} />
                      ))}
                    </div>
                  )}
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Modal */}
      {showModal && selectedPatient && (
        <NewVisitModal
          patient={selectedPatient}
          drugs={drugs}
          onClose={() => setShowModal(false)}
          onSave={handleSaveVisit}
        />
      )}
    </div>
  );
}
