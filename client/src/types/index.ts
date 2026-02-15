// ============================================================
// Unity Pulse — frontend types
// These mirror the backend types returned by the API.
// ============================================================

export interface User {
  id: string;
  firstName: string;
  lastName: string;
  role: 'parent' | 'teacher' | 'admin' | 'student';
  studentIds: string[];
}

export interface Student {
  id: string;
  firstName: string;
  lastName: string;
  yearGroup: number;
  formGroup: string;
  photo?: string;
}

export interface AttendanceRecord {
  date: string;
  present: boolean;
  session: 'AM' | 'PM';
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
  timestamp: string;
}

export interface TimetableLesson {
  id: string;
  day: 'Monday' | 'Tuesday' | 'Wednesday' | 'Thursday' | 'Friday';
  period: number;
  startTime: string;
  endTime: string;
  subject: string;
  teacher: string;
  room: string;
}

export interface Announcement {
  id: string;
  title: string;
  body: string;
  author: string;
  publishedAt: string;
  pinned: boolean;
}

export interface ClassGroup {
  id: string;
  name: string;
  subject: string;
  yearGroup: number;
  teacherId: string;
  studentIds: string[];
}

export type WeekType = 'A' | 'B';

export type ATLGrade = 1 | 2 | 3 | 4 | 5;

export interface StaffLesson {
  id: string;
  week: WeekType;
  day: 'Monday' | 'Tuesday' | 'Wednesday' | 'Thursday' | 'Friday';
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

export interface RegisterEntry {
  studentId: string;
  attendanceCode: string;
  atlGrade: ATLGrade | null;
  note?: string;
}

export interface RegisterRow {
  studentId: string;
  firstName: string;
  lastName: string;
  formGroup: string;
  attendanceCode: string;
  atlGrade: ATLGrade | null;
  otherPeriodCodes: Record<number, string>;
  otherPeriodATL: Record<number, ATLGrade | null>;
  rewardsToday: number;
  consequencesToday: number;
  note?: string;
}

export interface RegisterData {
  lessonId: string;
  date: string;
  classGroupId: string;
  classGroupName: string;
  subject: string;
  room: string;
  period: number;
  teacherName: string;
  rows: RegisterRow[];
}

export interface ClassAttendanceOverview {
  classGroupId: string;
  classGroupName: string;
  totalStudents: number;
  presentCount: number;
  absentCount: number;
  lateCount: number;
}

export interface ParentContact {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  relationship: string;
}

export interface StudentClassGroup extends ClassGroup {
  teacherName: string;
}

export interface Message {
  id: string;
  fromUserId: string;
  toUserId: string;
  body: string;
  sentAt: string;
  readAt?: string;
  fromName?: string;
  toName?: string;
  allowReplies?: boolean;
}

export interface ClassPost {
  id: string;
  classGroupId: string;
  classGroupName: string;
  subject: string;
  authorId: string;
  authorName: string;
  body: string;
  postedAt: string;
}

export interface Homework {
  id: string;
  classGroupId: string;
  title: string;
  description: string;
  dueDate: string;
  issuedDate: string;
  teacherId: string;
  teacherName: string;
  links?: string[];
}

export interface HomeworkCompletion {
  homeworkId: string;
  studentId: string;
  completedAt: string;
  markedBy: string;
}

export interface HomeworkItem extends Homework {
  subject: string;
  className: string;
  completed: boolean;
  completedAt?: string;
}

export interface StudentPlan {
  studentId: string;
  penPortrait?: {
    summary: string;
    strengths: string[];
    difficulties: string[];
    strategies: string[];
    updatedAt: string;
  };
  myPlan?: {
    targets: Array<{
      target: string;
      strategies: string[];
      progress: 'not started' | 'emerging' | 'developing' | 'achieved';
    }>;
    reviewDate: string;
    keyWorker: string;
    updatedAt: string;
  };
  ehcp?: {
    provisions: string[];
    adjustments: string[];
    keyWorker: string;
    annualReviewDate: string;
    updatedAt: string;
  };
}

export interface PastoralNote {
  id: string;
  studentId: string;
  category: 'safeguarding' | 'welfare' | 'attendance' | 'behavioural' | 'family' | 'medical' | 'other';
  severity: 'low' | 'medium' | 'high';
  title: string;
  body: string;
  staffId: string;
  staffName: string;
  createdAt: string;
}
