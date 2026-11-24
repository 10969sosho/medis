'use client';

// LocalStorage keys
const KEYS = {
  patients: 'klinik_patients',
  visits: 'klinik_visits',
  drugs: 'klinik_drugs',
  queue: 'klinik_queue',
  transactions: 'klinik_transactions',
  ancRecords: 'klinik_anc',
  doctors: 'klinik_doctors',
  letters: 'klinik_letters',
  customKop: 'klinik_custom_kop',
};

import type { Patient, Visit, Drug, QueueItem, Transaction, ANCRecord, Doctor, Letter, KopOption } from './types';
import { api } from './api';

// --- Seed Data ---
const seedPatients: Patient[] = [
  { id: 'p1', rm: 'RM-2026-001', name: 'Bapak Hendra Wijaya', nik: '3271011203800001', dob: '1980-03-12', gender: 'L', phone: '081234000001', address: 'Jl. Mawar No. 5, Bandung', insurance: 'BPJS', bloodType: 'A', allergy: '-', createdAt: '2026-09-01T08:00:00' },
  { id: 'p2', rm: 'RM-2026-002', name: 'Ibu Dewi Rahayu', nik: '3271024505870002', dob: '1987-05-05', gender: 'P', phone: '081234000002', address: 'Jl. Anggrek Blok B2, Bandung', insurance: 'Umum', bloodType: 'O', allergy: 'Penisilin', createdAt: '2026-09-02T09:00:00' },
  { id: 'p3', rm: 'RM-2026-003', name: 'Anak Budi Santoso', nik: '3271030801150003', dob: '2015-01-08', gender: 'L', phone: '081234000003', address: 'Jl. Melati No. 12, Bandung', insurance: 'BPJS', bloodType: 'B', allergy: '-', createdAt: '2026-09-03T10:00:00' },
  { id: 'p4', rm: 'RM-2026-004', name: 'Ny. Sari Indah', nik: '3271042209920004', dob: '1992-09-22', gender: 'P', phone: '081234000004', address: 'Jl. Dahlia No. 7, Bandung', insurance: 'BPJS', bloodType: 'AB', allergy: '-', createdAt: '2026-09-05T08:30:00' },
  { id: 'p5', rm: 'RM-2026-005', name: 'Bapak Rudi Hartono', nik: '3271051507750005', dob: '1975-07-15', gender: 'L', phone: '081234000005', address: 'Jl. Kenanga No. 3, Bandung', insurance: 'Asuransi', bloodType: 'A', allergy: 'Sulfa', createdAt: '2026-09-06T11:00:00' },
  { id: 'p6', rm: 'RM-2026-006', name: 'Ny. Fitria Nadia', nik: '3271062008950006', dob: '1995-08-20', gender: 'P', phone: '081234000006', address: 'Jl. Merpati No. 9, Bandung', insurance: 'Umum', bloodType: 'O', allergy: '-', createdAt: '2026-09-08T08:00:00' },
  { id: 'p7', rm: 'RM-2026-007', name: 'Bapak Ahmad Fauzi', nik: '3271070212680007', dob: '1968-12-02', gender: 'L', phone: '081234000007', address: 'Jl. Cempaka No. 18, Bandung', insurance: 'BPJS', bloodType: 'B', allergy: '-', createdAt: '2026-09-10T09:00:00' },
];

