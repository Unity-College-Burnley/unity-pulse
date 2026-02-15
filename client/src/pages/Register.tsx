// ============================================================
// Register page — attendance + ATL for a single lesson instance
// ============================================================

import { useEffect, useState, useCallback, useMemo, useRef } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import { api } from '../services/api';
import {
  ArrowLeft, Check, CheckCheck, Save, X,
  MapPin, Clock, Users, Award, AlertTriangle,
  ChevronDown, ChevronUp, ClipboardList, Clock3, HelpCircle,
} from 'lucide-react';
import type { ATLGrade, RegisterData, RegisterEntry, RegisterRow } from '../types';
import { useNavigationGuard } from '../context/NavigationGuardContext';
import SeatingPlan from '../components/SeatingPlan';
import HomeworkTab from '../components/HomeworkTab';
import PhotoGrid from '../components/PhotoGrid';
import SpreadsheetTab from '../components/SpreadsheetTab';
import CommsTab from '../components/CommsTab';
import ClassAttendanceTab from '../components/ClassAttendanceTab';
import MyPlansTab from '../components/MyPlansTab';

const PERIODS = [1, 2, 3, 4, 5] as const;

const PERIOD_TIMES: Record<number, string> = {
  1: '08:50–09:50',
  2: '09:50–10:50',
  3: '11:10–12:10',
  4: '12:10–13:10',
  5: '13:50–14:50',
};

// Present code based on period: P1–P3 = AM, P4–P5 = PM
function presentCodeForPeriod(period: number): { code: string; label: string } {
  return period <= 3
    ? { code: '/', label: 'Present (AM)' }
    : { code: '\\', label: 'Present (PM)' };
}

// Codes a class teacher would typically use (present code is added dynamically)
const OTHER_CODES = [
  { code: '-', label: 'No mark' },
  { code: 'N', label: 'No reason yet' },
  { code: 'L', label: 'Late (before close)' },
];

const ATL_LABELS: Record<ATLGrade, { label: string; short: string; colour: string; bg: string }> = {
  1: { label: 'Outstanding', short: '1', colour: 'text-emerald-700', bg: 'bg-emerald-100 border-emerald-300 hover:bg-emerald-200' },
  2: { label: 'Expected', short: '2', colour: 'text-blue-700', bg: 'bg-blue-100 border-blue-300 hover:bg-blue-200' },
  3: { label: 'Inconsistent', short: '3', colour: 'text-amber-700', bg: 'bg-amber-100 border-amber-300 hover:bg-amber-200' },
  4: { label: 'Sanctioned', short: '4', colour: 'text-orange-700', bg: 'bg-orange-100 border-orange-300 hover:bg-orange-200' },
  5: { label: 'Removed', short: '5', colour: 'text-red-700', bg: 'bg-red-100 border-red-300 hover:bg-red-200' },
};

// Reason dropdowns for post-ATL logging
const REWARD_REASONS = [
  'Outstanding classwork',
  'Excellent homework',
  'Helping others',
  'Active participation',
  'Positive attitude',
  'Leadership',
  'Improvement',
];

const CONSEQUENCE_REASONS: Record<3 | 4 | 5, string[]> = {
  3: [
    'Off-task behaviour',
    'Talking over teacher',
    'Not completing work',
    'Distracting others',
    'Lack of equipment',
    'Low-level disruption',
  ],
  4: [
    'Persistent disruption',
    'Refusal to follow instructions',
    'Inappropriate language',
    'Disrespectful behaviour',
    'Phone confiscation',
  ],
  5: [
    'Removed to reflection room',
    'Removed by on-call',
    'Serious incident',
    'Health and safety concern',
  ],
};

// Register tabs (shells for now)
const REGISTER_TABS = [
  'Register',
  'Homework',
  'Photos',
  'Seating Plan',
  'Files',
  'Spreadsheet',
  'Comms',
  'Attendance',
  'MyPlans',
] as const;

interface LocalRow extends RegisterRow {
  // Local editable copies
  localCode: string;
  localATL: ATLGrade | null;
  localNote: string;
}

type ActionItemType = 'late_no_minutes' | 'no_reason_yet';

interface ActionItem {
  type: ActionItemType;
  studentId: string;
  firstName: string;
  lastName: string;
}

interface PostATLStudent {
  studentId: string;
  firstName: string;
  lastName: string;
  atlGrade: ATLGrade;
  category: string;
  note: string;
}

function ActionItemCard({
  item,
  onLateMinutesSave,
  onNAction,
}: {
  item: ActionItem;
  onLateMinutesSave: (studentId: string, minutes: number) => void;
  onNAction: (studentId: string, action: 'arrived_late' | 'mark_present' | 'confirm_absent') => void;
}) {
  const [minutes, setMinutes] = useState('');

  if (item.type === 'late_no_minutes') {
    return (
      <div className="rounded-lg border border-amber-200 bg-amber-50/50 p-3">
        <div className="flex items-center gap-2 mb-2">
          <Clock3 size={14} className="text-amber-600" />
          <span className="text-xs font-semibold text-amber-700">Late — no minutes</span>
        </div>
        <p className="text-sm font-medium text-gray-900 mb-2">
          {item.firstName} {item.lastName}
        </p>
        <div className="flex items-center gap-2">
          <input
            type="number"
            min={1}
            max={60}
            value={minutes}
            onChange={(e) => setMinutes(e.target.value)}
            placeholder="Min"
            className="w-16 rounded-md border border-gray-300 px-2 py-1.5 text-sm text-center
                       focus:outline-none focus:ring-2 focus:ring-amber-400 focus:border-transparent"
          />
          <span className="text-xs text-gray-500">min</span>
          <button
            onClick={() => {
              const m = parseInt(minutes, 10);
              if (m > 0) onLateMinutesSave(item.studentId, m);
            }}
            disabled={!minutes || parseInt(minutes, 10) <= 0}
            className="ml-auto px-3 py-1.5 text-xs font-medium rounded-md
                       bg-amber-500 hover:bg-amber-600 text-white transition-colors disabled:opacity-40"
          >
            Save
          </button>
        </div>
      </div>
    );
  }

  // no_reason_yet
  return (
    <div className="rounded-lg border border-blue-200 bg-blue-50/50 p-3">
      <div className="flex items-center gap-2 mb-2">
        <HelpCircle size={14} className="text-blue-600" />
        <span className="text-xs font-semibold text-blue-700">N — confirm attendance</span>
      </div>
      <p className="text-sm font-medium text-gray-900 mb-2">
        {item.firstName} {item.lastName}
      </p>
      <div className="flex flex-wrap gap-1.5">
        <button
          onClick={() => onNAction(item.studentId, 'arrived_late')}
          className="px-2.5 py-1.5 text-xs font-medium rounded-md border border-amber-300
                     bg-amber-50 text-amber-700 hover:bg-amber-100 transition-colors"
        >
          Arrived Late
        </button>
        <button
          onClick={() => onNAction(item.studentId, 'mark_present')}
          className="px-2.5 py-1.5 text-xs font-medium rounded-md border border-emerald-300
                     bg-emerald-50 text-emerald-700 hover:bg-emerald-100 transition-colors"
        >
          Mark Present
        </button>
        <button
          onClick={() => onNAction(item.studentId, 'confirm_absent')}
          className="px-2.5 py-1.5 text-xs font-medium rounded-md border border-gray-300
                     bg-gray-50 text-gray-600 hover:bg-gray-100 transition-colors"
        >
          Confirm Absent
        </button>
      </div>
    </div>
  );
}

