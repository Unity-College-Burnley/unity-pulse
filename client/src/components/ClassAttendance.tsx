// ============================================================
// Class attendance overview — shows a summary card per class
// with present/absent/late counts and a visual bar.
// Click a class to expand the student register with attendance
// status and a "Message parent" link per student.
// ============================================================

import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { CheckCircle, XCircle, Clock, ChevronDown, ChevronUp, MessageSquare } from 'lucide-react';
import { api } from '../services/api';
import type { ClassAttendanceOverview } from '../types';

interface Props {
  classes: ClassAttendanceOverview[];
}

interface RegisterStudent {
  id: string;
  firstName: string;
  lastName: string;
  yearGroup: number;
  formGroup: string;
  presentToday: boolean | null;
  overallAttendance: number | null;
  parentUserId: string | null;
  parentName: string | null;
}

export default function ClassAttendance({ classes }: Props) {
  const [expandedClassId, setExpandedClassId] = useState<string | null>(null);
  const [registerStudents, setRegisterStudents] = useState<RegisterStudent[]>([]);
  const [loadingRegister, setLoadingRegister] = useState(false);
  const navigate = useNavigate();

  async function toggleClass(classGroupId: string) {
    if (expandedClassId === classGroupId) {
      setExpandedClassId(null);
      return;
    }

    setExpandedClassId(classGroupId);
    setLoadingRegister(true);

    try {
      const res = await api.get<{ data: RegisterStudent[] }>(`/staff/classes/${classGroupId}/students`);
      setRegisterStudents(res.data);
    } catch {
      setRegisterStudents([]);
    } finally {
      setLoadingRegister(false);
    }
  }

  function messageParent(parentUserId: string, parentName: string) {
    navigate(`/messages?contact=${parentUserId}&name=${encodeURIComponent(parentName)}`);
  }

  return (
    <section className="bg-white rounded-xl shadow-sm border border-gray-200 p-5">
      <h2 className="text-base font-semibold text-gray-900 mb-4">Class Attendance</h2>

      {classes.length === 0 && (
        <p className="text-sm text-gray-500">No classes today.</p>
      )}

      <div className="space-y-4">
        {classes.map((cls) => {
          const pctPresent = cls.totalStudents > 0
            ? Math.round((cls.presentCount / cls.totalStudents) * 100)
            : 0;
          const isExpanded = expandedClassId === cls.classGroupId;

          return (
            <div key={cls.classGroupId} className="border border-gray-100 rounded-lg overflow-hidden">
              {/* Summary header — clickable to expand */}
              <button
                onClick={() => toggleClass(cls.classGroupId)}
                className="w-full text-left p-3 hover:bg-gray-50 transition-colors"
                aria-expanded={isExpanded}
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <h3 className="text-sm font-semibold text-gray-900">{cls.classGroupName}</h3>
                    {isExpanded
                      ? <ChevronUp size={14} className="text-gray-400" />
                      : <ChevronDown size={14} className="text-gray-400" />
                    }
                  </div>
                  <span className={`text-sm font-bold ${
                    pctPresent >= 95 ? 'text-green-600' : pctPresent >= 85 ? 'text-amber-600' : 'text-red-600'
                  }`}>
                    {pctPresent}%
                  </span>
                </div>

                {/* Visual bar */}
                <div className="w-full h-2 bg-gray-100 rounded-full mb-3 overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all ${
                      pctPresent >= 95 ? 'bg-green-500' : pctPresent >= 85 ? 'bg-amber-500' : 'bg-red-500'
                    }`}
                    style={{ width: `${pctPresent}%` }}
                  />
                </div>

                {/* Counts */}
                <div className="flex gap-4 text-xs">
                  <span className="flex items-center gap-1 text-green-600">
                    <CheckCircle size={13} />
                    {cls.presentCount} present
                  </span>
                  <span className="flex items-center gap-1 text-red-600">
                    <XCircle size={13} />
                    {cls.absentCount} absent
                  </span>
                  {cls.lateCount > 0 && (
                    <span className="flex items-center gap-1 text-amber-600">
                      <Clock size={13} />
                      {cls.lateCount} late
                    </span>
                  )}
                </div>
              </button>

              {/* Expanded student register */}
              {isExpanded && (
                <div className="border-t border-gray-100 px-3 py-2">
                  {loadingRegister ? (
                    <div className="flex justify-center py-3">
                      <div className="animate-spin rounded-full h-5 w-5 border-2 border-brand-500 border-t-transparent" />
                    </div>
                  ) : (
                    <ul className="divide-y divide-gray-50">
                      {registerStudents.map((student) => (
                        <li key={student.id} className="flex items-center justify-between py-2">
                          <div className="flex items-center gap-2 min-w-0">
                            {/* Attendance icon */}
                            {student.presentToday === true && <CheckCircle size={14} className="text-green-500 flex-shrink-0" />}
                            {student.presentToday === false && <XCircle size={14} className="text-red-500 flex-shrink-0" />}
                            {student.presentToday === null && <Clock size={14} className="text-gray-300 flex-shrink-0" />}

                            <div className="min-w-0">
                              <p className="text-sm text-gray-900 truncate">
                                {student.lastName}, {student.firstName}
                              </p>
                              {student.overallAttendance !== null && (
                                <p className={`text-xs ${
                                  student.overallAttendance >= 96 ? 'text-green-600' :
                                  student.overallAttendance >= 90 ? 'text-amber-600' : 'text-red-600'
                                }`}>
                                  {student.overallAttendance}% overall
                                </p>
                              )}
                            </div>
                          </div>

                          {/* Message parent button */}
                          {student.parentUserId && (
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                messageParent(student.parentUserId!, student.parentName!);
                              }}
                              className="flex items-center gap-1 text-xs text-brand-500 hover:text-brand-600 px-2 py-1 rounded-md hover:bg-brand-50 transition-colors flex-shrink-0"
                              title={`Message ${student.parentName}`}
                            >
                              <MessageSquare size={13} />
                              <span className="hidden sm:inline">Message parent</span>
                            </button>
                          )}
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </section>
  );
}
