// ============================================================
// Seating Plan — classroom layout editor + student assignment
// Supports aisle columns/rows for walkways and room fixtures
// ============================================================

import { useState, useEffect, useCallback, useRef } from 'react';
import {
  Grid3X3, Trash2, PenLine, Users, AlertTriangle, RotateCcw, Copy, Save, GraduationCap, Presentation, DoorOpen, Camera,
} from 'lucide-react';

// --------------- localStorage keys ---------------
const ROOM_LAYOUTS_KEY = 'unity-pulse-room-layouts';
const SEATING_KEY = 'unity-pulse-seating';
const SAVED_PLANS_KEY = 'unity-pulse-saved-plans';
// --------------- Types ---------------
type FixtureType = 'teacher' | 'whiteboard' | 'door';

interface DeskLayout {
  cols: number;
  rows: number;
  desks: [number, number][];
  aisleColumns?: number[];
  aisleRows?: number[];
  fixtures?: Record<string, FixtureType>;
  label?: string; // e.g. "9X/Sc1 — J. Wilson" for template display
  room?: string;  // stored for template display
}

type LayoutStore = Record<string, DeskLayout>; // keyed by seatingKey (classGroupId:room)
type SeatingMap = Record<string, Record<string, string>>;

interface SavedPlan {
  id: string;
  name: string;
  assignments: Record<string, string>;
  savedAt: string; // ISO timestamp
}

interface SeatingPlanProps {
  room: string;
  classGroupId: string;
  classGroupName: string;
  teacherName: string;
  students: { studentId: string; firstName: string; lastName: string }[];
  photos?: Record<string, string>; // studentId → photo URL
}

const FIXTURE_META: Record<FixtureType, { label: string; icon: typeof GraduationCap }> = {
  teacher: { label: 'Teacher', icon: GraduationCap },
  whiteboard: { label: 'Board', icon: Presentation },
  door: { label: 'Door', icon: DoorOpen },
};

// --------------- Helpers ---------------
function loadLayouts(): LayoutStore {
  try {
    return JSON.parse(localStorage.getItem(ROOM_LAYOUTS_KEY) || '{}');
  } catch {
    return {};
  }
}

function saveLayouts(layouts: LayoutStore) {
  localStorage.setItem(ROOM_LAYOUTS_KEY, JSON.stringify(layouts));
}

function loadSeating(): SeatingMap {
  try {
    return JSON.parse(localStorage.getItem(SEATING_KEY) || '{}');
  } catch {
    return {};
  }
}

function saveSeating(seating: SeatingMap) {
  localStorage.setItem(SEATING_KEY, JSON.stringify(seating));
}

// Saved plan snapshots — multiple per class
function loadSavedPlans(seatingKey: string): SavedPlan[] {
  try {
    const all = JSON.parse(localStorage.getItem(SAVED_PLANS_KEY) || '{}');
    return all[seatingKey] || [];
  } catch {
    return [];
  }
}

function savePlanSnapshot(seatingKey: string, plan: SavedPlan) {
  try {
    const all = JSON.parse(localStorage.getItem(SAVED_PLANS_KEY) || '{}');
    const plans: SavedPlan[] = all[seatingKey] || [];
    plans.unshift(plan); // newest first
    all[seatingKey] = plans;
    localStorage.setItem(SAVED_PLANS_KEY, JSON.stringify(all));
  } catch { /* ignore */ }
}

function deleteSavedPlan(seatingKey: string, planId: string) {
  try {
    const all = JSON.parse(localStorage.getItem(SAVED_PLANS_KEY) || '{}');
    const plans: SavedPlan[] = all[seatingKey] || [];
    all[seatingKey] = plans.filter((p) => p.id !== planId);
    localStorage.setItem(SAVED_PLANS_KEY, JSON.stringify(all));
  } catch { /* ignore */ }
}

function formatTimestamp(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })
    + ' ' + d.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' });
}

function initials(firstName: string, lastName: string) {
  return `${firstName[0] || ''}${lastName[0] || ''}`.toUpperCase();
}

function FixtureIcon({ type, size = 18 }: { type: FixtureType; size?: number }) {
  const meta = FIXTURE_META[type];
  const Icon = meta.icon;
  return <Icon size={size} />;
}

