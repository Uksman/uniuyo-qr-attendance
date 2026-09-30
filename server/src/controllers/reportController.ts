import type { Request, Response } from "express";
import { eq } from "drizzle-orm";
import { db } from "../db/index.js";
import { attendance, courses, enrollments, sessions, students, users } from "../db/schema.js";

export async function getReportSummaryHandler(req: Request, res: Response) {
  try {
    const allCourses = await db.query.courses.findMany({
      with: {
        lecturer: true,
        sessions: {
          with: {
            attendance: {
              with: {
                student: {
                  with: {
                    user: true,
                  },
                },
              },
            },
          },
        },
      },
    });

    const report = allCourses.map((c) => {
      const totalSessions = c.sessions.length;
      let totalAttendanceCount = 0;
      c.sessions.forEach((s) => {
        totalAttendanceCount += s.attendance.length;
      });

      return {
        courseId: c.id,
        courseCode: c.courseCode,
        title: c.title,
        lecturerName: c.lecturer.name,
        totalSessions,
        totalAttendanceRecorded: totalAttendanceCount,
        recentSessions: c.sessions.map((s) => ({
          sessionId: s.id,
          createdAt: s.createdAt,
          expiresAt: s.expiresAt,
          attendanceCount: s.attendance.length,
          attendees: s.attendance.map((a) => ({
            studentId: a.student.studentId,
            studentName: a.student.user.name,
            timestamp: a.timestamp,
            status: a.status,
          })),
        })),
      };
    });

    res.json({ report });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to generate report" });
  }
}

export async function getLowAttendanceAlertsHandler(req: Request, res: Response) {
  try {
    const allStudents = await db.query.students.findMany({
      with: {
        user: true,
        enrollments: {
          with: {
            course: {
              with: {
                sessions: true,
              },
            },
          },
        },
        attendance: true,
      },
    });

    const alerts = allStudents
      .map((st) => {
        const totalAttended = st.attendance.length;
        let totalSessionsRequired = 0;
        st.enrollments.forEach((e) => {
          totalSessionsRequired += e.course.sessions.length;
        });

        const rate = totalSessionsRequired > 0 ? (totalAttended / totalSessionsRequired) * 100 : 100;
        return {
          studentDbId: st.id,
          studentId: st.studentId,
          studentName: st.user.name,
          email: st.user.email,
          programme: st.programme,
          sessionsAttended: totalAttended,
          totalSessions: totalSessionsRequired,
          attendancePercentage: Math.round(rate),
          isLowAttendance: rate < 75 && totalSessionsRequired > 0,
        };
      })
      .filter((s) => s.isLowAttendance);

    res.json({ alerts });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch low attendance alerts" });
  }
}
