'use client';

import { useEffect, useState, useMemo } from 'react';
import {
  Bell,
  Baby,
  Phone,
  Calendar,
  CheckCircle2,
  Circle,
  ChevronRight,
  Plus,
  X,
  Activity,
  Heart,
  Weight,
  Stethoscope,
  AlertCircle,
  Clock,
  Users,
  MessageCircle,
} from 'lucide-react';
import {
  initStore,
  patientStore,
  visitStore,
  ancStore,
  uid,
  calcEDD,
  gestationalAge,
  fmtDate,
} from '@/lib/store';
import type { Patient, Visit, ANCRecord, ANCVisit } from '@/lib/types';

// ---------------------------------------------------------------------------
// helpers
// ---------------------------------------------------------------------------
function diffDays(isoDate: string): number {
  const target = new Date(isoDate);
  target.setHours(0, 0, 0, 0);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return Math.round((target.getTime() - today.getTime()) / 86_400_000);
}

function formatPhoneWA(phone: string): string {
  const stripped = phone.replace(/\D/g, '');
  if (stripped.startsWith('0')) return '62' + stripped.slice(1);
  if (stripped.startsWith('62')) return stripped;
  return '62' + stripped;
}

function controlDateColor(isoDate: string): string {
  const d = diffDays(isoDate);
  if (d < 0) return 'text-red-600 bg-red-50 border-red-200';
  if (d <= 3) return 'text-amber-600 bg-amber-50 border-amber-200';
  return 'text-green-700 bg-green-50 border-green-200';
}

function controlDateLabel(isoDate: string): string {
  const d = diffDays(isoDate);
  if (d < 0) return `Terlambat ${Math.abs(d)} hari`;
  if (d === 0) return 'Hari ini';
  if (d === 1) return 'Besok';
  return `${d} hari lagi`;
}

function trimesterLabel(weeks: number): { label: string; color: string; num: number } {
  if (weeks < 14) return { label: 'Trimester 1', color: 'bg-blue-100 text-blue-700', num: 1 };
  if (weeks < 28) return { label: 'Trimester 2', color: 'bg-violet-100 text-violet-700', num: 2 };
  return { label: 'Trimester 3', color: 'bg-rose-100 text-rose-700', num: 3 };
}

function formatDateDisplay(iso: string): string {
  if (!iso) return '-';
  try {
    return fmtDate(iso);
  } catch {
    return iso;
  }
}

// ---------------------------------------------------------------------------
// types
// ---------------------------------------------------------------------------
interface ReminderEntry {
  patient: Patient;
  lastVisit: Visit;
  controlDate: string;
  contacted: boolean;
}

interface ANCVisitForm {
  date: string;
  weight: string;
  bloodPressure: string;
  fetalHeartRate: string;
  uterineFundus: string;
  presentation: string;
  notes: string;
}

interface NewANCForm {
  patientId: string;
  lmpDate: string;
  gravida: string;
  para: string;
  abortus: string;
}

const PRESENTATION_OPTIONS = ['Kepala', 'Bokong', 'Lintang', '-'];

