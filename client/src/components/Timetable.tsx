// ============================================================
// Timetable — today's view by default with tab to switch to
// the full weekly view. Includes form time and break/lunch.
// ============================================================

import { useState } from 'react';
import { Clock, MapPin } from 'lucide-react';
import type { TimetableLesson } from '../types';

interface Props {
  lessons: TimetableLesson[];
}

const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'] as const;

// Full school day schedule including non-lesson slots
const FORM_TIME = { label: 'Form', startTime: '08:30', endTime: '08:50' };
const BREAK = { label: 'Break', startTime: '10:50', endTime: '11:10' };
const LUNCH = { label: 'Lunch', startTime: '13:10', endTime: '13:50' };

function getTodayName(): (typeof DAYS)[number] | null {
  const dayIndex = new Date().getDay(); // 0 = Sun, 1 = Mon, ...
  if (dayIndex >= 1 && dayIndex <= 5) {
    return DAYS[dayIndex - 1];
  }
  return null; // weekend
}

export default function Timetable({ lessons }: Props) {
  const today = getTodayName();
  const [view, setView] = useState<'today' | 'week'>('today');
  const [selectedDay, setSelectedDay] = useState<(typeof DAYS)[number]>(today ?? 'Monday');

  // Lessons for the selected day (today view) or all days (week view)
  const dayLessons = lessons
    .filter((l) => l.day === selectedDay)
    .sort((a, b) => a.period - b.period);

  return (
    <section className="bg-white rounded-xl shadow-sm border border-gray-200 p-5">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-base font-semibold text-gray-900">Timetable</h2>
        <div className="flex rounded-lg bg-gray-100 p-0.5" role="tablist">
          <button
            role="tab"
            aria-selected={view === 'today'}
            onClick={() => { setView('today'); setSelectedDay(today ?? 'Monday'); }}
            className={`px-3 py-1 text-xs font-medium rounded-md transition-colors ${
              view === 'today' ? 'bg-white shadow-sm text-gray-900' : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            Today
          </button>
          <button
            role="tab"
            aria-selected={view === 'week'}
            onClick={() => setView('week')}
            className={`px-3 py-1 text-xs font-medium rounded-md transition-colors ${
              view === 'week' ? 'bg-white shadow-sm text-gray-900' : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            Week
          </button>
        </div>
      </div>

      {/* Day selector for week view */}
      {view === 'week' && (
        <div className="flex gap-1 mb-4 overflow-x-auto" role="tablist" aria-label="Day selector">
          {DAYS.map((day) => (
            <button
              key={day}
              role="tab"
              aria-selected={selectedDay === day}
              onClick={() => setSelectedDay(day)}
              className={`flex-1 min-w-0 px-2 py-1.5 text-xs font-medium rounded-md transition-colors ${
                selectedDay === day
                  ? 'bg-brand-500 text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {/* Show abbreviated day on small screens */}
              <span className="sm:hidden">{day.slice(0, 3)}</span>
              <span className="hidden sm:inline">{day}</span>
            </button>
          ))}
        </div>
      )}

      {/* Day schedule */}
      <div className="space-y-2">
        {/* Form time */}
        <ScheduleSlot
          label={FORM_TIME.label}
          startTime={FORM_TIME.startTime}
          endTime={FORM_TIME.endTime}
          isBreak
        />

        {/* Periods 1 & 2 */}
        {dayLessons.filter((l) => l.period <= 2).map((l) => (
          <LessonSlot key={l.id} lesson={l} />
        ))}

        {/* Break */}
        <ScheduleSlot label={BREAK.label} startTime={BREAK.startTime} endTime={BREAK.endTime} isBreak />

        {/* Periods 3 & 4 */}
        {dayLessons.filter((l) => l.period >= 3 && l.period <= 4).map((l) => (
          <LessonSlot key={l.id} lesson={l} />
        ))}

        {/* Lunch */}
        <ScheduleSlot label={LUNCH.label} startTime={LUNCH.startTime} endTime={LUNCH.endTime} isBreak />

        {/* Period 5 */}
        {dayLessons.filter((l) => l.period === 5).map((l) => (
          <LessonSlot key={l.id} lesson={l} />
        ))}
      </div>

      {/* Weekend message */}
      {view === 'today' && !today && (
        <p className="text-sm text-gray-500 text-center py-4">
          No lessons today — it's the weekend!
        </p>
      )}
    </section>
  );
}

/** A single lesson slot */
function LessonSlot({ lesson }: { lesson: TimetableLesson }) {
  return (
    <div className="flex items-center gap-3 rounded-lg border border-gray-100 bg-gray-50 px-3 py-2.5">
      <div className="text-xs text-gray-400 w-12 flex-shrink-0 text-center">
        <Clock size={12} className="inline-block mr-0.5 -mt-0.5" />
        {lesson.startTime}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-gray-900">{lesson.subject}</p>
        <p className="text-xs text-gray-500">{lesson.teacher}</p>
      </div>
      <div className="flex items-center gap-1 text-xs text-gray-400 flex-shrink-0">
        <MapPin size={12} />
        {lesson.room}
      </div>
    </div>
  );
}

/** A break / lunch / form time slot */
function ScheduleSlot({
  label,
  startTime,
  endTime,
  isBreak,
}: {
  label: string;
  startTime: string;
  endTime: string;
  isBreak?: boolean;
}) {
  return (
    <div
      className={`flex items-center gap-3 rounded-lg px-3 py-2 ${
        isBreak ? 'bg-brand-50 border border-brand-100' : ''
      }`}
    >
      <div className="text-xs text-gray-400 w-12 flex-shrink-0 text-center">{startTime}</div>
      <p className="text-xs font-medium text-brand-600">
        {label} <span className="font-normal text-gray-400">({startTime}–{endTime})</span>
      </p>
    </div>
  );
}
