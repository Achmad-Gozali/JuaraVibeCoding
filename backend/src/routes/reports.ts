import { Router } from 'express';
import multer from 'multer';
import {
  submitReport,
  uploadEvidence,
  analyzeEvidence,
  analyzeChronology,
  withdrawReport,
  editReport,
} from '../controllers/reportController';
import { requireAuth } from '../middleware/authMiddleware';
import { reportLimiter, uploadLimiter } from '../middleware/rateLimiter';

const router = Router();

const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB — validasi kedua ada di controller
    files: 1,
  },
  fileFilter: (_req, file, cb) => {
    // Hanya izinkan JPEG dan PNG — webp dihapus
    const allowed = ['image/jpeg', 'image/png'];
    if (allowed.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Tipe file tidak didukung. Hanya JPEG dan PNG yang diizinkan.'));
    }
  },
});

// POST /api/reports — submit laporan baru
router.post('/', requireAuth, reportLimiter, submitReport);

// POST /api/reports/upload — upload bukti foto
router.post('/upload', requireAuth, uploadLimiter, upload.single('file'), uploadEvidence);

// POST /api/reports/analyze/image — analisis gambar dengan AI
router.post('/analyze/image', requireAuth, upload.single('file'), analyzeEvidence);

// POST /api/reports/analyze/text — analisis kronologi dengan AI
router.post('/analyze/text', requireAuth, analyzeChronology);

// POST /api/reports/withdraw — tarik laporan
router.post('/withdraw', requireAuth, withdrawReport);

// PUT /api/reports/:reportId — edit laporan
router.put('/:reportId', requireAuth, editReport);

export default router;