'use client';

// LocalStorage keys
const KEYS = {
  patients: 'klinik_patients',
  visits: 'klinik_visits',
  drugs: 'klinik_drugs',
  queue: 'klinik_queue',
  transactions: 'klinik_transactions',
  ancRecords: 'klinik_anc',
};

import type { Patient, Visit, Drug, QueueItem, Transaction, ANCRecord } from './types';

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
  {
    id: 'v1', patientId: 'p1', date: '2026-09-15T09:30:00', poli: 'Poli Umum', doctorName: 'dr. Andi Saputra, Sp.PD',
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
    id: 'v2', patientId: 'p5', date: '2026-09-16T10:00:00', poli: 'Poli Umum', doctorName: 'dr. Andi Saputra, Sp.PD',
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
    id: 'v3', patientId: 'p7', date: '2026-09-17T11:00:00', poli: 'Poli Umum', doctorName: 'dr. Andi Saputra, Sp.PD',
    subjective: 'Pasien DM tipe 2 rutin kontrol. GDS terakhir 280. Mudah lelah.',
    objective: JSON.stringify({ td: '140/90', nadi: '80', suhu: '36.9', rr: '18', bb: '85', tb: '168' }),
    assessment: 'Diabetes Mellitus Tipe 2',
    icdCode: 'E11.9', plan: 'Cek GDS, lanjutkan Metformin',
    prescriptions: [
      { drugId: 'd6', drugName: 'Metformin 500mg', quantity: 60, unit: 'tablet', dosage: '2x1 sesudah makan', pricePerUnit: 800 },
    ],
    totalBill: 75000, paymentStatus: 'paid', paymentMethod: 'BPJS', controlDate: '2026-09-24',
  },
  {
    id: 'v4', patientId: 'p4', date: '2026-09-18T08:30:00', poli: 'Poli KIA', doctorName: 'dr. Rina Sari, Sp.OG',
    subjective: 'ANC rutin, kehamilan 28 minggu. Tidak ada keluhan bermakna.',
    objective: JSON.stringify({ td: '110/70', nadi: '82', suhu: '36.7', rr: '18', bb: '65', tb: '160' }),
    assessment: 'Kehamilan Normal G2P1A0',
    icdCode: 'Z34.2', plan: 'Kontrol rutin, Fe + Asam Folat lanjut',
    prescriptions: [
      { drugId: 'd7', drugName: 'Tablet Fe (Besi)', quantity: 30, unit: 'tablet', dosage: '1x1 malam', pricePerUnit: 500 },
    ],
    totalBill: 50000, paymentStatus: 'paid', paymentMethod: 'BPJS', controlDate: '2026-10-02',
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
  { id: 'q1', ticketNumber: 'A-01', patientId: 'p3', patientName: 'Anak Budi Santoso', poli: 'Poli Umum', status: 'done', createdAt: '2026-09-20T07:30:00' },
  { id: 'q2', ticketNumber: 'A-02', patientId: 'p2', patientName: 'Ibu Dewi Rahayu', poli: 'Poli Umum', status: 'in-progress', createdAt: '2026-09-20T07:45:00' },
  { id: 'q3', ticketNumber: 'A-03', patientId: 'p6', patientName: 'Ny. Fitria Nadia', poli: 'Poli Umum', status: 'waiting', createdAt: '2026-09-20T08:00:00' },
  { id: 'q4', ticketNumber: 'A-04', patientId: 'p1', patientName: 'Bapak Hendra Wijaya', poli: 'Poli Umum', status: 'waiting', createdAt: '2026-09-20T08:15:00' },
  { id: 'q5', ticketNumber: 'K-01', patientId: 'p4', patientName: 'Ny. Sari Indah', poli: 'Poli KIA', status: 'waiting', createdAt: '2026-09-20T08:20:00' },
  { id: 'q6', ticketNumber: 'K-02', patientId: 'p4', patientName: 'Ny. Fitria Nadia', poli: 'Poli KIA', status: 'waiting', createdAt: '2026-09-20T08:25:00' },
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

export function initStore(): void {
  initKey(KEYS.patients, seedPatients);
  initKey(KEYS.visits, seedVisits);
  initKey(KEYS.drugs, seedDrugs);
  initKey(KEYS.queue, seedQueue);
  initKey(KEYS.transactions, []);
  initKey(KEYS.ancRecords, seedANC);
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
  },
  update: (updated: Patient) => {
    const all = load<Patient>(KEYS.patients).map(p => p.id === updated.id ? updated : p);
    save(KEYS.patients, all);
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
  },
  update: (updated: Visit) => {
    const all = load<Visit>(KEYS.visits).map(v => v.id === updated.id ? updated : v);
    save(KEYS.visits, all);
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
  },
  update: (updated: Drug) => {
    const all = load<Drug>(KEYS.drugs).map(d => d.id === updated.id ? updated : d);
    save(KEYS.drugs, all);
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
  },
  update: (updated: QueueItem) => {
    const all = load<QueueItem>(KEYS.queue).map(q => q.id === updated.id ? updated : q);
    save(KEYS.queue, all);
  },
  nextTicket: (prefix: string) => {
    const today = new Date().toISOString().slice(0, 10);
    const todayItems = load<QueueItem>(KEYS.queue)
      .filter(q => q.createdAt.startsWith(today) && q.ticketNumber.startsWith(prefix));
    return `${prefix}-${String(todayItems.length + 1).padStart(2, '0')}`;
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

// --- Utils ---
export const idr = (n: number) => new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(n);
export const fmtDate = (iso: string) => new Intl.DateTimeFormat('id-ID', { dateStyle: 'long' }).format(new Date(iso));
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
