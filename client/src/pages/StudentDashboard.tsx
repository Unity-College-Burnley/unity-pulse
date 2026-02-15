// ============================================================
// Student dashboard — student's own view of their data
// ============================================================

import { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import AttendanceSummary from '../components/AttendanceSummary';
import BehaviourLog from '../components/BehaviourLog';
import Timetable from '../components/Timetable';
import NewsFeed from '../components/NewsFeed';
import HomeworkList from '../components/HomeworkList';
import type {
  Student,
  AttendanceSummary as AttendanceData,
  BehaviourEvent,
  TimetableLesson,
  Announcement,
  HomeworkItem,
} from '../types';

interface DashboardData {
  student: Student;
  attendance: AttendanceData;
  behaviour: BehaviourEvent[];
  timetable: TimetableLesson[];
  announcements: Announcement[];
  homework: HomeworkItem[];
}

export default function StudentDashboard() {
  const { user } = useAuth();
  const [data, setData] = useState<DashboardData | null>(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user || user.studentIds.length === 0) return;

    const studentId = user.studentIds[0];

    async function fetchAll() {
      try {
        const [studentRes, attendanceRes, behaviourRes, timetableRes, announcementsRes, homeworkRes] =
          await Promise.all([
            api.get<{ data: Student }>(`/students/${studentId}`),
            api.get<{ data: AttendanceData }>(`/students/${studentId}/attendance`),
            api.get<{ data: BehaviourEvent[] }>(`/students/${studentId}/behaviour`),
            api.get<{ data: TimetableLesson[] }>(`/students/${studentId}/timetable`),
            api.get<{ data: Announcement[] }>('/announcements'),
            api.get<{ data: HomeworkItem[] }>(`/homework/student/${studentId}`),
          ]);

        setData({
          student: studentRes.data,
          attendance: attendanceRes.data,
          behaviour: behaviourRes.data,
          timetable: timetableRes.data,
          announcements: announcementsRes.data,
          homework: homeworkRes.data,
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
          Welcome, {data.student.firstName}
        </h1>
        <div className="flex items-center gap-2 mt-1">
          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-brand-100 text-brand-700">
            Year {data.student.yearGroup}
          </span>
          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-600">
            {data.student.formGroup}
          </span>
        </div>
      </div>

      {/* Dashboard grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <HomeworkList homework={data.homework} />
        <Timetable lessons={data.timetable} />
        <AttendanceSummary data={data.attendance} />
        <BehaviourLog events={data.behaviour} />
        <div className="lg:col-span-2">
          <NewsFeed announcements={data.announcements} />
        </div>
      </div>
    </div>
  );
}
