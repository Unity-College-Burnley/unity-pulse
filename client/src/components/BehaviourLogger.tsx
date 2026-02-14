// ============================================================
// Behaviour logger — quick form for staff to log behaviour
// events. Select class → student → category → points → note.
// ============================================================

import { useState, type FormEvent } from 'react';
import { CheckCircle, AlertCircle } from 'lucide-react';
import { api } from '../services/api';
import type { Student, ClassGroup } from '../types';

interface Props {
  classes: ClassGroup[];
}

const POSITIVE_CATEGORIES = [
  'Outstanding Classwork',
  'Excellent Homework',
  'Helping Others',
  'Active Participation',
  'Great Effort',
  'Positive Attitude',
];

const NEGATIVE_CATEGORIES = [
  'Late to Lesson',
  'Incomplete Homework',
  'Disruption',
  'Off Task',
  'Uniform Issue',
  'Equipment Missing',
];

export default function BehaviourLogger({ classes }: Props) {
  const [selectedClassId, setSelectedClassId] = useState('');
  const [classStudents, setClassStudents] = useState<Student[]>([]);
  const [selectedStudentId, setSelectedStudentId] = useState('');
  const [type, setType] = useState<'positive' | 'negative'>('positive');
  const [category, setCategory] = useState('');
  const [points, setPoints] = useState(1);
  const [note, setNote] = useState('');
  const [status, setStatus] = useState<'idle' | 'saving' | 'success' | 'error'>('idle');
  const [errorMsg, setErrorMsg] = useState('');

  // When a class is selected, fetch its students
  async function handleClassChange(classId: string) {
    setSelectedClassId(classId);
    setSelectedStudentId('');
    if (!classId) {
      setClassStudents([]);
      return;
    }
    try {
      const res = await api.get<{ data: Student[] }>(`/staff/classes/${classId}/students`);
      setClassStudents(res.data);
    } catch {
      setClassStudents([]);
    }
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setStatus('saving');
    setErrorMsg('');

    try {
      await api.post('/staff/behaviour', {
        studentId: selectedStudentId,
        type,
        category,
        points,
        note,
      });
      setStatus('success');
      // Reset form after success
      setSelectedStudentId('');
      setCategory('');
      setPoints(1);
      setNote('');
      // Clear success message after a few seconds
      setTimeout(() => setStatus('idle'), 3000);
    } catch (err) {
      setStatus('error');
      setErrorMsg(err instanceof Error ? err.message : 'Failed to save');
    }
  }

  const categories = type === 'positive' ? POSITIVE_CATEGORIES : NEGATIVE_CATEGORIES;

  return (
    <section className="bg-white rounded-xl shadow-sm border border-gray-200 p-5">
      <h2 className="text-base font-semibold text-gray-900 mb-4">Log Behaviour</h2>

      <form onSubmit={handleSubmit} className="space-y-3">
        {/* Type toggle */}
        <div className="flex rounded-lg bg-gray-100 p-0.5">
          <button
            type="button"
            onClick={() => { setType('positive'); setCategory(''); }}
            className={`flex-1 px-3 py-1.5 text-sm font-medium rounded-md transition-colors ${
              type === 'positive' ? 'bg-green-500 text-white shadow-sm' : 'text-gray-600 hover:text-gray-800'
            }`}
          >
            Positive
          </button>
          <button
            type="button"
            onClick={() => { setType('negative'); setCategory(''); }}
            className={`flex-1 px-3 py-1.5 text-sm font-medium rounded-md transition-colors ${
              type === 'negative' ? 'bg-red-500 text-white shadow-sm' : 'text-gray-600 hover:text-gray-800'
            }`}
          >
            Negative
          </button>
        </div>

        {/* Class selector */}
        <div>
          <label htmlFor="beh-class" className="block text-sm font-medium text-gray-700 mb-1">Class</label>
          <select
            id="beh-class"
            value={selectedClassId}
            onChange={(e) => handleClassChange(e.target.value)}
            required
            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent"
          >
            <option value="">Select a class…</option>
            {classes.map((c) => (
              <option key={c.id} value={c.id}>{c.name} (Year {c.yearGroup})</option>
            ))}
          </select>
        </div>

        {/* Student selector */}
        <div>
          <label htmlFor="beh-student" className="block text-sm font-medium text-gray-700 mb-1">Student</label>
          <select
            id="beh-student"
            value={selectedStudentId}
            onChange={(e) => setSelectedStudentId(e.target.value)}
            required
            disabled={classStudents.length === 0}
            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent disabled:bg-gray-50 disabled:text-gray-400"
          >
            <option value="">Select a student…</option>
            {classStudents.map((s) => (
              <option key={s.id} value={s.id}>{s.lastName}, {s.firstName}</option>
            ))}
          </select>
        </div>

        {/* Category */}
        <div>
          <label htmlFor="beh-category" className="block text-sm font-medium text-gray-700 mb-1">Category</label>
          <select
            id="beh-category"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            required
            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent"
          >
            <option value="">Select a category…</option>
            {categories.map((cat) => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>
        </div>

        {/* Points */}
        <div>
          <label htmlFor="beh-points" className="block text-sm font-medium text-gray-700 mb-1">Points</label>
          <input
            id="beh-points"
            type="number"
            min={1}
            max={5}
            value={points}
            onChange={(e) => setPoints(Number(e.target.value))}
            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent"
          />
        </div>

        {/* Note */}
        <div>
          <label htmlFor="beh-note" className="block text-sm font-medium text-gray-700 mb-1">Note</label>
          <textarea
            id="beh-note"
            value={note}
            onChange={(e) => setNote(e.target.value)}
            required
            rows={2}
            placeholder="Brief description…"
            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent resize-none"
          />
        </div>

        {/* Status messages */}
        {status === 'success' && (
          <div className="flex items-center gap-2 rounded-lg bg-green-50 border border-green-200 text-green-700 text-sm px-3 py-2">
            <CheckCircle size={16} /> Behaviour logged successfully.
          </div>
        )}
        {status === 'error' && (
          <div className="flex items-center gap-2 rounded-lg bg-red-50 border border-red-200 text-red-700 text-sm px-3 py-2">
            <AlertCircle size={16} /> {errorMsg}
          </div>
        )}

        {/* Submit */}
        <button
          type="submit"
          disabled={status === 'saving'}
          className={`w-full font-medium rounded-lg px-4 py-2.5 text-sm transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${
            type === 'positive'
              ? 'bg-green-600 hover:bg-green-700 text-white'
              : 'bg-red-600 hover:bg-red-700 text-white'
          }`}
        >
          {status === 'saving' ? 'Saving…' : `Log ${type} behaviour`}
        </button>
      </form>
    </section>
  );
}
