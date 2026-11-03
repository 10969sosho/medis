// Core data types for SIM-Klinik Demo

export interface Patient {
  id: string;
  rm: string; // Nomor Rekam Medis
  name: string;
  nik: string;
  dob: string; // ISO date
  gender: 'L' | 'P';
  phone: string;
  address: string;
  insurance: 'BPJS' | 'Asuransi' | 'Umum';
  bloodType?: 'A' | 'B' | 'AB' | 'O';
  allergy?: string;
  createdAt: string;
}

export interface Visit {
  id: string;
  patientId: string;
  date: string; // ISO date
  poli: string;
  doctorName: string;
  subjective: string;  // Keluhan
  objective: string;   // Pemeriksaan (JSON string for structured data)
  assessment: string;  // Diagnosa ICD-10
  icdCode: string;
  plan: string;        // Tindakan & terapi
  prescriptions: Prescription[];
  totalBill: number;
  paymentStatus: 'unpaid' | 'paid';
  paymentMethod?: 'Tunai' | 'QRIS' | 'BPJS' | 'Asuransi';
  konsultasiFee?: number; // Biaya konsultasi
  drugGlobalFee?: number; // Biaya obat global (belum dirinci)
  drugDetailPending?: boolean; // Detail obat belum diisi
  controlDate?: string; // Jadwal kontrol berikutnya
  notes?: string;
  category?: 'ibu' | 'anak' | 'spa' | 'umum';
  subCategory?: string;
  detailData?: any;
}

export interface Prescription {
  drugId: string;
  drugName: string;
  quantity: number;
  unit: string;
  dosage: string; // e.g., "3x1 sesudah makan"
  pricePerUnit: number;
}

export interface Drug {
  id: string;
  name: string;
  category: string;
  stock: number;
  minStock: number;
  unit: string; // tablet, kapsul, botol, dll
  buyPrice: number;
  sellPrice: number;
  expiryDate: string; // ISO date
}

export interface QueueItem {
  id: string;
  ticketNumber: string; // e.g., "A-05"
  patientId: string;
  patientName: string;
  poli: string;
  status: 'waiting' | 'called' | 'in-progress' | 'done' | 'skipped';
  createdAt: string;
}

export interface Transaction {
  id: string;
  visitId: string;
  patientId: string;
  patientName: string;
  date: string;
  items: { label: string; amount: number }[];
  total: number;
  paymentMethod: 'Tunai' | 'QRIS' | 'BPJS' | 'Asuransi';
  paidAmount: number;
  change: number;
  createdAt: string;
}

export interface ANCRecord {
  patientId: string;
  lmpDate: string; // HPHT - Hari Pertama Haid Terakhir
  edd: string;     // HPL - Hari Perkiraan Lahir (computed)
  gravida: number;
  para: number;
  abortus: number;
  visits: ANCVisit[];
}

export interface ANCVisit {
  id: string;
  date: string;
  ageWeeks: number;
  weight: number;
  bloodPressure: string;
  fetalHeartRate: number;
  uterineFundus: number; // cm
  presentation: string;
  notes: string;
}

export interface Doctor {
  id: string;
  name: string;
  role: string;
  sip?: string;
  phone?: string;
  poli?: string;
}

export type PoliType = 'Ibu' | 'Anak' | 'Mom and Baby Spa' | 'Umum';

// ─── Surat Keterangan ────────────────────────────────────────────────────────
export type LetterType = 'sakit' | 'sehat' | 'lahir' | 'cuti-hamil' | 'kematian';

export interface Letter {
  id: string;
  type: LetterType;
  number: string;
  patientId: string;
  patientName: string;
  patientRM: string;
  date: string; // tanggal surat (ISO date)
  data: Record<string, string>;
  createdAt: string;
  updatedAt?: string;
}
