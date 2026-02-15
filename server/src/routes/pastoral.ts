// ============================================================
// Pastoral routes — log and view pastoral notes per student
// Staff/admin only.
// ============================================================

import { Router, Request, Response } from 'express';
import { requireAuth, requireRole } from '../middleware/auth';
import { pastoralNotes, users } from '../data/mockData';
import * as wonde from '../services/wondeService';
import type { PastoralNote } from '../types';

const router = Router();

router.use(requireAuth);
router.use(requireRole('teacher', 'admin'));

/**
 * GET /api/pastoral/student/:studentId
 * Returns all pastoral notes for a student, newest first.
 */
router.get('/student/:studentId', (req: Request, res: Response) => {
  const { studentId } = req.params;

  const student = wonde.getStudent(studentId);
  if (!student) {
    res.status(404).json({ error: 'Student not found' });
    return;
  }

  const notes = pastoralNotes
    .filter((n) => n.studentId === studentId)
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  res.json({ data: notes });
});

/**
 * POST /api/pastoral
 * Body: { studentId, category, severity, title, body }
 * Creates a new pastoral note.
 */
router.post('/', (req: Request, res: Response) => {
  const { studentId, category, severity, title, body } = req.body;

  if (!studentId || !category || !severity || !title || !body?.trim()) {
    res.status(400).json({ error: 'studentId, category, severity, title and body are required' });
    return;
  }

  const student = wonde.getStudent(studentId);
  if (!student) {
    res.status(404).json({ error: 'Student not found' });
    return;
  }

  const staff = users.find((u) => u.id === req.user!.userId);
  const staffName = staff ? `${staff.firstName} ${staff.lastName}` : 'Unknown';

  const note: PastoralNote = {
    id: `pn-${Date.now()}`,
    studentId,
    category,
    severity,
    title,
    body: body.trim(),
    staffId: req.user!.userId,
    staffName,
    createdAt: new Date().toISOString(),
  };

  pastoralNotes.push(note);
  res.status(201).json({ data: note });
});

/**
 * DELETE /api/pastoral/:noteId
 * Deletes a pastoral note (only the author or admin can delete).
 */
router.delete('/:noteId', (req: Request, res: Response) => {
  const { noteId } = req.params;
  const idx = pastoralNotes.findIndex((n) => n.id === noteId);

  if (idx === -1) {
    res.status(404).json({ error: 'Note not found' });
    return;
  }

  // Only the author or an admin can delete
  if (pastoralNotes[idx].staffId !== req.user!.userId && req.user!.role !== 'admin') {
    res.status(403).json({ error: 'You can only delete your own notes' });
    return;
  }

  pastoralNotes.splice(idx, 1);
  res.json({ data: { deleted: true } });
});

export default router;