const seedVisits: Visit[] = [
  // ── Poli Umum ──
  {
    id: 'v1', patientId: 'p1', date: '2026-09-15T09:30:00', poli: 'Umum', category: 'umum', subCategory: 'Pemeriksaan Umum',
    doctorName: 'dr. Andi Saputra, Sp.PD',
    subjective: 'Pasien mengeluh demam 3 hari, batuk kering, sakit kepala.',
    objective: JSON.stringify({ td: '130/85', nadi: '92', suhu: '38.5', rr: '20', bb: '72', tb: '170' }),
    assessment: 'ISPA (Infeksi Saluran Pernapasan Akut)',
    icdCode: 'J06.9', plan: 'Nebulisasi 1x, Terapi obat oral',
    prescriptions: [
      { drugId: 'd1', drugName: 'Paracetamol 500mg', quantity: 10, unit: 'tablet', dosage: '3x1 sesudah makan', pricePerUnit: 500 },
      { drugId: 'd2', drugName: 'Amoxicillin 500mg', quantity: 10, unit: 'kaplet', dosage: '3x1 sesudah makan', pricePerUnit: 1500 },
    ],
    totalBill: 100000, paymentStatus: 'paid', paymentMethod: 'BPJS', controlDate: '2026-09-22', notes: 'Kontrol ulang jika tidak membaik',
  },
  {
    id: 'v2', patientId: 'p5', date: '2026-09-16T10:00:00', poli: 'Umum', category: 'umum', subCategory: 'Pemeriksaan Umum',
    doctorName: 'dr. Andi Saputra, Sp.PD',
    subjective: 'Pasien hipertensi rutin kontrol. Kepala pusing, tengkuk kaku.',
    objective: JSON.stringify({ td: '160/100', nadi: '88', suhu: '36.8', rr: '18', bb: '80', tb: '172' }),
    assessment: 'Hipertensi Primer',
    icdCode: 'I10', plan: 'Terapi lanjutan antihipertensi',
    prescriptions: [
      { drugId: 'd5', drugName: 'Amlodipine 5mg', quantity: 30, unit: 'tablet', dosage: '1x1 malam', pricePerUnit: 1000 },
    ],
    totalBill: 80000, paymentStatus: 'paid', paymentMethod: 'Asuransi', controlDate: '2026-09-30',
  },
  {
    id: 'v3', patientId: 'p7', date: '2026-09-17T11:00:00', poli: 'Umum', category: 'umum', subCategory: 'Pemeriksaan Umum',
    doctorName: 'dr. Andi Saputra, Sp.PD',
    subjective: 'Pasien DM tipe 2 rutin kontrol. GDS terakhir 280. Mudah lelah.',
    objective: JSON.stringify({ td: '140/90', nadi: '80', suhu: '36.9', rr: '18', bb: '85', tb: '168' }),
    assessment: 'Diabetes Mellitus Tipe 2',
    icdCode: 'E11.9', plan: 'Cek GDS, lanjutkan Metformin',
    prescriptions: [
      { drugId: 'd6', drugName: 'Metformin 500mg', quantity: 60, unit: 'tablet', dosage: '2x1 sesudah makan', pricePerUnit: 800 },
    ],
    totalBill: 75000, paymentStatus: 'paid', paymentMethod: 'BPJS', controlDate: '2026-09-24',
  },

  // ── Poli Ibu ──
  {
    id: 'v4', patientId: 'p4', date: '2026-09-18T08:30:00', poli: 'Ibu', category: 'ibu', subCategory: 'ANC',
    doctorName: 'dr. Rina Sari, Sp.OG',
    subjective: 'ANC rutin, kehamilan 28 minggu. Tidak ada keluhan bermakna.',
    objective: JSON.stringify({ layanan: 'ANC', td: '110/70', nadi: '82', suhu: '36.7', rr: '18', bb: '65', tb: '160', tfu: '27', djj: '152', data: { hamilKe: 'G2P1A0', usiaHamil: '28 minggu', keluhan: 'Tidak ada keluhan' } }),
    assessment: 'Kehamilan Normal G2P1A0',
    icdCode: 'Z34.2', plan: 'Kontrol rutin, Fe + Asam Folat lanjut',
    prescriptions: [
      { drugId: 'd7', drugName: 'Tablet Fe (Besi)', quantity: 30, unit: 'tablet', dosage: '1x1 malam', pricePerUnit: 500 },
    ],
    totalBill: 50000, paymentStatus: 'paid', paymentMethod: 'BPJS', controlDate: '2026-10-02',
  },
  {
    id: 'v5', patientId: 'p2', date: '2026-09-21T09:15:00', poli: 'Ibu', category: 'ibu', subCategory: 'ANC',
    doctorName: 'dr. Rina Sari, Sp.OG',
    subjective: 'ANC kehamilan 16 minggu. Berat badan naik, tidak ada preeklampsia.',
    objective: JSON.stringify({ layanan: 'ANC', td: '112/72', nadi: '86', suhu: '36.6', rr: '18', bb: '56', tb: '158', tfu: '16', djj: '160', data: { hamilKe: 'G1P0A0', usiaHamil: '16 minggu', lila: '24' } }),
    assessment: 'Kehamilan Normal G1P0A0',
    icdCode: 'Z34.2', plan: 'Laboratorium Hb/urine, lanjutkan tablet Fe',
    prescriptions: [
      { drugId: 'd7', drugName: 'Tablet Fe (Besi)', quantity: 30, unit: 'tablet', dosage: '1x1 malam', pricePerUnit: 500 },
    ],
    totalBill: 60000, paymentStatus: 'unpaid', controlDate: '2026-10-05',
    konsultasiFee: 30000,
  },
  {
    id: 'v6', patientId: 'p4', date: '2026-09-22T10:45:00', poli: 'Ibu', category: 'ibu', subCategory: 'KB',
    doctorName: 'Bidan Siti Rahma, S.Tr.Keb',
    subjective: 'Kontrol KB suntik 3 bulan. Tidak ada keluhan, haid teratur.',
    objective: JSON.stringify({ layanan: 'KB', td: '115/75', nadi: '80', suhu: '36.7', data: { metodeKB: 'Suntik 3 bulan', efekSamping: 'Tidak ada' } }),
    assessment: 'KB Suntik 3 Bulan (DMPA)',
    icdCode: 'Z30.9', plan: 'Suntik ulang 3 bulan berikutnya',
    prescriptions: [],
    totalBill: 45000, paymentStatus: 'unpaid', controlDate: '2026-12-22',
    konsultasiFee: 25000,
  },

  // ── Poli Anak ──
  {
    id: 'v7', patientId: 'p3', date: '2026-09-19T09:00:00', poli: 'Anak', category: 'anak', subCategory: 'Imunisasi',
    doctorName: 'dr. Maya Dewi, Sp.A',
    subjective: 'Imunisasi Campak booster. Anak sehat, tidak ada keluhan.',
    objective: JSON.stringify({ layanan: 'Imunisasi', bb: '38', tb: '132', suhu: '36.8', data: { namaVaksin: 'Campak', noBatch: 'CMK-2026-118', tempat: 'Lengan kiri' } }),
    assessment: 'Imunisasi Campak Booster',
    icdCode: 'Z23', plan: 'Pemberian vaksin Campak, observasi 30 menit',
    prescriptions: [],
    totalBill: 150000, paymentStatus: 'paid', paymentMethod: 'BPJS',
  },
  {
    id: 'v8', patientId: 'p3', date: '2026-09-23T10:20:00', poli: 'Anak', category: 'anak', subCategory: 'KN',
    doctorName: 'dr. Maya Dewi, Sp.A',
    subjective: 'Kunjungan anak rutin. Batuk pilek 2 hari, anak masih aktif bermain.',
    objective: JSON.stringify({ layanan: 'KN', bb: '38.5', tb: '132', lk: '50', suhu: '37.2', rr: '24', data: { usia: '11 tahun', keluhan: 'Batuk pilek 2 hari' } }),
    assessment: 'Batuk Pilek Ringan',
    icdCode: 'J00', plan: 'Perbanyak minum, paracetamol bila demam',
    prescriptions: [
      { drugId: 'd1', drugName: 'Paracetamol 500mg', quantity: 6, unit: 'tablet', dosage: '3x1 bila demam', pricePerUnit: 500 },
    ],
    totalBill: 95000, paymentStatus: 'unpaid', controlDate: '2026-09-30',
    konsultasiFee: 50000,
  },

  // ── Mom & Baby Spa ──
  {
    id: 'v9', patientId: 'p6', date: '2026-09-20T14:00:00', poli: 'Mom and Baby Spa', category: 'spa', subCategory: 'Pijat Bayi',
    doctorName: 'Terapis Nila Ayu',
    subjective: 'Pijat bayi usia 4 bulan. Bayi tenang, tidak ada keluhan kulit.',
    objective: JSON.stringify({ layanan: 'Pijat Bayi', data: { usia: '4 bulan', durasi: '45 menit', kondisi: 'Bayi tenang, tidak ada ruam' } }),
    assessment: 'Treatment Spa - Pijat Bayi',
    icdCode: 'Z50.1', plan: 'Pijat bayi relaksasi durasi 45 menit',
    prescriptions: [],
    totalBill: 120000, paymentStatus: 'unpaid',
    konsultasiFee: 120000,
  },
];

