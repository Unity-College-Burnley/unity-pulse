// ============================================================
// Student profile — view a student's attendance, behaviour,
// timetable, class groups, parent contacts, and log behaviour.
// Staff/admin only.
// ============================================================

import { useEffect, useState, type FormEvent } from 'react';
import { useParams, useNavigate, Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import {
  ArrowLeft, Mail, Users, BookOpen, CheckCircle, AlertCircle,
} from 'lucide-react';
import AttendanceSummary from '../components/AttendanceSummary';
import Timetable from '../components/Timetable';
import BehaviourLog from '../components/BehaviourLog';
import type {
  Student,
  AttendanceSummary as AttendanceData,
  BehaviourEvent,
  TimetableLesson,
  StudentClassGroup,
  ParentContact,
} from '../types';

const POSITIVE_CATEGORIES = [
  'Outstanding Classwork',
  'Excellent Homework',
  'Helping Others',
  'Active Participation',
  'Great Effort',
  'Positive Attitude',
];

const NEGATIVE_CATEGORIES = [
  'Late to Lesson',
  'Incomplete Homework',
  'Disruption',
  'Off Task',
  'Uniform Issue',
  'Equipment Missing',
];

export default function StudentProfile() {
  const { studentId } = useParams<{ studentId: string }>();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [student, setStudent] = useState<Student | null>(null);
  const [attendance, setAttendance] = useState<AttendanceData | null>(null);
  const [behaviour, setBehaviour] = useState<BehaviourEvent[]>([]);
  const [timetable, setTimetable] = useState<TimetableLesson[]>([]);
  const [classGroups, setClassGroups] = useState<StudentClassGroup[]>([]);
  const [contacts, setContacts] = useState<ParentContact[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Inline behaviour logger state
  const [behType, setBehType] = useState<'positive' | 'negative'>('positive');
  const [behCategory, setBehCategory] = useState('');
  const [behPoints, setBehPoints] = useState(1);
  const [behNote, setBehNote] = useState('');
  const [behStatus, setBehStatus] = useState<'idle' | 'saving' | 'success' | 'error'>('idle');

  // Redirect parents away
  if (user?.role === 'parent') {
    return <Navigate to="/dashboard" replace />;
  }

  useEffect(() => {
    if (!studentId) return;

    async function fetchAll() {
      setLoading(true);
      try {
        const [stuRes, attRes, behRes, ttRes, clsRes, conRes] = await Promise.all([
          api.get<{ data: Student }>(`/students/${studentId}`),
          api.get<{ data: AttendanceData }>(`/students/${studentId}/attendance`),
          api.get<{ data: BehaviourEvent[] }>(`/students/${studentId}/behaviour`),
          api.get<{ data: TimetableLesson[] }>(`/students/${studentId}/timetable`),
          api.get<{ data: StudentClassGroup[] }>(`/students/${studentId}/classes`),
          api.get<{ data: ParentContact[] }>(`/students/${studentId}/contacts`),
        ]);
        setStudent(stuRes.data);
        setAttendance(attRes.data);
        setBehaviour(behRes.data);
        setTimetable(ttRes.data);
        setClassGroups(clsRes.data);
        setContacts(conRes.data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load student');
      } finally {
        setLoading(false);
      }
    }
    fetchAll();
  }, [studentId]);

  async function handleBehaviourSubmit(e: FormEvent) {
    e.preventDefault();
    setBehStatus('saving');

    try {
      const res = await api.post<{ data: BehaviourEvent }>('/staff/behaviour', {
        studentId,
        type: behType,
        category: behCategory,
        points: behPoints,
        note: behNote,
      });
      setBehStatus('success');
      // Add the new event to the behaviour list
      setBehaviour((prev) => [res.data, ...prev]);
      // Reset form
      setBehCategory('');
      setBehPoints(1);
      setBehNote('');
      setTimeout(() => setBehStatus('idle'), 3000);
    } catch {
      setBehStatus('error');
    }
  }

  const behCategories = behType === 'positive' ? POSITIVE_CATEGORIES : NEGATIVE_CATEGORIES;

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="animate-spin rounded-full h-8 w-8 border-2 border-brand-500 border-t-transparent" />
      </div>
    );
  }

  if (error || !student) {
    return (
      <div className="text-center py-20">
        <p className="text-gray-500 text-sm">{error || 'Student not found'}</p>
        <button
          onClick={() => navigate('/dashboard')}
          className="mt-3 text-brand-600 hover:underline text-sm"
        >
          Back to dashboard
        </button>
      </div>
    );
  }

  return (
    <div>
      {/* Header */}
      <div className="flex items-start gap-3 mb-5">
        <button
          onClick={() => navigate(-1)}
          className="mt-0.5 p-1.5 rounded-lg hover:bg-gray-100 text-gray-500 transition-colors flex-shrink-0"
          aria-label="Go back"
        >
          <ArrowLeft size={18} />
        </button>
        <div>
          <h1 className="text-xl font-bold text-gray-900">
            {student.firstName} {student.lastName}
          </h1>
          <p className="text-sm text-gray-500">
            Year {student.yearGroup} &middot; {student.formGroup}
          </p>
        </div>
      </div>

      {/* Staff context row */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-5">
        {/* Class groups */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
          <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2 flex items-center gap-1.5">
            <BookOpen size={12} /> Class Groups
          </h3>
          {classGroups.length > 0 ? (
            <div className="flex flex-wrap gap-1.5">
              {classGroups.map((g) => (
                <span
                  key={g.id}
                  className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-brand-50 text-brand-700 border border-brand-100"
                >
                  {g.name} &mdash; {g.subject} &mdash; {g.teacherName}
                </span>
              ))}
            </div>
          ) : (
            <p className="text-sm text-gray-400">No class groups on file</p>
          )}
        </div>

        {/* Parent contacts */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
          <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2 flex items-center gap-1.5">
            <Users size={12} /> Parent Contacts
          </h3>
          {contacts.length > 0 ? (
            <ul className="space-y-1.5">
              {contacts.map((c) => (
                <li key={c.id} className="flex items-center justify-between text-sm">
                  <span className="text-gray-700 font-medium">
                    {c.firstName} {c.lastName}
                  </span>
                  <a
                    href={`mailto:${c.email}`}
                    className="flex items-center gap-1 text-brand-600 hover:text-brand-700 text-xs hover:underline"
                  >
                    <Mail size={12} />
                    {c.email}
                  </a>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-sm text-gray-400">No contacts on file</p>
          )}
        </div>
      </div>

      {/* Widget grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Attendance */}
        {attendance && <AttendanceSummary data={attendance} />}

        {/* Timetable */}
        <Timetable lessons={timetable} />

        {/* Behaviour log */}
        <BehaviourLog events={behaviour} />

        {/* Inline behaviour logger */}
        <section className="bg-white rounded-xl shadow-sm border border-gray-200 p-5">
          <h2 className="text-base font-semibold text-gray-900 mb-4">Log Behaviour</h2>

          <form onSubmit={handleBehaviourSubmit} className="space-y-3">
            {/* Type toggle */}
            <div className="flex rounded-lg bg-gray-100 p-0.5">
              <button
                type="button"
                onClick={() => { setBehType('positive'); setBehCategory(''); }}
                className={`flex-1 px-3 py-1.5 text-sm font-medium rounded-md transition-colors ${
                  behType === 'positive'
                    ? 'bg-green-500 text-white shadow-sm'
                    : 'text-gray-600 hover:text-gray-800'
                }`}
              >
                Positive
              </button>
              <button
                type="button"
                onClick={() => { setBehType('negative'); setBehCategory(''); }}
                className={`flex-1 px-3 py-1.5 text-sm font-medium rounded-md transition-colors ${
                  behType === 'negative'
                    ? 'bg-red-500 text-white shadow-sm'
                    : 'text-gray-600 hover:text-gray-800'
                }`}
              >
                Negative
              </button>
            </div>

            {/* Category */}
            <div>
              <label htmlFor="sp-beh-category" className="block text-sm font-medium text-gray-700 mb-1">
                Category
              </label>
              <select
                id="sp-beh-category"
                value={behCategory}
                onChange={(e) => setBehCategory(e.target.value)}
                required
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm
                           focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent"
              >
                <option value="">Select a category...</option>
                {behCategories.map((cat) => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>

            {/* Points */}
            <div>
              <label htmlFor="sp-beh-points" className="block text-sm font-medium text-gray-700 mb-1">
                Points
              </label>
              <input
                id="sp-beh-points"
                type="number"
                min={1}
                max={5}
                value={behPoints}
                onChange={(e) => setBehPoints(Number(e.target.value))}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm
                           focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent"
              />
            </div>

            {/* Note */}
            <div>
              <label htmlFor="sp-beh-note" className="block text-sm font-medium text-gray-700 mb-1">
                Note
              </label>
              <textarea
                id="sp-beh-note"
                value={behNote}
                onChange={(e) => setBehNote(e.target.value)}
                required
                rows={2}
                placeholder="Brief description..."
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm
                           focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent resize-none"
              />
            </div>

            {/* Status messages */}
            {behStatus === 'success' && (
              <div className="flex items-center gap-2 rounded-lg bg-green-50 border border-green-200 text-green-700 text-sm px-3 py-2">
                <CheckCircle size={16} /> Behaviour logged successfully.
              </div>
            )}
            {behStatus === 'error' && (
              <div className="flex items-center gap-2 rounded-lg bg-red-50 border border-red-200 text-red-700 text-sm px-3 py-2">
                <AlertCircle size={16} /> Failed to log behaviour.
              </div>
            )}

            {/* Submit */}
            <button
              type="submit"
              disabled={behStatus === 'saving'}
              className={`w-full font-medium rounded-lg px-4 py-2.5 text-sm transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${
                behType === 'positive'
                  ? 'bg-green-600 hover:bg-green-700 text-white'
                  : 'bg-red-600 hover:bg-red-700 text-white'
              }`}
            >
              {behStatus === 'saving' ? 'Saving...' : `Log ${behType} behaviour`}
            </button>
          </form>
        </section>
      </div>
    </div>
  );
}
