// ============================================================
// Mock API handlers — client-side replacement for Express routes.
// Used when running as a static build (e.g. GitHub Pages) with
// no Express backend. Mirrors the server route logic exactly.
// ============================================================

import {
  users,
  students,
  attendanceSummaries,
  behaviourEvents,
  timetableLessons,
  classGroups,
  staffLessons,
  announcements,
  messages,
  registerStore,
  homeworks,
  homeworkCompletions,
} from './data';

// MockUser type available from ./data if needed

// ---- Types used internally ----

type ATLGrade = 1 | 2 | 3 | 4 | 5;

interface RegisterEntry {
  studentId: string;
  attendanceCode: string;
  atlGrade: ATLGrade | null;
  note?: string;
}

interface BehaviourEvent {
  id: string;
  studentId: string;
  type: 'positive' | 'negative';
  category: string;
  points: number;
  note: string;
  staffName: string;
  timestamp: string;
}

interface Message {
  id: string;
  fromUserId: string;
  toUserId: string;
  body: string;
  sentAt: string;
  readAt?: string;
}

interface Announcement {
  id: string;
  title: string;
  body: string;
  author: string;
  publishedAt: string;
  pinned: boolean;
}

// ---- Module-level state ----

let currentUser: {
  id: string;
  firstName: string;
  lastName: string;
  role: string;
  studentIds: string[];
} | null = null;

// ---- Teacher display name helper ----

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

// ---- Helpers ----

function ok(data: any): { status: number; data: any } {
  return { status: 200, data: { data } };
}

function created(data: any): { status: number; data: any } {
  return { status: 201, data: { data } };
}

function err(status: number, error: string): { status: number; data: any } {
  return { status, data: { error } };
}

/** Check whether the current (parent/student) user owns the given student */
function parentOwnsStudent(studentId: string): boolean {
  if (!currentUser) return false;
  if (currentUser.role !== 'parent' && currentUser.role !== 'student') return true; // staff/admin can view any student
  return currentUser.studentIds.includes(studentId);
}

// ---- WondeService equivalents ----

function searchStudents(query: string) {
  const q = query.toLowerCase();
  return students.filter(
    (s) =>
      s.firstName.toLowerCase().includes(q) ||
      s.lastName.toLowerCase().includes(q) ||
      `${s.firstName} ${s.lastName}`.toLowerCase().includes(q)
  );
}

function getStudent(studentId: string) {
  return students.find((s) => s.id === studentId);
}

function getAttendance(studentId: string) {
  return attendanceSummaries.find((a) => a.studentId === studentId);
}

function getBehaviour(studentId: string): BehaviourEvent[] {
  return behaviourEvents
    .filter((b) => b.studentId === studentId)
    .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
}