const seedDrugs: Drug[] = [
  { id: 'd1', name: 'Paracetamol 500mg', category: 'Analgesik/Antipiretik', stock: 500, minStock: 50, unit: 'tablet', buyPrice: 300, sellPrice: 500, expiryDate: '2027-12-31' },
  { id: 'd2', name: 'Amoxicillin 500mg', category: 'Antibiotik', stock: 200, minStock: 30, unit: 'kaplet', buyPrice: 1000, sellPrice: 1500, expiryDate: '2027-06-30' },
  { id: 'd3', name: 'Antasida Doen', category: 'Antasida', stock: 150, minStock: 20, unit: 'tablet', buyPrice: 400, sellPrice: 700, expiryDate: '2027-09-30' },
  { id: 'd4', name: 'Cetirizine 10mg', category: 'Antihistamin', stock: 180, minStock: 20, unit: 'tablet', buyPrice: 600, sellPrice: 1000, expiryDate: '2027-11-30' },
  { id: 'd5', name: 'Amlodipine 5mg', category: 'Antihipertensi', stock: 45, minStock: 50, unit: 'tablet', buyPrice: 700, sellPrice: 1000, expiryDate: '2027-08-31' },
  { id: 'd6', name: 'Metformin 500mg', category: 'Antidiabetik', stock: 300, minStock: 50, unit: 'tablet', buyPrice: 500, sellPrice: 800, expiryDate: '2027-10-31' },
  { id: 'd7', name: 'Tablet Fe (Besi)', category: 'Vitamin & Suplemen', stock: 12, minStock: 30, unit: 'tablet', buyPrice: 300, sellPrice: 500, expiryDate: '2026-11-30' },
  { id: 'd8', name: 'Omeprazole 20mg', category: 'Antasida/PPI', stock: 100, minStock: 20, unit: 'kapsul', buyPrice: 1200, sellPrice: 2000, expiryDate: '2027-07-31' },
  { id: 'd9', name: 'Salbutamol 4mg', category: 'Bronkodilator', stock: 80, minStock: 15, unit: 'tablet', buyPrice: 500, sellPrice: 800, expiryDate: '2027-05-31' },
  { id: 'd10', name: 'Dexamethasone 0.5mg', category: 'Kortikosteroid', stock: 120, minStock: 20, unit: 'tablet', buyPrice: 400, sellPrice: 700, expiryDate: '2027-04-30' },
];

