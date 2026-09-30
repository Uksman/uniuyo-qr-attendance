import { Navigate, Route, Routes } from "react-router-dom";
import { useAuth } from "./auth";
import { ProtectedRoute } from "./ProtectedRoute";
import { AppShell } from "./AppShell";
import { LoginPage } from "./pages/LoginPage";
import { LecturerSessionPage } from "./pages/LecturerSessionPage";
import { StudentScanPage } from "./pages/StudentScanPage";

import { RegisterPage } from "./pages/RegisterPage";
import { ReportsPage } from "./pages/ReportsPage";

export function App() {
  const { user } = useAuth();
  const home = user?.role === "student" ? "/scan" : "/session";

  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route element={<ProtectedRoute />}>
        <Route element={<AppShell />}>
          <Route path="/" element={<Navigate to={home} replace />} />
          <Route element={<ProtectedRoute roles={["lecturer", "admin"]} />}>
            <Route path="/session" element={<LecturerSessionPage />} />
            <Route path="/reports" element={<ReportsPage />} />
          </Route>
          <Route element={<ProtectedRoute roles={["student"]} />}>
            <Route path="/scan" element={<StudentScanPage />} />
          </Route>
        </Route>
      </Route>
      <Route path="*" element={<Navigate to={user ? home : "/login"} replace />} />
    </Routes>
  );
}
