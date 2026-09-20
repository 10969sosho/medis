'use client';

import { useEffect, useState, useMemo } from 'react';
import {
  Search,
  Plus,
  Users,
  UserPlus,
  ClipboardList,
  X,
  CheckCircle2,
  Ticket,
  ChevronRight,
} from 'lucide-react';
import {
  initStore,
  patientStore,
  queueStore,
  uid,
  fmtDate,
} from '@/lib/store';
import type { Patient, QueueItem } from '@/lib/types';

// ── Constants ────────────────────────────────────────────────────────────────

const POLI_OPTIONS = ['Poli Umum', 'Poli Gigi', 'Poli KIA', 'Farmasi'] as const;
type PoliOption = (typeof POLI_OPTIONS)[number];

const POLI_PREFIX: Record<PoliOption, string> = {
  'Poli Umum': 'A',
  'Poli Gigi': 'G',
  'Poli KIA': 'K',
  Farmasi: 'F',
};

const INSURANCE_OPTIONS = ['BPJS', 'Asuransi', 'Umum'] as const;
const BLOOD_TYPE_OPTIONS = ['A', 'B', 'AB', 'O'] as const;

// ── Blank form ────────────────────────────────────────────────────────────────

interface PatientForm {
  name: string;
  nik: string;
  dob: string;
  gender: 'L' | 'P' | '';
  phone: string;
  address: string;
  insurance: 'BPJS' | 'Asuransi' | 'Umum';
  bloodType: 'A' | 'B' | 'AB' | 'O' | '';
  allergy: string;
}

const blankForm = (): PatientForm => ({
  name: '',
  nik: '',
  dob: '',
  gender: '',
  phone: '',
  address: '',
  insurance: 'Umum',
  bloodType: '',
  allergy: '',
});

// ── Toast helper ─────────────────────────────────────────────────────────────

interface ToastState {
  visible: boolean;
  message: string;
}

// ── Main Component ────────────────────────────────────────────────────────────

