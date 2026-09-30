import { randomUUID } from "node:crypto";
import { eq } from "drizzle-orm";
import { db } from "../db/index.js";
import { courses, sessions } from "../db/schema.js";
import { env } from "../config/env.js";
import { signQrToken } from "./qrToken.js";

export class SessionServiceError extends Error {
  constructor(
    message: string,
    public statusCode: number,
  ) {
    super(message);
    this.name = "SessionServiceError";
  }
}

export async function startSession(params: {
  courseCode: string;
  userId: string;
  role: "admin" | "lecturer" | "student";
  ttlSeconds?: number;
}) {
  const course = await db.query.courses.findFirst({
    where: eq(courses.courseCode, params.courseCode),
  });

  if (!course) {
    throw new SessionServiceError("Course not found", 404);
  }

  if (params.role !== "admin" && course.lecturerId !== params.userId) {
    throw new SessionServiceError(
      "You are not assigned to this course",
      403,
    );
  }

  const ttl = params.ttlSeconds ?? env.QR_TTL_SECONDS;
  const expiresAt = new Date(Date.now() + ttl * 1000);
  const sessionId = randomUUID();
  const signedToken = signQrToken(
    {
      sessionId,
      courseCode: course.courseCode,
      exp: Math.floor(expiresAt.getTime() / 1000),
    },
    env.QR_SECRET,
  );

  await db.insert(sessions).values({
    id: sessionId,
    courseId: course.id,
    signedToken,
    expiresAt,
  });

  return {
    sessionId,
    courseCode: course.courseCode,
    courseTitle: course.title,
    signedToken,
    expiresAt: expiresAt.toISOString(),
  };
}
