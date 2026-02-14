// ============================================================
// Admin dashboard — whole-school overview for senior leadership
// Attendance overview, behaviour trends, announcement management.
// ============================================================

import { useEffect, useState, type FormEvent } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../services/api';
import {
  Users, CheckCircle, XCircle, TrendingUp, TrendingDown,
  ThumbsUp, ThumbsDown, Pin, Trash2, Plus, X,
} from 'lucide-react';
import type { Announcement } from '../types';

interface AttendanceOverview {
  totalStudents: number;
  presentToday: number;
  absentToday: number;
  averageAttendance: number;
  belowThreshold: Array<{
    studentId: string;
    studentName: string;
    yearGroup: number;
    formGroup: string;
    percentage: number;
  }>;
  byYearGroup: Array<{
    yearGroup: number;
    totalStudents: number;
    presentToday: number;
    absentToday: number;
    averageAttendance: number;
  }>;
}

interface BehaviourOverview {
  totalPositive: number;
  totalNegative: number;
  totalPositivePoints: number;
  totalNegativePoints: number;
  topCategories: Array<{ category: string; count: number }>;
  recentEvents: Array<{
    id: string;
    type: 'positive' | 'negative';
    category: string;
    points: number;
    note: string;
    staffName: string;
    studentName: string;
    timestamp: string;
  }>;
}

