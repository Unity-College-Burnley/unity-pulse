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
  Shield, Plus, X, Trash2, AlertTriangle,
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
  PastoralNote,
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

const PASTORAL_CATEGORIES = [
  { value: 'safeguarding', label: 'Safeguarding' },
  { value: 'welfare', label: 'Welfare' },
  { value: 'attendance', label: 'Attendance' },
  { value: 'behavioural', label: 'Behavioural' },
  { value: 'family', label: 'Family' },
  { value: 'medical', label: 'Medical' },
  { value: 'other', label: 'Other' },
] as const;

const SEVERITY_OPTIONS = [
  { value: 'low', label: 'Low', color: 'bg-blue-100 text-blue-700' },
  { value: 'medium', label: 'Medium', color: 'bg-amber-100 text-amber-700' },
  { value: 'high', label: 'High', color: 'bg-red-100 text-red-700' },
] as const;

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

  // Profile tab
  const [activeTab, setActiveTab] = useState<'Overview' | 'Behaviour' | 'Pastoral'>('Overview');

  // Inline behaviour logger state
  const [behType, setBehType] = useState<'positive' | 'negative'>('positive');
  const [behCategory, setBehCategory] = useState('');
  const [behPoints, setBehPoints] = useState(1);
  const [behNote, setBehNote] = useState('');
  const [behStatus, setBehStatus] = useState<'idle' | 'saving' | 'success' | 'error'>('idle');

  // Pastoral notes state
  const [pastoralNotes, setPastoralNotes] = useState<PastoralNote[]>([]);
  const [showPastoralForm, setShowPastoralForm] = useState(false);
  const [pastCategory, setPastCategory] = useState('');
  const [pastSeverity, setPastSeverity] = useState('');
  const [pastTitle, setPastTitle] = useState('');
  const [pastBody, setPastBody] = useState('');
  const [pastStatus, setPastStatus] = useState<'idle' | 'saving' | 'success' | 'error'>('idle');

  // Redirect parents away
  if (user?.role === 'parent') {
    return <Navigate to="/dashboard" replace />;
  }

  useEffect(() => {
    if (!studentId) return;

    async function fetchAll() {
      setLoading(true);
      try {
        const [stuRes, attRes, behRes, ttRes, clsRes, conRes, pastRes] = await Promise.all([
          api.get<{ data: Student }>(`/students/${studentId}`),
          api.get<{ data: AttendanceData }>(`/students/${studentId}/attendance`),
          api.get<{ data: BehaviourEvent[] }>(`/students/${studentId}/behaviour`),
          api.get<{ data: TimetableLesson[] }>(`/students/${studentId}/timetable`),
          api.get<{ data: StudentClassGroup[] }>(`/students/${studentId}/classes`),
          api.get<{ data: ParentContact[] }>(`/students/${studentId}/contacts`),
          api.get<{ data: PastoralNote[] }>(`/pastoral/student/${studentId}`),
        ]);
        setStudent(stuRes.data);
        setAttendance(attRes.data);
        setBehaviour(behRes.data);
        setTimetable(ttRes.data);
        setClassGroups(clsRes.data);
        setContacts(conRes.data);
        setPastoralNotes(pastRes.data);
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

  async function handlePastoralSubmit(e: FormEvent) {
    e.preventDefault();
    setPastStatus('saving');
    try {
      const res = await api.post<{ data: PastoralNote }>('/pastoral', {
        studentId,
        category: pastCategory,
        severity: pastSeverity,
        title: pastTitle,
        body: pastBody,
      });
      setPastoralNotes((prev) => [res.data, ...prev]);
      setPastCategory('');
      setPastSeverity('');
      setPastTitle('');
      setPastBody('');
      setShowPastoralForm(false);
      setPastStatus('success');
      setTimeout(() => setPastStatus('idle'), 3000);
    } catch {
      setPastStatus('error');
    }
  }

  async function handleDeletePastoral(noteId: string) {
    try {
      await api.delete(`/pastoral/${noteId}`);
      setPastoralNotes((prev) => prev.filter((n) => n.id !== noteId));
    } catch {
      // silent
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

  const PROFILE_TABS = ['Overview', 'Behaviour', 'Pastoral'] as const;

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

      {/* Tabs */}
      <div className="flex mb-5 border-b border-gray-200">
        {PROFILE_TABS.map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`flex-1 px-1 py-2 text-sm font-medium text-center rounded-t-lg whitespace-nowrap transition-colors ${
              activeTab === tab
                ? 'text-brand-600 border-b-2 border-brand-500 bg-brand-50/50'
                : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
            }`}
          >
            {tab}
            {tab === 'Pastoral' && pastoralNotes.length > 0 && (
              <span className="ml-1.5 px-1.5 py-0.5 rounded-full bg-brand-100 text-brand-700 text-[10px] font-bold">
                {pastoralNotes.length}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* ============ Overview tab ============ */}
      {activeTab === 'Overview' && (
        <div className="space-y-5">
          {/* Class groups + contacts row */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
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

          {/* Attendance + timetable */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
            {attendance && <AttendanceSummary data={attendance} />}
            <Timetable lessons={timetable} />
          </div>
        </div>
      )}

      {/* ============ Behaviour tab ============ */}
      {activeTab === 'Behaviour' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          <BehaviourLog events={behaviour} />

          <section className="bg-white rounded-xl shadow-sm border border-gray-200 p-5">
            <h2 className="text-base font-semibold text-gray-900 mb-4">Log Behaviour</h2>

            <form onSubmit={handleBehaviourSubmit} className="space-y-3">
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
      )}

      {/* ============ Pastoral tab ============ */}
      {activeTab === 'Pastoral' && (
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-base font-semibold text-gray-900 flex items-center gap-2">
              <Shield size={16} className="text-brand-600" />
              Pastoral Log
            </h2>
            <button
              onClick={() => setShowPastoralForm(!showPastoralForm)}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg
                         bg-brand-600 hover:bg-brand-700 text-white transition-colors"
            >
              {showPastoralForm ? <X size={14} /> : <Plus size={14} />}
              {showPastoralForm ? 'Cancel' : 'New Note'}
            </button>
          </div>

          {pastStatus === 'success' && (
            <div className="flex items-center gap-2 rounded-lg bg-green-50 border border-green-200 text-green-700 text-sm px-3 py-2 mb-3">
              <CheckCircle size={16} /> Pastoral note logged successfully.
            </div>
          )}

          {showPastoralForm && (
            <form onSubmit={handlePastoralSubmit} className="rounded-lg border border-gray-200 bg-gray-50 p-4 space-y-3 mb-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label htmlFor="past-category" className="block text-sm font-medium text-gray-700 mb-1">
                    Category
                  </label>
                  <select
                    id="past-category"
                    value={pastCategory}
                    onChange={(e) => setPastCategory(e.target.value)}
                    required
                    className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm
                               focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent"
                  >
                    <option value="">Select category...</option>
                    {PASTORAL_CATEGORIES.map((c) => (
                      <option key={c.value} value={c.value}>{c.label}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label htmlFor="past-severity" className="block text-sm font-medium text-gray-700 mb-1">
                    Severity
                  </label>
                  <select
                    id="past-severity"
                    value={pastSeverity}
                    onChange={(e) => setPastSeverity(e.target.value)}
                    required
                    className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm
                               focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent"
                  >
                    <option value="">Select severity...</option>
                    {SEVERITY_OPTIONS.map((s) => (
                      <option key={s.value} value={s.value}>{s.label}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label htmlFor="past-title" className="block text-sm font-medium text-gray-700 mb-1">
                  Title
                </label>
                <input
                  id="past-title"
                  type="text"
                  value={pastTitle}
                  onChange={(e) => setPastTitle(e.target.value)}
                  required
                  placeholder="Brief summary..."
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm
                             focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent"
                />
              </div>

              <div>
                <label htmlFor="past-body" className="block text-sm font-medium text-gray-700 mb-1">
                  Details
                </label>
                <textarea
                  id="past-body"
                  value={pastBody}
                  onChange={(e) => setPastBody(e.target.value)}
                  required
                  rows={3}
                  placeholder="Full details of the concern, actions taken, and any follow-up needed..."
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm
                             focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent resize-none"
                />
              </div>

              {pastStatus === 'error' && (
                <div className="flex items-center gap-2 rounded-lg bg-red-50 border border-red-200 text-red-700 text-sm px-3 py-2">
                  <AlertCircle size={16} /> Failed to save note.
                </div>
              )}

              <button
                type="submit"
                disabled={pastStatus === 'saving'}
                className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium
                           bg-brand-600 hover:bg-brand-700 text-white transition-colors disabled:opacity-50"
              >
                {pastStatus === 'saving' ? 'Saving...' : 'Save Pastoral Note'}
              </button>
            </form>
          )}

          {pastoralNotes.length === 0 && !showPastoralForm ? (
            <div className="text-center py-6">
              <Shield size={24} className="mx-auto text-gray-300 mb-2" />
              <p className="text-gray-400 text-sm">No pastoral notes for this student.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {pastoralNotes.map((note) => {
                const sevOption = SEVERITY_OPTIONS.find((s) => s.value === note.severity);
                const catOption = PASTORAL_CATEGORIES.find((c) => c.value === note.category);
                return (
                  <div
                    key={note.id}
                    className={`rounded-lg border p-4 group ${
                      note.severity === 'high'
                        ? 'border-red-200 bg-red-50/50'
                        : note.severity === 'medium'
                        ? 'border-amber-200 bg-amber-50/30'
                        : 'border-gray-200 bg-gray-50'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2 mb-1 flex-wrap">
                          <h3 className="text-sm font-semibold text-gray-900">{note.title}</h3>
                          <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold ${sevOption?.color || 'bg-gray-100 text-gray-600'}`}>
                            {sevOption?.label || note.severity}
                          </span>
                          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-medium bg-gray-100 text-gray-600">
                            {catOption?.label || note.category}
                          </span>
                          {note.severity === 'high' && (
                            <AlertTriangle size={14} className="text-red-500" />
                          )}
                        </div>
                        <p className="text-sm text-gray-700 whitespace-pre-wrap">{note.body}</p>
                        <p className="text-[10px] text-gray-400 mt-2">
                          {note.staffName} &middot; {new Date(note.createdAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
                          {' at '}
                          {new Date(note.createdAt).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })}
                        </p>
                      </div>
                      <button
                        onClick={() => {
                          if (window.confirm('Delete this pastoral note?')) handleDeletePastoral(note.id);
                        }}
                        className="p-1 rounded-lg text-gray-300 hover:text-red-500 hover:bg-red-50
                                   transition-colors opacity-0 group-hover:opacity-100 flex-shrink-0"
                        title="Delete note"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