const seedQueue: QueueItem[] = [
  { id: 'q1', ticketNumber: 'A-01', patientId: 'p3', patientName: 'Anak Budi Santoso', poli: 'Anak', status: 'done', createdAt: '2026-09-20T07:30:00' },
  { id: 'q2', ticketNumber: 'U-01', patientId: 'p2', patientName: 'Ibu Dewi Rahayu', poli: 'Umum', status: 'in-progress', createdAt: '2026-09-20T07:45:00' },
  { id: 'q3', ticketNumber: 'U-02', patientId: 'p6', patientName: 'Ny. Fitria Nadia', poli: 'Umum', status: 'waiting', createdAt: '2026-09-20T08:00:00' },
  { id: 'q4', ticketNumber: 'U-03', patientId: 'p1', patientName: 'Bapak Hendra Wijaya', poli: 'Umum', status: 'waiting', createdAt: '2026-09-20T08:15:00' },
  { id: 'q5', ticketNumber: 'I-01', patientId: 'p4', patientName: 'Ny. Sari Indah', poli: 'Ibu', status: 'waiting', createdAt: '2026-09-20T08:20:00' },
  { id: 'q6', ticketNumber: 'I-02', patientId: 'p2', patientName: 'Ibu Dewi Rahayu', poli: 'Ibu', status: 'waiting', createdAt: '2026-09-20T08:25:00' },
];

const seedANC: ANCRecord[] = [
  {
    patientId: 'p4',
    lmpDate: '2026-03-15',
    edd: '2026-12-20',
    gravida: 2, para: 1, abortus: 0,
    visits: [
      { id: 'anc1', date: '2026-04-20', ageWeeks: 5, weight: 58, bloodPressure: '110/70', fetalHeartRate: 0, uterineFundus: 0, presentation: '-', notes: 'USG konfirmasi kehamilan' },
      { id: 'anc2', date: '2026-06-05', ageWeeks: 12, weight: 59, bloodPressure: '112/72', fetalHeartRate: 155, uterineFundus: 0, presentation: 'Kepala', notes: 'USG trimester 1, normal' },
      { id: 'anc3', date: '2026-08-10', ageWeeks: 21, weight: 62, bloodPressure: '110/70', fetalHeartRate: 148, uterineFundus: 20, presentation: 'Kepala', notes: 'USG trimester 2, anatomi normal' },
      { id: 'anc4', date: '2026-09-18', ageWeeks: 28, weight: 65, bloodPressure: '110/70', fetalHeartRate: 152, uterineFundus: 27, presentation: 'Kepala', notes: 'Kontrol rutin 28 minggu' },
    ],
  },
];

