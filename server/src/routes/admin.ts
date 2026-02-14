// ============================================================
// Admin routes — senior leadership dashboard endpoints
// All routes require admin role.
// ============================================================

import { Router, Request, Response } from 'express';
import { requireAuth, requireRole } from '../middleware/auth';
import { students, attendanceSummaries, behaviourEvents, announcements } from '../data/mockData';
import type { Announcement } from '../types';

const router = Router();

router.use(requireAuth);
router.use(requireRole('admin'));

/**
 * GET /api/admin/attendance-overview
 * Returns whole-school attendance summary
 */
router.get('/attendance-overview', (_req: Request, res: Response) => {
  const total = attendanceSummaries.length;
  const presentToday = attendanceSummaries.filter((a) => a.presentToday).length;
  const absentToday = total - presentToday;

  // Average overall attendance across all students
  const avgAttendance = total > 0
    ? Math.round((attendanceSummaries.reduce((sum, a) => sum + a.overallPercentage, 0) / total) * 10) / 10
    : 0;

  // Students below 90% threshold
  const belowThreshold = attendanceSummaries
    .filter((a) => a.overallPercentage < 90)
    .map((a) => {
      const student = students.find((s) => s.id === a.studentId);
      return {
        studentId: a.studentId,
        studentName: student ? `${student.firstName} ${student.lastName}` : 'Unknown',
        yearGroup: student?.yearGroup ?? 0,
        formGroup: student?.formGroup ?? '',
        percentage: a.overallPercentage,
      };
    })
    .sort((a, b) => a.percentage - b.percentage);

  // Attendance by year group
  const yearGroups = [...new Set(students.map((s) => s.yearGroup))].sort();
  const byYearGroup = yearGroups.map((yg) => {
    const ygStudentIds = students.filter((s) => s.yearGroup === yg).map((s) => s.id);
    const ygSummaries = attendanceSummaries.filter((a) => ygStudentIds.includes(a.studentId));
    const ygPresent = ygSummaries.filter((a) => a.presentToday).length;
    const ygAvg = ygSummaries.length > 0
      ? Math.round((ygSummaries.reduce((sum, a) => sum + a.overallPercentage, 0) / ygSummaries.length) * 10) / 10
      : 0;

    return {
      yearGroup: yg,
      totalStudents: ygSummaries.length,
      presentToday: ygPresent,
      absentToday: ygSummaries.length - ygPresent,
      averageAttendance: ygAvg,
    };
  });

  res.json({
    data: {
      totalStudents: total,
      presentToday,
      absentToday,
      averageAttendance: avgAttendance,
      belowThreshold,
      byYearGroup,
    },
  });
});

/**
 * GET /api/admin/behaviour-overview
 * Returns whole-school behaviour summary
 */
router.get('/behaviour-overview', (_req: Request, res: Response) => {
  const totalPositive = behaviourEvents.filter((e) => e.type === 'positive').length;
  const totalNegative = behaviourEvents.filter((e) => e.type === 'negative').length;
  const totalPositivePoints = behaviourEvents
    .filter((e) => e.type === 'positive')
    .reduce((sum, e) => sum + e.points, 0);
  const totalNegativePoints = behaviourEvents
    .filter((e) => e.type === 'negative')
    .reduce((sum, e) => sum + Math.abs(e.points), 0);

  // Most common categories
  const categoryCounts = new Map<string, number>();
  for (const event of behaviourEvents) {
    categoryCounts.set(event.category, (categoryCounts.get(event.category) ?? 0) + 1);
  }
  const topCategories = Array.from(categoryCounts.entries())
    .map(([category, count]) => ({ category, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 5);

  // Recent events
  const recentEvents = [...behaviourEvents]
    .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
    .slice(0, 10)
    .map((e) => {
      const student = students.find((s) => s.id === e.studentId);
      return {
        ...e,
        studentName: student ? `${student.firstName} ${student.lastName}` : 'Unknown',
      };
    });

  res.json({
    data: {
      totalPositive,
      totalNegative,
      totalPositivePoints,
      totalNegativePoints,
      topCategories,
      recentEvents,
    },
  });
});

/**
 * POST /api/admin/announcements
 * Body: { title, body, pinned }
 * Creates a new announcement
 */
router.post('/announcements', (req: Request, res: Response) => {
  const { title, body, pinned } = req.body;

  if (!title || !body) {
    res.status(400).json({ error: 'Title and body are required' });
    return;
  }

  // Look up the admin's name
  const newAnnouncement: Announcement = {
    id: `ann-${Date.now()}`,
    title,
    body,
    author: 'Mrs Carter', // In production, look up from user record
    publishedAt: new Date().toISOString(),
    pinned: pinned ?? false,
  };

  announcements.push(newAnnouncement);

  res.status(201).json({ data: newAnnouncement });
});

/**
 * DELETE /api/admin/announcements/:id
 * Removes an announcement
 */
router.delete('/announcements/:id', (req: Request, res: Response) => {
  const { id } = req.params;
  const index = announcements.findIndex((a) => a.id === id);

  if (index === -1) {
    res.status(404).json({ error: 'Announcement not found' });
    return;
  }

  announcements.splice(index, 1);
  res.json({ data: { success: true } });
});

export default router;
