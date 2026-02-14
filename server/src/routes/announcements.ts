// ============================================================
// Announcements routes
// ============================================================

import { Router, Request, Response } from 'express';
import { requireAuth } from '../middleware/auth';
import { announcements } from '../data/mockData';

const router = Router();

router.use(requireAuth);

/**
 * GET /api/announcements
 * Returns all announcements, pinned first then by date (newest first)
 */
router.get('/', (_req: Request, res: Response) => {
  const sorted = [...announcements].sort((a, b) => {
    // Pinned items first
    if (a.pinned && !b.pinned) return -1;
    if (!a.pinned && b.pinned) return 1;
    // Then by date, newest first
    return new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime();
  });

  res.json({ data: sorted });
});

export default router;
