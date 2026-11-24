'use client';

import React, { useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/lib/AuthContext';
import Sidebar from '@/components/Sidebar';

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { user, loading } = useAuth();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const isLoginPage = pathname === '/login' || pathname === '/login/' || (typeof window !== 'undefined' && window.location.pathname.startsWith('/login'));

  // Di halaman login, langsung render children form login tanpa spinner & tanpa sidebar
  if (isLoginPage) {
    return <main className="min-h-screen bg-slate-900">{children}</main>;
  }

  // Sebelum mount di client atau saat memeriksa token untuk halaman terproteksi
  if (!mounted || loading) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-2 border-teal-500 border-t-transparent rounded-full animate-spin" />
          <p className="text-xs text-slate-400">Memeriksa autentikasi...</p>
        </div>
      </div>
    );
  }

  // Jika tidak ada user dan bukan di login, redirect ditangani oleh AuthContext
  if (!user) {
    return null;
  }

  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <main className="flex-1 overflow-auto">{children}</main>
    </div>
  );
}

