import { FormEvent, useState } from "react";
import { Link, Navigate, useNavigate } from "react-router-dom";
import { useAuth } from "../auth";
import { UniuyoLogo } from "../components/UniuyoLogo";

export function LoginPage() {
  const { user, login } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(false);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  if (user) {
    return <Navigate to={user.role === "student" ? "/scan" : "/session"} replace />;
  }

  async function onSubmit(event: FormEvent) {
    event.preventDefault();
    setError("");
    setBusy(true);
    try {
      const next = await login(email, password);
      navigate(next.role === "student" ? "/scan" : "/session", { replace: true });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Login failed");
    } finally {
      setBusy(false);
    }
  }

  function quickFill(demoEmail: string) {
    setEmail(demoEmail);
    setPassword("Password123!");
    setError("");
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-[#0B0F17] px-4 py-10 text-white selection:bg-[#00C853] selection:text-black">
      <div className="w-full max-w-[420px] space-y-5">
        {/* UNIUYO Official Crest Centered Header */}
        <div className="flex flex-col items-center text-center">
          <UniuyoLogo className="h-20 w-20 shadow-2xl drop-shadow-[0_0_20px_rgba(0,200,83,0.3)] transition hover:scale-105" />
          <h2 className="mt-3 text-xs font-bold uppercase tracking-widest text-[#00C853]">
            UNIVERSITY OF UYO
          </h2>
          <p className="text-[11px] text-[#8B949E]">Official QR Attendance Portal</p>
        </div>

        {/* Login Dark Card - UNIUYO Dark Theme */}
        <div className="rounded-2xl border border-[#21262D] bg-[#161B22] p-8 shadow-2xl backdrop-blur-md">
          <div className="text-center">
            <h1 className="text-2xl font-bold tracking-tight text-white">Log in to your account</h1>
            <p className="mt-1 text-xs text-[#8B949E]">
              Enter your email/regno and password below to log in
            </p>
          </div>

          {error && (
            <div className="mt-4 rounded-xl border border-red-500/30 bg-red-950/40 p-3 text-xs font-semibold text-red-400 text-center">
              ⚠️ {error}
            </div>
          )}

          {/* Form */}
          <form onSubmit={onSubmit} className="mt-6 space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300">
                Email, Username or Phone number
              </label>
              <input
                className="mt-1.5 w-full rounded-lg border border-[#30363D] bg-[#21262D] px-3.5 py-2.5 text-sm text-white placeholder-[#6E7681] transition focus:border-[#00C853] focus:outline-none focus:ring-1 focus:ring-[#00C853]"
                type="email"
                placeholder="Enter email or username or phone number"
                autoComplete="username"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            <div>
              <div className="flex items-center justify-between">
                <label className="block text-xs font-semibold text-slate-300">Password</label>
                <a
                  href="#forgot"
                  onClick={(e) => {
                    e.preventDefault();
                    alert("Password reset request sent to UNIUYO ICT Support.");
                  }}
                  className="text-xs font-medium text-[#00C853] hover:underline"
                >
                  Forgot your password?
                </a>
              </div>
              <input
                className="mt-1.5 w-full rounded-lg border border-[#30363D] bg-[#21262D] px-3.5 py-2.5 text-sm text-white placeholder-[#6E7681] transition focus:border-[#00C853] focus:outline-none focus:ring-1 focus:ring-[#00C853]"
                type="password"
                placeholder="Password"
                autoComplete="current-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>

            <div className="flex items-center gap-2 pt-1">
              <input
                type="checkbox"
                id="remember"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                className="h-4 w-4 rounded border-[#30363D] bg-[#21262D] text-[#00C853] focus:ring-[#00C853]"
              />
              <label htmlFor="remember" className="text-xs text-[#8B949E]">
                Remember me
              </label>
            </div>

            <button
              type="submit"
              disabled={busy}
              className="mt-4 w-full rounded-lg bg-[#00C853] py-3 text-sm font-bold text-white shadow-lg shadow-[#00C853]/20 transition hover:bg-[#00A859] active:scale-[0.99] disabled:opacity-60"
            >
              {busy ? "Authenticating…" : "Log in"}
            </button>

            {/* UNIUYO Custom Footer Prompt */}
            <div className="mt-6 border-t border-[#21262D] pt-4 text-center text-xs text-[#8B949E]">
              <p>Don't have a student account?</p>
              <div className="mt-1.5 flex items-center justify-center gap-3">
                <Link to="/register" className="font-bold text-[#F97316] hover:underline">
                  Create Student Account
                </Link>
                <span className="text-[#30363D]">|</span>
                <button
                  type="button"
                  onClick={() => alert("Contact UNIUYO ICT Unit for portal assistance.")}
                  className="font-bold text-[#F97316] hover:underline"
                >
                  ICT Support
                </button>
              </div>
            </div>
          </form>
        </div>

        {/* Demo Fast Fill Buttons */}
        <div className="rounded-xl border border-[#21262D] bg-[#161B22]/80 p-3.5 text-center">
          <p className="text-[11px] font-semibold uppercase tracking-wider text-[#8B949E]">
            ⚡ Quick Demo Fill Buttons
          </p>
          <div className="mt-2.5 flex flex-wrap gap-2 justify-center">
            <button
              type="button"
              onClick={() => quickFill("lecturer@example.com")}
              className="rounded-md border border-[#30363D] bg-[#21262D] px-3 py-1 text-xs font-semibold text-white transition hover:border-[#00C853] hover:text-[#00C853]"
            >
              👨‍🏫 Lecturer
            </button>
            <button
              type="button"
              onClick={() => quickFill("student@example.com")}
              className="rounded-md border border-[#30363D] bg-[#21262D] px-3 py-1 text-xs font-semibold text-white transition hover:border-[#00C853] hover:text-[#00C853]"
            >
              🎓 Student
            </button>
            <button
              type="button"
              onClick={() => quickFill("admin@example.com")}
              className="rounded-md border border-[#30363D] bg-[#21262D] px-3 py-1 text-xs font-semibold text-white transition hover:border-[#F97316] hover:text-[#F97316]"
            >
              ⚡ Admin
            </button>
          </div>
        </div>

        <p className="text-center text-[11px] text-[#6E7681]">
          Official Portal of the University of Uyo, Akwa Ibom State, Nigeria
        </p>
      </div>
    </div>
  );
}
