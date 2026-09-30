import type { Request, Response } from "express";
import { z } from "zod";
import {
  AttendanceServiceError,
  recordScan,
} from "../services/attendanceService.js";

const scanSchema = z.object({
  token: z.string().min(1),
});

export async function scanAttendanceHandler(req: Request, res: Response) {
  const parsed = scanSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "token is required" });
    return;
  }

  try {
    const result = await recordScan({
      token: parsed.data.token,
      userId: req.user!.id,
    });
    res.status(201).json(result);
  } catch (error) {
    if (error instanceof AttendanceServiceError) {
      res.status(error.statusCode).json({ error: error.message });
      return;
    }
    console.error(error);
    res.status(500).json({ error: "Failed to record attendance" });
  }
}
