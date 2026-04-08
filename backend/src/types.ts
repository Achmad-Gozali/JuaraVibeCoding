export interface Env {
  DATABASE_URL: string;
  SUPABASE_URL: string;
  SUPABASE_SERVICE_ROLE_KEY: string;
  SUPABASE_ANON_KEY: string;        // ← tambah
  RECAPTCHA_SECRET_KEY: string;     // ← tambah
  GROQ_API_KEY: string;
  TURNSTILE_SECRET_KEY: string;
  FRONTEND_URL: string;
  NODE_ENV: string;

  // Definisi Cloudflare KV
  LIMITER: KVNamespace;
}