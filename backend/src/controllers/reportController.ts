import { Request, Response } from 'express';
import { z } from 'zod';
import { supabaseAdmin } from '../lib/supabase';
import { analyzeChronologyText, analyzeEvidenceImage, AnalysisResult } from '../lib/groq';

// ── THRESHOLD AUTO-VERIFY ─────────────────────────────────────────────────────
const THRESHOLD = {
  CHRONOLOGY_SCORE_MIN: 90,
  CHRONOLOGY_LENGTH_MIN: 150,
  PHOTO_AUTHENTICITY_MIN: 90,
  PHOTO_RELEVANCE_MIN: 90,
} as const;

// ── INPUT SANITIZATION ────────────────────────────────────────────────────────
// Strip karakter HTML berbahaya untuk mencegah XSS
function sanitizeText(input: string): string {
  return input
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;')
    .replace(/\//g, '&#x2F;')
    .trim();
}

// Sanitize teks panjang (kronologi) — strip HTML tags sepenuhnya
function sanitizeChronology(input: string): string {
  return input
    .replace(/<[^>]*>/g, '') // hapus semua HTML tags
    .replace(/javascript:/gi, '') // cegah javascript: protocol
    .replace(/on\w+\s*=/gi, '') // cegah event handlers seperti onclick=
    .trim();
}

// Sanitize array of strings
function sanitizeArray(arr: string[]): string[] {
  return arr.map(s => sanitizeText(s)).filter(Boolean);
}

// ── FILE VALIDATION ───────────────────────────────────────────────────────────
// Magic bytes untuk validasi tipe file yang sebenarnya (bukan hanya ekstensi)
const FILE_SIGNATURES = {
  jpeg: [0xFF, 0xD8, 0xFF],
  png: [0x89, 0x50, 0x4E, 0x47],
};

function validateFileSignature(buffer: Buffer): boolean {
  // Cek JPEG
  if (
    buffer[0] === FILE_SIGNATURES.jpeg[0] &&
    buffer[1] === FILE_SIGNATURES.jpeg[1] &&
    buffer[2] === FILE_SIGNATURES.jpeg[2]
  ) return true;

  // Cek PNG
  if (
    buffer[0] === FILE_SIGNATURES.png[0] &&
    buffer[1] === FILE_SIGNATURES.png[1] &&
    buffer[2] === FILE_SIGNATURES.png[2] &&
    buffer[3] === FILE_SIGNATURES.png[3]
  ) return true;

  return false;
}

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const ALLOWED_MIME_TYPES = ['image/jpeg', 'image/png'];

// ── SCHEMAS ───────────────────────────────────────────────────────────────────
const submitReportSchema = z.object({
  target_number: z.string().min(8).max(20),
  target_name: z.string().max(100).optional().nullable(),
  target_type: z.enum(['phone', 'bank_account', 'ewallet']),
  category: z.string().min(1).max(100),
  chronology: z.string().min(20).max(5000),
  evidence_url: z.string().url().optional().nullable(),                       // backward compat — foto pertama
  evidence_urls: z.array(z.string().url()).max(10).optional().default([]),     // NEW — semua foto
  bank_name: z.string().max(100).optional().nullable(),
  loss_amount: z.number().optional().nullable(),
  incident_date: z.string().optional().nullable(),
  platform: z.string().max(100).optional().nullable(),
  link_url: z.string().url().optional().nullable(),
  social_media_accounts: z.array(z.string().max(200)).max(10).optional(),
  has_other_victims: z.string().optional().nullable(),
  reported_to: z.array(z.string()).optional(),
  suspect_photo_url: z.string().url().optional().nullable(),
  ai_photo_result: z.object({
    authenticity_score: z.number(),
    relevance_score: z.number(),
    has_concrete_evidence: z.boolean(),
    is_likely_authentic: z.boolean(),
  }).optional().nullable(),
});

const editReportSchema = z.object({
  target_name: z.string().max(100).optional().nullable(),
  category: z.string().min(1).max(100),
  chronology: z.string().min(20).max(5000),
  bank_name: z.string().max(100).optional().nullable(),
  loss_amount: z.number().optional().nullable(),
  incident_date: z.string().optional().nullable(),
  platform: z.string().max(100).optional().nullable(),
  link_url: z.string().url().optional().nullable(),
  social_media_accounts: z.array(z.string().max(200)).max(10).optional(),
  has_other_victims: z.string().optional().nullable(),
  reported_to: z.array(z.string()).optional(),
});

function determineAutoStatus(params: {
  chronologyScore: number;
  chronologyLength: number;
  riskLevel: 'low' | 'medium' | 'high';
  photoResult: AnalysisResult | null;
  hasPhoto: boolean;
}): 'pending' | 'verified' {
  const { chronologyScore, chronologyLength, riskLevel, photoResult, hasPhoto } = params;
  if (chronologyLength < THRESHOLD.CHRONOLOGY_LENGTH_MIN) return 'pending';
  if (chronologyScore < THRESHOLD.CHRONOLOGY_SCORE_MIN) return 'pending';
  if (riskLevel !== 'high') return 'pending';
  if (hasPhoto && photoResult) {
    if (photoResult.authenticity_score < THRESHOLD.PHOTO_AUTHENTICITY_MIN) return 'pending';
    if (photoResult.relevance_score < THRESHOLD.PHOTO_RELEVANCE_MIN) return 'pending';
    if (!photoResult.has_concrete_evidence) return 'pending';
    if (!photoResult.is_likely_authentic) return 'pending';
    return 'verified';
  }
  if (!hasPhoto && chronologyScore >= 95) return 'verified';
  return 'pending';
}

// ── POST /api/reports ─────────────────────────────────────────────────────────
export async function submitReport(req: Request, res: Response) {
  try {
    const userId = req.user!.id;

    const parsed = submitReportSchema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ success: false, message: 'Data tidak valid.', errors: parsed.error.flatten() });
      return;
    }

    const formData = parsed.data;

    // Rate limit: max 10 laporan per hari
    const oneDayAgo = new Date(Date.now() - 86400000).toISOString();
    const { count: todayCount } = await supabaseAdmin
      .from('reports')
      .select('*', { count: 'exact', head: true })
      .eq('reporter_id', userId)
      .gte('created_at', oneDayAgo);

    if ((todayCount ?? 0) >= 10) {
      res.status(429).json({ success: false, message: 'Batas laporan harian tercapai. Maksimal 10 laporan per hari.' });
      return;
    }

    const cleanNumber = formData.target_number.replace(/[^0-9]/g, '');

    // ── Sanitize semua input teks sebelum simpan ke database ──────────────────
    const sanitizedChronology = sanitizeChronology(formData.chronology);
    const sanitizedTargetName = formData.target_name ? sanitizeText(formData.target_name) : null;
    const sanitizedBankName = formData.bank_name ? sanitizeText(formData.bank_name) : null;
    const sanitizedPlatform = formData.platform ? sanitizeText(formData.platform) : null;
    const sanitizedSocialAccounts = formData.social_media_accounts
      ? sanitizeArray(formData.social_media_accounts)
      : [];

    // ── Resolve evidence URLs — prioritaskan array, fallback ke single ─────────
    const evidenceUrls = formData.evidence_urls && formData.evidence_urls.length > 0
      ? formData.evidence_urls
      : formData.evidence_url
        ? [formData.evidence_url]
        : [];

    const hasPhoto = evidenceUrls.length > 0;

    // Auto-verify dengan AI
    let autoStatus: 'pending' | 'verified' = 'pending';
    try {
      const textResult = await analyzeChronologyText(sanitizedChronology);
      const photoResult = formData.ai_photo_result
        ? ({ ...formData.ai_photo_result, summary: '', red_flags: [], scam_category_suggestion: null } as AnalysisResult)
        : null;

      autoStatus = determineAutoStatus({
        chronologyScore: textResult.chronology_score,
        chronologyLength: sanitizedChronology.length,
        riskLevel: textResult.risk_level,
        photoResult,
        hasPhoto,
      });
    } catch {
      // AI error → tetap pending
    }

    const { error } = await supabaseAdmin.from('reports').insert({
      reporter_id: userId,
      target_number: cleanNumber,
      target_name: sanitizedTargetName,
      target_type: formData.target_type,
      category: formData.category,
      chronology: sanitizedChronology,
      evidence_url: evidenceUrls[0] || null,    // backward compat — foto pertama
      evidence_urls: evidenceUrls,               // NEW — semua foto sebagai array
      status: autoStatus,
      bank_name: sanitizedBankName,
      loss_amount: formData.loss_amount || null,
      incident_date: formData.incident_date || null,
      platform: sanitizedPlatform,
      link_url: formData.link_url || null,
      social_media_accounts: sanitizedSocialAccounts,
      has_other_victims: formData.has_other_victims || null,
      reported_to: formData.reported_to ?? [],
      suspect_photo_url: formData.suspect_photo_url || null,
    });

    if (error) {
      res.status(500).json({ success: false, message: `Gagal menyimpan laporan: ${error.message}` });
      return;
    }

    res.status(201).json({ success: true, slug: cleanNumber, status: autoStatus });
  } catch {
    res.status(500).json({ success: false, message: 'Terjadi kesalahan server.' });
  }
}

