// ============================================================
// Messages page — conversation list + message thread
// Works for both parents and staff.
// Supports ?contact=<userId>&name=<name> query params to
// open a conversation directly (used by staff class register).
// ============================================================

import { useEffect, useState, useRef, type FormEvent } from 'react';
import { useAuth } from '../context/AuthContext';
import { useSearchParams } from 'react-router-dom';
import { api } from '../services/api';
import { Send, ArrowLeft, MessageSquare, ToggleLeft, ToggleRight, Lock } from 'lucide-react';
import type { Message } from '../types';

interface Conversation {
  contactId: string;
  contactName: string;
  contactRole: string;
  lastMessage: string;
  lastMessageAt: string;
  lastMessageFromMe: boolean;
  unreadCount: number;
}

function formatTime(iso: string): string {
  const date = new Date(iso);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffHours = diffMs / (1000 * 60 * 60);

  if (diffHours < 24) {
    return date.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' });
  }
  if (diffHours < 48) {
    return 'Yesterday';
  }
  return date.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' });
}

export default function Messages() {
  const { user } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selectedContactId, setSelectedContactId] = useState<string | null>(null);
  const [selectedContactName, setSelectedContactName] = useState('');
  const [thread, setThread] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [sending, setSending] = useState(false);
  const [loading, setLoading] = useState(true);
  const [allowReplies, setAllowReplies] = useState(true);
  const threadEndRef = useRef<HTMLDivElement>(null);

  const isStaff = user?.role === 'teacher' || user?.role === 'admin';

  // Fetch conversation list, then check for ?contact= query param
  useEffect(() => {
    async function fetchConversations() {
      try {
        const res = await api.get<{ data: Conversation[] }>('/messages');
        setConversations(res.data);

        // If there's a ?contact= param, open that conversation directly
        const contactParam = searchParams.get('contact');
        const nameParam = searchParams.get('name');
        if (contactParam) {
          setSelectedContactId(contactParam);
          // Use the name from the param, or find it in conversations
          const existing = res.data.find((c) => c.contactId === contactParam);
          setSelectedContactName(nameParam || existing?.contactName || 'Conversation');
          // Clear the query params so they don't persist on navigation
          setSearchParams({}, { replace: true });
        }
      } catch {
        // silently fail for now
      } finally {
        setLoading(false);
      }
    }
    fetchConversations();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Fetch thread when a conversation is selected
  useEffect(() => {
    if (!selectedContactId) return;

    async function fetchThread() {
      try {
        const res = await api.get<{ data: Message[] }>(`/messages/${selectedContactId}`);
        setThread(res.data);
      } catch {
        setThread([]);
      }
    }
    fetchThread();
  }, [selectedContactId]);

  // Scroll to bottom when thread changes
  useEffect(() => {
    threadEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [thread]);

  function openConversation(contactId: string, contactName: string) {
    setSelectedContactId(contactId);
    setSelectedContactName(contactName);
  }

  async function handleSend(e: FormEvent) {
    e.preventDefault();
    if (!newMessage.trim() || !selectedContactId) return;

    setSending(true);
    try {
      const res = await api.post<{ data: Message }>('/messages', {
        toUserId: selectedContactId,
        body: newMessage,
        ...(isStaff && !allowReplies ? { allowReplies: false } : {}),
      });
      setThread((prev) => [...prev, res.data]);
      setNewMessage('');

      // Refresh conversation list to update last message
      const convRes = await api.get<{ data: Conversation[] }>('/messages');
      setConversations(convRes.data);
    } catch {
      // silently fail for now
    } finally {
      setSending(false);
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="animate-spin rounded-full h-8 w-8 border-2 border-brand-500 border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="h-[calc(100vh-7.5rem)]">
      <h1 className="text-xl font-bold text-gray-900 mb-4">Messages</h1>

      <div className="flex h-[calc(100%-2.5rem)] bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        {/* Conversation list — hidden on mobile when viewing a thread */}
        <div className={`w-full sm:w-80 sm:flex-shrink-0 border-r border-gray-200 flex flex-col ${
          selectedContactId ? 'hidden sm:flex' : 'flex'
        }`}>
          <div className="p-3 border-b border-gray-100">
            <span className="text-sm font-semibold text-gray-700">Inbox</span>
          </div>

          {/* Conversation list */}
          <div className="flex-1 overflow-y-auto">
            {conversations.length === 0 && (
              <div className="flex flex-col items-center justify-center h-full text-gray-400 px-4">
                <MessageSquare size={32} className="mb-2" />
                <p className="text-sm">No messages yet</p>
              </div>
            )}
            {conversations.map((conv) => (
              <button
                key={conv.contactId}
                onClick={() => openConversation(conv.contactId, conv.contactName)}
                className={`w-full text-left px-3 py-3 border-b border-gray-50 hover:bg-gray-50 transition-colors ${
                  selectedContactId === conv.contactId ? 'bg-brand-50' : ''
                }`}
              >
                <div className="flex items-center justify-between mb-0.5">
                  <span className="text-sm font-semibold text-gray-900 truncate">{conv.contactName}</span>
                  <span className="text-xs text-gray-400 flex-shrink-0 ml-2">{formatTime(conv.lastMessageAt)}</span>
                </div>
                <div className="flex items-center justify-between">
                  <p className="text-xs text-gray-500 truncate">
                    {conv.lastMessageFromMe && <span className="text-gray-400">You: </span>}
                    {conv.lastMessage}
                  </p>
                  {conv.unreadCount > 0 && (
                    <span className="flex-shrink-0 ml-2 bg-brand-500 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
                      {conv.unreadCount}
                    </span>
                  )}
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Thread view */}
        <div className={`flex-1 flex flex-col ${
          selectedContactId ? 'flex' : 'hidden sm:flex'
        }`}>
          {selectedContactId ? (
            <>
              {/* Thread header */}
              <div className="px-4 py-3 border-b border-gray-100 flex items-center gap-3">
                <button
                  onClick={() => setSelectedContactId(null)}
                  className="sm:hidden p-1 rounded-md hover:bg-gray-100"
                  aria-label="Back to conversations"
                >
                  <ArrowLeft size={18} />
                </button>
                <h2 className="text-sm font-semibold text-gray-900">{selectedContactName}</h2>
              </div>

              {/* Messages */}
              <div className="flex-1 overflow-y-auto px-4 py-3 space-y-3">
                {thread.length === 0 && (
                  <p className="text-sm text-gray-400 text-center py-8">
                    No messages yet — start the conversation below.
                  </p>
                )}
                {thread.map((msg) => {
                  const isMe = msg.fromUserId === user?.id;
                  return (
                    <div key={msg.id} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                      <div
                        className={`max-w-[75%] rounded-xl px-3 py-2 ${
                          isMe
                            ? 'bg-brand-500 text-white'
                            : 'bg-gray-100 text-gray-900'
                        }`}
                      >
                        <p className="text-sm leading-relaxed">{msg.body}</p>
                        <p className={`text-xs mt-1 ${isMe ? 'text-white/60' : 'text-gray-400'}`}>
                          {formatTime(msg.sentAt)}
                          {isMe && msg.readAt && ' · Read'}
                        </p>
                      </div>
                    </div>
                  );
                })}
                <div ref={threadEndRef} />
              </div>

              {/* Compose — check if replies are disabled for non-staff */}
              {(() => {
                // Non-staff: check if the latest message from the other party has allowReplies: false
                const lastFromOther = [...thread].reverse().find((m) => m.fromUserId !== user?.id);
                const repliesBlocked = !isStaff && lastFromOther?.allowReplies === false;

                if (repliesBlocked) {
                  return (
                    <div className="p-3 border-t border-gray-100 flex items-center justify-center gap-2 text-gray-400">
                      <Lock size={14} />
                      <span className="text-sm">Replies are not enabled for this conversation</span>
                    </div>
                  );
                }

                return (
                  <form onSubmit={handleSend} className="p-3 border-t border-gray-100">
                    {isStaff && (
                      <div className="flex items-center gap-2 mb-2">
                        <button
                          type="button"
                          onClick={() => setAllowReplies(!allowReplies)}
                          className="flex items-center gap-1.5 text-xs text-gray-500 hover:text-gray-700 transition-colors"
                        >
                          {allowReplies ? (
                            <ToggleRight size={18} className="text-brand-500" />
                          ) : (
                            <ToggleLeft size={18} className="text-gray-400" />
                          )}
                          {allowReplies ? 'Replies enabled' : 'Replies disabled'}
                        </button>
                      </div>
                    )}
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
                        placeholder="Type a message…"
                        className="flex-1 rounded-lg border border-gray-300 px-3 py-2 text-sm
                                   focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent"
                      />
                      <button
                        type="submit"
                        disabled={sending || !newMessage.trim()}
                        className="bg-brand-500 hover:bg-brand-600 text-white rounded-lg px-3 py-2 transition-colors
                                   disabled:opacity-50 disabled:cursor-not-allowed"
                        aria-label="Send message"
                      >
                        <Send size={18} />
                      </button>
                    </div>
                  </form>
                );
              })()}
            </>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-gray-400">
              <MessageSquare size={40} className="mb-2" />
              <p className="text-sm">Select a conversation to read messages</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
