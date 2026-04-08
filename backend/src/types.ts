export interface Env {
  DATABASE_URL: string;
  SUPABASE_URL: string;
  SUPABASE_SERVICE_ROLE_KEY: string;
  GROQ_API_KEY: string;
  TURNSTILE_SECRET_KEY: string;
  FRONTEND_URL: string;
  NODE_ENV: string;
  
  // Definisi Cloudflare KV
  LIMITER: KVNamespace; 
}