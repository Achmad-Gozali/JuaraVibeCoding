import { Router } from 'express';
import {
  getReports,
  getStats,
  updateReportStatus,
  getUsers,
  updateUserRole,
  banUser,
  unbanUser,
  checkBanned,
} from '../controllers/adminController';
import { requireAdmin, requireAdminOnly } from '../middleware/authMiddleware';

const router = Router();

// ── Reports ───────────────────────────────────────────────────────────────────
router.get('/reports', requireAdmin, getReports);
router.get('/stats', requireAdmin, getStats);
router.patch('/reports/:reportId/status', requireAdmin, updateReportStatus);

// ── Users ─────────────────────────────────────────────────────────────────────
router.get('/users', requireAdmin, getUsers);
router.patch('/users/:userId/role', requireAdminOnly, updateUserRole);
router.patch('/users/:userId/ban', requireAdminOnly, banUser);
router.patch('/users/:userId/unban', requireAdminOnly, unbanUser);

// ── Public (dipanggil setelah login untuk cek banned) ─────────────────────────
router.get('/users/:userId/banned', checkBanned);

export default router;