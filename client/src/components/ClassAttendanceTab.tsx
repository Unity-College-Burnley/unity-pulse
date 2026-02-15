// ============================================================
// ClassAttendanceTab — per-student attendance overview for a class
// Shows BOTH school-wide and class-specific attendance side by
// side so teachers can spot students who attend school but skip
// their class, or are poor attenders generally.
// ============================================================

import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../services/api';
import { AlertTriangle, Clock } from 'lucide-react';
import type { AttendanceSummary } from '../types';

interface Props {
  classGroupId: string;
  classGroupName: string;
  students: Array<{ studentId: string; firstName: string; lastName: string }>;
}

interface ClassAttendanceEntry {
  studentId: string;
  lessons: number;
  present: number;
  absent: number;
  late: number;
  classPct: number | null;
}

function pctColor(pct: number): string {
  if (pct >= 97) return 'text-emerald-700 bg-emerald-50';
  if (pct >= 95) return 'text-emerald-600 bg-emerald-50';
  if (pct >= 90) return 'text-amber-700 bg-amber-50';
  return 'text-red-700 bg-red-50';
}

function pctBarColor(pct: number): string {
  if (pct >= 97) return 'bg-emerald-500';
  if (pct >= 95) return 'bg-emerald-400';
  if (pct >= 90) return 'bg-amber-400';
  return 'bg-red-500';
}

