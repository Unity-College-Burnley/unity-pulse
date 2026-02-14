// ============================================================
// Today's classes — shows the teacher's lessons for the day
// with period times, class names, and room info.
// ============================================================

import { Clock, MapPin, Users } from 'lucide-react';
import type { StaffLesson } from '../types';

interface Props {
  lessons: StaffLesson[];
  today: string;
}

const FORM_TIME = { label: 'Form', startTime: '08:30', endTime: '08:50' };
const BREAK = { label: 'Break', startTime: '10:50', endTime: '11:10' };
const LUNCH = { label: 'Lunch', startTime: '13:10', endTime: '13:50' };

/** Build the full day schedule with gaps shown as free periods */
function buildSchedule(lessons: StaffLesson[]) {
  const slots: Array<
    | { type: 'lesson'; lesson: StaffLesson }
    | { type: 'free'; period: number; startTime: string; endTime: string }
    | { type: 'break'; label: string; startTime: string; endTime: string }
  > = [];

  const periodTimes = [
    { period: 1, startTime: '08:50', endTime: '09:50' },
    { period: 2, startTime: '09:50', endTime: '10:50' },
    { period: 3, startTime: '11:10', endTime: '12:10' },
    { period: 4, startTime: '12:10', endTime: '13:10' },
    { period: 5, startTime: '13:50', endTime: '14:50' },
  ];

  // Form time
  slots.push({ type: 'break', label: FORM_TIME.label, startTime: FORM_TIME.startTime, endTime: FORM_TIME.endTime });

  for (const pt of periodTimes) {
    // Insert break/lunch before the right periods
    if (pt.period === 3) {
      slots.push({ type: 'break', label: BREAK.label, startTime: BREAK.startTime, endTime: BREAK.endTime });
    }
    if (pt.period === 5) {
      slots.push({ type: 'break', label: LUNCH.label, startTime: LUNCH.startTime, endTime: LUNCH.endTime });
    }

    const lesson = lessons.find((l) => l.period === pt.period);
    if (lesson) {
      slots.push({ type: 'lesson', lesson });
    } else {
      slots.push({ type: 'free', period: pt.period, startTime: pt.startTime, endTime: pt.endTime });
    }
  }

  return slots;
}

export default function TodaysClasses({ lessons, today }: Props) {
  const schedule = buildSchedule(lessons);

  return (
    <section className="bg-white rounded-xl shadow-sm border border-gray-200 p-5">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-base font-semibold text-gray-900">Today's Classes</h2>
        <span className="text-xs text-gray-500 bg-gray-100 rounded-full px-2.5 py-0.5">{today}</span>
      </div>

      <div className="space-y-2">
        {schedule.map((slot, i) => {
          if (slot.type === 'break') {
            return (
              <div key={i} className="flex items-center gap-3 rounded-lg bg-brand-50 border border-brand-100 px-3 py-2">
                <span className="text-xs text-gray-400 w-12 text-center">{slot.startTime}</span>
                <span className="text-xs font-medium text-brand-600">
                  {slot.label} <span className="font-normal text-gray-400">({slot.startTime}–{slot.endTime})</span>
                </span>
              </div>
            );
          }

          if (slot.type === 'free') {
            return (
              <div key={i} className="flex items-center gap-3 rounded-lg border border-dashed border-gray-200 px-3 py-2.5">
                <span className="text-xs text-gray-400 w-12 text-center">
                  <Clock size={12} className="inline-block mr-0.5 -mt-0.5" />
                  {slot.startTime}
                </span>
                <span className="text-sm text-gray-400 italic">Free period</span>
              </div>
            );
          }

          return (
            <div key={i} className="flex items-center gap-3 rounded-lg border border-gray-100 bg-gray-50 px-3 py-2.5">
              <div className="text-xs text-gray-400 w-12 flex-shrink-0 text-center">
                <Clock size={12} className="inline-block mr-0.5 -mt-0.5" />
                {slot.lesson.startTime}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900">{slot.lesson.subject}</p>
                <p className="text-xs text-gray-500">{slot.lesson.classGroupName}</p>
              </div>
              <div className="flex items-center gap-3 text-xs text-gray-400 flex-shrink-0">
                <span className="flex items-center gap-1">
                  <Users size={12} />
                  {slot.lesson.studentCount}
                </span>
                <span className="flex items-center gap-1">
                  <MapPin size={12} />
                  {slot.lesson.room}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
