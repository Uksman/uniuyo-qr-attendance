import { FormEvent, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { registerStudent } from "../api";
import { useAuth } from "../auth";
import { UniuyoLogo } from "../components/UniuyoLogo";
import { AlertTriangleIcon } from "../components/Icons";

export function RegisterPage() {
  const navigate = useNavigate();
  const { setSessionState } = useAuth();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [studentId, setStudentId] = useState("");
  const [programme, setProgramme] = useState("Computer Science");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  async function onSubmit(event: FormEvent) {
    event.preventDefault();
    setError("");
    setBusy(true);

    try {
      const result = await registerStudent({
        name,
        email,
        studentId,
        programme,
        password,
      });
      setSessionState(result.token, result.user);
      navigate("/scan", { replace: true });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Registration failed");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-[#0B0F17] px-4 py-10 text-white selection:bg-[#00C853] selection:text-black">
      <div className="w-full max-w-[440px] space-y-5">
        {/* Crest */}
        <div className="flex flex-col items-center text-center">
          <UniuyoLogo className="h-20 w-20 shadow-2xl drop-shadow-[0_0_20px_rgba(0,200,83,0.3)] transition hover:scale-105" />
        </div>

        {/* Register Card */}
        <div className="rounded-2xl border border-[#21262D] bg-[#161B22] p-8 shadow-2xl backdrop-blur-md">
          <div className="text-center">
            <h1 className="text-2xl font-bold tracking-tight text-white">Create Student Account</h1>
            <p className="mt-1 text-xs text-[#8B949E]">
              Enter your matriculation & student details below to register
            </p>
          </div>

          {error && (
            <div className="mt-4 flex items-center justify-center gap-2 rounded-xl border border-red-500/30 bg-red-950/40 p-3 text-xs font-semibold text-red-400 text-center">
              <AlertTriangleIcon className="h-4 w-4 shrink-0 text-red-400" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={onSubmit} className="mt-6 space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300">
                Full Name
              </label>
              <input
                className="mt-1.5 w-full rounded-lg border border-[#30363D] bg-[#21262D] px-3.5 py-2.5 text-sm text-white placeholder-[#6E7681] transition focus:border-[#00C853] focus:outline-none focus:ring-1 focus:ring-[#00C853]"
                type="text"
                placeholder="e.g. Samuel Okon"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300">
                Institutional Email
              </label>
              <input
                className="mt-1.5 w-full rounded-lg border border-[#30363D] bg-[#21262D] px-3.5 py-2.5 text-sm text-white placeholder-[#6E7681] transition focus:border-[#00C853] focus:outline-none focus:ring-1 focus:ring-[#00C853]"
                type="email"
                placeholder="student@uniuyo.edu.ng"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-300">
                  Matric / Reg No
                </label>
                <input
                  className="mt-1.5 w-full rounded-lg border border-[#30363D] bg-[#21262D] px-3.5 py-2.5 text-sm text-white placeholder-[#6E7681] transition focus:border-[#00C853] focus:outline-none focus:ring-1 focus:ring-[#00C853]"
                  type="text"
                  placeholder="21/SC/CO/001"
                  value={studentId}
                  onChange={(e) => setStudentId(e.target.value)}
                  required
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-300">
                  Programme
                </label>
                <input
                  className="mt-1.5 w-full rounded-lg border border-[#30363D] bg-[#21262D] px-3.5 py-2.5 text-sm text-white placeholder-[#6E7681] transition focus:border-[#00C853] focus:outline-none focus:ring-1 focus:ring-[#00C853]"
                  type="text"
                  placeholder="Computer Science"
                  value={programme}
                  onChange={(e) => setProgramme(e.target.value)}
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300">
                Password
              </label>
              <input
                className="mt-1.5 w-full rounded-lg border border-[#30363D] bg-[#21262D] px-3.5 py-2.5 text-sm text-white placeholder-[#6E7681] transition focus:border-[#00C853] focus:outline-none focus:ring-1 focus:ring-[#00C853]"
                type="password"
                placeholder="Minimum 6 characters"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>

            <button
              type="submit"
              disabled={busy}
              className="mt-4 w-full rounded-lg bg-[#00C853] py-3 text-sm font-bold text-white shadow-lg shadow-[#00C853]/20 transition hover:bg-[#00A859] active:scale-[0.99] disabled:opacity-60"
            >
              {busy ? "Registering…" : "Register Student Account"}
            </button>

            <div className="mt-6 border-t border-[#21262D] pt-4 text-center text-xs text-[#8B949E]">
              Already registered?{" "}
              <Link to="/login" className="font-bold text-[#F97316] hover:underline">
                Sign in here
              </Link>
            </div>
          </form>
        </div>

        <p className="text-center text-[11px] text-[#6E7681]">
          Official Portal of the University of Uyo, Akwa Ibom State, Nigeria
        </p>
      </div>
    </div>
  );
}
