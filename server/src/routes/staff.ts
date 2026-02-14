// ============================================================
// Staff routes — teacher dashboard endpoints
// All routes require authentication with teacher or admin role.
// ============================================================

import { Router, Request, Response } from 'express';
import { requireAuth, requireRole } from '../middleware/auth';
import * as wonde from '../services/wondeService';
import { behaviourEvents, users, attendanceSummaries } from '../data/mockData';
import type { BehaviourEvent } from '../types';

const router = Router();

router.use(requireAuth);
router.use(requireRole('teacher', 'admin'));

/**
 * GET /api/staff/classes
 * Returns all class groups taught by the logged-in teacher
 */
router.get('/classes', (req: Request, res: Response) => {
  const classes = wonde.getClassGroupsByTeacher(req.user!.userId);
  res.json({ data: classes });
});

/**
 * GET /api/staff/classes/:id/students
 * Returns all students in a class group, with attendance status
 * and their parent's user ID (for messaging).
 */
router.get('/classes/:id/students', (req: Request, res: Response) => {
  const students = wonde.getStudentsByClassGroup(req.params.id);

  const enriched = students.map((s) => {
    // Find the parent linked to this student
    const parent = users.find(
      (u) => u.role === 'parent' && u.studentIds.includes(s.id)
    );
    // Find attendance summary
    const attendance = attendanceSummaries.find((a) => a.studentId === s.id);

    return {
      ...s,
      presentToday: attendance?.presentToday ?? null,
      overallAttendance: attendance?.overallPercentage ?? null,
      parentUserId: parent?.id ?? null,
      parentName: parent ? `${parent.firstName} ${parent.lastName}` : null,
    };
  });

  res.json({ data: enriched });
});

/**
 * GET /api/staff/classes/:id/attendance
 * Returns today's attendance overview for a class group
 */
router.get('/classes/:id/attendance', (req: Request, res: Response) => {
  const overview = wonde.getClassAttendanceOverview(req.params.id);
  if (!overview) {
    res.status(404).json({ error: 'Class group not found' });
    return;
  }
  res.json({ data: overview });
});

/**
 * GET /api/staff/timetable
 * Returns the teacher's full timetable, or filter by ?day=Monday
 */
router.get('/timetable', (req: Request, res: Response) => {
  const day = req.query.day as string | undefined;

  if (day) {
    const lessons = wonde.getStaffLessonsForDay(req.user!.userId, day as any);
    res.json({ data: lessons });
    return;
  }

  const lessons = wonde.getStaffLessons(req.user!.userId);
  res.json({ data: lessons });
});

/**
 * POST /api/staff/behaviour
 * Body: { studentId, type, category, points, note }
 * Logs a new behaviour event
 */
router.post('/behaviour', (req: Request, res: Response) => {
  const { studentId, type, category, points, note } = req.body;

  if (!studentId || !type || !category || points === undefined || !note) {
    res.status(400).json({ error: 'All fields are required: studentId, type, category, points, note' });
    return;
  }

  if (type !== 'positive' && type !== 'negative') {
    res.status(400).json({ error: 'Type must be "positive" or "negative"' });
    return;
  }

  const student = wonde.getStudent(studentId);
  if (!student) {
    res.status(404).json({ error: 'Student not found' });
    return;
  }

  // Build the staff display name from the logged-in user
  const staffName = `Mr Wilson`; // In production, look up from user record

  const newEvent: BehaviourEvent = {
    id: `beh-${Date.now()}`,
    studentId,
    type,
    category,
    points: type === 'negative' ? -Math.abs(points) : Math.abs(points),
    note,
    staffName,
    timestamp: new Date().toISOString(),
  };

  // In production this would be a database insert
  behaviourEvents.push(newEvent);

  res.status(201).json({ data: newEvent });
});

export default router;
