'use client';

// ============================================
// 📁 LOKASI: app/admin/AdminLogout.tsx
// ============================================

import { createClient } from '@/lib/supabase-browser';
import { useRouter } from 'next/navigation';
import { LogOut } from 'lucide-react';

export default function AdminLogout() {
  const router = useRouter();
  const supabase = createClient();

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push('/');
  };

  return (
    <button
      onClick={handleLogout}
      className="flex items-center gap-1.5 text-xs text-red-400 hover:text-red-300 transition-colors border border-zinc-700 hover:border-red-800 px-3 py-1.5 rounded-lg"
    >
      <LogOut className="w-3.5 h-3.5" />
      <span className="hidden sm:inline">Logout</span>
    </button>
  );
}