export default function ClassAttendanceTab({ classGroupId, classGroupName, students }: Props) {
  const [schoolMap, setSchoolMap] = useState<Map<string, AttendanceSummary>>(new Map());
  const [classMap, setClassMap] = useState<Map<string, ClassAttendanceEntry>>(new Map());
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchAll() {
      try {
        const [schoolResults, classRes] = await Promise.all([
          // Fetch each student's school-wide attendance
          Promise.all(
            students.map((s) =>
              api.get<{ data: AttendanceSummary }>(`/students/${s.studentId}/attendance`)
                .then((res) => ({ studentId: s.studentId, data: res.data }))
                .catch(() => null)
            )
          ),
          // Fetch class-specific attendance in one call
          api.get<{ data: ClassAttendanceEntry[] }>(`/register/class-attendance/${classGroupId}`),
        ]);

        const sMap = new Map<string, AttendanceSummary>();
        for (const r of schoolResults) {
          if (r) sMap.set(r.studentId, r.data);
        }
        setSchoolMap(sMap);

        const cMap = new Map<string, ClassAttendanceEntry>();
        for (const entry of classRes.data) {
          cMap.set(entry.studentId, entry);
        }
        setClassMap(cMap);
      } finally {
        setLoading(false);
      }
    }
    fetchAll();
  }, [students, classGroupId]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-16">
        <div className="animate-spin rounded-full h-8 w-8 border-2 border-brand-500 border-t-transparent" />
      </div>
    );
  }

  // Build rows, sorted by class attendance (worst first), fall back to school
  const rows = students
    .map((s) => {
      const school = schoolMap.get(s.studentId);
      const cls = classMap.get(s.studentId);
      const schoolPct = school?.overallPercentage ?? 0;
      const classPct = cls?.classPct ?? null;
      // Difference: positive = better at school than this class (concerning)
      const diff = classPct !== null ? schoolPct - classPct : null;

      const schoolLate = school?.lateDays ?? 0;
      const classLate = cls?.late ?? 0;
      // What % of this student's school-wide lates happen in this class?
      // >30% (with 2+ class lates) suggests a pattern specific to this lesson.
      const latePct = schoolLate > 0 ? (classLate / schoolLate) * 100 : null;
      const lateFlag = latePct !== null && latePct >= 30 && classLate >= 2;

      return {
        ...s,
        schoolPct,
        schoolPresent: school?.presentDays ?? 0,
        schoolAbsent: school?.absentDays ?? 0,
        schoolLate,
        schoolTotal: school?.totalDays ?? 0,
        presentToday: school?.presentToday ?? false,
        classPct,
        classLessons: cls?.lessons ?? 0,
        classPresent: cls?.present ?? 0,
        classAbsent: cls?.absent ?? 0,
        classLate,
        diff,
        latePct,
        lateFlag,
      };
    })
    .sort((a, b) => {
      // Sort by class % first (null last), then school %
      const aPct = a.classPct ?? 999;
      const bPct = b.classPct ?? 999;
      return aPct - bPct || a.schoolPct - b.schoolPct;
    });

  // Summary stats
  const schoolAvg = rows.length > 0
    ? rows.reduce((sum, r) => sum + r.schoolPct, 0) / rows.length
    : 0;
  const classRows = rows.filter((r) => r.classPct !== null);
  const classAvg = classRows.length > 0
    ? classRows.reduce((sum, r) => sum + r.classPct!, 0) / classRows.length
    : null;

  return (
    <div className="space-y-4">
      {/* Summary cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 text-center">
          <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wide mb-1">School Average</p>
          <p className={`text-2xl font-bold ${schoolAvg >= 95 ? 'text-emerald-600' : schoolAvg >= 90 ? 'text-amber-600' : 'text-red-600'}`}>
            {schoolAvg.toFixed(1)}%
          </p>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 text-center">
          <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wide mb-1">This Class Average</p>
          {classAvg !== null ? (
            <p className={`text-2xl font-bold ${classAvg >= 95 ? 'text-emerald-600' : classAvg >= 90 ? 'text-amber-600' : 'text-red-600'}`}>
              {classAvg.toFixed(1)}%
            </p>
          ) : (
            <p className="text-2xl font-bold text-gray-300">—</p>
          )}
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 text-center">
          <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wide mb-1">School &lt; 90%</p>
          <p className={`text-2xl font-bold ${rows.filter((r) => r.schoolPct < 90).length > 0 ? 'text-red-600' : 'text-gray-300'}`}>
            {rows.filter((r) => r.schoolPct < 90).length}
          </p>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 text-center">
          <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wide mb-1">Students</p>
          <p className="text-2xl font-bold text-gray-900">{rows.length}</p>
        </div>
      </div>

      {/* Attendance table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="px-4 py-3 border-b border-gray-200 bg-gray-50">
          <h3 className="text-sm font-semibold text-gray-900">
            {classGroupName} — Student Attendance
          </h3>
          <p className="text-[10px] text-gray-400 mt-0.5">
            Sorted by class attendance (lowest first). A gap between school and class % highlights students attending school but missing this class.
          </p>
        </div>

        {/* Desktop table */}
        <div className="hidden sm:block overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100 text-left">
                <th className="px-4 py-2 font-medium text-gray-500 text-xs">Student</th>
                <th className="px-4 py-2 font-medium text-gray-500 text-xs text-center">School %</th>
                <th className="px-4 py-2 font-medium text-gray-500 text-xs text-center">This Class %</th>
<th className="px-4 py-2 font-medium text-gray-500 text-xs text-center">Lessons</th>
                <th className="px-4 py-2 font-medium text-gray-500 text-xs text-center">Present</th>
                <th className="px-4 py-2 font-medium text-gray-500 text-xs text-center">Absent</th>
                <th className="px-4 py-2 font-medium text-gray-500 text-xs text-center">Lates</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row, i) => (
                <tr
                  key={row.studentId}
                  className={`border-b border-gray-50 ${i % 2 === 0 ? 'bg-white' : 'bg-gray-50/30'} hover:bg-gray-50 transition-colors`}
                >
                  <td className="px-4 py-2.5">
                    <Link
                      to={`/student/${row.studentId}`}
                      className="font-medium text-gray-900 hover:text-brand-600 transition-colors"
                    >
                      {row.lastName}, {row.firstName}
                    </Link>
                  </td>
                  <td className="px-4 py-2.5 text-center">
                    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-bold ${pctColor(row.schoolPct)}`}>
                      {row.schoolPct.toFixed(1)}%
                    </span>
                  </td>
                  <td className="px-4 py-2.5 text-center">
                    {row.classPct !== null ? (
                      <span className="inline-flex items-center gap-1">
                        <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-bold ${pctColor(row.classPct)}`}>
                          {row.classPct.toFixed(1)}%
                        </span>
                        {row.diff !== null && row.diff > 5 && (
                          <span title={`${row.diff.toFixed(0)}% lower than school attendance`}>
                            <AlertTriangle size={14} className="text-amber-500" />
                          </span>
                        )}
                      </span>
                    ) : (
                      <span className="text-xs text-gray-300">No data</span>
                    )}
                  </td>
                  <td className="px-4 py-2.5 text-center text-gray-700">{row.classLessons || '—'}</td>
                  <td className="px-4 py-2.5 text-center text-gray-700">{row.classLessons ? row.classPresent : '—'}</td>
                  <td className="px-4 py-2.5 text-center">
                    {row.classLessons ? (
                      <span className={row.classAbsent > 2 ? 'text-red-600 font-semibold' : 'text-gray-700'}>
                        {row.classAbsent}
                      </span>
                    ) : '—'}
                  </td>
                  <td className="px-4 py-2.5 text-center">
                    {row.classLessons ? (
                      <span className="inline-flex items-center gap-1.5 justify-center">
                        <span className={row.lateFlag ? 'text-amber-600 font-semibold' : 'text-gray-700'}>
                          {row.classLate} of {row.schoolLate}
                        </span>
                        {row.lateFlag && (
                          <span title={`${Math.round(row.latePct!)}% of school lates are in this class`}>
                            <Clock size={14} className="text-amber-500" />
                          </span>
                        )}
                      </span>
                    ) : '—'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Mobile cards */}
        <div className="sm:hidden divide-y divide-gray-50">
          {rows.map((row) => (
            <div key={row.studentId} className="px-4 py-3">
              <div className="flex items-center justify-between mb-2">
                <Link
                  to={`/student/${row.studentId}`}
                  className="text-sm font-medium text-gray-900 hover:text-brand-600"
                >
                  {row.lastName}, {row.firstName}
                </Link>
                {row.diff !== null && row.diff > 5 && (
                  <AlertTriangle size={14} className="text-amber-500" />
                )}
              </div>
              <div className="grid grid-cols-2 gap-2 mb-2">
                <div>
                  <p className="text-[10px] text-gray-400 uppercase">School</p>
                  <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-bold ${pctColor(row.schoolPct)}`}>
                    {row.schoolPct.toFixed(1)}%
                  </span>
                </div>
                <div>
                  <p className="text-[10px] text-gray-400 uppercase">This Class</p>
                  {row.classPct !== null ? (
                    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-bold ${pctColor(row.classPct)}`}>
                      {row.classPct.toFixed(1)}%
                    </span>
                  ) : (
                    <span className="text-xs text-gray-300">No data</span>
                  )}
                </div>
              </div>
              {row.classLessons > 0 && (
                <>
                  <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden mb-2">
                    <div
                      className={`h-full rounded-full ${pctBarColor(row.classPct ?? 0)}`}
                      style={{ width: `${Math.min(row.classPct ?? 0, 100)}%` }}
                    />
                  </div>
                  <div className="flex gap-4 text-xs text-gray-500">
                    <span>{row.classPresent}/{row.classLessons} present</span>
                    <span>Absent: <span className={`font-medium ${row.classAbsent > 2 ? 'text-red-600' : 'text-gray-700'}`}>{row.classAbsent}</span></span>
                    <span className="inline-flex items-center gap-1">
                      Lates: <span className={`font-medium ${row.lateFlag ? 'text-amber-600' : 'text-gray-700'}`}>{row.classLate} of {row.schoolLate}</span>
                      {row.lateFlag && <Clock size={12} className="text-amber-500" />}
                    </span>
                  </div>
                </>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
