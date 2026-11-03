'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard, UserPlus, FileText, Users, ListOrdered,
  Pill, CreditCard, Bell, BarChart2, Stethoscope, ChevronRight, ChevronDown
} from 'lucide-react';
import { useState } from 'react';

const nav = [
  { href: '/', icon: LayoutDashboard, label: 'Dashboard', section: null },
  { href: null, icon: null, label: 'MODUL INTI', section: true },
  { href: '/master-pasien', icon: UserPlus, label: 'Master Pasien' },
{ href: '/master-dokter', icon: Stethoscope, label: 'Master Dokter' },
  { href: '/rekam-medis', icon: FileText, label: 'Rekam Medis', submenu: [
    { href: '/rekam-medis/ibu/', label: 'Rekam Medis Ibu' },
    { href: '/rekam-medis/anak/', label: 'Rekam Medis Anak' },
    { href: '/rekam-medis/spa/', label: 'Mom & Baby Spa' },
    { href: '/rekam-medis/umum/', label: 'Rekam Medis Umum' },
  ] },
  { href: '/riwayat', icon: Users, label: 'Riwayat Pasien' },
  { href: '/surat', icon: FileText, label: 'Surat Keterangan', submenu: [
    { href: '/surat/', label: 'Riwayat Surat' },
    { href: '/surat/sakit/', label: 'Surat Keterangan Sakit' },
    { href: '/surat/sehat/', label: 'Surat Keterangan Sehat' },
    { href: '/surat/lahir/', label: 'Surat Keterangan Lahir' },
    { href: '/surat/cuti-hamil/', label: 'Surat Keterangan Cuti Hamil' },
    { href: '/surat/kematian/', label: 'Surat Keterangan Kematian' },
  ] },
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
  const [openSubmenus, setOpenSubmenus] = useState<Record<string, boolean>>({ '/rekam-medis': true });

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

          // If item has submenu
          if ('submenu' in item) {
            const submenu = item.submenu as unknown as Array<{ href: string; label: string }>;
            const isOpen = openSubmenus[item.href] ?? false;
            return (
              <div key={item.href} className="space-y-1">
                <div className="flex items-center justify-between rounded-lg hover:bg-slate-800 transition-all">
                  <Link
                    href={item.href}
                    className={`flex-1 flex items-center gap-3 px-3 py-2.5 text-sm font-medium transition-all ${
                      active
                        ? 'bg-teal-500/15 text-teal-400 font-semibold'
                        : 'text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    <Icon size={16} className={active ? 'text-teal-400' : 'text-slate-500'} />
                    <span>{item.label}</span>
                  </Link>
                  <button
                    type="button"
                    onClick={() =>
                      setOpenSubmenus((prev) => ({ ...prev, [item.href]: !isOpen }))
                    }
                    className="p-2 text-slate-500 hover:text-slate-300 transition-colors"
                  >
                    {isOpen ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
                  </button>
                </div>

                {isOpen && (
                  <div className="pl-7 pr-2 py-1 space-y-1 bg-slate-950/40 rounded-xl my-1 border border-slate-800/80">
                    {submenu.map((sub, si) => {
                      const subBase = sub.href.replace(/\/$/, '');
                      const subActive =
                        path === sub.href ||
                        (sub.href !== '/surat/' && path.startsWith(subBase));
                      return (
                        <Link
                          key={si}
                          href={sub.href}
                          className={`flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-xs font-medium transition-all ${
                            subActive
                              ? 'bg-teal-500/15 text-teal-300 font-semibold'
                              : 'text-slate-400 hover:text-teal-300 hover:bg-slate-800'
                          }`}
                        >
                          <span className={`w-1.5 h-1.5 rounded-full ${subActive ? 'bg-teal-400' : 'bg-teal-500/70'}`} />
                          <span>{sub.label}</span>
                        </Link>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          }

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
