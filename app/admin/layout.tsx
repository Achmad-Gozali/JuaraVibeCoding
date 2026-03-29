// ============================================
// 📁 LOKASI: app/admin/layout.tsx
// ============================================

import { createClient } from '@/lib/supabase-server';
import { redirect } from 'next/navigation';

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/login?redirectTo=/admin');

  // ✅ Cast as any — fix "Property role does not exist on type never"
  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single() as any;

  if (!profile || profile.role !== 'admin') {
    redirect('/');
  }

  return <>{children}</>;
}