// ============================================================
// Parent dashboard — pulls together all child-data widgets
// ============================================================

import { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import AttendanceSummary from '../components/AttendanceSummary';
import BehaviourLog from '../components/BehaviourLog';
import Timetable from '../components/Timetable';
import NewsFeed from '../components/NewsFeed';
import type {
  Student,
  AttendanceSummary as AttendanceData,
  BehaviourEvent,
  TimetableLesson,
  Announcement,
} from '../types';

interface DashboardData {
  student: Student;
  attendance: AttendanceData;
  behaviour: BehaviourEvent[];
  timetable: TimetableLesson[];
  announcements: Announcement[];
}

export default function ParentDashboard() {
  const { user } = useAuth();
  const [data, setData] = useState<DashboardData | null>(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user || user.studentIds.length === 0) return;

    const studentId = user.studentIds[0]; // first child for now

    async function fetchAll() {
      try {
        // Fetch all data in parallel
        const [studentRes, attendanceRes, behaviourRes, timetableRes, announcementsRes] =
          await Promise.all([
            api.get<{ data: Student }>(`/students/${studentId}`),
            api.get<{ data: AttendanceData }>(`/students/${studentId}/attendance`),
            api.get<{ data: BehaviourEvent[] }>(`/students/${studentId}/behaviour`),
            api.get<{ data: TimetableLesson[] }>(`/students/${studentId}/timetable`),
            api.get<{ data: Announcement[] }>('/announcements'),
          ]);

        setData({
          student: studentRes.data,
          attendance: attendanceRes.data,
          behaviour: behaviourRes.data,
          timetable: timetableRes.data,
          announcements: announcementsRes.data,
        });
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load dashboard');
      } finally {
        setLoading(false);
      }
    }

    fetchAll();
  }, [user]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="animate-spin rounded-full h-8 w-8 border-2 border-brand-500 border-t-transparent" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-xl bg-red-50 border border-red-200 text-red-700 p-4 text-sm">
        {error}
      </div>
    );
  }

  if (!data) return null;

  return (
    <div>
      {/* Student header */}
      <div className="mb-6">
        <h1 className="text-xl font-bold text-gray-900">
          {data.student.firstName} {data.student.lastName}
        </h1>
        <p className="text-sm text-gray-500">
          Year {data.student.yearGroup} · {data.student.formGroup}
        </p>
      </div>

      {/* Dashboard grid — stacks on mobile, 2-column on larger screens */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <AttendanceSummary data={data.attendance} />
        <Timetable lessons={data.timetable} />
        <BehaviourLog events={data.behaviour} />
        <NewsFeed announcements={data.announcements} />
      </div>
    </div>
  );
}
