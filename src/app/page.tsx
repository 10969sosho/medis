'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { initStore, patientStore, visitStore, queueStore, transactionStore, drugStore, idr } from '@/lib/store';
import {
  Users, UserCheck, CreditCard, Pill, ListOrdered, Bell,
  TrendingUp, AlertTriangle, ClipboardList, ArrowRight
} from 'lucide-react';

export default function Dashboard() {
  const [stats, setStats] = useState({
    totalPatients: 0,
    todayVisits: 0,
    todayRevenue: 0,
    queueWaiting: 0,
    lowStockCount: 0,
    unpaidBills: 0,
    recentVisits: [] as { id: string; patientName: string; poli: string; date: string; diagnosis: string }[],
    queueItems: [] as { ticketNumber: string; patientName: string; poli: string; status: string }[],
  });

  useEffect(() => {
    initStore();
    const patients = patientStore.getAll();
    const visits = visitStore.getAll();
    const today = new Date().toISOString().slice(0, 10);
    const todayVisits = visits.filter(v => v.date.startsWith(today));
    const queue = queueStore.getToday();
    const drugs = drugStore.getAll();
    const lowStock = drugStore.getLowStock();
    const unpaid = visitStore.getUnpaid();
    const todayRev = transactionStore.totalToday();

    // Last 4 visits
    const recentVisits = visits
      .sort((a, b) => b.date.localeCompare(a.date))
      .slice(0, 4)
      .map(v => {
        const p = patientStore.get(v.patientId);
        return { id: v.id, patientName: p?.name || '-', poli: v.poli, date: v.date, diagnosis: v.assessment };
      });

    setStats({
      totalPatients: patients.length,
      todayVisits: todayVisits.length,
      todayRevenue: todayRev,
      queueWaiting: queue.filter(q => q.status === 'waiting').length,
      lowStockCount: lowStock.length,
      unpaidBills: unpaid.length,
      recentVisits,
      queueItems: queue.filter(q => q.status !== 'done').slice(0, 5),
    });
  }, []);

  const cards = [
    { label: 'Total Pasien Terdaftar', value: stats.totalPatients, icon: Users, color: 'bg-blue-50 text-blue-600', border: 'border-blue-200', href: '/pendaftaran' },
    { label: 'Kunjungan Hari Ini', value: stats.todayVisits, icon: UserCheck, color: 'bg-teal-50 text-teal-600', border: 'border-teal-200', href: '/rekam-medis' },
    { label: 'Pendapatan Hari Ini', value: idr(stats.todayRevenue), icon: CreditCard, color: 'bg-emerald-50 text-emerald-600', border: 'border-emerald-200', href: '/laporan' },
    { label: 'Antrian Menunggu', value: stats.queueWaiting, icon: ListOrdered, color: 'bg-amber-50 text-amber-600', border: 'border-amber-200', href: '/antrian' },
    { label: 'Stok Obat Kritis', value: stats.lowStockCount, icon: Pill, color: 'bg-rose-50 text-rose-600', border: 'border-rose-200', href: '/apotek' },
    { label: 'Tagihan Belum Lunas', value: stats.unpaidBills, icon: ClipboardList, color: 'bg-purple-50 text-purple-600', border: 'border-purple-200', href: '/kasir' },
  ];

  const statusBadge: Record<string, string> = {
    waiting: 'bg-amber-100 text-amber-700',
    called: 'bg-blue-100 text-blue-700',
    'in-progress': 'bg-teal-100 text-teal-700',
    done: 'bg-slate-100 text-slate-500',
    skipped: 'bg-rose-100 text-rose-700',
  };
  const statusLabel: Record<string, string> = {
    waiting: 'Menunggu', called: 'Dipanggil', 'in-progress': 'Dalam Pemeriksaan', done: 'Selesai', skipped: 'Dilewati',
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Dashboard</h1>
          <p className="text-slate-500 text-sm mt-0.5">
            {new Intl.DateTimeFormat('id-ID', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }).format(new Date())}
          </p>
        </div>
        <div className="flex items-center gap-2 bg-teal-50 text-teal-700 px-4 py-2 rounded-xl border border-teal-200 text-sm font-medium">
          <TrendingUp size={16} />
          Klinik Aktif
        </div>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
        {cards.map((c) => {
          const Icon = c.icon;
          return (
            <Link key={c.label} href={c.href} className={`bg-white rounded-2xl border ${c.border} p-5 hover:shadow-md transition-shadow group`}>
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-slate-500 text-xs font-medium mb-2">{c.label}</p>
                  <p className="text-2xl font-bold text-slate-800">{c.value}</p>
                </div>
                <div className={`w-10 h-10 rounded-xl ${c.color} flex items-center justify-center`}>
                  <Icon size={18} />
                </div>
              </div>
              <div className="flex items-center gap-1 mt-3 text-xs text-slate-400 group-hover:text-teal-600 transition-colors">
                Lihat detail <ArrowRight size={12} />
              </div>
            </Link>
          );
        })}
      </div>

      {/* Bottom 2 column */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Recent Visits */}
        <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
          <div className="px-5 py-4 border-b border-slate-100 flex justify-between items-center">
            <h2 className="font-semibold text-slate-800 text-sm">Kunjungan Terbaru</h2>
            <Link href="/rekam-medis" className="text-xs text-teal-600 hover:underline">Lihat semua</Link>
          </div>
          <div className="divide-y divide-slate-50">
            {stats.recentVisits.length === 0 && (
              <p className="text-slate-400 text-sm text-center py-6">Belum ada kunjungan</p>
            )}
            {stats.recentVisits.map((v) => (
              <div key={v.id} className="px-5 py-3 flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-teal-100 text-teal-700 flex items-center justify-center text-xs font-bold flex-shrink-0">
                  {v.patientName.charAt(0)}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-slate-800 truncate">{v.patientName}</p>
                  <p className="text-xs text-slate-400 truncate">{v.diagnosis} · {v.poli}</p>
                </div>
                <p className="text-xs text-slate-400 flex-shrink-0">
                  {new Intl.DateTimeFormat('id-ID', { day: 'numeric', month: 'short' }).format(new Date(v.date))}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Today's Queue */}
        <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
          <div className="px-5 py-4 border-b border-slate-100 flex justify-between items-center">
            <h2 className="font-semibold text-slate-800 text-sm">Antrian Hari Ini</h2>
            <Link href="/antrian" className="text-xs text-teal-600 hover:underline">Kelola antrian</Link>
          </div>
          <div className="divide-y divide-slate-50">
            {stats.queueItems.length === 0 && (
              <p className="text-slate-400 text-sm text-center py-6">Belum ada antrian</p>
            )}
            {stats.queueItems.map((q) => (
              <div key={q.ticketNumber} className="px-5 py-3 flex items-center gap-3">
                <div className="w-10 h-8 rounded-lg bg-slate-900 text-white flex items-center justify-center text-xs font-bold flex-shrink-0">
                  {q.ticketNumber}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-slate-800 truncate">{q.patientName}</p>
                  <p className="text-xs text-slate-400">{q.poli}</p>
                </div>
                <span className={`text-xs font-medium px-2 py-0.5 rounded-full flex-shrink-0 ${statusBadge[q.status] || 'bg-slate-100 text-slate-500'}`}>
                  {statusLabel[q.status] || q.status}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Alert banner for low stock */}
      {stats.lowStockCount > 0 && (
        <Link href="/apotek" className="flex items-center gap-3 bg-rose-50 border border-rose-200 text-rose-700 px-5 py-3 rounded-xl hover:bg-rose-100 transition-colors">
          <AlertTriangle size={18} />
          <p className="text-sm font-medium">{stats.lowStockCount} item obat mencapai batas stok minimum — segera restok!</p>
          <ArrowRight size={16} className="ml-auto" />
        </Link>
      )}
    </div>
  );
}
