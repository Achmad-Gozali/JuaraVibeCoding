'use server';

import { createClient } from '@/lib/supabase-server';
import { analyzeChronologyText, analyzeEvidenceImage } from '@/lib/groq';
import type { AnalysisResult } from '@/lib/groq';

// ─── KONFIGURASI THRESHOLD AUTO-VERIFY ──────────────────────────────────────
const THRESHOLD = {
  CHRONOLOGY_SCORE_MIN: 75,
  CHRONOLOGY_LENGTH_MIN: 100,
  PHOTO_AUTHENTICITY_MIN: 70,
  PHOTO_RELEVANCE_MIN: 65,
} as const;

// ─── HELPER: hitung skor final dan tentukan status ───────────────────────────
function determineAutoStatus(params: {
  chronologyScore: number;
  chronologyLength: number;
  riskLevel: 'low' | 'medium' | 'high';
  photoResult: AnalysisResult | null;
  hasPhoto: boolean;
}): { status: 'pending' | 'verified'; reason: string } {
  const { chronologyScore, chronologyLength, riskLevel, photoResult, hasPhoto } = params;

  if (chronologyLength < THRESHOLD.CHRONOLOGY_LENGTH_MIN) {
    return { status: 'pending', reason: `kronologi terlalu singkat (${chronologyLength} karakter)` };
  }

  if (chronologyScore < THRESHOLD.CHRONOLOGY_SCORE_MIN) {
    return { status: 'pending', reason: `skor kronologi kurang (${chronologyScore}/100)` };
  }

  if (hasPhoto && photoResult) {
    const photoAuthOk = photoResult.authenticity_score >= THRESHOLD.PHOTO_AUTHENTICITY_MIN;
    const photoRelOk = photoResult.relevance_score >= THRESHOLD.PHOTO_RELEVANCE_MIN;

    if (!photoAuthOk) {
      return {
        status: 'pending',
        reason: `foto mencurigakan (keaslian ${photoResult.authenticity_score}/100)`,
      };
    }
    if (!photoRelOk) {
      return {
        status: 'pending',
        reason: `foto tidak relevan sebagai bukti (relevansi ${photoResult.relevance_score}/100)`,
      };
    }

    if (riskLevel === 'high' || riskLevel === 'medium') {
      return {
        status: 'verified',
        reason: `kronologi ${riskLevel}-risk + foto valid (keaslian ${photoResult.authenticity_score}, relevansi ${photoResult.relevance_score})`,
      };
    }
  }

  if (!hasPhoto && riskLevel === 'high' && chronologyScore >= 85) {
    return {
      status: 'verified',
      reason: `kronologi high-risk sangat detail (skor ${chronologyScore}) tanpa foto`,
    };
  }

  return {
    status: 'pending',
    reason: `tidak memenuhi semua syarat auto-verifikasi`,
  };
}

