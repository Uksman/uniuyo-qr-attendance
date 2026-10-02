import { useEffect, useMemo, useState } from "react";
import { QRCodeSVG } from "qrcode.react";
import { fetchCourses, startSession, type Course, type SessionPayload } from "../api";
import { AlertTriangleIcon, QrCodeIcon } from "../components/Icons";

function remainingLabel(expiresAt: string) {
  const ms = new Date(expiresAt).getTime() - Date.now();
  if (ms <= 0) {
    return "Expired";
  }
  const total = Math.ceil(ms / 1000);
  const minutes = Math.floor(total / 60);
  const seconds = total % 60;
  return `${minutes}:${String(seconds).padStart(2, "0")} remaining`;
}

export function LecturerSessionPage() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [courseCode, setCourseCode] = useState("");
  const [session, setSession] = useState<SessionPayload | null>(null);
  const [now, setNow] = useState(Date.now());
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    fetchCourses()
      .then((list) => {
        setCourses(list);
        if (list[0]) {
          setCourseCode(list[0].courseCode);
        }
      })
      .catch((err: unknown) => {
        setError(err instanceof Error ? err.message : "Could not load courses");
      });
  }, []);

  useEffect(() => {
    const id = window.setInterval(() => setNow(Date.now()), 1000);
    return () => window.clearInterval(id);
  }, []);

  const expired = useMemo(() => {
    if (!session) {
      return false;
    }
    return new Date(session.expiresAt).getTime() <= now;
  }, [session, now]);

  async function createSession() {
    if (!courseCode) {
      setError("Select a course first");
      return;
    }
    setBusy(true);
    setError("");
    try {
      const next = await startSession(courseCode);
      setSession(next);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not start session");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_1.2fr]">
      {/* Controls Card - UNIUYO Portal Hub Aesthetic */}
      <section className="relative overflow-hidden rounded-2xl border border-slate-200 bg-white p-7 shadow-lg">
        {/* Emerald Top Accent Line */}
        <div className="absolute top-0 left-0 right-0 h-1.5 bg-[#00A859]" />

        <div className="flex items-center gap-3.5">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#00A859]/10 text-[#00A859] border border-[#00A859]/20 shadow-xs">
            <QrCodeIcon className="h-6 w-6" />
          </div>
          <div>
            <h1 className="text-xl font-extrabold text-slate-900 tracking-wide">
              LECTURER PORTAL HUB
            </h1>
            <p className="text-xs font-bold text-[#00A859]">Dynamic QR Attendance Session</p>
          </div>
        </div>

        <p className="mt-4 text-xs text-slate-600 leading-relaxed">
          Select an assigned UNIUYO course to broadcast a dynamic live QR code for student attendance. The QR code automatically updates and expires in 5 minutes.
        </p>

        {error && (
          <div className="mt-4 flex items-center gap-2 rounded-xl border border-red-200 bg-red-50 p-3.5 text-xs font-semibold text-red-700">
            <AlertTriangleIcon className="h-4 w-4 text-red-600 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <div className="mt-6 space-y-4">
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-[#053E17]">
              Select Course
            </label>
            <select
              className="mt-1.5 w-full rounded-xl border border-slate-300 bg-slate-50 px-3.5 py-3 text-sm font-semibold text-slate-900 transition focus:border-[#00A859] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#00A859]/20"
              value={courseCode}
              onChange={(e) => setCourseCode(e.target.value)}
            >
              {courses.length === 0 && <option value="">No courses assigned</option>}
              {courses.map((course) => (
                <option key={course.id} value={course.courseCode}>
                  {course.courseCode} — {course.title}
                </option>
              ))}
            </select>
          </div>

          <button
            type="button"
            onClick={createSession}
            disabled={busy || !courseCode}
            className="w-full rounded-xl bg-[#00A859] px-4 py-3.5 font-bold uppercase tracking-wider text-white shadow-lg shadow-[#00A859]/25 transition hover:bg-[#058648] active:scale-[0.99] disabled:opacity-60"
          >
            {busy ? "Generating…" : session ? "Generate New QR Code" : "Start Session & Display QR"}
          </button>
        </div>
      </section>

      {/* QR Code Display Card */}
      <section className="relative overflow-hidden flex flex-col items-center justify-center rounded-2xl border border-slate-200 bg-white p-8 shadow-lg min-h-[380px]">
        {/* Emerald Accent Line */}
        <div className="absolute top-0 left-0 right-0 h-1.5 bg-[#00A859]" />

        {!session && (
          <div className="text-center">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-slate-50 border border-slate-200 text-slate-400">
              <svg className="h-8 w-8 text-[#00A859]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z" />
              </svg>
            </div>
            <p className="mt-3 text-sm font-medium text-slate-600">
              Select a course and click start session to broadcast the UNIUYO live QR code.
            </p>
          </div>
        )}

        {session && (
          <div className="flex flex-col items-center text-center">
            <div className="inline-flex items-center gap-2 rounded-full border border-emerald-200 bg-emerald-50 px-4 py-1.5 text-xs font-bold text-[#053E17]">
              <span>{session.courseCode}</span>
              <span>•</span>
              <span>{session.courseTitle}</span>
            </div>

            <div className={`mt-3 inline-flex items-center gap-2 rounded-lg px-3.5 py-1 text-xs font-bold uppercase tracking-wider ${
              expired ? "bg-amber-50 text-amber-800 border border-amber-200" : "bg-emerald-50 text-emerald-800 border border-emerald-200"
            }`}>
              <div className={`h-2.5 w-2.5 rounded-full ${expired ? "bg-amber-600" : "bg-[#00A859] animate-ping"}`} />
              {remainingLabel(session.expiresAt)}
            </div>

            <div className={`mt-6 rounded-2xl bg-white p-4 border-4 border-[#00A859] shadow-xl transition-all ${expired ? "opacity-25 grayscale" : ""}`}>
              <QRCodeSVG value={session.signedToken} size={240} marginSize={2} />
            </div>

            {expired && (
              <p className="mt-4 text-xs font-bold text-amber-700">
                This UNIUYO QR token has expired. Click button above to refresh.
              </p>
            )}
          </div>
        )}
      </section>
    </div>
  );
}
