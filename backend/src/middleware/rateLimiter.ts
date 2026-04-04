import rateLimit from 'express-rate-limit';

// Rate limit umum — semua endpoint
export const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 menit
  max: 100,
  message: { success: false, message: 'Terlalu banyak request. Coba lagi dalam 15 menit.' },
  standardHeaders: true,
  legacyHeaders: false,
});

// Rate limit ketat — submit laporan
export const reportLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 jam
  max: 10,
  message: { success: false, message: 'Batas pengiriman laporan tercapai. Coba lagi dalam 1 jam.' },
  standardHeaders: true,
  legacyHeaders: false,
});

// Rate limit upload file
export const uploadLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 jam
  max: 20,
  message: { success: false, message: 'Batas upload file tercapai. Coba lagi dalam 1 jam.' },
  standardHeaders: true,
  legacyHeaders: false,
});

// Rate limit verify recaptcha
export const recaptchaLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 menit
  max: 5,
  message: { success: false, message: 'Terlalu banyak percobaan. Coba lagi dalam 1 menit.' },
  standardHeaders: true,
  legacyHeaders: false,
});

// Rate limit login — max 5 percobaan per 15 menit per IP
// Mencegah brute force attack
export const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 menit
  max: 5,
  message: {
    success: false,
    message: 'Terlalu banyak percobaan masuk. Akun sementara dikunci selama 15 menit demi keamanan.',
  },
  standardHeaders: true,
  legacyHeaders: false,
  skipSuccessfulRequests: true, // hanya hitung request yang gagal
});

// Rate limit register — max 3 akun per jam per IP
// Mencegah pembuatan akun massal
export const registerLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 jam
  max: 3,
  message: {
    success: false,
    message: 'Terlalu banyak percobaan pendaftaran. Coba lagi dalam 1 jam.',
  },
  standardHeaders: true,
  legacyHeaders: false,
});