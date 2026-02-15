// ============================================================
// Mock data — structured to mirror Wonde API response shapes.
// Replace this file's exports with real Wonde API calls when
// you're ready to connect to SIMS.
// ============================================================

import type {
  User,
  Student,
  AttendanceSummary,
  AttendanceRecord,
  BehaviourEvent,
  TimetableLesson,
  Announcement,
  Message,
  ClassGroup,
  StaffLesson,
  RegisterEntry,
  Homework,
  HomeworkCompletion,
  ClassPost,
  PastoralNote,
  StudentPlan,
} from '../types';

// ----- Users -----

export const users: User[] = [
  {
    id: 'usr-parent-1',
    email: 'sarah.thompson@example.com',
    // password: "password123" — hashed with bcryptjs
    passwordHash: '$2a$10$placeholder',
    role: 'parent',
    firstName: 'Sarah',
    lastName: 'Thompson',
    studentIds: ['stu-1'],
  },
  {
    id: 'usr-teacher-1',
    email: 'j.wilson@unitycollege.ac.uk',
    passwordHash: '$2a$10$placeholder',
    role: 'teacher',
    firstName: 'James',
    lastName: 'Wilson',
    studentIds: [],
  },
  {
    id: 'usr-teacher-2',
    email: 'a.harrison@unitycollege.ac.uk',
    passwordHash: '$2a$10$placeholder',
    role: 'teacher',
    firstName: 'Amy',
    lastName: 'Harrison',
    studentIds: [],
  },
  {
    id: 'usr-teacher-3',
    email: 's.ahmed@unitycollege.ac.uk',
    passwordHash: '$2a$10$placeholder',
    role: 'teacher',
    firstName: 'Samir',
    lastName: 'Ahmed',
    studentIds: [],
  },
  {
    id: 'usr-parent-2',
    email: 'fatima.khan@example.com',
    passwordHash: '$2a$10$placeholder',
    role: 'parent',
    firstName: 'Fatima',
    lastName: 'Khan',
    studentIds: ['stu-2'],
  },
  {
    id: 'usr-parent-3',
    email: 'mark.davies@example.com',
    passwordHash: '$2a$10$placeholder',
    role: 'parent',
    firstName: 'Mark',
    lastName: 'Davies',
    studentIds: ['stu-3'],
  },
  {
    id: 'usr-parent-4',
    email: 'claire.murphy@example.com',
    passwordHash: '$2a$10$placeholder',
    role: 'parent',
    firstName: 'Claire',
    lastName: 'Murphy',
    studentIds: ['stu-4'],
  },
  {
    id: 'usr-parent-5',
    email: 'david.roberts@example.com',
    passwordHash: '$2a$10$placeholder',
    role: 'parent',
    firstName: 'David',
    lastName: 'Roberts',
    studentIds: ['stu-5'],
  },
  {
    id: 'usr-parent-6',
    email: 'karen.clarke@example.com',
    passwordHash: '$2a$10$placeholder',
    role: 'parent',
    firstName: 'Karen',
    lastName: 'Clarke',
    studentIds: ['stu-8'],
  },
  {
    id: 'usr-parent-7',
    email: 'raj.patel@example.com',
    passwordHash: '$2a$10$placeholder',
    role: 'parent',
    firstName: 'Raj',
    lastName: 'Patel',
    studentIds: ['stu-9'],
  },
  {
    id: 'usr-parent-8',
    email: 'emma.williams@example.com',
    passwordHash: '$2a$10$placeholder',
    role: 'parent',
    firstName: 'Emma',
    lastName: 'Williams',
    studentIds: ['stu-10'],
  },
  {
    id: 'usr-parent-9',
    email: 'paul.brown@example.com',
    passwordHash: '$2a$10$placeholder',
    role: 'parent',
    firstName: 'Paul',
    lastName: 'Brown',
    studentIds: ['stu-13'],
  },
  {
    id: 'usr-parent-10',
    email: 'jenny.hall@example.com',
    passwordHash: '$2a$10$placeholder',
    role: 'parent',
    firstName: 'Jenny',
    lastName: 'Hall',
    studentIds: ['stu-6'],
  },
  {
    id: 'usr-parent-11',
    email: 'steve.bennett@example.com',
    passwordHash: '$2a$10$placeholder',
    role: 'parent',
    firstName: 'Steve',
    lastName: 'Bennett',
    studentIds: ['stu-7'],
  },
  {
    id: 'usr-parent-12',
    email: 'lisa.shaw@example.com',
    passwordHash: '$2a$10$placeholder',
    role: 'parent',
    firstName: 'Lisa',
    lastName: 'Shaw',
    studentIds: ['stu-11'],
  },
  {
    id: 'usr-parent-13',
    email: 'mike.taylor@example.com',
    passwordHash: '$2a$10$placeholder',
    role: 'parent',
    firstName: 'Mike',
    lastName: 'Taylor',
    studentIds: ['stu-12'],
  },
  {
    id: 'usr-parent-14',
    email: 'helen.jones@example.com',
    passwordHash: '$2a$10$placeholder',
    role: 'parent',
    firstName: 'Helen',
    lastName: 'Jones',
    studentIds: ['stu-14'],
  },
  {
    id: 'usr-parent-15',
    email: 'tom.wright@example.com',
    passwordHash: '$2a$10$placeholder',
    role: 'parent',
    firstName: 'Tom',
    lastName: 'Wright',
    studentIds: ['stu-15'],
  },
  {
    id: 'usr-parent-16',
    email: 'rachel.green@example.com',
    passwordHash: '$2a$10$placeholder',
    role: 'parent',
    firstName: 'Rachel',
    lastName: 'Green',
    studentIds: ['stu-16'],
  },
  {
    id: 'usr-student-1',
    email: 'oliver.thompson@unitycollege.ac.uk',
    passwordHash: '$2a$10$placeholder',
    role: 'student',
    firstName: 'Oliver',
    lastName: 'Thompson',
    studentIds: ['stu-1'],
  },
  {
    id: 'usr-student-2',
    email: 'leo.patel@unitycollege.ac.uk',
    passwordHash: '$2a$10$placeholder',
    role: 'student',
    firstName: 'Leo',
    lastName: 'Patel',
    studentIds: ['stu-9'],
  },
  {
    id: 'usr-admin-1',
    email: 'admin@unitycollege.ac.uk',
    passwordHash: '$2a$10$placeholder',
    role: 'admin',
    firstName: 'Helen',
    lastName: 'Carter',
    studentIds: [],
  },
];

// ----- Students -----

export const students: Student[] = [
  { id: 'stu-1', firstName: 'Oliver', lastName: 'Thompson', yearGroup: 9, formGroup: '9B' },
  { id: 'stu-2', firstName: 'Amara', lastName: 'Khan', yearGroup: 9, formGroup: '9B' },
  { id: 'stu-3', firstName: 'Ethan', lastName: 'Davies', yearGroup: 9, formGroup: '9B' },
  { id: 'stu-4', firstName: 'Isla', lastName: 'Murphy', yearGroup: 9, formGroup: '9B' },
  { id: 'stu-5', firstName: 'Jack', lastName: 'Roberts', yearGroup: 9, formGroup: '9A' },
  { id: 'stu-6', firstName: 'Freya', lastName: 'Hall', yearGroup: 9, formGroup: '9A' },
  { id: 'stu-7', firstName: 'Noah', lastName: 'Bennett', yearGroup: 9, formGroup: '9A' },
  { id: 'stu-8', firstName: 'Maisie', lastName: 'Clarke', yearGroup: 9, formGroup: '9A' },
  { id: 'stu-9', firstName: 'Leo', lastName: 'Patel', yearGroup: 10, formGroup: '10C' },
  { id: 'stu-10', firstName: 'Grace', lastName: 'Williams', yearGroup: 10, formGroup: '10C' },
  { id: 'stu-11', firstName: 'Harry', lastName: 'Shaw', yearGroup: 10, formGroup: '10C' },
  { id: 'stu-12', firstName: 'Chloe', lastName: 'Taylor', yearGroup: 10, formGroup: '10C' },
  { id: 'stu-13', firstName: 'Archie', lastName: 'Brown', yearGroup: 10, formGroup: '10A' },
  { id: 'stu-14', firstName: 'Lily', lastName: 'Jones', yearGroup: 10, formGroup: '10A' },
  { id: 'stu-15', firstName: 'Oscar', lastName: 'Wright', yearGroup: 10, formGroup: '10A' },
  { id: 'stu-16', firstName: 'Poppy', lastName: 'Green', yearGroup: 10, formGroup: '10A' },
];

// ----- Class Groups (Mr Wilson teaches Maths) -----

export const classGroups: ClassGroup[] = [
  {
    id: 'cls-1',
    name: '9B/Ma1',
    subject: 'Maths',
    yearGroup: 9,
    teacherId: 'usr-teacher-1',
    studentIds: ['stu-1', 'stu-2', 'stu-3', 'stu-4', 'stu-5', 'stu-6', 'stu-7', 'stu-8'],
  },
  {
    id: 'cls-2',
    name: '10C/Ma2',
    subject: 'Maths',
    yearGroup: 10,
    teacherId: 'usr-teacher-1',
    studentIds: ['stu-9', 'stu-10', 'stu-11', 'stu-12', 'stu-13', 'stu-14', 'stu-15', 'stu-16'],
  },
];

// ----- Staff Timetable (all teachers, Week A and Week B) -----

