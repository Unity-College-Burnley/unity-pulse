// ============================================================
// HomeworkTab — teacher-facing homework management in Register
// ============================================================

import { useEffect, useState, useCallback } from 'react';
import { api } from '../services/api';
import {
  Plus, Trash2, Check, CheckCheck, ChevronLeft, ChevronRight,
  ExternalLink, X, BookOpen,
} from 'lucide-react';
import type { Homework, StaffLesson } from '../types';

interface HomeworkWithCounts extends Homework {
  totalStudents: number;
  completedCount: number;
}

interface CompletionStudent {
  studentId: string;
  firstName: string;
  lastName: string;
  completed: boolean;
  completedAt: string | null;
}

interface Props {
  classGroupId: string;
  classGroupName: string;
  students: { studentId: string; firstName: string; lastName: string }[];
}

// ---- Due-date calendar with lesson-day highlights ----
const WEEKDAY_HEADERS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'] as const;
const DAY_NAMES_FULL = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

function DueDatePicker({
  value,
  onChange,
  lessonDays,
}: {
  value: string;
  onChange: (date: string) => void;
  lessonDays: string[];
}) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const [view, setView] = useState(() => ({
    year: today.getFullYear(),
    month: today.getMonth(),
  }));

  const selectedDate = value ? new Date(value + 'T00:00:00') : null;

  // Build calendar grid (Monday-start)
  const firstOfMonth = new Date(view.year, view.month, 1);
  const lastOfMonth = new Date(view.year, view.month + 1, 0);
  let startOffset = firstOfMonth.getDay() - 1;
  if (startOffset < 0) startOffset = 6;

  const cells: (Date | null)[] = [];
  for (let i = 0; i < startOffset; i++) cells.push(null);
  for (let d = 1; d <= lastOfMonth.getDate(); d++) {
    cells.push(new Date(view.year, view.month, d));
  }

  function isLessonDay(date: Date): boolean {
    return lessonDays.includes(DAY_NAMES_FULL[date.getDay()]);
  }

  function isSame(a: Date, b: Date): boolean {
    return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();
  }

  function toIso(date: Date): string {
    return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
  }

  const monthLabel = firstOfMonth.toLocaleDateString('en-GB', { month: 'long', year: 'numeric' });

  return (
    <div className="rounded-lg border border-gray-200 bg-white p-3">
      {/* Month navigation */}
      <div className="flex items-center justify-between mb-2">
        <button
          type="button"
          onClick={() => setView((v) => { const d = new Date(v.year, v.month - 1, 1); return { year: d.getFullYear(), month: d.getMonth() }; })}
          className="p-1 rounded hover:bg-gray-100 text-gray-400"
        >
          <ChevronLeft size={16} />
        </button>
        <span className="text-sm font-semibold text-gray-900">{monthLabel}</span>
        <button
          type="button"
          onClick={() => setView((v) => { const d = new Date(v.year, v.month + 1, 1); return { year: d.getFullYear(), month: d.getMonth() }; })}
          className="p-1 rounded hover:bg-gray-100 text-gray-400"
        >
          <ChevronRight size={16} />
        </button>
      </div>

      {/* Weekday headers */}
      <div className="grid grid-cols-7 gap-0.5 mb-1">
        {WEEKDAY_HEADERS.map((d) => (
          <div key={d} className="text-center text-[10px] font-medium text-gray-400 py-1">{d}</div>
        ))}
      </div>

      {/* Day cells */}
      <div className="grid grid-cols-7 gap-0.5">
        {cells.map((date, i) => {
          if (!date) return <div key={`e-${i}`} className="h-8" />;
          const isPast = date < today;
          const isToday = isSame(date, today);
          const isSelected = selectedDate ? isSame(date, selectedDate) : false;
          const isLesson = !isPast && isLessonDay(date);

          return (
            <button
              key={date.getDate()}
              type="button"
              disabled={isPast}
              onClick={() => onChange(toIso(date))}
              className={`relative h-8 rounded-md text-xs font-medium transition-all ${
                isSelected
                  ? 'bg-brand-600 text-white'
                  : isToday
                    ? 'bg-gray-100 text-gray-900 font-bold'
                    : isPast
                      ? 'text-gray-300 cursor-default'
                      : isLesson
                        ? 'text-brand-700 hover:bg-brand-50 font-semibold'
                        : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              {date.getDate()}
              {isLesson && !isSelected && (
                <span className="absolute bottom-0.5 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-brand-500" />
              )}
            </button>
          );
        })}
      </div>

      {/* Legend + selected date */}
      <div className="flex items-center gap-3 mt-2 pt-2 border-t border-gray-100">
        <div className="flex items-center gap-1">
          <span className="w-1.5 h-1.5 rounded-full bg-brand-500" />
          <span className="text-[10px] text-gray-500">Lesson day</span>
        </div>
        {selectedDate && (
          <span className="text-[10px] text-gray-500 ml-auto">
            {selectedDate.toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long' })}
          </span>
        )}
      </div>
    </div>
  );
}

export default function HomeworkTab({ classGroupId, classGroupName }: Props) {
  const [homeworkList, setHomeworkList] = useState<HomeworkWithCounts[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [completions, setCompletions] = useState<CompletionStudent[]>([]);
  const [loadingCompletions, setLoadingCompletions] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [deleting, setDeleting] = useState<string | null>(null);

  // Form state
  const [formTitle, setFormTitle] = useState('');
  const [formDesc, setFormDesc] = useState('');
  const [formDue, setFormDue] = useState('');
  const [formLinks, setFormLinks] = useState('');
  const [submitting, setSubmitting] = useState(false);

  // Lesson days for this class (used by due-date calendar)
  const [lessonDays, setLessonDays] = useState<string[]>([]);

  useEffect(() => {
    async function fetchLessonDays() {
      try {
        const res = await api.get<{ data: StaffLesson[] }>('/staff/timetable');
        const classLessons = res.data.filter((l) => l.classGroupId === classGroupId);
        setLessonDays([...new Set(classLessons.map((l) => l.day))]);
      } catch {
        // silent
      }
    }
    fetchLessonDays();
  }, [classGroupId]);

  const fetchHomework = useCallback(async () => {
    try {
      const res = await api.get<{ data: HomeworkWithCounts[] }>(`/homework/class/${classGroupId}`);
      setHomeworkList(res.data);
    } catch {
      // silent
    } finally {
      setLoading(false);
    }
  }, [classGroupId]);

  useEffect(() => {
    fetchHomework();
  }, [fetchHomework]);

  const fetchCompletions = useCallback(async (homeworkId: string) => {
    setLoadingCompletions(true);
    try {
      const res = await api.get<{ data: CompletionStudent[] }>(`/homework/${homeworkId}/completions`);
      setCompletions(res.data);
    } catch {
      setCompletions([]);
    } finally {
      setLoadingCompletions(false);
    }
  }, []);

  function selectHomework(id: string) {
    setSelectedId(id);
    fetchCompletions(id);
  }

  async function toggleCompletion(studentId: string) {
    if (!selectedId) return;
    try {
      await api.post(`/homework/${selectedId}/completions`, { studentIds: [studentId] });
      // Optimistic update
      setCompletions((prev) =>
        prev.map((s) =>
          s.studentId === studentId
            ? { ...s, completed: !s.completed, completedAt: s.completed ? null : new Date().toISOString() }
            : s
        )
      );
      // Update counts in list
      setHomeworkList((prev) =>
        prev.map((h) =>
          h.id === selectedId
            ? {
                ...h,
                completedCount: h.completedCount + (completions.find((c) => c.studentId === studentId)?.completed ? -1 : 1),
              }
            : h
        )
      );
    } catch {
      // silent
    }
  }

  async function markAll(completed: boolean) {
    if (!selectedId) return;
    const toToggle = completions.filter((s) => s.completed !== completed);
    if (toToggle.length === 0) return;
    try {
      await api.post(`/homework/${selectedId}/completions`, {
        studentIds: toToggle.map((s) => s.studentId),
      });
      setCompletions((prev) => prev.map((s) => ({ ...s, completed, completedAt: completed ? new Date().toISOString() : null })));
      setHomeworkList((prev) =>
        prev.map((h) =>
          h.id === selectedId
            ? { ...h, completedCount: completed ? h.totalStudents : 0 }
            : h
        )
      );
    } catch {
      // silent
    }
  }

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    try {
      const links = formLinks
        .split(',')
        .map((l) => l.trim())
        .filter(Boolean);
      await api.post('/homework', {
        classGroupId,
        title: formTitle,
        description: formDesc,
        dueDate: formDue,
        links: links.length ? links : undefined,
      });
      setFormTitle('');
      setFormDesc('');
      setFormDue('');
      setFormLinks('');
      setShowForm(false);
      await fetchHomework();
    } catch {
      // silent
    } finally {
      setSubmitting(false);
    }
  }

  async function handleDelete(homeworkId: string) {
    setDeleting(homeworkId);
    try {
      await api.delete(`/homework/${homeworkId}`);
      if (selectedId === homeworkId) {
        setSelectedId(null);
        setCompletions([]);
      }
      await fetchHomework();
    } catch {
      // silent
    } finally {
      setDeleting(null);
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-16">
        <div className="animate-spin rounded-full h-8 w-8 border-2 border-brand-500 border-t-transparent" />
      </div>
    );
  }

  const selectedHw = homeworkList.find((h) => h.id === selectedId);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
      {/* Left panel — homework list */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-semibold text-gray-700">
            Homework — {classGroupName}
          </h3>
          <button
            onClick={() => setShowForm(!showForm)}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg
                       bg-brand-600 hover:bg-brand-700 text-white transition-colors"
          >
            {showForm ? <X size={14} /> : <Plus size={14} />}
            {showForm ? 'Cancel' : 'Set New Homework'}
          </button>
        </div>

        {/* Create form */}
        {showForm && (
          <form onSubmit={handleCreate} className="bg-white rounded-xl border border-gray-200 p-4 space-y-3">
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Title</label>
              <input
                type="text"
                required
                value={formTitle}
                onChange={(e) => setFormTitle(e.target.value)}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm
                           focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent"
                placeholder="e.g. Quadratic Equations Practice"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Description</label>
              <textarea
                required
                value={formDesc}
                onChange={(e) => setFormDesc(e.target.value)}
                rows={3}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm
                           focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent"
                placeholder="Describe the homework task..."
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Due Date</label>
              <DueDatePicker value={formDue} onChange={setFormDue} lessonDays={lessonDays} />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Links (comma-separated, optional)</label>
              <input
                type="text"
                value={formLinks}
                onChange={(e) => setFormLinks(e.target.value)}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm
                           focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent"
                placeholder="https://example.com/worksheet"
              />
            </div>
            <button
              type="submit"
              disabled={submitting || !formDue}
              className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium
                         bg-brand-600 hover:bg-brand-700 text-white transition-colors disabled:opacity-50"
            >
              {submitting ? (
                <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent" />
              ) : (
                <BookOpen size={14} />
              )}
              Set Homework
            </button>
          </form>
        )}

        {/* Homework cards */}
        {homeworkList.length === 0 ? (
          <div className="bg-white rounded-xl border border-gray-200 p-8 text-center">
            <p className="text-gray-400 text-sm">No homework set for this class yet.</p>
          </div>
        ) : (
          homeworkList.map((hw) => {
            const isOverdue = new Date(hw.dueDate) < new Date(new Date().toISOString().split('T')[0]);
            return (
              <button
                key={hw.id}
                onClick={() => selectHomework(hw.id)}
                className={`w-full text-left bg-white rounded-xl border p-4 transition-all hover:shadow-sm ${
                  selectedId === hw.id
                    ? 'border-brand-300 ring-2 ring-brand-200'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1 min-w-0">
                    <h4 className="text-sm font-semibold text-gray-900 truncate">{hw.title}</h4>
                    <p className="text-xs text-gray-500 mt-0.5 line-clamp-2">{hw.description}</p>
                    <div className="flex items-center gap-3 mt-2">
                      <span className={`text-xs font-medium ${isOverdue ? 'text-red-600' : 'text-gray-500'}`}>
                        Due: {new Date(hw.dueDate).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}
                      </span>
                      <span className="text-xs text-gray-400">
                        {hw.completedCount}/{hw.totalStudents} handed in
                      </span>
                    </div>
                    {hw.links && hw.links.length > 0 && (
                      <div className="flex items-center gap-1 mt-1">
                        <ExternalLink size={10} className="text-blue-500" />
                        <span className="text-[10px] text-blue-500">{hw.links.length} link{hw.links.length !== 1 ? 's' : ''}</span>
                      </div>
                    )}
                  </div>
                  <div className="flex items-center gap-1 flex-shrink-0">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        if (window.confirm(`Delete "${hw.title}"?`)) handleDelete(hw.id);
                      }}
                      disabled={deleting === hw.id}
                      className="p-1.5 rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50 transition-colors"
                      title="Delete homework"
                    >
                      <Trash2 size={14} />
                    </button>
                    <ChevronRight size={16} className="text-gray-300" />
                  </div>
                </div>
              </button>
            );
          })
        )}
      </div>

      {/* Right panel — completion tracker */}
      <div>
        {!selectedId ? (
          <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
            <BookOpen size={24} className="mx-auto text-gray-300 mb-2" />
            <p className="text-gray-400 text-sm">Select a homework to view completions</p>
          </div>
        ) : loadingCompletions ? (
          <div className="flex items-center justify-center py-16">
            <div className="animate-spin rounded-full h-6 w-6 border-2 border-brand-500 border-t-transparent" />
          </div>
        ) : (
          <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
            {/* Header */}
            <div className="px-4 py-3 border-b border-gray-200 bg-gray-50">
              <h4 className="text-sm font-semibold text-gray-900">{selectedHw?.title}</h4>
              <p className="text-xs text-gray-500 mt-0.5">
                Due: {selectedHw && new Date(selectedHw.dueDate).toLocaleDateString('en-GB', { weekday: 'short', day: 'numeric', month: 'short' })}
                {' · '}
                {completions.filter((s) => s.completed).length}/{completions.length} handed in
              </p>
            </div>

            {/* Bulk actions */}
            <div className="flex items-center gap-2 px-4 py-2 border-b border-gray-100">
              <button
                onClick={() => markAll(true)}
                className="flex items-center gap-1 px-2.5 py-1 text-xs font-medium rounded-md
                           border border-emerald-300 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 transition-colors"
              >
                <CheckCheck size={12} /> Mark All
              </button>
              <button
                onClick={() => markAll(false)}
                className="flex items-center gap-1 px-2.5 py-1 text-xs font-medium rounded-md
                           border border-gray-300 bg-gray-50 text-gray-600 hover:bg-gray-100 transition-colors"
              >
                <X size={12} /> Unmark All
              </button>
            </div>

            {/* Student list */}
            <div className="divide-y divide-gray-50 max-h-[500px] overflow-y-auto">
              {completions.map((student) => (
                <div
                  key={student.studentId}
                  className="flex items-center justify-between px-4 py-2.5 hover:bg-gray-50/50 transition-colors"
                >
                  <div>
                    <span className="text-sm text-gray-900">
                      {student.lastName}, {student.firstName}
                    </span>
                    {student.completed && student.completedAt && (
                      <span className="ml-2 text-[10px] text-gray-400">
                        {new Date(student.completedAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}
                      </span>
                    )}
                  </div>
                  <button
                    onClick={() => toggleCompletion(student.studentId)}
                    className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium transition-all ${
                      student.completed
                        ? 'bg-emerald-100 text-emerald-700 border border-emerald-300'
                        : 'bg-gray-100 text-gray-500 border border-gray-200 hover:bg-gray-200'
                    }`}
                  >
                    <Check size={12} />
                    {student.completed ? 'Handed in' : 'Not handed in'}
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
