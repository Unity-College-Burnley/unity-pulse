// ============================================================
// Wonde Service — mock implementation
//
// This service provides the same interface that the real Wonde
// API integration will use. Right now it returns mock data.
// When you're ready to go live, replace each function body
// with a real HTTP call to https://api.wonde.com/v1.0/
// ============================================================

import {
  students,
  attendanceSummaries,
  behaviourEvents,
  timetableLessons,
  classGroups,
  staffLessons,
  users,
} from '../data/mockData';

import type {
  Student,
  AttendanceSummary,
  BehaviourEvent,
  TimetableLesson,
  ClassGroup,
  StaffLesson,
  ClassAttendanceOverview,
} from '../types';

/** Map teacherId → display name (e.g. "Mr Wilson") */
const TEACHER_DISPLAY_NAMES: Record<string, string> = {
  'usr-teacher-1': 'Mr Wilson',
  'usr-teacher-2': 'Ms Harrison',
  'usr-teacher-3': 'Dr Ahmed',
};

function getTeacherDisplayName(teacherId: string): string {
  if (TEACHER_DISPLAY_NAMES[teacherId]) return TEACHER_DISPLAY_NAMES[teacherId];
  const u = users.find((user) => user.id === teacherId);
  return u ? `${u.firstName} ${u.lastName}` : 'Unknown';
}

/** Fetch a single student by ID */
export function getStudent(studentId: string): Student | undefined {
  return students.find((s) => s.id === studentId);
}

/** Fetch multiple students by their IDs */
export function getStudentsByIds(studentIds: string[]): Student[] {
  return students.filter((s) => studentIds.includes(s.id));
}

/** Fetch the attendance summary for a student */
export function getAttendance(studentId: string): AttendanceSummary | undefined {
  return attendanceSummaries.find((a) => a.studentId === studentId);
}

/** Fetch behaviour events for a student, most recent first */
export function getBehaviour(studentId: string): BehaviourEvent[] {
  return behaviourEvents
    .filter((b) => b.studentId === studentId)
    .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
}

/** Fetch the full timetable for a student */
export function getTimetable(studentId: string): TimetableLesson[] {
  // stu-1 has a hand-crafted full timetable (all subjects, not just ones in staffLessons)
  if (studentId === 'stu-1') {
    return timetableLessons;
  }

  // For all other students, derive from class group membership + staffLessons (Week A).
  // In a real Wonde integration this would be a direct API call.
  const studentGroups = classGroups.filter((c) => c.studentIds.includes(studentId));
  if (studentGroups.length === 0) return [];

  const groupIds = new Set(studentGroups.map((g) => g.id));
  const weekALessons = staffLessons.filter(
    (sl) => sl.week === 'A' && groupIds.has(sl.classGroupId)
  );

  return weekALessons.map((sl) => ({
    id: `tt-${studentId}-${sl.id}`,
    day: sl.day,
    period: sl.period,
    startTime: sl.startTime,
    endTime: sl.endTime,
    subject: sl.subject,
    teacher: getTeacherDisplayName(sl.teacherId),
    room: sl.room,
  }));
}

/** Fetch lessons for a specific day */
export function getTimetableForDay(
  studentId: string,
  day: TimetableLesson['day']
): TimetableLesson[] {
  return getTimetable(studentId)
    .filter((l) => l.day === day)
    .sort((a, b) => a.period - b.period);
}

// ============================================================
// Staff-specific queries
// ============================================================

/** Fetch all class groups taught by a teacher */
export function getClassGroupsByTeacher(teacherId: string): ClassGroup[] {
  return classGroups.filter((c) => c.teacherId === teacherId);
}

/** Fetch a single class group by ID */
export function getClassGroup(classGroupId: string): ClassGroup | undefined {
  return classGroups.find((c) => c.id === classGroupId);
}

/** Fetch staff lessons for a teacher on a given day */
export function getStaffLessonsForDay(
  teacherId: string,
  day: StaffLesson['day']
): StaffLesson[] {
  return staffLessons
    .filter((l) => l.day === day)
    // For now all staff lessons belong to our one mock teacher
    .sort((a, b) => a.period - b.period);
}

/** Fetch all staff lessons for a teacher (full week) */
export function getStaffLessons(teacherId: string): StaffLesson[] {
  // In production, filter by teacherId via the Wonde API
  return staffLessons.sort((a, b) => {
    const dayOrder = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];
    const dayDiff = dayOrder.indexOf(a.day) - dayOrder.indexOf(b.day);
    return dayDiff !== 0 ? dayDiff : a.period - b.period;
  });
}

/** Get students in a class group */
export function getStudentsByClassGroup(classGroupId: string): Student[] {
  const group = classGroups.find((c) => c.id === classGroupId);
  if (!group) return [];
  return students.filter((s) => group.studentIds.includes(s.id));
}

/** Search students by name */
export function searchStudents(query: string): Student[] {
  const q = query.toLowerCase();
  return students.filter(
    (s) =>
      s.firstName.toLowerCase().includes(q) ||
      s.lastName.toLowerCase().includes(q) ||
      `${s.firstName} ${s.lastName}`.toLowerCase().includes(q)
  );
}

/** Fetch all class groups a student belongs to */
export function getClassGroupsByStudent(studentId: string): ClassGroup[] {
  return classGroups.filter((c) => c.studentIds.includes(studentId));
}

/** Get attendance overview for a class group */
export function getClassAttendanceOverview(classGroupId: string): ClassAttendanceOverview | undefined {
  const group = classGroups.find((c) => c.id === classGroupId);
  if (!group) return undefined;

  let presentCount = 0;
  let absentCount = 0;
  let lateCount = 0;

  for (const sid of group.studentIds) {
    const summary = attendanceSummaries.find((a) => a.studentId === sid);
    if (!summary) continue;
    if (summary.presentToday) {
      presentCount++;
    } else {
      absentCount++;
    }
    if (summary.lateDays > 0 && summary.presentToday) {
      // Check if late today based on recent records
      const todayLate = summary.recentRecords.some(
        (r) => r.code === 'Late' && r.session === 'AM'
      );
      if (todayLate) lateCount++;
    }
  }

  return {
    classGroupId: group.id,
    classGroupName: group.name,
    totalStudents: group.studentIds.length,
    presentCount,
    absentCount,
    lateCount,
  };
}