const seedDoctors: Doctor[] = [
  { id: 'dr1', name: 'dr. Andi Saputra, Sp.PD', role: 'Sp.PD', sip: '1234567890123', phone: '081234567890', poli: 'Umum' },
  { id: 'dr2', name: 'dr. Rina Sari, Sp.OG', role: 'Sp.OG', sip: '1234567890124', phone: '081234567891', poli: 'Ibu' },
  { id: 'dr3', name: 'dr. Maya Dewi, Sp.A', role: 'Sp.A', sip: '1234567890125', phone: '081234567892', poli: 'Anak' },
  { id: 'dr4', name: 'Bidan Siti Rahma, S.Tr.Keb', role: 'S.Tr.Keb', sip: '1234567890126', phone: '081234567893', poli: 'Umum' },
  { id: 'dr5', name: 'dr. Hendra Kusuma', role: 'Sp.PD', sip: '1234567890127', phone: '081234567894', poli: 'Umum' },
];

// --- Generic CRUD helpers ---
function load<T>(key: string): T[] {
  if (typeof window === 'undefined') return [];
  try {
    return JSON.parse(localStorage.getItem(key) || '[]') as T[];
  } catch {
    return [];
  }
}

function save<T>(key: string, data: T[]): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(key, JSON.stringify(data));
}

function initKey<T>(key: string, seed: T[]): void {
  if (typeof window === 'undefined') return;
  if (!localStorage.getItem(key)) save(key, seed);
}


let isSyncing = false;
export async function syncFromBackend(): Promise<void> {
  if (isSyncing || typeof window === 'undefined') return;
  isSyncing = true;
  try {
    const [pts, docs, dgs, vst, q, tx, anc, ltr, kps] = await Promise.allSettled([
      api.getPatients(),
      api.getDoctors(),
      api.getDrugs(),
      api.getVisits(),
      api.getQueues(),
      api.getTransactions(),
      api.getAncRecords(),
      api.getLetters(),
      api.getCustomKops(),
    ]);

    if (pts.status === 'fulfilled' && pts.value?.length) {
      const mapped = pts.value.map((p: any) => ({
        id: p.id,
        rm: p.rm,
        name: p.name,
        nik: p.nik || '',
        dob: p.dob || '',
        gender: p.gender || 'L',
        phone: p.phone || '',
        address: p.address || '',
        insurance: p.insurance || 'Umum',
        bloodType: p.blood_type || p.bloodType,
        allergy: p.allergy || '-',
        createdAt: p.created_at || new Date().toISOString(),
      }));
      save(KEYS.patients, mapped);
    }

    if (docs.status === 'fulfilled' && docs.value?.length) {
      save(KEYS.doctors, docs.value);
    }

    if (dgs.status === 'fulfilled' && dgs.value?.length) {
      const mapped = dgs.value.map((d: any) => ({
        id: d.id,
        name: d.name,
        category: d.category,
        stock: d.stock,
        minStock: d.min_stock ?? d.minStock,
        unit: d.unit,
        buyPrice: d.buy_price ?? d.buyPrice,
        sellPrice: d.sell_price ?? d.sellPrice,
        expiryDate: d.expiry_date ?? d.expiryDate,
      }));
      save(KEYS.drugs, mapped);
    }

    if (vst.status === 'fulfilled' && vst.value?.length) {
      const mapped = vst.value.map((v: any) => ({
        id: v.id,
        patientId: v.patient_id ?? v.patientId,
        date: v.date,
        poli: v.poli,
        category: v.category,
        subCategory: v.sub_category ?? v.subCategory,
        doctorName: v.doctor_name ?? v.doctorName,
        subjective: v.subjective,
        objective: typeof v.objective === 'object' ? JSON.stringify(v.objective) : v.objective,
        assessment: v.assessment,
        icdCode: v.icd_code ?? v.icdCode,
        plan: v.plan,
        prescriptions: v.prescriptions || [],
        totalBill: v.total_bill ?? v.totalBill,
        paymentStatus: v.payment_status ?? v.paymentStatus,
        paymentMethod: v.payment_method ?? v.paymentMethod,
        konsultasiFee: v.konsultasi_fee ?? v.konsultasiFee,
        drugGlobalFee: v.drug_global_fee ?? v.drugGlobalFee,
        drugDetailPending: v.drug_detail_pending ?? v.drugDetailPending,
        controlDate: v.control_date ?? v.controlDate,
        notes: v.notes,
        detailData: v.detail_data ?? v.detailData,
      }));
      save(KEYS.visits, mapped);
    }

    if (q.status === 'fulfilled' && q.value?.length) {
      const mapped = q.value.map((item: any) => ({
        id: item.id,
        ticketNumber: item.ticket_number ?? item.ticketNumber,
        patientId: item.patient_id ?? item.patientId,
        patientName: item.patient_name ?? item.patientName,
        poli: item.poli,
        status: item.status,
        createdAt: item.created_at || new Date().toISOString(),
      }));
      save(KEYS.queue, mapped);
    }

    if (tx.status === 'fulfilled' && tx.value?.length) {
      const mapped = tx.value.map((t: any) => ({
        id: t.id,
        visitId: t.visit_id ?? t.visitId,
        patientId: t.patient_id ?? t.patientId,
        patientName: t.patient_name ?? t.patientName,
        date: t.date,
        items: t.items || [],
        total: t.total,
        paymentMethod: t.payment_method ?? t.paymentMethod,
        paidAmount: t.paid_amount ?? t.paidAmount,
        change: t.change,
        createdAt: t.created_at || t.date,
        queueNumber: t.queue_number ?? t.queueNumber,
        doctorName: t.doctor_name ?? t.doctorName,
      }));
      save(KEYS.transactions, mapped);
    }

    if (anc.status === 'fulfilled' && anc.value?.length) {
      const mapped = anc.value.map((a: any) => ({
        patientId: a.patient_id ?? a.patientId,
        lmpDate: a.lmp_date ?? a.lmpDate,
        edd: a.edd,
        gravida: a.gravida,
        para: a.para,
        abortus: a.abortus,
        visits: a.visits || [],
      }));
      save(KEYS.ancRecords, mapped);
    }

    if (ltr.status === 'fulfilled' && ltr.value?.length) {
      const mapped = ltr.value.map((l: any) => ({
        id: l.id,
        type: l.type,
        number: l.number,
        patientId: l.patient_id ?? l.patientId,
        patientName: l.patient_name ?? l.patientName,
        patientRM: l.patient_rm ?? l.patientRM,
        date: l.date,
        kop: l.kop,
        customKopImg: l.custom_kop_img ?? l.customKopImg,
        data: l.data || {},
        createdAt: l.created_at || new Date().toISOString(),
      }));
      save(KEYS.letters, mapped);
    }

    if (kps.status === 'fulfilled' && kps.value?.length) {
      save(KEYS.customKop, kps.value);
    }
  } catch (err) {
    console.warn('Backend sync warning:', err);
  } finally {
    isSyncing = false;
  }
}

