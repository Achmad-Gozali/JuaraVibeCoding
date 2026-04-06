import { Request, Response } from 'express';
import { supabaseAdmin } from '../lib/supabase';

const LOCK_DURATION_MINUTES = 15;
const MAX_ATTEMPTS = 3;

// ── POST /api/auth/verify-recaptcha ──────────────────────────────────────────
export async function verifyRecaptcha(req: Request, res: Response) {
  try {
    const { token } = req.body;

    if (!token) {
      res.status(400).json({ success: false, message: 'Token tidak ditemukan.' });
      return;
    }

    const secretKey = process.env.RECAPTCHA_SECRET_KEY;
    if (!secretKey) {
      res.status(500).json({ success: false, message: 'Konfigurasi server bermasalah.' });
      return;
    }

    const verifyUrl = `https://www.google.com/recaptcha/api/siteverify?secret=${secretKey}&response=${token}`;
    const response = await fetch(verifyUrl, { method: 'POST' });
    const data: any = await response.json();

    if (!data.success) {
      res.status(403).json({ success: false, message: 'Verifikasi keamanan gagal. Coba lagi.' });
      return;
    }

    const threshold = process.env.NODE_ENV === 'production' ? 0.5 : 0.3;
    if (data.score < threshold) {
      res.status(403).json({ success: false, message: 'Terdeteksi aktivitas mencurigakan. Coba lagi.' });
      return;
    }

    res.json({ success: true, score: data.score });
  } catch {
    res.status(500).json({ success: false, message: 'Terjadi kesalahan server.' });
  }
}

// ── POST /api/auth/login ──────────────────────────────────────────────────────
// Login dengan rate limiting: 3x gagal = dikunci 15 menit
export async function loginWithPassword(req: Request, res: Response) {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      res.status(400).json({ success: false, message: 'Email dan kata sandi wajib diisi.' });
      return;
    }

    const normalizedEmail = email.trim().toLowerCase();

    // ── 1. Cari user di auth.users lewat supabaseAdmin ────────────────────────
    const { data: authUsers, error: listError } = await supabaseAdmin.auth.admin.listUsers();
    if (listError) {
      res.status(500).json({ success: false, message: 'Terjadi kesalahan server.' });
      return;
    }

    const authUser = authUsers.users.find(u => u.email?.toLowerCase() === normalizedEmail);
    if (!authUser) {
      // Jangan kasih tau user apakah email terdaftar atau tidak (security)
      res.status(401).json({
        success: false,
        message: 'Email atau kata sandi salah.',
        remaining_attempts: null,
      });
      return;
    }

    // ── 2. Cek status lock di profiles ────────────────────────────────────────
    const { data: profile, error: profileError } = await supabaseAdmin
      .from('profiles')
      .select('failed_attempts, locked_until, is_banned')
      .eq('id', authUser.id)
      .single();

    if (profileError && profileError.code !== 'PGRST116') {
      res.status(500).json({ success: false, message: 'Terjadi kesalahan server.' });
      return;
    }

    // Cek banned
    if (profile?.is_banned) {
      res.status(403).json({
        success: false,
        message: 'Akun Anda telah dinonaktifkan. Hubungi admin untuk informasi lebih lanjut.',
      });
      return;
    }

    // Cek locked
    if (profile?.locked_until) {
      const lockedUntil = new Date(profile.locked_until);
      const now = new Date();
      if (lockedUntil > now) {
        const remainingMs = lockedUntil.getTime() - now.getTime();
        const remainingMinutes = Math.ceil(remainingMs / 60000);
        const lockedUntilTime = lockedUntil.toLocaleTimeString('id-ID', {
          hour: '2-digit',
          minute: '2-digit',
        });
        res.status(429).json({
          success: false,
          message: `Akun dikunci karena terlalu banyak percobaan gagal. Coba lagi pukul ${lockedUntilTime}.`,
          locked: true,
          locked_until: profile.locked_until,
          remaining_ms: remainingMs,
        });
        return;
      } else {
        // Lock sudah expired → reset
        await supabaseAdmin
          .from('profiles')
          .update({ failed_attempts: 0, locked_until: null })
          .eq('id', authUser.id);
      }
    }

    // ── 3. Coba login ke Supabase ─────────────────────────────────────────────
    const { createClient } = await import('@supabase/supabase-js');
    const supabaseClient = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );

    const { data: signInData, error: signInError } = await supabaseClient.auth.signInWithPassword({
      email: normalizedEmail,
      password,
    });

    // ── 4. Login gagal → increment failed_attempts ────────────────────────────
    if (signInError) {
      const currentAttempts = (profile?.failed_attempts ?? 0) + 1;
      const remaining = MAX_ATTEMPTS - currentAttempts;

      if (currentAttempts >= MAX_ATTEMPTS) {
        // Kunci akun selama 15 menit
        const lockedUntil = new Date(Date.now() + LOCK_DURATION_MINUTES * 60 * 1000);
        await supabaseAdmin
          .from('profiles')
          .update({ failed_attempts: currentAttempts, locked_until: lockedUntil.toISOString() })
          .eq('id', authUser.id);

        const lockedUntilTime = lockedUntil.toLocaleTimeString('id-ID', {
          hour: '2-digit',
          minute: '2-digit',
        });

        res.status(429).json({
          success: false,
          message: `Akun dikunci selama ${LOCK_DURATION_MINUTES} menit karena terlalu banyak percobaan gagal. Coba lagi pukul ${lockedUntilTime}.`,
          locked: true,
          locked_until: lockedUntil.toISOString(),
          remaining_ms: LOCK_DURATION_MINUTES * 60 * 1000,
        });
      } else {
        // Belum kena lock, update counter
        await supabaseAdmin
          .from('profiles')
          .update({ failed_attempts: currentAttempts })
          .eq('id', authUser.id);

        res.status(401).json({
          success: false,
          message: remaining === 1
            ? 'Kata sandi salah. Tersisa 1 percobaan sebelum akun dikunci.'
            : `Kata sandi salah. Tersisa ${remaining} percobaan lagi.`,
          locked: false,
          remaining_attempts: remaining,
        });
      }
      return;
    }

    // ── 5. Login berhasil → reset counter ────────────────────────────────────
    await supabaseAdmin
      .from('profiles')
      .update({ failed_attempts: 0, locked_until: null })
      .eq('id', authUser.id);

    res.json({
      success: true,
      message: 'Login berhasil.',
      session: signInData.session,
      user: signInData.user,
    });

  } catch {
    res.status(500).json({ success: false, message: 'Terjadi kesalahan server.' });
  }
}