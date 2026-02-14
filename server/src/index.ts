// ============================================================
// Unity Pulse — Express API server
// ============================================================

import express from 'express';
import cors from 'cors';

import authRoutes from './routes/auth';
import studentRoutes from './routes/students';
import announcementRoutes from './routes/announcements';
import messageRoutes from './routes/messages';
import staffRoutes from './routes/staff';
import adminRoutes from './routes/admin';
import registerRoutes from './routes/register';

const app = express();
const PORT = process.env.PORT || 4000;

// Middleware
app.use(cors({ origin: ['http://localhost:3000', 'http://127.0.0.1:3000'] }));
app.use(express.json());

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/students', studentRoutes);
app.use('/api/announcements', announcementRoutes);
app.use('/api/messages', messageRoutes);
app.use('/api/staff', staffRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/register', registerRoutes);

// Health check
app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', name: 'Unity Pulse API' });
});

app.listen(Number(PORT), '127.0.0.1', () => {
  console.log(`Unity Pulse API running on http://127.0.0.1:${PORT}`);
});
