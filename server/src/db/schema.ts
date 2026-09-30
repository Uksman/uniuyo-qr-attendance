import {
  index,
  pgEnum,
  pgTable,
  primaryKey,
  text,
  timestamp,
  uniqueIndex,
  uuid,
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";

export const userRoleEnum = pgEnum("user_role", [
  "admin",
  "lecturer",
  "student",
]);

export const attendanceStatusEnum = pgEnum("attendance_status", [
  "present",
  "late",
]);

export const users = pgTable("users", {
  id: uuid("id").primaryKey().defaultRandom(),
  email: text("email").notNull(),
  passwordHash: text("password_hash").notNull(),
  name: text("name").notNull(),
  role: userRoleEnum("role").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
}, (table) => [
  uniqueIndex("users_email_idx").on(table.email),
]);

export const students = pgTable("students", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  studentId: text("student_id").notNull(),
  programme: text("programme").notNull(),
}, (table) => [
  uniqueIndex("students_user_id_idx").on(table.userId),
  uniqueIndex("students_student_id_idx").on(table.studentId),
]);

export const courses = pgTable("courses", {
  id: uuid("id").primaryKey().defaultRandom(),
  courseCode: text("course_code").notNull(),
  title: text("title").notNull(),
  lecturerId: uuid("lecturer_id")
    .notNull()
    .references(() => users.id, { onDelete: "restrict" }),
}, (table) => [
  uniqueIndex("courses_course_code_idx").on(table.courseCode),
  index("courses_lecturer_id_idx").on(table.lecturerId),
]);

export const enrollments = pgTable(
  "enrollments",
  {
    studentId: uuid("student_id")
      .notNull()
      .references(() => students.id, { onDelete: "cascade" }),
    courseId: uuid("course_id")
      .notNull()
      .references(() => courses.id, { onDelete: "cascade" }),
    enrolledAt: timestamp("enrolled_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => [
    primaryKey({ columns: [table.studentId, table.courseId] }),
    index("enrollments_course_id_idx").on(table.courseId),
  ],
);

export const sessions = pgTable("sessions", {
  id: uuid("id").primaryKey().defaultRandom(),
  courseId: uuid("course_id")
    .notNull()
    .references(() => courses.id, { onDelete: "cascade" }),
  signedToken: text("signed_token").notNull(),
  expiresAt: timestamp("expires_at", { withTimezone: true }).notNull(),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
}, (table) => [
  index("sessions_course_id_idx").on(table.courseId),
  index("sessions_expires_at_idx").on(table.expiresAt),
]);

export const attendance = pgTable("attendance", {
  id: uuid("id").primaryKey().defaultRandom(),
  studentId: uuid("student_id")
    .notNull()
    .references(() => students.id, { onDelete: "cascade" }),
  sessionId: uuid("session_id")
    .notNull()
    .references(() => sessions.id, { onDelete: "cascade" }),
  timestamp: timestamp("timestamp", { withTimezone: true })
    .notNull()
    .defaultNow(),
  status: attendanceStatusEnum("status").notNull().default("present"),
}, (table) => [
  uniqueIndex("attendance_student_session_idx").on(
    table.studentId,
    table.sessionId,
  ),
  index("attendance_session_id_idx").on(table.sessionId),
]);

export const usersRelations = relations(users, ({ one, many }) => ({
  student: one(students, {
    fields: [users.id],
    references: [students.userId],
  }),
  courses: many(courses),
}));

export const studentsRelations = relations(students, ({ one, many }) => ({
  user: one(users, {
    fields: [students.userId],
    references: [users.id],
  }),
  enrollments: many(enrollments),
  attendance: many(attendance),
}));

export const coursesRelations = relations(courses, ({ one, many }) => ({
  lecturer: one(users, {
    fields: [courses.lecturerId],
    references: [users.id],
  }),
  enrollments: many(enrollments),
  sessions: many(sessions),
}));

export const enrollmentsRelations = relations(enrollments, ({ one }) => ({
  student: one(students, {
    fields: [enrollments.studentId],
    references: [students.id],
  }),
  course: one(courses, {
    fields: [enrollments.courseId],
    references: [courses.id],
  }),
}));

export const sessionsRelations = relations(sessions, ({ one, many }) => ({
  course: one(courses, {
    fields: [sessions.courseId],
    references: [courses.id],
  }),
  attendance: many(attendance),
}));

export const attendanceRelations = relations(attendance, ({ one }) => ({
  student: one(students, {
    fields: [attendance.studentId],
    references: [students.id],
  }),
  session: one(sessions, {
    fields: [attendance.sessionId],
    references: [sessions.id],
  }),
}));

export type User = typeof users.$inferSelect;
export type Student = typeof students.$inferSelect;
export type Course = typeof courses.$inferSelect;
export type Session = typeof sessions.$inferSelect;
export type Attendance = typeof attendance.$inferSelect;
