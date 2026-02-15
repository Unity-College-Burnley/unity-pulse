// ============================================================
// Unity Pulse — shared backend types
// Mirrors the shape of Wonde API responses where applicable
// so swapping in real API calls later is straightforward.
// ============================================================

export interface User {
  id: string;
  email: string;
  passwordHash: string;
  role: 'parent' | 'teacher' | 'admin' | 'student';
  firstName: string;
  lastName: string;
  /** IDs of students linked to this parent/student (empty for staff) */
  studentIds: string[];
}

export interface Student {
  id: string;
  firstName: string;
  lastName: string;
  yearGroup: number;
  formGroup: string;
  /** URL or path to student photo (optional) */
  photo?: string;
}

export interface AttendanceRecord {
  date: string; // dd/mm/yyyy
  present: boolean;
  /** AM / PM / Full Day */
  session: 'AM' | 'PM';
  /** e.g. "Present", "Authorised Absence", "Late" */
  code: string;
  note?: string;
}

export interface AttendanceSummary {
  studentId: string;
  overallPercentage: number;
  presentDays: number;
  absentDays: number;
  lateDays: number;
  totalDays: number;
  /** Whether the student is present today */
  presentToday: boolean;
  recentRecords: AttendanceRecord[];
}

export interface BehaviourEvent {
  id: string;
  studentId: string;
  type: 'positive' | 'negative';
  category: string;
  points: number;
  note: string;
  staffName: string;
  timestamp: string; // ISO date string
}

export interface TimetableLesson {
  id: string;
  day: 'Monday' | 'Tuesday' | 'Wednesday' | 'Thursday' | 'Friday';
  period: number; // 1–5
  startTime: string; // HH:mm
  endTime: string; // HH:mm
  subject: string;
  teacher: string;
  room: string;
}

export interface Announcement {
  id: string;
  title: string;
  body: string;
  author: string;
  publishedAt: string; // ISO date string
  /** Whether this is pinned to the top of the feed */
  pinned: boolean;
}

export interface Message {
  id: string;
  fromUserId: string;
  toUserId: string;
  body: string;
  sentAt: string; // ISO date string
  readAt?: string; // ISO date string, undefined if unread
}

/** A teaching class/group — links a teacher to a set of students */
export interface ClassGroup {
  id: string;
  name: string; // e.g. "9B/Ma1"
  subject: string;
  yearGroup: number;
  teacherId: string;
  studentIds: string[];
}

export type WeekType = 'A' | 'B';

/** A single lesson on the staff timetable — extends TimetableLesson with class info */
export interface StaffLesson {
  id: string;
  week: WeekType;
  day: TimetableLesson['day'];
  period: number;
  startTime: string;
  endTime: string;
  subject: string;
  room: string;
  classGroupId: string;
  classGroupName: string;
  teacherId: string;
  studentCount: number;
}

/** ATL grade: 1=Outstanding, 2=Expected, 3=Inconsistent, 4=Sanctioned, 5=Removed */
export type ATLGrade = 1 | 2 | 3 | 4 | 5;

/**
 * A single student's register entry for one lesson instance.
 * Attendance code and ATL are separate fields.
 */
export interface RegisterEntry {
  studentId: string;
  /** Attendance code: '-' = no mark, '/' = present AM, '\' = present PM, or any other code */
  attendanceCode: string;
  /** ATL grade, null if not yet set */
  atlGrade: ATLGrade | null;
  /** Optional teacher note (e.g. "5 minutes late") */
  note?: string;
}

/**
 * Full register data for a lesson instance (lesson + date).
 * Contains entries for every student in the class.
 */
export interface RegisterData {
  lessonId: string;
  date: string; // yyyy-mm-dd
  classGroupId: string;
  classGroupName: string;
  subject: string;
  room: string;
  period: number;
  teacherName: string;
  entries: RegisterEntry[];
}

/** Row shown in the register UI — enriched with student info and today's context */
export interface RegisterRow {
  studentId: string;
  firstName: string;
  lastName: string;
  formGroup: string;
  attendanceCode: string;
  atlGrade: ATLGrade | null;
  /** Read-only codes from other periods today: { period: code } */
  otherPeriodCodes: Record<number, string>;
  /** Read-only ATL from other periods today: { period: grade } */
  otherPeriodATL: Record<number, ATLGrade | null>;
  rewardsToday: number;
  consequencesToday: number;
  /** Optional teacher note (e.g. "5 minutes late") */
  note?: string;
}

/** Attendance snapshot for a class on a given day */
export interface ClassAttendanceOverview {
  classGroupId: string;
  classGroupName: string;
  totalStudents: number;
  presentCount: number;
  absentCount: number;
  lateCount: number;
}

/** Standard API response wrapper (mirrors Wonde's envelope) */
export interface ApiResponse<T> {
  data: T;
}

/** Safe parent contact info (no passwordHash) */
export interface ParentContact {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  relationship: string;
}

/** JWT payload stored in the token */
export interface TokenPayload {
  userId: string;
  role: 'parent' | 'teacher' | 'admin' | 'student';
}

export interface Homework {
  id: string;
  classGroupId: string;
  title: string;
  description: string;
  dueDate: string;        // yyyy-mm-dd
  issuedDate: string;     // yyyy-mm-dd
  teacherId: string;
  teacherName: string;
  links?: string[];       // URLs instead of file uploads
}

export interface HomeworkCompletion {
  homeworkId: string;
  studentId: string;
  completedAt: string;    // ISO timestamp
  markedBy: string;       // teacherId who marked it
}
