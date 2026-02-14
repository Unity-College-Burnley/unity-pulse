// ============================================================
// Staff dashboard — full weekly timetable grid with teacher
// selector, Week A/B toggle, student search, and tabs for
// messages and alerts.
// ============================================================

import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import {
  ChevronLeft, ChevronRight, Search, Bell, MessageSquare,
  Clock, MapPin, Users,
} from 'lucide-react';
import type { StaffLesson } from '../types';

const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'] as const;
const PERIODS = [1, 2, 3, 4, 5] as const;

const PERIOD_TIMES: Record<number, { start: string; end: string }> = {
  1: { start: '08:50', end: '09:50' },
  2: { start: '09:50', end: '10:50' },
  3: { start: '11:10', end: '12:10' },
  4: { start: '12:10', end: '13:10' },
  5: { start: '13:50', end: '14:50' },
};

interface Teacher {
  id: string;
  firstName: string;
  lastName: string;
}

function getWeekDates(offset: number): { monday: Date; label: string; dates: Record<string, string> } {
  const now = new Date();
  const dayOfWeek = now.getDay(); // 0=Sun
  const monday = new Date(now);
  monday.setDate(now.getDate() - (dayOfWeek === 0 ? 6 : dayOfWeek - 1) + offset * 7);

  const friday = new Date(monday);
  friday.setDate(monday.getDate() + 4);

  const label = `${monday.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })} – ${friday.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}`;

  const dates: Record<string, string> = {};
  DAYS.forEach((day, i) => {
    const d = new Date(monday);
    d.setDate(monday.getDate() + i);
    dates[day] = d.toISOString().split('T')[0];
  });

  return { monday, label, dates };
}

function getTodayName(): string | null {
  const d = new Date().getDay();
  if (d >= 1 && d <= 5) return DAYS[d - 1];
  return null;
}

