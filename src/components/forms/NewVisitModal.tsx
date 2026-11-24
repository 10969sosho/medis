'use client';

import React, { useState, useMemo, useEffect, useRef } from 'react';
import type { Patient, Visit, Drug, Prescription, Doctor } from '@/lib/types';
import { uid, idr } from '@/lib/store';
import { doctorStore, patientStore, drugStore, visitStore, queueStore, calcAge } from '@/lib/store';
import { FormRekamMedisIbu, FormIbuData } from '@/components/forms/FormRekamMedisIbu';
import { FormRekamMedisAnak, FormAnakData } from '@/components/forms/FormRekamMedisAnak';
import { FormRekamMedisSpa, FormSpaData } from '@/components/forms/FormRekamMedisSpa';
import { FormRekamMedisUmum, FormUmumData } from '@/components/forms/FormRekamMedisUmum';
import { X, CheckCircle2, ChevronRight, Stethoscope, Pill, FlaskConical, Clock, PlusCircle, Trash2, HeartPulse, Scale, ShieldCheck, AlertTriangle, UserCircle2, Search, Lock, ChevronDown } from 'lucide-react';

interface NewVisitModalProps {
  /** Jika diisi (dari query ?patientId=), pasien terkunci dan tidak bisa diganti */
  patientId?: string;
  queueId?: string;
  initialPoli?: string;
  /** Kunci pilihan poli sesuai halaman index poli */
  lockPoli?: boolean;
  onClose: () => void;
  onSave: (visit: Visit) => void;
}

