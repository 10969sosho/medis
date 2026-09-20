'use client';

import { useEffect, useState, useMemo } from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import {
  TrendingUp,
  Users,
  Activity,
  UserPlus,
  Printer,
  CalendarDays,
  Pill,
  Stethoscope,
  Building2,
} from 'lucide-react';
import {
  initStore,
  visitStore,
  patientStore,
  transactionStore,
  drugStore,
  idr,
} from '@/lib/store';
import type { Visit, Patient, Drug } from '@/lib/types';

// ─── Types ────────────────────────────────────────────────────────────────────

type Period = 'Hari Ini' | 'Minggu Ini' | 'Bulan Ini' | 'Semua';

interface MorbidityRow {
  rank: number;
  assessment: string;
  icdCode: string;
  count: number;
  pct: number;
}

interface PoliRow {
  poli: string;
  total: number;
  pct: number;
}

interface DrugRow {
  rank: number;
  drugName: string;
  qty: number;
}

interface ChartDayData {
  label: string;
  count: number;
}

// ─── Period helpers ───────────────────────────────────────────────────────────

function getPeriodRange(period: Period): { start: Date; end: Date } {
  const now = new Date();
  const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0, 0);
  const todayEnd = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59, 999);

  if (period === 'Hari Ini') {
    return { start: todayStart, end: todayEnd };
  }
  if (period === 'Minggu Ini') {
    const day = now.getDay(); // 0=Sun
    const diffToMon = (day === 0 ? -6 : 1 - day);
    const mon = new Date(todayStart);
    mon.setDate(mon.getDate() + diffToMon);
    const sun = new Date(mon);
    sun.setDate(sun.getDate() + 6);
    sun.setHours(23, 59, 59, 999);
    return { start: mon, end: sun };
  }
  if (period === 'Bulan Ini') {
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1, 0, 0, 0, 0);
    const monthEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999);
    return { start: monthStart, end: monthEnd };
  }
  // Semua
  return { start: new Date(0), end: new Date(8640000000000000) };
}

function inRange(dateStr: string, start: Date, end: Date): boolean {
  const d = new Date(dateStr);
  return d >= start && d <= end;
}

function fmtShortDate(d: Date): string {
  return new Intl.DateTimeFormat('id-ID', { day: '2-digit', month: 'short' }).format(d);
}

function fmtFullRange(start: Date, end: Date, period: Period): string {
  if (period === 'Semua') return 'Semua periode';
  const opts: Intl.DateTimeFormatOptions = { day: 'numeric', month: 'long', year: 'numeric' };
  const fmt = (d: Date) => new Intl.DateTimeFormat('id-ID', opts).format(d);
  if (period === 'Hari Ini') return fmt(start);
  return `${fmt(start)} – ${fmt(end)}`;
}

// ─── Stat Card ────────────────────────────────────────────────────────────────

interface StatCardProps {
  icon: React.ReactNode;
  label: string;
  value: string;
  sub?: string;
  accent?: string;
}

function StatCard({ icon, label, value, sub, accent = 'bg-teal-50 text-teal-600' }: StatCardProps) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm flex items-start gap-4">
      <div className={`rounded-xl p-2.5 ${accent}`}>{icon}</div>
      <div className="min-w-0">
        <p className="text-xs font-semibold text-slate-500 uppercase tracking-widest truncate">{label}</p>
        <p className="text-2xl font-bold text-slate-800 mt-0.5 leading-tight">{value}</p>
        {sub && <p className="text-xs text-slate-400 mt-0.5">{sub}</p>}
      </div>
    </div>
  );
}

// ─── Custom Tooltip ───────────────────────────────────────────────────────────