export const staffLessons: StaffLesson[] = [
  // === Mr Wilson (Maths) — Week A ===
  { id: 'sl-a-wil-mon-2', week: 'A', day: 'Monday', period: 2, startTime: '09:50', endTime: '10:50', subject: 'Maths', room: 'M04', classGroupId: 'cls-1', classGroupName: '9B/Ma1', teacherId: 'usr-teacher-1', studentCount: 8 },
  { id: 'sl-a-wil-mon-4', week: 'A', day: 'Monday', period: 4, startTime: '12:10', endTime: '13:10', subject: 'Maths', room: 'M04', classGroupId: 'cls-2', classGroupName: '10C/Ma2', teacherId: 'usr-teacher-1', studentCount: 8 },
  { id: 'sl-a-wil-tue-2', week: 'A', day: 'Tuesday', period: 2, startTime: '09:50', endTime: '10:50', subject: 'Maths', room: 'M04', classGroupId: 'cls-1', classGroupName: '9B/Ma1', teacherId: 'usr-teacher-1', studentCount: 8 },
  { id: 'sl-a-wil-tue-5', week: 'A', day: 'Tuesday', period: 5, startTime: '13:50', endTime: '14:50', subject: 'Maths', room: 'M04', classGroupId: 'cls-2', classGroupName: '10C/Ma2', teacherId: 'usr-teacher-1', studentCount: 8 },
  { id: 'sl-a-wil-wed-1', week: 'A', day: 'Wednesday', period: 1, startTime: '08:50', endTime: '09:50', subject: 'Maths', room: 'M04', classGroupId: 'cls-2', classGroupName: '10C/Ma2', teacherId: 'usr-teacher-1', studentCount: 8 },
  { id: 'sl-a-wil-wed-3', week: 'A', day: 'Wednesday', period: 3, startTime: '11:10', endTime: '12:10', subject: 'Maths', room: 'M04', classGroupId: 'cls-1', classGroupName: '9B/Ma1', teacherId: 'usr-teacher-1', studentCount: 8 },
  { id: 'sl-a-wil-thu-1', week: 'A', day: 'Thursday', period: 1, startTime: '08:50', endTime: '09:50', subject: 'Maths', room: 'M04', classGroupId: 'cls-2', classGroupName: '10C/Ma2', teacherId: 'usr-teacher-1', studentCount: 8 },
  { id: 'sl-a-wil-thu-4', week: 'A', day: 'Thursday', period: 4, startTime: '12:10', endTime: '13:10', subject: 'Maths', room: 'M04', classGroupId: 'cls-1', classGroupName: '9B/Ma1', teacherId: 'usr-teacher-1', studentCount: 8 },
  { id: 'sl-a-wil-fri-1', week: 'A', day: 'Friday', period: 1, startTime: '08:50', endTime: '09:50', subject: 'Maths', room: 'M04', classGroupId: 'cls-1', classGroupName: '9B/Ma1', teacherId: 'usr-teacher-1', studentCount: 8 },
  { id: 'sl-a-wil-fri-3', week: 'A', day: 'Friday', period: 3, startTime: '11:10', endTime: '12:10', subject: 'Maths', room: 'M04', classGroupId: 'cls-2', classGroupName: '10C/Ma2', teacherId: 'usr-teacher-1', studentCount: 8 },

  // === Mr Wilson — Week B (slightly different) ===
  { id: 'sl-b-wil-mon-1', week: 'B', day: 'Monday', period: 1, startTime: '08:50', endTime: '09:50', subject: 'Maths', room: 'M04', classGroupId: 'cls-1', classGroupName: '9B/Ma1', teacherId: 'usr-teacher-1', studentCount: 8 },
  { id: 'sl-b-wil-mon-3', week: 'B', day: 'Monday', period: 3, startTime: '11:10', endTime: '12:10', subject: 'Maths', room: 'M04', classGroupId: 'cls-2', classGroupName: '10C/Ma2', teacherId: 'usr-teacher-1', studentCount: 8 },
  { id: 'sl-b-wil-tue-1', week: 'B', day: 'Tuesday', period: 1, startTime: '08:50', endTime: '09:50', subject: 'Maths', room: 'M04', classGroupId: 'cls-2', classGroupName: '10C/Ma2', teacherId: 'usr-teacher-1', studentCount: 8 },
  { id: 'sl-b-wil-tue-4', week: 'B', day: 'Tuesday', period: 4, startTime: '12:10', endTime: '13:10', subject: 'Maths', room: 'M04', classGroupId: 'cls-1', classGroupName: '9B/Ma1', teacherId: 'usr-teacher-1', studentCount: 8 },
  { id: 'sl-b-wil-wed-2', week: 'B', day: 'Wednesday', period: 2, startTime: '09:50', endTime: '10:50', subject: 'Maths', room: 'M04', classGroupId: 'cls-1', classGroupName: '9B/Ma1', teacherId: 'usr-teacher-1', studentCount: 8 },
  { id: 'sl-b-wil-wed-5', week: 'B', day: 'Wednesday', period: 5, startTime: '13:50', endTime: '14:50', subject: 'Maths', room: 'M04', classGroupId: 'cls-2', classGroupName: '10C/Ma2', teacherId: 'usr-teacher-1', studentCount: 8 },
  { id: 'sl-b-wil-thu-2', week: 'B', day: 'Thursday', period: 2, startTime: '09:50', endTime: '10:50', subject: 'Maths', room: 'M04', classGroupId: 'cls-2', classGroupName: '10C/Ma2', teacherId: 'usr-teacher-1', studentCount: 8 },
  { id: 'sl-b-wil-thu-5', week: 'B', day: 'Thursday', period: 5, startTime: '13:50', endTime: '14:50', subject: 'Maths', room: 'M04', classGroupId: 'cls-1', classGroupName: '9B/Ma1', teacherId: 'usr-teacher-1', studentCount: 8 },
  { id: 'sl-b-wil-fri-2', week: 'B', day: 'Friday', period: 2, startTime: '09:50', endTime: '10:50', subject: 'Maths', room: 'M04', classGroupId: 'cls-1', classGroupName: '9B/Ma1', teacherId: 'usr-teacher-1', studentCount: 8 },
  { id: 'sl-b-wil-fri-4', week: 'B', day: 'Friday', period: 4, startTime: '12:10', endTime: '13:10', subject: 'Maths', room: 'M04', classGroupId: 'cls-2', classGroupName: '10C/Ma2', teacherId: 'usr-teacher-1', studentCount: 8 },

  // === Ms Harrison (English) — Week A ===
  { id: 'sl-a-har-mon-1', week: 'A', day: 'Monday', period: 1, startTime: '08:50', endTime: '09:50', subject: 'English', room: 'E12', classGroupId: 'cls-1', classGroupName: '9B/Ma1', teacherId: 'usr-teacher-2', studentCount: 8 },
  { id: 'sl-a-har-wed-2', week: 'A', day: 'Wednesday', period: 2, startTime: '09:50', endTime: '10:50', subject: 'English', room: 'E12', classGroupId: 'cls-1', classGroupName: '9B/Ma1', teacherId: 'usr-teacher-2', studentCount: 8 },
  { id: 'sl-a-har-thu-4', week: 'A', day: 'Thursday', period: 4, startTime: '12:10', endTime: '13:10', subject: 'English', room: 'E12', classGroupId: 'cls-2', classGroupName: '10C/Ma2', teacherId: 'usr-teacher-2', studentCount: 8 },

  // === Dr Ahmed (Science) — Week A ===
  { id: 'sl-a-ahm-mon-3', week: 'A', day: 'Monday', period: 3, startTime: '11:10', endTime: '12:10', subject: 'Science', room: 'S08', classGroupId: 'cls-1', classGroupName: '9B/Ma1', teacherId: 'usr-teacher-3', studentCount: 8 },
  { id: 'sl-a-ahm-tue-5', week: 'A', day: 'Tuesday', period: 5, startTime: '13:50', endTime: '14:50', subject: 'Science', room: 'S08', classGroupId: 'cls-1', classGroupName: '9B/Ma1', teacherId: 'usr-teacher-3', studentCount: 8 },
  { id: 'sl-a-ahm-wed-5', week: 'A', day: 'Wednesday', period: 5, startTime: '13:50', endTime: '14:50', subject: 'Science', room: 'S08', classGroupId: 'cls-2', classGroupName: '10C/Ma2', teacherId: 'usr-teacher-3', studentCount: 8 },
];

// ----- Register Data Store -----
// Key: "lessonId_yyyy-mm-dd" → array of entries per student.
// In production this would be a database table.

export const registerStore: Map<string, RegisterEntry[]> = new Map();