export function NewVisitModal({
  patientId,
  queueId,
  initialPoli = 'Umum',
  lockPoli = false,
  onClose,
  onSave,
}: NewVisitModalProps) {
  useEffect(() => {
    doctorStore.getAll();
  }, []);

  // Pasien: seluruh data dari patientStore, terkunci bila ada ?patientId= di URL
  const patients = useMemo(() => patientStore.getAll(), []);
  const lockedPatient = Boolean(patientId);
  const [selectedPatientId, setSelectedPatientId] = useState<string>(patientId ?? '');
  const [patientSearch, setPatientSearch] = useState('');
  const [isPatientDropdownOpen, setIsPatientDropdownOpen] = useState(false);
  const patientDropdownRef = useRef<HTMLDivElement>(null);
  const patient: Patient | undefined = patients.find((p) => p.id === selectedPatientId);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        patientDropdownRef.current &&
        !patientDropdownRef.current.contains(event.target as Node)
      ) {
        setIsPatientDropdownOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const drugs: Drug[] = useMemo(() => drugStore.getAll(), []);

  const patientOptions = useMemo(() => {
    const q = patientSearch.toLowerCase().trim();
    if (!q) return patients;
    return patients.filter(
      (p) =>
        p.name.toLowerCase().includes(q) ||
        p.rm.toLowerCase().includes(q) ||
        p.nik.includes(q),
    );
  }, [patients, patientSearch]);

  // Normalize poli
  const getNormalizedPoli = (p: string) => {
    const l = p.toLowerCase();
    if (l.includes('ibu') || l.includes('kia')) return 'Ibu';
    if (l.includes('anak')) return 'Anak';
    if (l.includes('spa')) return 'Mom and Baby Spa';
    return 'Umum';
  };

  const [selectedPoli, setSelectedPoli] = useState<string>(getNormalizedPoli(initialPoli));

  useEffect(() => {
    if (initialPoli) setSelectedPoli(getNormalizedPoli(initialPoli));
  }, [initialPoli]);
  const [doctorName, setDoctorName] = useState<string>('');
  const [activeStep, setActiveStep] = useState<'form' | 'resep'>('form');

  // Specific form states
  const [ibuData, setIbuData] = useState<FormIbuData>({
    layanan: 'ANC',
    tglKunjungan: new Date().toISOString().split('T')[0],
    dokterBidan: 'dr. Rina Sari, Sp.OG',
  });

  const [anakData, setAnakData] = useState<FormAnakData>({
    layanan: 'KN',
    tglKunjunganKn: new Date().toISOString().split('T')[0],
  });

  const [spaData, setSpaData] = useState<FormSpaData>({
    layanan: 'Pijat Bayi',
    tanggal: new Date().toISOString().split('T')[0],
  });

  const [drugGlobalFee, setDrugGlobalFee] = useState<string>('');

  const [umumData, setUmumData] = useState<FormUmumData>({
    riwayatAlergi: patient?.allergy && patient.allergy !== '-' ? patient.allergy : '',
  });

  // Sinkronkan riwayat alergi saat pasien dipilih/diganti
  useEffect(() => {
    if (!patient) return;
    setUmumData((d) => ({
      ...d,
      riwayatAlergi:
        patient.allergy && patient.allergy !== '-' ? patient.allergy : d.riwayatAlergi || '',
    }));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedPatientId]);

  // Billing & Resep
  const [prescriptions, setPrescriptions] = useState<Array<Prescription & { _key: string }>>([]);
  const [drugSearch, setDrugSearch] = useState('');
  const [tindakanFee, setTindakanFee] = useState<string>('0');
  const [konsultasiFee, setKonsultasiFee] = useState<string>('0');
  const [notes, setNotes] = useState('');

  // Load doctors from store
  const doctors = useMemo(() => doctorStore.getAll(), []);
  const doctorOptions = useMemo(
    () => doctors.map((d) => ({ id: d.id, name: d.name, role: d.role })),
    [doctors]
  );

  const filteredDrugs = useMemo(
    () =>
      drugs.filter((d) =>
        d.name.toLowerCase().includes(drugSearch.toLowerCase())
      ),
    [drugSearch, drugs]
  );

  const drugTotal = prescriptions.reduce(
    (sum, rx) => sum + rx.quantity * rx.pricePerUnit,
    0
  );
  const globalDrugCost = prescriptions.length > 0 ? 0 : (parseInt(drugGlobalFee, 10) || 0);
  const totalBill = parseInt(konsultasiFee, 10) + (parseInt(tindakanFee, 10) || 0) + (prescriptions.length > 0 ? drugTotal : globalDrugCost);

  function addDrug(drug: Drug) {
    const already = prescriptions.find((p) => p.drugId === drug.id);
    if (already) return;
    setDrugGlobalFee('');
    setPrescriptions([
      ...prescriptions,
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
    setDrugSearch('');
  }

  function removeDrug(key: string) {
    setPrescriptions(prescriptions.filter((p) => p._key !== key));
  }

  function updateRx(key: string, field: 'quantity' | 'dosage', val: string | number) {
    setPrescriptions(
      prescriptions.map((p) =>
        p._key === key ? { ...p, [field]: field === 'quantity' ? Number(val) : val } : p
      )
    );
  }

  function handleSave() {
    if (!patient) return;
    const now = new Date().toISOString();
    let subjective = '';
    let objectiveObj: any = {};
    let assessment = '';
    let icdCode = 'Z00.0';
    let plan = '';
    let controlDate: string | undefined = undefined;
    let subCategory = '';

    if (selectedPoli === 'Ibu') {
      subCategory = ibuData.layanan;
      subjective = ibuData.keluhanUtama || ibuData.keluhanNifas || ibuData.keluhanKb || ibuData.keluhanKespro || 'Pemeriksaan Poli Ibu';
      assessment = ibuData.diagnosa || `Layanan ${ibuData.layanan}`;
      icdCode = ibuData.layanan === 'ANC' ? 'Z34.2' : ibuData.layanan === 'KB' ? 'Z30.9' : 'O80';
      plan = ibuData.tindakan || ibuData.rencana || 'Konseling & tindakan';
      controlDate = ibuData.rencanaKontrol || ibuData.rencanaKontrolNifas || ibuData.tglKontrolKb || ibuData.rencanaKontrolKespro;
      objectiveObj = {
        layanan: ibuData.layanan,
        data: ibuData,
        td: ibuData.td || ibuData.tdIbuInc || ibuData.tdNifas || '',
        nadi: ibuData.nadi || ibuData.nadiIbuInc || '',
        suhu: ibuData.suhu || ibuData.suhuNifas || '',
        bb: ibuData.bb || ibuData.bbNifas || '',
        tb: ibuData.tb || '',
        lila: ibuData.lila || '',
        tfu: ibuData.tfu || '',
        djj: ibuData.djj || '',
      };
    } else if (selectedPoli === 'Anak') {
      subCategory = anakData.layanan;
      subjective = anakData.keluhanKn || anakData.keluhanUtamaMtbs || `Pemeriksaan Anak - ${anakData.layanan}`;
      assessment = anakData.diagnosaKn || anakData.diagnosaMtbs || anakData.klasifikasiMtbs || `Layanan ${anakData.layanan}`;
      icdCode = anakData.layanan === 'Imunisasi' ? 'Z23' : anakData.layanan === 'MTBS' ? 'J06.9' : 'Z00.1';
      plan = anakData.tindakanKn || anakData.tindakanMtbs || (anakData.layanan === 'Imunisasi' ? `Pemberian vaksin ${anakData.namaVaksin || ''}` : 'Pemeriksaan anak');
      controlDate = anakData.rencanaKontrolKn || anakData.rencanaKontrolMtbs || anakData.jadwalImunisasiBerikutnya;
      objectiveObj = {
        layanan: anakData.layanan,
        data: anakData,
        bb: anakData.bbKn || anakData.bbMtbs || '',
        tb: anakData.pbTbKn || anakData.tbPbMtbs || '',
        lk: anakData.lkKn || '',
        suhu: anakData.suhuKn || anakData.suhuMtbs || '',
        rr: anakData.respirasiMtbs || '',
        nadi: anakData.nadiMtbs || '',
      };
    } else if (selectedPoli === 'Mom and Baby Spa') {
      subCategory = spaData.layanan;
      subjective = spaData.keluhanBumil || spaData.keluhanNifas || spaData.kondisiSebelum || spaData.kondisiIbu || `Treatment ${spaData.layanan}`;
      assessment = `Treatment Spa - ${spaData.layanan}`;
      icdCode = 'Z50.1';
      plan = `${spaData.jenisTreatment || spaData.layanan} durasi ${spaData.durasi || '45 menit'}`;
      controlDate = spaData.jadwalBerikutnya;
      objectiveObj = {
        layanan: spaData.layanan,
        data: spaData,
        bb: spaData.bb || '',
        usia: spaData.usia || spaData.usiaKehamilan || spaData.usiaNifas || '',
        durasi: spaData.durasi || '',
      };
    } else {
      subCategory = 'Umum';
      subjective = umumData.keluhanUtama || 'Pemeriksaan Umum';
      assessment = umumData.diagnosa || 'Pemeriksaan Kesehatan Umum';
      icdCode = 'Z00.0';
      plan = umumData.tindakan || 'Konseling & terapi';
      controlDate = umumData.rencanaKontrol;
      objectiveObj = {
        data: umumData,
        td: umumData.td || '',
        nadi: umumData.nadi || '',
        suhu: umumData.suhu || '',
        rr: umumData.respirasi || '',
        bb: umumData.bb || '',
        tb: umumData.tb || '',
      };
    }

    let inputDate = now;
    if (selectedPoli === 'Ibu') {
      const d = ibuData.tglKunjungan || ibuData.tglPersalinan;
      if (d) {
        inputDate = d.includes('T') ? d : `${d}T${now.split('T')[1] || '08:00:00'}`;
      }
    } else if (selectedPoli === 'Anak') {
      const d = anakData.tglKunjunganKn || anakData.tglImunisasi;
      if (d) {
        inputDate = d.includes('T') ? d : `${d}T${now.split('T')[1] || '08:00:00'}`;
      }
    } else if (selectedPoli === 'Mom and Baby Spa' && spaData.tanggal) {
      const d = spaData.tanggal;
      inputDate = d.includes('T') ? d : `${d}T${now.split('T')[1] || '08:00:00'}`;
    }

    const doctor = doctors.find((d) => d.name === doctorName) || { id: '', name: doctorName, role: '', sip: '', phone: '', poli: '' };

    const visit: Visit = {
      id: uid(),
      patientId: patient.id,
      date: inputDate,
      poli: selectedPoli,
      doctorName: doctor.name,
      subjective,
      objective: JSON.stringify(objectiveObj),
      assessment,
      icdCode,
      plan,
      prescriptions: prescriptions.map(({ _key: _k, ...rest }) => rest),
      drugGlobalFee: prescriptions.length > 0 ? 0 : (parseInt(drugGlobalFee, 10) || 0),
      drugDetailPending: prescriptions.length === 0 && (parseInt(drugGlobalFee, 10) || 0) > 0,
      totalBill,
      paymentStatus: 'unpaid',
      konsultasiFee: parseInt(konsultasiFee, 10) || 0,
      controlDate,
      notes: notes || undefined,
      category: selectedPoli === 'Ibu' ? 'ibu' : selectedPoli === 'Anak' ? 'anak' : selectedPoli === 'Mom and Baby Spa' ? 'spa' : 'umum',
      subCategory,
      detailData: objectiveObj,
    };

    // Simpan kunjungan + kurangi stok obat resep (tagihan otomatis masuk antrean kasir)
    visitStore.add(visit);
    visit.prescriptions.forEach((rx) => drugStore.deductStock(rx.drugId, rx.quantity));

    // Update antrian terkait jika ada queueId atau untuk pasien hari ini
    if (queueId) {
      const q = queueStore.getAll().find((item) => item.id === queueId);
      if (q) {
        queueStore.update({ ...q, status: 'done' });
      }
    } else if (patient.id) {
      const todayQ = queueStore.getQueueForPatientToday(patient.id);
      if (todayQ && todayQ.status !== 'done') {
        queueStore.update({ ...todayQ, status: 'done' });
      }
    }

    onSave(visit);
  }

  return (
    <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-3 sm:p-4 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[92vh] flex flex-col overflow-hidden">
        {/* Header Modal */}
        <div className="px-6 py-4 bg-slate-900 text-white flex items-center justify-between border-b border-slate-800">
          <div>
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-teal-400"></span>
              <h2 className="text-base font-bold">Input Rekam Medis Pasien</h2>
              <span className="text-xs px-2.5 py-0.5 rounded-full bg-teal-500/20 text-teal-300 font-semibold border border-teal-500/30">
                {selectedPoli}
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              {patient
                ? `${patient.name} (${patient.rm}) · NIK: ${patient.nik} · ${patient.gender === 'P' ? 'Perempuan' : 'Laki-Laki'}`
                : 'Belum ada pasien terpilih — pilih pasien untuk melanjutkan'}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl hover:bg-slate-800 text-slate-400 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* 1 Field Pilih & Cari Pasien + Kartu Ringkas */}
        <div className="px-6 py-3 bg-white border-b border-slate-200 space-y-3">
          <div className="relative" ref={patientDropdownRef}>
            <label className="text-xs font-semibold text-slate-700 block mb-1">
              Pasien <span className="text-red-500">*</span>
            </label>

            {lockedPatient ? (
              <div className="flex items-center justify-between border border-teal-200 bg-teal-50/60 rounded-xl px-3 py-2 text-xs">
                <div className="flex items-center gap-2 min-w-0">
                  <UserCircle2 className="w-4 h-4 text-teal-600 shrink-0" />
                  <span className="font-semibold text-teal-900 truncate">
                    {patient ? `${patient.name} (${patient.rm}) — ${patient.insurance}` : 'Memuat data pasien...'}
                  </span>
                </div>
                <span className="flex items-center gap-1 text-[11px] font-bold text-teal-700 bg-teal-100/80 px-2.5 py-1 rounded-lg shrink-0">
                  <Lock className="w-3 h-3" />
                  Terkunci dari Antrian
                </span>
              </div>
            ) : (
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                <input
                  type="text"
                  value={
                    isPatientDropdownOpen || patientSearch
                      ? patientSearch
                      : patient
                      ? `${patient.name} (${patient.rm}) — ${patient.insurance}`
                      : ''
                  }
                  onChange={(e) => {
                    setPatientSearch(e.target.value);
                    if (!isPatientDropdownOpen) setIsPatientDropdownOpen(true);
                  }}
                  onFocus={() => {
                    setIsPatientDropdownOpen(true);
                  }}
                  placeholder="Cari pasien (Ketik Nama, No RM, atau NIK)..."
                  className={`w-full border rounded-xl pl-9 pr-16 py-2.5 text-xs bg-white focus:outline-none focus:ring-2 focus:ring-teal-500 transition-all ${
                    patient && !isPatientDropdownOpen && !patientSearch
                      ? 'border-teal-400 font-semibold text-teal-950 bg-teal-50/30'
                      : 'border-slate-200 text-slate-800 placeholder-slate-400'
                  }`}
                />

                <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1">
                  {(patient || patientSearch) && (
                    <button
                      type="button"
                      onClick={() => {
                        setSelectedPatientId('');
                        setPatientSearch('');
                        setIsPatientDropdownOpen(true);
                      }}
                      className="p-1 text-slate-400 hover:text-red-600 rounded-lg hover:bg-slate-100 transition-colors"
                      title="Hapus / Cari Ulang"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={() => setIsPatientDropdownOpen((prev) => !prev)}
                    className="p-1 text-slate-400 hover:text-slate-600 rounded-lg transition-colors"
                    title="Buka / Tutup Daftar"
                  >
                    <ChevronDown
                      className={`w-3.5 h-3.5 transition-transform duration-200 ${
                        isPatientDropdownOpen ? 'rotate-180 text-teal-600' : ''
                      }`}
                    />
                  </button>
                </div>

                {/* Dropdown Popover List Pasien */}
                {isPatientDropdownOpen && (
                  <div className="absolute left-0 right-0 top-full mt-1.5 bg-white border border-slate-200 rounded-2xl shadow-2xl z-50 max-h-64 overflow-y-auto divide-y divide-slate-100 animate-in fade-in-50 duration-150">
                    {patientOptions.length === 0 ? (
                      <div className="p-4 text-center text-xs text-slate-400">
                        Pasien tidak ditemukan dengan kata kunci &quot;{patientSearch}&quot;
                      </div>
                    ) : (
                      patientOptions.map((p) => {
                        const isSelected = p.id === selectedPatientId;
                        return (
                          <div
                            key={p.id}
                            onClick={() => {
                              setSelectedPatientId(p.id);
                              setPatientSearch('');
                              setIsPatientDropdownOpen(false);
                            }}
                            className={`px-4 py-2.5 text-xs cursor-pointer transition-colors flex items-center justify-between gap-3 ${
                              isSelected
                                ? 'bg-teal-50 text-teal-900 font-semibold'
                                : 'hover:bg-slate-50 text-slate-800'
                            }`}
                          >
                            <div className="min-w-0">
                              <div className="flex items-center gap-2">
                                <span className="font-semibold text-slate-900 truncate">
                                  {p.name}
                                </span>
                                <span className="font-mono text-[10px] font-bold px-1.5 py-0.5 rounded bg-teal-100 text-teal-800 shrink-0">
                                  {p.rm}
                                </span>
                              </div>
                              <p className="text-[11px] text-slate-500 mt-0.5 truncate">
                                NIK: {p.nik} · {calcAge(p.dob)} · {p.gender === 'P' ? 'Perempuan' : 'Laki-Laki'} · {p.insurance}
                              </p>
                            </div>
                            {isSelected && (
                              <CheckCircle2 className="w-4 h-4 text-teal-600 shrink-0" />
                            )}
                          </div>
                        );
                      })
                    )}
                  </div>
                )}
              </div>
            )}
          </div>

          {patient && (
            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-3.5 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 text-xs">
              {([
                ['No RM', patient.rm],
                ['NIK', patient.nik],
                ['Usia', calcAge(patient.dob)],
                ['Gender', patient.gender === 'P' ? 'Perempuan' : 'Laki-Laki'],
                ['Penjamin', patient.insurance],
                ['Alergi', patient.allergy || '-'],
              ] as Array<[string, string]>).map(([label, val]) => (
                <div key={label} className="min-w-0">
                  <p className="text-[10px] uppercase tracking-wider text-slate-400 font-bold">
                    {label}
                  </p>
                  <p
                    className={`font-semibold truncate ${
                      label === 'Alergi' && val !== '-' ? 'text-red-600' : 'text-slate-800'
                    }`}
                  >
                    {val}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Tab Poli & Dokter */}
        <div className="px-6 py-3 bg-slate-100/70 border-b border-slate-200 flex flex-wrap items-center justify-between gap-3">
          {lockPoli ? (
            <div className="flex items-center gap-2 bg-white px-3 py-1.5 rounded-xl border border-slate-200 text-xs font-bold text-teal-700">
              <Stethoscope className="w-3.5 h-3.5" />
              Form poli terkunci: {selectedPoli}
            </div>
          ) : (
            <div className="flex items-center gap-1.5 bg-white p-1 rounded-xl border border-slate-200">
              {(['Ibu', 'Anak', 'Mom and Baby Spa', 'Umum'] as const).map((p) => (
                <button
                  key={p}
                  type="button"
                  onClick={() => {
                    setSelectedPoli(p);
                    const doc = doctorOptions.find((d) => d.role.includes(p.split(' ')[0] || 'Umum'));
                    setDoctorName(doc ? doc.name : '');
                  }}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                    selectedPoli === p
                      ? 'bg-teal-600 text-white shadow-sm'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  {p}
                </button>
              ))}
            </div>
          )}

          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-500 font-medium">Dokter/Pemeriksa:</span>
            <select
              value={doctorName}
              onChange={(e) => setDoctorName(e.target.value)}
              className="text-xs font-semibold bg-white border border-slate-200 rounded-xl px-2.5 py-1.5 focus:ring-2 focus:ring-teal-500 text-slate-800"
            >
              <option value="">-- Pilih Dokter --</option>
              {doctors.map((d) => (
                <option key={d.id} value={d.name}>{d.name}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Step Tabs: Form Klinis vs E-Resep & Billing */}
        <div className="px-6 py-2 bg-white border-b border-slate-100 flex gap-4 text-xs font-bold">
          <button
            type="button"
            onClick={() => setActiveStep('form')}
            className={`pb-2 pt-1 border-b-2 transition-all flex items-center gap-1.5 ${
              activeStep === 'form'
                ? 'border-teal-600 text-teal-700'
                : 'border-transparent text-slate-400 hover:text-slate-600'
            }`}
          >
            <Stethoscope className="w-3.5 h-3.5" />
            1. Form Pemeriksaan {selectedPoli}
          </button>
          <button
            type="button"
            onClick={() => setActiveStep('resep')}
            className={`pb-2 pt-1 border-b-2 transition-all flex items-center gap-1.5 ${
              activeStep === 'resep'
                ? 'border-teal-600 text-teal-700'
                : 'border-transparent text-slate-400 hover:text-slate-600'
            }`}
          >
            <Pill className="w-3.5 h-3.5" />
            2. Tindakan, Resep Obat & Biaya Konsultasi ({prescriptions.length} obat)
          </button>
        </div>

        {/* Body Content */}
        <div className="flex-1 overflow-y-auto p-6 bg-slate-50/50">
          {activeStep === 'form' ? (
            <div>
              {selectedPoli === 'Ibu' && (
                <FormRekamMedisIbu data={ibuData} onChange={setIbuData} />
              )}
              {selectedPoli === 'Anak' && (
                <FormRekamMedisAnak data={anakData} onChange={setAnakData} />
              )}
              {selectedPoli === 'Mom and Baby Spa' && (
                <FormRekamMedisSpa data={spaData} onChange={setSpaData} />
              )}
              {selectedPoli === 'Umum' && (
                <FormRekamMedisUmum data={umumData} onChange={setUmumData} />
              )}
            </div>
          ) : (
            /* Step 2: Resep & Billing */
            <div className="space-y-6">
              {/* Biaya Tindakan & Konsultasi */}
              <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-3">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-2">
                  <FlaskConical className="w-4 h-4 text-violet-600" />
                  Biaya Layanan
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-medium text-slate-600 mb-1 block">Biaya Jasa Medis / Tindakan (Rp)</label>
                    <input
                      type="number"
                      placeholder="0"
                      value={tindakanFee}
                      onChange={(e) => setTindakanFee(e.target.value)}
                      className="w-full text-xs p-2.5 rounded-xl border border-slate-200 bg-white focus:ring-2 focus:ring-teal-500 font-mono"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-medium text-slate-600 mb-1 block">Biaya Konsultasi (Rp)</label>
                    <input
                      type="number"
                      placeholder="0"
                      value={konsultasiFee}
                      onChange={(e) => setKonsultasiFee(e.target.value)}
                      className="w-full text-xs p-2.5 rounded-xl border border-slate-200 bg-white focus:ring-2 focus:ring-teal-500 font-mono"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-medium text-slate-600 mb-1 block">Biaya Obat Global (Rp) — opsional, tanpa detail</label>
                    <input
                      type="number"
                      placeholder="0"
                      value={drugGlobalFee}
                      disabled={prescriptions.length > 0}
                      onChange={(e) => setDrugGlobalFee(e.target.value.replace(/\D/g, ''))}
                      className="w-full text-xs p-2.5 rounded-xl border border-slate-200 bg-white focus:ring-2 focus:ring-teal-500 font-mono disabled:bg-slate-100 disabled:text-slate-400"
                    />
                    <p className="text-[10px] text-slate-400 mt-1">
                      {prescriptions.length > 0
                        ? 'Sudah ada obat per item — biaya global dinonaktifkan.'
                        : 'Isi total biaya obat jika belum mau pilih obat satu per satu. Detail bisa dilengkapi nanti.'}
                    </p>
                  </div>
                  <div>
                    <label className="text-xs font-medium text-slate-600 mb-1 block">Catatan Rekomendasi Farmasi / Kasir</label>
                    <input
                      type="text"
                      placeholder="Catatan tambahan untuk kasir"
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      className="w-full text-xs p-2.5 rounded-xl border border-slate-200 bg-white focus:ring-2 focus:ring-teal-500"
                    />
                  </div>
                </div>
              </div>

              {/* Input Resep Obat */}
              <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-4">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-2">
                  <Pill className="w-4 h-4 text-emerald-600" />
                  E-Resep Obat
                </h4>
                <div>
                  <input
                    type="text"
                    placeholder="Ketik nama obat untuk mencari..."
                    value={drugSearch}
                    onChange={(e) => setDrugSearch(e.target.value)}
                    className="w-full text-xs p-2.5 rounded-xl border border-slate-200 bg-white focus:ring-2 focus:ring-teal-500"
                  />
                  {drugSearch && (
                    <div className="mt-1 bg-white border border-slate-200 rounded-xl max-h-40 overflow-y-auto divide-y shadow-lg">
                      {filteredDrugs.length === 0 ? (
                        <p className="p-3 text-xs text-slate-400 text-center">Obat tidak ditemukan</p>
                      ) : (
                        filteredDrugs.map((d) => (
                          <button
                            key={d.id}
                            type="button"
                            onClick={() => addDrug(d)}
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
                </div>

                {/* List Resep */}
                {prescriptions.length === 0 ? (
                  <p className="text-xs text-slate-400 italic py-2">Belum ada obat yang ditambahkan ke resep</p>
                ) : (
                  <div className="space-y-2">
                    {prescriptions.map((rx) => (
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
                            onChange={(e) => updateRx(rx._key, 'quantity', e.target.value)}
                            className="w-full p-1.5 border border-slate-200 rounded-lg text-center font-bold bg-white"
                          />
                        </div>
                        <div className="flex-1">
                          <input
                            type="text"
                            placeholder="Aturan pakai"
                            value={rx.dosage}
                            onChange={(e) => updateRx(rx._key, 'dosage', e.target.value)}
                            className="w-full p-1.5 border border-slate-200 rounded-lg bg-white"
                          />
                        </div>
                        <span className="font-bold text-slate-700 min-w-[70px] text-right">
                          {idr(rx.quantity * rx.pricePerUnit)}
                        </span>
                        <button
                          type="button"
                          onClick={() => removeDrug(rx._key)}
                          className="p-1 text-red-500 hover:text-red-700 rounded-lg hover:bg-red-50"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Ringkasan Total Tagihan */}
              <div className="bg-teal-50 border border-teal-200 rounded-2xl p-4 flex items-center justify-between">
                <div>
                  <p className="text-xs text-teal-700 font-semibold uppercase">Total Tagihan Layanan</p>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Konsultasi ({idr(parseInt(konsultasiFee, 10) || 0)}) + Tindakan ({idr(parseInt(tindakanFee, 10) || 0)}) + Obat ({idr(drugTotal)})
                  </p>
                </div>
                <p className="text-2xl font-black text-teal-800 font-mono">{idr(totalBill)}</p>
              </div>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="px-6 py-4 bg-white border-t border-slate-200 flex items-center justify-between">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition-colors"
          >
            Batal
          </button>
          <div className="flex items-center gap-2">
            {activeStep === 'form' ? (
              <button
                type="button"
                onClick={() => setActiveStep('resep')}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-900 text-white text-xs font-bold rounded-xl transition-colors flex items-center gap-1.5 shadow-sm"
              >
                Lanjut ke Resep & Billing <ChevronRight className="w-3.5 h-3.5" />
              </button>
            ) : (
              <button
                type="button"
                onClick={() => setActiveStep('form')}
                className="px-4 py-2 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-bold rounded-xl transition-colors"
              >
                ← Kembali ke Form
              </button>
            )}

            {!patient && (
              <span className="text-[11px] font-semibold text-amber-600">
                Pilih pasien terlebih dahulu
              </span>
            )}
            <button
              type="button"
              onClick={handleSave}
              disabled={!patient}
              className="px-5 py-2.5 bg-teal-600 hover:bg-teal-700 disabled:opacity-50 disabled:cursor-not-allowed text-white text-xs font-bold rounded-xl transition-all shadow-md shadow-teal-600/20 flex items-center gap-1.5"
            >
              <CheckCircle2 className="w-4 h-4" />
              Simpan Rekam Medis
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}