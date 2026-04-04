import { Request, Response } from 'express';
import { z } from 'zod';
import { supabaseAdmin } from '../lib/supabase';

// ── SCHEMAS ───────────────────────────────────────────────────────────────────
const updateStatusSchema = z.object({
  status: z.enum(['verified', 'rejected', 'pending', 'withdrawn']),
});

const updateRoleSchema = z.object({
  role: z.enum(['user', 'admin', 'moderator']),
});

// ── GET /api/admin/reports ────────────────────────────────────────────────────
export async function getReports(req: Request, res: Response) {
  try {
    const { data, error } = await supabaseAdmin.rpc('get_reports_admin');
    if (error) throw error;
    res.json({ success: true, data: data ?? [] });
  } catch {
    res.status(500).json({ success: false, message: 'Gagal mengambil data laporan.' });
  }
}

// ── GET /api/admin/stats ──────────────────────────────────────────────────────
export async function getStats(req: Request, res: Response) {
  try {
    const [
      { count: total },
      { count: pending },
      { count: verified },
      { count: rejected },
    ] = await Promise.all([
      supabaseAdmin.from('reports').select('*', { count: 'exact', head: true }),
      supabaseAdmin.from('reports').select('*', { count: 'exact', head: true }).eq('status', 'pending'),
      supabaseAdmin.from('reports').select('*', { count: 'exact', head: true }).eq('status', 'verified'),
      supabaseAdmin.from('reports').select('*', { count: 'exact', head: true }).eq('status', 'rejected'),
    ]);

    res.json({
      success: true,
      data: {
        total: total ?? 0,
        pending: pending ?? 0,
        verified: verified ?? 0,
        rejected: rejected ?? 0,
      },
    });
  } catch {
    res.status(500).json({ success: false, message: 'Gagal mengambil statistik.' });
  }
}

// ── PATCH /api/admin/reports/:reportId/status ─────────────────────────────────
export async function updateReportStatus(req: Request, res: Response) {
  try {
    const { reportId } = req.params;

    const parsed = updateStatusSchema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ success: false, message: 'Status tidak valid.' });
      return;
    }

    const { error } = await supabaseAdmin.rpc('update_report_status', {
      report_id: reportId,
      new_status: parsed.data.status,
    });

    if (error) throw error;
    res.json({ success: true, message: 'Status laporan berhasil diperbarui.' });
  } catch {
    res.status(500).json({ success: false, message: 'Gagal update status laporan.' });
  }
}

// ── GET /api/admin/users ──────────────────────────────────────────────────────
// Return: id, full_name, role, email, created_at, is_banned, report_count
export async function getUsers(req: Request, res: Response) {
  try {
    // 1. Ambil semua profiles
    const { data: profiles, error: profileError } = await supabaseAdmin
      .from('profiles')
      .select('id, full_name, role, updated_at, is_banned')
      .order('updated_at', { ascending: false });

    if (profileError) throw profileError;

    // 2. Ambil email dari auth.users via admin API
    const { data: { users: authUsers }, error: authError } = await supabaseAdmin.auth.admin.listUsers();
    if (authError) throw authError;

    // 3. Hitung jumlah laporan per user
    const { data: reportCounts, error: reportError } = await supabaseAdmin
      .from('reports')
      .select('reporter_id');

    if (reportError) throw reportError;

    // Map reporter_id → count
    const countMap: Record<string, number> = {};
    (reportCounts ?? []).forEach((r: { reporter_id: string }) => {
      countMap[r.reporter_id] = (countMap[r.reporter_id] || 0) + 1;
    });

    // Map auth user id → email + created_at
    const authMap: Record<string, { email: string; created_at: string }> = {};
    (authUsers ?? []).forEach((u) => {
      authMap[u.id] = {
        email: u.email ?? '',
        created_at: u.created_at ?? '',
      };
    });

    // 4. Gabungin semua data
    const result = (profiles ?? []).map((p) => ({
      id: p.id,
      full_name: p.full_name,
      role: p.role ?? 'user',
      is_banned: p.is_banned ?? false,
      email: authMap[p.id]?.email ?? '',
      created_at: authMap[p.id]?.created_at ?? p.updated_at ?? '',
      report_count: countMap[p.id] ?? 0,
    }));

    res.json({ success: true, data: result });
  } catch (err) {
    console.error('getUsers error:', err);
    res.status(500).json({ success: false, message: 'Gagal mengambil data pengguna.' });
  }
}

// ── PATCH /api/admin/users/:userId/role ───────────────────────────────────────
export async function updateUserRole(req: Request, res: Response) {
  try {
    const { userId } = req.params;
    const currentUserId = req.user!.id;

    if (userId === currentUserId) {
      res.status(400).json({ success: false, message: 'Tidak bisa mengubah role akun sendiri.' });
      return;
    }

    const parsed = updateRoleSchema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ success: false, message: 'Role tidak valid.' });
      return;
    }

    const { error } = await supabaseAdmin
      .from('profiles')
      .update({ role: parsed.data.role })
      .eq('id', userId);

    if (error) throw error;
    res.json({ success: true, message: 'Role pengguna berhasil diperbarui.' });
  } catch {
    res.status(500).json({ success: false, message: 'Gagal update role pengguna.' });
  }
}

// ── PATCH /api/admin/users/:userId/ban ────────────────────────────────────────
export async function banUser(req: Request, res: Response) {
  try {
    const { userId } = req.params;
    const currentUserId = req.user!.id;

    // Nggak bisa ban diri sendiri
    if (userId === currentUserId) {
      res.status(400).json({ success: false, message: 'Tidak bisa memblokir akun sendiri.' });
      return;
    }

    // Cek apakah target user adalah admin — admin nggak boleh di-ban
    const { data: targetProfile } = await supabaseAdmin
      .from('profiles')
      .select('role')
      .eq('id', userId)
      .single();

    if (targetProfile?.role === 'admin') {
      res.status(400).json({ success: false, message: 'Tidak bisa memblokir akun admin.' });
      return;
    }

    const { error } = await supabaseAdmin
      .from('profiles')
      .update({ is_banned: true })
      .eq('id', userId);

    if (error) throw error;
    res.json({ success: true, message: 'Pengguna berhasil diblokir.' });
  } catch {
    res.status(500).json({ success: false, message: 'Gagal memblokir pengguna.' });
  }
}

// ── PATCH /api/admin/users/:userId/unban ──────────────────────────────────────
export async function unbanUser(req: Request, res: Response) {
  try {
    const { userId } = req.params;

    const { error } = await supabaseAdmin
      .from('profiles')
      .update({ is_banned: false })
      .eq('id', userId);

    if (error) throw error;
    res.json({ success: true, message: 'Pengguna berhasil dibuka blokirnya.' });
  } catch {
    res.status(500).json({ success: false, message: 'Gagal membuka blokir pengguna.' });
  }
}

// ── GET /api/admin/users/:userId/banned — cek status banned ───────────────────
// Dipanggil dari AuthForm setelah login untuk cek apakah user di-ban
export async function checkBanned(req: Request, res: Response) {
  try {
    const { userId } = req.params;

    const { data, error } = await supabaseAdmin
      .from('profiles')
      .select('is_banned')
      .eq('id', userId)
      .single();

    if (error) throw error;

    res.json({ success: true, is_banned: data?.is_banned ?? false });
  } catch {
    res.status(500).json({ success: false, message: 'Gagal mengecek status akun.' });
  }
}