import { Request, Response, NextFunction } from 'express';
import { getUserFromToken, getUserRole } from '../lib/supabase';

declare global {
  namespace Express {
    interface Request {
      user?: { id: string; email?: string };
      userRole?: string;
    }
  }
}

// Wajib login
export async function requireAuth(req: Request, res: Response, next: NextFunction) {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      res.status(401).json({ success: false, message: 'Token tidak ditemukan.' });
      return;
    }

    const token = authHeader.split(' ')[1];
    const user = await getUserFromToken(token);

    if (!user) {
      res.status(401).json({ success: false, message: 'Token tidak valid atau sudah expired.' });
      return;
    }

    req.user = { id: user.id, email: user.email };
    next();
  } catch {
    res.status(500).json({ success: false, message: 'Terjadi kesalahan autentikasi.' });
  }
}

// Wajib admin atau moderator
export async function requireAdmin(req: Request, res: Response, next: NextFunction) {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      res.status(401).json({ success: false, message: 'Token tidak ditemukan.' });
      return;
    }

    const token = authHeader.split(' ')[1];
    const user = await getUserFromToken(token);

    if (!user) {
      res.status(401).json({ success: false, message: 'Token tidak valid.' });
      return;
    }

    const role = await getUserRole(user.id);
    if (!role || !['admin', 'moderator'].includes(role)) {
      res.status(403).json({ success: false, message: 'Akses ditolak.' });
      return;
    }

    req.user = { id: user.id, email: user.email };
    req.userRole = role;
    next();
  } catch {
    res.status(500).json({ success: false, message: 'Terjadi kesalahan autentikasi.' });
  }
}

// Wajib admin only
export async function requireAdminOnly(req: Request, res: Response, next: NextFunction) {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      res.status(401).json({ success: false, message: 'Token tidak ditemukan.' });
      return;
    }

    const token = authHeader.split(' ')[1];
    const user = await getUserFromToken(token);

    if (!user) {
      res.status(401).json({ success: false, message: 'Token tidak valid.' });
      return;
    }

    const role = await getUserRole(user.id);
    if (role !== 'admin') {
      res.status(403).json({ success: false, message: 'Hanya admin yang bisa mengakses.' });
      return;
    }

    req.user = { id: user.id, email: user.email };
    req.userRole = role;
    next();
  } catch {
    res.status(500).json({ success: false, message: 'Terjadi kesalahan autentikasi.' });
  }
}