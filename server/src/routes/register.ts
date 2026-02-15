// ============================================================
// Register routes — lesson registers with attendance + ATL
// ============================================================

import { Router, Request, Response } from 'express';
import { requireAuth, requireRole } from '../middleware/auth';
import {
  staffLessons, classGroups, students, registerStore,
  behaviourEvents, users, attendanceSummaries,
} from '../data/mockData';
import type { RegisterEntry, RegisterRow, BehaviourEvent, ATLGrade } from '../types';

const router = Router();

router.use(requireAuth);
router.use(requireRole('teacher', 'admin'));

/**
 * GET /api/register/teachers
 * Returns list of all teachers (for the teacher selector dropdown)
 */
router.get('/teachers', (_req: Request, res: Response) => {
  const teachers = users
    .filter((u) => u.role === 'teacher' || u.role === 'admin')
    .map((u) => ({ id: u.id, firstName: u.firstName, lastName: u.lastName }));
  res.json({ data: teachers });
});

/**
 * GET /api/register/timetable?teacherId=xxx&week=A
 * Returns the full weekly timetable for a teacher and week type
 */
router.get('/timetable', (req: Request, res: Response) => {
  const teacherId = (req.query.teacherId as string) || req.user!.userId;
  const week = (req.query.week as string) || 'A';

  const lessons = staffLessons
    .filter((l) => l.teacherId === teacherId && l.week === week)
    .sort((a, b) => {
      const dayOrder = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];
      const dayDiff = dayOrder.indexOf(a.day) - dayOrder.indexOf(b.day);
      return dayDiff !== 0 ? dayDiff : a.period - b.period;
    });

  res.json({ data: lessons });
});

/**
 * GET /api/register/class-attendance/:classGroupId
 * Returns per-student class attendance calculated from saved registers.
 * Each student gets: { studentId, lessons, present, absent, late, classPct }
 *
 * IMPORTANT: This route MUST be defined before /:lessonId/:date to avoid
 * Express matching "class-attendance" as a lessonId parameter.
 */
router.get('/class-attendance/:classGroupId', (req: Request, res: Response) => {
  const { classGroupId } = req.params;

  const classGroup = classGroups.find((c) => c.id === classGroupId);
  if (!classGroup) {
    res.status(404).json({ error: 'Class group not found' });
    return;
  }

  // Find all lesson IDs that belong to this class group
  const classLessonIds = new Set(
    staffLessons.filter((l) => l.classGroupId === classGroupId).map((l) => l.id)
  );

  // Scan the register store for entries matching these lessons
  const studentStats: Record<string, { present: number; absent: number; late: number; total: number }> = {};

  // Initialise all students in the class
  for (const sid of classGroup.studentIds) {
    studentStats[sid] = { present: 0, absent: 0, late: 0, total: 0 };
  }

  for (const [key, entries] of registerStore.entries()) {
    const lessonId = key.split('_')[0];
    if (!classLessonIds.has(lessonId)) continue;

    for (const entry of entries) {
      const stats = studentStats[entry.studentId];
      if (!stats) continue;
      stats.total++;
      if (entry.attendanceCode === '/' || entry.attendanceCode === '\\') {
        stats.present++;
      } else if (entry.attendanceCode === 'L') {
        stats.late++;
      } else if (entry.attendanceCode === 'N') {
        stats.absent++;
      }
    }
  }

  const result = Object.entries(studentStats).map(([studentId, s]) => ({
    studentId,
    lessons: s.total,
    present: s.present,
    absent: s.absent,
    late: s.late,
    classPct: s.total > 0 ? Math.round(((s.present + s.late) / s.total) * 1000) / 10 : null,
  }));

  res.json({ data: result });
});

/**
 * GET /api/register/:lessonId/:date
 * Returns the full register for a lesson instance.
 * Each student row includes their attendance/ATL for this lesson,
 * read-only codes from other lessons today, and today's reward/consequence counts.
 */