function CustomTooltip({ active, payload, label }: { active?: boolean; payload?: { value: number }[]; label?: string }) {
  if (!active || !payload || payload.length === 0) return null;
  return (
    <div className="bg-white border border-slate-200 rounded-xl px-3 py-2 shadow-md text-sm">
      <p className="font-semibold text-slate-700">{label}</p>
      <p className="text-teal-600 font-bold">{payload[0].value} kunjungan</p>
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function LaporanPage() {
  const [period, setPeriod] = useState<Period>('Bulan Ini');
  const [visits, setVisits] = useState<Visit[]>([]);
  const [patients, setPatients] = useState<Patient[]>([]);
  const [drugs, setDrugs] = useState<Drug[]>([]);
  const [printTime] = useState(() =>
    new Intl.DateTimeFormat('id-ID', {
      dateStyle: 'long',
      timeStyle: 'short',
    }).format(new Date())
  );

  useEffect(() => {
    initStore();
    setVisits(visitStore.getAll());
    setPatients(patientStore.getAll());
    setDrugs(drugStore.getAll());
    // transactionStore is available but we derive from visits for consistency
    void transactionStore.getAll();
  }, []);

  const { start, end } = useMemo(() => getPeriodRange(period), [period]);

  // ── Filtered visits in period ──────────────────────────────────────────────
  const periodVisits = useMemo(
    () => visits.filter((v) => inRange(v.date, start, end)),
    [visits, start, end]
  );

  const paidVisits = useMemo(
    () => periodVisits.filter((v) => v.paymentStatus === 'paid'),
    [periodVisits]
  );

  // ── Section 1: Financial Summary ───────────────────────────────────────────
  const totalRevenue = useMemo(
    () => paidVisits.reduce((sum, v) => sum + (v.totalBill ?? 0), 0),
    [paidVisits]
  );

  const avgPerVisit = useMemo(
    () => (paidVisits.length > 0 ? Math.round(totalRevenue / paidVisits.length) : 0),
    [totalRevenue, paidVisits]
  );

  const newPatients = useMemo(
    () => patients.filter((p) => p.createdAt && inRange(p.createdAt, start, end)).length,
    [patients, start, end]
  );

  // ── Section 2: Visit chart (last 7 days relative to end of period) ─────────
  const chartData = useMemo((): ChartDayData[] => {
    const days: ChartDayData[] = [];
    // Always show last 7 calendar days up to today (or end of period if before today)
    const pivotEnd = end > new Date() ? new Date() : end;
    for (let i = 6; i >= 0; i--) {
      const d = new Date(pivotEnd);
      d.setDate(d.getDate() - i);
      const dayStr = d.toISOString().slice(0, 10);
      const count = visits.filter((v) => v.date.startsWith(dayStr)).length;
      days.push({ label: fmtShortDate(d), count });
    }
    return days;
  }, [visits, end]);

  // ── Section 3: Top Morbidity ───────────────────────────────────────────────
  const morbidityRows = useMemo((): MorbidityRow[] => {
    const map: Record<string, { count: number; icdCode: string }> = {};
    periodVisits.forEach((v) => {
      const key = v.assessment || 'Tidak dicatat';
      if (!map[key]) map[key] = { count: 0, icdCode: v.icdCode || '-' };
      map[key].count++;
    });
    const sorted = Object.entries(map)
      .sort((a, b) => b[1].count - a[1].count)
      .slice(0, 10);
    const maxCount = sorted[0]?.[1].count ?? 1;
    return sorted.map(([assessment, data], idx) => ({
      rank: idx + 1,
      assessment,
      icdCode: data.icdCode,
      count: data.count,
      pct: Math.round((data.count / maxCount) * 100),
    }));
  }, [periodVisits]);

  // ── Section 4: Revenue per Poli ────────────────────────────────────────────
  const poliRows = useMemo((): PoliRow[] => {
    const map: Record<string, number> = {};
    paidVisits.forEach((v) => {
      const poli = v.poli || 'Tidak dicatat';
      map[poli] = (map[poli] ?? 0) + (v.totalBill ?? 0);
    });
    const sorted = Object.entries(map).sort((a, b) => b[1] - a[1]);
    const maxAmt = sorted[0]?.[1] ?? 1;
    return sorted.map(([poli, total]) => ({
      poli,
      total,
      pct: Math.round((total / maxAmt) * 100),
    }));
  }, [paidVisits]);

  // ── Section 5: Top Prescribed Drugs ───────────────────────────────────────
  const topDrugs = useMemo((): DrugRow[] => {
    const map: Record<string, { name: string; qty: number }> = {};
    visits.forEach((v) => {
      (v.prescriptions ?? []).forEach((rx) => {
        const key = rx.drugId;
        if (!map[key]) map[key] = { name: rx.drugName, qty: 0 };
        map[key].qty += rx.quantity ?? 0;
      });
    });
    return Object.values(map)
      .sort((a, b) => b.qty - a.qty)
      .slice(0, 5)
      .map((item, idx) => ({ rank: idx + 1, drugName: item.name, qty: item.qty }));
  }, [visits, drugs]);

  const periods: Period[] = ['Hari Ini', 'Minggu Ini', 'Bulan Ini', 'Semua'];

  return (
    <div className="min-h-screen bg-slate-50 p-6 print:p-4 print:bg-white">
      {/* ── Header ── */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6 print:mb-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Laporan &amp; Analitik</h1>
          <p className="text-sm text-slate-500 mt-0.5">
            <CalendarDays className="inline w-3.5 h-3.5 mr-1 -mt-0.5" />
            {fmtFullRange(start, end, period)}
          </p>
        </div>
        <button
          onClick={() => window.print()}
          className="flex items-center gap-2 bg-teal-600 hover:bg-teal-700 text-white px-4 py-2 rounded-xl text-sm font-medium transition-colors print:hidden"
        >
          <Printer className="w-4 h-4" />
          Cetak / Export
        </button>
      </div>

      {/* ── Period Selector ── */}
      <div className="flex gap-2 mb-6 flex-wrap print:hidden">
        {periods.map((p) => (
          <button
            key={p}
            onClick={() => setPeriod(p)}
            className={`px-4 py-2 rounded-xl text-sm font-medium transition-colors border ${
              period === p
                ? 'bg-teal-600 text-white border-teal-600'
                : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
            }`}
          >
            {p}
          </button>
        ))}
      </div>

      {/* ── Section 1: Financial Summary ── */}
      <p className="text-xs font-semibold text-slate-500 uppercase tracking-widest mb-3">
        Ringkasan Keuangan
      </p>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatCard
          icon={<TrendingUp className="w-5 h-5" />}
          label="Total Pendapatan"
          value={idr(totalRevenue)}
          sub={`${paidVisits.length} transaksi lunas`}
          accent="bg-teal-50 text-teal-600"
        />
        <StatCard
          icon={<Activity className="w-5 h-5" />}
          label="Rata-rata per Kunjungan"
          value={idr(avgPerVisit)}
          sub="dari kunjungan berbayar"
          accent="bg-blue-50 text-blue-600"
        />
        <StatCard
          icon={<Users className="w-5 h-5" />}
          label="Total Kunjungan"
          value={String(periodVisits.length)}
          sub={`${paidVisits.length} lunas · ${periodVisits.length - paidVisits.length} belum`}
          accent="bg-violet-50 text-violet-600"
        />
        <StatCard
          icon={<UserPlus className="w-5 h-5" />}
          label="Pasien Baru"
          value={String(newPatients)}
          sub="terdaftar di periode ini"
          accent="bg-amber-50 text-amber-600"
        />
      </div>

      {/* ── Section 2 + 5 side by side ── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        {/* Bar Chart */}
        <div className="lg:col-span-2 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-widest mb-4">
            Grafik Kunjungan — 7 Hari Terakhir
          </p>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={chartData} barCategoryGap="35%">
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
              <XAxis
                dataKey="label"
                tick={{ fontSize: 11, fill: '#64748b' }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis
                allowDecimals={false}
                tick={{ fontSize: 11, fill: '#64748b' }}
                axisLine={false}
                tickLine={false}
                width={28}
              />
              <Tooltip content={<CustomTooltip />} cursor={{ fill: '#f0fdfa' }} />
              <Bar dataKey="count" fill="#14b8a6" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Top Drugs */}
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-widest mb-4 flex items-center gap-1.5">
            <Pill className="w-3.5 h-3.5" />
            Obat Terlaris (Top 5)
          </p>
          {topDrugs.length === 0 ? (
            <p className="text-sm text-slate-400 italic">Belum ada data resep.</p>
          ) : (
            <ol className="space-y-3">
              {topDrugs.map((d) => (
                <li key={d.rank} className="flex items-center gap-3">
                  <span className="w-6 h-6 rounded-full bg-teal-100 text-teal-700 text-xs font-bold flex items-center justify-center flex-shrink-0">
                    {d.rank}
                  </span>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-slate-700 truncate">{d.drugName}</p>
                    <p className="text-xs text-slate-400">{d.qty} unit diresepkan</p>
                  </div>
                </li>
              ))}
            </ol>
          )}
        </div>
      </div>

      {/* ── Section 3: Top Morbidity ── */}
      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm mb-6">
        <p className="text-xs font-semibold text-slate-500 uppercase tracking-widest mb-4 flex items-center gap-1.5">
          <Stethoscope className="w-3.5 h-3.5" />
          10 Besar Penyakit (Top Morbiditas)
        </p>
        {morbidityRows.length === 0 ? (
          <p className="text-sm text-slate-400 italic">Belum ada data kunjungan pada periode ini.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-100">
                  <th className="text-left py-2 pr-3 text-xs font-semibold text-slate-500 w-10">#</th>
                  <th className="text-left py-2 pr-3 text-xs font-semibold text-slate-500">Diagnosa</th>
                  <th className="text-left py-2 pr-3 text-xs font-semibold text-slate-500 w-24">ICD-10</th>
                  <th className="text-right py-2 pr-3 text-xs font-semibold text-slate-500 w-20">Jumlah</th>
                  <th className="text-left py-2 text-xs font-semibold text-slate-500 w-40 hidden sm:table-cell">Visual</th>
                </tr>
              </thead>
              <tbody>
                {morbidityRows.map((row, idx) => (
                  <tr
                    key={row.rank}
                    className={`border-b border-slate-50 ${idx % 2 === 0 ? 'bg-slate-50/40' : 'bg-white'}`}
                  >
                    <td className="py-2.5 pr-3">
                      <span className={`inline-flex items-center justify-center w-6 h-6 rounded-full text-xs font-bold ${
                        row.rank === 1
                          ? 'bg-teal-600 text-white'
                          : row.rank <= 3
                          ? 'bg-teal-100 text-teal-700'
                          : 'bg-slate-100 text-slate-500'
                      }`}>
                        {row.rank}
                      </span>
                    </td>
                    <td className="py-2.5 pr-3 font-medium text-slate-700">{row.assessment}</td>
                    <td className="py-2.5 pr-3">
                      <span className="inline rounded-full px-2.5 py-0.5 text-xs font-medium bg-blue-50 text-blue-700">
                        {row.icdCode}
                      </span>
                    </td>
                    <td className="py-2.5 pr-3 text-right font-bold text-teal-700">{row.count}</td>
                    <td className="py-2.5 hidden sm:table-cell">
                      <div className="w-full bg-slate-100 rounded-full h-2">
                        <div
                          style={{ width: `${row.pct}%` }}
                          className="h-2 bg-teal-500 rounded-full transition-all duration-500"
                        />
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* ── Section 4: Revenue per Poli ── */}
      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm mb-8">
        <p className="text-xs font-semibold text-slate-500 uppercase tracking-widest mb-4 flex items-center gap-1.5">
          <Building2 className="w-3.5 h-3.5" />
          Pendapatan per Poli
        </p>
        {poliRows.length === 0 ? (
          <p className="text-sm text-slate-400 italic">Belum ada transaksi lunas pada periode ini.</p>
        ) : (
          <div className="space-y-4">
            {poliRows.map((row, idx) => (
              <div key={row.poli} className={`rounded-xl p-4 ${idx % 2 === 0 ? 'bg-slate-50' : 'bg-white border border-slate-100'}`}>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-semibold text-slate-700">{row.poli}</span>
                  <span className="text-sm font-bold text-teal-700">{idr(row.total)}</span>
                </div>
                <div className="w-full bg-slate-200 rounded-full h-2">
                  <div
                    style={{ width: `${row.pct}%` }}
                    className="h-2 bg-teal-500 rounded-full transition-all duration-500"
                  />
                </div>
                <p className="text-xs text-slate-400 mt-1">
                  {row.pct}% dari poli terbesar
                </p>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ── Print Footer ── */}
      <div className="hidden print:block mt-8 pt-4 border-t border-slate-200 text-xs text-slate-400">
        <p>Laporan dicetak pada: <span className="font-semibold text-slate-600">{printTime}</span></p>
        <p className="mt-0.5">Sistem Manajemen Klinik — Dokumen ini dicetak secara otomatis dan tidak memerlukan tanda tangan.</p>
      </div>

      {/* ── Print styles ── */}
      <style>{`
        @media print {
          body { font-size: 12px; }
          .print\\:hidden { display: none !important; }
          .print\\:block { display: block !important; }
          .print\\:p-4 { padding: 1rem !important; }
          .print\\:bg-white { background-color: #fff !important; }
          .print\\:mb-4 { margin-bottom: 1rem !important; }
          .rounded-2xl { border-radius: 0.5rem !important; }
          .shadow-sm { box-shadow: none !important; }
        }
      `}</style>
    </div>
  );
}