// Pre-populate some register data for today's earlier lessons
// (so earlier periods show read-only codes when viewing a later lesson)
// Also seed historical data so the class attendance tab has useful data.
function initRegisters() {
  const today = new Date().toISOString().split('T')[0];

  // Simulate P1 already taken for 9B/Ma1 by Ms Harrison (Week A Monday)
  registerStore.set(`sl-a-har-mon-1_${today}`, [
    { studentId: 'stu-1', attendanceCode: '/', atlGrade: 2 },
    { studentId: 'stu-2', attendanceCode: '/', atlGrade: 1 },
    { studentId: 'stu-3', attendanceCode: 'N', atlGrade: null },
    { studentId: 'stu-4', attendanceCode: '/', atlGrade: 2 },
    { studentId: 'stu-5', attendanceCode: '/', atlGrade: 3 },
    { studentId: 'stu-6', attendanceCode: '/', atlGrade: 2 },
    { studentId: 'stu-7', attendanceCode: '/', atlGrade: 2 },
    { studentId: 'stu-8', attendanceCode: 'N', atlGrade: null },
  ]);

  // Historical data for cls-1 (9B/Ma1) — 10 past lessons across 5 weeks
  // Gives each student a realistic mix of present / absent / late
  const cls1Lessons: Array<{ lessonId: string; date: string; entries: RegisterEntry[] }> = [
    { lessonId: 'sl-a-wil-mon-2', date: '2026-01-12', entries: [
      { studentId: 'stu-1', attendanceCode: '/', atlGrade: 2 }, { studentId: 'stu-2', attendanceCode: '/', atlGrade: 2 },
      { studentId: 'stu-3', attendanceCode: 'N', atlGrade: null }, { studentId: 'stu-4', attendanceCode: '/', atlGrade: 2 },
      { studentId: 'stu-5', attendanceCode: '/', atlGrade: 2 }, { studentId: 'stu-6', attendanceCode: '/', atlGrade: 2 },
      { studentId: 'stu-7', attendanceCode: '/', atlGrade: 2 }, { studentId: 'stu-8', attendanceCode: 'N', atlGrade: null },
    ]},
    { lessonId: 'sl-a-wil-tue-2', date: '2026-01-13', entries: [
      { studentId: 'stu-1', attendanceCode: '/', atlGrade: 2 }, { studentId: 'stu-2', attendanceCode: '/', atlGrade: 1 },
      { studentId: 'stu-3', attendanceCode: '/', atlGrade: 3 }, { studentId: 'stu-4', attendanceCode: '/', atlGrade: 2 },
      { studentId: 'stu-5', attendanceCode: '/', atlGrade: 2 }, { studentId: 'stu-6', attendanceCode: 'L', atlGrade: 2, note: '5 minutes late' },
      { studentId: 'stu-7', attendanceCode: '/', atlGrade: 2 }, { studentId: 'stu-8', attendanceCode: '/', atlGrade: 2 },
    ]},
    { lessonId: 'sl-a-wil-wed-3', date: '2026-01-14', entries: [
      { studentId: 'stu-1', attendanceCode: '\\', atlGrade: 2 }, { studentId: 'stu-2', attendanceCode: '\\', atlGrade: 2 },
      { studentId: 'stu-3', attendanceCode: 'N', atlGrade: null }, { studentId: 'stu-4', attendanceCode: '\\', atlGrade: 2 },
      { studentId: 'stu-5', attendanceCode: '\\', atlGrade: 2 }, { studentId: 'stu-6', attendanceCode: '\\', atlGrade: 2 },
      { studentId: 'stu-7', attendanceCode: '\\', atlGrade: 2 }, { studentId: 'stu-8', attendanceCode: 'N', atlGrade: null },
    ]},
    { lessonId: 'sl-a-wil-mon-2', date: '2026-01-19', entries: [
      { studentId: 'stu-1', attendanceCode: 'N', atlGrade: null }, { studentId: 'stu-2', attendanceCode: '/', atlGrade: 2 },
      { studentId: 'stu-3', attendanceCode: '/', atlGrade: 2 }, { studentId: 'stu-4', attendanceCode: '/', atlGrade: 2 },
      { studentId: 'stu-5', attendanceCode: '/', atlGrade: 1 }, { studentId: 'stu-6', attendanceCode: '/', atlGrade: 2 },
      { studentId: 'stu-7', attendanceCode: '/', atlGrade: 2 }, { studentId: 'stu-8', attendanceCode: '/', atlGrade: 2 },
    ]},
    { lessonId: 'sl-a-wil-tue-2', date: '2026-01-20', entries: [
      { studentId: 'stu-1', attendanceCode: '/', atlGrade: 2 }, { studentId: 'stu-2', attendanceCode: '/', atlGrade: 2 },
      { studentId: 'stu-3', attendanceCode: '/', atlGrade: 2 }, { studentId: 'stu-4', attendanceCode: 'L', atlGrade: 2, note: '3 minutes late' },
      { studentId: 'stu-5', attendanceCode: '/', atlGrade: 2 }, { studentId: 'stu-6', attendanceCode: '/', atlGrade: 2 },
      { studentId: 'stu-7', attendanceCode: 'N', atlGrade: null }, { studentId: 'stu-8', attendanceCode: 'N', atlGrade: null },
    ]},
    { lessonId: 'sl-a-wil-wed-3', date: '2026-01-21', entries: [
      { studentId: 'stu-1', attendanceCode: '\\', atlGrade: 2 }, { studentId: 'stu-2', attendanceCode: '\\', atlGrade: 2 },
      { studentId: 'stu-3', attendanceCode: 'N', atlGrade: null }, { studentId: 'stu-4', attendanceCode: '\\', atlGrade: 2 },
      { studentId: 'stu-5', attendanceCode: '\\', atlGrade: 2 }, { studentId: 'stu-6', attendanceCode: '\\', atlGrade: 3 },
      { studentId: 'stu-7', attendanceCode: '\\', atlGrade: 2 }, { studentId: 'stu-8', attendanceCode: '\\', atlGrade: 2 },
    ]},
    { lessonId: 'sl-a-wil-mon-2', date: '2026-01-26', entries: [
      { studentId: 'stu-1', attendanceCode: '/', atlGrade: 2 }, { studentId: 'stu-2', attendanceCode: '/', atlGrade: 2 },
      { studentId: 'stu-3', attendanceCode: 'N', atlGrade: null }, { studentId: 'stu-4', attendanceCode: '/', atlGrade: 2 },
      { studentId: 'stu-5', attendanceCode: '/', atlGrade: 2 }, { studentId: 'stu-6', attendanceCode: 'L', atlGrade: 2, note: '8 minutes late' },
      { studentId: 'stu-7', attendanceCode: '/', atlGrade: 2 }, { studentId: 'stu-8', attendanceCode: 'N', atlGrade: null },
    ]},
    { lessonId: 'sl-a-wil-tue-2', date: '2026-01-27', entries: [
      { studentId: 'stu-1', attendanceCode: '/', atlGrade: 2 }, { studentId: 'stu-2', attendanceCode: '/', atlGrade: 1 },
      { studentId: 'stu-3', attendanceCode: '/', atlGrade: 2 }, { studentId: 'stu-4', attendanceCode: 'L', atlGrade: 2, note: '4 minutes late' },
      { studentId: 'stu-5', attendanceCode: '/', atlGrade: 2 }, { studentId: 'stu-6', attendanceCode: '/', atlGrade: 2 },
      { studentId: 'stu-7', attendanceCode: '/', atlGrade: 2 }, { studentId: 'stu-8', attendanceCode: '/', atlGrade: 2 },
    ]},
    { lessonId: 'sl-a-wil-mon-2', date: '2026-02-02', entries: [
      { studentId: 'stu-1', attendanceCode: 'N', atlGrade: null }, { studentId: 'stu-2', attendanceCode: '/', atlGrade: 2 },
      { studentId: 'stu-3', attendanceCode: '/', atlGrade: 2 }, { studentId: 'stu-4', attendanceCode: '/', atlGrade: 2 },
      { studentId: 'stu-5', attendanceCode: '/', atlGrade: 2 }, { studentId: 'stu-6', attendanceCode: '/', atlGrade: 2 },
      { studentId: 'stu-7', attendanceCode: '/', atlGrade: 2 }, { studentId: 'stu-8', attendanceCode: 'N', atlGrade: null },
    ]},
    { lessonId: 'sl-a-wil-tue-2', date: '2026-02-03', entries: [
      { studentId: 'stu-1', attendanceCode: '/', atlGrade: 2 }, { studentId: 'stu-2', attendanceCode: '/', atlGrade: 2 },
      { studentId: 'stu-3', attendanceCode: 'L', atlGrade: 2, note: '10 minutes late' }, { studentId: 'stu-4', attendanceCode: '/', atlGrade: 2 },
      { studentId: 'stu-5', attendanceCode: '/', atlGrade: 2 }, { studentId: 'stu-6', attendanceCode: '/', atlGrade: 2 },
      { studentId: 'stu-7', attendanceCode: '/', atlGrade: 2 }, { studentId: 'stu-8', attendanceCode: '/', atlGrade: 2 },
    ]},
  ];

  for (const lesson of cls1Lessons) {
    registerStore.set(`${lesson.lessonId}_${lesson.date}`, lesson.entries);
  }

  // Historical data for cls-2 (10C/Ma2) — 8 past lessons
  const cls2Lessons: Array<{ lessonId: string; date: string; entries: RegisterEntry[] }> = [
    { lessonId: 'sl-a-wil-mon-4', date: '2026-01-12', entries: [
      { studentId: 'stu-9', attendanceCode: '\\', atlGrade: 2 }, { studentId: 'stu-10', attendanceCode: '\\', atlGrade: 2 },
      { studentId: 'stu-11', attendanceCode: '\\', atlGrade: 2 }, { studentId: 'stu-12', attendanceCode: '\\', atlGrade: 2 },
      { studentId: 'stu-13', attendanceCode: 'N', atlGrade: null }, { studentId: 'stu-14', attendanceCode: '\\', atlGrade: 2 },
      { studentId: 'stu-15', attendanceCode: '\\', atlGrade: 2 }, { studentId: 'stu-16', attendanceCode: '\\', atlGrade: 2 },
    ]},
    { lessonId: 'sl-a-wil-tue-5', date: '2026-01-13', entries: [
      { studentId: 'stu-9', attendanceCode: '\\', atlGrade: 2 }, { studentId: 'stu-10', attendanceCode: '\\', atlGrade: 1 },
      { studentId: 'stu-11', attendanceCode: 'N', atlGrade: null }, { studentId: 'stu-12', attendanceCode: '\\', atlGrade: 2 },
      { studentId: 'stu-13', attendanceCode: 'N', atlGrade: null }, { studentId: 'stu-14', attendanceCode: '\\', atlGrade: 2 },
      { studentId: 'stu-15', attendanceCode: 'L', atlGrade: 2, note: '7 minutes late' }, { studentId: 'stu-16', attendanceCode: '\\', atlGrade: 2 },
    ]},
    { lessonId: 'sl-a-wil-mon-4', date: '2026-01-19', entries: [
      { studentId: 'stu-9', attendanceCode: '\\', atlGrade: 2 }, { studentId: 'stu-10', attendanceCode: '\\', atlGrade: 2 },
      { studentId: 'stu-11', attendanceCode: '\\', atlGrade: 2 }, { studentId: 'stu-12', attendanceCode: '\\', atlGrade: 2 },
      { studentId: 'stu-13', attendanceCode: '\\', atlGrade: 2 }, { studentId: 'stu-14', attendanceCode: '\\', atlGrade: 2 },
      { studentId: 'stu-15', attendanceCode: '\\', atlGrade: 2 }, { studentId: 'stu-16', attendanceCode: '\\', atlGrade: 2 },
    ]},
    { lessonId: 'sl-a-wil-tue-5', date: '2026-01-20', entries: [
      { studentId: 'stu-9', attendanceCode: '\\', atlGrade: 2 }, { studentId: 'stu-10', attendanceCode: '\\', atlGrade: 2 },
      { studentId: 'stu-11', attendanceCode: '\\', atlGrade: 2 }, { studentId: 'stu-12', attendanceCode: 'L', atlGrade: 2, note: '4 minutes late' },
      { studentId: 'stu-13', attendanceCode: 'N', atlGrade: null }, { studentId: 'stu-14', attendanceCode: '\\', atlGrade: 2 },
      { studentId: 'stu-15', attendanceCode: '\\', atlGrade: 2 }, { studentId: 'stu-16', attendanceCode: '\\', atlGrade: 2 },
    ]},
    { lessonId: 'sl-a-wil-mon-4', date: '2026-01-26', entries: [
      { studentId: 'stu-9', attendanceCode: '\\', atlGrade: 2 }, { studentId: 'stu-10', attendanceCode: '\\', atlGrade: 2 },
      { studentId: 'stu-11', attendanceCode: '\\', atlGrade: 2 }, { studentId: 'stu-12', attendanceCode: '\\', atlGrade: 2 },
      { studentId: 'stu-13', attendanceCode: '\\', atlGrade: 3 }, { studentId: 'stu-14', attendanceCode: '\\', atlGrade: 2 },
      { studentId: 'stu-15', attendanceCode: 'N', atlGrade: null }, { studentId: 'stu-16', attendanceCode: '\\', atlGrade: 2 },
    ]},
    { lessonId: 'sl-a-wil-tue-5', date: '2026-01-27', entries: [
      { studentId: 'stu-9', attendanceCode: '\\', atlGrade: 2 }, { studentId: 'stu-10', attendanceCode: '\\', atlGrade: 2 },
      { studentId: 'stu-11', attendanceCode: '\\', atlGrade: 2 }, { studentId: 'stu-12', attendanceCode: '\\', atlGrade: 2 },
      { studentId: 'stu-13', attendanceCode: 'N', atlGrade: null }, { studentId: 'stu-14', attendanceCode: '\\', atlGrade: 1 },
      { studentId: 'stu-15', attendanceCode: '\\', atlGrade: 2 }, { studentId: 'stu-16', attendanceCode: '\\', atlGrade: 2 },
    ]},
    { lessonId: 'sl-a-wil-mon-4', date: '2026-02-02', entries: [
      { studentId: 'stu-9', attendanceCode: '\\', atlGrade: 2 }, { studentId: 'stu-10', attendanceCode: '\\', atlGrade: 2 },
      { studentId: 'stu-11', attendanceCode: 'N', atlGrade: null }, { studentId: 'stu-12', attendanceCode: '\\', atlGrade: 2 },
      { studentId: 'stu-13', attendanceCode: '\\', atlGrade: 2 }, { studentId: 'stu-14', attendanceCode: '\\', atlGrade: 2 },
      { studentId: 'stu-15', attendanceCode: '\\', atlGrade: 2 }, { studentId: 'stu-16', attendanceCode: '\\', atlGrade: 2 },
    ]},
    { lessonId: 'sl-a-wil-tue-5', date: '2026-02-03', entries: [
      { studentId: 'stu-9', attendanceCode: '\\', atlGrade: 2 }, { studentId: 'stu-10', attendanceCode: '\\', atlGrade: 2 },
      { studentId: 'stu-11', attendanceCode: '\\', atlGrade: 2 }, { studentId: 'stu-12', attendanceCode: '\\', atlGrade: 2 },
      { studentId: 'stu-13', attendanceCode: 'L', atlGrade: 2, note: '6 minutes late' }, { studentId: 'stu-14', attendanceCode: '\\', atlGrade: 2 },
      { studentId: 'stu-15', attendanceCode: '\\', atlGrade: 2 }, { studentId: 'stu-16', attendanceCode: '\\', atlGrade: 2 },
    ]},
  ];

  for (const lesson of cls2Lessons) {
    registerStore.set(`${lesson.lessonId}_${lesson.date}`, lesson.entries);
  }
}
initRegisters();

