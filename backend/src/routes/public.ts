import { Hono } from 'hono';
import { createClient } from '@supabase/supabase-js';
import type { Env } from '../types';

const pub = new Hono<{ Bindings: Env }>();

// ── Helper: validasi & ambil data API key ─────────────────────────────────────
async function validateApiKey(key: string, env: Env) {
  const supabase = createClient(env.SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY);

  const { data, error } = await supabase
    .from('api_keys')
    .select('id, user_id, daily_limit, requests_today, last_reset_at, is_active')
    .eq('key', key)
    .single();

  if (error || !data) return null;
  if (!data.is_active) return null;

  // Reset counter kalau udah ganti hari
  const today = new Date().toISOString().split('T')[0];
  if (data.last_reset_at !== today) {
    await supabase
      .from('api_keys')
      .update({ requests_today: 0, last_reset_at: today })
      .eq('id', data.id);
    data.requests_today = 0;
  }

  return data;
}

// ── Helper: rate limit per detik ─────────────────────────────────────────────
async function checkSecondRateLimit(
  keyId: string,
  limitPerSecond: number,
  env: Env
): Promise<{ allowed: boolean; current: number }> {
  if (!env.LIMITER) return { allowed: true, current: 0 };

  const secondBucket = Math.floor(Date.now() / 1000);
  const kvKey = `ratelimit_second_${keyId}_${secondBucket}`;

  try {
    const current = await env.LIMITER.get(kvKey);
    const count = current ? parseInt(current) : 0;

    if (count >= limitPerSecond) {
      return { allowed: false, current: count };
    }

    await env.LIMITER.put(kvKey, (count + 1).toString(), { expirationTtl: 2 });
    return { allowed: true, current: count + 1 };
  } catch {
    return { allowed: true, current: 0 };
  }
}

// ── Helper: increment usage ───────────────────────────────────────────────────
async function incrementUsage(keyId: string, currentToday: number, env: Env) {
  const supabase = createClient(env.SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY);
  await supabase
    .from('api_keys')
    .update({
      requests_today: currentToday + 1,
      requests_total: supabase.rpc as any,
    })
    .eq('id', keyId);

  // Pakai RPC untuk increment total
  await supabase.rpc('increment_api_usage', { key_id: keyId });
}

