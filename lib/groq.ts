const GROQ_API_URL = 'https://api.groq.com/openai/v1/chat/completions';

const GROQ_TEXT_MODEL = 'llama-3.3-70b-versatile';
const GROQ_VISION_MODEL = 'meta-llama/llama-4-scout-17b-16e-instruct';

export interface AnalysisResult {
  authenticity_score: number;
  relevance_score: number;
  has_concrete_evidence: boolean;
  is_likely_authentic: boolean;
  summary: string;
  red_flags: string[];
  scam_category_suggestion: string | null;
}

export interface TextAnalysisResult {
  risk_level: 'low' | 'medium' | 'high';
  chronology_score: number;
  analysis: string;
  suggested_category: string | null;
}

function parseGroqJson<T>(content: string): T | null {
  try {
    const jsonMatch = content.match(/\{[\s\S]*\}/);
    const target = jsonMatch ? jsonMatch[0] : content;
    return JSON.parse(target) as T;
  } catch {
    return null;
  }
}

/**
 * Analisis gambar bukti — cek keaslian DAN relevansi sebagai bukti penipuan
 */
export async function analyzeEvidenceImage(
  base64Image: string,
  mimeType: string
): Promise<AnalysisResult> {
  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey) throw new Error('api key tidak ditemukan');

  const response = await fetch(GROQ_API_URL, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: GROQ_VISION_MODEL,
      response_format: { type: 'json_object' },
      temperature: 0.1,
      messages: [
        {
          role: 'system',
          content: `kamu adalah ahli forensik digital bukti penipuan online. tugasmu: audit screenshot untuk dua hal berbeda, yaitu KEASLIAN visual dan RELEVANSI sebagai bukti penipuan. gunakan bahasa indonesia formal dan tegas.

## panduan penilaian KEASLIAN (authenticity_score 0-100):
- cek anomali resolusi, artefak kompresi jpeg, dan manipulasi piksel.
- evaluasi inkonsistensi tipografi, font, warna, dan elemen antarmuka (ui/ux).
- perhatikan metadata visual seperti shadow, padding, dan sudut yang tidak konsisten.
- gambar asli tanpa editan = 85-100. ada indikasi editan ringan = 40-84. jelas palsu/editan = 0-39.

## panduan penilaian RELEVANSI (relevance_score 0-100):
relevansi mengukur seberapa kuat gambar ini membuktikan terjadinya penipuan.
- SANGAT RELEVAN (80-100): screenshot chat berisi negosiasi/permintaan uang, struk transfer bank, bukti pembayaran, konfirmasi transaksi, percakapan yang menunjukkan modus penipuan secara jelas.
- CUKUP RELEVAN (40-79): profil akun penipu, tangkapan layar iklan palsu, foto barang yang dijanjikan.
- TIDAK RELEVAN (0-39): halaman error, screenshot acak yang tidak berkaitan, foto umum tanpa konteks transaksi, logo aplikasi saja.

## penentuan has_concrete_evidence:
bernilai TRUE hanya jika gambar menampilkan SETIDAKNYA SATU dari: (1) struk/notifikasi transfer uang, (2) chat yang secara eksplisit membahas transaksi dan nominal uang, (3) konfirmasi pembayaran dari platform.

## format output json yang wajib diikuti:
{
  "authenticity_score": <number 0-100>,
  "relevance_score": <number 0-100>,
  "has_concrete_evidence": <true|false>,
  "is_likely_authentic": <true jika authenticity_score >= 60>,
  "summary": "<kesimpulan forensik tegas, maksimal 2 kalimat>",
  "red_flags": ["<temuan teknis spesifik, maks 12 kata>"],
  "scam_category_suggestion": "<kategori modus penipuan atau null>"
}`,
        },
        {
          role: 'user',
          content: [
            {
              type: 'image_url',
              image_url: { url: `data:${mimeType};base64,${base64Image}` },
            },
            {
              type: 'text',
              text: 'lakukan audit forensik pada screenshot ini. nilai keaslian visualnya, relevansinya sebagai bukti penipuan, dan apakah ada bukti transaksi konkret di dalamnya.',
            },
          ],
        },
      ],
    }),
  });

  if (!response.ok) {
    const errDetail = await response.text();
    console.error('GROQ IMAGE API ERROR:', response.status, errDetail);
    throw new Error(`groq error ${response.status}: ${errDetail}`);
  }

  const data = await response.json();
  const content = data.choices?.[0]?.message?.content ?? '';

  return (
    parseGroqJson<AnalysisResult>(content) ?? {
      authenticity_score: 40,
      relevance_score: 0,
      has_concrete_evidence: false,
      is_likely_authentic: false,
      summary: 'gagal memproses analisis gambar.',
      red_flags: ['analisis tidak dapat diselesaikan'],
      scam_category_suggestion: null,
    }
  );
}

/**
 * Analisis teks kronologi — deteksi modus, risk level, dan skor kualitas laporan
 */
export async function analyzeChronologyText(
  chronology: string
): Promise<TextAnalysisResult> {
  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey) throw new Error('api key tidak ditemukan');

  const response = await fetch(GROQ_API_URL, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: GROQ_TEXT_MODEL,
      response_format: { type: 'json_object' },
      temperature: 0.1,
      messages: [
        {
          role: 'system',
          content: `kamu adalah investigator fraud siber berpengalaman. tugasmu: analisis kronologi penipuan dan berikan dua penilaian: (1) tingkat risiko modus yang dilaporkan, (2) skor kualitas laporan berdasarkan kelengkapan informasi.

## panduan penilaian risk_level:
- "high": modus jelas, ada nominal kerugian, ada identitas penipu, ada platform transaksi yang disebutkan.
- "medium": modus cukup jelas tapi beberapa detail masih kurang (misal tidak ada nominal atau platform).
- "low": kronologi sangat singkat, tidak jelas, atau tidak ada indikasi penipuan yang kuat.

## panduan penilaian chronology_score (0-100):
ini mengukur kelengkapan informasi laporan, BUKAN apakah laporannya benar.
- +30 poin: menyebut nominal kerugian secara spesifik
- +25 poin: menyebut platform transaksi (rekber, shopee, tokopedia, dll)
- +20 poin: menyebut identitas penipu (nama akun, nomor, dll)
- +15 poin: urutan kejadian logis dan kronologis
- +10 poin: menyebut waktu/tanggal kejadian
- kurangi poin jika kronologi sangat singkat, ambigu, atau tidak masuk akal

## aturan field "analysis":
- maksimal 3-4 kalimat padat.
- jelaskan modus operandi secara teknis.
- jelaskan istilah slang (rekber = rekening bersama, clone = akun tiruan, npu = nitip pesan uang) jika muncul.

## format output json wajib:
{
  "risk_level": "<low|medium|high>",
  "chronology_score": <number 0-100>,
  "analysis": "<analisis tegas dan ringkas>",
  "suggested_category": "<kategori spesifik atau null>"
}`,
        },
        {
          role: 'user',
          content: `analisis kronologi berikut secara tajam: "${chronology}"`,
        },
      ],
    }),
  });

  if (!response.ok) {
    const errDetail = await response.text();
    console.error('GROQ TEXT API ERROR:', response.status, errDetail);
    throw new Error(`groq error ${response.status}`);
  }

  const data = await response.json();
  const content = data.choices?.[0]?.message?.content ?? '';

  return (
    parseGroqJson<TextAnalysisResult>(content) ?? {
      risk_level: 'low',
      chronology_score: 0,
      analysis: 'gagal memproses teks, silakan coba lagi.',
      suggested_category: null,
    }
  );
}