'use client';

import { useEffect, useState, useCallback, useRef } from 'react';
import {
  Tv2,
  Plus,
  Volume2,
  CheckCircle,
  ArrowRight,
  SkipForward,
  Clock,
  Users,
  Activity,
  XCircle,
  X,
  Maximize2,
  Minimize2,
  ChevronRight,
} from 'lucide-react';
import {
  initStore,
  queueStore,
  patientStore,
  uid,
} from '@/lib/store';
import type { QueueItem, Patient } from '@/lib/types';

// ── Constants ──────────────────────────────────────────────────────────────
const POLI_LIST = ['Poli Umum', 'Poli Gigi', 'Poli KIA', 'Farmasi'] as const;
type PoliName = (typeof POLI_LIST)[number];

const POLI_PREFIX: Record<PoliName, string> = {
  'Poli Umum': 'A',
  'Poli Gigi': 'G',
  'Poli KIA': 'K',
  Farmasi: 'F',
};

const TAB_OPTIONS = ['Semua', ...POLI_LIST] as const;
type TabOption = (typeof TAB_OPTIONS)[number];

const STATUS_BADGE: Record<QueueItem['status'], string> = {
  waiting: 'bg-amber-100 text-amber-700',
  called: 'bg-blue-100 text-blue-700',
  'in-progress': 'bg-teal-100 text-teal-700',
  done: 'bg-slate-100 text-slate-500',
  skipped: 'bg-rose-100 text-rose-700',
};

const STATUS_LABEL: Record<QueueItem['status'], string> = {
  waiting: 'Menunggu',
  called: 'Dipanggil',
  'in-progress': 'Dalam Pemeriksaan',
  done: 'Selesai',
  skipped: 'Dilewati',
};

// ── TTS helper ─────────────────────────────────────────────────────────────
function speakQueue(ticketNumber: string, patientName: string, poli: string) {
  if (typeof window === 'undefined' || !window.speechSynthesis) return;
  window.speechSynthesis.cancel();
  const text = `Nomor antrian ${ticketNumber}, ${patientName}, silakan menuju ${poli}`;
  const utt = new SpeechSynthesisUtterance(text);
  utt.lang = 'id-ID';
  utt.rate = 0.9;
  window.speechSynthesis.speak(utt);
}

// ── Time formatter ──────────────────────────────────────────────────────────
function fmtTime(iso: string) {
  return new Date(iso).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' });
}