export default function PendaftaranPage() {
  // ── Store state ────────────────────────────────────────────────────────────
  const [patients, setPatients] = useState<Patient[]>([]);

  // ── Search / filter ────────────────────────────────────────────────────────
  const [search, setSearch] = useState('');
  const [filterInsurance, setFilterInsurance] = useState<string>('Semua');

  // ── Add Patient Modal ──────────────────────────────────────────────────────
  const [showAddModal, setShowAddModal] = useState(false);
  const [form, setForm] = useState<PatientForm>(blankForm());
  const [formErrors, setFormErrors] = useState<Partial<Record<keyof PatientForm, string>>>({});
  const [addStep, setAddStep] = useState<'form' | 'queue'>('form');

  // Holds the newly-created patient for the queue step
  const [pendingPatient, setPendingPatient] = useState<Patient | null>(null);

  // ── Queue Modal (for existing patient row button) ──────────────────────────
  const [showQueueModal, setShowQueueModal] = useState(false);
  const [queueTarget, setQueueTarget] = useState<Patient | null>(null);

  // ── Queue selection state (shared by both modals) ─────────────────────────
  const [selectedPoli, setSelectedPoli] = useState<PoliOption>('Poli Umum');
  const [createdTicket, setCreatedTicket] = useState<string | null>(null);

  // ── Toast ──────────────────────────────────────────────────────────────────
  const [toast, setToast] = useState<ToastState>({ visible: false, message: '' });

  // ── Init ───────────────────────────────────────────────────────────────────
  useEffect(() => {
    initStore();
    setPatients(patientStore.getAll());
  }, []);

  const refreshPatients = () => setPatients(patientStore.getAll());

  // ── Toast helper ───────────────────────────────────────────────────────────
  const showToast = (message: string) => {
    setToast({ visible: true, message });
    setTimeout(() => setToast({ visible: false, message: '' }), 3500);
  };

  // ── Filtered list ──────────────────────────────────────────────────────────
  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return patients.filter((p) => {
      const matchSearch =
        !q ||
        p.name.toLowerCase().includes(q) ||
        p.nik.includes(q) ||
        p.rm.toLowerCase().includes(q);
      const matchInsurance =
        filterInsurance === 'Semua' || p.insurance === filterInsurance;
      return matchSearch && matchInsurance;
    });
  }, [patients, search, filterInsurance]);

  // ── Form validation ────────────────────────────────────────────────────────
  const validateForm = (): boolean => {
    const errors: Partial<Record<keyof PatientForm, string>> = {};
    if (!form.name.trim()) errors.name = 'Nama wajib diisi';
    if (!form.nik.trim() || form.nik.length < 16) errors.nik = 'NIK harus 16 digit';
    if (!form.dob) errors.dob = 'Tanggal lahir wajib diisi';
    if (!form.gender) errors.gender = 'Jenis kelamin wajib dipilih';
    if (!form.phone.trim()) errors.phone = 'No. HP wajib diisi';
    if (!form.address.trim()) errors.address = 'Alamat wajib diisi';
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // ── Handle form submit (Step 1) ────────────────────────────────────────────
  const handleAddPatient = () => {
    if (!validateForm()) return;

    const rm = patientStore.nextRM();
    const newPatient: Patient = {
      id: uid(),
      rm,
      name: form.name.trim(),
      nik: form.nik.trim(),
      dob: form.dob,
      gender: form.gender as 'L' | 'P',
      phone: form.phone.trim(),
      address: form.address.trim(),
      insurance: form.insurance,
      bloodType: form.bloodType || undefined,
      allergy: form.allergy.trim() || undefined,
      createdAt: new Date().toISOString(),
    };

    patientStore.add(newPatient);
    refreshPatients();
    showToast(`Pasien ${newPatient.name} (${rm}) berhasil didaftarkan!`);

    // Go to queue step
    setPendingPatient(newPatient);
    setSelectedPoli('Poli Umum');
    setCreatedTicket(null);
    setAddStep('queue');
  };

  // ── Handle queue creation (from add modal step 2) ──────────────────────────
  const handleEnqueueFromAddModal = () => {
    if (!pendingPatient) return;
    const prefix = POLI_PREFIX[selectedPoli];
    const ticket = queueStore.nextTicket(prefix);
    const queueItem: QueueItem = {
      id: uid(),
      ticketNumber: ticket,
      patientId: pendingPatient.id,
      patientName: pendingPatient.name,
      poli: selectedPoli,
      status: 'waiting',
      createdAt: new Date().toISOString(),
    };
    queueStore.add(queueItem);
    setCreatedTicket(ticket);
    showToast(`Nomor antrian ${ticket} (${selectedPoli}) berhasil dibuat!`);
  };

  const handleCloseAddModal = () => {
    setShowAddModal(false);
    setForm(blankForm());
    setFormErrors({});
    setAddStep('form');
    setPendingPatient(null);
    setCreatedTicket(null);
    setSelectedPoli('Poli Umum');
  };

  // ── Handle queue from existing patient row button ──────────────────────────
  const openQueueModal = (patient: Patient) => {
    setQueueTarget(patient);
    setSelectedPoli('Poli Umum');
    setCreatedTicket(null);
    setShowQueueModal(true);
  };

  const handleEnqueueExisting = () => {
    if (!queueTarget) return;
    const prefix = POLI_PREFIX[selectedPoli];
    const ticket = queueStore.nextTicket(prefix);
    const queueItem: QueueItem = {
      id: uid(),
      ticketNumber: ticket,
      patientId: queueTarget.id,
      patientName: queueTarget.name,
      poli: selectedPoli,
      status: 'waiting',
      createdAt: new Date().toISOString(),
    };
    queueStore.add(queueItem);
    setCreatedTicket(ticket);
    showToast(`Nomor antrian ${ticket} (${selectedPoli}) berhasil dibuat!`);
  };

  const handleCloseQueueModal = () => {
    setShowQueueModal(false);
    setQueueTarget(null);
    setCreatedTicket(null);
    setSelectedPoli('Poli Umum');
  };

  // ── Field helpers ──────────────────────────────────────────────────────────
  const setField = <K extends keyof PatientForm>(key: K, value: PatientForm[K]) => {
    setForm((prev) => ({ ...prev, [key]: value }));
    if (formErrors[key]) setFormErrors((prev) => ({ ...prev, [key]: undefined }));
  };

  // ── Badges ─────────────────────────────────────────────────────────────────
  const genderBadge = (g: 'L' | 'P') =>
    g === 'L'
      ? 'bg-blue-100 text-blue-700'
      : 'bg-pink-100 text-pink-700';

  const insuranceBadge = (ins: string) => {
    if (ins === 'BPJS') return 'bg-emerald-100 text-emerald-700';
    if (ins === 'Asuransi') return 'bg-purple-100 text-purple-700';
    return 'bg-slate-100 text-slate-600';
  };

  // ── Render ─────────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-slate-50 p-6">
      {/* ── Toast ─────────────────────────────────────────────────────────── */}
      {toast.visible && (
        <div className="fixed top-5 right-5 z-[100] flex items-center gap-3 rounded-2xl bg-teal-600 px-5 py-3 text-white shadow-xl animate-fade-in">
          <CheckCircle2 className="h-5 w-5 shrink-0" />
          <span className="text-sm font-medium">{toast.message}</span>
        </div>
      )}

      {/* ── Page Header ───────────────────────────────────────────────────── */}
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Pendaftaran Pasien</h1>
          <p className="mt-0.5 text-sm text-slate-500">
            Kelola data pasien dan pendaftaran antrian poli
          </p>
        </div>
        <button
          onClick={() => {
            setForm(blankForm());
            setFormErrors({});
            setAddStep('form');
            setPendingPatient(null);
            setCreatedTicket(null);
            setShowAddModal(true);
          }}
          className="flex items-center gap-2 bg-teal-600 hover:bg-teal-700 text-white px-4 py-2 rounded-xl text-sm font-medium shadow-sm transition-colors"
        >
          <Plus className="h-4 w-4" />
          Pasien Baru
        </button>
      </div>

      {/* ── Stats bar ─────────────────────────────────────────────────────── */}
      <div className="mb-5 grid grid-cols-2 gap-4 sm:grid-cols-4">
        {[
          { label: 'Total Pasien', value: patients.length, color: 'text-teal-600', bg: 'bg-teal-50' },
          { label: 'BPJS', value: patients.filter((p) => p.insurance === 'BPJS').length, color: 'text-emerald-600', bg: 'bg-emerald-50' },
          { label: 'Asuransi', value: patients.filter((p) => p.insurance === 'Asuransi').length, color: 'text-purple-600', bg: 'bg-purple-50' },
          { label: 'Umum', value: patients.filter((p) => p.insurance === 'Umum').length, color: 'text-slate-600', bg: 'bg-slate-100' },
        ].map((s) => (
          <div key={s.label} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className={`mb-2 inline-flex rounded-xl ${s.bg} p-2`}>
              <Users className={`h-4 w-4 ${s.color}`} />
            </div>
            <div className={`text-2xl font-bold ${s.color}`}>{s.value}</div>
            <div className="text-xs text-slate-500">{s.label}</div>
          </div>
        ))}
      </div>

      {/* ── Patient Table Card ────────────────────────────────────────────── */}
      <div className="rounded-2xl border border-slate-200 bg-white shadow-sm">
        {/* Toolbar */}
        <div className="flex flex-col gap-3 border-b border-slate-100 p-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-widest">
              Daftar Pasien
            </span>
            <span className="inline rounded-full bg-teal-100 px-2.5 py-0.5 text-xs font-medium text-teal-700">
              {filtered.length}
            </span>
          </div>
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 pointer-events-none" />
              <input
                type="text"
                placeholder="Cari nama, NIK, atau RM..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="border border-slate-200 rounded-xl pl-9 pr-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 w-64"
              />
            </div>
            {/* Insurance filter */}
            <select
              value={filterInsurance}
              onChange={(e) => setFilterInsurance(e.target.value)}
              className="border border-slate-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 bg-white"
            >
              <option value="Semua">Semua Penjamin</option>
              {INSURANCE_OPTIONS.map((ins) => (
                <option key={ins} value={ins}>{ins}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50/70">
                <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">RM</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Nama</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">NIK</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Gender</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">No HP</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Penjamin</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-400">
                    <Users className="mx-auto mb-2 h-8 w-8 opacity-30" />
                    <p className="text-sm">Tidak ada pasien ditemukan</p>
                  </td>
                </tr>
              ) : (
                filtered.map((patient) => (
                  <tr
                    key={patient.id}
                    className="border-b border-slate-50 hover:bg-slate-50/70 transition-colors last:border-0"
                  >
                    <td className="px-4 py-3 font-mono text-xs text-teal-700 font-semibold whitespace-nowrap">
                      {patient.rm}
                    </td>
                    <td className="px-4 py-3">
                      <div className="font-medium text-slate-800">{patient.name}</div>
                      <div className="text-xs text-slate-400">{fmtDate(patient.dob)}</div>
                    </td>
                    <td className="px-4 py-3 font-mono text-xs text-slate-600 whitespace-nowrap">
                      {patient.nik}
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`inline rounded-full px-2.5 py-0.5 text-xs font-medium ${genderBadge(patient.gender)}`}
                      >
                        {patient.gender === 'L' ? 'Laki-laki' : 'Perempuan'}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-slate-600 whitespace-nowrap">{patient.phone}</td>
                    <td className="px-4 py-3">
                      <span
                        className={`inline rounded-full px-2.5 py-0.5 text-xs font-medium ${insuranceBadge(patient.insurance)}`}
                      >
                        {patient.insurance}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <button
                        onClick={() => openQueueModal(patient)}
                        className="flex items-center gap-1.5 bg-white border border-slate-200 hover:bg-teal-50 hover:border-teal-300 hover:text-teal-700 text-slate-700 px-3 py-1.5 rounded-xl text-xs font-medium transition-colors whitespace-nowrap"
                      >
                        <ClipboardList className="h-3.5 w-3.5" />
                        Daftarkan Antrian
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ══════════════════════════════════════════════════════════════════════
          ADD PATIENT MODAL
      ══════════════════════════════════════════════════════════════════════ */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-lg shadow-xl max-h-[90vh] overflow-y-auto">

            {/* ── Step 1: Patient Form ──────────────────────────────────── */}
            {addStep === 'form' && (
              <>
                <div className="mb-5 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-teal-100">
                      <UserPlus className="h-4 w-4 text-teal-600" />
                    </div>
                    <div>
                      <h2 className="font-bold text-slate-800">Pasien Baru</h2>
                      <p className="text-xs text-slate-500">Isi data identitas pasien</p>
                    </div>
                  </div>
                  <button
                    onClick={handleCloseAddModal}
                    className="rounded-xl p-1.5 hover:bg-slate-100 text-slate-400 transition-colors"
                  >
                    <X className="h-5 w-5" />
                  </button>
                </div>

                <div className="space-y-4">
                  {/* Nama Lengkap */}
                  <div>
                    <label className="mb-1 block text-xs font-semibold text-slate-600">
                      Nama Lengkap <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={form.name}
                      onChange={(e) => setField('name', e.target.value)}
                      placeholder="contoh: Bapak Hendra Wijaya"
                      className={`w-full border rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 ${formErrors.name ? 'border-red-400' : 'border-slate-200'}`}
                    />
                    {formErrors.name && <p className="mt-1 text-xs text-red-500">{formErrors.name}</p>}
                  </div>

                  {/* NIK */}
                  <div>
                    <label className="mb-1 block text-xs font-semibold text-slate-600">
                      NIK <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={form.nik}
                      onChange={(e) => setField('nik', e.target.value.replace(/\D/g, '').slice(0, 16))}
                      placeholder="16 digit NIK"
                      className={`w-full border rounded-xl px-3 py-2 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-teal-500 ${formErrors.nik ? 'border-red-400' : 'border-slate-200'}`}
                    />
                    {formErrors.nik && <p className="mt-1 text-xs text-red-500">{formErrors.nik}</p>}
                  </div>

                  {/* Tanggal Lahir + Jenis Kelamin */}
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="mb-1 block text-xs font-semibold text-slate-600">
                        Tanggal Lahir <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="date"
                        value={form.dob}
                        onChange={(e) => setField('dob', e.target.value)}
                        className={`w-full border rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 ${formErrors.dob ? 'border-red-400' : 'border-slate-200'}`}
                      />
                      {formErrors.dob && <p className="mt-1 text-xs text-red-500">{formErrors.dob}</p>}
                    </div>
                    <div>
                      <label className="mb-1 block text-xs font-semibold text-slate-600">
                        Jenis Kelamin <span className="text-red-500">*</span>
                      </label>
                      <select
                        value={form.gender}
                        onChange={(e) => setField('gender', e.target.value as 'L' | 'P')}
                        className={`w-full border rounded-xl px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-teal-500 ${formErrors.gender ? 'border-red-400' : 'border-slate-200'}`}
                      >
                        <option value="">Pilih</option>
                        <option value="L">Laki-laki</option>
                        <option value="P">Perempuan</option>
                      </select>
                      {formErrors.gender && <p className="mt-1 text-xs text-red-500">{formErrors.gender}</p>}
                    </div>
                  </div>

                  {/* No HP */}
                  <div>
                    <label className="mb-1 block text-xs font-semibold text-slate-600">
                      No. HP <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="tel"
                      value={form.phone}
                      onChange={(e) => setField('phone', e.target.value)}
                      placeholder="08xxxxxxxxxx"
                      className={`w-full border rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 ${formErrors.phone ? 'border-red-400' : 'border-slate-200'}`}
                    />
                    {formErrors.phone && <p className="mt-1 text-xs text-red-500">{formErrors.phone}</p>}
                  </div>

                  {/* Alamat */}
                  <div>
                    <label className="mb-1 block text-xs font-semibold text-slate-600">
                      Alamat <span className="text-red-500">*</span>
                    </label>
                    <textarea
                      value={form.address}
                      onChange={(e) => setField('address', e.target.value)}
                      placeholder="Jl. ..."
                      rows={2}
                      className={`w-full border rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 resize-none ${formErrors.address ? 'border-red-400' : 'border-slate-200'}`}
                    />
                    {formErrors.address && <p className="mt-1 text-xs text-red-500">{formErrors.address}</p>}
                  </div>

                  {/* Penjamin + Golongan Darah */}
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="mb-1 block text-xs font-semibold text-slate-600">Penjamin</label>
                      <select
                        value={form.insurance}
                        onChange={(e) => setField('insurance', e.target.value as Patient['insurance'])}
                        className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-teal-500"
                      >
                        {INSURANCE_OPTIONS.map((ins) => (
                          <option key={ins} value={ins}>{ins}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="mb-1 block text-xs font-semibold text-slate-600">Golongan Darah</label>
                      <select
                        value={form.bloodType}
                        onChange={(e) => setField('bloodType', e.target.value as 'A' | 'B' | 'AB' | 'O' | '')}

                        className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-teal-500"
                      >
                        <option value="">Tidak diketahui</option>
                        {BLOOD_TYPE_OPTIONS.map((bt) => (
                          <option key={bt} value={bt}>{bt}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  {/* Alergi */}
                  <div>
                    <label className="mb-1 block text-xs font-semibold text-slate-600">Alergi</label>
                    <input
                      type="text"
                      value={form.allergy}
                      onChange={(e) => setField('allergy', e.target.value)}
                      placeholder="contoh: Penisilin, Sulfa (kosongkan jika tidak ada)"
                      className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
                    />
                  </div>
                </div>

                {/* Actions */}
                <div className="mt-6 flex justify-end gap-2">
                  <button
                    onClick={handleCloseAddModal}
                    className="bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 px-4 py-2 rounded-xl text-sm font-medium transition-colors"
                  >
                    Batal
                  </button>
                  <button
                    onClick={handleAddPatient}
                    className="flex items-center gap-2 bg-teal-600 hover:bg-teal-700 text-white px-4 py-2 rounded-xl text-sm font-medium transition-colors"
                  >
                    Daftarkan Pasien
                    <ChevronRight className="h-4 w-4" />
                  </button>
                </div>
              </>
            )}

            {/* ── Step 2: Queue Registration ────────────────────────────── */}
            {addStep === 'queue' && pendingPatient && (
              <>
                <div className="mb-5 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-emerald-100">
                      <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                    </div>
                    <div>
                      <h2 className="font-bold text-slate-800">Pasien Terdaftar!</h2>
                      <p className="text-xs text-slate-500">
                        {pendingPatient.rm} · {pendingPatient.name}
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={handleCloseAddModal}
                    className="rounded-xl p-1.5 hover:bg-slate-100 text-slate-400 transition-colors"
                  >
                    <X className="h-5 w-5" />
                  </button>
                </div>

                {!createdTicket ? (
                  <>
                    <div className="mb-4 rounded-xl border border-slate-100 bg-slate-50 p-4">
                      <p className="mb-3 text-sm font-semibold text-slate-700">
                        Daftarkan ke Antrian Sekarang?
                      </p>
                      <label className="mb-1 block text-xs font-semibold text-slate-500 uppercase tracking-wider">
                        Pilih Poli
                      </label>
                      <div className="grid grid-cols-2 gap-2">
                        {POLI_OPTIONS.map((poli) => (
                          <button
                            key={poli}
                            onClick={() => setSelectedPoli(poli)}
                            className={`rounded-xl border px-3 py-2.5 text-sm font-medium text-left transition-colors ${
                              selectedPoli === poli
                                ? 'border-teal-500 bg-teal-50 text-teal-700'
                                : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
                            }`}
                          >
                            <div className="flex items-center justify-between">
                              <span>{poli}</span>
                              <span className="rounded-md bg-slate-100 px-1.5 py-0.5 text-xs font-mono text-slate-500">
                                {POLI_PREFIX[poli]}
                              </span>
                            </div>
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="flex gap-2">
                      <button
                        onClick={handleCloseAddModal}
                        className="flex-1 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 px-4 py-2 rounded-xl text-sm font-medium transition-colors"
                      >
                        Lewati
                      </button>
                      <button
                        onClick={handleEnqueueFromAddModal}
                        className="flex-1 flex items-center justify-center gap-2 bg-teal-600 hover:bg-teal-700 text-white px-4 py-2 rounded-xl text-sm font-medium transition-colors"
                      >
                        <Ticket className="h-4 w-4" />
                        Ya, Daftarkan Antrian
                      </button>
                    </div>
                  </>
                ) : (
                  <>
                    {/* Ticket success display */}
                    <div className="mb-5 flex flex-col items-center rounded-2xl border-2 border-teal-200 bg-teal-50 p-6 text-center">
                      <Ticket className="mb-2 h-10 w-10 text-teal-500" />
                      <p className="text-xs font-semibold uppercase tracking-widest text-teal-500 mb-1">
                        Nomor Antrian
                      </p>
                      <p className="text-5xl font-black text-teal-700 font-mono tracking-widest">
                        {createdTicket}
                      </p>
                      <p className="mt-2 text-sm text-teal-600 font-medium">{selectedPoli}</p>
                      <p className="mt-1 text-xs text-slate-500">{pendingPatient.name}</p>
                    </div>
                    <button
                      onClick={handleCloseAddModal}
                      className="w-full bg-teal-600 hover:bg-teal-700 text-white px-4 py-2.5 rounded-xl text-sm font-medium transition-colors"
                    >
                      Selesai
                    </button>
                  </>
                )}
              </>
            )}
          </div>
        </div>
      )}

      {/* ══════════════════════════════════════════════════════════════════════
          QUEUE MODAL (Existing Patient)
      ══════════════════════════════════════════════════════════════════════ */}
      {showQueueModal && queueTarget && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md shadow-xl">
            <div className="mb-5 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-teal-100">
                  <ClipboardList className="h-4 w-4 text-teal-600" />
                </div>
                <div>
                  <h2 className="font-bold text-slate-800">Daftarkan Antrian</h2>
                  <p className="text-xs text-slate-500 truncate max-w-[220px]">
                    {queueTarget.rm} · {queueTarget.name}
                  </p>
                </div>
              </div>
              <button
                onClick={handleCloseQueueModal}
                className="rounded-xl p-1.5 hover:bg-slate-100 text-slate-400 transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {!createdTicket ? (
              <>
                <div className="mb-4 rounded-xl border border-slate-100 bg-slate-50 p-4">
                  <label className="mb-2 block text-xs font-semibold text-slate-500 uppercase tracking-wider">
                    Pilih Poli Tujuan
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    {POLI_OPTIONS.map((poli) => (
                      <button
                        key={poli}
                        onClick={() => setSelectedPoli(poli)}
                        className={`rounded-xl border px-3 py-2.5 text-sm font-medium text-left transition-colors ${
                          selectedPoli === poli
                            ? 'border-teal-500 bg-teal-50 text-teal-700'
                            : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <span>{poli}</span>
                          <span className="rounded-md bg-slate-100 px-1.5 py-0.5 text-xs font-mono text-slate-500">
                            {POLI_PREFIX[poli]}
                          </span>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>

                <div className="flex gap-2">
                  <button
                    onClick={handleCloseQueueModal}
                    className="flex-1 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 px-4 py-2 rounded-xl text-sm font-medium transition-colors"
                  >
                    Batal
                  </button>
                  <button
                    onClick={handleEnqueueExisting}
                    className="flex-1 flex items-center justify-center gap-2 bg-teal-600 hover:bg-teal-700 text-white px-4 py-2 rounded-xl text-sm font-medium transition-colors"
                  >
                    <Ticket className="h-4 w-4" />
                    Buat Nomor Antrian
                  </button>
                </div>
              </>
            ) : (
              <>
                <div className="mb-5 flex flex-col items-center rounded-2xl border-2 border-teal-200 bg-teal-50 p-6 text-center">
                  <Ticket className="mb-2 h-10 w-10 text-teal-500" />
                  <p className="text-xs font-semibold uppercase tracking-widest text-teal-500 mb-1">
                    Nomor Antrian
                  </p>
                  <p className="text-5xl font-black text-teal-700 font-mono tracking-widest">
                    {createdTicket}
                  </p>
                  <p className="mt-2 text-sm text-teal-600 font-medium">{selectedPoli}</p>
                  <p className="mt-1 text-xs text-slate-500">{queueTarget.name}</p>
                </div>
                <button
                  onClick={handleCloseQueueModal}
                  className="w-full bg-teal-600 hover:bg-teal-700 text-white px-4 py-2.5 rounded-xl text-sm font-medium transition-colors"
                >
                  Selesai
                </button>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