// ── POST /api/reports/upload ──────────────────────────────────────────────────
export async function uploadEvidence(req: Request, res: Response) {
  try {
    const userId = req.user!.id;
    const file = req.file;

    if (!file) {
      res.status(400).json({ success: false, message: 'File tidak ditemukan.' });
      return;
    }

    // ── Validasi ukuran file di backend ───────────────────────────────────────
    if (file.size > MAX_FILE_SIZE) {
      res.status(400).json({ success: false, message: 'Ukuran file melebihi batas 5MB.' });
      return;
    }

    // ── Validasi MIME type ────────────────────────────────────────────────────
    if (!ALLOWED_MIME_TYPES.includes(file.mimetype)) {
      res.status(400).json({ success: false, message: 'Tipe file tidak didukung. Hanya JPEG dan PNG yang diizinkan.' });
      return;
    }

    // ── Validasi magic bytes — cek isi file sebenarnya, bukan hanya ekstensi ──
    if (!validateFileSignature(file.buffer)) {
      res.status(400).json({ success: false, message: 'File tidak valid atau telah dimanipulasi. Upload file gambar yang asli.' });
      return;
    }

    // Gunakan ekstensi berdasarkan MIME type yang terverifikasi, bukan dari nama file
    const ext = file.mimetype === 'image/png' ? 'png' : 'jpg';
    const fileName = `${userId}/${Date.now()}.${ext}`;

    const { error } = await supabaseAdmin.storage
      .from('evidence')
      .upload(fileName, file.buffer, { contentType: file.mimetype });

    if (error) {
      res.status(500).json({ success: false, message: 'Gagal mengunggah file ke server.' });
      return;
    }

    const { data: { publicUrl } } = supabaseAdmin.storage.from('evidence').getPublicUrl(fileName);
    res.json({ success: true, url: publicUrl });
  } catch {
    res.status(500).json({ success: false, message: 'Terjadi kesalahan server.' });
  }
}

