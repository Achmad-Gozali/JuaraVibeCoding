'use server';

import { createServerClient } from '@supabase/ssr';
import { createClient as createSupabaseAdmin } from '@supabase/supabase-js';
import { cookies } from 'next/headers';
import { revalidatePath } from 'next/cache';

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:8787';

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

function createAdminClient() {
  return createSupabaseAdmin(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  );
}

async function getAuthToken(): Promise<string> {
  const supabase = await createClient();
  const { data: { session } } = await supabase.auth.getSession();
  if (!session?.access_token) throw new Error('Unauthorized');
  return session.access_token;
}

async function validateAdmin() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Unauthorized');

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single();

  if (!profile || profile.role !== 'admin') throw new Error('Forbidden');
  return user;
}

export async function updateReportStatus(
  reportId: string,
  status: 'verified' | 'rejected' | 'pending' | 'withdrawn'
) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Unauthorized');

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single();

  if (!profile || !['admin', 'moderator'].includes(profile.role)) {
    throw new Error('Forbidden');
  }

  const { error } = await supabase.rpc('update_report_status', {
    report_id: reportId,
    new_status: status,
  });

  if (error) throw new Error('Gagal update status');

  revalidatePath('/admin');
  revalidatePath('/');
  revalidatePath('/dashboard');
}

export async function updateUserRole(userId: string, role: 'user' | 'admin' | 'moderator') {
  const admin = await validateAdmin();
  if (admin.id === userId) throw new Error('Tidak dapat mengubah role diri sendiri.');

  const supabase = createAdminClient();
  const { error } = await supabase.from('profiles').update({ role }).eq('id', userId);
  if (error) throw new Error('Gagal update role');

  revalidatePath('/admin');
}

export async function banUser(userId: string) {
  const admin = await validateAdmin();
  if (admin.id === userId) throw new Error('Tidak dapat memban diri sendiri.');

  const supabase = createAdminClient();
  const { error } = await supabase.from('profiles').update({ is_banned: true }).eq('id', userId);
  if (error) throw new Error('Gagal memblokir pengguna');

  revalidatePath('/admin');
}

export async function unbanUser(userId: string) {
  await validateAdmin();

  const supabase = createAdminClient();
  const { error } = await supabase.from('profiles').update({ is_banned: false }).eq('id', userId);
  if (error) throw new Error('Gagal membuka blokir pengguna');

  revalidatePath('/admin');
}