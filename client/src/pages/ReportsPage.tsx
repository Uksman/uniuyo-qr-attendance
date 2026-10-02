import { useEffect, useState } from "react";
import { fetchLowAttendanceAlerts, fetchReportSummary, type LowAttendanceAlert, type ReportCourse } from "../api";
import { PrinterIcon, AlertTriangleIcon } from "../components/Icons";

export function ReportsPage() {
  const [courses, setCourses] = useState<ReportCourse[]>([]);
  const [alerts, setAlerts] = useState<LowAttendanceAlert[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    Promise.all([fetchReportSummary(), fetchLowAttendanceAlerts()])
      .then(([rep, alt]) => {
        setCourses(rep.report);
        setAlerts(alt.alerts);
      })
      .catch((err) => {
        setError(err instanceof Error ? err.message : "Failed to load reports");
      })
      .finally(() => setLoading(false));
  }, []);

  function handlePrint() {
    window.print();
  }

  if (loading) {
    return (
      <div className="py-12 text-center text-sm font-semibold text-slate-500">
        Generating official UNIUYO attendance reports…
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header bar with Print button */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-200 pb-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 uppercase tracking-wide">
            ATTENDANCE REPORTS & ANALYTICS
          </h1>
          <p className="text-xs font-bold text-[#00A859]">
            University of Uyo Directorate of ICT · Course Attendance Records
          </p>
        </div>
        <button
          type="button"
          onClick={handlePrint}
          className="print:hidden rounded-xl bg-[#00A859] px-5 py-2.5 text-xs font-bold uppercase tracking-wider text-white shadow-md shadow-[#00A859]/20 transition hover:bg-[#058648] active:scale-95 flex items-center gap-2"
        >
          <PrinterIcon className="h-4 w-4" />
          <span>Print / Export PDF Report</span>
        </button>
      </div>

      {error && (
        <div className="flex items-center gap-2 rounded-xl border border-red-200 bg-red-50 p-4 text-xs font-semibold text-red-700">
          <AlertTriangleIcon className="h-4 w-4 text-red-600 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Low Attendance Alert Section */}
      {alerts.length > 0 && (
        <section className="rounded-2xl border-2 border-amber-300 bg-amber-50/50 p-5 shadow-sm">
          <div className="flex items-center gap-2 text-amber-900 font-extrabold text-sm uppercase">
            <AlertTriangleIcon className="h-4 w-4 text-amber-700 shrink-0" />
            <span>SYSTEM LOW-ATTENDANCE ALERTS (&lt; 75% ATTENDANCE RATE)</span>
          </div>
          <p className="mt-1 text-xs text-amber-800">
            The following students have missed significant class sessions and require administrative warnings.
          </p>
          <div className="mt-4 overflow-x-auto rounded-xl border border-amber-200 bg-white">
            <table className="w-full text-left text-xs">
              <thead className="bg-amber-100/60 text-amber-950 font-bold uppercase tracking-wider">
                <tr>
                  <th className="px-4 py-2.5">Matric No</th>
                  <th className="px-4 py-2.5">Student Name</th>
                  <th className="px-4 py-2.5">Programme</th>
                  <th className="px-4 py-2.5">Attended / Total</th>
                  <th className="px-4 py-2.5">Rate</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-amber-100 text-slate-800">
                {alerts.map((al) => (
                  <tr key={al.studentDbId} className="hover:bg-amber-50/40">
                    <td className="px-4 py-2.5 font-bold text-amber-900">{al.studentId}</td>
                    <td className="px-4 py-2.5 font-semibold">{al.studentName}</td>
                    <td className="px-4 py-2.5 text-slate-600">{al.programme}</td>
                    <td className="px-4 py-2.5">
                      {al.sessionsAttended} / {al.totalSessions} sessions
                    </td>
                    <td className="px-4 py-2.5 font-bold text-amber-700">
                      {al.attendancePercentage}%
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      )}

      {/* Course Attendance Reports */}
      <div className="space-y-6">
        {courses.map((c) => (
          <section key={c.courseId} className="relative overflow-hidden rounded-2xl border border-slate-200 bg-white p-6 shadow-md">
            {/* Emerald Accent Bar */}
            <div className="absolute top-0 left-0 right-0 h-1.5 bg-[#00A859]" />

            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
              <div>
                <h2 className="text-lg font-bold text-slate-900">
                  {c.courseCode} — {c.title}
                </h2>
                <p className="text-xs text-slate-500">Lecturer: <span className="font-semibold text-slate-700">{c.lecturerName}</span></p>
              </div>
              <div className="flex items-center gap-3">
                <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-bold text-slate-700">
                  {c.totalSessions} Sessions
                </span>
                <span className="rounded-full bg-emerald-50 border border-emerald-200 px-3 py-1 text-xs font-bold text-emerald-800">
                  {c.totalAttendanceRecorded} Attendance Logs
                </span>
              </div>
            </div>

            {c.recentSessions.length === 0 ? (
              <p className="py-6 text-center text-xs text-slate-400">
                No active attendance sessions recorded yet for this course.
              </p>
            ) : (
              <div className="mt-4 space-y-4">
                {c.recentSessions.map((s, idx) => (
                  <div key={s.sessionId} className="rounded-xl border border-slate-100 bg-slate-50 p-4">
                    <div className="flex items-center justify-between text-xs font-bold text-slate-700">
                      <span>Session #{c.recentSessions.length - idx}</span>
                      <span className="text-slate-500 font-normal">
                        Date: {new Date(s.createdAt).toLocaleString()}
                      </span>
                    </div>

                    <div className="mt-3 overflow-x-auto rounded-lg border border-slate-200 bg-white">
                      <table className="w-full text-left text-xs">
                        <thead className="bg-slate-100 text-slate-700 font-bold uppercase tracking-wider">
                          <tr>
                            <th className="px-3 py-2">Reg / Student ID</th>
                            <th className="px-3 py-2">Student Name</th>
                            <th className="px-3 py-2">Timestamp</th>
                            <th className="px-3 py-2">Status</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                          {s.attendees.length === 0 ? (
                            <tr>
                              <td colSpan={4} className="px-3 py-3 text-center text-slate-400">
                                No student scans recorded during this session window.
                              </td>
                            </tr>
                          ) : (
                            s.attendees.map((att, i) => (
                              <tr key={i}>
                                <td className="px-3 py-2 font-bold text-slate-900">{att.studentId}</td>
                                <td className="px-3 py-2 font-medium">{att.studentName}</td>
                                <td className="px-3 py-2 text-slate-500">
                                  {new Date(att.timestamp).toLocaleTimeString()}
                                </td>
                                <td className="px-3 py-2 font-bold text-[#00A859] uppercase">
                                  ✓ {att.status}
                                </td>
                              </tr>
                            ))
                          )}
                        </tbody>
                      </table>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>
        ))}
      </div>
    </div>
  );
}
