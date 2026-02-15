// ============================================================
// PhotoGrid — student photo grid for the Register Photos tab
// Shows student photos or placeholder initials for learning names
// ============================================================

import { useState } from 'react';
import { Link } from 'react-router-dom';
import { User } from 'lucide-react';

interface StudentInfo {
  studentId: string;
  firstName: string;
  lastName: string;
  photo?: string;
}

interface Props {
  students: StudentInfo[];
  classGroupName: string;
}

// Stable colour palette based on student ID
const AVATAR_COLOURS = [
  'bg-brand-100 text-brand-700',
  'bg-blue-100 text-blue-700',
  'bg-emerald-100 text-emerald-700',
  'bg-amber-100 text-amber-700',
  'bg-rose-100 text-rose-700',
  'bg-purple-100 text-purple-700',
  'bg-teal-100 text-teal-700',
  'bg-orange-100 text-orange-700',
];

function colourForId(id: string): string {
  let hash = 0;
  for (let i = 0; i < id.length; i++) {
    hash = ((hash << 5) - hash + id.charCodeAt(i)) | 0;
  }
  return AVATAR_COLOURS[Math.abs(hash) % AVATAR_COLOURS.length];
}

function initials(firstName: string, lastName: string) {
  return `${firstName[0] || ''}${lastName[0] || ''}`.toUpperCase();
}

export default function PhotoGrid({ students, classGroupName }: Props) {
  const [size, setSize] = useState<'sm' | 'md' | 'lg'>('md');
  const sorted = [...students].sort((a, b) => a.lastName.localeCompare(b.lastName));

  const sizeClasses = {
    sm: 'w-16 h-16',
    md: 'w-24 h-24',
    lg: 'w-32 h-32',
  };

  const textClasses = {
    sm: 'text-lg',
    md: 'text-2xl',
    lg: 'text-3xl',
  };

  const nameClasses = {
    sm: 'text-[9px]',
    md: 'text-[11px]',
    lg: 'text-xs',
  };

  const iconSizes = { sm: 24, md: 36, lg: 48 };

  return (
    <div className="space-y-4">
      {/* Controls */}
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-gray-700">
          {classGroupName} — {sorted.length} students
        </h3>
        <div className="flex rounded-lg bg-gray-100 p-0.5" role="group" aria-label="Photo size">
          {(['sm', 'md', 'lg'] as const).map((s) => (
            <button
              key={s}
              onClick={() => setSize(s)}
              className={`px-2.5 py-1 text-xs font-medium rounded-md transition-colors ${
                size === s ? 'bg-white shadow-sm text-gray-900' : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              {s === 'sm' ? 'S' : s === 'md' ? 'M' : 'L'}
            </button>
          ))}
        </div>
      </div>

      {/* Photo grid */}
      <div className="flex flex-wrap gap-3">
        {sorted.map((student) => (
          <Link
            key={student.studentId}
            to={`/student/${student.studentId}`}
            className="group flex flex-col items-center gap-1.5"
          >
            {student.photo ? (
              <img
                src={student.photo}
                alt={`${student.firstName} ${student.lastName}`}
                className={`${sizeClasses[size]} rounded-xl object-cover border-2 border-gray-200 group-hover:border-brand-400 transition-colors`}
              />
            ) : (
              <div
                className={`${sizeClasses[size]} rounded-xl border-2 border-gray-200 group-hover:border-brand-400 transition-colors flex items-center justify-center ${colourForId(student.studentId)}`}
              >
                {size === 'sm' ? (
                  <span className={`${textClasses[size]} font-bold`}>
                    {initials(student.firstName, student.lastName)}
                  </span>
                ) : (
                  <User size={iconSizes[size]} className="opacity-40" />
                )}
              </div>
            )}
            <div className="text-center">
              <p className={`${nameClasses[size]} font-medium text-gray-900 group-hover:text-brand-600 transition-colors leading-tight`}>
                {student.firstName}
              </p>
              <p className={`${nameClasses[size]} text-gray-500 leading-tight`}>
                {student.lastName}
              </p>
            </div>
          </Link>
        ))}
      </div>

      {/* No-photos hint */}
      {students.every((s) => !s.photo) && (
        <p className="text-xs text-gray-400 text-center mt-2">
          Student photos will appear here once they are uploaded to the system.
        </p>
      )}
    </div>
  );
}
