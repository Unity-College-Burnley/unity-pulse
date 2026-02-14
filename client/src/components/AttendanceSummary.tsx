// ============================================================
// Attendance summary card — shows today's status, overall
// percentage, and a compact breakdown.
// ============================================================

import { CheckCircle, XCircle, Clock } from 'lucide-react';
import type { AttendanceSummary as AttendanceData } from '../types';

interface Props {
  data: AttendanceData;
}

export default function AttendanceSummary({ data }: Props) {
  // Colour the percentage based on thresholds
  const pctColour =
    data.overallPercentage >= 96
      ? 'text-green-600'
      : data.overallPercentage >= 90
        ? 'text-amber-600'
        : 'text-red-600';

  return (
    <section className="bg-white rounded-xl shadow-sm border border-gray-200 p-5">
      <h2 className="text-base font-semibold text-gray-900 mb-4">Attendance</h2>

      {/* Today's status */}
      <div className="flex items-center gap-2 mb-4">
        {data.presentToday ? (
          <>
            <CheckCircle className="text-green-500" size={20} />
            <span className="text-sm font-medium text-green-700">Present today</span>
          </>
        ) : (
          <>
            <XCircle className="text-red-500" size={20} />
            <span className="text-sm font-medium text-red-700">Absent today</span>
          </>
        )}
      </div>

      {/* Overall percentage — large and prominent */}
      <div className="text-center py-3 mb-4 rounded-lg bg-gray-50">
        <p className={`text-3xl font-bold ${pctColour}`}>{data.overallPercentage}%</p>
        <p className="text-xs text-gray-500 mt-1">Overall attendance</p>
      </div>

      {/* Breakdown */}
      <div className="grid grid-cols-3 gap-3 text-center text-sm">
        <div>
          <p className="font-semibold text-gray-900">{data.presentDays}</p>
          <p className="text-xs text-gray-500">Present</p>
        </div>
        <div>
          <p className="font-semibold text-gray-900">{data.absentDays}</p>
          <p className="text-xs text-gray-500">Absent</p>
        </div>
        <div>
          <p className="font-semibold text-gray-900">{data.lateDays}</p>
          <p className="text-xs text-gray-500">Late</p>
        </div>
      </div>

      {/* Recent records */}
      <div className="mt-4 pt-4 border-t border-gray-100">
        <h3 className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-2">
          Recent
        </h3>
        <ul className="space-y-1.5">
          {/* Show one entry per day (AM session) for the last 5 school days */}
          {data.recentRecords
            .filter((r) => r.session === 'AM')
            .slice(0, 5)
            .map((record, i) => (
              <li key={i} className="flex items-center justify-between text-sm">
                <span className="text-gray-600">{record.date}</span>
                <span className="flex items-center gap-1.5">
                  {record.code === 'Present' && (
                    <CheckCircle className="text-green-500" size={14} />
                  )}
                  {record.code === 'Late' && (
                    <Clock className="text-amber-500" size={14} />
                  )}
                  {record.code.includes('Absence') && (
                    <XCircle className="text-red-500" size={14} />
                  )}
                  <span className="text-gray-700">{record.code}</span>
                </span>
              </li>
            ))}
        </ul>
      </div>
    </section>
  );
}
