const GROQ_API_URL = 'https://api.groq.com/openai/v1/chat/completions';

// ✅ FIX: ganti ke model vision yang beneran ada di groq
const GROQ_TEXT_MODEL = 'llama-3.3-70b-versatile';
const GROQ_VISION_MODEL = 'llama-3.2-11b-vision-preview'; // ini yang bener mad

const TIMEOUT_MS = 15_000;

interface AnalysisResult {
  authenticity_score: number;
  is_likely_authentic: boolean;
  summary: string;
  red_flags: string[];
  scam_category_suggestion: string | null;
}

interface TextAnalysisResult {
  risk_level: 'low' | 'medium' | 'high';
  analysis: string;
  suggested_category: string | null;
}

// helper: fetch dengan timeout
async function fetchWithTimeout(
  url: string,
  options: RequestInit,
  timeoutMs: number
): Promise<Response> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    return await fetch(url, { ...options, signal: controller.signal });
  } finally {
    clearTimeout(timer);
  }
}

// helper: parse json dari response groq
function parseGroqJson<T>(content: string): T | null {
  try {
    const cleaned = content.replace(/```json\s*|```/g, '').trim();
    return JSON.parse(cleaned) as T;
  } catch {
    return null;
  }
}

// header reusable
function getGroqHeaders(apiKey: string): Record<string, string> {
  return {
    Authorization: `Bearer ${apiKey}`,
    'Content-Type': 'application/json',
  };
}

/**
 * ✅ analyze screenshot evidence pakai vision model
 */
export async function analyzeEvidenceImage(
  base64Image: string,
  mimeType: string
): Promise<AnalysisResult> {
  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey) throw new Error('groq_api_key is not configured');

  const allowedMimes = ['image/jpeg', 'image/png', 'image/webp'];
  if (!allowedMimes.includes(mimeType)) {
    throw new Error(`unsupported image type: ${mimeType}. use jpg, png, or webp.`);
  }

  const response = await fetchWithTimeout(
    GROQ_API_URL,
    {
      method: 'POST',
      headers: getGroqHeaders(apiKey),
      body: JSON.stringify({
        model: GROQ_VISION_MODEL,
        messages: [
          {
            role: 'system',
            content: `kamu adalah ai forensik digital yang menganalisis bukti screenshot penipuan online di indonesia.
analisis gambar yang diberikan dan tentukan:
1. apakah screenshot terlihat autentik (bukan editan/fabricated)
2. identifikasi red flags penipuan yang terlihat
3. sugesti kategori penipuan

respon harus dalam format json berikut (tanpa markdown, tanpa backticks):
{
  "authenticity_score": <number 0-100>,
  "is_likely_authentic": <boolean>,
  "summary": "<ringkasan singkat dalam bahasa indonesia>",
  "red_flags": ["<flag1>", "<flag2>"],
  "scam_category_suggestion": "<kategori atau null>"
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
                text: 'analisis screenshot bukti penipuan ini. apakah autentik? apa red flags yang terlihat?',
              },
            ],
          },
        ],
        max_tokens: 1024,
        temperature: 0.2,
      }),
    },
    TIMEOUT_MS
  );

  if (!response.ok) {
    const errBody = await response.text();
    console.error('groq vision api error:', response.status, errBody);
    throw new Error(`groq vision api error: ${response.status}`);
  }

  const data = await response.json();
  const content = data.choices?.[0]?.message?.content ?? '';
  const parsed = parseGroqJson<AnalysisResult>(content);

  return parsed ?? {
    authenticity_score: 50,
    is_likely_authentic: false,
    summary: 'gagal memparse hasil analisis ai. silakan coba lagi.',
    red_flags: [],
    scam_category_suggestion: null,
  };
}

/**
 * analyze chronology text for scam patterns
 */
export async function analyzeChronologyText(
  chronology: string
): Promise<TextAnalysisResult> {
  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey) throw new Error('groq_api_key is not configured');

  const trimmedChronology = chronology.slice(0, 2000);

  const response = await fetchWithTimeout(
    GROQ_API_URL,
    {
      method: 'POST',
      headers: getGroqHeaders(apiKey),
      body: JSON.stringify({
        model: GROQ_TEXT_MODEL,
        messages: [
          {
            role: 'system',
            content: `kamu adalah ai yang menganalisis kronologi penipuan online di indonesia.
analisis teks kronologi dan tentukan:
1. tingkat risiko bahwa ini benar-benar penipuan (low/medium/high)
2. analisis singkat pola penipuan yang terdeteksi
3. sugesti kategori penipuan

respon harus dalam format json (tanpa markdown, tanpa backticks):
{
  "risk_level": "low|medium|high",
  "analysis": "<analisis singkat dalam bahasa indonesia>",
  "suggested_category": "<kategori atau null>"
}`,
          },
          {
            role: 'user',
            content: `analisis kronologi penipuan berikut:\n\n"${trimmedChronology}"`,
          },
        ],
        max_tokens: 512,
        temperature: 0.2,
      }),
    },
    TIMEOUT_MS
  );

  if (!response.ok) {
    throw new Error(`groq api error: ${response.status}`);
  }

  const data = await response.json();
  const content = data.choices?.[0]?.message?.content ?? '';
  const parsed = parseGroqJson<TextAnalysisResult>(content);

  return parsed ?? {
    risk_level: 'medium',
    analysis: 'gagal memparse hasil analisis.',
    suggested_category: null,
  };
}