// ── POST /api/reports/analyze/image ───────────────────────────────────────────
export async function analyzeEvidence(req: Request, res: Response) {
  try {
    const file = req.file;
    if (!file) {
      res.status(400).json({ success: false, message: 'File tidak ditemukan.' });
      return;
    }

    // Validasi file untuk analisis juga
    if (file.size > MAX_FILE_SIZE) {
      res.status(400).json({ success: false, message: 'Ukuran file melebihi batas 5MB.' });
      return;
    }

    if (!ALLOWED_MIME_TYPES.includes(file.mimetype)) {
      res.status(400).json({ success: false, message: 'Tipe file tidak didukung. Hanya JPEG dan PNG yang diizinkan.' });
      return;
    }

    if (!validateFileSignature(file.buffer)) {
      res.status(400).json({ success: false, message: 'File tidak valid atau telah dimanipulasi.' });
      return;
    }

    const base64 = file.buffer.toString('base64');
    const result = await analyzeEvidenceImage(base64, file.mimetype);
    res.json({ success: true, data: result });
  } catch {
    res.status(500).json({ success: false, message: 'Sistem analisis sedang tidak tersedia. Silakan coba beberapa saat lagi.' });
  }
}

// ── POST /api/reports/analyze/text ────────────────────────────────────────────
export async function analyzeChronology(req: Request, res: Response) {
  try {
    const { chronology } = req.body;

    if (!chronology || typeof chronology !== 'string' || chronology.trim().length < 20) {
      res.status(400).json({ success: false, message: 'Kronologi terlalu singkat. Minimal 20 karakter diperlukan.' });
      return;
    }

    // Sanitize sebelum dianalisis
    const sanitized = sanitizeChronology(chronology);
    const result = await analyzeChronologyText(sanitized);
    res.json({ success: true, data: result });
  } catch {
    res.status(500).json({ success: false, message: 'Sistem analisis sedang tidak tersedia. Silakan coba beberapa saat lagi.' });
  }
}

