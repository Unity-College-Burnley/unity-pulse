// ============================================================
// CommsTab — class communications: contact directory + class posts
// Contact directory shows parent details with message links.
// Class posts are one-way teacher notices backed by API.
// ============================================================

import { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../services/api';
import {
  MessageSquare, Plus, Trash2, X,
  Megaphone, Users, Send,
} from 'lucide-react';
import type { ClassPost } from '../types';

// --------------- Types ---------------
interface ClassStudent {
  id: string;
  firstName: string;
  lastName: string;
  parentUserId: string | null;
  parentName: string | null;
}

interface Props {
  classGroupId: string;
  classGroupName: string;
}

function formatTimestamp(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })
    + ' at ' + d.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' });
}

// ============================================================
// Component
// ============================================================
export default function CommsTab({ classGroupId, classGroupName }: Props) {
  const navigate = useNavigate();

  // Contact directory state
  const [students, setStudents] = useState<ClassStudent[]>([]);
  const [loadingStudents, setLoadingStudents] = useState(true);

  // Class posts state
  const [posts, setPosts] = useState<ClassPost[]>([]);
  const [loadingPosts, setLoadingPosts] = useState(true);
  const [showPostForm, setShowPostForm] = useState(false);
  const [postBody, setPostBody] = useState('');
  const [submitting, setSubmitting] = useState(false);

  // Active panel on mobile
  const [mobileView, setMobileView] = useState<'contacts' | 'posts'>('contacts');

  // Fetch students with parent info
  useEffect(() => {
    async function fetchStudents() {
      try {
        const res = await api.get<{ data: ClassStudent[] }>(`/staff/classes/${classGroupId}/students`);
        setStudents(
          [...res.data].sort((a, b) => a.lastName.localeCompare(b.lastName))
        );
      } catch {
        // silent
      } finally {
        setLoadingStudents(false);
      }
    }
    fetchStudents();
  }, [classGroupId]);

  // Fetch class posts
  const fetchPosts = useCallback(async () => {
    try {
      const res = await api.get<{ data: ClassPost[] }>(`/class-posts/class/${classGroupId}`);
      setPosts(res.data);
    } catch {
      // silent
    } finally {
      setLoadingPosts(false);
    }
  }, [classGroupId]);

  useEffect(() => {
    fetchPosts();
  }, [fetchPosts]);

  async function handleCreatePost(e: React.FormEvent) {
    e.preventDefault();
    if (!postBody.trim()) return;
    setSubmitting(true);
    try {
      await api.post('/class-posts', { classGroupId, body: postBody.trim() });
      setPostBody('');
      setShowPostForm(false);
      await fetchPosts();
    } catch {
      // silent
    } finally {
      setSubmitting(false);
    }
  }

  async function handleDeletePost(postId: string) {
    try {
      await api.delete(`/class-posts/${postId}`);
      await fetchPosts();
    } catch {
      // silent
    }
  }

  function messageParent(parentUserId: string, parentName: string) {
    navigate(`/messages?contact=${parentUserId}&name=${encodeURIComponent(parentName)}`);
  }

  if (loadingStudents || loadingPosts) {
    return (
      <div className="flex items-center justify-center py-16">
        <div className="animate-spin rounded-full h-8 w-8 border-2 border-brand-500 border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Mobile tab toggle */}
      <div className="flex lg:hidden rounded-lg bg-gray-100 p-0.5" role="tablist">
        <button
          role="tab"
          aria-selected={mobileView === 'contacts'}
          onClick={() => setMobileView('contacts')}
          className={`flex-1 flex items-center justify-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
            mobileView === 'contacts' ? 'bg-white shadow-sm text-gray-900' : 'text-gray-500'
          }`}
        >
          <Users size={14} />
          Contacts
        </button>
        <button
          role="tab"
          aria-selected={mobileView === 'posts'}
          onClick={() => setMobileView('posts')}
          className={`flex-1 flex items-center justify-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
            mobileView === 'posts' ? 'bg-white shadow-sm text-gray-900' : 'text-gray-500'
          }`}
        >
          <Megaphone size={14} />
          Class Posts
          {posts.length > 0 && (
            <span className="ml-1 px-1.5 py-0.5 rounded-full bg-brand-100 text-brand-700 text-[10px] font-bold">
              {posts.length}
            </span>
          )}
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* ---- Contact Directory ---- */}
        <div className={`${mobileView !== 'contacts' ? 'hidden lg:block' : ''}`}>
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="px-4 py-3 border-b border-gray-200 bg-gray-50">
              <h3 className="text-sm font-semibold text-gray-900 flex items-center gap-2">
                <Users size={16} className="text-brand-600" />
                Contacts — {classGroupName}
              </h3>
              <p className="text-[10px] text-gray-400 mt-0.5">{students.length} students</p>
            </div>

            <div className="divide-y divide-gray-50 max-h-[600px] overflow-y-auto">
              {students.map((student) => (
                <div
                  key={student.id}
                  className="px-4 py-3 hover:bg-gray-50/50 transition-colors"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-gray-900">
                        {student.lastName}, {student.firstName}
                      </p>
                      {student.parentName ? (
                        <p className="text-xs text-gray-500 mt-0.5">
                          Parent: {student.parentName}
                        </p>
                      ) : (
                        <p className="text-xs text-gray-400 mt-0.5 italic">
                          No parent contact linked
                        </p>
                      )}
                    </div>
                    {student.parentUserId && student.parentName && (
                      <button
                        onClick={() => messageParent(student.parentUserId!, student.parentName!)}
                        className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium
                                   border border-brand-300 bg-brand-50 text-brand-700
                                   hover:bg-brand-100 transition-colors flex-shrink-0"
                      >
                        <MessageSquare size={12} />
                        Message
                      </button>
                    )}
                  </div>
                </div>
              ))}

              {students.length === 0 && (
                <div className="px-4 py-8 text-center">
                  <p className="text-sm text-gray-400">No students found.</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* ---- Class Posts ---- */}
        <div className={`${mobileView !== 'posts' ? 'hidden lg:block' : ''}`}>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                <Megaphone size={16} className="text-brand-600" />
                Class Posts
              </h3>
              <button
                onClick={() => setShowPostForm(!showPostForm)}
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg
                           bg-brand-600 hover:bg-brand-700 text-white transition-colors"
              >
                {showPostForm ? <X size={14} /> : <Plus size={14} />}
                {showPostForm ? 'Cancel' : 'New Post'}
              </button>
            </div>

            {/* Post form */}
            {showPostForm && (
              <form onSubmit={handleCreatePost} className="bg-white rounded-xl border border-gray-200 p-4 space-y-3">
                <textarea
                  autoFocus
                  required
                  value={postBody}
                  onChange={(e) => setPostBody(e.target.value)}
                  rows={3}
                  placeholder="Write a message for the class…"
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm
                             focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent
                             resize-none"
                />
                <button
                  type="submit"
                  disabled={submitting || !postBody.trim()}
                  className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium
                             bg-brand-600 hover:bg-brand-700 text-white transition-colors disabled:opacity-50"
                >
                  {submitting ? (
                    <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent" />
                  ) : (
                    <Send size={14} />
                  )}
                  Post to Class
                </button>
              </form>
            )}

            {/* Post feed */}
            {posts.length === 0 && !showPostForm ? (
              <div className="bg-white rounded-xl border border-gray-200 p-8 text-center">
                <Megaphone size={24} className="mx-auto text-gray-300 mb-2" />
                <p className="text-gray-400 text-sm">No class posts yet.</p>
                <p className="text-gray-400 text-[10px] mt-1">
                  Post notices, reminders, or updates visible to students and parents.
                </p>
              </div>
            ) : (
              posts.map((post) => (
                <div
                  key={post.id}
                  className="bg-white rounded-xl border border-gray-200 p-4 group"
                >
                  <div className="flex items-start justify-between gap-2">
                    <p className="text-sm text-gray-900 whitespace-pre-wrap flex-1">{post.body}</p>
                    <button
                      onClick={() => {
                        if (window.confirm('Delete this post?')) handleDeletePost(post.id);
                      }}
                      className="p-1 rounded-lg text-gray-300 hover:text-red-500 hover:bg-red-50
                                 transition-colors opacity-0 group-hover:opacity-100 flex-shrink-0"
                      title="Delete post"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                  <p className="text-[10px] text-gray-400 mt-2">
                    {post.authorName} · {formatTimestamp(post.postedAt)}
                  </p>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
