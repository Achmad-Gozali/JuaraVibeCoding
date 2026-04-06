import { Router } from 'express';
import { verifyRecaptcha, loginWithPassword } from '../controllers/authController';

const router = Router();

router.post('/verify-recaptcha', verifyRecaptcha);
router.post('/login', loginWithPassword);

export default router;