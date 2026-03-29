// ============================================
// 📁 LOKASI: app/admin/layout.tsx
// ✅ REDESIGN: Pakai AdminShell (sidebar + top nav)
//    - Hapus inline dark navbar
//    - Auth check tetap di server component
//    - AdminShell handle UI di client
// ============================================

import { createClient } from '@/lib/supabase-server';
import { redirect } from 'next/navigation';
import AdminShell from './AdminShell';

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect('/login?redirectTo=/admin');

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single();

  if (!profile || profile.role !== 'admin') redirect('/');

  return (
    <AdminShell email={user.email || ''}>
      {children}
    </AdminShell>
  );
}