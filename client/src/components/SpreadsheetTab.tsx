// ============================================================
// SpreadsheetTab — simple class spreadsheet for recording marks,
// book checks, etc. Multiple named sheets per class group.
// Persisted to localStorage.
// ============================================================

import { useState, useEffect, useCallback, useRef } from 'react';
import { Plus, Trash2, PenLine, Check, X, FileSpreadsheet } from 'lucide-react';

// --------------- Types ---------------
interface SpreadsheetColumn {
  id: string;
  label: string;
}

interface SpreadsheetData {
  id: string;
  name: string;
  columns: SpreadsheetColumn[];
  cells: Record<string, Record<string, string>>; // studentId → { columnId → value }
  createdAt: string;
}

interface Props {
  classGroupId: string;
  classGroupName: string;
  students: { studentId: string; firstName: string; lastName: string }[];
}

// --------------- localStorage ---------------
const STORAGE_KEY = 'unity-pulse-spreadsheets';

function loadAllSheets(): Record<string, SpreadsheetData[]> {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}');
  } catch {
    return {};
  }
}

function saveAllSheets(all: Record<string, SpreadsheetData[]>) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(all));
}

function loadSheets(classGroupId: string): SpreadsheetData[] {
  return loadAllSheets()[classGroupId] || [];
}

function persistSheets(classGroupId: string, sheets: SpreadsheetData[]) {
  const all = loadAllSheets();
  all[classGroupId] = sheets;
  saveAllSheets(all);
}

function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
}