// ----- Attendance -----

const recentAttendance: AttendanceRecord[] = [
  { date: '14/02/2026', present: true, session: 'AM', code: 'Present' },
  { date: '14/02/2026', present: true, session: 'PM', code: 'Present' },
  { date: '13/02/2026', present: true, session: 'AM', code: 'Present' },
  { date: '13/02/2026', present: true, session: 'PM', code: 'Present' },
  { date: '12/02/2026', present: true, session: 'AM', code: 'Present' },
  { date: '12/02/2026', present: true, session: 'PM', code: 'Present' },
  { date: '11/02/2026', present: false, session: 'AM', code: 'Late', note: 'Arrived 08:45' },
  { date: '11/02/2026', present: true, session: 'PM', code: 'Present' },
  { date: '10/02/2026', present: true, session: 'AM', code: 'Present' },
  { date: '10/02/2026', present: true, session: 'PM', code: 'Present' },
  { date: '07/02/2026', present: true, session: 'AM', code: 'Present' },
  { date: '07/02/2026', present: true, session: 'PM', code: 'Present' },
  { date: '06/02/2026', present: false, session: 'AM', code: 'Authorised Absence', note: 'Medical appointment' },
  { date: '06/02/2026', present: false, session: 'PM', code: 'Authorised Absence', note: 'Medical appointment' },
];

export const attendanceSummaries: AttendanceSummary[] = [
  { studentId: 'stu-1', overallPercentage: 95.2, presentDays: 99, absentDays: 3, lateDays: 2, totalDays: 104, presentToday: true, recentRecords: recentAttendance },
  { studentId: 'stu-2', overallPercentage: 98.1, presentDays: 102, absentDays: 1, lateDays: 1, totalDays: 104, presentToday: true, recentRecords: [] },
  { studentId: 'stu-3', overallPercentage: 91.3, presentDays: 95, absentDays: 7, lateDays: 2, totalDays: 104, presentToday: false, recentRecords: [] },
  { studentId: 'stu-4', overallPercentage: 97.1, presentDays: 101, absentDays: 2, lateDays: 3, totalDays: 104, presentToday: true, recentRecords: [] },
  { studentId: 'stu-5', overallPercentage: 99.0, presentDays: 103, absentDays: 1, lateDays: 0, totalDays: 104, presentToday: true, recentRecords: [] },
  { studentId: 'stu-6', overallPercentage: 93.3, presentDays: 97, absentDays: 5, lateDays: 5, totalDays: 104, presentToday: true, recentRecords: [] },
  { studentId: 'stu-7', overallPercentage: 96.2, presentDays: 100, absentDays: 3, lateDays: 1, totalDays: 104, presentToday: true, recentRecords: [] },
  { studentId: 'stu-8', overallPercentage: 88.5, presentDays: 92, absentDays: 10, lateDays: 2, totalDays: 104, presentToday: false, recentRecords: [] },
  { studentId: 'stu-9', overallPercentage: 97.1, presentDays: 101, absentDays: 2, lateDays: 1, totalDays: 104, presentToday: true, recentRecords: [] },
  { studentId: 'stu-10', overallPercentage: 100.0, presentDays: 104, absentDays: 0, lateDays: 0, totalDays: 104, presentToday: true, recentRecords: [] },
  { studentId: 'stu-11', overallPercentage: 94.2, presentDays: 98, absentDays: 4, lateDays: 2, totalDays: 104, presentToday: true, recentRecords: [] },
  { studentId: 'stu-12', overallPercentage: 96.2, presentDays: 100, absentDays: 3, lateDays: 1, totalDays: 104, presentToday: true, recentRecords: [] },
  { studentId: 'stu-13', overallPercentage: 89.4, presentDays: 93, absentDays: 8, lateDays: 3, totalDays: 104, presentToday: true, recentRecords: [] },
  { studentId: 'stu-14', overallPercentage: 99.0, presentDays: 103, absentDays: 1, lateDays: 0, totalDays: 104, presentToday: true, recentRecords: [] },
  { studentId: 'stu-15', overallPercentage: 95.2, presentDays: 99, absentDays: 3, lateDays: 2, totalDays: 104, presentToday: false, recentRecords: [] },
  { studentId: 'stu-16', overallPercentage: 97.1, presentDays: 101, absentDays: 2, lateDays: 1, totalDays: 104, presentToday: true, recentRecords: [] },
];

// ----- Behaviour -----