// ============================================================
// Component
// ============================================================
export default function SeatingPlan({ room, classGroupId, classGroupName, teacherName, students, photos = {} }: SeatingPlanProps) {
  const seatingKey = `${classGroupId}:${room}`;
  const isTouch = 'ontouchstart' in window;
  const [showPhotos, setShowPhotos] = useState(false);

  // ---- State ----
  const [mode, setMode] = useState<'layout' | 'assign'>(() => {
    const layouts = loadLayouts();
    return layouts[seatingKey] ? 'assign' : 'layout';
  });

  // Layout editor state
  const [gridRows, setGridRows] = useState(4);
  const [gridCols, setGridCols] = useState(6);
  const [desks, setDesks] = useState<Set<string>>(new Set());
  const [aisleColumns, setAisleColumns] = useState<Set<number>>(new Set());
  const [aisleRows, setAisleRows] = useState<Set<number>>(new Set());
  const [fixtures, setFixtures] = useState<Record<string, FixtureType>>({});

  // Assignment state
  const [assignments, setAssignments] = useState<Record<string, string>>({});
  const [layout, setLayout] = useState<DeskLayout | null>(null);

  // Touch / tap-to-select state
  const [selectedStudent, setSelectedStudent] = useState<string | null>(null);

  // Drag state
  const [dragOverCell, setDragOverCell] = useState<string | null>(null);
  const [dragOverPanel, setDragOverPanel] = useState(false);
  const dragStudentRef = useRef<string | null>(null);

  // Saved plan snapshots
  const [savedPlans, setSavedPlans] = useState<SavedPlan[]>([]);

  // ---- Load from localStorage on mount ----
  useEffect(() => {
    const layouts = loadLayouts();
    const saved = layouts[seatingKey];
    if (saved) {
      setLayout(saved);
      setGridRows(saved.rows);
      setGridCols(saved.cols);
      setDesks(new Set(saved.desks.map(([r, c]) => `${r},${c}`)));
      setAisleColumns(new Set(saved.aisleColumns || []));
      setAisleRows(new Set(saved.aisleRows || []));
      setFixtures(saved.fixtures || {});
      setMode('assign');
    } else {
      setMode('layout');
    }
  }, [seatingKey]);

  // Load seating assignments + saved plans
  useEffect(() => {
    const allSeating = loadSeating();
    const saved = allSeating[seatingKey] || {};
    const studentIds = new Set(students.map((s) => s.studentId));
    const cleaned: Record<string, string> = {};
    for (const [cell, sid] of Object.entries(saved)) {
      if (studentIds.has(sid)) {
        cleaned[cell] = sid;
      }
    }
    setAssignments(cleaned);
    setSavedPlans(loadSavedPlans(seatingKey));
  }, [seatingKey, students]);

  // ---- Persist assignments ----
  const persistAssignments = useCallback(
    (next: Record<string, string>) => {
      setAssignments(next);
      const allSeating = loadSeating();
      allSeating[seatingKey] = next;
      saveSeating(allSeating);
    },
    [seatingKey]
  );

  // ---- Layout editor handlers ----
  // Cycle: empty → desk → teacher → whiteboard → door → empty
  const CYCLE: (null | 'desk' | FixtureType)[] = [null, 'desk', 'teacher', 'whiteboard', 'door'];

  function getCellState(key: string): null | 'desk' | FixtureType {
    if (desks.has(key)) return 'desk';
    if (fixtures[key]) return fixtures[key];
    return null;
  }

  function setCellState(key: string, state: null | 'desk' | FixtureType) {
    if (state === 'desk') {
      setDesks((prev) => new Set(prev).add(key));
      setFixtures((prev) => { const next = { ...prev }; delete next[key]; return next; });
    } else if (state) {
      setDesks((prev) => { const next = new Set(prev); next.delete(key); return next; });
      setFixtures((prev) => ({ ...prev, [key]: state }));
    } else {
      setDesks((prev) => { const next = new Set(prev); next.delete(key); return next; });
      setFixtures((prev) => { const next = { ...prev }; delete next[key]; return next; });
    }
  }

  function handleCellClick(r: number, c: number) {
    if (aisleColumns.has(c) || aisleRows.has(r)) return;
    const key = `${r},${c}`;
    const current = getCellState(key);
    const idx = CYCLE.indexOf(current);
    const next = CYCLE[(idx + 1) % CYCLE.length];
    setCellState(key, next);
  }

  function handleCellRightClick(e: React.MouseEvent, r: number, c: number) {
    e.preventDefault();
    if (aisleColumns.has(c) || aisleRows.has(r)) return;
    const key = `${r},${c}`;
    const current = getCellState(key);
    const idx = CYCLE.indexOf(current);
    const next = CYCLE[(idx - 1 + CYCLE.length) % CYCLE.length];
    setCellState(key, next);
  }

  function toggleAisleCol(c: number) {
    setAisleColumns((prev) => {
      const next = new Set(prev);
      if (next.has(c)) {
        next.delete(c);
      } else {
        next.add(c);
        setDesks((d) => {
          const cleaned = new Set(d);
          for (let r = 0; r < gridRows; r++) cleaned.delete(`${r},${c}`);
          return cleaned;
        });
        setFixtures((f) => {
          const cleaned = { ...f };
          for (let r = 0; r < gridRows; r++) delete cleaned[`${r},${c}`];
          return cleaned;
        });
      }
      return next;
    });
  }

  function toggleAisleRow(r: number) {
    setAisleRows((prev) => {
      const next = new Set(prev);
      if (next.has(r)) {
        next.delete(r);
      } else {
        next.add(r);
        setDesks((d) => {
          const cleaned = new Set(d);
          for (let c = 0; c < gridCols; c++) cleaned.delete(`${r},${c}`);
          return cleaned;
        });
        setFixtures((f) => {
          const cleaned = { ...f };
          for (let c = 0; c < gridCols; c++) delete cleaned[`${r},${c}`];
          return cleaned;
        });
      }
      return next;
    });
  }

  function handleSaveLayout() {
    const deskArr: [number, number][] = Array.from(desks).map((k) => {
      const [r, c] = k.split(',').map(Number);
      return [r, c];
    });
    const newLayout: DeskLayout = {
      rows: gridRows,
      cols: gridCols,
      desks: deskArr,
      aisleColumns: Array.from(aisleColumns),
      aisleRows: Array.from(aisleRows),
      fixtures,
      label: `${classGroupName} — ${teacherName}`,
      room,
    };

    const layouts = loadLayouts();
    layouts[seatingKey] = newLayout;
    saveLayouts(layouts);
    setLayout(newLayout);

    // Clean up assignments on cells that no longer exist
    const deskSet = new Set(deskArr.map(([r, c]) => `${r},${c}`));
    const cleaned: Record<string, string> = {};
    for (const [cell, sid] of Object.entries(assignments)) {
      if (deskSet.has(cell)) cleaned[cell] = sid;
    }
    persistAssignments(cleaned);

    setMode('assign');
  }

  function clearAllDesks() {
    setDesks(new Set());
    setFixtures({});
  }

  function handleGridRowsChange(val: number) {
    setGridRows(val);
    setDesks((prev) => {
      const next = new Set<string>();
      prev.forEach((k) => {
        const [r, c] = k.split(',').map(Number);
        if (r < val && c < gridCols) next.add(k);
      });
      return next;
    });
    setAisleRows((prev) => {
      const next = new Set<number>();
      prev.forEach((r) => { if (r < val) next.add(r); });
      return next;
    });
    setFixtures((prev) => {
      const next: Record<string, FixtureType> = {};
      for (const [k, v] of Object.entries(prev)) {
        const [r] = k.split(',').map(Number);
        if (r < val) next[k] = v;
      }
      return next;
    });
  }

  function handleGridColsChange(val: number) {
    setGridCols(val);
    setDesks((prev) => {
      const next = new Set<string>();
      prev.forEach((k) => {
        const [r, c] = k.split(',').map(Number);
        if (r < gridRows && c < val) next.add(k);
      });
      return next;
    });
    setAisleColumns((prev) => {
      const next = new Set<number>();
      prev.forEach((c) => { if (c < val) next.add(c); });
      return next;
    });
    setFixtures((prev) => {
      const next: Record<string, FixtureType> = {};
      for (const [k, v] of Object.entries(prev)) {
        const [, c] = k.split(',').map(Number);
        if (c < val) next[k] = v;
      }
      return next;
    });
  }

  // ---- Assignment handlers ----
  const assignedStudentIds = new Set(Object.values(assignments));
  const unassigned = students.filter((s) => !assignedStudentIds.has(s.studentId));

  function handleDragStart(studentId: string) {
    dragStudentRef.current = studentId;
  }

  function handleDragOver(e: React.DragEvent, cellKey: string) {
    e.preventDefault();
    setDragOverCell(cellKey);
  }

  function handleDragLeave() {
    setDragOverCell(null);
  }

  function handleDropOnDesk(cellKey: string) {
    setDragOverCell(null);
    const draggedId = dragStudentRef.current;
    if (!draggedId) return;
    dragStudentRef.current = null;

    const next = { ...assignments };
    for (const [cell, sid] of Object.entries(next)) {
      if (sid === draggedId) { delete next[cell]; break; }
    }

    const occupant = next[cellKey];
    if (occupant) {
      const draggedOldCell = Object.entries(assignments).find(([, sid]) => sid === draggedId)?.[0];
      if (draggedOldCell) {
        next[draggedOldCell] = occupant;
      } else {
        delete next[cellKey];
      }
    }

    next[cellKey] = draggedId;
    persistAssignments(next);
  }

  function handleDeskDragStart(e: React.DragEvent, studentId: string) {
    e.dataTransfer.effectAllowed = 'move';
    dragStudentRef.current = studentId;
  }

  function handleTapStudent(studentId: string) {
    if (!isTouch) return;
    setSelectedStudent((prev) => (prev === studentId ? null : studentId));
  }

  function handleDeskClick(cellKey: string) {
    const occupant = assignments[cellKey];

    // Touch: tap-to-select placement flow
    if (isTouch && selectedStudent) {
      const next = { ...assignments };
      for (const [cell, sid] of Object.entries(next)) {
        if (sid === selectedStudent) { delete next[cell]; break; }
      }
      if (occupant && occupant !== selectedStudent) {
        const selectedOldCell = Object.entries(assignments).find(([, sid]) => sid === selectedStudent)?.[0];
        if (selectedOldCell) next[selectedOldCell] = occupant;
      }
      next[cellKey] = selectedStudent;
      persistAssignments(next);
      setSelectedStudent(null);
      return;
    }

    // Click occupied desk → unseat (works on both desktop and touch)
    if (occupant) {
      const next = { ...assignments };
      delete next[cellKey];
      persistAssignments(next);
    }
  }

  function handleDropToUnseat() {
    setDragOverPanel(false);
    const draggedId = dragStudentRef.current;
    if (!draggedId) return;
    dragStudentRef.current = null;

    const next = { ...assignments };
    for (const [cell, sid] of Object.entries(next)) {
      if (sid === draggedId) { delete next[cell]; break; }
    }
    persistAssignments(next);
  }

  function clearAllSeats() {
    persistAssignments({});
  }

  // ---- Saved plan snapshots ----
  function handleSavePlan() {
    if (Object.keys(assignments).length === 0) return;
    const now = new Date().toISOString();
    const plan: SavedPlan = {
      id: `${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      name: formatTimestamp(now),
      assignments: { ...assignments },
      savedAt: now,
    };
    savePlanSnapshot(seatingKey, plan);
    setSavedPlans(loadSavedPlans(seatingKey));
  }

  function handleLoadPlan(planId: string) {
    const plan = savedPlans.find((p) => p.id === planId);
    if (!plan) return;
    // Filter out students no longer in class
    const studentIds = new Set(students.map((s) => s.studentId));
    const cleaned: Record<string, string> = {};
    for (const [cell, sid] of Object.entries(plan.assignments)) {
      if (studentIds.has(sid)) cleaned[cell] = sid;
    }
    persistAssignments(cleaned);
  }

  function handleDeletePlan(planId: string) {
    deleteSavedPlan(seatingKey, planId);
    setSavedPlans(loadSavedPlans(seatingKey));
  }

  // ---- Layout Templates ----
  // Templates are saved layouts from OTHER classes that can be copied into the layout editor.
  // Same-room layouts appear first since they're most likely what you want.
  function getLayoutTemplates(): { key: string; label: string; tplRoom: string; sameRoom: boolean; layout: DeskLayout }[] {
    const allLayouts = loadLayouts();
    const templates: { key: string; label: string; tplRoom: string; sameRoom: boolean; layout: DeskLayout }[] = [];

    for (const [key, savedLayout] of Object.entries(allLayouts)) {
      if (key === seatingKey) continue; // skip this class
      if (savedLayout.desks.length === 0) continue;
      const tplRoom = savedLayout.room || key.split(':')[1] || '?';
      templates.push({
        key,
        label: savedLayout.label || key.split(':')[0],
        tplRoom,
        sameRoom: tplRoom === room,
        layout: savedLayout,
      });
    }

    // Same room first, then alphabetical by label
    templates.sort((a, b) => {
      if (a.sameRoom !== b.sameRoom) return a.sameRoom ? -1 : 1;
      return a.label.localeCompare(b.label);
    });

    return templates;
  }

  function applyLayoutTemplate(tpl: DeskLayout) {
    setGridRows(tpl.rows);
    setGridCols(tpl.cols);
    setDesks(new Set(tpl.desks.map(([r, c]) => `${r},${c}`)));
    setAisleColumns(new Set(tpl.aisleColumns || []));
    setAisleRows(new Set(tpl.aisleRows || []));
    setFixtures(tpl.fixtures || {});
  }

  function switchToLayout() {
    setMode('layout');
    if (layout) {
      setGridRows(layout.rows);
      setGridCols(layout.cols);
      setDesks(new Set(layout.desks.map(([r, c]) => `${r},${c}`)));
      setAisleColumns(new Set(layout.aisleColumns || []));
      setAisleRows(new Set(layout.aisleRows || []));
      setFixtures(layout.fixtures || {});
    }
  }

  // ---- Computed ----
  const actualDeskCount = mode === 'layout' ? desks.size : (layout?.desks.length ?? 0);
  const moreStudentsThanDesks = students.length > actualDeskCount && mode === 'assign';

  // ---- Shared cell renderer for fixtures (used in both modes) ----
  function renderFixtureCell(key: string, type: FixtureType, interactive: boolean) {
    const meta = FIXTURE_META[type];
    return (
      <div
        key={key}
        className={`flex-shrink-0 w-12 h-12 sm:w-16 sm:h-16 rounded-lg border-2 flex flex-col items-center justify-center gap-0.5 ${
          interactive
            ? 'border-gray-400 bg-gray-100 text-gray-500 shadow-sm'
            : 'border-gray-200 bg-gray-50 text-gray-400'
        }`}
      >
        <FixtureIcon type={type} size={18} />
        <span className="text-[8px] font-medium leading-none">{meta.label}</span>
      </div>
    );
  }

  // ==================================================================
  // LAYOUT EDITOR
  // ==================================================================
  if (mode === 'layout') {
    return (
      <div className="relative left-1/2 right-1/2 -ml-[50vw] -mr-[50vw] w-screen px-4 sm:px-6 lg:px-10 overflow-x-auto">
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 sm:p-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5">
          <div>
            <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
              <Grid3X3 size={20} className="text-brand-600" />
              Room Layout — {room}
            </h2>
            <p className="text-sm text-gray-500 mt-0.5">
              Click to cycle: desk → teacher → board → door. Right-click to go back.
              {' '}{desks.size} desk{desks.size !== 1 ? 's' : ''} placed.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            {(() => {
              const layoutTemplates = getLayoutTemplates();
              return (
                <div className="relative flex items-center gap-1.5">
                  <Copy size={14} className="text-gray-400" />
                  <select
                    defaultValue=""
                    onChange={(e) => {
                      const tpl = layoutTemplates.find((t) => t.key === e.target.value);
                      if (tpl) applyLayoutTemplate(tpl.layout);
                      e.target.value = '';
                    }}
                    className="appearance-none pl-1 pr-6 py-1.5 text-xs font-medium rounded-lg
                               border border-gray-300 bg-white text-gray-600
                               hover:bg-gray-50 transition-colors cursor-pointer
                               focus:outline-none focus:ring-2 focus:ring-brand-400 focus:border-transparent"
                  >
                    <option value="" disabled>Copy layout from…</option>
                    {layoutTemplates.length === 0 ? (
                      <option disabled>No other layouts saved</option>
                    ) : (
                      layoutTemplates.map((t) => (
                        <option key={t.key} value={t.key}>
                          {t.label} ({t.tplRoom}){t.sameRoom ? ' — same room' : ''}
                        </option>
                      ))
                    )}
                  </select>
                </div>
              );
            })()}
            <button
              onClick={clearAllDesks}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg
                         border border-gray-300 bg-white text-gray-600
                         hover:bg-gray-50 transition-colors"
            >
              <Trash2 size={14} />
              Clear All
            </button>
            <button
              onClick={handleSaveLayout}
              disabled={desks.size === 0}
              className="flex items-center gap-1.5 px-4 py-1.5 text-xs font-medium rounded-lg
                         bg-brand-600 hover:bg-brand-700 text-white transition-colors
                         disabled:opacity-40 disabled:cursor-not-allowed"
            >
              Save Layout
            </button>
          </div>
        </div>

        {/* Grid size controls */}
        <div className="flex flex-wrap items-center gap-4 mb-4">
          <label className="flex items-center gap-2 text-sm text-gray-700">
            Rows:
            <input
              type="number"
              min={1}
              max={12}
              value={gridRows}
              onChange={(e) => handleGridRowsChange(Math.max(1, Math.min(12, parseInt(e.target.value) || 1)))}
              className="w-16 rounded-md border border-gray-300 px-2 py-1 text-sm text-center
                         focus:outline-none focus:ring-2 focus:ring-brand-400 focus:border-transparent"
            />
          </label>
          <label className="flex items-center gap-2 text-sm text-gray-700">
            Columns:
            <input
              type="number"
              min={1}
              max={20}
              value={gridCols}
              onChange={(e) => handleGridColsChange(Math.max(1, Math.min(20, parseInt(e.target.value) || 1)))}
              className="w-16 rounded-md border border-gray-300 px-2 py-1 text-sm text-center
                         focus:outline-none focus:ring-2 focus:ring-brand-400 focus:border-transparent"
            />
          </label>
        </div>

        {/* Front of Room — above grid */}
        <div className="mb-3 text-center">
          <span className="inline-block px-4 py-1 rounded-full bg-gray-100 text-xs font-semibold text-gray-500 tracking-wider uppercase">
            Front of Room
          </span>
        </div>

        {/* Grid with column + row headers */}
        <div className="overflow-x-auto pb-2">
          {/* Column headers */}
          <div className="flex items-end gap-1.5 mb-1.5">
            <div className="w-8 flex-shrink-0" />
            {Array.from({ length: gridCols }, (_, c) => {
              const isAisle = aisleColumns.has(c);
              return (
                <button
                  key={c}
                  onClick={() => toggleAisleCol(c)}
                  className={`flex-shrink-0 flex items-center justify-center rounded transition-colors ${
                    isAisle
                      ? 'w-5 h-7 bg-amber-100 border border-amber-300 text-amber-600 text-[10px] font-bold'
                      : 'w-12 sm:w-16 h-6 bg-gray-100 hover:bg-gray-200 text-gray-400 text-[10px] font-medium'
                  }`}
                  title={isAisle ? 'Remove aisle' : 'Click to make this column an aisle (walkway)'}
                >
                  {isAisle ? '↕' : c + 1}
                </button>
              );
            })}
          </div>

          {/* Grid rows */}
          {Array.from({ length: gridRows }, (_, r) => {
            const isAisleRow = aisleRows.has(r);
            return (
              <div key={r} className="flex items-center gap-1.5 mb-1.5">
                <button
                  onClick={() => toggleAisleRow(r)}
                  className={`flex-shrink-0 flex items-center justify-center rounded transition-colors ${
                    isAisleRow
                      ? 'w-8 h-5 bg-amber-100 border border-amber-300 text-amber-600 text-[10px] font-bold'
                      : 'w-8 h-12 sm:h-16 bg-gray-100 hover:bg-gray-200 text-gray-400 text-[10px] font-medium'
                  }`}
                  title={isAisleRow ? 'Remove aisle' : 'Click to make this row an aisle (walkway)'}
                >
                  {isAisleRow ? '↔' : String.fromCharCode(65 + r)}
                </button>

                {Array.from({ length: gridCols }, (_, c) => {
                  const isAisleCol = aisleColumns.has(c);

                  if (isAisleCol && isAisleRow) {
                    return <div key={`${r},${c}`} className="flex-shrink-0 w-5 h-5" />;
                  }
                  if (isAisleCol) {
                    return (
                      <div key={`${r},${c}`} className="flex-shrink-0 w-5 h-12 sm:h-16 flex items-center justify-center">
                        <div className="w-px h-full border-l border-dashed border-amber-300" />
                      </div>
                    );
                  }
                  if (isAisleRow) {
                    return (
                      <div key={`${r},${c}`} className="flex-shrink-0 w-12 sm:w-16 h-5 flex items-center justify-center">
                        <div className="h-px w-full border-t border-dashed border-amber-300" />
                      </div>
                    );
                  }

                  const key = `${r},${c}`;
                  const isDesk = desks.has(key);
                  const fixture = fixtures[key];

                  return (
                    <button
                      key={key}
                      onClick={() => handleCellClick(r, c)}
                      onContextMenu={(e) => handleCellRightClick(e, r, c)}
                      className={`flex-shrink-0 w-12 h-12 sm:w-16 sm:h-16 rounded-lg border-2 transition-all flex flex-col items-center justify-center gap-0.5 ${
                        isDesk
                          ? 'border-brand-500 bg-brand-50 text-brand-600 shadow-sm'
                          : fixture
                            ? 'border-gray-400 bg-gray-100 text-gray-500 shadow-sm'
                            : 'border-dashed border-gray-300 bg-gray-50/50 text-gray-300 hover:border-gray-400 hover:bg-gray-100'
                      }`}
                      title={
                        isDesk ? 'Desk — click to remove'
                        : fixture ? `${FIXTURE_META[fixture].label} — click to remove`
                        : 'Empty — click to place'
                      }
                    >
                      {isDesk ? (
                        <Grid3X3 size={20} />
                      ) : fixture ? (
                        <>
                          <FixtureIcon type={fixture} size={18} />
                          <span className="text-[8px] font-medium leading-none">{FIXTURE_META[fixture].label}</span>
                        </>
                      ) : (
                        <span className="text-[10px] font-medium">+</span>
                      )}
                    </button>
                  );
                })}
              </div>
            );
          })}
        </div>
      </div>
      </div>
    );
  }

  // ==================================================================
  // SEATING ASSIGNMENT
  // ==================================================================
  const layoutAisleCols = new Set(layout?.aisleColumns || []);
  const layoutAisleRows = new Set(layout?.aisleRows || []);
  const layoutFixtures = layout?.fixtures || {};

  return (
    <div className="relative left-1/2 right-1/2 -ml-[50vw] -mr-[50vw] w-screen px-4 sm:px-6 lg:px-10 overflow-x-auto">
    <div className="space-y-4">
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 sm:p-6">
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3 mb-4">
          <div>
            <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
              <Users size={20} className="text-brand-600" />
              {classGroupName} — {teacherName}
            </h2>
            <div className="flex flex-wrap items-center gap-2 mt-1">
              <span className="inline-flex items-center px-2 py-0.5 rounded-full bg-gray-100 text-xs font-medium text-gray-600">
                {room}
              </span>
              <span className="text-xs text-gray-400">
                {Object.keys(assignments).length} / {students.length} seated
              </span>
              {Object.keys(assignments).length > 0 && (
                <span className="text-xs text-emerald-600 flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                  Auto-saved
                </span>
              )}
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={handleSavePlan}
              disabled={Object.keys(assignments).length === 0}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg
                         border border-emerald-300 bg-emerald-50 text-emerald-700
                         hover:bg-emerald-100 transition-colors
                         disabled:opacity-40 disabled:cursor-not-allowed"
              title="Save a snapshot of the current seating arrangement"
            >
              <Save size={14} />
              Save Plan
            </button>
            {savedPlans.length > 0 && (
              <div className="relative flex items-center gap-1.5">
                <select
                  defaultValue=""
                  onChange={(e) => {
                    const val = e.target.value;
                    if (val.startsWith('load:')) handleLoadPlan(val.slice(5));
                    else if (val.startsWith('del:')) handleDeletePlan(val.slice(4));
                    e.target.value = '';
                  }}
                  className="appearance-none pl-2 pr-6 py-1.5 text-xs font-medium rounded-lg
                             border border-gray-300 bg-white text-gray-600
                             hover:bg-gray-50 transition-colors cursor-pointer
                             focus:outline-none focus:ring-2 focus:ring-brand-400 focus:border-transparent"
                >
                  <option value="" disabled>Load saved plan…</option>
                  {savedPlans.map((p) => (
                    <optgroup key={p.id} label={p.name}>
                      <option value={`load:${p.id}`}>
                        Load — {Object.keys(p.assignments).length} students seated
                      </option>
                      <option value={`del:${p.id}`}>
                        Delete this plan
                      </option>
                    </optgroup>
                  ))}
                </select>
              </div>
            )}
            <button
              onClick={clearAllSeats}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg
                         border border-gray-300 bg-white text-gray-600
                         hover:bg-gray-50 transition-colors"
            >
              <RotateCcw size={14} />
              Clear Seats
            </button>
            <button
              onClick={() => setShowPhotos((v) => !v)}
              className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg transition-colors ${
                showPhotos
                  ? 'border border-brand-400 bg-brand-100 text-brand-700'
                  : 'border border-gray-300 bg-white text-gray-600 hover:bg-gray-50'
              }`}
              title={showPhotos ? 'Switch to initials' : 'Show photos on desks'}
            >
              <Camera size={14} />
              Photos
            </button>
            <button
              onClick={switchToLayout}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg
                         border border-brand-300 bg-brand-50 text-brand-700
                         hover:bg-brand-100 transition-colors"
            >
              <PenLine size={14} />
              Edit Layout
            </button>
          </div>
        </div>

        {moreStudentsThanDesks && (
          <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-amber-50 border border-amber-200 mb-4">
            <AlertTriangle size={14} className="text-amber-600 flex-shrink-0" />
            <span className="text-xs text-amber-700">
              More students ({students.length}) than desks ({layout?.desks.length ?? 0}).
              Some students cannot be seated.
            </span>
          </div>
        )}

        {/* Two-column: grid + unassigned panel */}
        <div className="flex flex-col lg:flex-row gap-4">
          {/* Grid */}
          <div className="flex-1 overflow-x-auto">
            {layout && (
              <>
                {/* Front of Room — above grid */}
                <div className="mb-3 text-center">
                  <span className="inline-block px-4 py-1 rounded-full bg-gray-100 text-xs font-semibold text-gray-500 tracking-wider uppercase">
                    Front of Room
                  </span>
                </div>

                <div className="inline-flex flex-col gap-1.5">
                  {Array.from({ length: layout.rows }, (_, r) => {
                    const isAisleRow = layoutAisleRows.has(r);

                    if (isAisleRow) {
                      return (
                        <div key={r} className="flex gap-1.5">
                          {Array.from({ length: layout.cols }, (_, c) => {
                            const isAisleCol = layoutAisleCols.has(c);
                            return (
                              <div
                                key={`${r},${c}`}
                                className={`flex-shrink-0 h-3 ${isAisleCol ? 'w-5' : 'w-12 sm:w-16'}`}
                              />
                            );
                          })}
                        </div>
                      );
                    }

                    return (
                      <div key={r} className="flex items-center gap-1.5">
                        {Array.from({ length: layout.cols }, (_, c) => {
                          const cellKey = `${r},${c}`;
                          const isAisleCol = layoutAisleCols.has(c);

                          if (isAisleCol) {
                            return <div key={cellKey} className="flex-shrink-0 w-5 h-12 sm:h-16" />;
                          }

                          // Check for fixture
                          const fixtureType = layoutFixtures[cellKey];
                          if (fixtureType) {
                            return renderFixtureCell(cellKey, fixtureType, false);
                          }

                          const isDesk = layout.desks.some(([dr, dc]) => dr === r && dc === c);
                          if (!isDesk) {
                            return <div key={cellKey} className="flex-shrink-0 w-12 h-12 sm:w-16 sm:h-16" />;
                          }

                          const studentId = assignments[cellKey];
                          const student = studentId
                            ? students.find((s) => s.studentId === studentId)
                            : null;
                          const isDragOver = dragOverCell === cellKey;

                          return (
                            <div
                              key={cellKey}
                              onDragOver={(e) => handleDragOver(e, cellKey)}
                              onDragLeave={handleDragLeave}
                              onDrop={() => handleDropOnDesk(cellKey)}
                              onClick={() => handleDeskClick(cellKey)}
                              className={`flex-shrink-0 w-12 h-12 sm:w-16 sm:h-16 rounded-lg border-2 transition-all flex flex-col items-center justify-center cursor-pointer select-none ${
                                student
                                  ? 'border-brand-400 bg-brand-50 text-brand-700 hover:bg-brand-100'
                                  : isDragOver
                                    ? 'border-brand-500 bg-brand-100 border-dashed'
                                    : 'border-gray-300 bg-gray-50 hover:border-brand-300 hover:bg-brand-50/30'
                              }`}
                              title={
                                student
                                  ? `${student.firstName} ${student.lastName} — click to unseat`
                                  : 'Empty desk — drop a student here'
                              }
                            >
                              {student ? (
                                <div
                                  draggable={!isTouch}
                                  onDragStart={(e) => handleDeskDragStart(e, student.studentId)}
                                  className="flex flex-col items-center w-full"
                                >
                                  {showPhotos && photos[student.studentId] ? (
                                    <img
                                      src={photos[student.studentId]}
                                      alt={`${student.firstName} ${student.lastName}`}
                                      className="w-8 h-8 sm:w-10 sm:h-10 rounded-full object-cover"
                                    />
                                  ) : (
                                    <span className="text-sm sm:text-base font-bold">
                                      {initials(student.firstName, student.lastName)}
                                    </span>
                                  )}
                                  <span className="text-[9px] sm:text-[10px] text-brand-600 truncate max-w-[40px] sm:max-w-[56px] text-center leading-tight">
                                    {student.firstName}
                                  </span>
                                </div>
                              ) : (
                                <Grid3X3 size={16} className="text-gray-300" />
                              )}
                            </div>
                          );
                        })}
                      </div>
                    );
                  })}
                </div>
              </>
            )}
          </div>

          {/* Unassigned students panel */}
          <div className="lg:w-64 flex-shrink-0">
            <div
              className={`rounded-xl border bg-gray-50/50 transition-colors ${
                dragOverPanel
                  ? 'border-brand-400 bg-brand-50/50 ring-1 ring-brand-300'
                  : 'border-gray-200'
              }`}
              onDragOver={(e) => { e.preventDefault(); setDragOverPanel(true); }}
              onDragLeave={() => setDragOverPanel(false)}
              onDrop={handleDropToUnseat}
            >
              <div className="px-3 py-2 border-b border-gray-200">
                <h3 className="text-xs font-semibold text-gray-700">
                  Unassigned ({unassigned.length})
                </h3>
              </div>
              <div className="p-2 max-h-[400px] overflow-y-auto space-y-1">
                {unassigned.length === 0 ? (
                  <p className="text-xs text-gray-400 text-center py-4">All students seated</p>
                ) : (
                  unassigned.map((s) => (
                    <div
                      key={s.studentId}
                      draggable={!isTouch}
                      onDragStart={() => handleDragStart(s.studentId)}
                      onClick={() => handleTapStudent(s.studentId)}
                      className={`flex items-center gap-2 px-2 py-1.5 rounded-lg text-sm transition-colors cursor-grab active:cursor-grabbing select-none ${
                        selectedStudent === s.studentId
                          ? 'bg-brand-100 border border-brand-400 text-brand-800'
                          : 'bg-white border border-gray-200 text-gray-700 hover:bg-gray-100'
                      }`}
                    >
                      {showPhotos && photos[s.studentId] ? (
                        <img
                          src={photos[s.studentId]}
                          alt={`${s.firstName} ${s.lastName}`}
                          className="flex-shrink-0 w-7 h-7 rounded-full object-cover"
                        />
                      ) : (
                        <span className="flex-shrink-0 w-7 h-7 rounded-full bg-brand-100 text-brand-700 text-xs font-bold flex items-center justify-center">
                          {initials(s.firstName, s.lastName)}
                        </span>
                      )}
                      <span className="truncate text-xs font-medium">
                        {s.firstName} {s.lastName}
                      </span>
                    </div>
                  ))
                )}
              </div>
            </div>

            {isTouch && (
              <p className="text-[10px] text-gray-400 mt-2 px-1">
                Tap a student, then tap an empty desk to place them. Tap a seated student to unseat.
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
    </div>
  );
}
