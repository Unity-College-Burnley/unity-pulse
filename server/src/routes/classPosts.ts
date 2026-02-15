// ============================================================
// Class Posts routes — one-way teacher notices to a class
// ============================================================

import { Router, Request, Response } from 'express';
import { requireAuth, requireRole } from '../middleware/auth';
import { classPosts, classGroups, users } from '../data/mockData';
import type { ClassPost } from '../types';

const router = Router();

router.use(requireAuth);

/**
 * GET /api/class-posts/class/:classGroupId
 * Returns all posts for a class group (teacher/admin only)
 */
router.get('/class/:classGroupId', requireRole('teacher', 'admin'), (req: Request, res: Response) => {
  const posts = classPosts
    .filter((p) => p.classGroupId === req.params.classGroupId)
    .sort((a, b) => new Date(b.postedAt).getTime() - new Date(a.postedAt).getTime());

  res.json({ data: posts });
});

/**
 * POST /api/class-posts
 * Body: { classGroupId, body }
 * Creates a new class post (teacher/admin only)
 */
router.post('/', requireRole('teacher', 'admin'), (req: Request, res: Response) => {
  const { classGroupId, body } = req.body;

  if (!classGroupId || !body?.trim()) {
    res.status(400).json({ error: 'classGroupId and body are required' });
    return;
  }

  const classGroup = classGroups.find((c) => c.id === classGroupId);
  if (!classGroup) {
    res.status(404).json({ error: 'Class group not found' });
    return;
  }

  const author = users.find((u) => u.id === req.user!.userId);
  const authorName = author ? `${author.firstName} ${author.lastName}` : 'Unknown';

  const post: ClassPost = {
    id: `cp-${Date.now()}`,
    classGroupId,
    classGroupName: classGroup.name,
    subject: classGroup.subject,
    authorId: req.user!.userId,
    authorName,
    body: body.trim(),
    postedAt: new Date().toISOString(),
  };

  classPosts.push(post);
  res.status(201).json({ data: post });
});

/**
 * DELETE /api/class-posts/:postId
 * Deletes a class post (teacher/admin only)
 */
router.delete('/:postId', requireRole('teacher', 'admin'), (req: Request, res: Response) => {
  const idx = classPosts.findIndex((p) => p.id === req.params.postId);
  if (idx === -1) {
    res.status(404).json({ error: 'Post not found' });
    return;
  }
  classPosts.splice(idx, 1);
  res.json({ data: { deleted: true } });
});

/**
 * GET /api/class-posts/student/:studentId
 * Returns all class posts for a student's class groups.
 * Accessible by: student (own), parent (own child), teacher, admin.
 */
router.get('/student/:studentId', (req: Request, res: Response) => {
  const { studentId } = req.params;
  const user = req.user!;

  // Ownership check for parent/student
  if (user.role === 'parent' || user.role === 'student') {
    const userRecord = users.find((u) => u.id === user.userId);
    if (!userRecord || !userRecord.studentIds.includes(studentId)) {
      res.status(403).json({ error: 'Not authorized to view this student' });
      return;
    }
  }

  // Find all class groups this student belongs to
  const studentClassIds = classGroups
    .filter((c) => c.studentIds.includes(studentId))
    .map((c) => c.id);

  const posts = classPosts
    .filter((p) => studentClassIds.includes(p.classGroupId))
    .sort((a, b) => new Date(b.postedAt).getTime() - new Date(a.postedAt).getTime());

  res.json({ data: posts });
});

export default router;
