'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard, UserPlus, FileText, Users, ListOrdered,
  Pill, CreditCard, Bell, BarChart2, Stethoscope, ChevronRight
} from 'lucide-react';

const nav = [
  { href: '/', icon: LayoutDashboard, label: 'Dashboard', section: null },
  { href: null, icon: null, label: 'MODUL INTI', section: true },
  { href: '/pendaftaran', icon: UserPlus, label: 'Pendaftaran' },
  { href: '/rekam-medis', icon: FileText, label: 'Rekam Medis' },
  { href: '/riwayat', icon: Users, label: 'Riwayat Pasien' },
  { href: null, icon: null, label: 'OPERASIONAL', section: true },
  { href: '/antrian', icon: ListOrdered, label: 'Antrian' },
  { href: '/apotek', icon: Pill, label: 'Apotek & Obat' },
  { href: '/kasir', icon: CreditCard, label: 'Kasir & Billing' },
  { href: null, icon: null, label: 'SERVICE', section: true },
  { href: '/reminder', icon: Bell, label: 'Reminder & ANC' },
  { href: null, icon: null, label: 'PELAPORAN', section: true },
  { href: '/laporan', icon: BarChart2, label: 'Laporan & Analitik' },
] as const;

export default function Sidebar() {
  const path = usePathname();

  return (
    <aside className="w-64 min-h-screen bg-slate-900 text-slate-300 flex flex-col flex-shrink-0">
      {/* Logo */}
      <div className="px-5 py-5 border-b border-slate-700/60">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-teal-500 flex items-center justify-center">
            <Stethoscope size={18} className="text-white" />
          </div>
          <div>
            <p className="text-white font-semibold text-sm leading-tight">SIM-Klinik</p>
            <p className="text-teal-400 text-xs">Pro — Demo v1.0</p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
        {nav.map((item, i) => {
          if ('section' in item && item.section) {
            return (
              <p key={i} className="text-[10px] font-semibold text-slate-500 tracking-widest px-3 pt-4 pb-1 uppercase">
                {item.label}
              </p>
            );
          }
          if (!item.href || !item.icon) return null;
          const Icon = item.icon;
          const active = path === item.href || (item.href !== '/' && path.startsWith(item.href));
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all group ${
                active
                  ? 'bg-teal-500/15 text-teal-400 border border-teal-500/30'
                  : 'text-slate-400 hover:bg-slate-800 hover:text-slate-200'
              }`}
            >
              <Icon size={16} className={active ? 'text-teal-400' : 'text-slate-500 group-hover:text-slate-300'} />
              <span className="flex-1">{item.label}</span>
              {active && <ChevronRight size={14} className="text-teal-400" />}
            </Link>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="px-5 py-3 border-t border-slate-700/60">
        <p className="text-[11px] text-slate-600">© 2026 SIM-Klinik Pro</p>
      </div>
    </aside>
  );
}