// ---------------------------------------------------------------------------
// main page
// ---------------------------------------------------------------------------
export default function ReminderPage() {
  const [tab, setTab] = useState<'reminder' | 'anc'>('reminder');

  // --- reminder tab state ---
  const [reminders, setReminders] = useState<ReminderEntry[]>([]);
  const [contacted, setContacted] = useState<Record<string, boolean>>({});

  // --- anc tab state ---
  const [ancRecords, setAncRecords] = useState<ANCRecord[]>([]);
  const [patients, setPatients] = useState<Patient[]>([]);
  const [selectedPatientId, setSelectedPatientId] = useState<string | null>(null);

  // --- modals ---
  const [showAddVisitModal, setShowAddVisitModal] = useState(false);
  const [showAddANCModal, setShowAddANCModal] = useState(false);

  const [visitForm, setVisitForm] = useState<ANCVisitForm>({
    date: new Date().toISOString().slice(0, 10),
    weight: '',
    bloodPressure: '',
    fetalHeartRate: '',
    uterineFundus: '',
    presentation: 'Kepala',
    notes: '',
  });

  const [newANCForm, setNewANCForm] = useState<NewANCForm>({
    patientId: '',
    lmpDate: '',
    gravida: '1',
    para: '0',
    abortus: '0',
  });

  // ---------------------------------------------------------------------------
  // load data
  // ---------------------------------------------------------------------------
  useEffect(() => {
    initStore();
    const allPatients = patientStore.getAll();
    const allVisits = visitStore.getAll();
    const allANC = ancStore.getAll();

    setPatients(allPatients);
    setAncRecords(allANC);

    // build reminder list: last visit per patient that has controlDate within 14 days or overdue
    const patientLastVisit: Record<string, Visit> = {};
    allVisits.forEach((v) => {
      if (!v.controlDate) return;
      const existing = patientLastVisit[v.patientId];
      if (!existing || v.date > existing.date) {
        patientLastVisit[v.patientId] = v;
      }
    });

    const entries: ReminderEntry[] = [];
    Object.values(patientLastVisit).forEach((visit) => {
      if (!visit.controlDate) return;
      const d = diffDays(visit.controlDate);
      if (d <= 14) {
        const patient = allPatients.find((p) => p.id === visit.patientId);
        if (patient) {
          entries.push({ patient, lastVisit: visit, controlDate: visit.controlDate, contacted: false });
        }
      }
    });

    entries.sort((a, b) => a.controlDate.localeCompare(b.controlDate));
    setReminders(entries);
  }, []);

  // ---------------------------------------------------------------------------
  // derived
  // ---------------------------------------------------------------------------
  const contactedCount = useMemo(() => Object.values(contacted).filter(Boolean).length, [contacted]);
  const todayReminders = useMemo(
    () => reminders.filter((r) => diffDays(r.controlDate) <= 0).length,
    [reminders]
  );

  const selectedANC = useMemo(
    () => ancRecords.find((a) => a.patientId === selectedPatientId) ?? null,
    [ancRecords, selectedPatientId]
  );

  const selectedPatient = useMemo(
    () => patients.find((p) => p.id === selectedPatientId) ?? null,
    [patients, selectedPatientId]
  );

  const ancPatients = useMemo(
    () =>
      ancRecords
        .map((a) => patients.find((p) => p.id === a.patientId))
        .filter(Boolean) as Patient[],
    [ancRecords, patients]
  );

  const femalePatients = useMemo(
    () => patients.filter((p) => p.gender === 'P'),
    [patients]
  );

  const femaleWithoutANC = useMemo(
    () => femalePatients.filter((p) => !ancRecords.find((a) => a.patientId === p.id)),
    [femalePatients, ancRecords]
  );

  // ---------------------------------------------------------------------------
  // handlers
  // ---------------------------------------------------------------------------
  function toggleContacted(patientId: string) {
    setContacted((prev) => ({ ...prev, [patientId]: !prev[patientId] }));
  }

  function sendWhatsApp(entry: ReminderEntry) {
    const waPhone = formatPhoneWA(entry.patient.phone);
    const dateStr = formatDateDisplay(entry.controlDate);
    const message = `Halo ${entry.patient.name}, kami dari Klinik Pratama Sehat Bersama mengingatkan jadwal kontrol Anda pada ${dateStr}. Harap datang tepat waktu. Terima kasih 🙏`;
    const url = `https://api.whatsapp.com/send?phone=${waPhone}&text=${encodeURIComponent(message)}`;
    window.open(url, '_blank');
  }

  function openAddVisitModal() {
    setVisitForm({
      date: new Date().toISOString().slice(0, 10),
      weight: '',
      bloodPressure: '',
      fetalHeartRate: '',
      uterineFundus: '',
      presentation: 'Kepala',
      notes: '',
    });
    setShowAddVisitModal(true);
  }

  function saveANCVisit() {
    if (!selectedANC || !selectedPatientId) return;
    const { weeks } = gestationalAge(selectedANC.lmpDate);
    const newVisit: ANCVisit = {
      id: uid(),
      date: visitForm.date,
      ageWeeks: weeks,
      weight: parseFloat(visitForm.weight) || 0,
      bloodPressure: visitForm.bloodPressure,
      fetalHeartRate: parseInt(visitForm.fetalHeartRate) || 0,
      uterineFundus: parseFloat(visitForm.uterineFundus) || 0,
      presentation: visitForm.presentation,
      notes: visitForm.notes,
    };
    const updated: ANCRecord = {
      ...selectedANC,
      visits: [...selectedANC.visits, newVisit].sort((a, b) => a.date.localeCompare(b.date)),
    };
    ancStore.upsert(updated);
    setAncRecords(ancStore.getAll());
    setShowAddVisitModal(false);
  }

  function saveNewANC() {
    if (!newANCForm.patientId || !newANCForm.lmpDate) return;
    const edd = calcEDD(newANCForm.lmpDate);
    const record: ANCRecord = {
      patientId: newANCForm.patientId,
      lmpDate: newANCForm.lmpDate,
      edd,
      gravida: parseInt(newANCForm.gravida) || 1,
      para: parseInt(newANCForm.para) || 0,
      abortus: parseInt(newANCForm.abortus) || 0,
      visits: [],
    };
    ancStore.upsert(record);
    const allANC = ancStore.getAll();
    setAncRecords(allANC);
    setSelectedPatientId(newANCForm.patientId);
    setShowAddANCModal(false);
    setNewANCForm({ patientId: '', lmpDate: '', gravida: '1', para: '0', abortus: '0' });
    setTab('anc');
  }

  // ---------------------------------------------------------------------------
  // render
  // ---------------------------------------------------------------------------
  return (
    <div className="min-h-screen bg-slate-50 p-6">
      {/* Page Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-800">Reminder & ANC</h1>
        <p className="text-sm text-slate-500 mt-1">Pengingat kontrol pasien & jadwal antenatal care</p>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 mb-6 bg-white border border-slate-200 rounded-2xl p-1 w-fit shadow-sm">
        <button
          onClick={() => setTab('reminder')}
          className={`flex items-center gap-2 px-5 py-2 rounded-xl text-sm font-medium transition-all ${
            tab === 'reminder'
              ? 'bg-teal-600 text-white shadow'
              : 'text-slate-600 hover:bg-slate-50'
          }`}
        >
          <Bell size={15} />
          Reminder Kontrol
        </button>
        <button
          onClick={() => setTab('anc')}
          className={`flex items-center gap-2 px-5 py-2 rounded-xl text-sm font-medium transition-all ${
            tab === 'anc'
              ? 'bg-teal-600 text-white shadow'
              : 'text-slate-600 hover:bg-slate-50'
          }`}
        >
          <Baby size={15} />
          Jadwal ANC
        </button>
      </div>

      {/* ================================================================
          TAB 1: REMINDER KONTROL
      ================================================================ */}
      {tab === 'reminder' && (
        <div className="space-y-5">
          {/* Quick stats */}
          <div className="grid grid-cols-3 gap-4">
            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-widest mb-1">Total Reminder</p>
              <p className="text-3xl font-bold text-slate-800">{reminders.length}</p>
              <p className="text-xs text-slate-400 mt-1">Dalam 14 hari ke depan</p>
            </div>
            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-widest mb-1">Sudah Dihubungi</p>
              <p className="text-3xl font-bold text-green-600">{contactedCount}</p>
              <p className="text-xs text-slate-400 mt-1">Ditandai hari ini</p>
            </div>
            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-widest mb-1">Belum Dihubungi</p>
              <p className="text-3xl font-bold text-red-500">{reminders.length - contactedCount}</p>
              <p className="text-xs text-slate-400 mt-1">Perlu tindak lanjut</p>
            </div>
          </div>

          {/* Reminder list */}
          {reminders.length === 0 ? (
            <div className="rounded-2xl border border-slate-200 bg-white p-12 shadow-sm text-center">
              <Bell size={40} className="mx-auto text-slate-300 mb-3" />
              <p className="text-slate-500 font-medium">Tidak ada jadwal kontrol dalam 14 hari ke depan</p>
              <p className="text-slate-400 text-sm mt-1">Semua pasien sudah terjadwal dengan baik</p>
            </div>
          ) : (
            <div className="space-y-3">
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-widest">
                Daftar Pasien ({reminders.length})
              </p>
              {reminders.map((entry) => {
                const d = diffDays(entry.controlDate);
                const colorClass = controlDateColor(entry.controlDate);
                const isContacted = contacted[entry.patient.id] ?? false;
                return (
                  <div
                    key={entry.patient.id}
                    className={`rounded-2xl border bg-white p-5 shadow-sm transition-opacity ${
                      isContacted ? 'opacity-60' : ''
                    }`}
                  >
                    <div className="flex items-start justify-between gap-4">
                      {/* Left info */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-3 flex-wrap">
                          <span className="font-semibold text-slate-800 text-base">
                            {entry.patient.name}
                          </span>
                          <span className="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium bg-slate-100 text-slate-600">
                            {entry.patient.rm}
                          </span>
                          <span
                            className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-medium border ${colorClass}`}
                          >
                            <Clock size={11} />
                            {controlDateLabel(entry.controlDate)}
                          </span>
                          {isContacted && (
                            <span className="inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-medium bg-green-100 text-green-700">
                              <CheckCircle2 size={11} />
                              Sudah dihubungi
                            </span>
                          )}
                        </div>

                        <div className="mt-2 flex flex-wrap gap-4 text-sm text-slate-500">
                          <span className="flex items-center gap-1.5">
                            <Phone size={13} className="text-teal-500" />
                            {entry.patient.phone}
                          </span>
                          <span className="flex items-center gap-1.5">
                            <Calendar size={13} className="text-teal-500" />
                            Kontrol: <strong className="text-slate-700">{formatDateDisplay(entry.controlDate)}</strong>
                          </span>
                          <span className="flex items-center gap-1.5">
                            <Stethoscope size={13} className="text-teal-500" />
                            {entry.lastVisit.poli}
                          </span>
                        </div>

                        {entry.lastVisit.assessment && (
                          <p className="mt-1.5 text-xs text-slate-400">
                            Diagnosis: <span className="text-slate-600 font-medium">{entry.lastVisit.assessment}</span>
                          </p>
                        )}
                      </div>

                      {/* Right actions */}
                      <div className="flex flex-col gap-2 shrink-0">
                        <button
                          onClick={() => sendWhatsApp(entry)}
                          className="flex items-center gap-2 bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-xl text-sm font-medium transition-colors"
                        >
                          <MessageCircle size={14} />
                          Kirim WhatsApp
                        </button>
                        <button
                          onClick={() => toggleContacted(entry.patient.id)}
                          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium border transition-colors ${
                            isContacted
                              ? 'bg-green-50 border-green-200 text-green-700 hover:bg-green-100'
                              : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                          }`}
                        >
                          {isContacted ? (
                            <CheckCircle2 size={14} />
                          ) : (
                            <Circle size={14} />
                          )}
                          {isContacted ? 'Sudah Dihubungi' : 'Tandai Dihubungi'}
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* ================================================================
          TAB 2: ANC
      ================================================================ */}
      {tab === 'anc' && (
        <div className="flex gap-5 items-start">
          {/* ---- Left column: ANC patient list ---- */}
          <div className="w-72 shrink-0 space-y-3">
            <button
              onClick={() => {
                setNewANCForm({ patientId: '', lmpDate: '', gravida: '1', para: '0', abortus: '0' });
                setShowAddANCModal(true);
              }}
              className="w-full flex items-center justify-center gap-2 bg-teal-600 hover:bg-teal-700 text-white px-4 py-2.5 rounded-xl text-sm font-medium transition-colors"
            >
              <Plus size={15} />
              Tambah Data ANC Baru
            </button>

            <p className="text-xs font-semibold text-slate-500 uppercase tracking-widest">
              Pasien Hamil ({ancPatients.length})
            </p>

            {ancPatients.length === 0 && (
              <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm text-center">
                <Baby size={32} className="mx-auto text-slate-300 mb-2" />
                <p className="text-slate-500 text-sm">Belum ada data ANC</p>
              </div>
            )}

            {ancPatients.map((p) => {
              const anc = ancRecords.find((a) => a.patientId === p.id)!;
              const { weeks, days } = gestationalAge(anc.lmpDate);
              const tri = trimesterLabel(weeks);
              const isSelected = selectedPatientId === p.id;
              return (
                <button
                  key={p.id}
                  onClick={() => setSelectedPatientId(p.id)}
                  className={`w-full text-left rounded-2xl border p-4 shadow-sm transition-all ${
                    isSelected
                      ? 'border-teal-500 bg-teal-50'
                      : 'border-slate-200 bg-white hover:bg-slate-50'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <p className="font-semibold text-slate-800 text-sm truncate">{p.name}</p>
                    <ChevronRight size={14} className="text-slate-400 shrink-0" />
                  </div>
                  <p className="text-xs text-slate-500 mt-0.5">{p.rm}</p>
                  <div className="flex items-center gap-2 mt-2 flex-wrap">
                    <span className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${tri.color}`}>
                      {tri.label}
                    </span>
                    <span className="text-xs text-slate-500">{weeks}m {days}h</span>
                  </div>
                  <p className="text-xs text-slate-400 mt-1">
                    G{anc.gravida}P{anc.para}A{anc.abortus} · {anc.visits.length} kunjungan
                  </p>
                </button>
              );
            })}
          </div>

          {/* ---- Right column: ANC detail ---- */}
          <div className="flex-1 min-w-0 space-y-4">
            {!selectedANC || !selectedPatient ? (
              <div className="rounded-2xl border border-slate-200 bg-white p-16 shadow-sm text-center">
                <Baby size={48} className="mx-auto text-slate-300 mb-3" />
                <p className="text-slate-500 font-medium">Pilih pasien untuk melihat detail ANC</p>
                <p className="text-slate-400 text-sm mt-1">atau tambah data ANC baru</p>
              </div>
            ) : (
              <ANCDetail
                patient={selectedPatient}
                anc={selectedANC}
                onAddVisit={openAddVisitModal}
              />
            )}
          </div>
        </div>
      )}

      {/* ================================================================
          MODAL: Tambah Kunjungan ANC
      ================================================================ */}
      {showAddVisitModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md shadow-xl">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold text-slate-800">Tambah Kunjungan ANC</h2>
              <button
                onClick={() => setShowAddVisitModal(false)}
                className="text-slate-400 hover:text-slate-600"
              >
                <X size={20} />
              </button>
            </div>

            <div className="space-y-3">
              <div>
                <label className="text-xs font-medium text-slate-600 block mb-1">Tanggal Kunjungan</label>
                <input
                  type="date"
                  value={visitForm.date}
                  onChange={(e) => setVisitForm((f) => ({ ...f, date: e.target.value }))}
                  className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-medium text-slate-600 block mb-1">Berat Badan (kg)</label>
                  <input
                    type="number"
                    step="0.1"
                    placeholder="misal: 65"
                    value={visitForm.weight}
                    onChange={(e) => setVisitForm((f) => ({ ...f, weight: e.target.value }))}
                    className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
                  />
                </div>
                <div>
                  <label className="text-xs font-medium text-slate-600 block mb-1">Tekanan Darah (mmHg)</label>
                  <input
                    type="text"
                    placeholder="misal: 110/70"
                    value={visitForm.bloodPressure}
                    onChange={(e) => setVisitForm((f) => ({ ...f, bloodPressure: e.target.value }))}
                    className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-medium text-slate-600 block mb-1">DJJ (bpm)</label>
                  <input
                    type="number"
                    placeholder="misal: 148"
                    value={visitForm.fetalHeartRate}
                    onChange={(e) => setVisitForm((f) => ({ ...f, fetalHeartRate: e.target.value }))}
                    className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
                  />
                </div>
                <div>
                  <label className="text-xs font-medium text-slate-600 block mb-1">TFU (cm)</label>
                  <input
                    type="number"
                    step="0.5"
                    placeholder="misal: 28"
                    value={visitForm.uterineFundus}
                    onChange={(e) => setVisitForm((f) => ({ ...f, uterineFundus: e.target.value }))}
                    className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-medium text-slate-600 block mb-1">Presentasi Janin</label>
                <select
                  value={visitForm.presentation}
                  onChange={(e) => setVisitForm((f) => ({ ...f, presentation: e.target.value }))}
                  className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
                >
                  {PRESENTATION_OPTIONS.map((o) => (
                    <option key={o} value={o}>{o}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-xs font-medium text-slate-600 block mb-1">Catatan</label>
                <textarea
                  rows={3}
                  placeholder="Catatan tambahan..."
                  value={visitForm.notes}
                  onChange={(e) => setVisitForm((f) => ({ ...f, notes: e.target.value }))}
                  className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 resize-none"
                />
              </div>
            </div>

            <div className="flex gap-2 mt-5">
              <button
                onClick={() => setShowAddVisitModal(false)}
                className="flex-1 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 px-4 py-2 rounded-xl text-sm font-medium"
              >
                Batal
              </button>
              <button
                onClick={saveANCVisit}
                disabled={!visitForm.date || !visitForm.bloodPressure}
                className="flex-1 bg-teal-600 hover:bg-teal-700 text-white px-4 py-2 rounded-xl text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                Simpan Kunjungan
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ================================================================
          MODAL: Tambah Data ANC Baru
      ================================================================ */}
      {showAddANCModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md shadow-xl">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold text-slate-800">Tambah Data ANC Baru</h2>
              <button
                onClick={() => setShowAddANCModal(false)}
                className="text-slate-400 hover:text-slate-600"
              >
                <X size={20} />
              </button>
            </div>

            <div className="space-y-3">
              <div>
                <label className="text-xs font-medium text-slate-600 block mb-1">Pasien Wanita</label>
                {femaleWithoutANC.length === 0 ? (
                  <p className="text-sm text-slate-500 italic">Semua pasien wanita sudah memiliki data ANC.</p>
                ) : (
                  <select
                    value={newANCForm.patientId}
                    onChange={(e) => setNewANCForm((f) => ({ ...f, patientId: e.target.value }))}
                    className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
                  >
                    <option value="">-- Pilih Pasien --</option>
                    {femaleWithoutANC.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.name} ({p.rm})
                      </option>
                    ))}
                  </select>
                )}
              </div>

              <div>
                <label className="text-xs font-medium text-slate-600 block mb-1">HPHT (Hari Pertama Haid Terakhir)</label>
                <input
                  type="date"
                  value={newANCForm.lmpDate}
                  onChange={(e) => setNewANCForm((f) => ({ ...f, lmpDate: e.target.value }))}
                  className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
                />
              </div>

              {newANCForm.lmpDate && (
                <div className="rounded-xl bg-teal-50 border border-teal-200 px-3 py-2 text-sm text-teal-700">
                  HPL (Taksiran Persalinan):{' '}
                  <strong>{formatDateDisplay(calcEDD(newANCForm.lmpDate))}</strong>
                </div>
              )}

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="text-xs font-medium text-slate-600 block mb-1">Gravida (G)</label>
                  <input
                    type="number"
                    min="1"
                    value={newANCForm.gravida}
                    onChange={(e) => setNewANCForm((f) => ({ ...f, gravida: e.target.value }))}
                    className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
                  />
                </div>
                <div>
                  <label className="text-xs font-medium text-slate-600 block mb-1">Para (P)</label>
                  <input
                    type="number"
                    min="0"
                    value={newANCForm.para}
                    onChange={(e) => setNewANCForm((f) => ({ ...f, para: e.target.value }))}
                    className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
                  />
                </div>
                <div>
                  <label className="text-xs font-medium text-slate-600 block mb-1">Abortus (A)</label>
                  <input
                    type="number"
                    min="0"
                    value={newANCForm.abortus}
                    onChange={(e) => setNewANCForm((f) => ({ ...f, abortus: e.target.value }))}
                    className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
                  />
                </div>
              </div>
            </div>

            <div className="flex gap-2 mt-5">
              <button
                onClick={() => setShowAddANCModal(false)}
                className="flex-1 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 px-4 py-2 rounded-xl text-sm font-medium"
              >
                Batal
              </button>
              <button
                onClick={saveNewANC}
                disabled={!newANCForm.patientId || !newANCForm.lmpDate}
                className="flex-1 bg-teal-600 hover:bg-teal-700 text-white px-4 py-2 rounded-xl text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                Simpan Data ANC
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// ANC Detail sub-component
// ---------------------------------------------------------------------------
interface ANCDetailProps {
  patient: Patient;
  anc: ANCRecord;
  onAddVisit: () => void;
}

function ANCDetail({ patient, anc, onAddVisit }: ANCDetailProps) {
  const { weeks, days } = gestationalAge(anc.lmpDate);
  const tri = trimesterLabel(weeks);
  const progressPct = Math.min(100, Math.round((weeks / 40) * 100));

  // visit counts per trimester
  const t1Visits = anc.visits.filter((v) => v.ageWeeks < 14).length;
  const t2Visits = anc.visits.filter((v) => v.ageWeeks >= 14 && v.ageWeeks < 28).length;
  const t3Visits = anc.visits.filter((v) => v.ageWeeks >= 28).length;

  return (
    <div className="space-y-4">
      {/* Patient summary card */}
      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <div className="flex items-start justify-between gap-4">
          <div>
            <div className="flex items-center gap-3 flex-wrap">
              <h2 className="text-xl font-bold text-slate-800">{patient.name}</h2>
              <span className="inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium bg-slate-100 text-slate-600">
                {patient.rm}
              </span>
              <span className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium ${tri.color}`}>
                {tri.label}
              </span>
            </div>
            <p className="text-sm font-semibold text-teal-700 mt-1">
              G{anc.gravida}P{anc.para}A{anc.abortus}
            </p>
          </div>
          <button
            onClick={onAddVisit}
            className="flex items-center gap-2 bg-teal-600 hover:bg-teal-700 text-white px-4 py-2 rounded-xl text-sm font-medium transition-colors shrink-0"
          >
            <Plus size={14} />
            Tambah Kunjungan
          </button>
        </div>

        {/* Date info */}
        <div className="grid grid-cols-3 gap-4 mt-4">
          <div className="rounded-xl bg-slate-50 border border-slate-200 p-3">
            <p className="text-xs text-slate-500 mb-1">HPHT</p>
            <p className="text-sm font-semibold text-slate-700">{formatDateDisplay(anc.lmpDate)}</p>
          </div>
          <div className="rounded-xl bg-slate-50 border border-slate-200 p-3">
            <p className="text-xs text-slate-500 mb-1">HPL (Taksiran)</p>
            <p className="text-sm font-semibold text-slate-700">{formatDateDisplay(anc.edd)}</p>
          </div>
          <div className="rounded-xl bg-teal-50 border border-teal-200 p-3">
            <p className="text-xs text-teal-600 mb-1">Usia Kehamilan</p>
            <p className="text-sm font-bold text-teal-700">{weeks} minggu {days} hari</p>
          </div>
        </div>

        {/* Progress bar */}
        <div className="mt-4">
          <div className="flex justify-between text-xs text-slate-500 mb-1.5">
            <span>0 minggu</span>
            <span className="font-medium text-teal-700">{progressPct}% perjalanan kehamilan</span>
            <span>40 minggu</span>
          </div>
          <div className="w-full h-3 bg-slate-100 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-teal-400 to-teal-600 rounded-full transition-all"
              style={{ width: `${progressPct}%` }}
            />
          </div>
          {/* Trimester markers */}
          <div className="flex mt-1">
            <div className="flex-1 text-center">
              <span className="text-xs text-blue-500 font-medium">T1 (0-13 mgg)</span>
            </div>
            <div className="flex-1 text-center">
              <span className="text-xs text-violet-500 font-medium">T2 (14-27 mgg)</span>
            </div>
            <div className="flex-1 text-center">
              <span className="text-xs text-rose-500 font-medium">T3 (28-40 mgg)</span>
            </div>
          </div>
        </div>
      </div>

      {/* ANC Schedule checklist */}
      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <p className="text-xs font-semibold text-slate-500 uppercase tracking-widest mb-3">
          Jadwal Kunjungan ANC (WHO Standard)
        </p>
        <div className="grid grid-cols-3 gap-3">
          <ScheduleCard
            trimester="Trimester 1"
            description="Usia 6–13 minggu"
            recommended={1}
            actual={t1Visits}
            color="blue"
            isCurrent={tri.num === 1}
          />
          <ScheduleCard
            trimester="Trimester 2"
            description="Usia 14–27 minggu"
            recommended={2}
            actual={t2Visits}
            color="violet"
            isCurrent={tri.num === 2}
          />
          <ScheduleCard
            trimester="Trimester 3"
            description="Usia 28–40 minggu"
            recommended={3}
            actual={t3Visits}
            color="rose"
            isCurrent={tri.num === 3}
          />
        </div>
      </div>

      {/* Visits table */}
      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-widest">
            Riwayat Kunjungan ANC ({anc.visits.length})
          </p>
        </div>

        {anc.visits.length === 0 ? (
          <div className="text-center py-8">
            <Activity size={32} className="mx-auto text-slate-300 mb-2" />
            <p className="text-slate-500 text-sm">Belum ada kunjungan ANC tercatat</p>
            <button
              onClick={onAddVisit}
              className="mt-3 inline-flex items-center gap-2 bg-teal-600 hover:bg-teal-700 text-white px-4 py-2 rounded-xl text-sm font-medium"
            >
              <Plus size={14} />
              Tambah Kunjungan Pertama
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left border-b border-slate-100">
                  <th className="pb-2 text-xs font-semibold text-slate-500 pr-4">Tanggal</th>
                  <th className="pb-2 text-xs font-semibold text-slate-500 pr-4">Usia (mgg)</th>
                  <th className="pb-2 text-xs font-semibold text-slate-500 pr-4">BB (kg)</th>
                  <th className="pb-2 text-xs font-semibold text-slate-500 pr-4">TD</th>
                  <th className="pb-2 text-xs font-semibold text-slate-500 pr-4">DJJ</th>
                  <th className="pb-2 text-xs font-semibold text-slate-500 pr-4">TFU</th>
                  <th className="pb-2 text-xs font-semibold text-slate-500 pr-4">Presentasi</th>
                  <th className="pb-2 text-xs font-semibold text-slate-500">Catatan</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {[...anc.visits]
                  .sort((a, b) => b.date.localeCompare(a.date))
                  .map((v) => (
                    <tr key={v.id} className="hover:bg-slate-50 transition-colors">
                      <td className="py-2.5 pr-4 font-medium text-slate-700 whitespace-nowrap">
                        {formatDateDisplay(v.date)}
                      </td>
                      <td className="py-2.5 pr-4">
                        <span className="inline-flex rounded-full px-2 py-0.5 text-xs font-medium bg-teal-50 text-teal-700">
                          {v.ageWeeks} mgg
                        </span>
                      </td>
                      <td className="py-2.5 pr-4 text-slate-600">
                        <span className="flex items-center gap-1">
                          <Weight size={12} className="text-slate-400" />
                          {v.weight > 0 ? `${v.weight}` : '-'}
                        </span>
                      </td>
                      <td className="py-2.5 pr-4 text-slate-600">
                        <span className="flex items-center gap-1">
                          <Activity size={12} className="text-slate-400" />
                          {v.bloodPressure || '-'}
                        </span>
                      </td>
                      <td className="py-2.5 pr-4 text-slate-600">
                        <span className="flex items-center gap-1">
                          <Heart size={12} className="text-rose-400" />
                          {v.fetalHeartRate > 0 ? `${v.fetalHeartRate}` : '-'}
                        </span>
                      </td>
                      <td className="py-2.5 pr-4 text-slate-600">
                        {v.uterineFundus > 0 ? `${v.uterineFundus} cm` : '-'}
                      </td>
                      <td className="py-2.5 pr-4">
                        {v.presentation && v.presentation !== '-' ? (
                          <span className="inline-flex rounded-full px-2 py-0.5 text-xs font-medium bg-slate-100 text-slate-700">
                            {v.presentation}
                          </span>
                        ) : (
                          <span className="text-slate-400">-</span>
                        )}
                      </td>
                      <td className="py-2.5 text-slate-500 text-xs max-w-[180px] truncate">
                        {v.notes || '-'}
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Schedule Card sub-component
// ---------------------------------------------------------------------------
interface ScheduleCardProps {
  trimester: string;
  description: string;
  recommended: number;
  actual: number;
  color: 'blue' | 'violet' | 'rose';
  isCurrent: boolean;
}

const colorMap = {
  blue: {
    header: 'bg-blue-100 text-blue-700',
    ring: 'ring-blue-300',
    filled: 'bg-blue-500',
    empty: 'bg-blue-100',
    badge: 'bg-blue-50 text-blue-700 border-blue-200',
  },
  violet: {
    header: 'bg-violet-100 text-violet-700',
    ring: 'ring-violet-300',
    filled: 'bg-violet-500',
    empty: 'bg-violet-100',
    badge: 'bg-violet-50 text-violet-700 border-violet-200',
  },
  rose: {
    header: 'bg-rose-100 text-rose-700',
    ring: 'ring-rose-300',
    filled: 'bg-rose-500',
    empty: 'bg-rose-100',
    badge: 'bg-rose-50 text-rose-700 border-rose-200',
  },
};

function ScheduleCard({ trimester, description, recommended, actual, color, isCurrent }: ScheduleCardProps) {
  const c = colorMap[color];
  const met = actual >= recommended;
  return (
    <div
      className={`rounded-xl border p-4 ${
        isCurrent ? `ring-2 ${c.ring} border-transparent` : 'border-slate-200'
      }`}
    >
      <div className={`inline-flex rounded-lg px-2.5 py-1 text-xs font-semibold mb-2 ${c.header}`}>
        {trimester}
        {isCurrent && (
          <span className="ml-1.5 text-[10px] font-bold uppercase tracking-wider opacity-70">• Sekarang</span>
        )}
      </div>
      <p className="text-xs text-slate-500 mb-3">{description}</p>

      {/* Dot indicators */}
      <div className="flex gap-1.5 mb-3">
        {Array.from({ length: recommended }).map((_, i) => (
          <div
            key={i}
            className={`w-5 h-5 rounded-full flex items-center justify-center ${
              i < actual ? c.filled : c.empty
            }`}
          >
            {i < actual && <CheckCircle2 size={12} className="text-white" />}
          </div>
        ))}
      </div>

      <div className="flex items-center gap-1.5">
        {met ? (
          <CheckCircle2 size={13} className="text-green-500" />
        ) : (
          <AlertCircle size={13} className="text-amber-500" />
        )}
        <span className={`text-xs font-medium ${met ? 'text-green-600' : 'text-amber-600'}`}>
          {actual}/{recommended} kunjungan
        </span>
      </div>
    </div>
  );
}