export function initStore(): void {
  syncFromBackend().catch(() => {});
  initKey(KEYS.patients, seedPatients);
  initKey(KEYS.visits, seedVisits);
  initKey(KEYS.drugs, seedDrugs);
  initKey(KEYS.queue, seedQueue);
  initKey(KEYS.transactions, []);
  initKey(KEYS.ancRecords, seedANC);
  initKey(KEYS.doctors, seedDoctors);
  initKey(KEYS.letters, []);
}

export function resetStore(): void {
  Object.values(KEYS).forEach(k => localStorage.removeItem(k));
  initStore();
}

// --- Patients ---
export const patientStore = {
  getAll: () => load<Patient>(KEYS.patients),
  get: (id: string) => load<Patient>(KEYS.patients).find(p => p.id === id),
  save: (patients: Patient[]) => save(KEYS.patients, patients),
  add: (p: Patient) => {
    const all = load<Patient>(KEYS.patients);
    all.push(p);
    save(KEYS.patients, all);
    api.savePatient(p).catch(console.error);
  },
  update: (updated: Patient) => {
    const all = load<Patient>(KEYS.patients).map(p => p.id === updated.id ? updated : p);
    save(KEYS.patients, all);
    api.savePatient(updated).catch(console.error);
  },
  nextRM: () => {
    const all = load<Patient>(KEYS.patients);
    const n = all.length + 1;
    return `RM-2026-${String(n).padStart(3, '0')}`;
  },
};

// --- Visits ---
export const visitStore = {
  getAll: () => load<Visit>(KEYS.visits),
  getByPatient: (patientId: string) => load<Visit>(KEYS.visits).filter(v => v.patientId === patientId).sort((a, b) => b.date.localeCompare(a.date)),
  getUnpaid: () => load<Visit>(KEYS.visits).filter(v => v.paymentStatus === 'unpaid'),
  add: (v: Visit) => {
    const all = load<Visit>(KEYS.visits);
    all.push(v);
    save(KEYS.visits, all);
    api.saveVisit(v).catch(console.error);
  },
  update: (updated: Visit) => {
    const all = load<Visit>(KEYS.visits).map(v => v.id === updated.id ? updated : v);
    save(KEYS.visits, all);
    api.saveVisit(updated).catch(console.error);
  },
};

