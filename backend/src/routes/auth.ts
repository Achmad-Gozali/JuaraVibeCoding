import { Router } from 'express';
import { verifyRecaptcha } from '../controllers/authController';
import { recaptchaLimiter, loginLimiter, registerLimiter } from '../middleware/rateLimiter';

const router = Router();

// POST /api/auth/verify-recaptcha — dengan deteksi tipe aksi
router.post('/verify-recaptcha', recaptchaLimiter, async (req, res, next) => {
  const { action } = req.body;

  // Terapkan rate limiter berbeda berdasarkan aksi
  if (action === 'login') {
    return loginLimiter(req, res, () => verifyRecaptcha(req, res));
  }
  if (action === 'register') {
    return registerLimiter(req, res, () => verifyRecaptcha(req, res));
  }

  return verifyRecaptcha(req, res);
});

export default router;