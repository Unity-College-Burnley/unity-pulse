// ============================================================
// ClassNotices — read-only class post feed for student/parent
// dashboards. Shows posts from all the student's class groups.
// ============================================================

import { Megaphone } from 'lucide-react';
import type { ClassPost } from '../types';

interface Props {
  posts: ClassPost[];
}

function formatTimestamp(iso: string): string {
  const d = new Date(iso);
  const now = new Date();
  const diffMs = now.getTime() - d.getTime();
  const diffHours = diffMs / (1000 * 60 * 60);

  if (diffHours < 24) {
    return 'Today at ' + d.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' });
  }
  if (diffHours < 48) {
    return 'Yesterday at ' + d.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' });
  }
  return d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })
    + ' at ' + d.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' });
}

export default function ClassNotices({ posts }: Props) {
  return (
    <section className="bg-white rounded-xl shadow-sm border border-gray-200 p-5">
      <div className="flex items-center gap-2 mb-4">
        <Megaphone size={18} className="text-brand-600" />
        <h2 className="text-base font-semibold text-gray-900">Class Notices</h2>
      </div>

      {posts.length === 0 ? (
        <p className="text-sm text-gray-400 text-center py-4">No class notices at the moment.</p>
      ) : (
        <div className="space-y-3">
          {posts.map((post) => (
            <div
              key={post.id}
              className="rounded-lg border border-gray-100 bg-gray-50 px-4 py-3"
            >
              <div className="flex items-center gap-2 mb-1.5">
                <span className="inline-flex items-center px-2 py-0.5 rounded-full bg-brand-100 text-brand-700 text-[10px] font-semibold">
                  {post.classGroupName} · {post.subject}
                </span>
              </div>
              <p className="text-sm text-gray-900 whitespace-pre-wrap">{post.body}</p>
              <p className="text-[10px] text-gray-400 mt-2">
                {post.authorName} · {formatTimestamp(post.postedAt)}
              </p>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