export const behaviourEvents: BehaviourEvent[] = [
  {
    id: 'beh-1',
    studentId: 'stu-1',
    type: 'positive',
    category: 'Outstanding Classwork',
    points: 3,
    note: 'Excellent essay on Romeo and Juliet — really thoughtful analysis.',
    staffName: 'Ms Harrison',
    timestamp: '2026-02-14T10:30:00Z',
  },
  {
    id: 'beh-2',
    studentId: 'stu-1',
    type: 'positive',
    category: 'Helping Others',
    points: 2,
    note: 'Helped a classmate who was struggling with algebra.',
    staffName: 'Mr Wilson',
    timestamp: '2026-02-13T14:15:00Z',
  },
  {
    id: 'beh-3',
    studentId: 'stu-1',
    type: 'negative',
    category: 'Late to Lesson',
    points: -1,
    note: 'Arrived 5 minutes late to Period 3.',
    staffName: 'Mrs Patel',
    timestamp: '2026-02-12T11:15:00Z',
  },
  {
    id: 'beh-4',
    studentId: 'stu-1',
    type: 'positive',
    category: 'Excellent Homework',
    points: 2,
    note: 'Very well-researched history project on the Industrial Revolution.',
    staffName: 'Mr Clarke',
    timestamp: '2026-02-11T09:00:00Z',
  },
  {
    id: 'beh-5',
    studentId: 'stu-1',
    type: 'positive',
    category: 'Active Participation',
    points: 1,
    note: 'Great contributions to class discussion in French.',
    staffName: 'Mme Dubois',
    timestamp: '2026-02-10T13:55:00Z',
  },
  {
    id: 'beh-6',
    studentId: 'stu-1',
    type: 'negative',
    category: 'Incomplete Homework',
    points: -2,
    note: 'Maths homework not completed.',
    staffName: 'Mr Wilson',
    timestamp: '2026-02-07T08:55:00Z',
  },
  // Amara Khan (stu-2)
  {
    id: 'beh-7',
    studentId: 'stu-2',
    type: 'positive',
    category: 'Outstanding Classwork',
    points: 3,
    note: 'Superb algebraic proof — clear and well-structured.',
    staffName: 'Mr Wilson',
    timestamp: '2026-02-14T09:50:00Z',
  },
  {
    id: 'beh-8',
    studentId: 'stu-2',
    type: 'positive',
    category: 'Active Participation',
    points: 1,
    note: 'Volunteered to present her solution to the class.',
    staffName: 'Ms Harrison',
    timestamp: '2026-02-12T10:30:00Z',
  },
  {
    id: 'beh-9',
    studentId: 'stu-2',
    type: 'positive',
    category: 'Helping Others',
    points: 2,
    note: 'Patiently helped a peer with simultaneous equations.',
    staffName: 'Mr Wilson',
    timestamp: '2026-02-10T09:55:00Z',
  },
  // Ethan Davies (stu-3)
  {
    id: 'beh-10',
    studentId: 'stu-3',
    type: 'negative',
    category: 'Late to Lesson',
    points: -1,
    note: 'Arrived 8 minutes late to Period 2 with no explanation.',
    staffName: 'Mr Wilson',
    timestamp: '2026-02-14T10:00:00Z',
  },
  {
    id: 'beh-11',
    studentId: 'stu-3',
    type: 'negative',
    category: 'Disruption',
    points: -2,
    note: 'Repeatedly talking over teacher during explanation.',
    staffName: 'Ms Harrison',
    timestamp: '2026-02-12T09:15:00Z',
  },
  {
    id: 'beh-12',
    studentId: 'stu-3',
    type: 'positive',
    category: 'Great Effort',
    points: 2,
    note: 'Showed real improvement in today\'s science practical.',
    staffName: 'Dr Ahmed',
    timestamp: '2026-02-11T14:00:00Z',
  },
  {
    id: 'beh-13',
    studentId: 'stu-3',
    type: 'negative',
    category: 'Incomplete Homework',
    points: -2,
    note: 'English essay not submitted — second time this half-term.',
    staffName: 'Ms Harrison',
    timestamp: '2026-02-07T09:00:00Z',
  },
  // Jack Roberts (stu-5)
  {
    id: 'beh-14',
    studentId: 'stu-5',
    type: 'positive',
    category: 'Excellent Homework',
    points: 3,
    note: 'Exceptional science write-up with independent research.',
    staffName: 'Dr Ahmed',
    timestamp: '2026-02-13T11:15:00Z',
  },
  {
    id: 'beh-15',
    studentId: 'stu-5',
    type: 'positive',
    category: 'Positive Attitude',
    points: 1,
    note: 'Excellent focus throughout the lesson despite fire alarm disruption.',
    staffName: 'Mr Wilson',
    timestamp: '2026-02-11T10:30:00Z',
  },
  // Maisie Clarke (stu-8)
  {
    id: 'beh-16',
    studentId: 'stu-8',
    type: 'negative',
    category: 'Off Task',
    points: -1,
    note: 'Repeatedly on phone during independent work time.',
    staffName: 'Mr Wilson',
    timestamp: '2026-02-14T10:20:00Z',
  },
  {
    id: 'beh-17',
    studentId: 'stu-8',
    type: 'negative',
    category: 'Late to Lesson',
    points: -1,
    note: '10 minutes late returning from break.',
    staffName: 'Ms Harrison',
    timestamp: '2026-02-13T11:20:00Z',
  },
  {
    id: 'beh-18',
    studentId: 'stu-8',
    type: 'negative',
    category: 'Equipment Missing',
    points: -1,
    note: 'No exercise book or pen — borrowed from spares.',
    staffName: 'Mr Wilson',
    timestamp: '2026-02-10T09:55:00Z',
  },
  {
    id: 'beh-19',
    studentId: 'stu-8',
    type: 'positive',
    category: 'Great Effort',
    points: 2,
    note: 'Stayed behind to finish work — real determination shown.',
    staffName: 'Dr Ahmed',
    timestamp: '2026-02-07T15:00:00Z',
  },
  // Leo Patel (stu-9)
  {
    id: 'beh-20',
    studentId: 'stu-9',
    type: 'positive',
    category: 'Outstanding Classwork',
    points: 3,
    note: 'Brilliant trigonometry work — completed extension tasks independently.',
    staffName: 'Mr Wilson',
    timestamp: '2026-02-14T12:50:00Z',
  },
  {
    id: 'beh-21',
    studentId: 'stu-9',
    type: 'positive',
    category: 'Active Participation',
    points: 1,
    note: 'Led group discussion on climate change impacts.',
    staffName: 'Dr Ahmed',
    timestamp: '2026-02-12T14:00:00Z',
  },
  // Archie Brown (stu-13)
  {
    id: 'beh-22',
    studentId: 'stu-13',
    type: 'negative',
    category: 'Late to Lesson',
    points: -1,
    note: 'Arrived 12 minutes late — says he was in the toilet.',
    staffName: 'Mr Wilson',
    timestamp: '2026-02-13T12:22:00Z',
  },
  {
    id: 'beh-23',
    studentId: 'stu-13',
    type: 'negative',
    category: 'Disruption',
    points: -2,
    note: 'Throwing items across the classroom. Verbal warning given.',
    staffName: 'Ms Harrison',
    timestamp: '2026-02-11T12:30:00Z',
  },
  {
    id: 'beh-24',
    studentId: 'stu-13',
    type: 'negative',
    category: 'Uniform Issue',
    points: -1,
    note: 'Wearing trainers instead of school shoes — third time this week.',
    staffName: 'Mr Wilson',
    timestamp: '2026-02-10T08:55:00Z',
  },
  {
    id: 'beh-25',
    studentId: 'stu-13',
    type: 'positive',
    category: 'Helping Others',
    points: 2,
    note: 'Helped tidy the lab equipment after the practical without being asked.',
    staffName: 'Dr Ahmed',
    timestamp: '2026-02-07T14:50:00Z',
  },
  // Grace Williams (stu-10)
  {
    id: 'beh-26',
    studentId: 'stu-10',
    type: 'positive',
    category: 'Outstanding Classwork',
    points: 3,
    note: 'Perfect score on the quadratics assessment.',
    staffName: 'Mr Wilson',
    timestamp: '2026-02-13T12:50:00Z',
  },
  {
    id: 'beh-27',
    studentId: 'stu-10',
    type: 'positive',
    category: 'Positive Attitude',
    points: 1,
    note: 'Always polite, always ready to learn. A role model.',
    staffName: 'Ms Harrison',
    timestamp: '2026-02-11T12:20:00Z',
  },
  // Isla Murphy (stu-4)
  {
    id: 'beh-28',
    studentId: 'stu-4',
    type: 'positive',
    category: 'Excellent Homework',
    points: 2,
    note: 'Beautifully presented maths homework with all working shown.',
    staffName: 'Mr Wilson',
    timestamp: '2026-02-12T09:55:00Z',
  },
  {
    id: 'beh-29',
    studentId: 'stu-4',
    type: 'negative',
    category: 'Off Task',
    points: -1,
    note: 'Chatting with neighbour during silent reading time.',
    staffName: 'Ms Harrison',
    timestamp: '2026-02-10T09:10:00Z',
  },
  // Freya Hall (stu-6)
  {
    id: 'beh-30',
    studentId: 'stu-6',
    type: 'positive',
    category: 'Active Participation',
    points: 2,
    note: 'Excellent contributions during the poetry discussion.',
    staffName: 'Ms Harrison',
    timestamp: '2026-02-14T09:20:00Z',
  },
  {
    id: 'beh-31',
    studentId: 'stu-6',
    type: 'negative',
    category: 'Late to Lesson',
    points: -1,
    note: 'Arrived 3 minutes late — forgot textbook and went back to locker.',
    staffName: 'Mr Wilson',
    timestamp: '2026-02-12T09:53:00Z',
  },
  {
    id: 'beh-32',
    studentId: 'stu-6',
    type: 'positive',
    category: 'Excellent Homework',
    points: 2,
    note: 'Science report was thorough and well-referenced.',
    staffName: 'Dr Ahmed',
    timestamp: '2026-02-10T11:15:00Z',
  },
  // Noah Bennett (stu-7)
  {
    id: 'beh-33',
    studentId: 'stu-7',
    type: 'positive',
    category: 'Great Effort',
    points: 2,
    note: 'Worked through every extension question without prompting.',
    staffName: 'Mr Wilson',
    timestamp: '2026-02-13T10:40:00Z',
  },
  {
    id: 'beh-34',
    studentId: 'stu-7',
    type: 'positive',
    category: 'Helping Others',
    points: 1,
    note: 'Explained the method clearly to a struggling classmate.',
    staffName: 'Mr Wilson',
    timestamp: '2026-02-11T10:00:00Z',
  },
  {
    id: 'beh-35',
    studentId: 'stu-7',
    type: 'negative',
    category: 'Incomplete Homework',
    points: -2,
    note: 'Only completed half of the set questions.',
    staffName: 'Ms Harrison',
    timestamp: '2026-02-07T09:05:00Z',
  },
  // Harry Shaw (stu-11)
  {
    id: 'beh-36',
    studentId: 'stu-11',
    type: 'negative',
    category: 'Disruption',
    points: -2,
    note: 'Making silly noises during independent reading. Moved seats.',
    staffName: 'Ms Harrison',
    timestamp: '2026-02-14T12:25:00Z',
  },
  {
    id: 'beh-37',
    studentId: 'stu-11',
    type: 'positive',
    category: 'Great Effort',
    points: 2,
    note: 'Showed real perseverance with the harder algebra questions today.',
    staffName: 'Mr Wilson',
    timestamp: '2026-02-12T12:40:00Z',
  },
  {
    id: 'beh-38',
    studentId: 'stu-11',
    type: 'negative',
    category: 'Equipment Missing',
    points: -1,
    note: 'No calculator for the lesson — borrowed from spares.',
    staffName: 'Mr Wilson',
    timestamp: '2026-02-10T12:15:00Z',
  },
  // Chloe Taylor (stu-12)
  {
    id: 'beh-39',
    studentId: 'stu-12',
    type: 'positive',
    category: 'Outstanding Classwork',
    points: 3,
    note: 'Produced an exceptional piece of creative writing in class.',
    staffName: 'Ms Harrison',
    timestamp: '2026-02-13T12:20:00Z',
  },
  {
    id: 'beh-40',
    studentId: 'stu-12',
    type: 'positive',
    category: 'Positive Attitude',
    points: 1,
    note: 'Always arrives on time, always ready to work. Pleasure to teach.',
    staffName: 'Mr Wilson',
    timestamp: '2026-02-11T12:15:00Z',
  },
  // Lily Jones (stu-14)
  {
    id: 'beh-41',
    studentId: 'stu-14',
    type: 'positive',
    category: 'Active Participation',
    points: 2,
    note: 'Asked really insightful questions during the enzymes topic.',
    staffName: 'Dr Ahmed',
    timestamp: '2026-02-14T13:55:00Z',
  },
  {
    id: 'beh-42',
    studentId: 'stu-14',
    type: 'positive',
    category: 'Excellent Homework',
    points: 3,
    note: 'Maths homework was flawless — all working shown clearly.',
    staffName: 'Mr Wilson',
    timestamp: '2026-02-12T12:15:00Z',
  },
  {
    id: 'beh-43',
    studentId: 'stu-14',
    type: 'negative',
    category: 'Late to Lesson',
    points: -1,
    note: 'Arrived 4 minutes late from PE — got changed slowly.',
    staffName: 'Ms Harrison',
    timestamp: '2026-02-10T12:14:00Z',
  },
  // Oscar Wright (stu-15)
  {
    id: 'beh-44',
    studentId: 'stu-15',
    type: 'negative',
    category: 'Off Task',
    points: -1,
    note: 'Drawing in exercise book instead of completing the task.',
    staffName: 'Mr Wilson',
    timestamp: '2026-02-13T12:30:00Z',
  },
  {
    id: 'beh-45',
    studentId: 'stu-15',
    type: 'negative',
    category: 'Incomplete Homework',
    points: -2,
    note: 'No homework submitted — says he forgot about it.',
    staffName: 'Dr Ahmed',
    timestamp: '2026-02-11T13:55:00Z',
  },
  {
    id: 'beh-46',
    studentId: 'stu-15',
    type: 'positive',
    category: 'Helping Others',
    points: 2,
    note: 'Helped set up the science equipment for the practical without being asked.',
    staffName: 'Dr Ahmed',
    timestamp: '2026-02-07T13:55:00Z',
  },
  // Poppy Green (stu-16)
  {
    id: 'beh-47',
    studentId: 'stu-16',
    type: 'positive',
    category: 'Outstanding Classwork',
    points: 3,
    note: 'Brilliant analysis of the data set — spotted the outlier immediately.',
    staffName: 'Mr Wilson',
    timestamp: '2026-02-14T12:45:00Z',
  },
  {
    id: 'beh-48',
    studentId: 'stu-16',
    type: 'positive',
    category: 'Great Effort',
    points: 2,
    note: 'Has really improved her confidence in answering questions aloud.',
    staffName: 'Ms Harrison',
    timestamp: '2026-02-12T12:30:00Z',
  },
  {
    id: 'beh-49',
    studentId: 'stu-16',
    type: 'negative',
    category: 'Uniform Issue',
    points: -1,
    note: 'Wearing coloured socks — reminded of the uniform policy.',
    staffName: 'Mr Wilson',
    timestamp: '2026-02-10T08:55:00Z',
  },
];

