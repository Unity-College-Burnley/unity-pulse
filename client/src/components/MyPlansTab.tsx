// ============================================================
// MyPlansTab — SEND plans overview for a class
// Shows pen portraits, MyPlans, and EHCPs at a glance so
// teachers can quickly see what support students need.
// ============================================================

import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../services/api';
import { ChevronDown, ChevronUp, FileText, Shield, BookOpen, Target, CheckCircle2 } from 'lucide-react';
import type { StudentPlan } from '../types';

interface Props {
  classGroupId: string;
  classGroupName: string;
  students: Array<{ studentId: string; firstName: string; lastName: string }>;
}

const PROGRESS_COLORS: Record<string, string> = {
  'not started': 'bg-gray-100 text-gray-600',
  'emerging': 'bg-amber-50 text-amber-700',
  'developing': 'bg-blue-50 text-blue-700',
  'achieved': 'bg-emerald-50 text-emerald-700',
};

export default function MyPlansTab({ classGroupId, classGroupName, students }: Props) {
  const [plans, setPlans] = useState<StudentPlan[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({});

  useEffect(() => {
    api.get<{ data: StudentPlan[] }>(`/send/class/${classGroupId}`)
      .then((res) => setPlans(res.data))
      .finally(() => setLoading(false));
  }, [classGroupId]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-16">
        <div className="animate-spin rounded-full h-8 w-8 border-2 border-brand-500 border-t-transparent" />
      </div>
    );
  }

  // Enrich plans with student names, sort EHCP first, then MyPlan, then pen portrait only
  const enriched = plans
    .map((plan) => {
      const student = students.find((s) => s.studentId === plan.studentId);
      return {
        ...plan,
        firstName: student?.firstName ?? 'Unknown',
        lastName: student?.lastName ?? 'Unknown',
        sortOrder: plan.ehcp ? 0 : plan.myPlan ? 1 : 2,
      };
    })
    .sort((a, b) => a.sortOrder - b.sortOrder || a.lastName.localeCompare(b.lastName));

  const ehcpCount = plans.filter((p) => p.ehcp).length;
  const myPlanCount = plans.filter((p) => p.myPlan).length;
  const penPortraitCount = plans.filter((p) => p.penPortrait).length;
  const studentsWithPlans = plans.length;
  const studentsWithout = students.length - studentsWithPlans;

  function toggleSection(key: string) {
    setExpandedSections((prev) => ({ ...prev, [key]: !prev[key] }));
  }

  function isExpanded(key: string) {
    return expandedSections[key] ?? false;
  }

  return (
    <div className="space-y-4">
      {/* Summary cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 text-center">
          <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wide mb-1">EHCPs</p>
          <p className={`text-2xl font-bold ${ehcpCount > 0 ? 'text-red-600' : 'text-gray-300'}`}>
            {ehcpCount}
          </p>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 text-center">
          <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wide mb-1">MyPlans</p>
          <p className={`text-2xl font-bold ${myPlanCount > 0 ? 'text-blue-600' : 'text-gray-300'}`}>
            {myPlanCount}
          </p>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 text-center">
          <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wide mb-1">Pen Portraits</p>
          <p className={`text-2xl font-bold ${penPortraitCount > 0 ? 'text-brand-600' : 'text-gray-300'}`}>
            {penPortraitCount}
          </p>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 text-center">
          <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wide mb-1">No Plan</p>
          <p className="text-2xl font-bold text-gray-400">{studentsWithout}</p>
        </div>
      </div>

      {/* Student plan cards */}
      {enriched.length === 0 ? (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
          <p className="text-gray-400 text-sm">No students in this class have SEND plans on record.</p>
        </div>
      ) : (
        <div className="space-y-3">
          <div className="px-1">
            <p className="text-[10px] text-gray-400">
              {classGroupName} — {studentsWithPlans} student{studentsWithPlans !== 1 ? 's' : ''} with plans. EHCP students shown first.
            </p>
          </div>

          {enriched.map((plan) => (
            <div
              key={plan.studentId}
              className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden"
            >
              {/* Student header */}
              <div className="px-4 py-3 border-b border-gray-100 bg-gray-50 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Link
                    to={`/student/${plan.studentId}`}
                    className="text-sm font-semibold text-gray-900 hover:text-brand-600 transition-colors"
                  >
                    {plan.lastName}, {plan.firstName}
                  </Link>
                  <div className="flex gap-1.5">
                    {plan.ehcp && (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-red-100 text-red-700 uppercase tracking-wide">
                        <Shield size={10} /> EHCP
                      </span>
                    )}
                    {plan.myPlan && (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-100 text-blue-700 uppercase tracking-wide">
                        <Target size={10} /> MyPlan
                      </span>
                    )}
                    {plan.penPortrait && (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-brand-100 text-brand-700 uppercase tracking-wide">
                        <BookOpen size={10} /> Pen Portrait
                      </span>
                    )}
                  </div>
                </div>
              </div>

              <div className="divide-y divide-gray-50">
                {/* Pen Portrait — expanded by default */}
                {plan.penPortrait && (
                  <div className="px-4 py-3">
                    <p className="text-sm text-gray-700 leading-relaxed mb-3">
                      {plan.penPortrait.summary}
                    </p>
                    <div className="grid sm:grid-cols-3 gap-3">
                      <div>
                        <p className="text-[10px] font-semibold text-emerald-600 uppercase tracking-wide mb-1.5">Strengths</p>
                        <ul className="space-y-1">
                          {plan.penPortrait.strengths.map((s, i) => (
                            <li key={i} className="text-xs text-gray-600 flex gap-1.5">
                              <span className="text-emerald-400 mt-0.5 shrink-0">+</span>
                              <span>{s}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                      <div>
                        <p className="text-[10px] font-semibold text-red-600 uppercase tracking-wide mb-1.5">Difficulties</p>
                        <ul className="space-y-1">
                          {plan.penPortrait.difficulties.map((d, i) => (
                            <li key={i} className="text-xs text-gray-600 flex gap-1.5">
                              <span className="text-red-400 mt-0.5 shrink-0">-</span>
                              <span>{d}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                      <div>
                        <p className="text-[10px] font-semibold text-blue-600 uppercase tracking-wide mb-1.5">Key Strategies</p>
                        <ul className="space-y-1">
                          {plan.penPortrait.strategies.map((s, i) => (
                            <li key={i} className="text-xs text-gray-600 flex gap-1.5">
                              <span className="text-blue-400 mt-0.5 shrink-0">&rarr;</span>
                              <span>{s}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                    <p className="text-[10px] text-gray-300 mt-2">
                      Updated {new Date(plan.penPortrait.updatedAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
                    </p>
                  </div>
                )}

                {/* EHCP — collapsible */}
                {plan.ehcp && (
                  <div>
                    <button
                      onClick={() => toggleSection(`${plan.studentId}-ehcp`)}
                      className="w-full px-4 py-2.5 flex items-center justify-between hover:bg-gray-50 transition-colors"
                    >
                      <div className="flex items-center gap-2">
                        <Shield size={14} className="text-red-500" />
                        <span className="text-xs font-semibold text-gray-700">EHCP — Provisions & Adjustments</span>
                        <span className="text-[10px] text-gray-400">
                          Review: {new Date(plan.ehcp.annualReviewDate).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
                        </span>
                      </div>
                      {isExpanded(`${plan.studentId}-ehcp`) ? (
                        <ChevronUp size={14} className="text-gray-400" />
                      ) : (
                        <ChevronDown size={14} className="text-gray-400" />
                      )}
                    </button>
                    {isExpanded(`${plan.studentId}-ehcp`) && (
                      <div className="px-4 pb-3 space-y-3">
                        <div className="grid sm:grid-cols-2 gap-3">
                          <div>
                            <p className="text-[10px] font-semibold text-red-600 uppercase tracking-wide mb-1.5">Provisions</p>
                            <ul className="space-y-1">
                              {plan.ehcp.provisions.map((p, i) => (
                                <li key={i} className="text-xs text-gray-600 flex gap-1.5">
                                  <FileText size={10} className="text-red-300 mt-0.5 shrink-0" />
                                  <span>{p}</span>
                                </li>
                              ))}
                            </ul>
                          </div>
                          <div>
                            <p className="text-[10px] font-semibold text-amber-600 uppercase tracking-wide mb-1.5">Reasonable Adjustments</p>
                            <ul className="space-y-1">
                              {plan.ehcp.adjustments.map((a, i) => (
                                <li key={i} className="text-xs text-gray-600 flex gap-1.5">
                                  <CheckCircle2 size={10} className="text-amber-300 mt-0.5 shrink-0" />
                                  <span>{a}</span>
                                </li>
                              ))}
                            </ul>
                          </div>
                        </div>
                        <p className="text-[10px] text-gray-400">
                          Key worker: {plan.ehcp.keyWorker} · Updated {new Date(plan.ehcp.updatedAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
                        </p>
                      </div>
                    )}
                  </div>
                )}

                {/* MyPlan — collapsible */}
                {plan.myPlan && (
                  <div>
                    <button
                      onClick={() => toggleSection(`${plan.studentId}-myplan`)}
                      className="w-full px-4 py-2.5 flex items-center justify-between hover:bg-gray-50 transition-colors"
                    >
                      <div className="flex items-center gap-2">
                        <Target size={14} className="text-blue-500" />
                        <span className="text-xs font-semibold text-gray-700">MyPlan — Targets & Strategies</span>
                        <span className="text-[10px] text-gray-400">
                          Review: {new Date(plan.myPlan.reviewDate).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
                        </span>
                      </div>
                      {isExpanded(`${plan.studentId}-myplan`) ? (
                        <ChevronUp size={14} className="text-gray-400" />
                      ) : (
                        <ChevronDown size={14} className="text-gray-400" />
                      )}
                    </button>
                    {isExpanded(`${plan.studentId}-myplan`) && (
                      <div className="px-4 pb-3 space-y-3">
                        {plan.myPlan.targets.map((t, i) => (
                          <div key={i} className="bg-gray-50 rounded-lg p-3">
                            <div className="flex items-start justify-between gap-2 mb-2">
                              <p className="text-xs font-medium text-gray-800">{t.target}</p>
                              <span className={`shrink-0 inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wide ${PROGRESS_COLORS[t.progress]}`}>
                                {t.progress}
                              </span>
                            </div>
                            <ul className="space-y-0.5">
                              {t.strategies.map((s, j) => (
                                <li key={j} className="text-xs text-gray-500 flex gap-1.5">
                                  <span className="text-blue-400 mt-0.5 shrink-0">&rarr;</span>
                                  <span>{s}</span>
                                </li>
                              ))}
                            </ul>
                          </div>
                        ))}
                        <p className="text-[10px] text-gray-400">
                          Key worker: {plan.myPlan.keyWorker} · Updated {new Date(plan.myPlan.updatedAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
                        </p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