// ─── SUBMIT LAPORAN ───────────────────────────────────────────────────────────
export async function submitReport(formData: {
  target_number: string;
  target_name: string;
  target_type: 'phone' | 'bank_account' | 'ewallet';
  category: string;
  chronology: string;
  evidence_url: string | null;
  bank_name: string | null;
  loss_amount: number | null;
  incident_date: string | null;
  platform: string | null;
  link_url: string | null;
  ai_photo_result?: {
    authenticity_score: number;
    relevance_score: number;
    has_concrete_evidence: boolean;
    is_likely_authentic: boolean;
  } | null;
  social_media_accounts?: string[];
  has_other_victims?: string | null;
  reported_to?: string[];
  suspect_photo_url?: string | null;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { success: false, error: 'anda harus login terlebih dahulu.' };

  // ── rate limit: maks 10 laporan per hari
  const oneDayAgo = new Date(Date.now() - 86400000).toISOString();
  const { count: todayCount } = await supabase
    .from('reports')
    .select('*', { count: 'exact', head: true })
    .eq('reporter_id', user.id)
    .gte('created_at', oneDayAgo);

  if ((todayCount ?? 0) >= 10) {
    return { success: false, error: 'batas laporan harian tercapai (maksimal 10 laporan).' };
  }

  // ── validasi nomor target
  const cleanNumber = formData.target_number.replace(/[^0-9]/g, '');
  if (cleanNumber.length < 8 || cleanNumber.length > 20) {
    return { success: false, error: 'nomor target tidak valid.' };
  }

  // ── validasi kronologi
  const trimmedChronology = formData.chronology?.trim() ?? '';
  if (trimmedChronology.length < 20) {
    return { success: false, error: 'kronologi minimal 20 karakter.' };
  }

  // ── proses auto-verify
  let autoStatus: 'pending' | 'verified' = 'pending';
  let verifyReason = 'tidak ada hasil analisis ai';

  try {
    const textResult = await analyzeChronologyText(trimmedChronology);

    const chronologyScore = textResult?.chronology_score ?? 0;
    const riskLevel = textResult?.risk_level ?? 'low';

    const photoResult = formData.ai_photo_result
      ? ({
          authenticity_score: formData.ai_photo_result.authenticity_score,
          relevance_score: formData.ai_photo_result.relevance_score,
          has_concrete_evidence: formData.ai_photo_result.has_concrete_evidence,
          is_likely_authentic: formData.ai_photo_result.is_likely_authentic,
          summary: '',
          red_flags: [],
          scam_category_suggestion: null,
        } as AnalysisResult)
      : null;

    const verdict = determineAutoStatus({
      chronologyScore,
      chronologyLength: trimmedChronology.length,
      riskLevel,
      photoResult,
      hasPhoto: !!formData.evidence_url,
    });

    autoStatus = verdict.status;
    verifyReason = verdict.reason;

    console.log(`[AUTO-VERIFY] status=${autoStatus} | reason=${verifyReason}`);
  } catch (err) {
    console.error('[AUTO-VERIFY] error, fallback ke pending:', err);
  }

  // ✅ FINAL FIX: Gunakan target_type asli dari form (support 'ewallet')
  const dbTargetType = formData.target_type;

  const { error } = await supabase.from('reports').insert({
    reporter_id: user.id,
    target_number: cleanNumber,
    target_name: formData.target_name?.trim() || null,
    target_type: dbTargetType,
    category: formData.category,
    chronology: trimmedChronology,
    evidence_url: formData.evidence_url || null,
    status: autoStatus,
    bank_name: formData.bank_name || null,
    loss_amount: formData.loss_amount || null,
    incident_date: formData.incident_date || null,
    platform: formData.platform || null,
    link_url: formData.link_url || null,
    social_media_accounts: formData.social_media_accounts?.filter(Boolean) ?? [],
    has_other_victims: formData.has_other_victims || null,
    reported_to: formData.reported_to ?? [],
    suspect_photo_url: formData.suspect_photo_url || null,
  });

  if (error) {
    console.error('[DB INSERT ERROR]:', error);
    return { success: false, error: `database error: ${error.message}` };
  }

  return { success: true, slug: cleanNumber, status: autoStatus };
}

// ─── UPLOAD BUKTI ─────────────────────────────────────────────────────────────
export async function uploadEvidence(formData: FormData) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { success: false, error: 'anda harus login.' };

  const file = formData.get('file') as File;
  if (!file) return { success: false, error: 'file tidak ditemukan.' };
  if (file.size > 5 * 1024 * 1024) return { success: false, error: 'file maksimal 5mb.' };

  const ext = file.name.split('.').pop();
  const fileName = `${user.id}/${Date.now()}.${ext}`;
  const { error } = await supabase.storage.from('evidence').upload(fileName, file);
  if (error) return { success: false, error: 'gagal upload ke storage.' };

  const {
    data: { publicUrl },
  } = supabase.storage.from('evidence').getPublicUrl(fileName);

  return { success: true, url: publicUrl };
}

// ─── ANALISIS GAMBAR BUKTI ────────────────────────────────────────────────────
export async function analyzeEvidence(formData: FormData) {
  const file = formData.get('file') as File;
  if (!file) return { success: false, error: 'file tidak ada.' };

  try {
    const bytes = await file.arrayBuffer();
    const base64 = Buffer.from(bytes).toString('base64');
    const result = await analyzeEvidenceImage(base64, file.type);
    return { success: true, data: result };
  } catch (err) {
    console.error('[ANALYZE EVIDENCE ERROR]:', err);
    return { success: false, error: 'gagal analisis gambar. coba lagi nanti.' };
  }
}

// ─── ANALISIS TEKS KRONOLOGI ──────────────────────────────────────────────────
export async function analyzeChronology(chronology: string) {
  if (!chronology || chronology.trim().length < 20) {
    return { success: false, error: 'kronologi terlalu pendek.' };
  }

  try {
    const result = await analyzeChronologyText(chronology);
    if (!result) throw new Error('tidak ada hasil dari ai');
    return { success: true, data: result };
  } catch (err) {
    console.error('[ANALYZE CHRONOLOGY ERROR]:', err);
    return {
      success: false,
      error: 'server ai sedang sibuk. silakan coba beberapa saat lagi.',
    };
  }
}