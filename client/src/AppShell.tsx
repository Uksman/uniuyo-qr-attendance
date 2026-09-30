import { useEffect, useState } from "react";
import { Link, NavLink, Outlet, useNavigate } from "react-router-dom";
import { useAuth } from "./auth";
import { UniuyoLogo } from "./components/UniuyoLogo";

export function AppShell() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [isOnline, setIsOnline] = useState(navigator.onLine);

  useEffect(() => {
    function handleBeforeInstallPrompt(e: Event) {
      e.preventDefault();
      setDeferredPrompt(e);
    }
    function handleOnline() {
      setIsOnline(true);
    }
    function handleOffline() {
      setIsOnline(false);
    }

    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    return () => {
      window.removeEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  async function handleInstallApp() {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === "accepted") {
      setDeferredPrompt(null);
    }
  }

  const portalTitle =
    user?.role === "lecturer"
      ? "Lecturer Portal"
      : user?.role === "admin"
      ? "Staff Portal"
      : "Student Portal";

  return (
    <div className="flex min-h-screen flex-col bg-[#F3F4F6] text-slate-900 pb-20 sm:pb-0">
      {/* Offline Alert Banner */}
      {!isOnline && (
        <div className="bg-amber-500 py-1.5 px-4 text-center text-xs font-bold text-white shadow-md">
          ⚠️ You are currently offline. Scans will sync when internet re-connects.
        </div>
      )}

      {/* UNIUYO Portal Clean Navbar */}
      <header className="sticky top-0 z-50 bg-white border-b border-slate-200 shadow-sm">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-3">
          {/* Logo & Brand Title */}
          <Link
            to={user?.role === "student" ? "/scan" : "/session"}
            className="flex items-center gap-3 transition hover:opacity-90"
          >
            <UniuyoLogo className="h-10 w-10 sm:h-11 sm:w-11" />
            <div className="flex items-center gap-1.5 text-lg sm:text-xl font-black tracking-tight text-slate-900">
              <span>UNIUYO</span>
              <span className="text-[#00A859]">{portalTitle}</span>
            </div>
          </Link>

          {/* Desktop Nav Items */}
          <div className="flex items-center gap-4 text-xs sm:text-sm font-semibold text-slate-700">
            {user?.role !== "student" && (
              <div className="hidden sm:flex items-center gap-3">
                <NavLink
                  to="/session"
                  className={({ isActive }) =>
                    `px-3 py-1.5 rounded-lg transition font-bold ${
                      isActive
                        ? "bg-[#00A859]/10 text-[#00A859]"
                        : "text-slate-800 hover:bg-slate-100"
                    }`
                  }
                >
                  📱 QR Session
                </NavLink>
                <NavLink
                  to="/reports"
                  className={({ isActive }) =>
                    `px-3 py-1.5 rounded-lg transition font-bold ${
                      isActive
                        ? "bg-[#00A859]/10 text-[#00A859]"
                        : "text-slate-800 hover:bg-slate-100"
                    }`
                  }
                >
                  📊 Attendance Reports
                </NavLink>
              </div>
            )}

            {user?.role === "student" && (
              <NavLink
                to="/scan"
                className={({ isActive }) =>
                  `hidden sm:inline px-3 py-1.5 rounded-lg transition font-bold ${
                    isActive
                      ? "bg-[#00A859]/10 text-[#00A859]"
                      : "text-slate-800 hover:bg-slate-100"
                  }`
                }
              >
                🎓 Attendance Scanner
              </NavLink>
            )}

            {/* Install PWA Prompt Button */}
            {deferredPrompt && (
              <button
                type="button"
                onClick={handleInstallApp}
                className="hidden md:flex items-center gap-1.5 rounded-full bg-[#00A859]/10 border border-[#00A859]/30 px-3 py-1 text-xs font-bold text-[#00A859] transition hover:bg-[#00A859] hover:text-white"
              >
                <span>📲 Install App</span>
              </button>
            )}

            {/* Profile / Logout Pill Button */}
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2 rounded-full bg-[#00A859] px-4 py-1.5 text-white font-bold shadow-md shadow-[#00A859]/20 text-xs sm:text-sm">
                <div className="h-2 w-2 rounded-full bg-white animate-pulse" />
                <span>{user?.name}</span>
                {user?.name?.toLowerCase() !== user?.role?.toLowerCase() && (
                  <span className="rounded-md bg-black/20 px-2 py-0.5 text-[10px] font-extrabold uppercase text-emerald-100">
                    {user?.role}
                  </span>
                )}
              </div>

              <button
                type="button"
                onClick={() => {
                  logout();
                  navigate("/login");
                }}
                className="rounded-full border border-slate-300 bg-white px-3.5 py-1.5 text-xs font-bold text-slate-700 transition hover:bg-slate-100"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 mx-auto w-full max-w-6xl px-4 py-6 sm:py-10">
        <Outlet />
      </main>

      {/* Mobile Web App Bottom Navigation Bar (Appears on Mobile Screens) */}
      <nav className="sm:hidden fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-slate-200 px-6 py-2 flex items-center justify-around shadow-[0_-4px_16px_rgba(0,0,0,0.06)]">
        {user?.role === "student" ? (
          <>
            <NavLink
              to="/scan"
              className={({ isActive }) =>
                `flex flex-col items-center gap-1 text-[11px] font-bold transition ${
                  isActive ? "text-[#00A859]" : "text-slate-500"
                }`
              }
            >
              <span className="text-lg">🎓</span>
              <span>Scanner</span>
            </NavLink>
            <NavLink
              to="/reports"
              className={({ isActive }) =>
                `flex flex-col items-center gap-1 text-[11px] font-bold transition ${
                  isActive ? "text-[#00A859]" : "text-slate-500"
                }`
              }
            >
              <span className="text-lg">📊</span>
              <span>Reports</span>
            </NavLink>
          </>
        ) : (
          <>
            <NavLink
              to="/session"
              className={({ isActive }) =>
                `flex flex-col items-center gap-1 text-[11px] font-bold transition ${
                  isActive ? "text-[#00A859]" : "text-slate-500"
                }`
              }
            >
              <span className="text-lg">📱</span>
              <span>QR Session</span>
            </NavLink>
            <NavLink
              to="/reports"
              className={({ isActive }) =>
                `flex flex-col items-center gap-1 text-[11px] font-bold transition ${
                  isActive ? "text-[#00A859]" : "text-slate-500"
                }`
              }
            >
              <span className="text-lg">📊</span>
              <span>Reports</span>
            </NavLink>
          </>
        )}
        <button
          type="button"
          onClick={() => {
            logout();
            navigate("/login");
          }}
          className="flex flex-col items-center gap-1 text-[11px] font-bold text-slate-500 transition hover:text-red-600"
        >
          <span className="text-lg">🚪</span>
          <span>Logout</span>
        </button>
      </nav>

      {/* UNIUYO Official Footer */}
      <footer className="hidden sm:block border-t border-slate-200 bg-white py-6 text-slate-600 text-xs shadow-inner">
        <div className="mx-auto max-w-6xl px-4 flex flex-col sm:flex-row items-center justify-between gap-3 text-center sm:text-left">
          <div className="flex items-center gap-3">
            <UniuyoLogo className="h-8 w-8" />
            <div>
              <p className="font-bold text-slate-900">University of Uyo, Akwa Ibom State, Nigeria</p>
              <p className="text-[11px] text-slate-500">Official Student & Staff Attendance Portal Hub</p>
            </div>
          </div>
          <div className="text-right">
            <p className="font-bold text-[#00A859]">Motto: Unity, Learning and Service</p>
            <p className="text-[11px] text-slate-400">© {new Date().getFullYear()} UNIUYO Portal. All Rights Reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
