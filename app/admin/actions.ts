'use server';

// ============================================
// 📁 LOKASI: app/admin/actions.ts
// ============================================

import { createClient } from '@/lib/supabase-server';
import { revalidatePath } from 'next/cache';

export async function updateReportStatus(
  reportId: string,
  status: 'verified' | 'rejected' | 'pending'
) {
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Unauthorized');

  // ✅ Cast as any — fix "Property role does not exist on type never"
  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single() as any;

  if (!profile || profile.role !== 'admin') {
    throw new Error('Forbidden — admin only');
  }

  // ✅ Cast as any — RPC types tidak match dengan manual Database type
  const { error } = await (supabase as any).rpc('update_report_status', {
    report_id: reportId,
    new_status: status,
  });

  if (error) {
    console.error('Update status error:', error);
    throw new Error('Gagal update status laporan');
  }

  revalidatePath('/admin');
  revalidatePath('/');
}