// ----- Timetable -----
// School day: Form 08:30–08:50, P1 08:50–09:50, P2 09:50–10:50,
// Break 10:50–11:10, P3 11:10–12:10, P4 12:10–13:10,
// Lunch 13:10–13:50, P5 13:50–14:50

export const timetableLessons: TimetableLesson[] = [
  // Monday
  { id: 'tt-mon-1', day: 'Monday', period: 1, startTime: '08:50', endTime: '09:50', subject: 'English', teacher: 'Ms Harrison', room: 'E12' },
  { id: 'tt-mon-2', day: 'Monday', period: 2, startTime: '09:50', endTime: '10:50', subject: 'Maths', teacher: 'Mr Wilson', room: 'M04' },
  { id: 'tt-mon-3', day: 'Monday', period: 3, startTime: '11:10', endTime: '12:10', subject: 'Science', teacher: 'Dr Ahmed', room: 'S08' },
  { id: 'tt-mon-4', day: 'Monday', period: 4, startTime: '12:10', endTime: '13:10', subject: 'History', teacher: 'Mr Clarke', room: 'H03' },
  { id: 'tt-mon-5', day: 'Monday', period: 5, startTime: '13:50', endTime: '14:50', subject: 'PE', teacher: 'Mr Brennan', room: 'Sports Hall' },

  // Tuesday
  { id: 'tt-tue-1', day: 'Tuesday', period: 1, startTime: '08:50', endTime: '09:50', subject: 'French', teacher: 'Mme Dubois', room: 'L07' },
  { id: 'tt-tue-2', day: 'Tuesday', period: 2, startTime: '09:50', endTime: '10:50', subject: 'Maths', teacher: 'Mr Wilson', room: 'M04' },
  { id: 'tt-tue-3', day: 'Tuesday', period: 3, startTime: '11:10', endTime: '12:10', subject: 'Art', teacher: 'Ms O\'Brien', room: 'A02' },
  { id: 'tt-tue-4', day: 'Tuesday', period: 4, startTime: '12:10', endTime: '13:10', subject: 'Computer Science', teacher: 'Mrs Patel', room: 'IT1' },
  { id: 'tt-tue-5', day: 'Tuesday', period: 5, startTime: '13:50', endTime: '14:50', subject: 'Science', teacher: 'Dr Ahmed', room: 'S08' },

  // Wednesday
  { id: 'tt-wed-1', day: 'Wednesday', period: 1, startTime: '08:50', endTime: '09:50', subject: 'Geography', teacher: 'Miss Taylor', room: 'G05' },
  { id: 'tt-wed-2', day: 'Wednesday', period: 2, startTime: '09:50', endTime: '10:50', subject: 'English', teacher: 'Ms Harrison', room: 'E12' },
  { id: 'tt-wed-3', day: 'Wednesday', period: 3, startTime: '11:10', endTime: '12:10', subject: 'Maths', teacher: 'Mr Wilson', room: 'M04' },
  { id: 'tt-wed-4', day: 'Wednesday', period: 4, startTime: '12:10', endTime: '13:10', subject: 'Music', teacher: 'Mr Nguyen', room: 'Mu1' },
  { id: 'tt-wed-5', day: 'Wednesday', period: 5, startTime: '13:50', endTime: '14:50', subject: 'Science', teacher: 'Dr Ahmed', room: 'S08' },

  // Thursday
  { id: 'tt-thu-1', day: 'Thursday', period: 1, startTime: '08:50', endTime: '09:50', subject: 'History', teacher: 'Mr Clarke', room: 'H03' },
  { id: 'tt-thu-2', day: 'Thursday', period: 2, startTime: '09:50', endTime: '10:50', subject: 'Science', teacher: 'Dr Ahmed', room: 'S08' },
  { id: 'tt-thu-3', day: 'Thursday', period: 3, startTime: '11:10', endTime: '12:10', subject: 'French', teacher: 'Mme Dubois', room: 'L07' },
  { id: 'tt-thu-4', day: 'Thursday', period: 4, startTime: '12:10', endTime: '13:10', subject: 'English', teacher: 'Ms Harrison', room: 'E12' },
  { id: 'tt-thu-5', day: 'Thursday', period: 5, startTime: '13:50', endTime: '14:50', subject: 'Computer Science', teacher: 'Mrs Patel', room: 'IT1' },

  // Friday
  { id: 'tt-fri-1', day: 'Friday', period: 1, startTime: '08:50', endTime: '09:50', subject: 'Maths', teacher: 'Mr Wilson', room: 'M04' },
  { id: 'tt-fri-2', day: 'Friday', period: 2, startTime: '09:50', endTime: '10:50', subject: 'PE', teacher: 'Mr Brennan', room: 'Sports Hall' },
  { id: 'tt-fri-3', day: 'Friday', period: 3, startTime: '11:10', endTime: '12:10', subject: 'Geography', teacher: 'Miss Taylor', room: 'G05' },
  { id: 'tt-fri-4', day: 'Friday', period: 4, startTime: '12:10', endTime: '13:10', subject: 'Science', teacher: 'Dr Ahmed', room: 'S08' },
  { id: 'tt-fri-5', day: 'Friday', period: 5, startTime: '13:50', endTime: '14:50', subject: 'Art', teacher: 'Ms O\'Brien', room: 'A02' },
];

