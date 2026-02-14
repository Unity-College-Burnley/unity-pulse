// ============================================================
// Student search page — search students by name, view results
// as cards with attendance badges. Staff/admin only.
// ============================================================

import { useEffect, useState, type FormEvent } from 'react';
import { useSearchParams, useNavigate, Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import { Search, ArrowLeft, UserCircle } from 'lucide-react';
import type { Student } from '../types';

interface SearchResult extends Student {
  overallPercentage: number | null;
  presentToday: boolean | null;
}

export default function StudentSearch() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  const initialQuery = searchParams.get('q') || '';
  const [query, setQuery] = useState(initialQuery);
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);

  // Redirect parents away
  if (user?.role === 'parent') {
    return <Navigate to="/dashboard" replace />;
  }

  // Fetch results when URL param changes
  useEffect(() => {
    const q = searchParams.get('q') || '';
    if (!q.trim()) {
      setResults([]);
      setSearched(false);
      return;
    }

    async function search() {
      setLoading(true);
      try {
        const res = await api.get<{ data: SearchResult[] }>(
          `/students?q=${encodeURIComponent(q)}`
        );
        setResults(res.data);
      } catch {
        setResults([]);
      } finally {
        setLoading(false);
        setSearched(true);
      }
    }
    search();
  }, [searchParams]);

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (query.trim()) {
      setSearchParams({ q: query.trim() });
    }
  }

  function pctColour(pct: number | null): string {
    if (pct === null) return 'bg-gray-100 text-gray-500';
    if (pct >= 96) return 'bg-emerald-100 text-emerald-700';
    if (pct >= 90) return 'bg-amber-100 text-amber-700';
    return 'bg-red-100 text-red-700';
  }

  return (
    <div>
      {/* Header */}
      <div className="flex items-center gap-3 mb-5">
        <button
          onClick={() => navigate('/dashboard')}
          className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-500 transition-colors"
          aria-label="Back to dashboard"
        >
          <ArrowLeft size={18} />
        </button>
        <h1 className="text-xl font-bold text-gray-900">Student Search</h1>
      </div>

      {/* Search form */}
      <form onSubmit={handleSubmit} className="mb-5">
        <div className="relative max-w-md">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search by student name..."
            autoFocus
            className="w-full pl-9 pr-4 py-2.5 text-sm rounded-lg border border-gray-300
                       focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent"
          />
        </div>
      </form>

      {/* Results */}
      {loading ? (
        <div className="flex items-center justify-center py-16">
          <div className="animate-spin rounded-full h-8 w-8 border-2 border-brand-500 border-t-transparent" />
        </div>
      ) : searched && results.length === 0 ? (
        <div className="text-center py-16">
          <p className="text-gray-400 text-sm">No students found</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {results.map((student) => (
            <button
              key={student.id}
              onClick={() => navigate(`/student/${student.id}`)}
              className="flex items-center gap-3 bg-white rounded-xl shadow-sm border border-gray-200
                         p-4 text-left hover:border-brand-300 hover:shadow-md transition-all"
            >
              <div className="flex items-center justify-center w-10 h-10 rounded-full bg-brand-50 text-brand-500 flex-shrink-0">
                <UserCircle size={24} />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-gray-900">
                  {student.firstName} {student.lastName}
                </p>
                <p className="text-xs text-gray-500">
                  Year {student.yearGroup} &middot; {student.formGroup}
                </p>
              </div>
              {student.overallPercentage !== null && (
                <span
                  className={`px-2 py-1 rounded-full text-xs font-semibold ${pctColour(
                    student.overallPercentage
                  )}`}
                >
                  {student.overallPercentage}%
                </span>
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