// --- Drugs ---
export const drugStore = {
  getAll: () => load<Drug>(KEYS.drugs),
  get: (id: string) => load<Drug>(KEYS.drugs).find(d => d.id === id),
  add: (d: Drug) => {
    const all = load<Drug>(KEYS.drugs);
    all.push(d);
    save(KEYS.drugs, all);
    api.saveDrug(d).catch(console.error);
  },
  update: (updated: Drug) => {
    const all = load<Drug>(KEYS.drugs).map(d => d.id === updated.id ? updated : d);
    save(KEYS.drugs, all);
    api.saveDrug(updated).catch(console.error);
  },
  deductStock: (drugId: string, qty: number) => {
    const all = load<Drug>(KEYS.drugs).map(d =>
      d.id === drugId ? { ...d, stock: Math.max(0, d.stock - qty) } : d
    );
    save(KEYS.drugs, all);
  },
  getLowStock: () => load<Drug>(KEYS.drugs).filter(d => d.stock <= d.minStock),
  getNearExpiry: () => {
    const soon = new Date();
    soon.setDate(soon.getDate() + 60);
    return load<Drug>(KEYS.drugs).filter(d => new Date(d.expiryDate) <= soon);
  },
};

// --- Queue ---
export const queueStore = {
  getAll: () => load<QueueItem>(KEYS.queue),
  getToday: () => {
    const today = new Date().toISOString().slice(0, 10);
    return load<QueueItem>(KEYS.queue).filter(q => q.createdAt.startsWith(today));
  },
  add: (q: QueueItem) => {
    const all = load<QueueItem>(KEYS.queue);
    all.push(q);
    save(KEYS.queue, all);
    api.saveQueue(q).catch(console.error);
  },
  update: (updated: QueueItem) => {
    const all = load<QueueItem>(KEYS.queue).map(q => q.id === updated.id ? updated : q);
    save(KEYS.queue, all);
    api.saveQueue(updated).catch(console.error);
  },
  nextTicket: (prefix: string) => {
    const today = new Date().toISOString().slice(0, 10);
    const todayItems = load<QueueItem>(KEYS.queue)
      .filter(q => q.createdAt.startsWith(today) && q.ticketNumber.startsWith(prefix));
    return `${prefix}-${String(todayItems.length + 1).padStart(2, '0')}`;
  },
  getQueueForPatientToday: (patientId: string) => {
    const today = new Date().toISOString().slice(0, 10);
    return load<QueueItem>(KEYS.queue)
      .filter(q => q.patientId === patientId && q.createdAt.startsWith(today))
      .sort((a, b) => b.createdAt.localeCompare(a.createdAt))[0];
  },
  getDailySequenceToday: () => {
    const today = new Date().toISOString().slice(0, 10);
    const todayItems = load<QueueItem>(KEYS.queue).filter(q => q.createdAt.startsWith(today));
    return todayItems.length;
  },
};

// --- Transactions ---
export const transactionStore = {
  getAll: () => load<Transaction>(KEYS.transactions),
  getToday: () => {
    const today = new Date().toISOString().slice(0, 10);
    return load<Transaction>(KEYS.transactions).filter(t => t.date.startsWith(today));
  },
  add: (t: Transaction) => {
    const all = load<Transaction>(KEYS.transactions);
    all.push(t);
    save(KEYS.transactions, all);
    api.saveTransaction(t).catch(console.error);
  },
  totalToday: () => {
    const today = new Date().toISOString().slice(0, 10);
    return load<Transaction>(KEYS.transactions)
      .filter(t => t.date.startsWith(today))
      .reduce((sum, t) => sum + t.total, 0);
  },
};

// --- ANC ---
export const ancStore = {
  getAll: () => load<ANCRecord>(KEYS.ancRecords),
  getByPatient: (patientId: string) => load<ANCRecord>(KEYS.ancRecords).find(a => a.patientId === patientId),
  save: (records: ANCRecord[]) => save(KEYS.ancRecords, records),
  upsert: (record: ANCRecord) => {
    const all = load<ANCRecord>(KEYS.ancRecords);
    const idx = all.findIndex(a => a.patientId === record.patientId);
    if (idx >= 0) all[idx] = record; else all.push(record);
    save(KEYS.ancRecords, all);
  },
};

