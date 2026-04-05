import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import dotenv from 'dotenv';
import { generalLimiter } from './middleware/rateLimiter';
import reportRoutes from './routes/reports';
import adminRoutes from './routes/admin';
import authRoutes from './routes/auth';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// ── SECURITY ──────────────────────────────────────────────────────────────────
app.use(helmet());
app.use(cors({
  origin: [
    'http://localhost:3000', 
    'http://127.0.0.1:3000', 
    'https://kawaltransaksi.vercel.app', // Link Vercel lu
    process.env.FRONTEND_URL || ''
  ].filter(Boolean),
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'], // Tambahin OPTIONS biar aman
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true,
}));

// ── BODY PARSER ───────────────────────────────────────────────────────────────
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// ── RATE LIMITER GLOBAL ───────────────────────────────────────────────────────
app.use(generalLimiter);

// ── HEALTH CHECK ──────────────────────────────────────────────────────────────
app.get('/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// ── ROUTES ────────────────────────────────────────────────────────────────────
app.use('/api/reports', reportRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/auth', authRoutes);

// ── 404 ───────────────────────────────────────────────────────────────────────
app.use((_req, res) => {
  res.status(404).json({ success: false, message: 'Endpoint tidak ditemukan.' });
});

// ── ERROR HANDLER ─────────────────────────────────────────────────────────────
app.use((err: Error, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  console.error('[ERROR]:', err.message);
  res.status(500).json({ success: false, message: 'Terjadi kesalahan server.' });
});

// ── START ─────────────────────────────────────────────────────────────────────
app.listen(PORT, () => {
  console.log(`Backend jalan di http://localhost:${PORT}`);
  console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
});

export default app;