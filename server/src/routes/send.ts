// ============================================================
// SEND routes — student plans, pen portraits, EHCPs
// Read-only for teachers; data managed by SENCO
// ============================================================

import { Router, Request, Response } from 'express';
import { requireAuth, requireRole } from '../middleware/auth';
import { classGroups, studentPlans } from '../data/mockData';

const router = Router();

router.use(requireAuth);
router.use(requireRole('teacher', 'admin'));

/**
 * GET /api/send/class/:classGroupId
 * Returns all student plans for students in the given class group.
 */
router.get('/class/:classGroupId', (req: Request, res: Response) => {
  const { classGroupId } = req.params;

  const classGroup = classGroups.find((c) => c.id === classGroupId);
  if (!classGroup) {
    res.status(404).json({ error: 'Class group not found' });
    return;
  }

  const plans = studentPlans.filter((p) =>
    classGroup.studentIds.includes(p.studentId)
  );

  res.json({ data: plans });
});

export default router;