// ----- Announcements -----

export const announcements: Announcement[] = [
  {
    id: 'ann-1',
    title: 'Year 9 Parents\' Evening — Thursday 26th February',
    body: 'A reminder that Year 9 Parents\' Evening is on Thursday 26th February from 16:00 to 19:00. Please book your appointments via the link sent to your email. If you have any issues booking, contact the school office.',
    author: 'Mrs Carter',
    publishedAt: '2026-02-14T08:00:00Z',
    pinned: true,
  },
  {
    id: 'ann-2',
    title: 'Half-Term Holiday',
    body: 'School will be closed for half-term from Monday 16th February to Friday 20th February. Students return on Monday 23rd February. We hope everyone has a restful break.',
    author: 'Mrs Carter',
    publishedAt: '2026-02-12T09:00:00Z',
    pinned: true,
  },
  {
    id: 'ann-3',
    title: 'World Book Day — Thursday 5th March',
    body: 'We are celebrating World Book Day on Thursday 5th March. Students are welcome to come to school dressed as their favourite book character. The English department has organised a range of activities throughout the day.',
    author: 'Ms Harrison',
    publishedAt: '2026-02-11T12:00:00Z',
    pinned: false,
  },
  {
    id: 'ann-4',
    title: 'School Uniform Reminder',
    body: 'Please ensure all students are wearing the correct school uniform, including black school shoes (not trainers). Students without correct uniform may be asked to borrow items from our spare uniform supply.',
    author: 'Mr Brennan',
    publishedAt: '2026-02-10T08:30:00Z',
    pinned: false,
  },
  {
    id: 'ann-5',
    title: 'Year 9 Options Evening — Save the Date',
    body: 'Year 9 Options Evening will be held on Wednesday 11th March at 18:00 in the main hall. This is an important event where students and parents can learn about GCSE subject choices. More details to follow.',
    author: 'Mrs Carter',
    publishedAt: '2026-02-07T10:00:00Z',
    pinned: false,
  },
];

// ----- Messages -----

export const messages: Message[] = [
  {
    id: 'msg-1',
    fromUserId: 'usr-parent-1',
    toUserId: 'usr-teacher-1',
    body: 'Hi Mr Wilson, I just wanted to check — Oliver mentioned he found the algebra homework tricky. Is there anything we can do at home to help him?',
    sentAt: '2026-02-13T18:30:00Z',
    readAt: '2026-02-13T19:45:00Z',
  },
  {
    id: 'msg-2',
    fromUserId: 'usr-teacher-1',
    toUserId: 'usr-parent-1',
    body: 'Hi Mrs Thompson, thanks for getting in touch. Oliver is doing well overall — the quadratic equations topic is a step up and lots of students find it challenging at first. I\'ve uploaded some extra practice sheets to the class page. Happy to go through anything with him at lunchtime if he\'d like.',
    sentAt: '2026-02-13T20:10:00Z',
    readAt: '2026-02-14T07:15:00Z',
  },
  {
    id: 'msg-3',
    fromUserId: 'usr-parent-1',
    toUserId: 'usr-teacher-1',
    body: 'That\'s really helpful, thank you. I\'ll make sure he looks at the practice sheets this weekend.',
    sentAt: '2026-02-14T07:20:00Z',
  },
];

// ----- Class Posts -----

export const classPosts: ClassPost[] = [
  {
    id: 'cp-1',
    classGroupId: 'cls-1',
    classGroupName: '9B/Ma1',
    subject: 'Maths',
    authorId: 'usr-teacher-1',
    authorName: 'Mr Wilson',
    body: 'Reminder: Please bring your calculators to every lesson this week. We will be starting the statistics unit.',
    postedAt: '2026-02-14T09:00:00Z',
  },
  {
    id: 'cp-2',
    classGroupId: 'cls-1',
    classGroupName: '9B/Ma1',
    subject: 'Maths',
    authorId: 'usr-teacher-1',
    authorName: 'Mr Wilson',
    body: 'Well done to everyone who completed the quadratic equations homework on time. The class average was 72% which is a great improvement!',
    postedAt: '2026-02-12T15:30:00Z',
  },
  {
    id: 'cp-3',
    classGroupId: 'cls-2',
    classGroupName: '10C/Ma2',
    subject: 'Maths',
    authorId: 'usr-teacher-1',
    authorName: 'Mr Wilson',
    body: 'Mock exam revision sheets have been added to the homework section. Please work through at least two sections before Friday.',
    postedAt: '2026-02-13T11:00:00Z',
  },
];

// ----- Homework -----

export const homeworks: Homework[] = [
  {
    id: 'hw-1',
    classGroupId: 'cls-1',
    title: 'Quadratic Equations Practice',
    description: 'Complete questions 1–15 on page 94 of the textbook. Show all working out clearly.',
    dueDate: '2026-02-20',
    issuedDate: '2026-02-13',
    teacherId: 'usr-teacher-1',
    teacherName: 'Mr Wilson',
    links: ['https://www.mathsisfun.com/algebra/quadratic-equation.html'],
  },
  {
    id: 'hw-2',
    classGroupId: 'cls-1',
    title: 'Simultaneous Equations Worksheet',
    description: 'Download and complete the worksheet linked below. Use the elimination method for questions 1–5 and substitution for 6–10.',
    dueDate: '2026-02-17',
    issuedDate: '2026-02-10',
    teacherId: 'usr-teacher-1',
    teacherName: 'Mr Wilson',
  },
  {
    id: 'hw-3',
    classGroupId: 'cls-2',
    title: 'Trigonometry — SOH CAH TOA',
    description: 'Complete the trigonometry revision sheet. Label all diagrams and show working for each step.',
    dueDate: '2026-02-19',
    issuedDate: '2026-02-12',
    teacherId: 'usr-teacher-1',
    teacherName: 'Mr Wilson',
    links: ['https://corbettmaths.com/contents/trigonometry/'],
  },
];

// ----- Homework Completions -----

export const homeworkCompletions: HomeworkCompletion[] = [
  // hw-2 (Simultaneous Equations) — several students handed in
  { homeworkId: 'hw-2', studentId: 'stu-1', completedAt: '2026-02-15T09:00:00Z', markedBy: 'usr-teacher-1' },
  { homeworkId: 'hw-2', studentId: 'stu-2', completedAt: '2026-02-15T09:05:00Z', markedBy: 'usr-teacher-1' },
  { homeworkId: 'hw-2', studentId: 'stu-4', completedAt: '2026-02-14T14:00:00Z', markedBy: 'usr-teacher-1' },
  { homeworkId: 'hw-2', studentId: 'stu-5', completedAt: '2026-02-15T08:50:00Z', markedBy: 'usr-teacher-1' },
  { homeworkId: 'hw-2', studentId: 'stu-6', completedAt: '2026-02-15T10:00:00Z', markedBy: 'usr-teacher-1' },
  // hw-3 (Trigonometry) — a couple of Year 10 students handed in
  { homeworkId: 'hw-3', studentId: 'stu-9', completedAt: '2026-02-14T16:00:00Z', markedBy: 'usr-teacher-1' },
  { homeworkId: 'hw-3', studentId: 'stu-10', completedAt: '2026-02-15T08:45:00Z', markedBy: 'usr-teacher-1' },
];

// ----- Pastoral Notes -----

export const pastoralNotes: PastoralNote[] = [
  {
    id: 'pn-1',
    studentId: 'stu-1',
    category: 'welfare',
    severity: 'medium',
    title: 'Seems withdrawn in lessons',
    body: 'Oliver has been noticeably quiet over the past week. Not engaging with group work as usual. Had a brief chat — says everything is fine but worth monitoring.',
    staffId: 'usr-teacher-1',
    staffName: 'Mr Wilson',
    createdAt: '2026-02-10T11:30:00Z',
  },
  {
    id: 'pn-2',
    studentId: 'stu-1',
    category: 'attendance',
    severity: 'low',
    title: 'Pattern of Monday absences',
    body: 'Absent 3 of last 5 Mondays. Parent contacted — mum aware and says he is struggling with Sunday night anxiety. Will follow up with pastoral team.',
    staffId: 'usr-teacher-1',
    staffName: 'Mr Wilson',
    createdAt: '2026-02-06T09:15:00Z',
  },
  {
    id: 'pn-3',
    studentId: 'stu-3',
    category: 'family',
    severity: 'high',
    title: 'Parents separating — confidential',
    body: 'Mum informed school that parents are going through a separation. Amara may be upset or distracted. Please handle sensitively. Referred to school counsellor.',
    staffId: 'usr-admin-1',
    staffName: 'Admin',
    createdAt: '2026-02-12T14:00:00Z',
  },
  {
    id: 'pn-4',
    studentId: 'stu-9',
    category: 'behavioural',
    severity: 'medium',
    title: 'Conflict with another student',
    body: 'Leo had a verbal altercation with a Year 11 student at break. Both students spoken to separately. No physical contact. Parents not yet informed — monitoring.',
    staffId: 'usr-teacher-1',
    staffName: 'Mr Wilson',
    createdAt: '2026-02-13T13:45:00Z',
  },
  {
    id: 'pn-5',
    studentId: 'stu-5',
    category: 'medical',
    severity: 'low',
    title: 'New inhaler prescribed',
    body: 'Mum called to say Sophia has been prescribed a new preventer inhaler. Spare kept in medical room. PE staff informed.',
    staffId: 'usr-admin-1',
    staffName: 'Admin',
    createdAt: '2026-02-08T10:20:00Z',
  },
];

// ----- SEND Plans -----