export default function Register() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { setGuard } = useNavigationGuard();

  const lessonId = searchParams.get('lesson') || '';
  const date = searchParams.get('date') || '';

  const [registerData, setRegisterData] = useState<RegisterData | null>(null);
  const [rows, setRows] = useState<LocalRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [isDirty, setIsDirty] = useState(false);
  const [activeTab, setActiveTab] = useState<(typeof REGISTER_TABS)[number]>('Register');
  const [showMoreTabs, setShowMoreTabs] = useState(false);
  const moreTabsRef = useRef<HTMLDivElement>(null);
  const [expandedCodeRow, setExpandedCodeRow] = useState<string | null>(null);
  const [dropdownPos, setDropdownPos] = useState<{ top: number; left: number } | null>(null);

  // Action-items sidebar state
  const [showSidebar, setShowSidebar] = useState(false);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [dismissedNIds, setDismissedNIds] = useState<Set<string>>(new Set());

  // Post-ATL prompt state
  const [showPostATL, setShowPostATL] = useState(false);
  const [postATLStudents, setPostATLStudents] = useState<PostATLStudent[]>([]);
  const [submittingBehaviour, setSubmittingBehaviour] = useState(false);

  // Deferred N-code confirmation: delay action items by 20 minutes
  // If returning from a dashboard alert, the delay has already elapsed — skip it
  const registerOpenedAt = useRef<number>(Date.now());
  const [nDelayPassed, setNDelayPassed] = useState(() => {
    try {
      const stored = JSON.parse(localStorage.getItem('unity-pulse-pending-n') || '[]');
      return stored.some((p: any) => p.lessonId === lessonId && p.date === date && Date.now() >= p.showAfter);
    } catch {
      return false;
    }
  });

  // Close "More" dropdown on outside click
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (moreTabsRef.current && !moreTabsRef.current.contains(e.target as Node)) {
        setShowMoreTabs(false);
      }
    }
    if (showMoreTabs) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [showMoreTabs]);

  // Fetch register data
  useEffect(() => {
    if (!lessonId || !date) return;

    async function fetchRegister() {
      setLoading(true);
      try {
        const res = await api.get<{ data: RegisterData }>(`/register/${lessonId}/${date}`);
        setRegisterData(res.data);
        setRows(
          res.data.rows.map((r) => ({
            ...r,
            localCode: r.attendanceCode,
            localATL: r.atlGrade,
            localNote: r.note || '',
          }))
        );

        // Clear any pending dashboard alert for this lesson — teacher is back
        const key = 'unity-pulse-pending-n';
        const stored = JSON.parse(localStorage.getItem(key) || '[]');
        const cleaned = stored.filter((p: any) => !(p.lessonId === lessonId && p.date === date));
        if (cleaned.length !== stored.length) localStorage.setItem(key, JSON.stringify(cleaned));
      } catch {
        setRegisterData(null);
        setRows([]);
      } finally {
        setLoading(false);
      }
    }
    fetchRegister();
  }, [lessonId, date]);

  // 20-minute delay before N-code action items appear in sidebar
  useEffect(() => {
    const timer = setTimeout(() => setNDelayPassed(true), 20 * 60 * 1000);
    return () => clearTimeout(timer);
  }, []);

  function toggleCodeDropdown(studentId: string, triggerEl: HTMLButtonElement) {
    if (expandedCodeRow === studentId) {
      setExpandedCodeRow(null);
      setDropdownPos(null);
      return;
    }
    const rect = triggerEl.getBoundingClientRect();
    const spaceBelow = window.innerHeight - rect.bottom;
    const dropdownHeight = teacherCodes.length * 28 + 8; // approx
    setDropdownPos({
      top: spaceBelow < dropdownHeight ? rect.top - dropdownHeight : rect.bottom + 4,
      left: rect.left + rect.width / 2,
    });
    setExpandedCodeRow(studentId);
  }

  const updateRow = useCallback((studentId: string, field: 'localCode' | 'localATL' | 'localNote', value: string | ATLGrade | null) => {
    setRows((prev) =>
      prev.map((r) => (r.studentId === studentId ? { ...r, [field]: value } : r))
    );
    setSaved(false);
    setIsDirty(true);
  }, []);

  function markAllPresent() {
    if (!registerData) return;
    const code = presentCodeForPeriod(registerData.period).code;
    setRows((prev) => prev.map((r) => ({ ...r, localCode: code })));
    setSaved(false);
    setIsDirty(true);
  }

  function setAllATL(grade: ATLGrade) {
    setRows((prev) => prev.map((r) => ({ ...r, localATL: grade })));
    setSaved(false);
    setIsDirty(true);
  }

  // Always track unresolved N students (independent of 20-min delay)
  const unresolvedNStudents = useMemo(() =>
    rows.filter(r => r.localCode === 'N' && !dismissedNIds.has(r.studentId))
        .map(r => ({ studentId: r.studentId, firstName: r.firstName, lastName: r.lastName })),
    [rows, dismissedNIds]
  );

  // Compute action items from rows (N items gated behind 20-min delay)
  const actionItems = useMemo<ActionItem[]>(() => {
    const items: ActionItem[] = [];
    for (const row of rows) {
      if (row.localCode === 'L' && !row.localNote.trim()) {
        items.push({
          type: 'late_no_minutes',
          studentId: row.studentId,
          firstName: row.firstName,
          lastName: row.lastName,
        });
      }
      if (nDelayPassed && row.localCode === 'N' && !dismissedNIds.has(row.studentId)) {
        items.push({
          type: 'no_reason_yet',
          studentId: row.studentId,
          firstName: row.firstName,
          lastName: row.lastName,
        });
      }
    }
    return items;
  }, [rows, dismissedNIds, nDelayPassed]);

  // Keep latest state available in cleanup refs
  const unresolvedNRef = useRef(unresolvedNStudents);
  useEffect(() => { unresolvedNRef.current = unresolvedNStudents; }, [unresolvedNStudents]);

  const registerDataRef = useRef(registerData);
  useEffect(() => { registerDataRef.current = registerData; }, [registerData]);

  // Persist unresolved N codes to localStorage on unmount
  useEffect(() => {
    return () => {
      const nStudents = unresolvedNRef.current;
      const regData = registerDataRef.current;
      const key = 'unity-pulse-pending-n';
      const stored = JSON.parse(localStorage.getItem(key) || '[]');
      // Remove any existing entry for this lesson+date
      const filtered = stored.filter((p: any) => !(p.lessonId === lessonId && p.date === date));
      if (nStudents.length > 0 && regData) {
        filtered.push({
          lessonId, date,
          subject: regData.subject,
          classGroupName: regData.classGroupName,
          period: regData.period,
          showAfter: registerOpenedAt.current + 20 * 60 * 1000,
          students: nStudents,
        });
      }
      localStorage.setItem(key, JSON.stringify(filtered));
    };
  }, [lessonId, date]);

  // Auto-open sidebar when action items first appear
  useEffect(() => {
    if (actionItems.length > 0 && !showSidebar) {
      setShowSidebar(true);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [actionItems.length]);

  function handleLateMinutesSave(studentId: string, minutes: number) {
    updateRow(studentId, 'localNote', `${minutes} minutes late`);
  }

  function handleNAction(studentId: string, action: 'arrived_late' | 'mark_present' | 'confirm_absent') {
    if (action === 'arrived_late') {
      updateRow(studentId, 'localCode', 'L');
    } else if (action === 'mark_present') {
      const code = registerData ? presentCodeForPeriod(registerData.period).code : '/';
      updateRow(studentId, 'localCode', code);
      setDismissedNIds((prev) => { const next = new Set(prev); next.delete(studentId); return next; });
    } else {
      // confirm_absent — dismiss the N item
      setDismissedNIds((prev) => new Set(prev).add(studentId));
    }
  }

  function attemptSave() {
    if (actionItems.length > 0) {
      setShowConfirmDialog(true);
      return;
    }
    handleSave();
  }

  async function handleSave() {
    if (!registerData) return;
    setShowConfirmDialog(false);
    setSaving(true);

    const entries: RegisterEntry[] = rows.map((r) => ({
      studentId: r.studentId,
      attendanceCode: r.localCode,
      atlGrade: r.localATL,
      note: r.localNote || undefined,
    }));

    try {
      const res = await api.post<{
        data: {
          saved: boolean;
          needsLogging: Array<{
            studentId: string;
            firstName: string;
            lastName: string;
            atlGrade: ATLGrade;
          }>;
        };
      }>(`/register/${lessonId}/${date}`, { entries });

      setSaved(true);
      setIsDirty(false);

      // If any students need post-ATL logging, show the prompt
      if (res.data.needsLogging.length > 0) {
        setPostATLStudents(
          res.data.needsLogging.map((s) => ({
            ...s,
            category: s.atlGrade === 1
              ? REWARD_REASONS[0]
              : (CONSEQUENCE_REASONS[s.atlGrade as 3 | 4 | 5]?.[0] ?? ''),
            note: '',
          }))
        );
        setShowPostATL(true);
      }
    } catch {
      // handle silently
    } finally {
      setSaving(false);
    }
  }

  async function handleSubmitBehaviour() {
    setSubmittingBehaviour(true);
    try {
      await api.post(`/register/${lessonId}/${date}/behaviour`, {
        events: postATLStudents.map((s) => ({
          studentId: s.studentId,
          atlGrade: s.atlGrade,
          category: s.category,
          note: s.note,
        })),
      });
      setShowPostATL(false);
      setPostATLStudents([]);
    } catch {
      // handle silently
    } finally {
      setSubmittingBehaviour(false);
    }
  }

  function updatePostATLStudent(studentId: string, field: 'category' | 'note', value: string) {
    setPostATLStudents((prev) =>
      prev.map((s) => (s.studentId === studentId ? { ...s, [field]: value } : s))
    );
  }

  const present = registerData ? presentCodeForPeriod(registerData.period) : { code: '/', label: 'Present (AM)' };
  const teacherCodes = [{ code: '-', label: 'No mark' }, present, ...OTHER_CODES.filter((c) => c.code !== '-')];

  // Keyboard-driven attendance: refs for each row's attendance cell
  const attendanceRefs = useRef<(HTMLButtonElement | null)[]>([]);

  const handleAttendanceKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLButtonElement>, studentId: string, rowIndex: number) => {
      const keyMap: Record<string, string> = {
        '/': '/',
        '\\': '\\',
        n: 'N',
        N: 'N',
        l: 'L',
        L: 'L',
        '-': '-',
      };

      const code = keyMap[e.key];
      if (code) {
        e.preventDefault();
        updateRow(studentId, 'localCode', code);
        // Close any open dropdown so it doesn't cover the next row
        setExpandedCodeRow(null);
        setDropdownPos(null);
        // Auto-advance to next student's attendance cell
        if (rowIndex + 1 < rows.length) {
          attendanceRefs.current[rowIndex + 1]?.focus();
        }
        return;
      }

      // Arrow key navigation
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        if (rowIndex + 1 < rows.length) {
          attendanceRefs.current[rowIndex + 1]?.focus();
        }
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        if (rowIndex > 0) {
          attendanceRefs.current[rowIndex - 1]?.focus();
        }
      }
    },
    [updateRow, rows.length]
  );

  const presentCount = rows.filter((r) => r.localCode === '/' || r.localCode === '\\').length;
  const absentCount = rows.filter(
    (r) => r.localCode !== '/' && r.localCode !== '\\' && r.localCode !== '-'
  ).length;
  const unmarkedCount = rows.filter((r) => r.localCode === '-').length;
  const atlComplete = rows.every((r) => r.localATL !== null);

  // Register navigation guard when ATLs are incomplete or N codes unresolved
  const leaveWarnings = useMemo(() => {
    const warnings: string[] = [];
    if (isDirty) warnings.push('You have unsaved changes to the register.');
    if (rows.length > 0 && !atlComplete) warnings.push('Not all students have an ATL grade.');
    if (nDelayPassed && unresolvedNStudents.length > 0)
      warnings.push(`${unresolvedNStudents.length} student${unresolvedNStudents.length !== 1 ? 's' : ''} still marked N (attendance unconfirmed).`);
    return warnings;
  }, [isDirty, rows.length, atlComplete, nDelayPassed, unresolvedNStudents.length]);

  const shouldWarnOnLeave = leaveWarnings.length > 0;

  useEffect(() => {
    if (shouldWarnOnLeave) {
      setGuard(() => leaveWarnings.join(' ') + ' Are you sure you want to leave?');
    } else {
      setGuard(null);
    }
    return () => setGuard(null);
  }, [shouldWarnOnLeave, setGuard, leaveWarnings]);

  // Browser tab close / refresh warning
  useEffect(() => {
    if (!shouldWarnOnLeave) return;
    const handler = (e: BeforeUnloadEvent) => {
      e.preventDefault();
    };
    window.addEventListener('beforeunload', handler);
    return () => window.removeEventListener('beforeunload', handler);
  }, [shouldWarnOnLeave]);

  const [showLeaveWarning, setShowLeaveWarning] = useState(false);

  function handleBack() {
    if (shouldWarnOnLeave) {
      setShowLeaveWarning(true);
    } else {
      navigate('/dashboard');
    }
  }

  const formattedDate = date
    ? new Date(date).toLocaleDateString('en-GB', {
        weekday: 'long',
        day: 'numeric',
        month: 'long',
        year: 'numeric',
      })
    : '';

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="animate-spin rounded-full h-8 w-8 border-2 border-brand-500 border-t-transparent" />
      </div>
    );
  }

  if (!registerData) {
    return (
      <div className="text-center py-20">
        <p className="text-gray-500">Register not found.</p>
        <button onClick={() => navigate('/dashboard')} className="mt-3 text-brand-600 hover:underline text-sm">
          Back to timetable
        </button>
      </div>
    );
  }

  return (
    <div>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3 mb-4">
        <div className="flex items-start gap-3">
          <button
            onClick={handleBack}
            className="mt-0.5 p-1.5 rounded-lg hover:bg-gray-100 text-gray-500 transition-colors flex-shrink-0"
            aria-label="Back to timetable"
          >
            <ArrowLeft size={18} />
          </button>
          <div>
            <h1 className="text-xl font-bold text-gray-900">
              {registerData.subject}
              <span className="font-normal text-gray-500 ml-2">
                {registerData.classGroupName}
              </span>
            </h1>
            <div className="flex flex-wrap items-center gap-3 mt-1 text-sm text-gray-500">
              <span className="flex items-center gap-1">
                <Clock size={14} />
                P{registerData.period} ({PERIOD_TIMES[registerData.period]})
              </span>
              <span className="flex items-center gap-1">
                <MapPin size={14} />
                {registerData.room}
              </span>
              <span className="flex items-center gap-1">
                <Users size={14} />
                {rows.length} students
              </span>
            </div>
            <p className="text-xs text-gray-400 mt-0.5">
              {formattedDate} &middot; {registerData.teacherName}
            </p>
          </div>
        </div>

        {/* Attendance summary + save */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 text-xs">
            <span className="px-2 py-1 rounded-full bg-emerald-100 text-emerald-700 font-medium">
              {presentCount} present
            </span>
            {absentCount > 0 && (
              <span className="px-2 py-1 rounded-full bg-red-100 text-red-700 font-medium">
                {absentCount} absent
              </span>
            )}
            {unmarkedCount > 0 && (
              <span className="px-2 py-1 rounded-full bg-gray-100 text-gray-500 font-medium">
                {unmarkedCount} unmarked
              </span>
            )}
          </div>
          <button
            onClick={attemptSave}
            disabled={saving}
            className={`relative flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
              saved
                ? 'bg-emerald-500 text-white'
                : 'bg-brand-600 hover:bg-brand-700 text-white'
            } disabled:opacity-50`}
          >
            {saving ? (
              <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent" />
            ) : saved ? (
              <CheckCheck size={16} />
            ) : (
              <Save size={16} />
            )}
            {saved ? 'Saved' : 'Save Register'}
            {actionItems.length > 0 && !saved && (
              <span className="absolute -top-1.5 -right-1.5 flex items-center justify-center w-5 h-5 rounded-full bg-amber-500 text-white text-[10px] font-bold">
                {actionItems.length}
              </span>
            )}
          </button>
        </div>
      </div>

      {/* Tabs — primary tabs shown inline, overflow in "More" dropdown */}
      {(() => {
        const PRIMARY_TABS = REGISTER_TABS.slice(0, 5);   // Register, Homework, Photos, Seating Plan, Files
        const MORE_TABS = REGISTER_TABS.slice(5);          // Spreadsheet, Comms, Pastoral, Attendance, Assessment, MyPlans
        const activeInMore = MORE_TABS.includes(activeTab as any);

        return (
          <div className="flex items-end mb-4 border-b border-gray-200">
            {PRIMARY_TABS.map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`flex-1 px-1 py-2 text-sm font-medium rounded-t-lg whitespace-nowrap text-center transition-colors ${
                  activeTab === tab
                    ? 'text-brand-600 border-b-2 border-brand-500 bg-brand-50/50'
                    : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
                }`}
              >
                {tab}
              </button>
            ))}

            {/* "More" dropdown */}
            <div className="relative flex-1" ref={moreTabsRef}>
              <button
                onClick={() => setShowMoreTabs(!showMoreTabs)}
                className={`w-full flex items-center justify-center gap-1 px-1 py-2 text-sm font-medium rounded-t-lg whitespace-nowrap transition-colors ${
                  activeInMore
                    ? 'text-brand-600 border-b-2 border-brand-500 bg-brand-50/50'
                    : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
                }`}
              >
                {activeInMore ? activeTab : 'More'}
                {showMoreTabs ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
              </button>

              {showMoreTabs && (
                <div className="absolute top-full left-0 mt-1 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-30 min-w-[160px]">
                  {MORE_TABS.map((tab) => (
                    <button
                      key={tab}
                      onClick={() => { setActiveTab(tab); setShowMoreTabs(false); }}
                      className={`block w-full text-left px-4 py-2 text-sm transition-colors ${
                        activeTab === tab
                          ? 'text-brand-600 bg-brand-50 font-medium'
                          : 'text-gray-700 hover:bg-gray-50'
                      }`}
                    >
                      {tab}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        );
      })()}

      {/* Tab content */}
      {activeTab === 'Register' ? (
        <>
          {/* Quick-action bar */}
          <div className="flex flex-wrap items-center gap-2 mb-3">
            <button
              onClick={markAllPresent}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg
                         border border-emerald-300 bg-emerald-50 text-emerald-700
                         hover:bg-emerald-100 transition-colors"
            >
              <CheckCheck size={14} />
              Mark all present
            </button>
            <button
              onClick={() => setAllATL(2)}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg
                         border border-blue-300 bg-blue-50 text-blue-700
                         hover:bg-blue-100 transition-colors"
            >
              <Check size={14} />
              All ATL 2
            </button>
            {!atlComplete && (
              <span className="text-xs text-amber-600 flex items-center gap-1 ml-auto">
                <AlertTriangle size={12} />
                ATL incomplete
              </span>
            )}
          </div>
          <p className="hidden md:flex items-center gap-1 text-xs text-gray-400 mb-1">
            Tip: Click an attendance cell and use keyboard (<kbd className="px-1 py-0.5 rounded bg-gray-100 text-gray-500 font-mono text-[10px]">/</kbd> <kbd className="px-1 py-0.5 rounded bg-gray-100 text-gray-500 font-mono text-[10px]">\</kbd> <kbd className="px-1 py-0.5 rounded bg-gray-100 text-gray-500 font-mono text-[10px]">N</kbd> <kbd className="px-1 py-0.5 rounded bg-gray-100 text-gray-500 font-mono text-[10px]">L</kbd> <kbd className="px-1 py-0.5 rounded bg-gray-100 text-gray-500 font-mono text-[10px]">-</kbd>) to mark quickly
          </p>

          {/* Register table */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            {/* Desktop table */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full border-collapse text-sm">
                <thead>
                  <tr className="bg-gray-50 border-b border-gray-200">
                    <th className="px-3 py-2.5 text-left text-xs font-semibold text-gray-700 w-48">Student</th>
                    <th className="px-2 py-2.5 text-center text-xs font-semibold text-gray-700 w-12">Form</th>
                    <th className="px-2 py-2.5 text-center text-xs font-semibold text-gray-700 w-44">ATL</th>
                    {PERIODS.map((p) => (
                      <th
                        key={p}
                        className={`px-1 py-2.5 text-center text-xs font-medium w-14 ${
                          p === registerData.period
                            ? 'font-semibold text-brand-600 bg-brand-50/50'
                            : 'text-gray-400'
                        }`}
                      >
                        P{p}
                      </th>
                    ))}
                    <th className="px-2 py-2.5 text-center text-xs font-semibold text-gray-700 w-16">
                      <Award size={12} className="inline text-emerald-500" />
                    </th>
                    <th className="px-2 py-2.5 text-center text-xs font-semibold text-gray-700 w-16">
                      <AlertTriangle size={12} className="inline text-red-500" />
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {rows.map((row, rowIndex) => (
                    <tr
                      key={row.studentId}
                      className="border-b border-gray-50 last:border-0 hover:bg-gray-50/50 transition-colors"
                    >
                      {/* Name */}
                      <td className="px-3 py-2">
                        <Link
                          to={`/student/${row.studentId}`}
                          className="hover:text-brand-600 hover:underline"
                        >
                          <span className="font-medium text-gray-900">{row.lastName}</span>
                          <span className="text-gray-500">, {row.firstName}</span>
                        </Link>
                      </td>

                      {/* Form group */}
                      <td className="px-2 py-2 text-center text-xs text-gray-400">{row.formGroup}</td>

                      {/* ATL buttons */}
                      <td className="px-2 py-2 text-center">
                        <div className="inline-flex gap-0.5">
                          {([1, 2, 3, 4, 5] as ATLGrade[]).map((grade) => {
                            const info = ATL_LABELS[grade];
                            const isSelected = row.localATL === grade;
                            return (
                              <button
                                key={grade}
                                onClick={() =>
                                  updateRow(
                                    row.studentId,
                                    'localATL',
                                    isSelected ? null : grade
                                  )
                                }
                                title={info.label}
                                className={`w-7 h-7 rounded-md border text-xs font-semibold transition-all ${
                                  isSelected
                                    ? `${info.bg} ${info.colour} ring-2 ring-offset-1 ring-current`
                                    : 'border-gray-200 bg-white text-gray-400 hover:bg-gray-50'
                                }`}
                              >
                                {info.short}
                              </button>
                            );
                          })}
                        </div>
                      </td>

                      {/* P1–P5: current period = editable attendance, others = read-only */}
                      {PERIODS.map((p) => {
                        if (p === registerData.period) {
                          // Editable attendance for this lesson
                          return (
                            <td key={p} className="px-1 py-2 text-center bg-brand-50/30">
                              <button
                                ref={(el) => { attendanceRefs.current[rowIndex] = el; }}
                                onClick={(e) => toggleCodeDropdown(row.studentId, e.currentTarget)}
                                onKeyDown={(e) => handleAttendanceKeyDown(e, row.studentId, rowIndex)}
                                className={`inline-flex items-center gap-0.5 px-2 py-1 rounded-md border text-xs font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-brand-400 focus:ring-offset-1 ${
                                  row.localCode === '/' || row.localCode === '\\'
                                    ? 'border-emerald-300 bg-emerald-50 text-emerald-700'
                                    : row.localCode === '-'
                                      ? 'border-gray-200 bg-gray-50 text-gray-400'
                                      : 'border-amber-300 bg-amber-50 text-amber-700'
                                }`}
                              >
                                {row.localCode}
                                <ChevronDown size={10} />
                              </button>
                            </td>
                          );
                        }

                        // Read-only code from another period
                        const code = row.otherPeriodCodes[p];
                        const atl = row.otherPeriodATL[p];
                        return (
                          <td key={p} className="px-1 py-2 text-center">
                            {code ? (
                              <span
                                title={atl ? `ATL ${atl}` : undefined}
                                className={`inline-block px-1.5 py-0.5 rounded text-[10px] font-mono ${
                                  code === '/' || code === '\\'
                                    ? 'bg-emerald-50 text-emerald-600'
                                    : code === '-'
                                      ? 'text-gray-300'
                                      : 'bg-amber-50 text-amber-600'
                                }`}
                              >
                                {code}
                              </span>
                            ) : (
                              <span className="text-gray-200 text-[10px]">&middot;</span>
                            )}
                          </td>
                        );
                      })}

                      {/* Rewards today */}
                      <td className="px-2 py-2 text-center">
                        {row.rewardsToday > 0 ? (
                          <span className="text-xs font-medium text-emerald-600">+{row.rewardsToday}</span>
                        ) : (
                          <span className="text-xs text-gray-300">0</span>
                        )}
                      </td>

                      {/* Consequences today */}
                      <td className="px-2 py-2 text-center">
                        {row.consequencesToday > 0 ? (
                          <span className="text-xs font-medium text-red-600">{row.consequencesToday}</span>
                        ) : (
                          <span className="text-xs text-gray-300">0</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile cards */}
            <div className="md:hidden divide-y divide-gray-100">
              {rows.map((row) => (
                <div key={row.studentId} className="p-3 space-y-2">
                  <div className="flex items-center justify-between">
                    <div>
                      <Link
                        to={`/student/${row.studentId}`}
                        className="hover:text-brand-600 hover:underline"
                      >
                        <span className="font-medium text-gray-900 text-sm">{row.lastName}</span>
                        <span className="text-gray-500 text-sm">, {row.firstName}</span>
                      </Link>
                      <span className="ml-2 text-xs text-gray-400">{row.formGroup}</span>
                    </div>
                    <div className="flex items-center gap-2 text-xs">
                      {row.rewardsToday > 0 && (
                        <span className="text-emerald-600 font-medium">+{row.rewardsToday}</span>
                      )}
                      {row.consequencesToday > 0 && (
                        <span className="text-red-600 font-medium">{row.consequencesToday}</span>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    {/* ATL */}
                    <div className="flex gap-0.5">
                      {([1, 2, 3, 4, 5] as ATLGrade[]).map((grade) => {
                        const info = ATL_LABELS[grade];
                        const isSelected = row.localATL === grade;
                        return (
                          <button
                            key={grade}
                            onClick={() =>
                              updateRow(row.studentId, 'localATL', isSelected ? null : grade)
                            }
                            className={`w-8 h-8 rounded-md border text-xs font-semibold transition-all ${
                              isSelected
                                ? `${info.bg} ${info.colour}`
                                : 'border-gray-200 bg-white text-gray-400'
                            }`}
                          >
                            {info.short}
                          </button>
                        );
                      })}
                    </div>

                    <div className="w-px h-6 bg-gray-200" />

                    {/* Attendance */}
                    <div className="flex gap-1">
                      {teacherCodes.map((c) => (
                        <button
                          key={c.code}
                          onClick={() => updateRow(row.studentId, 'localCode', c.code)}
                          title={c.label}
                          className={`w-8 h-8 rounded-md border text-xs font-mono font-medium transition-all ${
                            row.localCode === c.code
                              ? c.code === '/' || c.code === '\\'
                                ? 'border-emerald-300 bg-emerald-100 text-emerald-700'
                                : c.code === '-'
                                  ? 'border-gray-300 bg-gray-100 text-gray-500'
                                  : 'border-amber-300 bg-amber-100 text-amber-700'
                              : 'border-gray-200 bg-white text-gray-400'
                          }`}
                        >
                          {c.code}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* All period codes for context */}
                  <div className="flex items-center gap-1 text-[10px] text-gray-400">
                    {PERIODS.map((p) => {
                      if (p === registerData.period) {
                        return (
                          <span key={p} className={`px-1.5 py-0.5 rounded font-semibold ${
                            row.localCode === '/' || row.localCode === '\\'
                              ? 'bg-emerald-100 text-emerald-600'
                              : row.localCode === '-'
                                ? 'bg-gray-100 text-gray-400'
                                : 'bg-amber-100 text-amber-600'
                          }`}>
                            P{p}: {row.localCode}
                          </span>
                        );
                      }
                      const code = row.otherPeriodCodes[p];
                      return (
                        <span key={p} className={`px-1 py-0.5 rounded ${code ? 'bg-gray-50' : 'text-gray-300'}`}>
                          P{p}: {code || '·'}
                        </span>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </>
      ) : activeTab === 'Homework' ? (
        <HomeworkTab
          classGroupId={registerData.classGroupId}
          classGroupName={registerData.classGroupName}
          students={rows.map(r => ({ studentId: r.studentId, firstName: r.firstName, lastName: r.lastName }))}
        />
      ) : activeTab === 'Photos' ? (
        <PhotoGrid
          students={rows.map((r) => ({ studentId: r.studentId, firstName: r.firstName, lastName: r.lastName }))}
          classGroupName={registerData.classGroupName}
        />
      ) : activeTab === 'Seating Plan' ? (
        <SeatingPlan
          room={registerData.room}
          classGroupId={registerData.classGroupId}
          classGroupName={registerData.classGroupName}
          teacherName={registerData.teacherName}
          students={rows.map((r) => ({ studentId: r.studentId, firstName: r.firstName, lastName: r.lastName }))}
        />
      ) : activeTab === 'Spreadsheet' ? (
        <SpreadsheetTab
          classGroupId={registerData.classGroupId}
          classGroupName={registerData.classGroupName}
          students={rows.map((r) => ({ studentId: r.studentId, firstName: r.firstName, lastName: r.lastName }))}
        />
      ) : activeTab === 'Comms' ? (
        <CommsTab
          classGroupId={registerData.classGroupId}
          classGroupName={registerData.classGroupName}
        />
      ) : activeTab === 'Attendance' ? (
        <ClassAttendanceTab
          classGroupId={registerData.classGroupId}
          classGroupName={registerData.classGroupName}
          students={rows.map((r) => ({ studentId: r.studentId, firstName: r.firstName, lastName: r.lastName }))}
        />
      ) : activeTab === 'MyPlans' ? (
        <MyPlansTab
          classGroupId={registerData.classGroupId}
          classGroupName={registerData.classGroupName}
          students={rows.map((r) => ({ studentId: r.studentId, firstName: r.firstName, lastName: r.lastName }))}
        />
      ) : (
        /* Shell for other tabs */
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
          <p className="text-gray-400 text-sm">{activeTab} — coming soon</p>
        </div>
      )}

      {/* Fixed attendance code dropdown — renders above everything */}
      {expandedCodeRow && dropdownPos && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => { setExpandedCodeRow(null); setDropdownPos(null); }} />
          <div
            className="fixed z-50 bg-white rounded-lg shadow-lg border border-gray-200 py-1 min-w-[160px]"
            style={{
              top: dropdownPos.top,
              left: dropdownPos.left,
              transform: 'translateX(-50%)',
            }}
          >
            {teacherCodes.map((c) => {
              const currentRow = rows.find((r) => r.studentId === expandedCodeRow);
              return (
                <button
                  key={c.code}
                  onClick={() => {
                    updateRow(expandedCodeRow, 'localCode', c.code);
                    setExpandedCodeRow(null);
                    setDropdownPos(null);
                  }}
                  className={`w-full px-3 py-1.5 text-left text-xs hover:bg-gray-50 flex items-center gap-2 ${
                    currentRow?.localCode === c.code ? 'font-semibold text-brand-600' : 'text-gray-700'
                  }`}
                >
                  <span className="w-5 text-center font-mono">{c.code}</span>
                  {c.label}
                </button>
              );
            })}
          </div>
        </>
      )}

      {/* Action items sidebar toggle button */}
      {actionItems.length > 0 && (
        <button
          onClick={() => setShowSidebar((v) => !v)}
          className="fixed bottom-6 right-6 md:bottom-auto md:top-24 md:right-6 z-30
                     flex items-center gap-2 px-3 py-2.5 rounded-full shadow-lg
                     bg-amber-500 hover:bg-amber-600 text-white text-sm font-medium transition-colors"
        >
          <ClipboardList size={16} />
          <span>{actionItems.length}</span>
        </button>
      )}

      {/* Action items sidebar — desktop: right panel, mobile: bottom sheet */}
      {showSidebar && (
        <>
          {/* Backdrop (mobile only) */}
          <div
            className="fixed inset-0 z-30 bg-black/30 md:hidden"
            onClick={() => setShowSidebar(false)}
          />

          {/* Desktop sidebar */}
          <div className="hidden md:flex fixed top-0 right-0 z-30 h-full w-80 flex-col bg-white shadow-xl border-l border-gray-200 animate-slide-in-right">
            <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200">
              <div className="flex items-center gap-2">
                <ClipboardList size={16} className="text-amber-600" />
                <h3 className="text-sm font-semibold text-gray-900">Action Items</h3>
                {actionItems.length > 0 && (
                  <span className="flex items-center justify-center w-5 h-5 rounded-full bg-amber-500 text-white text-[10px] font-bold">
                    {actionItems.length}
                  </span>
                )}
              </div>
              <button
                onClick={() => setShowSidebar(false)}
                className="p-1 rounded-lg hover:bg-gray-100 text-gray-400"
              >
                <X size={16} />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              {actionItems.length === 0 ? (
                <p className="text-sm text-gray-400 text-center py-8">All items resolved</p>
              ) : (
                actionItems.map((item) => (
                  <ActionItemCard
                    key={`${item.type}-${item.studentId}`}
                    item={item}
                    onLateMinutesSave={handleLateMinutesSave}
                    onNAction={handleNAction}
                  />
                ))
              )}
            </div>
          </div>

          {/* Mobile bottom sheet */}
          <div className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white rounded-t-2xl shadow-xl border-t border-gray-200 max-h-[70vh] flex flex-col animate-slide-in-up">
            <div className="flex justify-center py-2">
              <div className="w-10 h-1 rounded-full bg-gray-300" />
            </div>
            <div className="flex items-center justify-between px-4 pb-2">
              <div className="flex items-center gap-2">
                <ClipboardList size={16} className="text-amber-600" />
                <h3 className="text-sm font-semibold text-gray-900">Action Items</h3>
                {actionItems.length > 0 && (
                  <span className="flex items-center justify-center w-5 h-5 rounded-full bg-amber-500 text-white text-[10px] font-bold">
                    {actionItems.length}
                  </span>
                )}
              </div>
              <button
                onClick={() => setShowSidebar(false)}
                className="p-1 rounded-lg hover:bg-gray-100 text-gray-400"
              >
                <X size={16} />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto px-4 pb-6 space-y-3">
              {actionItems.length === 0 ? (
                <p className="text-sm text-gray-400 text-center py-8">All items resolved</p>
              ) : (
                actionItems.map((item) => (
                  <ActionItemCard
                    key={`${item.type}-${item.studentId}`}
                    item={item}
                    onLateMinutesSave={handleLateMinutesSave}
                    onNAction={handleNAction}
                  />
                ))
              )}
            </div>
          </div>
        </>
      )}

      {/* Confirmation dialog for saving with unresolved items */}
      {showConfirmDialog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-sm mx-4 p-5">
            <div className="flex items-center gap-3 mb-3">
              <div className="flex items-center justify-center w-10 h-10 rounded-full bg-amber-100">
                <AlertTriangle size={20} className="text-amber-600" />
              </div>
              <h3 className="text-base font-semibold text-gray-900">Unresolved Items</h3>
            </div>
            <p className="text-sm text-gray-600 mb-4">
              You have {actionItems.length} unresolved action item{actionItems.length !== 1 ? 's' : ''}. Save anyway?
            </p>
            <div className="flex items-center justify-end gap-2">
              <button
                onClick={() => { setShowConfirmDialog(false); setShowSidebar(true); }}
                className="px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
              >
                Review Items
              </button>
              <button
                onClick={handleSave}
                className="px-4 py-2 text-sm font-medium bg-amber-500 hover:bg-amber-600 text-white rounded-lg transition-colors"
              >
                Save Anyway
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Leave warning modal (ATL incomplete / unresolved N codes) */}
      {showLeaveWarning && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-sm mx-4 p-5">
            <div className="flex items-center gap-3 mb-3">
              <div className="flex items-center justify-center w-10 h-10 rounded-full bg-amber-100">
                <AlertTriangle size={20} className="text-amber-600" />
              </div>
              <h3 className="text-base font-semibold text-gray-900">Before You Leave…</h3>
            </div>
            <ul className="text-sm text-gray-600 mb-4 list-disc pl-5 space-y-1">
              {leaveWarnings.map((w, i) => (
                <li key={i}>{w}</li>
              ))}
            </ul>
            <div className="flex items-center justify-end gap-2">
              <button
                onClick={() => setShowLeaveWarning(false)}
                className="px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
              >
                Stay
              </button>
              <button
                onClick={() => { setShowLeaveWarning(false); navigate('/dashboard'); }}
                className="px-4 py-2 text-sm font-medium bg-amber-500 hover:bg-amber-600 text-white rounded-lg transition-colors"
              >
                Leave Anyway
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Post-ATL modal */}
      {showPostATL && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-xl mx-4 max-h-[85vh] flex flex-col">
            {/* Modal header */}
            <div className="flex items-center justify-between px-5 py-4 border-b border-gray-200">
              <div>
                <h2 className="text-lg font-bold text-gray-900">Log Rewards &amp; Consequences</h2>
                <p className="text-xs text-gray-500 mt-0.5">
                  {postATLStudents.length} student{postATLStudents.length !== 1 ? 's' : ''} need logging
                </p>
              </div>
              <button
                onClick={() => setShowPostATL(false)}
                className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400"
              >
                <X size={18} />
              </button>
            </div>

            {/* Student list */}
            <div className="flex-1 overflow-y-auto px-5 py-3 space-y-4">
              {postATLStudents.map((student) => {
                const isReward = student.atlGrade === 1;
                const atlInfo = ATL_LABELS[student.atlGrade];
                const reasons = isReward
                  ? REWARD_REASONS
                  : CONSEQUENCE_REASONS[student.atlGrade as 3 | 4 | 5] || [];

                return (
                  <div
                    key={student.studentId}
                    className={`rounded-lg border p-3 ${
                      isReward ? 'border-emerald-200 bg-emerald-50/50' : 'border-amber-200 bg-amber-50/50'
                    }`}
                  >
                    <div className="flex items-center gap-2 mb-2">
                      <span
                        className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold ${atlInfo.bg} ${atlInfo.colour}`}
                      >
                        ATL {student.atlGrade} — {atlInfo.label}
                      </span>
                      <span className="text-sm font-medium text-gray-900">
                        {student.firstName} {student.lastName}
                      </span>
                    </div>

                    <div className="space-y-2">
                      <select
                        value={student.category}
                        onChange={(e) =>
                          updatePostATLStudent(student.studentId, 'category', e.target.value)
                        }
                        className="w-full rounded-md border border-gray-300 px-2.5 py-1.5 text-sm
                                   focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent"
                      >
                        {reasons.map((r) => (
                          <option key={r} value={r}>
                            {r}
                          </option>
                        ))}
                      </select>
                      <input
                        type="text"
                        value={student.note}
                        onChange={(e) =>
                          updatePostATLStudent(student.studentId, 'note', e.target.value)
                        }
                        placeholder="Optional note..."
                        className="w-full rounded-md border border-gray-300 px-2.5 py-1.5 text-sm
                                   focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent"
                      />
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Modal footer */}
            <div className="flex items-center justify-end gap-2 px-5 py-4 border-t border-gray-200">
              <button
                onClick={() => setShowPostATL(false)}
                className="px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
              >
                Skip
              </button>
              <button
                onClick={handleSubmitBehaviour}
                disabled={submittingBehaviour}
                className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium
                           bg-brand-600 hover:bg-brand-700 text-white transition-colors disabled:opacity-50"
              >
                {submittingBehaviour ? (
                  <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent" />
                ) : (
                  <Check size={16} />
                )}
                Log All
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
