export type Role = "admin" | "lecturer" | "student";

export type User = {
  id: string;
  email: string;
  name: string;
  role: Role;
};

export type Course = {
  id: string;
  courseCode: string;
  title: string;
};

export type SessionPayload = {
  sessionId: string;
  courseCode: string;
  courseTitle: string;
  signedToken: string;
  expiresAt: string;
};

const TOKEN_KEY = "qr_attendance_token";
const USER_KEY = "qr_attendance_user";

export function getStoredToken(): string | null {
  return localStorage.getItem(TOKEN_KEY);
}

export function getStoredUser(): User | null {
  const raw = localStorage.getItem(USER_KEY);
  if (!raw) {
    return null;
  }
  try {
    return JSON.parse(raw) as User;
  } catch {
    return null;
  }
}

export function storeSession(token: string, user: User) {
  localStorage.setItem(TOKEN_KEY, token);
  localStorage.setItem(USER_KEY, JSON.stringify(user));
}

export function clearSession() {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(USER_KEY);
}

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const token = getStoredToken();
  const headers = new Headers(options.headers);
  headers.set("Content-Type", "application/json");
  if (token) {
    headers.set("Authorization", `Bearer ${token}`);
  }

  const response = await fetch(path, { ...options, headers });
  const data = (await response.json().catch(() => ({}))) as T & { error?: string };

  if (!response.ok) {
    throw new Error(data.error || "Request failed");
  }

  return data;
}

export function login(email: string, password: string) {
  return request<{ token: string; user: User }>("/api/auth/login", {
    method: "POST",
    body: JSON.stringify({ email, password }),
  });
}

export function fetchMe() {
  return request<User>("/api/auth/me");
}

export function fetchCourses() {
  return request<Course[]>("/api/courses");
}

export function startSession(courseCode: string, ttlSeconds?: number) {
  return request<SessionPayload>("/api/sessions", {
    method: "POST",
    body: JSON.stringify({ courseCode, ttlSeconds }),
  });
}

export function scanToken(token: string) {
  return request<{
    attendanceId: string;
    sessionId: string;
    courseCode: string;
    status: string;
    timestamp: string;
  }>("/api/attendance/scan", {
    method: "POST",
    body: JSON.stringify({ token }),
  });
}

export function registerStudent(params: {
  name: string;
  email: string;
  studentId: string;
  programme: string;
  password: string;
}) {
  return request<{ token: string; user: User }>("/api/auth/register", {
    method: "POST",
    body: JSON.stringify(params),
  });
}

export type ReportCourse = {
  courseId: string;
  courseCode: string;
  title: string;
  lecturerName: string;
  totalSessions: number;
  totalAttendanceRecorded: number;
  recentSessions: {
    sessionId: string;
    createdAt: string;
    expiresAt: string;
    attendanceCount: number;
    attendees: {
      studentId: string;
      studentName: string;
      timestamp: string;
      status: string;
    }[];
  }[];
};

export function fetchReportSummary() {
  return request<{ report: ReportCourse[] }>("/api/reports/summary");
}

export type LowAttendanceAlert = {
  studentDbId: string;
  studentId: string;
  studentName: string;
  email: string;
  programme: string;
  sessionsAttended: number;
  totalSessions: number;
  attendancePercentage: number;
  isLowAttendance: boolean;
};

export function fetchLowAttendanceAlerts() {
  return request<{ alerts: LowAttendanceAlert[] }>("/api/reports/alerts");
}