export const studentPlans: StudentPlan[] = [
  {
    studentId: 'stu-3',
    penPortrait: {
      summary: 'Ethan is a quiet, thoughtful student who works best in structured environments. He can become anxious in unstructured situations or when routines change unexpectedly. He has a diagnosis of ASD and responds well to clear instructions and advance warning of transitions.',
      strengths: [
        'Strong visual learner — retains information well from diagrams and written instructions',
        'Excellent attention to detail in written work',
        'Kind and considerate with peers when comfortable',
        'Passionate about science and technology',
      ],
      difficulties: [
        'Processing verbal instructions, especially when given quickly or in multiple steps',
        'Managing transitions between activities or unexpected timetable changes',
        'Initiating social interactions or group work',
        'Sensory overload in noisy environments',
      ],
      strategies: [
        'Give instructions one step at a time, supported with written/visual prompts',
        'Provide advance warning of any changes to routine (ideally 5+ minutes)',
        'Seat near the front, away from doorways and high-traffic areas',
        'Allow use of ear defenders during independent work if requested',
        'Pair with a familiar, supportive peer for group activities',
      ],
      updatedAt: '2026-01-15T00:00:00Z',
    },
    ehcp: {
      provisions: [
        'Access to a quiet space for regulation breaks (up to 10 minutes, self-initiated)',
        '1:1 TA support in English and Humanities (3 hours per week)',
        'Modified homework expectations — extended deadlines by 2 days where needed',
        'Speech and Language Therapy input termly',
        'Annual review with EP, parents, SENCO, and class teachers',
      ],
      adjustments: [
        'Extra processing time for verbal questions (minimum 10 seconds)',
        'Written task instructions provided alongside verbal delivery',
        'Reduced copying from the board — provide printed notes where possible',
        'Exam access: 25% extra time, separate room, rest breaks',
      ],
      keyWorker: 'Mrs Davies (SENCO)',
      annualReviewDate: '2026-05-12',
      updatedAt: '2025-09-20T00:00:00Z',
    },
  },
  {
    studentId: 'stu-5',
    penPortrait: {
      summary: 'Sophia is a bright, sociable student who is capable of high achievement but can become easily distracted in lessons. She has a diagnosis of ADHD (combined type) and benefits from movement breaks and tasks broken into shorter chunks.',
      strengths: [
        'Creative thinker — excellent at generating ideas in discussions',
        'Strong verbal communicator and confident presenter',
        'Naturally empathetic — great at supporting peers emotionally',
        'Highly motivated by praise and recognition',
      ],
      difficulties: [
        'Sustaining focus during extended independent tasks (>10 minutes)',
        'Organisational skills — often forgets equipment or homework',
        'Impulse control — may call out or interrupt without raising hand',
        'Starting tasks — can appear "frozen" even when she understands the work',
      ],
      strategies: [
        'Break tasks into 10-minute chunks with mini check-ins',
        'Use a visual timer on the board so she can see time remaining',
        'Provide a task checklist she can physically tick off',
        'Allow fidget tool use (she has an agreed stress ball)',
        'Praise effort and on-task behaviour specifically and frequently',
        'Seat away from windows and social distractions',
      ],
      updatedAt: '2026-01-10T00:00:00Z',
    },
    myPlan: {
      targets: [
        {
          target: 'Complete and submit 80% of homework tasks on time over a half-term',
          strategies: [
            'Homework planner checked and signed by form tutor daily',
            'Text reminder sent to parent on homework-heavy days',
            'Access to homework club Tues/Thurs after school',
          ],
          progress: 'developing',
        },
        {
          target: 'Use agreed hand signal instead of calling out in 4 out of 5 lessons observed',
          strategies: [
            'Discreet hand signal agreed with student (two fingers raised)',
            'Teacher to acknowledge signal within 30 seconds',
            'Self-monitoring tally chart on desk',
          ],
          progress: 'emerging',
        },
        {
          target: 'Independently start tasks within 2 minutes of instruction in 3 out of 5 lessons',
          strategies: [
            'Teacher to provide written starter instruction on desk before lesson',
            '"First step" prompt card in pencil case',
            'TA to check in at start of task if available',
          ],
          progress: 'not started',
        },
      ],
      reviewDate: '2026-03-28',
      keyWorker: 'Mrs Davies (SENCO)',
      updatedAt: '2026-01-10T00:00:00Z',
    },
  },
  {
    studentId: 'stu-8',
    penPortrait: {
      summary: 'Marcus has a complex profile including SEMH needs and a history of school refusal. When in school he can be engaged and articulate, but attendance is a significant barrier. He has an EHCP and a MyPlan focused on re-engagement. Relationships with trusted adults are key.',
      strengths: [
        'Articulate and perceptive — can produce excellent verbal responses',
        'Strong sense of fairness and justice',
        'Responds well to 1:1 adult support and mentoring',
        'Interest in music and creative subjects',
      ],
      difficulties: [
        'Anxiety around attending school — particularly Monday mornings and after holidays',
        'Can become withdrawn or oppositional if he feels overwhelmed or singled out',
        'Written output significantly below verbal ability',
        'Building trust with new staff members',
      ],
      strategies: [
        'Greet warmly and calmly at the door — avoid drawing attention to absence',
        'Do not put on the spot publicly (e.g. reading aloud, answering cold-call questions)',
        'Offer a quiet check-in at the start of the lesson: "How are you doing today?"',
        'Accept verbal or recorded responses as alternatives to extended writing',
        'If he signals he needs to leave, allow him to go to the Hub without question',
      ],
      updatedAt: '2026-02-01T00:00:00Z',
    },
    ehcp: {
      provisions: [
        'Personalised timetable — reduced to 80% with Wednesday PM as integration time',
        'Access to The Hub (pastoral room) as a safe space throughout the day',
        'Named key worker for weekly mentoring sessions (Mr Clarke)',
        'Counselling provision: 1 session per week via school counsellor',
        'Graduated return protocol after any absence of 3+ days',
      ],
      adjustments: [
        'No sanctions for lateness on arrival — log but do not challenge',
        'Alternative homework arrangements — verbal/recorded submissions accepted',
        'Flexible seating — allowed to sit near exit for emotional regulation',
        'Exam access: 25% extra time, separate room, scribe available',
      ],
      keyWorker: 'Mr Clarke (Pastoral Lead)',
      annualReviewDate: '2026-06-18',
      updatedAt: '2025-11-14T00:00:00Z',
    },
    myPlan: {
      targets: [
        {
          target: 'Achieve 75% attendance across a full half-term',
          strategies: [
            'Morning check-in call from key worker on days not in school by 9:15',
            'Reduced timetable with preferred subjects prioritised',
            'Parent partnership: weekly update call every Friday',
          ],
          progress: 'emerging',
        },
        {
          target: 'Attend at least 3 full days per week for 4 consecutive weeks',
          strategies: [
            'Flexible start — can arrive by 9:30 without consequence',
            'Pre-agreed "safe" lessons to attend on difficult days',
            'Reward: choice of enrichment activity on Friday PM after 3 full days',
          ],
          progress: 'not started',
        },
      ],
      reviewDate: '2026-03-14',
      keyWorker: 'Mr Clarke (Pastoral Lead)',
      updatedAt: '2026-02-01T00:00:00Z',
    },
  },
  {
    studentId: 'stu-1',
    penPortrait: {
      summary: 'Oliver is a well-rounded student who performs well across most subjects. He has mild dyslexia which primarily affects his reading speed and spelling accuracy. He is confident and has good self-advocacy skills — he will usually ask for help when needed.',
      strengths: [
        'Strong mathematical and logical reasoning',
        'Confident communicator — contributes well in discussions',
        'Good self-awareness of his own learning needs',
        'Popular with peers and works well in groups',
      ],
      difficulties: [
        'Reading speed — may need longer to process text-heavy resources',
        'Spelling accuracy, particularly with subject-specific vocabulary',
        'Copying from the board accurately',
      ],
      strategies: [
        'Provide printed handouts rather than expecting board copying',
        'Allow use of laptop for extended writing tasks',
        'Do not mark down for spelling errors in non-English subjects',
        'Use pastel-coloured paper/overlays if available (cream preferred)',
      ],
      updatedAt: '2025-10-05T00:00:00Z',
    },
  },
  {
    studentId: 'stu-13',
    penPortrait: {
      summary: 'Noah is a polite, hardworking student who can lack confidence in his own abilities. He has dyscalculia and finds number-based tasks significantly more challenging than his peers. He benefits from concrete manipulatives and visual models.',
      strengths: [
        'Determined and hardworking — always attempts every task',
        'Excellent literacy skills — reads above age-related expectations',
        'Kind and supportive to classmates',
        'Strong in humanities and creative writing',
      ],
      difficulties: [
        'Number sense — struggles with mental arithmetic and estimation',
        'Telling the time on analogue clocks',
        'Interpreting graphs, charts, and data in any subject',
        'Can become frustrated and shut down during maths-heavy activities',
      ],
      strategies: [
        'Allow calculator use at all times in maths and science',
        'Provide number lines and multiplication grids as reference tools',
        'Use concrete examples before abstract concepts',
        'Frame maths tasks within real-world contexts where possible',
        'Avoid timed arithmetic tests — assess understanding through method',
      ],
      updatedAt: '2026-01-20T00:00:00Z',
    },
    myPlan: {
      targets: [
        {
          target: 'Use a multiplication grid independently to solve problems in 4 out of 5 observed lessons',
          strategies: [
            'Laminated multiplication grid kept in pencil case',
            'TA to model use at start of each new topic',
            'Peer buddy system for checking working',
          ],
          progress: 'developing',
        },
        {
          target: 'Attempt all graph/data questions in assessments (even if answer is incorrect)',
          strategies: [
            'Pre-teach graph reading skills in intervention sessions',
            'Provide step-by-step scaffold for interpreting axes',
            'Praise attempt and method over accuracy',
          ],
          progress: 'emerging',
        },
      ],
      reviewDate: '2026-03-21',
      keyWorker: 'Mrs Davies (SENCO)',
      updatedAt: '2026-01-20T00:00:00Z',
    },
  },
];
