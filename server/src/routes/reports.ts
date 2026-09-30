import { Router } from "express";
import { requireAuth, requireRole } from "../middleware/auth.js";
import {
  getLowAttendanceAlertsHandler,
  getReportSummaryHandler,
} from "../controllers/reportController.js";

export const reportRouter = Router();

reportRouter.get(
  "/summary",
  requireAuth,
  requireRole("lecturer", "admin"),
  getReportSummaryHandler,
);

reportRouter.get(
  "/alerts",
  requireAuth,
  requireRole("admin", "lecturer"),
  getLowAttendanceAlertsHandler,
);
