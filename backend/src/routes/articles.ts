import { Hono } from 'hono';
import { createClient } from '@supabase/supabase-js';
import type { Env } from '../types';

const app = new Hono<{ Bindings: Env }>();

// ── GET /api/articles — list semua artikel ────────────────────────────────────
app.get('/', async (c) => {
  const supabase = createClient(c.env.SUPABASE_URL, c.env.SUPABASE_SERVICE_ROLE_KEY);

  const { data, error } = await supabase
    .from('articles')
    .select('id, title, slug, summary, total_reports, total_loss, top_category, published_at')
    .order('published_at', { ascending: false })
    .limit(20);

  if (error) return c.json({ success: false, message: 'Gagal mengambil artikel.' }, 500);
  return c.json({ success: true, data });
});

// ── GET /api/articles/:slug — detail artikel ──────────────────────────────────
app.get('/:slug', async (c) => {
  const slug = c.req.param('slug');
  const supabase = createClient(c.env.SUPABASE_URL, c.env.SUPABASE_SERVICE_ROLE_KEY);

  const { data, error } = await supabase
    .from('articles')
    .select('*')
    .eq('slug', slug)
    .single();

  if (error || !data) return c.json({ success: false, message: 'Artikel tidak ditemukan.' }, 404);
  return c.json({ success: true, data });
});

export default app;

// ── CRON: Generate artikel mingguan ──────────────────────────────────────────
export async function generateWeeklyArticle(env: Env): Promise<void> {
  const supabase = createClient(env.SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY);

  // Ambil data 7 hari terakhir
  const periodEnd = new Date();
  const periodStart = new Date();
  periodStart.setDate(periodStart.getDate() - 7);

  const { data: reports } = await supabase
    .from('reports')
    .select('category, platform, bank_name, target_type, loss_amount, status, created_at')
    .gte('created_at', periodStart.toISOString())
    .lte('created_at', periodEnd.toISOString())
    .in('status', ['verified', 'pending']);

  if (!reports || reports.length === 0) {
    console.log('[CRON] Tidak ada laporan minggu ini, skip generate artikel.');
    return;
  }

  // Hitung statistik
  const totalReports = reports.length;
  const totalLoss = reports.reduce((sum, r) => sum + (Number(r.loss_amount) || 0), 0);

  const categoryCount: Record<string, number> = {};
  const platformCount: Record<string, number> = {};
  const bankCount: Record<string, number> = {};

  reports.forEach((r) => {
    if (r.category) categoryCount[r.category] = (categoryCount[r.category] ?? 0) + 1;
    if (r.platform) platformCount[r.platform] = (platformCount[r.platform] ?? 0) + 1;
    if (r.bank_name) bankCount[r.bank_name] = (bankCount[r.bank_name] ?? 0) + 1;
  });

  const topCategory = Object.entries(categoryCount).sort((a, b) => b[1] - a[1])[0];
  const topPlatform = Object.entries(platformCount).sort((a, b) => b[1] - a[1])[0];
  const topBank = Object.entries(bankCount).sort((a, b) => b[1] - a[1])[0];

  const categoryList = Object.entries(categoryCount)
    .sort((a, b) => b[1] - a[1])
    .map(([name, count]) => `- ${name}: ${count} laporan`)
    .join('\n');

  const platformList = Object.entries(platformCount)
    .sort((a, b) => b[1] - a[1])
    .map(([name, count]) => `- ${name}: ${count} laporan`)
    .join('\n');

  const bankList = Object.entries(bankCount)
    .sort((a, b) => b[1] - a[1])
    .map(([name, count]) => `- ${name}: ${count} rekening`)
    .join('\n');

  const totalLossFormatted = new Intl.NumberFormat('id-ID', {
    style: 'currency', currency: 'IDR', maximumFractionDigits: 0,
  }).format(totalLoss);

  const weekStr = `${periodStart.toLocaleDateString('id-ID', { day: 'numeric', month: 'long' })} – ${periodEnd.toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}`;

  // Generate artikel via Groq
  const prompt = `Kamu adalah analis keamanan digital dari platform KawalTransaksi, platform komunitas anti-penipuan Indonesia.

Berikut data laporan penipuan yang masuk minggu ${weekStr}:

Total laporan: ${totalReports}
Total kerugian: ${totalLossFormatted}

Kategori penipuan:
${categoryList || '- Tidak ada data'}

Platform yang digunakan penipu:
${platformList || '- Tidak ada data'}

Bank/e-wallet yang digunakan penipu:
${bankList || '- Tidak ada data'}

Tulis artikel analisis pola penipuan minggu ini dalam bahasa Indonesia yang mudah dipahami masyarakat umum. 

Format artikel:
1. Paragraf pembuka — ringkasan situasi minggu ini (2-3 kalimat)
2. Modus yang paling marak — jelaskan pola yang ditemukan berdasarkan data
3. Platform yang paling sering digunakan penipu — analisis kenapa platform ini dipilih
4. Tips waspada — 3-4 tips spesifik berdasarkan pola yang ditemukan minggu ini
5. Paragraf penutup — ajakan untuk selalu cek nomor sebelum transaksi

Panjang artikel: 400-600 kata. Gunakan bahasa yang informatif tapi mudah dipahami. Jangan gunakan markdown, tulis dalam paragraf biasa.`;

  const groqRes = await fetch('https://api.groq.com/openai/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${env.GROQ_API_KEY}`,
    },
    body: JSON.stringify({
      model: 'llama-3.3-70b-versatile',
      messages: [{ role: 'user', content: prompt }],
      max_tokens: 1000,
      temperature: 0.7,
    }),
  });

  if (!groqRes.ok) {
    console.error('[CRON] Groq API error:', await groqRes.text());
    return;
  }

  const groqData = await groqRes.json() as any;
  const content = groqData.choices?.[0]?.message?.content ?? '';
  if (!content) {
    console.error('[CRON] Groq tidak menghasilkan konten.');
    return;
  }

  // Buat title dan slug
  const weekNum = Math.ceil(periodEnd.getDate() / 7);
  const monthStr = periodEnd.toLocaleDateString('id-ID', { month: 'long', year: 'numeric' });
  const title = `Laporan Penipuan Minggu ke-${weekNum} ${monthStr}`;
  const slug = `laporan-minggu-${weekNum}-${periodEnd.toISOString().slice(0, 7)}`;

  // Summary — ambil kalimat pertama dari artikel
  const summary = content.split('.')[0] + '.';

  // Simpan ke Supabase
  const { error } = await supabase.from('articles').upsert({
    title,
    slug,
    content,
    summary,
    period_start: periodStart.toISOString(),
    period_end: periodEnd.toISOString(),
    total_reports: totalReports,
    total_loss: totalLoss,
    top_category: topCategory?.[0] ?? null,
    top_platform: topPlatform?.[0] ?? null,
    top_bank: topBank?.[0] ?? null,
    published_at: new Date().toISOString(),
  }, { onConflict: 'slug' });

  if (error) {
    console.error('[CRON] Gagal simpan artikel:', error);
    return;
  }

  console.log(`[CRON] Artikel berhasil di-generate: ${title}`);
}