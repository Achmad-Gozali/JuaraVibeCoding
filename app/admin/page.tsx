import { Suspense } from 'react';
import { createClient } from '@/lib/supabase-server';
import AdminDashboard from './AdminDashboard';

export const revalidate = 30;

export default async function AdminPage() {
  const supabase = await createClient();

  const [
    { count: totalReports },
    { count: pendingCount },
    { count: verifiedCount },
    { count: rejectedCount },
    { data: reports },
    { data: users },
  ] = await Promise.all([
    supabase.from('reports').select('*', { count: 'exact', head: true }),
    supabase.from('reports').select('*', { count: 'exact', head: true }).eq('status', 'pending'),
    supabase.from('reports').select('*', { count: 'exact', head: true }).eq('status', 'verified'),
    supabase.from('reports').select('*', { count: 'exact', head: true }).eq('status', 'rejected'),
    supabase.rpc('get_reports_admin'),
    supabase.from('profiles').select('id, full_name, role, updated_at'),
  ]);

  const stats = {
    total: totalReports || 0,
    pending: pendingCount || 0,
    verified: verifiedCount || 0,
    rejected: rejectedCount || 0,
  };

  return (
    <Suspense fallback={
      <div className="max-w-[1200px] mx-auto px-6 py-6">
        <div className="h-8 w-32 bg-zinc-200 rounded-lg animate-pulse mb-4" />
        <div className="grid grid-cols-5 gap-3">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="h-24 bg-white border border-zinc-200 rounded-xl animate-pulse" />
          ))}
        </div>
      </div>
    }>
      <AdminDashboard
        stats={stats}
        reports={reports ?? []}
        users={users ?? []}
      />
    </Suspense>
  );
}