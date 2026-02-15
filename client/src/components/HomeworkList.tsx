// ============================================================
// HomeworkList — read-only homework widget for student/parent
// ============================================================

import { BookOpen, Check, ExternalLink, Clock } from 'lucide-react';
import type { HomeworkItem } from '../types';

interface Props {
  homework: HomeworkItem[];
}

export default function HomeworkList({ homework }: Props) {
  if (homework.length === 0) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h2 className="text-base font-semibold text-gray-900 mb-3 flex items-center gap-2">
          <BookOpen size={18} className="text-brand-500" />
          Homework
        </h2>
        <p className="text-sm text-gray-400">No homework set at the moment.</p>
      </div>
    );
  }

  const today = new Date().toISOString().split('T')[0];

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 sm:p-5">
      <h2 className="text-base font-semibold text-gray-900 mb-3 flex items-center gap-2">
        <BookOpen size={18} className="text-brand-500" />
        Homework
      </h2>

      <div className="space-y-3">
        {homework.map((item) => {
          const isOverdue = !item.completed && item.dueDate < today;
          const isDueSoon = !item.completed && !isOverdue && item.dueDate <= new Date(Date.now() + 2 * 86400000).toISOString().split('T')[0];

          return (
            <div
              key={item.id}
              className={`rounded-lg border p-3 ${
                item.completed
                  ? 'border-gray-100 bg-gray-50/50'
                  : isOverdue
                    ? 'border-red-200 bg-red-50/30'
                    : 'border-gray-200'
              }`}
            >
              <div className="flex items-start justify-between gap-2">
                <div className="flex-1 min-w-0">
                  <h3 className={`text-sm font-medium ${item.completed ? 'text-gray-500 line-through' : 'text-gray-900'}`}>
                    {item.title}
                  </h3>
                  <div className="flex flex-wrap items-center gap-2 mt-1">
                    <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-medium bg-brand-50 text-brand-700">
                      {item.subject}
                    </span>
                    <span className="text-[10px] text-gray-400">{item.className}</span>
                  </div>
                  <p className="text-xs text-gray-500 mt-1.5 line-clamp-2">{item.description}</p>
                  {item.links && item.links.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 mt-2">
                      {item.links.map((link, i) => (
                        <a
                          key={i}
                          href={link}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium
                                     bg-blue-50 text-blue-600 hover:bg-blue-100 transition-colors"
                        >
                          <ExternalLink size={10} />
                          Link {i + 1}
                        </a>
                      ))}
                    </div>
                  )}
                </div>

                <div className="flex flex-col items-end gap-1 flex-shrink-0">
                  {item.completed ? (
                    <span className="inline-flex items-center gap-1 px-2 py-1 rounded-md text-xs font-medium bg-emerald-100 text-emerald-700">
                      <Check size={12} /> Done
                    </span>
                  ) : (
                    <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-md text-xs font-medium ${
                      isOverdue
                        ? 'bg-red-100 text-red-700'
                        : isDueSoon
                          ? 'bg-amber-100 text-amber-700'
                          : 'bg-gray-100 text-gray-600'
                    }`}>
                      <Clock size={12} />
                      {isOverdue
                        ? 'Overdue'
                        : `Due ${new Date(item.dueDate).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}`}
                    </span>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