// ── POST /api/reports/withdraw ────────────────────────────────────────────────
export async function withdrawReport(req: Request, res: Response) {
  try {
    const userId = req.user!.id;
    const { reportId } = req.body;

    if (!reportId) {
      res.status(400).json({ success: false, message: 'ID laporan tidak valid.' });
      return;
    }

    const { data: report, error: fetchError } = await supabaseAdmin
      .from('reports')
      .select('id, status, reporter_id')
      .eq('id', reportId)
      .eq('reporter_id', userId)
      .single();

    if (fetchError || !report) {
      res.status(404).json({ success: false, message: 'Laporan tidak ditemukan.' });
      return;
    }

    if (report.status === 'withdrawn') {
      res.status(400).json({ success: false, message: 'Laporan ini sudah dalam status revisi.' });
      return;
    }

    const { error } = await supabaseAdmin
      .from('reports')
      .update({ status: 'withdrawn' })
      .eq('id', reportId)
      .eq('reporter_id', userId);

    if (error) throw error;

    res.json({ success: true, message: 'Laporan berhasil ditarik untuk direvisi.' });
  } catch {
    res.status(500).json({ success: false, message: 'Terjadi kesalahan server.' });
  }
}

// ── PUT /api/reports/:reportId ────────────────────────────────────────────────
export async function editReport(req: Request, res: Response) {
  try {
    const userId = req.user!.id;
    const { reportId } = req.params;

    const parsed = editReportSchema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ success: false, message: 'Data tidak valid.', errors: parsed.error.flatten() });
      return;
    }

    const { data: report, error: fetchError } = await supabaseAdmin
      .from('reports')
      .select('id, status, reporter_id')
      .eq('id', reportId)
      .eq('reporter_id', userId)
      .single();

    if (fetchError || !report) {
      res.status(404).json({ success: false, message: 'Laporan tidak ditemukan.' });
      return;
    }

    if (report.status !== 'withdrawn') {
      res.status(400).json({ success: false, message: 'Hanya laporan berstatus "Sedang Direvisi" yang dapat diedit.' });
      return;
    }

    // Sanitize input edit juga
    const sanitizedData = {
      ...parsed.data,
      chronology: sanitizeChronology(parsed.data.chronology),
      target_name: parsed.data.target_name ? sanitizeText(parsed.data.target_name) : null,
      bank_name: parsed.data.bank_name ? sanitizeText(parsed.data.bank_name) : null,
      platform: parsed.data.platform ? sanitizeText(parsed.data.platform) : null,
      social_media_accounts: parsed.data.social_media_accounts
        ? sanitizeArray(parsed.data.social_media_accounts)
        : [],
    };

    const { error } = await supabaseAdmin
      .from('reports')
      .update({ ...sanitizedData, status: 'pending' })
      .eq('id', reportId)
      .eq('reporter_id', userId);

    if (error) throw error;

    res.json({ success: true, message: 'Laporan berhasil diperbarui dan akan segera ditinjau oleh tim kami.' });
  } catch {
    res.status(500).json({ success: false, message: 'Terjadi kesalahan server.' });
  }
}