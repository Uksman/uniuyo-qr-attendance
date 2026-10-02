import { useEffect, useState } from "react";
import { Link, NavLink, Outlet, useNavigate } from "react-router-dom";
import { useAuth } from "./auth";
import { UniuyoLogo } from "./components/UniuyoLogo";
import {
  ScanIcon,
  QrCodeIcon,
  ChartBarIcon,
  LogoutIcon,
  InstallAppIcon,
  AlertTriangleIcon,
} from "./components/Icons";

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
        <div className="flex items-center justify-center gap-2 bg-amber-500 py-1.5 px-4 text-center text-xs font-bold text-white shadow-md">
          <AlertTriangleIcon className="h-4 w-4" />
          <span>You are currently offline. Scans will sync when internet re-connects.</span>
        </div>
      )}

      {/* UNIUYO Portal Clean Navbar */}
      <header className="sticky top-0 z-50 bg-white border-b border-slate-200/90 shadow-xs">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-2 sm:gap-4 px-3 sm:px-4 py-2.5 sm:py-3">
          {/* Logo & Brand Title */}
          <Link
            to={user?.role === "student" ? "/scan" : "/session"}
            className="flex items-center gap-2 sm:gap-3 transition hover:opacity-90 min-w-0"
          >
            <UniuyoLogo className="h-8 w-8 sm:h-10 sm:w-10 shrink-0" />
            <div className="flex flex-col sm:flex-row sm:items-center sm:gap-1.5 leading-tight min-w-0">
              <span className="text-sm sm:text-lg font-black tracking-tight text-slate-900">UNIUYO</span>
              <span className="text-xs sm:text-base font-bold text-[#00A859] truncate">{portalTitle}</span>
            </div>
          </Link>

          {/* Nav Items & Profile */}
          <div className="flex items-center gap-2 sm:gap-4 text-xs sm:text-sm font-semibold text-slate-700 shrink-0">
            {/* Desktop Nav Items */}
            {user?.role !== "student" && (
              <div className="hidden sm:flex items-center gap-2">
                <NavLink
                  to="/session"
                  className={({ isActive }) =>
                    `flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition font-bold ${
                      isActive
                        ? "bg-[#00A859]/10 text-[#00A859]"
                        : "text-slate-700 hover:bg-slate-100"
                    }`
                  }
                >
                  <QrCodeIcon className="h-4 w-4" />
                  <span>QR Session</span>
                </NavLink>
                <NavLink
                  to="/reports"
                  className={({ isActive }) =>
                    `flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition font-bold ${
                      isActive
                        ? "bg-[#00A859]/10 text-[#00A859]"
                        : "text-slate-700 hover:bg-slate-100"
                    }`
                  }
                >
                  <ChartBarIcon className="h-4 w-4" />
                  <span>Reports</span>
                </NavLink>
              </div>
            )}

            {user?.role === "student" && (
              <NavLink
                to="/scan"
                className={({ isActive }) =>
                  `hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition font-bold ${
                    isActive
                      ? "bg-[#00A859]/10 text-[#00A859]"
                      : "text-slate-700 hover:bg-slate-100"
                  }`
                }
              >
                <ScanIcon className="h-4 w-4" />
                <span>Attendance Scanner</span>
              </NavLink>
            )}

            {/* Install PWA Prompt Button */}
            {deferredPrompt && (
              <button
                type="button"
                onClick={handleInstallApp}
                className="hidden md:flex items-center gap-1.5 rounded-full bg-[#00A859]/10 border border-[#00A859]/30 px-3 py-1 text-xs font-bold text-[#00A859] transition hover:bg-[#00A859] hover:text-white"
              >
                <InstallAppIcon className="h-3.5 w-3.5" />
                <span>Install App</span>
              </button>
            )}

            {/* Profile Badge */}
            <div className="flex items-center gap-1.5 sm:gap-2 rounded-full bg-emerald-50 border border-emerald-200/80 px-2.5 sm:px-3 py-1 sm:py-1.5 text-slate-800 font-bold text-xs shadow-xs">
              <div className="h-2 w-2 rounded-full bg-[#00A859] shrink-0 animate-pulse" />
              <span className="max-w-[85px] sm:max-w-[140px] truncate text-slate-900">{user?.name}</span>
              <span className="rounded bg-[#00A859] px-1.5 py-0.5 text-[9px] sm:text-[10px] font-extrabold uppercase text-white tracking-wider">
                {user?.role}
              </span>
            </div>

            {/* Desktop Logout Button (Hidden on Mobile because Mobile has bottom nav logout) */}
            <button
              type="button"
              onClick={() => {
                logout();
                navigate("/login");
              }}
              className="hidden sm:flex items-center gap-1.5 rounded-full border border-slate-300 bg-white px-3.5 py-1.5 text-xs font-bold text-slate-700 transition hover:bg-slate-100 hover:text-red-600 shadow-xs"
            >
              <LogoutIcon className="h-3.5 w-3.5" />
              <span>Logout</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 mx-auto w-full max-w-6xl px-3 sm:px-4 py-4 sm:py-8">
        <Outlet />
      </main>

      {/* Mobile Web App Bottom Navigation Bar */}
      <nav className="sm:hidden fixed bottom-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-md border-t border-slate-200/80 px-6 py-2.5 flex items-center justify-around shadow-[0_-4px_20px_rgba(0,0,0,0.06)]">
        {user?.role === "student" ? (
          <NavLink
            to="/scan"
            className={({ isActive }) =>
              `flex flex-col items-center gap-1 text-[11px] font-bold transition ${
                isActive ? "text-[#00A859]" : "text-slate-500 hover:text-slate-700"
              }`
            }
          >
            <ScanIcon className="h-5 w-5" />
            <span>Scanner</span>
          </NavLink>
        ) : (
          <>
            <NavLink
              to="/session"
              className={({ isActive }) =>
                `flex flex-col items-center gap-1 text-[11px] font-bold transition ${
                  isActive ? "text-[#00A859]" : "text-slate-500 hover:text-slate-700"
                }`
              }
            >
              <QrCodeIcon className="h-5 w-5" />
              <span>QR Session</span>
            </NavLink>
            <NavLink
              to="/reports"
              className={({ isActive }) =>
                `flex flex-col items-center gap-1 text-[11px] font-bold transition ${
                  isActive ? "text-[#00A859]" : "text-slate-500 hover:text-slate-700"
                }`
              }
            >
              <ChartBarIcon className="h-5 w-5" />
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
          <LogoutIcon className="h-5 w-5" />
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