// ============================================================
// Component
// ============================================================
export default function SpreadsheetTab({ classGroupId, classGroupName, students }: Props) {
  const sorted = [...students].sort((a, b) => a.lastName.localeCompare(b.lastName));

  const [sheets, setSheets] = useState<SpreadsheetData[]>([]);
  const [activeSheetId, setActiveSheetId] = useState<string | null>(null);
  const [showNewSheet, setShowNewSheet] = useState(false);
  const [newSheetName, setNewSheetName] = useState('');

  // Column editing
  const [editingColId, setEditingColId] = useState<string | null>(null);
  const [editingColLabel, setEditingColLabel] = useState('');
  const editColRef = useRef<HTMLInputElement>(null);

  // Cell refs for keyboard navigation (row × col)
  const cellRefs = useRef<(HTMLInputElement | null)[][]>([]);

  // Load on mount
  useEffect(() => {
    const loaded = loadSheets(classGroupId);
    setSheets(loaded);
    if (loaded.length > 0) {
      setActiveSheetId(loaded[0].id);
    }
  }, [classGroupId]);

  // Focus column rename input
  useEffect(() => {
    if (editingColId) editColRef.current?.focus();
  }, [editingColId]);

  const persist = useCallback(
    (updated: SpreadsheetData[]) => {
      setSheets(updated);
      persistSheets(classGroupId, updated);
    },
    [classGroupId]
  );

  const activeSheet = sheets.find((s) => s.id === activeSheetId) || null;

  // ---- Sheet CRUD ----
  function createSheet() {
    const name = newSheetName.trim() || 'Untitled';
    const sheet: SpreadsheetData = {
      id: generateId(),
      name,
      columns: [{ id: generateId(), label: 'Column 1' }],
      cells: {},
      createdAt: new Date().toISOString(),
    };
    const updated = [sheet, ...sheets];
    persist(updated);
    setActiveSheetId(sheet.id);
    setNewSheetName('');
    setShowNewSheet(false);
  }

  function deleteSheet(sheetId: string) {
    const updated = sheets.filter((s) => s.id !== sheetId);
    persist(updated);
    if (activeSheetId === sheetId) {
      setActiveSheetId(updated.length > 0 ? updated[0].id : null);
    }
  }

  // ---- Column CRUD ----
  function addColumn() {
    if (!activeSheet) return;
    const newCol: SpreadsheetColumn = { id: generateId(), label: `Column ${activeSheet.columns.length + 1}` };
    const updated = sheets.map((s) =>
      s.id === activeSheet.id ? { ...s, columns: [...s.columns, newCol] } : s
    );
    persist(updated);
  }

  function renameColumn(colId: string, label: string) {
    if (!activeSheet) return;
    const updated = sheets.map((s) =>
      s.id === activeSheet.id
        ? { ...s, columns: s.columns.map((c) => (c.id === colId ? { ...c, label: label || c.label } : c)) }
        : s
    );
    persist(updated);
    setEditingColId(null);
  }

  function deleteColumn(colId: string) {
    if (!activeSheet) return;
    const updated = sheets.map((s) => {
      if (s.id !== activeSheet.id) return s;
      const cells = { ...s.cells };
      for (const sid of Object.keys(cells)) {
        const row = { ...cells[sid] };
        delete row[colId];
        cells[sid] = row;
      }
      return { ...s, columns: s.columns.filter((c) => c.id !== colId), cells };
    });
    persist(updated);
  }

  // ---- Cell editing ----
  function updateCell(studentId: string, colId: string, value: string) {
    if (!activeSheet) return;
    const updated = sheets.map((s) => {
      if (s.id !== activeSheet.id) return s;
      const cells = { ...s.cells };
      const row = { ...(cells[studentId] || {}) };
      row[colId] = value;
      cells[studentId] = row;
      return { ...s, cells };
    });
    persist(updated);
  }

  // ---- Keyboard navigation ----
  function handleCellKeyDown(e: React.KeyboardEvent<HTMLInputElement>, rowIdx: number, colIdx: number) {
    if (!activeSheet) return;
    const input = e.currentTarget;
    const totalRows = sorted.length;
    const totalCols = activeSheet.columns.length;

    if (e.key === 'ArrowDown' || e.key === 'Enter') {
      e.preventDefault();
      if (rowIdx + 1 < totalRows) cellRefs.current[rowIdx + 1]?.[colIdx]?.focus();
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      if (rowIdx > 0) cellRefs.current[rowIdx - 1]?.[colIdx]?.focus();
    } else if (e.key === 'ArrowRight' && input.selectionStart === input.value.length) {
      e.preventDefault();
      if (colIdx + 1 < totalCols) {
        cellRefs.current[rowIdx]?.[colIdx + 1]?.focus();
      } else if (rowIdx + 1 < totalRows) {
        cellRefs.current[rowIdx + 1]?.[0]?.focus();
      }
    } else if (e.key === 'ArrowLeft' && input.selectionStart === 0) {
      e.preventDefault();
      if (colIdx > 0) {
        cellRefs.current[rowIdx]?.[colIdx - 1]?.focus();
      } else if (rowIdx > 0) {
        cellRefs.current[rowIdx - 1]?.[totalCols - 1]?.focus();
      }
    }
  }

  // ============================================================
  // RENDER
  // ============================================================

  // No sheets yet
  if (sheets.length === 0 && !showNewSheet) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
        <FileSpreadsheet size={32} className="mx-auto text-gray-300 mb-3" />
        <p className="text-gray-500 text-sm mb-4">No spreadsheets yet for {classGroupName}.</p>
        <button
          onClick={() => setShowNewSheet(true)}
          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium
                     bg-brand-600 hover:bg-brand-700 text-white transition-colors"
        >
          <Plus size={14} />
          New Spreadsheet
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {/* Sheet selector bar */}
      <div className="flex flex-wrap items-center gap-2">
        {sheets.map((sheet) => (
          <div key={sheet.id} className="flex items-center">
            <button
              onClick={() => setActiveSheetId(sheet.id)}
              className={`px-3 py-1.5 text-xs font-medium rounded-l-lg border transition-colors ${
                activeSheetId === sheet.id
                  ? 'bg-brand-600 text-white border-brand-600'
                  : 'bg-white text-gray-600 border-gray-300 hover:bg-gray-50'
              }`}
            >
              {sheet.name}
            </button>
            <button
              onClick={() => {
                if (window.confirm(`Delete "${sheet.name}"?`)) deleteSheet(sheet.id);
              }}
              className={`px-1.5 py-1.5 text-xs rounded-r-lg border border-l-0 transition-colors ${
                activeSheetId === sheet.id
                  ? 'bg-brand-700 text-brand-200 border-brand-600 hover:bg-brand-800'
                  : 'bg-white text-gray-400 border-gray-300 hover:text-red-500 hover:bg-red-50'
              }`}
              title="Delete spreadsheet"
            >
              <X size={12} />
            </button>
          </div>
        ))}

        {showNewSheet ? (
          <form
            onSubmit={(e) => { e.preventDefault(); createSheet(); }}
            className="flex items-center gap-1"
          >
            <input
              autoFocus
              type="text"
              value={newSheetName}
              onChange={(e) => setNewSheetName(e.target.value)}
              placeholder="Sheet name…"
              className="w-36 px-2 py-1.5 text-xs rounded-lg border border-gray-300
                         focus:outline-none focus:ring-2 focus:ring-brand-400 focus:border-transparent"
            />
            <button
              type="submit"
              className="p-1.5 rounded-lg bg-emerald-500 hover:bg-emerald-600 text-white transition-colors"
            >
              <Check size={12} />
            </button>
            <button
              type="button"
              onClick={() => { setShowNewSheet(false); setNewSheetName(''); }}
              className="p-1.5 rounded-lg text-gray-400 hover:bg-gray-100 transition-colors"
            >
              <X size={12} />
            </button>
          </form>
        ) : (
          <button
            onClick={() => setShowNewSheet(true)}
            className="flex items-center gap-1 px-2.5 py-1.5 text-xs font-medium rounded-lg
                       border border-dashed border-gray-300 text-gray-500
                       hover:border-brand-400 hover:text-brand-600 transition-colors"
          >
            <Plus size={12} />
            New
          </button>
        )}
      </div>

      {/* Spreadsheet grid */}
      {activeSheet && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-sm">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-200">
                  <th className="px-3 py-2 text-left text-xs font-semibold text-gray-700 w-48 sticky left-0 bg-gray-50 z-10 border-r border-gray-200">
                    Student
                  </th>
                  {activeSheet.columns.map((col) => (
                    <th
                      key={col.id}
                      className="px-2 py-2 text-center text-xs font-semibold text-gray-700 min-w-[120px] group"
                    >
                      {editingColId === col.id ? (
                        <form
                          onSubmit={(e) => { e.preventDefault(); renameColumn(col.id, editingColLabel); }}
                          className="flex items-center gap-1"
                        >
                          <input
                            ref={editColRef}
                            type="text"
                            value={editingColLabel}
                            onChange={(e) => setEditingColLabel(e.target.value)}
                            onBlur={() => renameColumn(col.id, editingColLabel)}
                            className="w-full px-1.5 py-0.5 text-xs rounded border border-brand-300
                                       focus:outline-none focus:ring-1 focus:ring-brand-400 text-center"
                          />
                        </form>
                      ) : (
                        <div className="flex items-center justify-center gap-1">
                          <span className="truncate">{col.label}</span>
                          <div className="hidden group-hover:flex items-center gap-0.5 flex-shrink-0">
                            <button
                              onClick={() => { setEditingColId(col.id); setEditingColLabel(col.label); }}
                              className="p-0.5 rounded text-gray-400 hover:text-brand-600"
                              title="Rename column"
                            >
                              <PenLine size={10} />
                            </button>
                            <button
                              onClick={() => {
                                if (activeSheet.columns.length === 1) return;
                                deleteColumn(col.id);
                              }}
                              className="p-0.5 rounded text-gray-400 hover:text-red-500"
                              title={activeSheet.columns.length === 1 ? 'Cannot delete last column' : 'Delete column'}
                            >
                              <Trash2 size={10} />
                            </button>
                          </div>
                        </div>
                      )}
                    </th>
                  ))}
                  <th className="px-2 py-2 w-10">
                    <button
                      onClick={addColumn}
                      className="p-1 rounded-md text-gray-400 hover:text-brand-600 hover:bg-brand-50 transition-colors"
                      title="Add column"
                    >
                      <Plus size={14} />
                    </button>
                  </th>
                </tr>
              </thead>
              <tbody>
                {sorted.map((student, rowIdx) => (
                  <tr
                    key={student.studentId}
                    className={`border-b border-gray-50 last:border-0 ${rowIdx % 2 === 1 ? 'bg-gray-50/30' : ''}`}
                  >
                    <td className="px-3 py-1.5 sticky left-0 bg-white z-10 border-r border-gray-100">
                      <span className="font-medium text-gray-900 text-xs">{student.lastName}</span>
                      <span className="text-gray-500 text-xs">, {student.firstName}</span>
                    </td>
                    {activeSheet.columns.map((col, colIdx) => (
                      <td key={col.id} className="px-1 py-0.5">
                        <input
                          ref={(el) => {
                            if (!cellRefs.current[rowIdx]) cellRefs.current[rowIdx] = [];
                            cellRefs.current[rowIdx][colIdx] = el;
                          }}
                          type="text"
                          value={activeSheet.cells[student.studentId]?.[col.id] || ''}
                          onChange={(e) => updateCell(student.studentId, col.id, e.target.value)}
                          onKeyDown={(e) => handleCellKeyDown(e, rowIdx, colIdx)}
                          className="w-full px-2 py-1.5 text-xs text-center rounded border border-transparent
                                     hover:border-gray-200 focus:border-brand-300 focus:outline-none
                                     focus:ring-1 focus:ring-brand-300 transition-colors"
                        />
                      </td>
                    ))}
                    <td />
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Footer */}
          <div className="flex items-center justify-between px-3 py-2 border-t border-gray-100 bg-gray-50/50">
            <span className="text-[10px] text-gray-400">
              {sorted.length} students · {activeSheet.columns.length} column{activeSheet.columns.length !== 1 ? 's' : ''}
            </span>
            <span className="text-[10px] text-emerald-600 flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
              Auto-saved
            </span>
          </div>
        </div>
      )}
    </div>
  );
}