// ── GET /api/v1/check/:number ─────────────────────────────────────────────────
pub.get('/check/:number', async (c) => {
  try {
    // 1. Cek API key
    const apiKey = c.req.header('X-API-Key');
    if (!apiKey) {
      return c.json({
        success: false,
        error: 'API key diperlukan. Sertakan header X-API-Key.',
        docs: 'https://kawaltransaksi.com/developer',
      }, 401);
    }

    // 2. Validasi API key
    const keyData = await validateApiKey(apiKey, c.env);
    if (!keyData) {
      return c.json({
        success: false,
        error: 'API key tidak valid atau tidak aktif.',
        docs: 'https://kawaltransaksi.com/developer',
      }, 401);
    }

    // 3. Cek rate limit per detik
    // Free tier: 10 req/s, Pro tier (daily_limit > 100): 100 req/s
    const rpsLimit = keyData.daily_limit > 100 ? 100 : 10;
    const rpsCheck = await checkSecondRateLimit(keyData.id, rpsLimit, c.env);
    if (!rpsCheck.allowed) {
      return c.json({
        success: false,
        error: `Rate limit per detik tercapai (${rpsLimit} req/s). Kurangi frekuensi request.`,
        retry_after_ms: 1000,
      }, 429);
    }

    // 4. Cek daily limit
    if (keyData.requests_today >= keyData.daily_limit) {
      return c.json({
        success: false,
        error: `Batas harian tercapai (${keyData.daily_limit} request/hari). Coba lagi besok.`,
        docs: 'https://kawaltransaksi.com/developer',
      }, 429);
    }

    // 5. Validasi nomor
    const number = c.req.param('number').replace(/\D/g, '');
    if (!number || number.length < 8 || number.length > 20) {
      return c.json({
        success: false,
        error: 'Format nomor tidak valid. Masukkan nomor tanpa spasi atau karakter khusus.',
      }, 400);
    }

    // 6. Query database
    const supabase = createClient(c.env.SUPABASE_URL, c.env.SUPABASE_SERVICE_ROLE_KEY);
    const { data: reports } = await supabase
      .from('reports')
      .select('status, loss_amount, category, platform, created_at')
      .eq('target_number', number)
      .neq('status', 'withdrawn');

    const allReports = reports ?? [];
    const verifiedReports = allReports.filter(r => r.status === 'verified');
    const pendingReports = allReports.filter(r => r.status === 'pending');
    const totalLoss = allReports.reduce((sum, r) => sum + (Number(r.loss_amount) || 0), 0);
    const categories = Array.from(new Set(allReports.map(r => r.category).filter(Boolean)));
    const platforms = Array.from(new Set(allReports.map(r => r.platform).filter(Boolean)));

    let status: 'danger' | 'warning' | 'safe' = 'safe';
    if (verifiedReports.length > 0) status = 'danger';
    else if (pendingReports.length > 0) status = 'warning';

    // 7. Increment usage
    await supabase.rpc('increment_api_usage', { key_id: keyData.id });

    // 8. Return response
    return c.json({
      success: true,
      data: {
        number,
        status,
        total_reports: allReports.length,
        verified_reports: verifiedReports.length,
        pending_reports: pendingReports.length,
        total_loss: totalLoss,
        categories,
        platforms,
        last_reported: allReports[0]?.created_at ?? null,
        url: `https://kawaltransaksi.com/check/${number}`,
      },
      meta: {
        requests_today: keyData.requests_today + 1,
        daily_limit: keyData.daily_limit,
        remaining: keyData.daily_limit - keyData.requests_today - 1,
        rate_limit_per_second: rpsLimit,
      },
    });
  } catch {
    return c.json({ success: false, error: 'Terjadi kesalahan server.' }, 500);
  }
});

// ── GET /api/v1/stats ─────────────────────────────────────────────────────────
pub.get('/stats', async (c) => {
  try {
    // 1. Cek API key
    const apiKey = c.req.header('X-API-Key');
    if (!apiKey) {
      return c.json({ success: false, error: 'API key diperlukan.' }, 401);
    }

    // 2. Validasi API key
    const keyData = await validateApiKey(apiKey, c.env);
    if (!keyData) {
      return c.json({ success: false, error: 'API key tidak valid.' }, 401);
    }

    // 3. Cek rate limit per detik
    const rpsLimit = keyData.daily_limit > 100 ? 100 : 10;
    const rpsCheck = await checkSecondRateLimit(keyData.id, rpsLimit, c.env);
    if (!rpsCheck.allowed) {
      return c.json({
        success: false,
        error: `Rate limit per detik tercapai (${rpsLimit} req/s). Kurangi frekuensi request.`,
        retry_after_ms: 1000,
      }, 429);
    }

    // 4. Query stats
    const supabase = createClient(c.env.SUPABASE_URL, c.env.SUPABASE_SERVICE_ROLE_KEY);
    const { data: stats } = await supabase
      .from('reports')
      .select('status, loss_amount')
      .neq('status', 'withdrawn');

    const all = stats ?? [];
    const totalLoss = all.reduce((sum, r) => sum + (Number(r.loss_amount) || 0), 0);

    // 5. Increment usage
    await supabase.rpc('increment_api_usage', { key_id: keyData.id });

    return c.json({
      success: true,
      data: {
        total_reports: all.length,
        verified_reports: all.filter(r => r.status === 'verified').length,
        pending_reports: all.filter(r => r.status === 'pending').length,
        total_loss: totalLoss,
      },
      meta: {
        requests_today: keyData.requests_today + 1,
        daily_limit: keyData.daily_limit,
        remaining: keyData.daily_limit - keyData.requests_today - 1,
        rate_limit_per_second: rpsLimit,
      },
    });
  } catch {
    return c.json({ success: false, error: 'Terjadi kesalahan server.' }, 500);
  }
});

export default pub;