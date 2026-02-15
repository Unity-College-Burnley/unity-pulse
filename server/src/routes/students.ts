// ============================================================
// Student routes — attendance, behaviour, timetable
// All routes require authentication.
// Parents can only access their own children's data.
// ============================================================

import { Router, Request, Response } from 'express';
import { requireAuth, requireRole } from '../middleware/auth';
import * as wonde from '../services/wondeService';
import { users, attendanceSummaries } from '../data/mockData';

const router = Router();

// All student routes require auth
router.use(requireAuth);

/** Check the requesting parent/student is allowed to view this student */
function parentOwnsStudent(req: Request, studentId: string): boolean {
  if (!req.user) return false;
  if (req.user.role !== 'parent' && req.user.role !== 'student') return true; // staff/admin can view any student
  const user = users.find((u) => u.id === req.user!.userId);
  return user?.studentIds.includes(studentId) ?? false;
}

/**
 * GET /api/students?q=searchTerm
 * Search students by name (staff/admin only)
 */
router.get('/', requireRole('teacher', 'admin'), (req: Request, res: Response) => {
  const q = (req.query.q as string) || '';
  if (!q.trim()) {
    res.json({ data: [] });
    return;
  }

  const results = wonde.searchStudents(q);
  const enriched = results.map((s) => {
    const att = attendanceSummaries.find((a) => a.studentId === s.id);
    return {
      ...s,
      overallPercentage: att?.overallPercentage ?? null,
      presentToday: att?.presentToday ?? null,
    };
  });

  res.json({ data: enriched });
});

/**
 * GET /api/students/:id
 * Returns the student profile
 */
router.get('/:id', (req: Request, res: Response) => {
  const { id } = req.params;

  if (!parentOwnsStudent(req, id)) {
    res.status(403).json({ error: 'You do not have permission to view this student' });
    return;
  }

  const student = wonde.getStudent(id);
  if (!student) {
    res.status(404).json({ error: 'Student not found' });
    return;
  }

  res.json({ data: student });
});

/**
 * GET /api/students/:id/attendance
 * Returns attendance summary and recent records
 */
router.get('/:id/attendance', (req: Request, res: Response) => {
  const { id } = req.params;

  if (!parentOwnsStudent(req, id)) {
    res.status(403).json({ error: 'You do not have permission to view this student' });
    return;
  }

  const attendance = wonde.getAttendance(id);
  if (!attendance) {
    res.status(404).json({ error: 'Attendance data not found' });
    return;
  }

  res.json({ data: attendance });
});

/**
 * GET /api/students/:id/behaviour
 * Returns behaviour events, most recent first
 */
router.get('/:id/behaviour', (req: Request, res: Response) => {
  const { id } = req.params;

  if (!parentOwnsStudent(req, id)) {
    res.status(403).json({ error: 'You do not have permission to view this student' });
    return;
  }

  const events = wonde.getBehaviour(id);
  res.json({ data: events });
});

/**
 * GET /api/students/:id/timetable
 * Returns the full weekly timetable (or filter by ?day=Monday)
 */
router.get('/:id/timetable', (req: Request, res: Response) => {
  const { id } = req.params;
  const day = req.query.day as string | undefined;

  if (!parentOwnsStudent(req, id)) {
    res.status(403).json({ error: 'You do not have permission to view this student' });
    return;
  }

  if (day) {
    const lessons = wonde.getTimetableForDay(id, day as any);
    res.json({ data: lessons });
    return;
  }

  const lessons = wonde.getTimetable(id);
  res.json({ data: lessons });
});

/**
 * GET /api/students/:id/classes
 * Returns all class groups a student belongs to, enriched with teacher name
 */
router.get('/:id/classes', (req: Request, res: Response) => {
  const { id } = req.params;

  if (!parentOwnsStudent(req, id)) {
    res.status(403).json({ error: 'You do not have permission to view this student' });
    return;
  }

  const groups = wonde.getClassGroupsByStudent(id);
  const enriched = groups.map((g) => {
    const teacher = users.find((u) => u.id === g.teacherId);
    return {
      ...g,
      teacherName: teacher ? `${teacher.firstName} ${teacher.lastName}` : 'Unknown',
    };
  });

  res.json({ data: enriched });
});

/**
 * GET /api/students/:id/contacts
 * Returns parent/guardian contacts for a student (staff/admin only)
 */
router.get('/:id/contacts', requireRole('teacher', 'admin'), (req: Request, res: Response) => {
  const { id } = req.params;

  const contacts = users
    .filter((u) => u.role === 'parent' && u.studentIds.includes(id))
    .map((u) => ({
      id: u.id,
      firstName: u.firstName,
      lastName: u.lastName,
      email: u.email,
      relationship: 'Parent/Guardian',
    }));

  res.json({ data: contacts });
});

export default router;