function getTimetable(studentId: string) {
  // stu-1 has a hand-crafted full timetable
  if (studentId === 'stu-1') {
    return timetableLessons;
  }

  // For other students, derive from class group membership + staffLessons (Week A)
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

function getTimetableForDay(studentId: string, day: string) {
  return getTimetable(studentId)
    .filter((l) => l.day === day)
    .sort((a, b) => a.period - b.period);
}

function getClassGroupsByTeacher(teacherId: string) {
  return classGroups.filter((c) => c.teacherId === teacherId);
}

function getStudentsByClassGroup(classGroupId: string) {
  const group = classGroups.find((c) => c.id === classGroupId);
  if (!group) return [];
  return students.filter((s) => group.studentIds.includes(s.id));
}

function getClassAttendanceOverview(classGroupId: string) {
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
      const todayLate = summary.recentRecords.some(
        (r: any) => r.code === 'Late' && r.session === 'AM'
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

function getStaffLessons(_teacherId: string) {
  return [...staffLessons].sort((a, b) => {
    const dayOrder = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];
    const dayDiff = dayOrder.indexOf(a.day) - dayOrder.indexOf(b.day);
    return dayDiff !== 0 ? dayDiff : a.period - b.period;
  });
}

function getStaffLessonsForDay(_teacherId: string, day: string) {
  return staffLessons
    .filter((l) => l.day === day)
    .sort((a, b) => a.period - b.period);
}

function getClassGroupsByStudent(studentId: string) {
  return classGroups.filter((c) => c.studentIds.includes(studentId));
}

// ============================================================
// Main request handler
// ============================================================

export function handleMockRequest(
  method: string,
  path: string,
  body?: any
): { status: number; data: any } {
  // Normalise
  const upperMethod = method.toUpperCase();

  // Strip /api prefix
  let route = path;
  if (route.startsWith('/api')) {
    route = route.slice(4);
  }

  // Split route and query string
  const [routePath, queryString] = route.split('?');
  const params = new URLSearchParams(queryString || '');

  // Strip trailing slash
  const cleanPath = routePath.endsWith('/') && routePath.length > 1
    ? routePath.slice(0, -1)
    : routePath;

  // ----------------------------------------------------------------
  // AUTH
  // ----------------------------------------------------------------
  if (cleanPath === '/auth/login' && upperMethod === 'POST') {
    return handleAuthLogin(body);
  }

  // All remaining routes require auth
  if (!currentUser) {
    return err(401, 'Not authenticated');
  }

  // ----------------------------------------------------------------
  // STUDENTS
  // ----------------------------------------------------------------
  if (cleanPath === '/students' && upperMethod === 'GET') {
    return handleSearchStudents(params);
  }

  // Match /students/:id/attendance, /students/:id/behaviour, etc.
  const studentSubMatch = cleanPath.match(/^\/students\/([^/]+)\/(.+)$/);
  if (studentSubMatch && upperMethod === 'GET') {
    const [, studentId, sub] = studentSubMatch;
    switch (sub) {
      case 'attendance': return handleStudentAttendance(studentId);
      case 'behaviour': return handleStudentBehaviour(studentId);
      case 'timetable': return handleStudentTimetable(studentId, params);
      case 'classes': return handleStudentClasses(studentId);
      case 'contacts': return handleStudentContacts(studentId);
    }
  }

  // Match /students/:id (must come after sub-routes)
  const studentIdMatch = cleanPath.match(/^\/students\/([^/]+)$/);
  if (studentIdMatch && upperMethod === 'GET') {
    return handleGetStudent(studentIdMatch[1]);
  }

  // ----------------------------------------------------------------
  // STAFF
  // ----------------------------------------------------------------
  if (cleanPath === '/staff/classes' && upperMethod === 'GET') {
    return handleStaffClasses();
  }

  const staffClassStudentsMatch = cleanPath.match(/^\/staff\/classes\/([^/]+)\/students$/);
  if (staffClassStudentsMatch && upperMethod === 'GET') {
    return handleStaffClassStudents(staffClassStudentsMatch[1]);
  }

  const staffClassAttendanceMatch = cleanPath.match(/^\/staff\/classes\/([^/]+)\/attendance$/);
  if (staffClassAttendanceMatch && upperMethod === 'GET') {
    return handleStaffClassAttendance(staffClassAttendanceMatch[1]);
  }

  if (cleanPath === '/staff/timetable' && upperMethod === 'GET') {
    return handleStaffTimetable(params);
  }

  if (cleanPath === '/staff/behaviour' && upperMethod === 'POST') {
    return handleStaffBehaviour(body);
  }

  // ----------------------------------------------------------------
  // REGISTER
  // ----------------------------------------------------------------
  if (cleanPath === '/register/teachers' && upperMethod === 'GET') {
    return handleRegisterTeachers();
  }

  if (cleanPath === '/register/timetable' && upperMethod === 'GET') {
    return handleRegisterTimetable(params);
  }

  // POST /register/:lessonId/:date/behaviour
  const registerBehaviourMatch = cleanPath.match(/^\/register\/([^/]+)\/([^/]+)\/behaviour$/);
  if (registerBehaviourMatch && upperMethod === 'POST') {
    return handleRegisterBehaviour(registerBehaviourMatch[1], registerBehaviourMatch[2], body);
  }

  // GET/POST /register/:lessonId/:date
  const registerMatch = cleanPath.match(/^\/register\/([^/]+)\/([^/]+)$/);
  if (registerMatch) {
    const [, lessonId, date] = registerMatch;
    if (upperMethod === 'GET') {
      return handleGetRegister(lessonId, date);
    }
    if (upperMethod === 'POST') {
      return handleSaveRegister(lessonId, date, body);
    }
  }

  // ----------------------------------------------------------------
  // ADMIN
  // ----------------------------------------------------------------
  if (cleanPath === '/admin/attendance-overview' && upperMethod === 'GET') {
    return handleAdminAttendanceOverview();
  }

  if (cleanPath === '/admin/behaviour-overview' && upperMethod === 'GET') {
    return handleAdminBehaviourOverview();
  }

  if (cleanPath === '/admin/announcements' && upperMethod === 'POST') {
    return handleAdminCreateAnnouncement(body);
  }

  const adminDeleteAnnouncementMatch = cleanPath.match(/^\/admin\/announcements\/([^/]+)$/);
  if (adminDeleteAnnouncementMatch && upperMethod === 'DELETE') {
    return handleAdminDeleteAnnouncement(adminDeleteAnnouncementMatch[1]);
  }

  // ----------------------------------------------------------------
  // ANNOUNCEMENTS
  // ----------------------------------------------------------------
  if (cleanPath === '/announcements' && upperMethod === 'GET') {
    return handleGetAnnouncements();
  }

  // ----------------------------------------------------------------
  // MESSAGES
  // ----------------------------------------------------------------
  if (cleanPath === '/messages/contacts' && upperMethod === 'GET') {
    return handleMessagesContacts();
  }

  if (cleanPath === '/messages' && upperMethod === 'GET') {
    return handleGetConversations();
  }

  if (cleanPath === '/messages' && upperMethod === 'POST') {
    return handleSendMessage(body);
  }

  const messageThreadMatch = cleanPath.match(/^\/messages\/([^/]+)$/);
  if (messageThreadMatch && upperMethod === 'GET') {
    return handleGetThread(messageThreadMatch[1]);
  }

  // ----------------------------------------------------------------
  // HOMEWORK
  // ----------------------------------------------------------------

  // GET /homework/student/:studentId (must come before /homework/:homeworkId patterns)
  const homeworkStudentMatch = cleanPath.match(/^\/homework\/student\/([^/]+)$/);
  if (homeworkStudentMatch && upperMethod === 'GET') {
    return handleHomeworkStudent(homeworkStudentMatch[1]);
  }

  // GET /homework/class/:classGroupId
  const homeworkClassMatch = cleanPath.match(/^\/homework\/class\/([^/]+)$/);
  if (homeworkClassMatch && upperMethod === 'GET') {
    return handleHomeworkClass(homeworkClassMatch[1]);
  }

  // POST /homework
  if (cleanPath === '/homework' && upperMethod === 'POST') {
    return handleCreateHomework(body);
  }

  // GET /homework/:homeworkId/completions
  const homeworkCompletionsMatch = cleanPath.match(/^\/homework\/([^/]+)\/completions$/);
  if (homeworkCompletionsMatch && upperMethod === 'GET') {
    return handleGetHomeworkCompletions(homeworkCompletionsMatch[1]);
  }

  // POST /homework/:homeworkId/completions
  if (homeworkCompletionsMatch && upperMethod === 'POST') {
    return handleToggleHomeworkCompletions(homeworkCompletionsMatch[1], body);
  }

  // DELETE /homework/:homeworkId
  const homeworkDeleteMatch = cleanPath.match(/^\/homework\/([^/]+)$/);
  if (homeworkDeleteMatch && upperMethod === 'DELETE') {
    return handleDeleteHomework(homeworkDeleteMatch[1]);
  }

  // ----------------------------------------------------------------
  // Fallback
  // ----------------------------------------------------------------
  return err(404, `Mock handler not found: ${upperMethod} ${path}`);
}

// ============================================================
// Route handler implementations
// ============================================================

// ---- AUTH ----

function handleAuthLogin(body: any): { status: number; data: any } {
  const { email, password } = body || {};

  if (!email || !password) {
    return err(400, 'Email and password are required');
  }

  const user = users.find((u) => u.email.toLowerCase() === email.toLowerCase());
  if (!user) {
    return err(401, 'Invalid email or password');
  }

  // Accept "password123" for all mock users
  if (password !== 'password123') {
    return err(401, 'Invalid email or password');
  }

  // Set module-level current user
  currentUser = {
    id: user.id,
    firstName: user.firstName,
    lastName: user.lastName,
    role: user.role,
    studentIds: user.studentIds,
  };

  return ok({
    token: 'mock-token',
    user: {
      id: user.id,
      firstName: user.firstName,
      lastName: user.lastName,
      role: user.role,
      studentIds: user.studentIds,
    },
  });
}

// ---- STUDENTS ----

function handleSearchStudents(params: URLSearchParams): { status: number; data: any } {
  if (currentUser!.role === 'parent' || currentUser!.role === 'student') {
    return err(403, 'Not authorized');
  }

  const q = params.get('q') || '';
  if (!q.trim()) {
    return ok([]);
  }

  const results = searchStudents(q);
  const enriched = results.map((s) => {
    const att = attendanceSummaries.find((a) => a.studentId === s.id);
    return {
      ...s,
      overallPercentage: att?.overallPercentage ?? null,
      presentToday: att?.presentToday ?? null,
    };
  });

  return ok(enriched);
}

function handleGetStudent(studentId: string): { status: number; data: any } {
  if (!parentOwnsStudent(studentId)) {
    return err(403, 'You do not have permission to view this student');
  }

  const student = getStudent(studentId);
  if (!student) {
    return err(404, 'Student not found');
  }

  return ok(student);
}

function handleStudentAttendance(studentId: string): { status: number; data: any } {
  if (!parentOwnsStudent(studentId)) {
    return err(403, 'You do not have permission to view this student');
  }

  const attendance = getAttendance(studentId);
  if (!attendance) {
    return err(404, 'Attendance data not found');
  }

  return ok(attendance);
}

function handleStudentBehaviour(studentId: string): { status: number; data: any } {
  if (!parentOwnsStudent(studentId)) {
    return err(403, 'You do not have permission to view this student');
  }

  const events = getBehaviour(studentId);
  return ok(events);
}

function handleStudentTimetable(studentId: string, params: URLSearchParams): { status: number; data: any } {
  if (!parentOwnsStudent(studentId)) {
    return err(403, 'You do not have permission to view this student');
  }

  const day = params.get('day');
  if (day) {
    const lessons = getTimetableForDay(studentId, day);
    return ok(lessons);
  }

  const lessons = getTimetable(studentId);
  return ok(lessons);
}

function handleStudentClasses(studentId: string): { status: number; data: any } {
  if (!parentOwnsStudent(studentId)) {
    return err(403, 'You do not have permission to view this student');
  }

  const groups = getClassGroupsByStudent(studentId);
  const enriched = groups.map((g) => {
    const teacher = users.find((u) => u.id === g.teacherId);
    return {
      ...g,
      teacherName: teacher ? `${teacher.firstName} ${teacher.lastName}` : 'Unknown',
    };
  });

  return ok(enriched);
}

function handleStudentContacts(studentId: string): { status: number; data: any } {
  if (currentUser!.role === 'parent' || currentUser!.role === 'student') {
    return err(403, 'Not authorized');
  }

  const contacts = users
    .filter((u) => u.role === 'parent' && u.studentIds.includes(studentId))
    .map((u) => ({
      id: u.id,
      firstName: u.firstName,
      lastName: u.lastName,
      email: u.email,
      relationship: 'Parent/Guardian',
    }));

  return ok(contacts);
}

// ---- STAFF ----

function handleStaffClasses(): { status: number; data: any } {
  if (currentUser!.role === 'parent' || currentUser!.role === 'student') {
    return err(403, 'Not authorized');
  }

  const classes = getClassGroupsByTeacher(currentUser!.id);
  return ok(classes);
}

function handleStaffClassStudents(classId: string): { status: number; data: any } {
  if (currentUser!.role === 'parent' || currentUser!.role === 'student') {
    return err(403, 'Not authorized');
  }

  const studentsList = getStudentsByClassGroup(classId);
  const enriched = studentsList.map((s) => {
    const parent = users.find(
      (u) => u.role === 'parent' && u.studentIds.includes(s.id)
    );
    const attendance = attendanceSummaries.find((a) => a.studentId === s.id);

    return {
      ...s,
      presentToday: attendance?.presentToday ?? null,
      overallAttendance: attendance?.overallPercentage ?? null,
      parentUserId: parent?.id ?? null,
      parentName: parent ? `${parent.firstName} ${parent.lastName}` : null,
    };
  });

  return ok(enriched);
}

function handleStaffClassAttendance(classId: string): { status: number; data: any } {
  if (currentUser!.role === 'parent' || currentUser!.role === 'student') {
    return err(403, 'Not authorized');
  }

  const overview = getClassAttendanceOverview(classId);
  if (!overview) {
    return err(404, 'Class group not found');
  }

  return ok(overview);
}

function handleStaffTimetable(params: URLSearchParams): { status: number; data: any } {
  if (currentUser!.role === 'parent' || currentUser!.role === 'student') {
    return err(403, 'Not authorized');
  }

  const day = params.get('day');
  if (day) {
    const lessons = getStaffLessonsForDay(currentUser!.id, day);
    return ok(lessons);
  }

  const lessons = getStaffLessons(currentUser!.id);
  return ok(lessons);
}

function handleStaffBehaviour(body: any): { status: number; data: any } {
  if (currentUser!.role === 'parent' || currentUser!.role === 'student') {
    return err(403, 'Not authorized');
  }

  const { studentId, type, category, points, note } = body || {};

  if (!studentId || !type || !category || points === undefined || !note) {
    return err(400, 'All fields are required: studentId, type, category, points, note');
  }

  if (type !== 'positive' && type !== 'negative') {
    return err(400, 'Type must be "positive" or "negative"');
  }

  const student = getStudent(studentId);
  if (!student) {
    return err(404, 'Student not found');
  }

  // Build staff display name from the current user
  const staffName = getTeacherDisplayName(currentUser!.id);

  const newEvent: BehaviourEvent = {
    id: `beh-${Date.now()}`,
    studentId,
    type,
    category,
    points: type === 'negative' ? -Math.abs(points) : Math.abs(points),
    note,
    staffName,
    timestamp: new Date().toISOString(),
  };

  behaviourEvents.push(newEvent);
  return created(newEvent);
}

// ---- REGISTER ----

function handleRegisterTeachers(): { status: number; data: any } {
  if (currentUser!.role === 'parent' || currentUser!.role === 'student') {
    return err(403, 'Not authorized');
  }

  const teachers = users
    .filter((u) => u.role === 'teacher' || u.role === 'admin')
    .map((u) => ({ id: u.id, firstName: u.firstName, lastName: u.lastName }));

  return ok(teachers);
}

function handleRegisterTimetable(params: URLSearchParams): { status: number; data: any } {
  if (currentUser!.role === 'parent' || currentUser!.role === 'student') {
    return err(403, 'Not authorized');
  }

  const teacherId = params.get('teacherId') || currentUser!.id;
  const week = params.get('week') || 'A';

  const lessons = staffLessons
    .filter((l) => l.teacherId === teacherId && l.week === week)
    .sort((a, b) => {
      const dayOrder = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];
      const dayDiff = dayOrder.indexOf(a.day) - dayOrder.indexOf(b.day);
      return dayDiff !== 0 ? dayDiff : a.period - b.period;
    });

  return ok(lessons);
}

function handleGetRegister(lessonId: string, date: string): { status: number; data: any } {
  if (currentUser!.role === 'parent' || currentUser!.role === 'student') {
    return err(403, 'Not authorized');
  }

  // Find the lesson definition
  const lesson = staffLessons.find((l) => l.id === lessonId);
  if (!lesson) {
    return err(404, 'Lesson not found');
  }

  // Find the class group
  const classGroup = classGroups.find((c) => c.id === lesson.classGroupId);
  if (!classGroup) {
    return err(404, 'Class group not found');
  }

  // Get or create register entries for this lesson instance
  const storeKey = `${lessonId}_${date}`;
  if (!registerStore.has(storeKey)) {
    const entries: RegisterEntry[] = classGroup.studentIds.map((sid) => ({
      studentId: sid,
      attendanceCode: '-',
      atlGrade: null,
    }));
    registerStore.set(storeKey, entries);
  }

  const entries = registerStore.get(storeKey)!;

  // Find all other lessons today for this class group (read-only context)
  const todayLessons = staffLessons.filter(
    (l) =>
      l.classGroupId === lesson.classGroupId &&
      l.week === lesson.week &&
      l.day === lesson.day &&
      l.id !== lessonId
  );

  // Build rows
  const rows = classGroup.studentIds.map((sid) => {
    const student = students.find((s) => s.id === sid);
    const entry = entries.find((e) => e.studentId === sid) || {
      studentId: sid,
      attendanceCode: '-',
      atlGrade: null,
    };

    // Collect codes from other periods today
    const otherPeriodCodes: Record<number, string> = {};
    const otherPeriodATL: Record<number, ATLGrade | null> = {};

    for (const otherLesson of todayLessons) {
      const otherKey = `${otherLesson.id}_${date}`;
      const otherEntries = registerStore.get(otherKey);
      if (otherEntries) {
        const otherEntry = otherEntries.find((e) => e.studentId === sid);
        if (otherEntry) {
          otherPeriodCodes[otherLesson.period] = otherEntry.attendanceCode;
          otherPeriodATL[otherLesson.period] = otherEntry.atlGrade;
        }
      }
    }

    // Count today's rewards and consequences from behaviour events
    const todayStart = new Date(date).toISOString().split('T')[0];
    const studentEvents = behaviourEvents.filter(
      (e) => e.studentId === sid && e.timestamp.startsWith(todayStart)
    );
    const rewardsToday = studentEvents
      .filter((e) => e.type === 'positive')
      .reduce((sum, e) => sum + e.points, 0);
    const consequencesToday = studentEvents
      .filter((e) => e.type === 'negative')
      .reduce((sum, e) => sum + Math.abs(e.points), 0);

    return {
      studentId: sid,
      firstName: student?.firstName ?? 'Unknown',
      lastName: student?.lastName ?? 'Unknown',
      formGroup: student?.formGroup ?? '',
      attendanceCode: entry.attendanceCode,
      atlGrade: entry.atlGrade,
      otherPeriodCodes,
      otherPeriodATL,
      rewardsToday,
      consequencesToday,
      note: entry.note,
    };
  });

  // Sort alphabetically by surname
  rows.sort((a, b) => a.lastName.localeCompare(b.lastName));

  const teacher = users.find((u) => u.id === lesson.teacherId);

  return ok({
    lessonId,
    date,
    classGroupId: lesson.classGroupId,
    classGroupName: lesson.classGroupName,
    subject: lesson.subject,
    room: lesson.room,
    period: lesson.period,
    teacherName: teacher ? `${teacher.firstName} ${teacher.lastName}` : 'Unknown',
    rows,
  });
}

function handleSaveRegister(lessonId: string, date: string, body: any): { status: number; data: any } {
  if (currentUser!.role === 'parent' || currentUser!.role === 'student') {
    return err(403, 'Not authorized');
  }

  const { entries } = body || {};
  if (!entries || !Array.isArray(entries)) {
    return err(400, 'entries array is required');
  }

  const lesson = staffLessons.find((l) => l.id === lessonId);
  if (!lesson) {
    return err(404, 'Lesson not found');
  }

  // Save entries
  const storeKey = `${lessonId}_${date}`;
  registerStore.set(storeKey, entries);

  // Find students who need post-ATL logging (ATL != 2 and not null)
  const needsLogging = entries
    .filter((e: RegisterEntry) => e.atlGrade !== null && e.atlGrade !== 2)
    .map((e: RegisterEntry) => {
      const student = students.find((s) => s.id === e.studentId);
      return {
        studentId: e.studentId,
        firstName: student?.firstName ?? 'Unknown',
        lastName: student?.lastName ?? 'Unknown',
        atlGrade: e.atlGrade,
      };
    });

  return ok({ saved: true, needsLogging });
}

function handleRegisterBehaviour(_lessonId: string, _date: string, body: any): { status: number; data: any } {
  if (currentUser!.role === 'parent' || currentUser!.role === 'student') {
    return err(403, 'Not authorized');
  }

  const { events } = body || {};
  if (!events || !Array.isArray(events)) {
    return err(400, 'events array is required');
  }

  const staffUser = users.find((u) => u.id === currentUser!.id);
  const staffName = staffUser ? `${staffUser.firstName} ${staffUser.lastName}` : 'Unknown';

  const createdEvents: BehaviourEvent[] = [];

  for (const event of events) {
    const isPositive = event.atlGrade === 1;
    const newEvent: BehaviourEvent = {
      id: `beh-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      studentId: event.studentId,
      type: isPositive ? 'positive' : 'negative',
      category: event.category,
      points: isPositive ? 1 : -(event.atlGrade - 2), // ATL3=-1, ATL4=-2, ATL5=-3
      note: event.note,
      staffName,
      timestamp: new Date().toISOString(),
    };
    behaviourEvents.push(newEvent);
    createdEvents.push(newEvent);
  }

  return created(createdEvents);
}

// ---- ADMIN ----

function handleAdminAttendanceOverview(): { status: number; data: any } {
  if (currentUser!.role !== 'admin') {
    return err(403, 'Not authorized');
  }

  const total = attendanceSummaries.length;
  const presentToday = attendanceSummaries.filter((a) => a.presentToday).length;
  const absentToday = total - presentToday;

  const avgAttendance = total > 0
    ? Math.round((attendanceSummaries.reduce((sum, a) => sum + a.overallPercentage, 0) / total) * 10) / 10
    : 0;

  // Students below 90% threshold
  const belowThreshold = attendanceSummaries
    .filter((a) => a.overallPercentage < 90)
    .map((a) => {
      const student = students.find((s) => s.id === a.studentId);
      return {
        studentId: a.studentId,
        studentName: student ? `${student.firstName} ${student.lastName}` : 'Unknown',
        yearGroup: student?.yearGroup ?? 0,
        formGroup: student?.formGroup ?? '',
        percentage: a.overallPercentage,
      };
    })
    .sort((a, b) => a.percentage - b.percentage);

  // Attendance by year group
  const yearGroups = [...new Set(students.map((s) => s.yearGroup))].sort();
  const byYearGroup = yearGroups.map((yg) => {
    const ygStudentIds = students.filter((s) => s.yearGroup === yg).map((s) => s.id);
    const ygSummaries = attendanceSummaries.filter((a) => ygStudentIds.includes(a.studentId));
    const ygPresent = ygSummaries.filter((a) => a.presentToday).length;
    const ygAvg = ygSummaries.length > 0
      ? Math.round((ygSummaries.reduce((sum, a) => sum + a.overallPercentage, 0) / ygSummaries.length) * 10) / 10
      : 0;

    return {
      yearGroup: yg,
      totalStudents: ygSummaries.length,
      presentToday: ygPresent,
      absentToday: ygSummaries.length - ygPresent,
      averageAttendance: ygAvg,
    };
  });

  return ok({
    totalStudents: total,
    presentToday,
    absentToday,
    averageAttendance: avgAttendance,
    belowThreshold,
    byYearGroup,
  });
}

function handleAdminBehaviourOverview(): { status: number; data: any } {
  if (currentUser!.role !== 'admin') {
    return err(403, 'Not authorized');
  }

  const totalPositive = behaviourEvents.filter((e) => e.type === 'positive').length;
  const totalNegative = behaviourEvents.filter((e) => e.type === 'negative').length;
  const totalPositivePoints = behaviourEvents
    .filter((e) => e.type === 'positive')
    .reduce((sum, e) => sum + e.points, 0);
  const totalNegativePoints = behaviourEvents
    .filter((e) => e.type === 'negative')
    .reduce((sum, e) => sum + Math.abs(e.points), 0);

  // Most common categories
  const categoryCounts = new Map<string, number>();
  for (const event of behaviourEvents) {
    categoryCounts.set(event.category, (categoryCounts.get(event.category) ?? 0) + 1);
  }
  const topCategories = Array.from(categoryCounts.entries())
    .map(([category, count]) => ({ category, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 5);

  // Recent events
  const recentEvents = [...behaviourEvents]
    .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
    .slice(0, 10)
    .map((e) => {
      const student = students.find((s) => s.id === e.studentId);
      return {
        ...e,
        studentName: student ? `${student.firstName} ${student.lastName}` : 'Unknown',
      };
    });

  return ok({
    totalPositive,
    totalNegative,
    totalPositivePoints,
    totalNegativePoints,
    topCategories,
    recentEvents,
  });
}

function handleAdminCreateAnnouncement(body: any): { status: number; data: any } {
  if (currentUser!.role !== 'admin') {
    return err(403, 'Not authorized');
  }

  const { title, body: announcementBody, pinned } = body || {};

  if (!title || !announcementBody) {
    return err(400, 'Title and body are required');
  }

  const newAnnouncement: Announcement = {
    id: `ann-${Date.now()}`,
    title,
    body: announcementBody,
    author: 'Mrs Carter',
    publishedAt: new Date().toISOString(),
    pinned: pinned ?? false,
  };

  announcements.push(newAnnouncement);
  return created(newAnnouncement);
}

function handleAdminDeleteAnnouncement(announcementId: string): { status: number; data: any } {
  if (currentUser!.role !== 'admin') {
    return err(403, 'Not authorized');
  }

  const index = announcements.findIndex((a) => a.id === announcementId);
  if (index === -1) {
    return err(404, 'Announcement not found');
  }

  announcements.splice(index, 1);
  return ok({ success: true });
}

// ---- ANNOUNCEMENTS ----

function handleGetAnnouncements(): { status: number; data: any } {
  const sorted = [...announcements].sort((a, b) => {
    // Pinned items first
    if (a.pinned && !b.pinned) return -1;
    if (!a.pinned && b.pinned) return 1;
    // Then by date, newest first
    return new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime();
  });

  return ok(sorted);
}

// ---- MESSAGES ----

function handleMessagesContacts(): { status: number; data: any } {
  const userId = currentUser!.id;

  const contacts = users
    .filter((u) => u.id !== userId)
    .map((u) => ({
      id: u.id,
      firstName: u.firstName,
      lastName: u.lastName,
      role: u.role,
    }));

  return ok(contacts);
}

function handleGetConversations(): { status: number; data: any } {
  const userId = currentUser!.id;

  const userMessages = messages
    .filter((m) => m.fromUserId === userId || m.toUserId === userId)
    .sort((a, b) => new Date(b.sentAt).getTime() - new Date(a.sentAt).getTime());

  // Group into conversations by the other user
  const conversationMap = new Map<string, typeof userMessages>();
  for (const msg of userMessages) {
    const otherId = msg.fromUserId === userId ? msg.toUserId : msg.fromUserId;
    if (!conversationMap.has(otherId)) {
      conversationMap.set(otherId, []);
    }
    conversationMap.get(otherId)!.push(msg);
  }

  // Build conversation summaries
  const conversations = Array.from(conversationMap.entries()).map(([otherId, msgs]) => {
    const other = users.find((u) => u.id === otherId);
    const latest = msgs[0]; // already sorted newest first
    const unreadCount = msgs.filter(
      (m) => m.toUserId === userId && !m.readAt
    ).length;

    return {
      contactId: otherId,
      contactName: other ? `${other.firstName} ${other.lastName}` : 'Unknown',
      contactRole: other?.role ?? 'unknown',
      lastMessage: latest.body,
      lastMessageAt: latest.sentAt,
      lastMessageFromMe: latest.fromUserId === userId,
      unreadCount,
    };
  });

  // Sort by latest message
  conversations.sort(
    (a, b) => new Date(b.lastMessageAt).getTime() - new Date(a.lastMessageAt).getTime()
  );

  return ok(conversations);
}

function handleGetThread(contactId: string): { status: number; data: any } {
  const userId = currentUser!.id;

  const thread = messages
    .filter(
      (m) =>
        (m.fromUserId === userId && m.toUserId === contactId) ||
        (m.fromUserId === contactId && m.toUserId === userId)
    )
    .sort((a, b) => new Date(a.sentAt).getTime() - new Date(b.sentAt).getTime());

  // Mark incoming messages as read
  for (const msg of thread) {
    if (msg.toUserId === userId && !msg.readAt) {
      msg.readAt = new Date().toISOString();
    }
  }

  // Enrich with names
  const enriched = thread.map((m) => {
    const from = users.find((u) => u.id === m.fromUserId);
    const to = users.find((u) => u.id === m.toUserId);
    return {
      ...m,
      fromName: from ? `${from.firstName} ${from.lastName}` : 'Unknown',
      toName: to ? `${to.firstName} ${to.lastName}` : 'Unknown',
    };
  });

  return ok(enriched);
}

function handleSendMessage(body: any): { status: number; data: any } {
  const { toUserId, body: messageBody } = body || {};

  if (!toUserId || !messageBody || !messageBody.trim()) {
    return err(400, 'Recipient and message body are required');
  }

  const recipient = users.find((u) => u.id === toUserId);
  if (!recipient) {
    return err(404, 'Recipient not found');
  }

  const newMessage: Message = {
    id: `msg-${Date.now()}`,
    fromUserId: currentUser!.id,
    toUserId,
    body: messageBody.trim(),
    sentAt: new Date().toISOString(),
  };

  messages.push(newMessage);

  const from = users.find((u) => u.id === currentUser!.id);
  return created({
    ...newMessage,
    fromName: from ? `${from.firstName} ${from.lastName}` : 'Unknown',
    toName: `${recipient.firstName} ${recipient.lastName}`,
  });
}

// ---- HOMEWORK ----

interface HomeworkType {
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

function handleHomeworkClass(classGroupId: string): { status: number; data: any } {
  if (currentUser!.role === 'parent' || currentUser!.role === 'student') {
    return err(403, 'Not authorized');
  }

  const list = homeworks.filter((h) => h.classGroupId === classGroupId);
  const enriched = list.map((h) => {
    const group = classGroups.find((c) => c.id === h.classGroupId);
    const totalStudents = group?.studentIds.length ?? 0;
    const completedCount = homeworkCompletions.filter((c) => c.homeworkId === h.id).length;
    return { ...h, totalStudents, completedCount };
  });

  return ok(enriched);
}

function handleCreateHomework(body: any): { status: number; data: any } {
  if (currentUser!.role === 'parent' || currentUser!.role === 'student') {
    return err(403, 'Not authorized');
  }

  const { classGroupId, title, description, dueDate, links } = body || {};

  if (!classGroupId || !title || !description || !dueDate) {
    return err(400, 'classGroupId, title, description, and dueDate are required');
  }

  const group = classGroups.find((c) => c.id === classGroupId);
  if (!group) {
    return err(404, 'Class group not found');
  }

  const teacher = users.find((u) => u.id === currentUser!.id);
  const teacherName = teacher ? `${teacher.firstName} ${teacher.lastName}` : 'Unknown';

  const newHomework: HomeworkType = {
    id: `hw-${Date.now()}`,
    classGroupId,
    title,
    description,
    dueDate,
    issuedDate: new Date().toISOString().split('T')[0],
    teacherId: currentUser!.id,
    teacherName,
    links: links?.length ? links : undefined,
  };

  homeworks.push(newHomework as any);
  return created(newHomework);
}

function handleDeleteHomework(homeworkId: string): { status: number; data: any } {
  if (currentUser!.role === 'parent' || currentUser!.role === 'student') {
    return err(403, 'Not authorized');
  }

  const index = homeworks.findIndex((h) => h.id === homeworkId);
  if (index === -1) {
    return err(404, 'Homework not found');
  }

  homeworks.splice(index, 1);

  for (let i = homeworkCompletions.length - 1; i >= 0; i--) {
    if (homeworkCompletions[i].homeworkId === homeworkId) {
      homeworkCompletions.splice(i, 1);
    }
  }

  return ok({ success: true });
}

function handleGetHomeworkCompletions(homeworkId: string): { status: number; data: any } {
  if (currentUser!.role === 'parent' || currentUser!.role === 'student') {
    return err(403, 'Not authorized');
  }

  const homework = homeworks.find((h) => h.id === homeworkId);
  if (!homework) {
    return err(404, 'Homework not found');
  }

  const group = classGroups.find((c) => c.id === homework.classGroupId);
  if (!group) {
    return err(404, 'Class group not found');
  }

  const completions = homeworkCompletions.filter((c) => c.homeworkId === homeworkId);

  const studentList = group.studentIds.map((sid) => {
    const student = students.find((s) => s.id === sid);
    const completion = completions.find((c) => c.studentId === sid);
    return {
      studentId: sid,
      firstName: student?.firstName ?? 'Unknown',
      lastName: student?.lastName ?? 'Unknown',
      completed: !!completion,
      completedAt: completion?.completedAt ?? null,
    };
  });

  studentList.sort((a, b) => a.lastName.localeCompare(b.lastName));

  return ok(studentList);
}

function handleToggleHomeworkCompletions(homeworkId: string, body: any): { status: number; data: any } {
  if (currentUser!.role === 'parent' || currentUser!.role === 'student') {
    return err(403, 'Not authorized');
  }

  const { studentIds: sids } = body || {};
  if (!sids || !Array.isArray(sids)) {
    return err(400, 'studentIds array is required');
  }

  const homework = homeworks.find((h) => h.id === homeworkId);
  if (!homework) {
    return err(404, 'Homework not found');
  }

  for (const sid of sids) {
    const existingIndex = homeworkCompletions.findIndex(
      (c) => c.homeworkId === homeworkId && c.studentId === sid
    );

    if (existingIndex >= 0) {
      homeworkCompletions.splice(existingIndex, 1);
    } else {
      homeworkCompletions.push({
        homeworkId,
        studentId: sid,
        completedAt: new Date().toISOString(),
        markedBy: currentUser!.id,
      });
    }
  }

  return ok({ success: true });
}

function handleHomeworkStudent(studentId: string): { status: number; data: any } {
  // Access control: students/parents can only see their own data
  if (currentUser!.role === 'parent' || currentUser!.role === 'student') {
    if (!currentUser!.studentIds.includes(studentId)) {
      return err(403, 'You do not have permission to view this student');
    }
  }

  const studentGroups = classGroups.filter((c) => c.studentIds.includes(studentId));
  const groupIds = new Set(studentGroups.map((g) => g.id));

  const studentHomework = homeworks.filter((h) => groupIds.has(h.classGroupId));

  const enriched = studentHomework.map((h) => {
    const group = classGroups.find((c) => c.id === h.classGroupId);
    const completion = homeworkCompletions.find(
      (c) => c.homeworkId === h.id && c.studentId === studentId
    );
    return {
      ...h,
      subject: group?.subject ?? 'Unknown',
      className: group?.name ?? 'Unknown',
      completed: !!completion,
      completedAt: completion?.completedAt,
    };
  });

  enriched.sort((a, b) => {
    if (a.completed !== b.completed) return a.completed ? 1 : -1;
    return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
  });

  return ok(enriched);
}
