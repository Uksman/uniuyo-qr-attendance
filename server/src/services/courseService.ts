import { eq } from "drizzle-orm";
import { db } from "../db/index.js";
import { courses, enrollments, students } from "../db/schema.js";
import type { AuthUser } from "../middleware/auth.js";

export async function listCoursesForUser(user: AuthUser) {
  if (user.role === "lecturer") {
    return db
      .select({
        id: courses.id,
        courseCode: courses.courseCode,
        title: courses.title,
      })
      .from(courses)
      .where(eq(courses.lecturerId, user.id));
  }

  if (user.role === "student") {
    const student = await db.query.students.findFirst({
      where: eq(students.userId, user.id),
    });
    if (!student) {
      return [];
    }

    return db
      .select({
        id: courses.id,
        courseCode: courses.courseCode,
        title: courses.title,
      })
      .from(enrollments)
      .innerJoin(courses, eq(enrollments.courseId, courses.id))
      .where(eq(enrollments.studentId, student.id));
  }

  return db
    .select({
      id: courses.id,
      courseCode: courses.courseCode,
      title: courses.title,
    })
    .from(courses);
}
