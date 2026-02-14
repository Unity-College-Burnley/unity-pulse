// ============================================================
// Behaviour log — shows recent positive and negative events
// ============================================================

import { ThumbsUp, ThumbsDown } from 'lucide-react';
import type { BehaviourEvent } from '../types';

interface Props {
  events: BehaviourEvent[];
}

/** Format an ISO timestamp to a friendly relative/date string */
function formatTimestamp(iso: string): string {
  const date = new Date(iso);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffHours = diffMs / (1000 * 60 * 60);

  if (diffHours < 24) {
    return `Today at ${date.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })}`;
  }
  if (diffHours < 48) {
    return `Yesterday at ${date.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })}`;
  }
  return date.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' });
}

export default function BehaviourLog({ events }: Props) {
  // Tally up total positive and negative points
  const positiveTotal = events
    .filter((e) => e.type === 'positive')
    .reduce((sum, e) => sum + e.points, 0);
  const negativeTotal = events
    .filter((e) => e.type === 'negative')
    .reduce((sum, e) => sum + Math.abs(e.points), 0);

  return (
    <section className="bg-white rounded-xl shadow-sm border border-gray-200 p-5">
      <h2 className="text-base font-semibold text-gray-900 mb-4">Behaviour</h2>

      {/* Points summary */}
      <div className="flex gap-3 mb-4">
        <div className="flex-1 rounded-lg bg-green-50 border border-green-100 px-3 py-2 text-center">
          <p className="text-xl font-bold text-green-700">+{positiveTotal}</p>
          <p className="text-xs text-green-600">Positive</p>
        </div>
        <div className="flex-1 rounded-lg bg-red-50 border border-red-100 px-3 py-2 text-center">
          <p className="text-xl font-bold text-red-700">-{negativeTotal}</p>
          <p className="text-xs text-red-600">Negative</p>
        </div>
      </div>

      {/* Event list */}
      <ul className="space-y-3">
        {events.map((event) => (
          <li key={event.id} className="flex gap-3">
            {/* Icon */}
            <div
              className={`flex-shrink-0 mt-0.5 w-7 h-7 rounded-full flex items-center justify-center ${
                event.type === 'positive'
                  ? 'bg-green-100 text-green-600'
                  : 'bg-red-100 text-red-600'
              }`}
            >
              {event.type === 'positive' ? (
                <ThumbsUp size={14} />
              ) : (
                <ThumbsDown size={14} />
              )}
            </div>

            {/* Details */}
            <div className="min-w-0 flex-1">
              <div className="flex items-baseline justify-between gap-2">
                <p className="text-sm font-medium text-gray-900 truncate">
                  {event.category}
                </p>
                <span
                  className={`text-xs font-semibold ${
                    event.type === 'positive' ? 'text-green-600' : 'text-red-600'
                  }`}
                >
                  {event.type === 'positive' ? '+' : ''}{event.points}
                </span>
              </div>
              <p className="text-sm text-gray-600 mt-0.5">{event.note}</p>
              <p className="text-xs text-gray-400 mt-1">
                {event.staffName} · {formatTimestamp(event.timestamp)}
              </p>
            </div>
          </li>
        ))}
      </ul>
    </section>
  );
}
