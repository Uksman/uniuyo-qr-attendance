import bcrypt from "bcryptjs";
import { eq } from "drizzle-orm";
import { db } from "./index.js";
import { courses, enrollments, students, users } from "./schema.js";

const DEMO_PASSWORD_HASH =
  "$2a$10$49CnCoc4IsUPBtBHVF8sXuAvbFyyfhCeBDeeoMAK6cnh3hhn2Q5ui"; // "Password123!"

async function upsertUser(params: {
  email: string;
  name: string;
  role: "admin" | "lecturer" | "student";
}) {
  const existing = await db.query.users.findFirst({
    where: eq(users.email, params.email),
  });
  if (existing) {
    return existing;
  }

  const passwordHash = DEMO_PASSWORD_HASH;
  const [created] = await db
    .insert(users)
    .values({
      email: params.email,
      passwordHash,
      name: params.name,
      role: params.role,
    })
    .returning();
  return created;
}

export async function seedDb() {
  const admin = await upsertUser({
    email: "admin@example.com",
    name: "Admin",
    role: "admin",
  });
  const lecturer = await upsertUser({
    email: "lecturer@example.com",
    name: "Lecturer",
    role: "lecturer",
  });
  const studentUser = await upsertUser({
    email: "student@example.com",
    name: "Student",
    role: "student",
  });

  let student = await db.query.students.findFirst({
    where: eq(students.userId, studentUser.id),
  });
  if (!student) {
    [student] = await db
      .insert(students)
      .values({
        userId: studentUser.id,
        studentId: "STU001",
        programme: "Computer Science",
      })
      .returning();
  }

  let course = await db.query.courses.findFirst({
    where: eq(courses.courseCode, "CS101"),
  });
  if (!course) {
    [course] = await db
      .insert(courses)
      .values({
        courseCode: "CS101",
        title: "Introduction to Programming",
        lecturerId: lecturer.id,
      })
      .returning();
  }

  const enrollment = await db.query.enrollments.findFirst({
    where: eq(enrollments.studentId, student.id),
  });
  if (!enrollment) {
    await db.insert(enrollments).values({
      studentId: student.id,
      courseId: course.id,
    });
  }

  console.log("Seeded demo accounts (password: Password123!):");
  console.log(`  admin     ${admin.email}`);
  console.log(`  lecturer  ${lecturer.email}`);
  console.log(`  student   ${studentUser.email}`);
  console.log("Course: CS101 — Introduction to Programming");
}
