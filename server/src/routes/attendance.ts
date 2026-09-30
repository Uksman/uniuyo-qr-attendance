import { Router } from "express";
import { requireAuth, requireRole } from "../middleware/auth.js";
import { startSessionHandler } from "../controllers/sessionController.js";
import { scanAttendanceHandler } from "../controllers/attendanceController.js";

export const sessionRouter = Router();
sessionRouter.post(
  "/",
  requireAuth,
  requireRole("lecturer", "admin"),
  startSessionHandler,
);

export const attendanceRouter = Router();
attendanceRouter.post(
  "/scan",
  requireAuth,
  requireRole("student"),
  scanAttendanceHandler,
);
