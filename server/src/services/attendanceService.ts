import { and, eq } from "drizzle-orm";
import { db } from "../db/index.js";
import {
  attendance,
  courses,
  enrollments,
  sessions,
  students,
} from "../db/schema.js";
import { env } from "../config/env.js";
import { QrTokenError, verifyQrToken } from "./qrToken.js";

export class AttendanceServiceError extends Error {
  constructor(
    message: string,
    public statusCode: number,
  ) {
    super(message);
    this.name = "AttendanceServiceError";
  }
}

export async function recordScan(params: {
  token: string;
  userId: string;
}) {
  let payload;
  try {
    payload = verifyQrToken(params.token, env.QR_SECRET);
  } catch (error) {
    if (error instanceof QrTokenError) {
      throw new AttendanceServiceError(error.message, 400);
    }
    throw error;
  }

  const session = await db.query.sessions.findFirst({
    where: eq(sessions.id, payload.sessionId),
  });

  if (!session) {
    throw new AttendanceServiceError("Session not found", 404);
  }

  if (session.signedToken !== params.token) {
    throw new AttendanceServiceError("QR token does not match this session", 400);
  }

  if (session.expiresAt.getTime() <= Date.now()) {
    throw new AttendanceServiceError("This attendance session has expired", 400);
  }

  const course = await db.query.courses.findFirst({
    where: eq(courses.id, session.courseId),
  });

  if (!course || course.courseCode !== payload.courseCode) {
    throw new AttendanceServiceError("Course mismatch for this session", 400);
  }

  const student = await db.query.students.findFirst({
    where: eq(students.userId, params.userId),
  });

  if (!student) {
    throw new AttendanceServiceError("Student profile not found", 404);
  }

  const enrollment = await db.query.enrollments.findFirst({
    where: and(
      eq(enrollments.studentId, student.id),
      eq(enrollments.courseId, course.id),
    ),
  });

  if (!enrollment) {
    throw new AttendanceServiceError(
      "You are not enrolled in this course",
      403,
    );
  }

  try {
    const [record] = await db
      .insert(attendance)
      .values({
        studentId: student.id,
        sessionId: session.id,
        status: "present",
      })
      .returning();

    return {
      attendanceId: record.id,
      sessionId: session.id,
      courseCode: course.courseCode,
      status: record.status,
      timestamp: record.timestamp.toISOString(),
    };
  } catch (error) {
    const code =
      typeof error === "object" && error !== null && "code" in error
        ? String((error as { code: unknown }).code)
        : "";

    if (code === "23505") {
      throw new AttendanceServiceError(
        "Attendance already recorded for this session",
        409,
      );
    }

    throw error;
  }
}
