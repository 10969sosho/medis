import type { LetterType } from './types';

export type KopId = 'al-faruq' | 'bidan-mulyani';

export interface LetterMeta {
  type: LetterType;
  slug: string;
  label: string;
  shortLabel: string;
  prefix: string;
  kop: KopId;
  signerLabel: string;
  defaultSigner: string;
  description: string;
}

export const KOP: Record<KopId, { src: string; alt: string }> = {
  'al-faruq': {
    src: '/kop/al-faruq.jpeg',
    alt: 'Klinik Medis Al Faruq',
  },
  'bidan-mulyani': {
    src: '/kop/bidan-mulyani.jpeg',
    alt: 'Praktek Mandiri Bidan Mulyani, SST. Bd',
  },
};

export const LETTER_META: Record<LetterType, LetterMeta> = {
  sakit: {
    type: 'sakit',
    slug: 'sakit',
    label: 'Surat Keterangan Sakit',
    shortLabel: 'Sakit',
    prefix: 'SK',
    kop: 'al-faruq',
    signerLabel: 'Dokter Pemeriksa',
    defaultSigner: 'dr. Andi Saputra, Sp.PD',
    description: 'Keterangan pasien dalam keadaan sakit dan perlu istirahat.',
  },
  sehat: {
    type: 'sehat',
    slug: 'sehat',
    label: 'Surat Keterangan Sehat',
    shortLabel: 'Sehat',
    prefix: 'SH',
    kop: 'al-faruq',
    signerLabel: 'Dokter Pemeriksa',
    defaultSigner: 'dr. Andi Saputra, Sp.PD',
    description: 'Keterangan hasil pemeriksaan kesehatan (mata, telinga, tensi, dll).',
  },
  lahir: {
    type: 'lahir',
    slug: 'lahir',
    label: 'Surat Keterangan Lahir',
    shortLabel: 'Lahir',
    prefix: 'SL',
    kop: 'bidan-mulyani',
    signerLabel: 'Penolong Persalinan',
    defaultSigner: 'Mulyani, SST. Bd',
    description: 'Keterangan kelahiran bayi beserta data orang tua.',
  },
  'cuti-hamil': {
    type: 'cuti-hamil',
    slug: 'cuti-hamil',
    label: 'Surat Keterangan Cuti Hamil',
    shortLabel: 'Cuti Hamil',
    prefix: 'CH',
    kop: 'bidan-mulyani',
    signerLabel: 'Bidan',
    defaultSigner: 'Mulyani, SST. Bd',
    description: 'Keterangan kehamilan dan izin cuti bersalin.',
  },
  kematian: {
    type: 'kematian',
    slug: 'kematian',
    label: 'Surat Keterangan Kematian',
    shortLabel: 'Kematian',
    prefix: 'KM',
    kop: 'bidan-mulyani',
    signerLabel: 'Bidan Pemeriksa',
    defaultSigner: 'Mulyani, SST. Bd',
    description: 'Keterangan telah meninggal beserta data jenazah.',
  },
};

export const LETTER_TYPES: LetterType[] = [
  'sakit',
  'sehat',
  'lahir',
  'cuti-hamil',
  'kematian',
];

export function letterBySlug(slug: string): LetterMeta | undefined {
  return LETTER_TYPES.map((t) => LETTER_META[t]).find((m) => m.slug === slug);
}
