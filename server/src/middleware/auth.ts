// ============================================================
// Authentication middleware
// Verifies the JWT from the Authorization header and attaches
// the decoded user info to the request object.
// ============================================================

import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import type { TokenPayload } from '../types';

const JWT_SECRET = process.env.JWT_SECRET || 'unity-pulse-dev-secret';

/** Extend Express Request to include our auth payload */
declare global {
  namespace Express {
    interface Request {
      user?: TokenPayload;
    }
  }
}

/** Require a valid JWT on the request */
export function requireAuth(req: Request, res: Response, next: NextFunction): void {
  const header = req.headers.authorization;

  if (!header || !header.startsWith('Bearer ')) {
    res.status(401).json({ error: 'Authentication required' });
    return;
  }

  const token = header.slice(7); // strip "Bearer "

  try {
    const payload = jwt.verify(token, JWT_SECRET) as TokenPayload;
    req.user = payload;
    next();
  } catch {
    res.status(401).json({ error: 'Invalid or expired token' });
  }
}

/** Require the user to have one of the specified roles */
export function requireRole(...roles: TokenPayload['role'][]) {
  return (req: Request, res: Response, next: NextFunction): void => {
    if (!req.user || !roles.includes(req.user.role)) {
      res.status(403).json({ error: 'You do not have permission to access this resource' });
      return;
    }
    next();
  };
}

/** Sign a new JWT for a user */
export function signToken(payload: TokenPayload): string {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: '8h' });
}
