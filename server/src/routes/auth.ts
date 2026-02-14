// ============================================================
// Auth routes — login endpoint
// ============================================================

import { Router, Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import { signToken } from '../middleware/auth';
import { users } from '../data/mockData';

const router = Router();

/**
 * POST /api/auth/login
 * Body: { email, password }
 * Returns: { token, user: { id, firstName, lastName, role, studentIds } }
 */
router.post('/login', async (req: Request, res: Response) => {
  const { email, password } = req.body;

  if (!email || !password) {
    res.status(400).json({ error: 'Email and password are required' });
    return;
  }

  const user = users.find((u) => u.email.toLowerCase() === email.toLowerCase());

  if (!user) {
    res.status(401).json({ error: 'Invalid email or password' });
    return;
  }

  // For the prototype, accept "password123" for all mock users.
  // In production, compare against the real hash.
  const isValid =
    user.passwordHash === '$2a$10$placeholder'
      ? password === 'password123'
      : await bcrypt.compare(password, user.passwordHash);

  if (!isValid) {
    res.status(401).json({ error: 'Invalid email or password' });
    return;
  }

  const token = signToken({ userId: user.id, role: user.role });

  res.json({
    data: {
      token,
      user: {
        id: user.id,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role,
        studentIds: user.studentIds,
      },
    },
  });
});

export default router;
