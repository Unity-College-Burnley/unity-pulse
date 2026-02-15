// ============================================================
// Messages routes — simple 1-to-1 messaging
// Messages are stored in Unity Pulse's own database (mock for now).
// ============================================================

import { Router, Request, Response } from 'express';
import { requireAuth } from '../middleware/auth';
import { messages, users } from '../data/mockData';
import type { Message } from '../types';

const router = Router();

router.use(requireAuth);

/**
 * GET /api/messages/contacts
 * Returns a list of users the current user can message.
 * Parents see staff; staff see other staff and parents they're linked to.
 */
router.get('/contacts', (req: Request, res: Response) => {
  const userId = req.user!.userId;

  // For the prototype, show all other users as potential contacts
  const contacts = users
    .filter((u) => u.id !== userId)
    .map((u) => ({
      id: u.id,
      firstName: u.firstName,
      lastName: u.lastName,
      role: u.role,
    }));

  res.json({ data: contacts });
});

/**
 * GET /api/messages
 * Returns conversations — one entry per contact with the latest message.
 */
router.get('/', (req: Request, res: Response) => {
  const userId = req.user!.userId;

  const userMessages = messages
    .filter((m) => m.fromUserId === userId || m.toUserId === userId)
    .sort((a, b) => new Date(b.sentAt).getTime() - new Date(a.sentAt).getTime());

  // Group into conversations by the other user
  const conversationMap = new Map<string, typeof userMessages>();
  for (const msg of userMessages) {
    const otherId = msg.fromUserId === userId ? msg.toUserId : msg.fromUserId;
    if (!conversationMap.has(otherId)) {
      conversationMap.set(otherId, []);
    }
    conversationMap.get(otherId)!.push(msg);
  }

  // Build conversation summaries
  const conversations = Array.from(conversationMap.entries()).map(([otherId, msgs]) => {
    const other = users.find((u) => u.id === otherId);
    const latest = msgs[0]; // already sorted newest first
    const unreadCount = msgs.filter(
      (m) => m.toUserId === userId && !m.readAt
    ).length;

    return {
      contactId: otherId,
      contactName: other ? `${other.firstName} ${other.lastName}` : 'Unknown',
      contactRole: other?.role ?? 'unknown',
      lastMessage: latest.body,
      lastMessageAt: latest.sentAt,
      lastMessageFromMe: latest.fromUserId === userId,
      unreadCount,
    };
  });

  // Sort by latest message
  conversations.sort(
    (a, b) => new Date(b.lastMessageAt).getTime() - new Date(a.lastMessageAt).getTime()
  );

  res.json({ data: conversations });
});

/**
 * GET /api/messages/:contactId
 * Returns all messages in a conversation with a specific user, oldest first.
 */
router.get('/:contactId', (req: Request, res: Response) => {
  const userId = req.user!.userId;
  const { contactId } = req.params;

  const thread = messages
    .filter(
      (m) =>
        (m.fromUserId === userId && m.toUserId === contactId) ||
        (m.fromUserId === contactId && m.toUserId === userId)
    )
    .sort((a, b) => new Date(a.sentAt).getTime() - new Date(b.sentAt).getTime());

  // Mark incoming messages as read
  for (const msg of thread) {
    if (msg.toUserId === userId && !msg.readAt) {
      msg.readAt = new Date().toISOString();
    }
  }

  // Enrich with names
  const enriched = thread.map((m) => {
    const from = users.find((u) => u.id === m.fromUserId);
    const to = users.find((u) => u.id === m.toUserId);
    return {
      ...m,
      fromName: from ? `${from.firstName} ${from.lastName}` : 'Unknown',
      toName: to ? `${to.firstName} ${to.lastName}` : 'Unknown',
    };
  });

  res.json({ data: enriched });
});

/**
 * POST /api/messages
 * Body: { toUserId, body }
 * Sends a new message
 */
router.post('/', (req: Request, res: Response) => {
  const { toUserId, body, allowReplies } = req.body;

  if (!toUserId || !body || !body.trim()) {
    res.status(400).json({ error: 'Recipient and message body are required' });
    return;
  }

  const recipient = users.find((u) => u.id === toUserId);
  if (!recipient) {
    res.status(404).json({ error: 'Recipient not found' });
    return;
  }

  const newMessage: Message = {
    id: `msg-${Date.now()}`,
    fromUserId: req.user!.userId,
    toUserId,
    body: body.trim(),
    sentAt: new Date().toISOString(),
    ...(allowReplies === false ? { allowReplies: false } : {}),
  };

  // In production this would be a database insert.
  messages.push(newMessage);

  const from = users.find((u) => u.id === req.user!.userId);
  res.status(201).json({
    data: {
      ...newMessage,
      fromName: from ? `${from.firstName} ${from.lastName}` : 'Unknown',
      toName: `${recipient.firstName} ${recipient.lastName}`,
    },
  });
});

export default router;
