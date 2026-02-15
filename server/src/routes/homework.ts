// ============================================================
// Homework routes — CRUD for homework + completion tracking
// ============================================================

import { Router, Request, Response } from 'express';
import { requireAuth, requireRole } from '../middleware/auth';
import { users, classGroups, students, homeworks, homeworkCompletions } from '../data/mockData';
import type { Homework, HomeworkCompletion } from '../types';

const router = Router();

router.use(requireAuth);

/**
 * GET /api/homework/class/:classGroupId
 * List homework for a class (teacher/admin)
 */
router.get('/class/:classGroupId', requireRole('teacher', 'admin'), (req: Request, res: Response) => {
  const { classGroupId } = req.params;
  const list = homeworks.filter((h) => h.classGroupId === classGroupId);

  const enriched = list.map((h) => {
    const group = classGroups.find((c) => c.id === h.classGroupId);
    const totalStudents = group?.studentIds.length ?? 0;
    const completedCount = homeworkCompletions.filter((c) => c.homeworkId === h.id).length;
    return { ...h, totalStudents, completedCount };
  });

  res.json({ data: enriched });
});

/**
 * POST /api/homework
 * Create homework (teacher/admin)
 */
router.post('/', requireRole('teacher', 'admin'), (req: Request, res: Response) => {
  const { classGroupId, title, description, dueDate, links } = req.body;

  if (!classGroupId || !title || !description || !dueDate) {
    res.status(400).json({ error: 'classGroupId, title, description, and dueDate are required' });
    return;
  }

  const group = classGroups.find((c) => c.id === classGroupId);
  if (!group) {
    res.status(404).json({ error: 'Class group not found' });
    return;
  }

  const teacher = users.find((u) => u.id === req.user!.userId);
  const teacherName = teacher ? `${teacher.firstName} ${teacher.lastName}` : 'Unknown';

  const newHomework: Homework = {
    id: `hw-${Date.now()}`,
    classGroupId,
    title,
    description,
    dueDate,
    issuedDate: new Date().toISOString().split('T')[0],
    teacherId: req.user!.userId,
    teacherName,
    links: links?.length ? links : undefined,
  };

  homeworks.push(newHomework);
  res.status(201).json({ data: newHomework });
});

/**
 * DELETE /api/homework/:homeworkId
 * Delete homework + its completions (teacher/admin)
 */
router.delete('/:homeworkId', requireRole('teacher', 'admin'), (req: Request, res: Response) => {
  const { homeworkId } = req.params;
  const index = homeworks.findIndex((h) => h.id === homeworkId);

  if (index === -1) {
    res.status(404).json({ error: 'Homework not found' });
    return;
  }

  homeworks.splice(index, 1);

  // Remove associated completions
  for (let i = homeworkCompletions.length - 1; i >= 0; i--) {
    if (homeworkCompletions[i].homeworkId === homeworkId) {
      homeworkCompletions.splice(i, 1);
    }
  }

  res.json({ data: { success: true } });
});

/**
 * GET /api/homework/:homeworkId/completions
 * Student completion grid for one homework (teacher/admin)
 */
router.get('/:homeworkId/completions', requireRole('teacher', 'admin'), (req: Request, res: Response) => {
  const { homeworkId } = req.params;
  const homework = homeworks.find((h) => h.id === homeworkId);

  if (!homework) {
    res.status(404).json({ error: 'Homework not found' });
    return;
  }

  const group = classGroups.find((c) => c.id === homework.classGroupId);
  if (!group) {
    res.status(404).json({ error: 'Class group not found' });
    return;
  }

  const completions = homeworkCompletions.filter((c) => c.homeworkId === homeworkId);

  const studentList = group.studentIds.map((sid) => {
    const student = students.find((s) => s.id === sid);
    const completion = completions.find((c) => c.studentId === sid);
    return {
      studentId: sid,
      firstName: student?.firstName ?? 'Unknown',
      lastName: student?.lastName ?? 'Unknown',
      completed: !!completion,
      completedAt: completion?.completedAt ?? null,
    };
  });

  studentList.sort((a, b) => a.lastName.localeCompare(b.lastName));

  res.json({ data: studentList });
});

/**
 * POST /api/homework/:homeworkId/completions
 * Toggle completion for students (teacher/admin)
 * Body: { studentIds: string[] }
 */
router.post('/:homeworkId/completions', requireRole('teacher', 'admin'), (req: Request, res: Response) => {
  const { homeworkId } = req.params;
  const { studentIds } = req.body;

  if (!studentIds || !Array.isArray(studentIds)) {
    res.status(400).json({ error: 'studentIds array is required' });
    return;
  }

  const homework = homeworks.find((h) => h.id === homeworkId);
  if (!homework) {
    res.status(404).json({ error: 'Homework not found' });
    return;
  }

  for (const sid of studentIds) {
    const existingIndex = homeworkCompletions.findIndex(
      (c) => c.homeworkId === homeworkId && c.studentId === sid
    );

    if (existingIndex >= 0) {
      // Toggle off — remove completion
      homeworkCompletions.splice(existingIndex, 1);
    } else {
      // Toggle on — add completion
      homeworkCompletions.push({
        homeworkId,
        studentId: sid,
        completedAt: new Date().toISOString(),
        markedBy: req.user!.userId,
      });
    }
  }

  res.json({ data: { success: true } });
});

/**
 * GET /api/homework/student/:studentId
 * All homework for a student with completion status
 * (student own, parent own child, staff, admin)
 */
router.get('/student/:studentId', (req: Request, res: Response) => {
  const { studentId } = req.params;

  // Access control: students/parents can only see their own data
  if (req.user!.role === 'parent' || req.user!.role === 'student') {
    const user = users.find((u) => u.id === req.user!.userId);
    if (!user?.studentIds.includes(studentId)) {
      res.status(403).json({ error: 'You do not have permission to view this student' });
      return;
    }
  }

  // Find all class groups this student belongs to
  const studentGroups = classGroups.filter((c) => c.studentIds.includes(studentId));
  const groupIds = new Set(studentGroups.map((g) => g.id));

  // Get all homework for those class groups
  const studentHomework = homeworks.filter((h) => groupIds.has(h.classGroupId));

  const enriched = studentHomework.map((h) => {
    const group = classGroups.find((c) => c.id === h.classGroupId);
    const completion = homeworkCompletions.find(
      (c) => c.homeworkId === h.id && c.studentId === studentId
    );
    return {
      ...h,
      subject: group?.subject ?? 'Unknown',
      className: group?.name ?? 'Unknown',
      completed: !!completion,
      completedAt: completion?.completedAt,
    };
  });

  // Sort: incomplete first by due date, then completed
  enriched.sort((a, b) => {
    if (a.completed !== b.completed) return a.completed ? 1 : -1;
    return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
  });

  res.json({ data: enriched });
});

export default router;
