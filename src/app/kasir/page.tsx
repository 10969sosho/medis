'use client';

import { Suspense, useEffect, useState, useRef } from 'react';
import { useSearchParams } from 'next/navigation';
import {
  initStore,
  syncFromBackend,
  visitStore,
  patientStore,
  drugStore,
  transactionStore,
  queueStore,
  idr,
  uid,
} from '@/lib/store';
import type { Visit, Transaction } from '@/lib/types';
import {
  Receipt,
  CreditCard,
  Banknote,
  QrCode,
  ShieldCheck,
  CheckCircle2,
  X,
  Printer,
  ClipboardList,
  Clock,
  TrendingUp,
  ChevronRight,
  Calendar,
  User,
  Stethoscope,
  Pill,
} from 'lucide-react';

// ─── constants ───────────────────────────────────────────────────────────────
const KONSULTASI_FEE = 0;
const CLINIC_NAME = 'BIDAN YANI H. RUDI SST. Bd';
const CLINIC_ADDR = 'PERUM Kedungturi Permai 2 BLOK U 23';
const CLINIC_PHONE = 'WA 081331136178 / layanan klinik 081390974100';

type PayMethod = 'Tunai' | 'QRIS' | 'BPJS' | 'Asuransi';

interface BillLine {
  label: string;
  qty?: number;
  unitPrice?: number;
  amount: number;
}

interface PaidVisit {
  visit: Visit;
  transaction: Transaction;
  patientName: string;
  patientRM: string;
}

// ─── helpers ─────────────────────────────────────────────────────────────────
function buildBillLines(visit: Visit, konsultasiFee: number): BillLine[] {
  const drugsTotal = visit.prescriptions.reduce(
    (s, p) => s + p.quantity * p.pricePerUnit,
    0,
  );
  const originalKonsultasi = visit.konsultasiFee ?? 0;
  const tindakan = Math.max(0, visit.totalBill - originalKonsultasi - drugsTotal);
  const lines: BillLine[] = [];

  if (konsultasiFee > 0) {
    lines.push({ label: 'Jasa Konsultasi', qty: 1, unitPrice: konsultasiFee, amount: konsultasiFee });
  }

  if (tindakan > 0) {
    lines.push({ label: visit.subCategory || 'Tindakan Medis', qty: 1, unitPrice: tindakan, amount: tindakan });
  }

  if ((!visit.prescriptions || visit.prescriptions.length === 0) && (visit.drugGlobalFee || 0) > 0) {
    const fee = visit.drugGlobalFee as number;
    lines.push({ label: 'Obat-obatan', qty: 1, unitPrice: fee, amount: fee });
  }

  visit.prescriptions.forEach((p) => {
    lines.push({
      label: p.drugName,
      qty: p.quantity,
      unitPrice: p.pricePerUnit,
      amount: p.quantity * p.pricePerUnit,
    });
  });

  if (lines.length === 0) {
    lines.push({ label: 'Biaya Pemeriksaan', qty: 1, unitPrice: visit.totalBill, amount: visit.totalBill });
  }

  return lines;
}

function todayISO() {
  return new Date().toISOString().slice(0, 10);
}

function fmtDateTime(iso: string) {
  return new Intl.DateTimeFormat('id-ID', {
    dateStyle: 'long',
    timeStyle: 'short',
  }).format(new Date(iso));
}

function fmtDateShort(iso: string) {
  return new Intl.DateTimeFormat('id-ID', { dateStyle: 'long' }).format(new Date(iso));
}

// ─── PayMethod icon ───────────────────────────────────────────────────────────
function PayIcon({ method }: { method: PayMethod }) {
  if (method === 'Tunai') return <Banknote className="w-4 h-4" />;
  if (method === 'QRIS') return <QrCode className="w-4 h-4" />;
  if (method === 'BPJS') return <ShieldCheck className="w-4 h-4" />;
  return <CreditCard className="w-4 h-4" />;
}

// ─── invoice date & time helpers ─────────────────────────────────────────────
function fmtReceiptDate(iso: string) {
  const d = new Date(iso);
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const dd = String(d.getDate()).padStart(2, '0');
  return `${yyyy}-${mm}-${dd}`;
}

