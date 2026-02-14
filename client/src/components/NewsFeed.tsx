// ============================================================
// News feed — school announcements, pinned items first
// ============================================================

import { Pin, Calendar } from 'lucide-react';
import type { Announcement } from '../types';

interface Props {
  announcements: Announcement[];
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
}

export default function NewsFeed({ announcements }: Props) {
  return (
    <section className="bg-white rounded-xl shadow-sm border border-gray-200 p-5">
      <h2 className="text-base font-semibold text-gray-900 mb-4">School News</h2>

      <ul className="space-y-4">
        {announcements.map((item) => (
          <li key={item.id} className="border-b border-gray-100 last:border-0 pb-4 last:pb-0">
            <div className="flex items-start gap-2">
              {item.pinned && (
                <Pin size={14} className="text-brand-500 flex-shrink-0 mt-0.5" />
              )}
              <div className="min-w-0 flex-1">
                <h3 className="text-sm font-semibold text-gray-900">{item.title}</h3>
                <p className="text-sm text-gray-600 mt-1 leading-relaxed">{item.body}</p>
                <div className="flex items-center gap-3 mt-2 text-xs text-gray-400">
                  <span className="flex items-center gap-1">
                    <Calendar size={12} />
                    {formatDate(item.publishedAt)}
                  </span>
                  <span>{item.author}</span>
                </div>
              </div>
            </div>
          </li>
        ))}
      </ul>
    </section>
  );
}
