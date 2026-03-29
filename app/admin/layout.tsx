// ============================================
// 📁 LOKASI: app/admin/layout.tsx
// ============================================

import { createClient } from '@/lib/supabase-server';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { ShieldAlert, Home, LogOut } from 'lucide-react';

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/login?redirectTo=/admin');

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single() as any;

  if (!profile || profile.role !== 'admin') {
    redirect('/');
  }

  return (
    <div className="min-h-screen bg-zinc-50">
      {/* Admin Navbar — terpisah dari Navbar utama */}
      <div className="bg-zinc-900 text-white px-4 py-3 flex items-center justify-between sticky top-0 z-50">
        <div className="flex items-center gap-3">
          <div className="w-7 h-7 bg-red-600 rounded-lg flex items-center justify-center">
            <ShieldAlert className="w-4 h-4 text-white" />
          </div>
          <span className="font-bold text-sm">KawalTransaksi <span className="text-red-400">Admin</span></span>
        </div>
        <div className="flex items-center gap-4">
          <span className="text-xs text-zinc-400 hidden sm:block">{user.email}</span>
          <Link href="/" className="flex items-center gap-1.5 text-xs text-zinc-400 hover:text-white transition-colors">
            <Home className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Kembali ke Site</span>
          </Link>
        </div>
      </div>
      {children}
    </div>
  );
}