function fmtReceiptTime(iso: string) {
  const d = new Date(iso);
  const hh = String(d.getHours()).padStart(2, '0');
  const min = String(d.getMinutes()).padStart(2, '0');
  const ss = String(d.getSeconds()).padStart(2, '0');
  return `${hh}:${min}:${ss}`;
}

// ─── Invoice Component (for thermal receipt 58mm/80mm) ──────────────────────
function Invoice({
  transaction,
  patientName,
  patientRM,
  poli,
  invoiceRef,
}: {
  transaction: Transaction;
  patientName: string;
  patientRM: string;
  poli: string;
  invoiceRef: React.RefObject<HTMLDivElement | null>;
}) {
  const queueNum = transaction.queueNumber || '-';
  const doctor = transaction.doctorName || 'bidan yani sst. bd';
  const payLabel =
    transaction.paymentMethod === 'Tunai'
      ? 'Bayar (Cash)'
      : `Bayar (${transaction.paymentMethod})`;

  return (
    <div
      ref={invoiceRef}
      className="thermal-receipt-container bg-white text-black font-mono text-[11.5px] leading-tight w-full max-w-[320px] mx-auto p-3 shadow-sm border border-slate-100 rounded-lg"
      style={{ fontFamily: 'monospace, "Courier New", Courier' }}
    >
      {/* Header Klinik */}
      <div className="text-center pb-2">
        <p className="font-bold text-sm tracking-wide uppercase">{CLINIC_NAME}</p>
        <p className="text-[11px] leading-snug mt-0.5">{CLINIC_ADDR}</p>
        <p className="text-[10px] leading-snug mt-0.5">{CLINIC_PHONE}</p>
        {/* Nomor antrian hari itu di bawah nomor telepon */}
        <p className="text-xs font-bold tracking-widest mt-1">
          {queueNum}
        </p>
      </div>

      {/* Garis putus-putus pembatas */}
      <div className="border-t border-dashed border-black my-1" />

      {/* Tanggal, Jam, Dokter, No Antrian */}
      <div className="text-[11px] py-1 flex justify-between items-start gap-2">
        <div>
          <div>{fmtReceiptDate(transaction.createdAt || transaction.date)}</div>
          <div>{fmtReceiptTime(transaction.createdAt || transaction.date)}</div>
          <div className="font-semibold">{queueNum}</div>
        </div>
        <div className="text-right uppercase">
          <div className="font-semibold">{doctor}</div>
          <div className="text-[10px] text-slate-600">{patientName}</div>
        </div>
      </div>

      {/* Garis putus-putus pembatas */}
      <div className="border-t border-dashed border-black my-1" />

      {/* Daftar Item / Layanan & Obat */}
      <div className="py-1 space-y-1 text-[11px]">
        {transaction.items.map((item: any, i) => {
          const qty = item.qty || 1;
          const unitPrice = item.unitPrice || item.amount;
          return (
            <div key={i} className="space-y-0.5">
              <div className="font-medium truncate">{item.label}</div>
              <div className="flex justify-between items-center text-slate-800">
                <span>
                  {qty} X {unitPrice.toLocaleString('id-ID')}
                </span>
                <span className="font-semibold">
                  Rp {item.amount.toLocaleString('id-ID')}
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Garis putus-putus pembatas */}
      <div className="border-t border-dashed border-black my-1" />

      {/* Ringkasan Total, Bayar, Kembali */}
      <div className="py-1 text-[11px] space-y-0.5 font-medium">
        <div className="flex justify-between font-bold text-xs">
          <span>Total</span>
          <span>Rp {transaction.total.toLocaleString('id-ID')}</span>
        </div>
        <div className="flex justify-between">
          <span>{payLabel}</span>
          <span>Rp {transaction.paidAmount.toLocaleString('id-ID')}</span>
        </div>
        <div className="flex justify-between">
          <span>Kembali</span>
          <span>Rp {transaction.change.toLocaleString('id-ID')}</span>
        </div>
      </div>

      {/* Garis putus-putus pembatas */}
      <div className="border-t border-dashed border-black my-2" />

      {/* Pesan Penutup Sesuai Gambar */}
      <div className="text-center text-[10.5px] leading-tight space-y-1 pt-1 pb-2">
        <p className="font-medium">Semoga Lekas Sembuh Sehat Selalu</p>
        <p className="font-medium">dan barokah</p>
        <p className="mt-1">Terimakasih atas kunjungan anda</p>
      </div>
    </div>
  );
}

// ─── Main Page Content ────────────────────────────────────────────────────────
function KasirContent() {
  const searchParams = useSearchParams();
  const [tab, setTab] = useState<'unpaid' | 'history'>('unpaid');

  // unpaid list
  const [unpaidVisits, setUnpaidVisits] = useState<
    { visit: Visit; patientName: string; patientRM: string }[]
  >([]);

  // history
  const [transactions, setTransactions] = useState<Transaction[]>([]);

  // payment modal
  const [payVisit, setPayVisit] = useState<Visit | null>(null);
  const [payPatientName, setPayPatientName] = useState('');
  const [payPatientRM, setPayPatientRM] = useState('');
  const [payMethod, setPayMethod] = useState<PayMethod>('Tunai');
  const [paidAmount, setPaidAmount] = useState('');
  const [konsultasiFee, setKonsultasiFee] = useState(() => {
    // Try to get from visit, fallback to 0
    return payVisit?.konsultasiFee ? parseInt(String(payVisit.konsultasiFee), 10) : 0;
  });
  const [payError, setPayError] = useState('');

  // success / invoice modal
  const [successData, setSuccessData] = useState<PaidVisit | null>(null);
  const invoiceRef = useRef<HTMLDivElement>(null);

  // ── load data ──
  function loadData() {
    initStore();
    const unpaid = visitStore.getUnpaid().map((v) => {
      const p = patientStore.get(v.patientId);
      return {
        visit: v,
        patientName: p?.name ?? 'Pasien Tidak Dikenal',
        patientRM: p?.rm ?? '-',
      };
    });
    setUnpaidVisits(unpaid);

    const allTx = transactionStore.getAll().sort((a, b) =>
      b.createdAt.localeCompare(a.createdAt),
    );
    setTransactions(allTx);
    return unpaid;
  }

  useEffect(() => {
    loadData();
    syncFromBackend().then(() => {
      const refreshedUnpaid = loadData();
      const pid = searchParams.get('patientId');
      if (pid) {
        const target = refreshedUnpaid.find((u) => u.visit.patientId === pid);
        if (target) {
          openPayModal(target.visit, target.patientName, target.patientRM);
        }
      }
    });

    const pid = searchParams.get('patientId');
    if (pid) {
      const currentUnpaid = visitStore.getUnpaid().map((v) => {
        const p = patientStore.get(v.patientId);
        return {
          visit: v,
          patientName: p?.name ?? 'Pasien Tidak Dikenal',
          patientRM: p?.rm ?? '-',
        };
      });
      const target = currentUnpaid.find((u) => u.visit.patientId === pid);
      if (target) {
        openPayModal(target.visit, target.patientName, target.patientRM);
      }
    }
  }, [searchParams]);

  // ── derived ──
  const todayTx = transactions.filter((t) => t.date.startsWith(todayISO()));
  const todayTotal = todayTx.reduce((s, t) => s + t.total, 0);

  // ── open payment modal ──
  function openPayModal(
    visit: Visit,
    patientName: string,
    patientRM: string,
  ) {
    setPayVisit(visit);
    setPayPatientName(patientName);
    setPayPatientRM(patientRM);
    setPayMethod('Tunai');
    setPaidAmount('');
    setKonsultasiFee(visit.konsultasiFee ? parseInt(String(visit.konsultasiFee), 10) : 0);
    setPayError('');
  }

  // ── process payment ──
  function processPayment() {
    if (!payVisit) return;

    const billLines = buildBillLines(payVisit, konsultasiFee);
    const calculatedTotal = billLines.reduce((s, l) => s + l.amount, 0);

    if (payMethod === 'Tunai') {
      const paid = Number(paidAmount.replace(/\D/g, ''));
      if (!paid || paid < calculatedTotal) {
        setPayError(
          `Jumlah bayar kurang. Minimal ${idr(calculatedTotal)}`,
        );
        return;
      }
    }

    setPayError('');

    const paid =
      payMethod === 'Tunai'
        ? Number(paidAmount.replace(/\D/g, ''))
        : calculatedTotal;
    const change = Math.max(0, paid - calculatedTotal);

    // Ambil nomor antrian hari ini untuk pasien ini (reset per hari)
    const patientQueue = queueStore.getQueueForPatientToday(payVisit.patientId);
    const queueNumber = patientQueue ? patientQueue.ticketNumber : `A-${String(queueStore.getDailySequenceToday() + 1).padStart(2, '0')}`;

    const tx: Transaction = {
      id: `INV-${Date.now()}`,
      visitId: payVisit.id,
      patientId: payVisit.patientId,
      patientName: payPatientName,
      date: new Date().toISOString(),
      items: billLines.map((b) => ({ label: b.label, qty: b.qty, unitPrice: b.unitPrice, amount: b.amount } as any)),
      total: calculatedTotal,
      paymentMethod: payMethod,
      paidAmount: paid,
      change,
      createdAt: new Date().toISOString(),
      queueNumber,
      doctorName: payVisit.doctorName || 'bidan yani sst. bd',
    };

    // Save konsultasi fee to visit
    visitStore.update({
      ...payVisit,
      paymentStatus: 'paid',
      paymentMethod: payMethod,
      konsultasiFee: konsultasiFee,
      totalBill: calculatedTotal,
    });

    // save transaction
    transactionStore.add(tx);

    // reload data
    loadData();

    // close payment modal, open success modal and trigger direct print
    const pv = payVisit;
    setPayVisit(null);
    setSuccessData({
      visit: { ...pv, paymentStatus: 'paid', paymentMethod: payMethod, totalBill: calculatedTotal },
      transaction: tx,
      patientName: payPatientName,
      patientRM: payPatientRM,
    });

    // Auto trigger print dialog
    setTimeout(() => {
      window.print();
    }, 250);
  }

  // ── print ──
  function handlePrint() {
    window.print();
  }

  // ── bill lines for current modal ──
  const billLines = payVisit ? buildBillLines(payVisit, konsultasiFee) : [];
  const calculatedTotal = billLines.reduce((s, l) => s + l.amount, 0);
  const paidNum =
    payMethod === 'Tunai' ? Number(paidAmount.replace(/\D/g, '')) : 0;
  const kembalian =
    payVisit && paidNum > calculatedTotal
      ? paidNum - calculatedTotal
      : 0;

  // ────────────────────────────────────────────────────────────────────────────
  return (
    <>
      {/* ── Print-only global style ── */}
      <style>{`
        @media print {
          @page {
            size: 58mm auto;
            margin: 0;
          }
          html, body {
            margin: 0 !important;
            padding: 0 !important;
            background: #fff !important;
          }
          body > *:not(.thermal-receipt-container) {
            display: none !important;
          }
          .thermal-receipt-container {
            display: block !important;
            position: absolute !important;
            left: 0 !important;
            top: 0 !important;
            width: 58mm !important;
            max-width: 58mm !important;
            margin: 0 auto !important;
            padding: 3mm 2mm !important;
            font-size: 11px !important;
            color: #000 !important;
            background: #fff !important;
            box-sizing: border-box !important;
          }
          .no-print {
            display: none !important;
          }
        }
      `}</style>

      <div className="no-print min-h-screen bg-slate-50 p-6 space-y-6">
        {/* ── Page header ── */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-teal-600 rounded-xl flex items-center justify-center">
            <Receipt className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-slate-800">Kasir & Pembayaran</h1>
            <p className="text-sm text-slate-500">Kelola tagihan dan transaksi pasien</p>
          </div>
        </div>

        {/* ── Tabs ── */}
        <div className="flex gap-1 bg-white border border-slate-200 rounded-xl p-1 w-fit shadow-sm">
          <button
            onClick={() => setTab('unpaid')}
            className={`px-5 py-2 rounded-lg text-sm font-medium transition-colors ${
              tab === 'unpaid'
                ? 'bg-teal-600 text-white shadow-sm'
                : 'text-slate-600 hover:bg-slate-50'
            }`}
          >
            <span className="flex items-center gap-2">
              <Clock className="w-4 h-4" />
              Belum Lunas
              {unpaidVisits.length > 0 && (
                <span
                  className={`inline-flex items-center justify-center w-5 h-5 rounded-full text-xs font-bold ${
                    tab === 'unpaid' ? 'bg-white text-teal-600' : 'bg-teal-100 text-teal-700'
                  }`}
                >
                  {unpaidVisits.length}
                </span>
              )}
            </span>
          </button>
          <button
            onClick={() => setTab('history')}
            className={`px-5 py-2 rounded-lg text-sm font-medium transition-colors ${
              tab === 'history'
                ? 'bg-teal-600 text-white shadow-sm'
                : 'text-slate-600 hover:bg-slate-50'
            }`}
          >
            <span className="flex items-center gap-2">
              <ClipboardList className="w-4 h-4" />
              Riwayat Transaksi
            </span>
          </button>
        </div>

        {/* ══════════════════════════ TAB: BELUM LUNAS ═══════════════════════ */}
        {tab === 'unpaid' && (
          <div className="space-y-4">
            {unpaidVisits.length === 0 ? (
              <div className="rounded-2xl border border-slate-200 bg-white p-12 shadow-sm text-center">
                <CheckCircle2 className="w-12 h-12 text-teal-500 mx-auto mb-3" />
                <p className="text-slate-700 font-semibold text-lg">Semua Sudah Lunas!</p>
                <p className="text-slate-400 text-sm mt-1">
                  Tidak ada tagihan yang menunggu pembayaran.
                </p>
              </div>
            ) : (
              unpaidVisits.map(({ visit, patientName, patientRM }) => {
                const drugsTotal = visit.prescriptions.reduce(
                  (s, p) => s + p.quantity * p.pricePerUnit,
                  0,
                );
                return (
                  <div
                    key={visit.id}
                    className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm hover:shadow-md transition-shadow"
                  >
                    <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
                      {/* Patient info */}
                      <div className="flex-1 space-y-3">
                        <div className="flex items-start justify-between">
                          <div>
                            <div className="flex items-center gap-2">
                              <User className="w-4 h-4 text-teal-600" />
                              <span className="font-semibold text-slate-800 text-base">
                                {patientName}
                              </span>
                              <span className="inline rounded-full px-2.5 py-0.5 text-xs font-medium bg-slate-100 text-slate-600">
                                {patientRM}
                              </span>
                            </div>
                            <div className="flex items-center gap-4 mt-1 text-xs text-slate-500">
                              <span className="flex items-center gap-1">
                                <Stethoscope className="w-3 h-3" />
                                {visit.poli}
                              </span>
                              <span>•</span>
                              <span>{visit.doctorName}</span>
                              <span>•</span>
                              <span className="flex items-center gap-1">
                                <Calendar className="w-3 h-3" />
                                {fmtDateShort(visit.date)}
                              </span>
                            </div>
                          </div>
                          <span className="inline rounded-full px-2.5 py-0.5 text-xs font-medium bg-amber-100 text-amber-700">
                            Belum Lunas
                          </span>
                        </div>

                        {/* Diagnosis */}
                        <div className="bg-slate-50 rounded-xl px-3 py-2">
                          <p className="text-xs font-semibold text-slate-500 uppercase tracking-widest mb-0.5">
                            Diagnosis
                          </p>
                          <p className="text-sm text-slate-700">
                            {visit.assessment}{' '}
                            <span className="text-slate-400">({visit.icdCode})</span>
                          </p>
                        </div>

                        {/* Prescriptions summary */}
                        {visit.prescriptions.length > 0 && (
                          <div className="flex flex-wrap gap-2">
                            {visit.prescriptions.map((p, i) => (
                              <span
                                key={i}
                                className="inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-medium bg-teal-50 text-teal-700 border border-teal-100"
                              >
                                <Pill className="w-3 h-3" />
                                {p.drugName} ×{p.quantity}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>

                      {/* Bill + action */}
                      <div className="flex flex-col items-end gap-3 md:min-w-[180px]">
                        <div className="text-right">
                          <p className="text-xs text-slate-400">Total Tagihan</p>
                          <p className="text-2xl font-bold text-teal-600">
                            {idr(visit.totalBill)}
                          </p>
                          {visit.prescriptions.length > 0 && (
                            <p className="text-xs text-slate-400 mt-0.5">
                              Obat: {idr(drugsTotal)}
                            </p>
                          )}
                        </div>
                        <button
                          onClick={() => openPayModal(visit, patientName, patientRM)}
                          className="flex items-center gap-2 bg-teal-600 hover:bg-teal-700 text-white px-4 py-2 rounded-xl text-sm font-medium transition-colors"
                        >
                          <CreditCard className="w-4 h-4" />
                          Proses Pembayaran
                          <ChevronRight className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        )}

        {/* ══════════════════════════ TAB: RIWAYAT ═══════════════════════════ */}
        {tab === 'history' && (
          <div className="space-y-5">
            {/* Stats cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm flex items-center gap-4">
                <div className="w-10 h-10 bg-teal-50 rounded-xl flex items-center justify-center">
                  <ClipboardList className="w-5 h-5 text-teal-600" />
                </div>
                <div>
                  <p className="text-xs font-semibold text-slate-500 uppercase tracking-widest">
                    Transaksi Hari Ini
                  </p>
                  <p className="text-2xl font-bold text-slate-800">{todayTx.length}</p>
                </div>
              </div>
              <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm flex items-center gap-4">
                <div className="w-10 h-10 bg-teal-50 rounded-xl flex items-center justify-center">
                  <TrendingUp className="w-5 h-5 text-teal-600" />
                </div>
                <div>
                  <p className="text-xs font-semibold text-slate-500 uppercase tracking-widest">
                    Pendapatan Hari Ini
                  </p>
                  <p className="text-2xl font-bold text-teal-600">{idr(todayTotal)}</p>
                </div>
              </div>
            </div>

            {/* Table */}
            <div className="rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden">
              {transactions.length === 0 ? (
                <div className="p-12 text-center">
                  <ClipboardList className="w-10 h-10 text-slate-300 mx-auto mb-3" />
                  <p className="text-slate-500 text-sm">Belum ada riwayat transaksi.</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-slate-100 bg-slate-50">
                        <th className="text-left px-5 py-3 text-xs font-semibold text-slate-500 uppercase tracking-widest">
                          No
                        </th>
                        <th className="text-left px-5 py-3 text-xs font-semibold text-slate-500 uppercase tracking-widest">
                          No. Invoice
                        </th>
                        <th className="text-left px-5 py-3 text-xs font-semibold text-slate-500 uppercase tracking-widest">
                          Tanggal
                        </th>
                        <th className="text-left px-5 py-3 text-xs font-semibold text-slate-500 uppercase tracking-widest">
                          Pasien
                        </th>
                        <th className="text-left px-5 py-3 text-xs font-semibold text-slate-500 uppercase tracking-widest">
                          Total
                        </th>
                        <th className="text-left px-5 py-3 text-xs font-semibold text-slate-500 uppercase tracking-widest">
                          Metode
                        </th>
                        <th className="text-left px-5 py-3 text-xs font-semibold text-slate-500 uppercase tracking-widest">
                          Status
                        </th>
                        <th className="text-right px-5 py-3 text-xs font-semibold text-slate-500 uppercase tracking-widest">
                          Aksi
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {transactions.map((tx, idx) => {
                        const isToday = tx.date.startsWith(todayISO());
                        return (
                          <tr
                            key={tx.id}
                            className={`border-b border-slate-50 hover:bg-slate-50 transition-colors ${
                              isToday ? 'bg-teal-50/30' : ''
                            }`}
                          >
                            <td className="px-5 py-3 text-slate-500 text-xs">
                              {idx + 1}
                            </td>
                            <td className="px-5 py-3 font-mono text-xs text-slate-600">
                              {tx.id}
                            </td>
                            <td className="px-5 py-3 text-slate-600 whitespace-nowrap">
                              {fmtDateTime(tx.date)}
                            </td>
                            <td className="px-5 py-3 text-slate-800 font-medium">
                              {tx.patientName}
                            </td>
                            <td className="px-5 py-3 font-semibold text-teal-700">
                              {idr(tx.total)}
                            </td>
                            <td className="px-5 py-3">
                              <span className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium bg-slate-100 text-slate-700">
                                <PayIcon method={tx.paymentMethod} />
                                {tx.paymentMethod}
                              </span>
                            </td>
                            <td className="px-5 py-3">
                              <span className="inline rounded-full px-2.5 py-0.5 text-xs font-medium bg-green-100 text-green-700">
                                ✓ Lunas
                              </span>
                            </td>
                            <td className="px-5 py-3 text-right">
                              <button
                                onClick={() => {
                                  const v = visitStore.getAll().find((vis) => vis.id === tx.visitId) || {
                                    id: tx.visitId,
                                    patientId: tx.patientId,
                                    date: tx.date,
                                    poli: 'Umum',
                                    doctorName: tx.doctorName || 'bidan yani sst. bd',
                                    subjective: '',
                                    objective: '',
                                    assessment: '',
                                    icdCode: '',
                                    plan: '',
                                    prescriptions: [],
                                    totalBill: tx.total,
                                    paymentStatus: 'paid',
                                  };
                                  const p = patientStore.get(tx.patientId);
                                  setSuccessData({
                                    visit: v,
                                    transaction: tx,
                                    patientName: tx.patientName,
                                    patientRM: p?.rm || '-',
                                  });
                                }}
                                className="inline-flex items-center gap-1.5 px-3 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-lg transition-colors"
                                title="Cetak Ulang Struk"
                              >
                                <Printer className="w-3.5 h-3.5" />
                                Struk
                              </button>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* ══════════════════════════ PAYMENT MODAL ══════════════════════════════ */}
      {payVisit && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md shadow-xl max-h-[90vh] overflow-y-auto">
            {/* Modal header */}
            <div className="flex items-center justify-between mb-5">
              <div>
                <h2 className="text-lg font-bold text-slate-800">Proses Pembayaran</h2>
                <p className="text-sm text-slate-500">{payPatientName}</p>
              </div>
              <button
                onClick={() => setPayVisit(null)}
                className="text-slate-400 hover:text-slate-600 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Patient summary */}
            <div className="bg-slate-50 rounded-xl px-4 py-3 mb-5 text-sm space-y-1">
              <div className="flex justify-between text-slate-600">
                <span className="text-slate-400">No. RM</span>
                <span className="font-medium">{payPatientRM}</span>
              </div>
              <div className="flex justify-between text-slate-600">
                <span className="text-slate-400">Poli</span>
                <span>{payVisit.poli}</span>
              </div>
              <div className="flex justify-between text-slate-600">
                <span className="text-slate-400">Dokter</span>
                <span>{payVisit.doctorName}</span>
              </div>
              <div className="flex justify-between text-slate-600">
                <span className="text-slate-400">Diagnosis</span>
                <span className="text-right max-w-[60%]">{payVisit.assessment}</span>
              </div>
            </div>

            {/* Bill breakdown */}
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-widest mb-3">
              Rincian Tagihan
            </p>
            <div className="space-y-2.5 mb-3">
              {/* Jasa Konsultasi Editable */}
              <div className="flex items-center justify-between text-sm bg-slate-50 p-2.5 rounded-xl border border-slate-200">
                <span className="text-slate-700 font-medium">Jasa Konsultasi</span>
                <div className="flex items-center gap-1.5 w-36">
                  <span className="text-xs text-slate-400 font-semibold">Rp</span>
                  <input
                    type="number"
                    min={0}
                    value={konsultasiFee}
                    onChange={(e) => {
                      const val = e.target.value.replace(/\D/g, '');
                      setKonsultasiFee(Number(val) || 0);
                    }}
                    className="w-full text-right font-mono font-semibold rounded-lg border border-slate-300 px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 bg-white"
                  />
                </div>
              </div>

              {/* Rincian Non-Konsultasi (Tindakan, Obat) */}
              {billLines.filter((l) => l.label !== 'Jasa Konsultasi').map((line, i) => (
                <div key={i} className="flex justify-between text-sm px-1">
                  <span className="text-slate-600">{line.label}</span>
                  <span className="font-medium text-slate-800">{idr(line.amount)}</span>
                </div>
              ))}
            </div>
            <div className="border-t border-slate-200 pt-3 flex justify-between items-center mb-5">
              <span className="font-bold text-slate-800">TOTAL</span>
              <span className="text-xl font-bold text-teal-600">{idr(calculatedTotal)}</span>
            </div>

            {/* Payment method */}
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-widest mb-3">
              Metode Pembayaran
            </p>
            <div className="grid grid-cols-2 gap-2 mb-5">
              {(['Tunai', 'QRIS', 'BPJS', 'Asuransi'] as PayMethod[]).map((m) => (
                <label
                  key={m}
                  className={`flex items-center gap-2.5 border rounded-xl px-3 py-2.5 cursor-pointer text-sm transition-colors ${
                    payMethod === m
                      ? 'border-teal-500 bg-teal-50 text-teal-700'
                      : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  <input
                    type="radio"
                    name="payMethod"
                    value={m}
                    checked={payMethod === m}
                    onChange={() => {
                      setPayMethod(m);
                      setPayError('');
                    }}
                    className="accent-teal-600"
                  />
                  <PayIcon method={m} />
                  {m}
                </label>
              ))}
            </div>

            {/* Tunai input */}
            {payMethod === 'Tunai' && (
              <div className="mb-4 space-y-2">
                <label className="text-xs font-semibold text-slate-500 uppercase tracking-widest">
                  Jumlah Bayar
                </label>
                <input
                  type="text"
                  inputMode="numeric"
                  placeholder="Masukkan nominal..."
                  value={paidAmount}
                  onChange={(e) => {
                    const raw = e.target.value.replace(/\D/g, '');
                    setPaidAmount(raw);
                    setPayError('');
                  }}
                  className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
                />
                {paidNum >= payVisit.totalBill && paidNum > 0 && (
                  <div className="flex justify-between text-sm bg-green-50 border border-green-100 rounded-xl px-3 py-2">
                    <span className="text-green-700 font-medium">Kembalian</span>
                    <span className="text-green-700 font-bold">{idr(kembalian)}</span>
                  </div>
                )}
              </div>
            )}

            {/* Error */}
            {payError && (
              <p className="text-xs text-red-500 mb-3 bg-red-50 border border-red-100 rounded-xl px-3 py-2">
                {payError}
              </p>
            )}

            {/* Actions */}
            <div className="flex gap-3">
              <button
                onClick={() => setPayVisit(null)}
                className="flex-1 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 px-4 py-2 rounded-xl text-sm"
              >
                Batal
              </button>
              <button
                onClick={processPayment}
                className="flex-1 flex items-center justify-center gap-2 bg-teal-600 hover:bg-teal-700 text-white px-4 py-2 rounded-xl text-sm font-medium transition-colors"
              >
                <CheckCircle2 className="w-4 h-4" />
                Proses &amp; Lunas
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ══════════════════════════ SUCCESS / INVOICE MODAL ════════════════════ */}
      {successData && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="no-print bg-white rounded-2xl p-6 w-full max-w-md shadow-xl max-h-[90vh] overflow-y-auto">
            {/* Success header */}
            <div className="text-center mb-5">
              <div className="w-14 h-14 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <CheckCircle2 className="w-7 h-7 text-green-600" />
              </div>
              <h2 className="text-lg font-bold text-slate-800">Pembayaran Berhasil!</h2>
              <p className="text-sm text-slate-500 mt-1">
                {successData.patientName} telah lunas
              </p>
            </div>

            {/* Invoice preview */}
            <div className="border border-slate-200 rounded-xl p-4 mb-5 bg-slate-50">
              <Invoice
                transaction={successData.transaction}
                patientName={successData.patientName}
                patientRM={successData.patientRM}
                poli={successData.visit.poli}
                invoiceRef={invoiceRef}
              />
            </div>

            {/* Action buttons */}
            <div className="flex gap-3">
              <button
                onClick={handlePrint}
                className="flex-1 flex items-center justify-center gap-2 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 px-4 py-2 rounded-xl text-sm"
              >
                <Printer className="w-4 h-4" />
                Cetak Struk
              </button>
              <button
                onClick={() => setSuccessData(null)}
                className="flex-1 bg-teal-600 hover:bg-teal-700 text-white px-4 py-2 rounded-xl text-sm font-medium transition-colors"
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export default function KasirPage() {
  return (
    <Suspense fallback={<div className="p-8 text-center text-xs text-slate-400">Memuat modul Kasir...</div>}>
      <KasirContent />
    </Suspense>
  );
}
