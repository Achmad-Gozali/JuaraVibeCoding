import { Suspense } from 'react';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import AdminDashboard from './AdminDashboard';

export const revalidate = 30;

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:5000';

async function createClient() {
  const cookieStore = await cookies();
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() { return cookieStore.getAll(); },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            );
          } catch { }
        },
      },
    }
  );
}

// ── Fetch users dari backend ──────────────────────────────────────────────────
async function fetchUsersFromBackend(token: string) {
  try {
    console.log('[Admin] token exists:', !!token, '| token length:', token.length);
    console.log('[Admin] BACKEND_URL:', BACKEND_URL);

    const res = await fetch(`${BACKEND_URL}/api/admin/users`, {
      headers: { 'Authorization': `Bearer ${token}` },
      cache: 'no-store',
    });

    console.log('[Admin] response status:', res.status);

    if (!res.ok) {
      const text = await res.text();
      console.error('[Admin] response error body:', text);
      return [];
    }

    const data = await res.json();
    console.log('[Admin] data.success:', data.success, '| users count:', data.data?.length ?? 0);

    return data.success ? data.data : [];
  } catch (err) {
    console.error('[Admin] fetchUsers error:', err);
    return [];
  }
}

export default async function AdminPage() {
  const supabase = await createClient();

  // Gunakan getUser() untuk memastikan user valid di server-side
  const { data: { user } } = await supabase.auth.getUser();
  console.log('[Admin] user exists:', !!user, '| user id:', user?.id);

  // Ambil session untuk token
  const { data: { session } } = await supabase.auth.getSession();
  const token = session?.access_token ?? '';
  console.log('[Admin] session exists:', !!session, '| token length:', token.length);

  const [
    { count: totalReports },
    { count: pendingCount },
    { count: verifiedCount },
    { count: rejectedCount },
    { data: reports },
    users,
  ] = await Promise.all([
    supabase.from('reports').select('*', { count: 'exact', head: true }),
    supabase.from('reports').select('*', { count: 'exact', head: true }).eq('status', 'pending'),
    supabase.from('reports').select('*', { count: 'exact', head: true }).eq('status', 'verified'),
    supabase.from('reports').select('*', { count: 'exact', head: true }).eq('status', 'rejected'),
    supabase.rpc('get_reports_admin'),
    fetchUsersFromBackend(token),
  ]);

  console.log('[Admin] reports count:', reports?.length ?? 0);
  console.log('[Admin] users count:', users?.length ?? 0);

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