export default function StaffDashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [selectedTeacherId, setSelectedTeacherId] = useState('');
  const [week, setWeek] = useState<'A' | 'B'>('A');
  const [weekOffset, setWeekOffset] = useState(0);
  const [lessons, setLessons] = useState<StaffLesson[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  const today = getTodayName();
  const { label: weekLabel, dates: weekDates } = getWeekDates(weekOffset);

  // Fetch teacher list on mount
  useEffect(() => {
    async function fetchTeachers() {
      try {
        const res = await api.get<{ data: Teacher[] }>('/register/teachers');
        setTeachers(res.data);
        // Default to current user
        if (user) setSelectedTeacherId(user.id);
      } catch {
        // silently fail
      }
    }
    fetchTeachers();
  }, [user]);

  // Fetch timetable when teacher or week changes
  useEffect(() => {
    if (!selectedTeacherId) return;

    async function fetchTimetable() {
      setLoading(true);
      try {
        const res = await api.get<{ data: StaffLesson[] }>(
          `/register/timetable?teacherId=${selectedTeacherId}&week=${week}`
        );
        setLessons(res.data);
      } catch {
        setLessons([]);
      } finally {
        setLoading(false);
      }
    }
    fetchTimetable();
  }, [selectedTeacherId, week]);

  function getLessonForSlot(day: string, period: number): StaffLesson | undefined {
    return lessons.find((l) => l.day === day && l.period === period);
  }

  function openRegister(lesson: StaffLesson, day: string) {
    const date = weekDates[day];
    navigate(`/register?lesson=${lesson.id}&date=${date}`);
  }

  function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/student-search?q=${encodeURIComponent(searchQuery.trim())}`);
    }
  }

  const selectedTeacher = teachers.find((t) => t.id === selectedTeacherId);
  const isOwnTimetable = selectedTeacherId === user?.id;

  return (
    <div>
      {/* Top bar: greeting + search + badges */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5">
        <div>
          <h1 className="text-xl font-bold text-gray-900">
            {isOwnTimetable
              ? `Good morning, ${user?.firstName}`
              : `${selectedTeacher?.firstName} ${selectedTeacher?.lastName}'s Timetable`
            }
          </h1>
          <p className="text-sm text-gray-500">{weekLabel} · Week {week}</p>
        </div>

        <div className="flex items-center gap-2">
          {/* Student search */}
          <form onSubmit={handleSearch} className="relative">
            <Search size={15} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Find student…"
              className="pl-8 pr-3 py-1.5 text-sm rounded-lg border border-gray-300 w-44
                         focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent"
            />
          </form>

          {/* Alerts badge */}
          <button
            onClick={() => navigate('/alerts')}
            className="relative p-2 rounded-lg hover:bg-gray-100 text-gray-500 transition-colors"
            aria-label="Pastoral alerts"
          >
            <Bell size={18} />
            <span className="absolute -top-0.5 -right-0.5 bg-red-500 text-white text-xs font-bold rounded-full w-4 h-4 flex items-center justify-center">
              3
            </span>
          </button>

          {/* Messages badge */}
          <button
            onClick={() => navigate('/messages')}
            className="relative p-2 rounded-lg hover:bg-gray-100 text-gray-500 transition-colors"
            aria-label="Messages"
          >
            <MessageSquare size={18} />
          </button>
        </div>
      </div>

      {/* Controls row: teacher selector, week toggle, week nav */}
      <div className="flex flex-col sm:flex-row sm:items-center gap-3 mb-4">
        {/* Teacher selector */}
        <select
          value={selectedTeacherId}
          onChange={(e) => setSelectedTeacherId(e.target.value)}
          className="rounded-lg border border-gray-300 px-3 py-1.5 text-sm
                     focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent"
        >
          {teachers.map((t) => (
            <option key={t.id} value={t.id}>
              {t.id === user?.id ? 'My timetable' : `${t.firstName} ${t.lastName}`}
            </option>
          ))}
        </select>

        {/* Week A/B toggle */}
        <div className="flex rounded-lg bg-gray-100 p-0.5">
          <button
            onClick={() => setWeek('A')}
            className={`px-3 py-1 text-sm font-medium rounded-md transition-colors ${
              week === 'A' ? 'bg-white shadow-sm text-gray-900' : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            Week A
          </button>
          <button
            onClick={() => setWeek('B')}
            className={`px-3 py-1 text-sm font-medium rounded-md transition-colors ${
              week === 'B' ? 'bg-white shadow-sm text-gray-900' : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            Week B
          </button>
        </div>

        {/* Week navigation */}
        <div className="flex items-center gap-1">
          <button
            onClick={() => setWeekOffset((o) => o - 1)}
            className="p-1.5 rounded-md hover:bg-gray-100 text-gray-500"
            aria-label="Previous week"
          >
            <ChevronLeft size={18} />
          </button>
          <button
            onClick={() => setWeekOffset(0)}
            className="px-2 py-1 text-xs font-medium text-brand-500 hover:bg-brand-50 rounded-md transition-colors"
          >
            This week
          </button>
          <button
            onClick={() => setWeekOffset((o) => o + 1)}
            className="p-1.5 rounded-md hover:bg-gray-100 text-gray-500"
            aria-label="Next week"
          >
            <ChevronRight size={18} />
          </button>
        </div>
      </div>

      {/* Timetable grid */}
      {loading ? (
        <div className="flex items-center justify-center py-20">
          <div className="animate-spin rounded-full h-8 w-8 border-2 border-brand-500 border-t-transparent" />
        </div>
      ) : (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          {/* Desktop grid */}
          <div className="hidden md:block overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="bg-gray-50">
                  <th className="w-16 px-2 py-2.5 text-xs font-medium text-gray-500 text-left border-b border-gray-200"></th>
                  {DAYS.map((day) => (
                    <th
                      key={day}
                      className={`px-2 py-2.5 text-xs font-semibold text-center border-b border-gray-200 ${
                        today === day && weekOffset === 0 ? 'text-brand-600 bg-brand-50' : 'text-gray-700'
                      }`}
                    >
                      {day}
                      <span className="block text-xs font-normal text-gray-400">
                        {new Date(weekDates[day]).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}
                      </span>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {/* Form time row */}
                <tr className="bg-brand-50/40">
                  <td className="px-2 py-1.5 text-xs text-gray-400 border-r border-gray-100">
                    <span className="font-medium">08:30</span>
                  </td>
                  <td colSpan={5} className="px-2 py-1.5 text-xs font-medium text-brand-600 text-center">
                    Form (08:30–08:50)
                  </td>
                </tr>

                {PERIODS.map((period) => (
                  <>
                    {/* Break row before P3 */}
                    {period === 3 && (
                      <tr key="break" className="bg-brand-50/40">
                        <td className="px-2 py-1.5 text-xs text-gray-400 border-r border-gray-100">
                          <span className="font-medium">10:50</span>
                        </td>
                        <td colSpan={5} className="px-2 py-1.5 text-xs font-medium text-brand-600 text-center">
                          Break (10:50–11:10)
                        </td>
                      </tr>
                    )}
                    {/* Lunch row before P5 */}
                    {period === 5 && (
                      <tr key="lunch" className="bg-brand-50/40">
                        <td className="px-2 py-1.5 text-xs text-gray-400 border-r border-gray-100">
                          <span className="font-medium">13:10</span>
                        </td>
                        <td colSpan={5} className="px-2 py-1.5 text-xs font-medium text-brand-600 text-center">
                          Lunch (13:10–13:50)
                        </td>
                      </tr>
                    )}

                    <tr key={period} className="border-b border-gray-100 last:border-0">
                      <td className="px-2 py-1 text-xs text-gray-400 border-r border-gray-100 align-top pt-2.5">
                        <span className="font-medium">{PERIOD_TIMES[period].start}</span>
                        <span className="block text-[10px]">P{period}</span>
                      </td>
                      {DAYS.map((day) => {
                        const lesson = getLessonForSlot(day, period);
                        const isToday = today === day && weekOffset === 0;

                        return (
                          <td
                            key={day}
                            className={`px-1 py-1 align-top ${isToday ? 'bg-brand-50/30' : ''}`}
                          >
                            {lesson ? (
                              <button
                                onClick={() => openRegister(lesson, day)}
                                className="w-full text-left rounded-lg border border-gray-200 bg-white
                                           hover:border-brand-300 hover:shadow-sm px-2.5 py-2 transition-all
                                           group"
                              >
                                <p className="text-sm font-semibold text-gray-900 group-hover:text-brand-600 transition-colors">
                                  {lesson.subject}
                                </p>
                                <p className="text-xs text-gray-500">{lesson.classGroupName}</p>
                                <div className="flex items-center gap-2 mt-1 text-xs text-gray-400">
                                  <span className="flex items-center gap-0.5">
                                    <MapPin size={10} />{lesson.room}
                                  </span>
                                  <span className="flex items-center gap-0.5">
                                    <Users size={10} />{lesson.studentCount}
                                  </span>
                                </div>
                              </button>
                            ) : (
                              <div className="w-full rounded-lg border border-dashed border-gray-100 px-2.5 py-3 text-center">
                                <span className="text-xs text-gray-300 italic">Free</span>
                              </div>
                            )}
                          </td>
                        );
                      })}
                    </tr>
                  </>
                ))}
              </tbody>
            </table>
          </div>

          {/* Mobile: day-by-day cards */}
          <div className="md:hidden">
            {DAYS.map((day) => {
              const dayLessons = lessons.filter((l) => l.day === day).sort((a, b) => a.period - b.period);
              const isToday = today === day && weekOffset === 0;

              return (
                <div key={day} className={`border-b border-gray-100 last:border-0 ${isToday ? 'bg-brand-50/30' : ''}`}>
                  <div className="px-3 py-2 flex items-center justify-between">
                    <span className={`text-sm font-semibold ${isToday ? 'text-brand-600' : 'text-gray-700'}`}>
                      {day}
                    </span>
                    <span className="text-xs text-gray-400">
                      {new Date(weekDates[day]).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}
                    </span>
                  </div>
                  <div className="px-3 pb-3 space-y-1.5">
                    {PERIODS.map((period) => {
                      const lesson = dayLessons.find((l) => l.period === period);
                      return lesson ? (
                        <button
                          key={period}
                          onClick={() => openRegister(lesson, day)}
                          className="w-full flex items-center gap-3 rounded-lg border border-gray-200 bg-white
                                     hover:border-brand-300 px-3 py-2 transition-all text-left"
                        >
                          <span className="text-xs text-gray-400 w-10 flex-shrink-0">
                            <Clock size={10} className="inline mr-0.5" />
                            {PERIOD_TIMES[period].start}
                          </span>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-gray-900">{lesson.subject}</p>
                            <p className="text-xs text-gray-500">{lesson.classGroupName}</p>
                          </div>
                          <span className="text-xs text-gray-400">{lesson.room}</span>
                        </button>
                      ) : (
                        <div key={period} className="flex items-center gap-3 rounded-lg border border-dashed border-gray-100 px-3 py-2">
                          <span className="text-xs text-gray-400 w-10">{PERIOD_TIMES[period].start}</span>
                          <span className="text-xs text-gray-300 italic">Free</span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
