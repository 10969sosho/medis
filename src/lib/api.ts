// API Client connecting Next.js to Laravel REST API Backend
const API_BASE = process.env.NEXT_PUBLIC_API_URL || '/api';

async function request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const url = `${API_BASE}${endpoint}`;
  const headers = {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
    ...(options.headers || {}),
  };

  const res = await fetch(url, { ...options, headers });
  if (!res.ok) {
    const errorText = await res.text();
    throw new Error(`API Error [${res.status}]: ${errorText}`);
  }
  return res.json();
}

export const api = {
  // Patients
  getPatients: () => request<any[]>('/patients'),
  savePatient: (patient: any) => request<any>('/patients', { method: 'POST', body: JSON.stringify(patient) }),
  deletePatient: (id: string) => request<any>(`/patients/${id}`, { method: 'DELETE' }),

  // Doctors
  getDoctors: () => request<any[]>('/doctors'),
  saveDoctor: (doctor: any) => request<any>('/doctors', { method: 'POST', body: JSON.stringify(doctor) }),
  deleteDoctor: (id: string) => request<any>(`/doctors/${id}`, { method: 'DELETE' }),

  // Drugs
  getDrugs: () => request<any[]>('/drugs'),
  saveDrug: (drug: any) => request<any>('/drugs', { method: 'POST', body: JSON.stringify(drug) }),
  deleteDrug: (id: string) => request<any>(`/drugs/${id}`, { method: 'DELETE' }),

  // Visits (Rekam Medis)
  getVisits: () => request<any[]>('/visits'),
  saveVisit: (visit: any) => request<any>('/visits', { method: 'POST', body: JSON.stringify(visit) }),
  deleteVisit: (id: string) => request<any>(`/visits/${id}`, { method: 'DELETE' }),

  // Queues
  getQueues: () => request<any[]>('/queues'),
  saveQueue: (queue: any) => request<any>('/queues', { method: 'POST', body: JSON.stringify(queue) }),
  updateQueueStatus: (id: string, status: string) => request<any>(`/queues/${id}/status`, { method: 'PATCH', body: JSON.stringify({ status }) }),
  deleteQueue: (id: string) => request<any>(`/queues/${id}`, { method: 'DELETE' }),

  // Transactions
  getTransactions: () => request<any[]>('/transactions'),
  saveTransaction: (tx: any) => request<any>('/transactions', { method: 'POST', body: JSON.stringify(tx) }),

  // ANC Records
  getAncRecords: () => request<any[]>('/anc-records'),
  saveAncRecord: (rec: any) => request<any>('/anc-records', { method: 'POST', body: JSON.stringify(rec) }),

  // Letters
  getLetters: () => request<any[]>('/letters'),
  saveLetter: (letter: any) => request<any>('/letters', { method: 'POST', body: JSON.stringify(letter) }),
  deleteLetter: (id: string) => request<any>(`/letters/${id}`, { method: 'DELETE' }),

  // Custom Kops
  getCustomKops: () => request<any[]>('/custom-kops'),
  saveCustomKop: (kop: any) => request<any>('/custom-kops', { method: 'POST', body: JSON.stringify(kop) }),
  deleteCustomKop: (id: string) => request<any>(`/custom-kops/${id}`, { method: 'DELETE' }),
};