export default function AdminDashboard() {
  const [attendance, setAttendance] = useState<AttendanceOverview | null>(null);
  const [behaviour, setBehaviour] = useState<BehaviourOverview | null>(null);
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showNewAnnouncement, setShowNewAnnouncement] = useState(false);

  useEffect(() => {
    async function fetchAll() {
      try {
        const [attRes, behRes, annRes] = await Promise.all([
          api.get<{ data: AttendanceOverview }>('/admin/attendance-overview'),
          api.get<{ data: BehaviourOverview }>('/admin/behaviour-overview'),
          api.get<{ data: Announcement[] }>('/announcements'),
        ]);
        setAttendance(attRes.data);
        setBehaviour(behRes.data);
        setAnnouncements(annRes.data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load dashboard');
      } finally {
        setLoading(false);
      }
    }
    fetchAll();
  }, []);

  async function handleDeleteAnnouncement(id: string) {
    try {
      await api.delete(`/admin/announcements/${id}`);
    } catch {
      // silently fail
    }
    setAnnouncements((prev) => prev.filter((a) => a.id !== id));
  }

  async function handleCreateAnnouncement(title: string, body: string, pinned: boolean) {
    try {
      const res = await api.post<{ data: Announcement }>('/admin/announcements', {
        title,
        body,
        pinned,
      });
      setAnnouncements((prev) => [res.data, ...prev]);
      setShowNewAnnouncement(false);
    } catch {
      // silently fail for now
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="animate-spin rounded-full h-8 w-8 border-2 border-brand-500 border-t-transparent" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-xl bg-red-50 border border-red-200 text-red-700 p-4 text-sm">{error}</div>
    );
  }

  return (
    <div>
      <h1 className="text-xl font-bold text-gray-900 mb-6">School Overview</h1>

      {/* Top-level stats */}
      {attendance && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
          <StatCard icon={<Users size={18} />} label="Total students" value={attendance.totalStudents} colour="text-gray-700" />
          <StatCard icon={<CheckCircle size={18} />} label="Present today" value={attendance.presentToday} colour="text-green-600" />
          <StatCard icon={<XCircle size={18} />} label="Absent today" value={attendance.absentToday} colour="text-red-600" />
          <StatCard icon={<TrendingUp size={18} />} label="Avg attendance" value={`${attendance.averageAttendance}%`} colour="text-brand-600" />
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Attendance by year group */}
        {attendance && (
          <section className="bg-white rounded-xl shadow-sm border border-gray-200 p-5">
            <h2 className="text-base font-semibold text-gray-900 mb-4">Attendance by Year Group</h2>
            <div className="space-y-3">
              {attendance.byYearGroup.map((yg) => {
                const pct = yg.totalStudents > 0
                  ? Math.round((yg.presentToday / yg.totalStudents) * 100)
                  : 0;
                return (
                  <div key={yg.yearGroup} className="flex items-center gap-3">
                    <span className="text-sm font-medium text-gray-700 w-16">Year {yg.yearGroup}</span>
                    <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full ${pct >= 95 ? 'bg-green-500' : pct >= 85 ? 'bg-amber-500' : 'bg-red-500'}`}
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                    <span className="text-sm text-gray-600 w-20 text-right">
                      {yg.presentToday}/{yg.totalStudents} ({yg.averageAttendance}%)
                    </span>
                  </div>
                );
              })}
            </div>

            {/* Below threshold */}
            {attendance.belowThreshold.length > 0 && (
              <div className="mt-4 pt-4 border-t border-gray-100">
                <h3 className="text-xs font-medium text-red-600 uppercase tracking-wide mb-2 flex items-center gap-1">
                  <TrendingDown size={12} /> Below 90% attendance
                </h3>
                <ul className="space-y-1">
                  {attendance.belowThreshold.map((s) => (
                    <li key={s.studentId} className="flex items-center justify-between text-sm">
                      <Link
                        to={`/student/${s.studentId}`}
                        className="text-gray-700 hover:text-brand-600 hover:underline"
                      >
                        {s.studentName} <span className="text-gray-400">({s.formGroup})</span>
                      </Link>
                      <span className="font-medium text-red-600">{s.percentage}%</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </section>
        )}

        {/* Behaviour overview */}
        {behaviour && (
          <section className="bg-white rounded-xl shadow-sm border border-gray-200 p-5">
            <h2 className="text-base font-semibold text-gray-900 mb-4">Behaviour Summary</h2>

            <div className="flex gap-3 mb-4">
              <div className="flex-1 rounded-lg bg-green-50 border border-green-100 px-3 py-2 text-center">
                <p className="text-xl font-bold text-green-700">{behaviour.totalPositive}</p>
                <p className="text-xs text-green-600">Positive events (+{behaviour.totalPositivePoints} pts)</p>
              </div>
              <div className="flex-1 rounded-lg bg-red-50 border border-red-100 px-3 py-2 text-center">
                <p className="text-xl font-bold text-red-700">{behaviour.totalNegative}</p>
                <p className="text-xs text-red-600">Negative events (-{behaviour.totalNegativePoints} pts)</p>
              </div>
            </div>

            {/* Top categories */}
            <h3 className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-2">Top categories</h3>
            <ul className="space-y-1.5 mb-4">
              {behaviour.topCategories.map((cat) => (
                <li key={cat.category} className="flex items-center justify-between text-sm">
                  <span className="text-gray-700">{cat.category}</span>
                  <span className="text-gray-500">{cat.count}</span>
                </li>
              ))}
            </ul>

            {/* Recent events */}
            <h3 className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-2">Recent events</h3>
            <ul className="space-y-2">
              {behaviour.recentEvents.slice(0, 5).map((event) => (
                <li key={event.id} className="flex items-start gap-2 text-sm">
                  {event.type === 'positive'
                    ? <ThumbsUp size={14} className="text-green-500 mt-0.5 flex-shrink-0" />
                    : <ThumbsDown size={14} className="text-red-500 mt-0.5 flex-shrink-0" />
                  }
                  <div className="min-w-0">
                    <span className="font-medium text-gray-900">{event.studentName}</span>
                    <span className="text-gray-400"> · </span>
                    <span className="text-gray-600">{event.category}</span>
                    <p className="text-xs text-gray-400">{event.staffName}</p>
                  </div>
                </li>
              ))}
            </ul>
          </section>
        )}

        {/* Announcements management — full width */}
        <section className="bg-white rounded-xl shadow-sm border border-gray-200 p-5 lg:col-span-2">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-base font-semibold text-gray-900">Announcements</h2>
            <button
              onClick={() => setShowNewAnnouncement(!showNewAnnouncement)}
              className="flex items-center gap-1 text-sm font-medium text-brand-500 hover:text-brand-600 transition-colors"
            >
              {showNewAnnouncement ? <X size={16} /> : <Plus size={16} />}
              {showNewAnnouncement ? 'Cancel' : 'New'}
            </button>
          </div>

          {/* New announcement form */}
          {showNewAnnouncement && (
            <AnnouncementForm onSubmit={handleCreateAnnouncement} />
          )}

          {/* Existing announcements */}
          <ul className="space-y-3">
            {announcements.map((ann) => (
              <li key={ann.id} className="border border-gray-100 rounded-lg p-3">
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      {ann.pinned && <Pin size={12} className="text-brand-500 flex-shrink-0" />}
                      <h3 className="text-sm font-semibold text-gray-900">{ann.title}</h3>
                    </div>
                    <p className="text-sm text-gray-600 mt-1">{ann.body}</p>
                    <p className="text-xs text-gray-400 mt-1">
                      {ann.author} · {new Date(ann.publishedAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
                    </p>
                  </div>
                  <button
                    onClick={() => handleDeleteAnnouncement(ann.id)}
                    className="p-1.5 rounded-md hover:bg-red-50 text-gray-400 hover:text-red-500 transition-colors flex-shrink-0"
                    aria-label={`Delete announcement: ${ann.title}`}
                  >
                    <Trash2 size={15} />
                  </button>
                </div>
              </li>
            ))}
          </ul>
        </section>
      </div>
    </div>
  );
}

/** Small stat card for the top row */
function StatCard({ icon, label, value, colour }: {
  icon: React.ReactNode;
  label: string;
  value: string | number;
  colour: string;
}) {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
      <div className={`flex items-center gap-2 mb-1 ${colour}`}>
        {icon}
        <span className="text-xs text-gray-500">{label}</span>
      </div>
      <p className={`text-2xl font-bold ${colour}`}>{value}</p>
    </div>
  );
}

/** Inline form for creating a new announcement */
function AnnouncementForm({ onSubmit }: {
  onSubmit: (title: string, body: string, pinned: boolean) => void;
}) {
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [pinned, setPinned] = useState(false);

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!title.trim() || !body.trim()) return;
    onSubmit(title, body, pinned);
  }

  return (
    <form onSubmit={handleSubmit} className="mb-4 p-3 border border-brand-100 bg-brand-50 rounded-lg space-y-3">
      <div>
        <label htmlFor="ann-title" className="block text-sm font-medium text-gray-700 mb-1">Title</label>
        <input
          id="ann-title"
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
          className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent"
          placeholder="Announcement title"
        />
      </div>
      <div>
        <label htmlFor="ann-body" className="block text-sm font-medium text-gray-700 mb-1">Body</label>
        <textarea
          id="ann-body"
          value={body}
          onChange={(e) => setBody(e.target.value)}
          required
          rows={3}
          className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent resize-none"
          placeholder="Write your announcement…"
        />
      </div>
      <div className="flex items-center justify-between">
        <label className="flex items-center gap-2 text-sm text-gray-700 cursor-pointer">
          <input
            type="checkbox"
            checked={pinned}
            onChange={(e) => setPinned(e.target.checked)}
            className="rounded border-gray-300 text-brand-500 focus:ring-brand-500"
          />
          Pin to top
        </label>
        <button
          type="submit"
          className="bg-brand-500 hover:bg-brand-600 text-white font-medium rounded-lg px-4 py-2 text-sm transition-colors"
        >
          Publish
        </button>
      </div>
    </form>
  );
}