// --- Doctors ---
export const doctorStore = {
  getAll: () => load<Doctor>(KEYS.doctors),
  get: (id: string) => load<Doctor>(KEYS.doctors).find(d => d.id === id),
  add: (d: Doctor) => {
    const all = load<Doctor>(KEYS.doctors);
    all.push(d);
    save(KEYS.doctors, all);
    api.saveDoctor(d).catch(console.error);
  },
  update: (updated: Doctor) => {
    const all = load<Doctor>(KEYS.doctors).map(d => d.id === updated.id ? updated : d);
    save(KEYS.doctors, all);
    api.saveDoctor(updated).catch(console.error);
  },
  delete: (id: string) => {
    const all = load<Doctor>(KEYS.doctors).filter(d => d.id !== id);
    save(KEYS.doctors, all);
    api.deleteDoctor(id).catch(console.error);
  },
};

// --- Surat Keterangan ---
export const letterStore = {
  getAll: () => load<Letter>(KEYS.letters).sort((a, b) => b.createdAt.localeCompare(a.createdAt)),
  get: (id: string) => load<Letter>(KEYS.letters).find(l => l.id === id),
  getByPatient: (patientId: string) => load<Letter>(KEYS.letters)
    .filter(l => l.patientId === patientId)
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt)),
  add: (l: Letter) => {
    const all = load<Letter>(KEYS.letters);
    all.push(l);
    save(KEYS.letters, all);
    api.saveLetter(l).catch(console.error);
  },
  update: (updated: Letter) => {
    const all = load<Letter>(KEYS.letters).map(l => l.id === updated.id ? updated : l);
    save(KEYS.letters, all);
    api.saveLetter(updated).catch(console.error);
  },
  delete: (id: string) => {
    const all = load<Letter>(KEYS.letters).filter(l => l.id !== id);
    save(KEYS.letters, all);
    api.deleteLetter(id).catch(console.error);
  },
  nextNumber: (prefix: string) => {
    const year = new Date().getFullYear();
    const count = load<Letter>(KEYS.letters).filter(l => l.number.includes(`/${year}`)).length + 1;
    return `${prefix}-${String(count).padStart(3, '0')}/${year}`;
  },
};

// --- Custom Kop Store ---
export const customKopStore = {
  getAll: (): KopOption[] => load<KopOption>(KEYS.customKop),
  add: (kop: KopOption) => {
    const all = load<KopOption>(KEYS.customKop);
    all.push(kop);
    save(KEYS.customKop, all);
    api.saveCustomKop(kop).catch(console.error);
  },
  delete: (id: string) => {
    const all = load<KopOption>(KEYS.customKop).filter(k => k.id !== id);
    save(KEYS.customKop, all);
    api.deleteCustomKop(id).catch(console.error);
  },
};

// --- Utils ---
export const idr = (n: number) => new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(n);
export const fmtDate = (iso: string) => new Intl.DateTimeFormat('id-ID', { dateStyle: 'long' }).format(new Date(iso));
export const fmtDateTime = (iso: string) => new Intl.DateTimeFormat('id-ID', { dateStyle: 'long', timeStyle: 'short' }).format(new Date(iso));
export const calcAge = (dob: string) => {
  const birth = new Date(dob);
  const now = new Date();
  let years = now.getFullYear() - birth.getFullYear();
  const m = now.getMonth() - birth.getMonth();
  if (m < 0 || (m === 0 && now.getDate() < birth.getDate())) years--;
  if (years < 1) {
    const months = (now.getFullYear() - birth.getFullYear()) * 12 + now.getMonth() - birth.getMonth();
    return `${months} bulan`;
  }
  return `${years} THN`;
};
export const uid = () => Math.random().toString(36).slice(2, 10);
export const calcEDD = (lmpDate: string) => {
  const d = new Date(lmpDate);
  d.setDate(d.getDate() + 280);
  return d.toISOString().slice(0, 10);
};
export const gestationalAge = (lmpDate: string) => {
  const diff = Date.now() - new Date(lmpDate).getTime();
  const weeks = Math.floor(diff / (7 * 24 * 60 * 60 * 1000));
  const days = Math.floor((diff % (7 * 24 * 60 * 60 * 1000)) / (24 * 60 * 60 * 1000));
  return { weeks, days };
};