// ══════════════════════════════════════════════════════════════════════════
export default function AntrianPage() {
  const [queue, setQueue] = useState<QueueItem[]>([]);
  const [patients, setPatients] = useState<Patient[]>([]);
  const [activeTab, setActiveTab] = useState<TabOption>('Semua');
  const [showAddModal, setShowAddModal] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const displayRef = useRef<HTMLDivElement>(null);

  // Add-modal form state
  const [addPatientId, setAddPatientId] = useState('');
  const [addPoli, setAddPoli] = useState<PoliName>('Poli Umum');

  // ── Load ──────────────────────────────────────────────────────────────
  const load = useCallback(() => {
    initStore();
    setQueue(queueStore.getToday());
    setPatients(patientStore.getAll());
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  // ── Fullscreen toggle ─────────────────────────────────────────────────
  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      displayRef.current?.requestFullscreen();
      setIsFullscreen(true);
    } else {
      document.exitFullscreen();
      setIsFullscreen(false);
    }
  };

  useEffect(() => {
    const handler = () => setIsFullscreen(!!document.fullscreenElement);
    document.addEventListener('fullscreenchange', handler);
    return () => document.removeEventListener('fullscreenchange', handler);
  }, []);

  // ── Derived data ──────────────────────────────────────────────────────
  const currentItem: QueueItem | undefined =
    queue.find((q) => q.status === 'in-progress') ||
    [...queue].reverse().find((q) => q.status === 'called');

  const nextWaiting = queue
    .filter((q) => q.status === 'waiting')
    .sort((a, b) => a.createdAt.localeCompare(b.createdAt))
    .slice(0, 2);

  const filtered =
    activeTab === 'Semua'
      ? queue
      : queue.filter((q) => q.poli === activeTab);

  const stats = {
    total: queue.length,
    waiting: queue.filter((q) => q.status === 'waiting').length,
    inProgress: queue.filter((q) => q.status === 'in-progress').length,
    done: queue.filter((q) => q.status === 'done').length,
  };

  // ── Actions ───────────────────────────────────────────────────────────
  const updateStatus = (item: QueueItem, status: QueueItem['status']) => {
    const updated = { ...item, status };
    queueStore.update(updated);
    load();
  };

  const handleCall = (item: QueueItem) => {
    updateStatus(item, 'called');
    speakQueue(item.ticketNumber, item.patientName, item.poli);
  };

  const handleAddQueue = () => {
    if (!addPatientId) return;
    const patient = patients.find((p) => p.id === addPatientId);
    if (!patient) return;
    const prefix = POLI_PREFIX[addPoli];
    const ticketNumber = queueStore.nextTicket(prefix);
    const newItem: QueueItem = {
      id: uid(),
      ticketNumber,
      patientId: patient.id,
      patientName: patient.name,
      poli: addPoli,
      status: 'waiting',
      createdAt: new Date().toISOString(),
    };
    queueStore.add(newItem);
    load();
    setShowAddModal(false);
    setAddPatientId('');
    setAddPoli('Poli Umum');
  };

  // ══════════════════════════════════════════════════════════════════════
  return (
    <div className="min-h-screen bg-slate-50 p-6 space-y-6">

      {/* ── Page Header ─────────────────────────────────────────────────── */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Antrian</h1>
          <p className="text-sm text-slate-500 mt-0.5">Manajemen &amp; tampilan antrian hari ini</p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center gap-2 bg-teal-600 hover:bg-teal-700 text-white px-4 py-2 rounded-xl text-sm font-medium transition-colors"
        >
          <Plus size={16} />
          Tambah Antrian
        </button>
      </div>

      {/* ── Stats Bar ───────────────────────────────────────────────────── */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: 'Total', value: stats.total, icon: Users, color: 'text-slate-600', bg: 'bg-slate-100' },
          { label: 'Menunggu', value: stats.waiting, icon: Clock, color: 'text-amber-600', bg: 'bg-amber-100' },
          { label: 'Dalam Pemeriksaan', value: stats.inProgress, icon: Activity, color: 'text-teal-600', bg: 'bg-teal-100' },
          { label: 'Selesai', value: stats.done, icon: CheckCircle, color: 'text-slate-500', bg: 'bg-slate-100' },
        ].map(({ label, value, icon: Icon, color, bg }) => (
          <div key={label} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm flex items-center gap-4">
            <div className={`${bg} ${color} rounded-xl p-2.5`}>
              <Icon size={20} />
            </div>
            <div>
              <p className="text-xs text-slate-500">{label}</p>
              <p className={`text-2xl font-bold ${color}`}>{value}</p>
            </div>
          </div>
        ))}
      </div>

      {/* ── Live Display Panel ──────────────────────────────────────────── */}
      <div
        ref={displayRef}
        className="rounded-2xl overflow-hidden shadow-xl border border-slate-800"
        style={{ background: 'linear-gradient(135deg, #0f172a 0%, #134e4a 100%)' }}
      >
        {/* Display header */}
        <div className="flex items-center justify-between px-6 pt-5 pb-3 border-b border-white/10">
          <div className="flex items-center gap-2 text-teal-300">
            <Tv2 size={18} />
            <span className="text-sm font-semibold uppercase tracking-widest">Tampilan Antrian</span>
          </div>
          <button
            onClick={toggleFullscreen}
            className="text-white/50 hover:text-white transition-colors"
          >
            {isFullscreen ? <Minimize2 size={18} /> : <Maximize2 size={18} />}
          </button>
        </div>

        <div className="flex flex-col lg:flex-row">
          {/* Current number */}
          <div className="flex-1 flex flex-col items-center justify-center py-10 px-6 text-center">
            <p className="text-xs font-semibold text-teal-400 uppercase tracking-widest mb-4">
              Nomor Dipanggil
            </p>
            {currentItem ? (
              <>
                <div className="text-[72px] sm:text-[96px] font-black text-white leading-none tracking-tight drop-shadow-2xl">
                  {currentItem.ticketNumber}
                </div>
                <p className="mt-4 text-xl font-semibold text-white/90">{currentItem.patientName}</p>
                <div className="mt-2 inline-flex items-center gap-1.5 bg-teal-500/20 border border-teal-400/30 rounded-full px-4 py-1">
                  <span className="text-sm text-teal-300 font-medium">{currentItem.poli}</span>
                </div>
              </>
            ) : (
              <>
                <div className="text-[72px] font-black text-white/20 leading-none">–</div>
                <p className="mt-4 text-white/40 text-sm">Belum ada nomor dipanggil</p>
              </>
            )}
          </div>

          {/* Divider */}
          <div className="hidden lg:block w-px bg-white/10 my-6" />
          <div className="lg:hidden h-px bg-white/10 mx-6" />

          {/* Next up */}
          <div className="lg:w-64 xl:w-72 py-8 px-6 flex flex-col justify-center">
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-widest mb-4">
              Berikutnya
            </p>
            {nextWaiting.length > 0 ? (
              <div className="space-y-3">
                {nextWaiting.map((item, idx) => (
                  <div
                    key={item.id}
                    className="flex items-center gap-3 bg-white/5 border border-white/10 rounded-xl px-4 py-3"
                  >
                    <span className={`text-sm font-bold ${idx === 0 ? 'text-teal-300' : 'text-white/50'}`}>
                      {idx + 1}
                    </span>
                    <div className="flex-1 min-w-0">
                      <p className={`font-bold text-base ${idx === 0 ? 'text-white' : 'text-white/50'}`}>
                        {item.ticketNumber}
                      </p>
                      <p className={`text-xs truncate ${idx === 0 ? 'text-white/70' : 'text-white/30'}`}>
                        {item.patientName}
                      </p>
                    </div>
                    <ChevronRight size={14} className="text-white/30 shrink-0" />
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-white/30 text-sm">Tidak ada antrian berikutnya</p>
            )}
          </div>
        </div>
      </div>

      {/* ── Management Section ──────────────────────────────────────────── */}
      <div className="rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden">
        {/* Tabs */}
        <div className="flex items-center gap-1 px-5 pt-4 pb-0 border-b border-slate-100 overflow-x-auto">
          {TAB_OPTIONS.map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-2 rounded-t-xl text-sm font-medium whitespace-nowrap transition-colors border-b-2 -mb-px ${
                activeTab === tab
                  ? 'border-teal-600 text-teal-600 bg-teal-50/50'
                  : 'border-transparent text-slate-500 hover:text-slate-700 hover:bg-slate-50'
              }`}
            >
              {tab}
              {tab !== 'Semua' && (
                <span className="ml-1.5 text-xs text-slate-400">
                  ({queue.filter((q) => q.poli === tab && q.status === 'waiting').length})
                </span>
              )}
            </button>
          ))}
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          {filtered.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-slate-400">
              <Users size={36} className="mb-3 opacity-40" />
              <p className="text-sm">Tidak ada antrian</p>
            </div>
          ) : (
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-100">
                  <th className="text-left px-5 py-3 text-xs font-semibold text-slate-500 uppercase tracking-widest">
                    Nomor
                  </th>
                  <th className="text-left px-5 py-3 text-xs font-semibold text-slate-500 uppercase tracking-widest">
                    Pasien
                  </th>
                  <th className="text-left px-5 py-3 text-xs font-semibold text-slate-500 uppercase tracking-widest hidden sm:table-cell">
                    Poli
                  </th>
                  <th className="text-left px-5 py-3 text-xs font-semibold text-slate-500 uppercase tracking-widest">
                    Status
                  </th>
                  <th className="text-left px-5 py-3 text-xs font-semibold text-slate-500 uppercase tracking-widest hidden md:table-cell">
                    Waktu
                  </th>
                  <th className="text-right px-5 py-3 text-xs font-semibold text-slate-500 uppercase tracking-widest">
                    Aksi
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {filtered
                  .sort((a, b) => a.createdAt.localeCompare(b.createdAt))
                  .map((item) => (
                    <tr key={item.id} className="hover:bg-slate-50/70 transition-colors group">
                      {/* Ticket number badge */}
                      <td className="px-5 py-4">
                        <span className="inline-block bg-slate-900 text-white font-bold text-base rounded-xl px-3 py-1 tracking-wide">
                          {item.ticketNumber}
                        </span>
                      </td>

                      {/* Patient name */}
                      <td className="px-5 py-4">
                        <span className="font-medium text-slate-800">{item.patientName}</span>
                      </td>

                      {/* Poli */}
                      <td className="px-5 py-4 hidden sm:table-cell">
                        <span className="text-slate-600">{item.poli}</span>
                      </td>

                      {/* Status */}
                      <td className="px-5 py-4">
                        <span
                          className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${STATUS_BADGE[item.status]}`}
                        >
                          {STATUS_LABEL[item.status]}
                        </span>
                      </td>

                      {/* Time */}
                      <td className="px-5 py-4 hidden md:table-cell text-slate-500">
                        {fmtTime(item.createdAt)}
                      </td>

                      {/* Actions */}
                      <td className="px-5 py-4">
                        <div className="flex items-center justify-end gap-2">
                          {item.status === 'waiting' && (
                            <button
                              onClick={() => handleCall(item)}
                              className="flex items-center gap-1.5 bg-teal-600 hover:bg-teal-700 text-white px-3 py-1.5 rounded-xl text-xs font-medium transition-colors"
                            >
                              <Volume2 size={13} />
                              Panggil
                            </button>
                          )}

                          {item.status === 'called' && (
                            <>
                              <button
                                onClick={() => updateStatus(item, 'in-progress')}
                                className="flex items-center gap-1.5 bg-teal-600 hover:bg-teal-700 text-white px-3 py-1.5 rounded-xl text-xs font-medium transition-colors"
                              >
                                <ArrowRight size={13} />
                                Masuk Periksa
                              </button>
                              <button
                                onClick={() => updateStatus(item, 'skipped')}
                                className="flex items-center gap-1.5 bg-white border border-slate-200 hover:bg-rose-50 hover:border-rose-200 hover:text-rose-600 text-slate-600 px-3 py-1.5 rounded-xl text-xs font-medium transition-colors"
                              >
                                <SkipForward size={13} />
                                Lewati
                              </button>
                            </>
                          )}

                          {item.status === 'in-progress' && (
                            <button
                              onClick={() => updateStatus(item, 'done')}
                              className="flex items-center gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white px-3 py-1.5 rounded-xl text-xs font-medium transition-colors"
                            >
                              <CheckCircle size={13} />
                              Selesai
                            </button>
                          )}

                          {(item.status === 'done' || item.status === 'skipped') && (
                            <span className="text-slate-300 text-xs px-2">—</span>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* ══ Add Queue Modal ══════════════════════════════════════════════ */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md shadow-xl">
            {/* Modal header */}
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-lg font-bold text-slate-800">Tambah Antrian</h2>
              <button
                onClick={() => setShowAddModal(false)}
                className="text-slate-400 hover:text-slate-600 transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            {/* Form */}
            <div className="space-y-4">
              {/* Patient select */}
              <div>
                <label className="block text-xs font-semibold text-slate-500 uppercase tracking-widest mb-1.5">
                  Pilih Pasien
                </label>
                <select
                  value={addPatientId}
                  onChange={(e) => setAddPatientId(e.target.value)}
                  className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 bg-white"
                >
                  <option value="">-- Pilih Pasien --</option>
                  {patients.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name} ({p.rm})
                    </option>
                  ))}
                </select>
              </div>

              {/* Poli select */}
              <div>
                <label className="block text-xs font-semibold text-slate-500 uppercase tracking-widest mb-1.5">
                  Tujuan Poli
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {POLI_LIST.map((poli) => (
                    <button
                      key={poli}
                      type="button"
                      onClick={() => setAddPoli(poli)}
                      className={`flex items-center gap-2 px-3 py-2.5 rounded-xl border text-sm font-medium transition-all ${
                        addPoli === poli
                          ? 'border-teal-500 bg-teal-50 text-teal-700'
                          : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                      }`}
                    >
                      <span className={`w-6 h-6 rounded-lg flex items-center justify-center text-xs font-bold ${
                        addPoli === poli ? 'bg-teal-600 text-white' : 'bg-slate-200 text-slate-600'
                      }`}>
                        {POLI_PREFIX[poli]}
                      </span>
                      {poli}
                    </button>
                  ))}
                </div>
              </div>

              {/* Ticket preview */}
              {addPatientId && (
                <div className="bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 flex items-center justify-between">
                  <div>
                    <p className="text-xs text-slate-500">Nomor antrian akan diberikan:</p>
                    <p className="text-lg font-bold text-slate-800 mt-0.5">
                      {POLI_PREFIX[addPoli]}-{String(
                        queueStore.getToday().filter(
                          (q) => q.ticketNumber.startsWith(POLI_PREFIX[addPoli])
                        ).length + 1
                      ).padStart(2, '0')}
                    </p>
                  </div>
                  <div className="text-right text-xs text-slate-500">
                    <p>{addPoli}</p>
                    <p>{patients.find((p) => p.id === addPatientId)?.name}</p>
                  </div>
                </div>
              )}
            </div>

            {/* Modal actions */}
            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setShowAddModal(false)}
                className="flex-1 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 px-4 py-2 rounded-xl text-sm font-medium transition-colors"
              >
                Batal
              </button>
              <button
                onClick={handleAddQueue}
                disabled={!addPatientId}
                className="flex-1 bg-teal-600 hover:bg-teal-700 disabled:opacity-50 disabled:cursor-not-allowed text-white px-4 py-2 rounded-xl text-sm font-medium transition-colors"
              >
                Daftarkan
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
