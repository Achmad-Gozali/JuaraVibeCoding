import { Hono } from 'hono';
import { cors } from 'hono/cors';
import authRoutes from './routes/auth';
import reportsRoutes from './routes/reports';
import adminRoutes from './routes/admin';

// ── Type untuk environment variables ─────────────────────────────────────────
declare global {
  interface Env {
    SUPABASE_URL: string;
    SUPABASE_ANON_KEY: string;
    SUPABASE_SERVICE_ROLE_KEY: string;
    GROQ_API_KEY: string;
    RECAPTCHA_SECRET_KEY: string;
    FRONTEND_URL: string;
  }
}

const app = new Hono<{ Bindings: Env }>();

// ── CORS ──────────────────────────────────────────────────────────────────────
app.use('*', cors({
  origin: (origin) => {
    const allowed = [
      'http://localhost:3000',
      'http://127.0.0.1:3000',
    ];
    // Allow semua subdomain kawaltransaksi di Cloudflare Pages
    if (origin?.includes('kawaltransaksi') || allowed.includes(origin ?? '')) {
      return origin;
    }
    return null;
  },
  allowMethods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowHeaders: ['Content-Type', 'Authorization'],
  credentials: true,
}));

// ── Health check ──────────────────────────────────────────────────────────────
app.get('/health', (c) => c.json({ status: 'ok', timestamp: new Date().toISOString() }));

// ── Routes ────────────────────────────────────────────────────────────────────
app.route('/api/auth', authRoutes);
app.route('/api/reports', reportsRoutes);
app.route('/api/admin', adminRoutes);

// ── 404 ───────────────────────────────────────────────────────────────────────
app.notFound((c) => c.json({ success: false, message: 'Endpoint tidak ditemukan.' }, 404));

// ── Error handler ─────────────────────────────────────────────────────────────
app.onError((err, c) => {
  console.error('[ERROR]:', err.message);
  return c.json({ success: false, message: 'Terjadi kesalahan server.' }, 500);
});

export default app;