router.get('/:lessonId/:date', (req: Request, res: Response) => {
  const { lessonId, date } = req.params;

  // Find the lesson definition
  const lesson = staffLessons.find((l) => l.id === lessonId);
  if (!lesson) {
    res.status(404).json({ error: 'Lesson not found' });
    return;
  }

  // Find the class group
  const classGroup = classGroups.find((c) => c.id === lesson.classGroupId);
  if (!classGroup) {
    res.status(404).json({ error: 'Class group not found' });
    return;
  }

  // Get or create register entries for this lesson instance
  const storeKey = `${lessonId}_${date}`;
  if (!registerStore.has(storeKey)) {
    // Initialise with all students as not present, no ATL
    const entries: RegisterEntry[] = classGroup.studentIds.map((sid) => ({
      studentId: sid,
      attendanceCode: '-',
      atlGrade: null,
    }));
    registerStore.set(storeKey, entries);
  }

  const entries = registerStore.get(storeKey)!;

  // Find all other lessons today for this class group (for read-only context)
  const todayLessons = staffLessons.filter(
    (l) =>
      l.classGroupId === lesson.classGroupId &&
      l.week === lesson.week &&
      l.day === lesson.day &&
      l.id !== lessonId
  );

  // Build rows
  const rows: RegisterRow[] = classGroup.studentIds.map((sid) => {
    const student = students.find((s) => s.id === sid);
    const entry = entries.find((e) => e.studentId === sid) || {
      studentId: sid,
      attendanceCode: '-',
      atlGrade: null,
    };

    // Collect codes from other periods today
    const otherPeriodCodes: Record<number, string> = {};
    const otherPeriodATL: Record<number, ATLGrade | null> = {};

    for (const otherLesson of todayLessons) {
      const otherKey = `${otherLesson.id}_${date}`;
      const otherEntries = registerStore.get(otherKey);
      if (otherEntries) {
        const otherEntry = otherEntries.find((e) => e.studentId === sid);
        if (otherEntry) {
          otherPeriodCodes[otherLesson.period] = otherEntry.attendanceCode;
          otherPeriodATL[otherLesson.period] = otherEntry.atlGrade;
        }
      }
    }

    // Count today's rewards and consequences from behaviour events
    const todayStart = new Date(date).toISOString().split('T')[0];
    const studentEvents = behaviourEvents.filter(
      (e) => e.studentId === sid && e.timestamp.startsWith(todayStart)
    );
    const rewardsToday = studentEvents
      .filter((e) => e.type === 'positive')
      .reduce((sum, e) => sum + e.points, 0);
    const consequencesToday = studentEvents
      .filter((e) => e.type === 'negative')
      .reduce((sum, e) => sum + Math.abs(e.points), 0);

    return {
      studentId: sid,
      firstName: student?.firstName ?? 'Unknown',
      lastName: student?.lastName ?? 'Unknown',
      formGroup: student?.formGroup ?? '',
      attendanceCode: entry.attendanceCode,
      atlGrade: entry.atlGrade,
      otherPeriodCodes,
      otherPeriodATL,
      rewardsToday,
      consequencesToday,
      note: entry.note,
    };
  });

  // Sort alphabetically by surname
  rows.sort((a, b) => a.lastName.localeCompare(b.lastName));

  const teacher = users.find((u) => u.id === lesson.teacherId);

  res.json({
    data: {
      lessonId,
      date,
      classGroupId: lesson.classGroupId,
      classGroupName: lesson.classGroupName,
      subject: lesson.subject,
      room: lesson.room,
      period: lesson.period,
      teacherName: teacher ? `${teacher.firstName} ${teacher.lastName}` : 'Unknown',
      rows,
    },
  });
});

/**
 * POST /api/register/:lessonId/:date
 * Body: { entries: [{ studentId, attendanceCode, atlGrade }] }
 * Saves the register. Returns list of students with ATL != 2 for post-ATL prompt.
 */
router.post('/:lessonId/:date', (req: Request, res: Response) => {
  const { lessonId, date } = req.params;
  const { entries } = req.body as { entries: RegisterEntry[] };

  if (!entries || !Array.isArray(entries)) {
    res.status(400).json({ error: 'entries array is required' });
    return;
  }

  const lesson = staffLessons.find((l) => l.id === lessonId);
  if (!lesson) {
    res.status(404).json({ error: 'Lesson not found' });
    return;
  }

  // Save entries
  const storeKey = `${lessonId}_${date}`;
  registerStore.set(storeKey, entries);

  // Find students who need post-ATL logging (ATL != 2 and not null)
  const needsLogging = entries
    .filter((e) => e.atlGrade !== null && e.atlGrade !== 2)
    .map((e) => {
      const student = students.find((s) => s.id === e.studentId);
      return {
        studentId: e.studentId,
        firstName: student?.firstName ?? 'Unknown',
        lastName: student?.lastName ?? 'Unknown',
        atlGrade: e.atlGrade,
      };
    });

  res.json({ data: { saved: true, needsLogging } });
});

/**
 * POST /api/register/:lessonId/:date/behaviour
 * Body: { events: [{ studentId, atlGrade, category, note }] }
 * Logs the post-ATL behaviour events (rewards and consequences).
 */
router.post('/:lessonId/:date/behaviour', (req: Request, res: Response) => {
  const { events } = req.body as {
    events: Array<{
      studentId: string;
      atlGrade: ATLGrade;
      category: string;
      note: string;
    }>;
  };

  if (!events || !Array.isArray(events)) {
    res.status(400).json({ error: 'events array is required' });
    return;
  }

  const staffUser = users.find((u) => u.id === req.user!.userId);
  const staffName = staffUser ? `${staffUser.firstName} ${staffUser.lastName}` : 'Unknown';

  const created: BehaviourEvent[] = [];

  for (const event of events) {
    const isPositive = event.atlGrade === 1;
    const newEvent: BehaviourEvent = {
      id: `beh-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      studentId: event.studentId,
      type: isPositive ? 'positive' : 'negative',
      category: event.category,
      points: isPositive ? 1 : -(event.atlGrade - 2), // ATL3=-1, ATL4=-2, ATL5=-3
      note: event.note,
      staffName,
      timestamp: new Date().toISOString(),
    };
    behaviourEvents.push(newEvent);
    created.push(newEvent);
  }

  res.status(201).json({ data: created });
});

export default router;
