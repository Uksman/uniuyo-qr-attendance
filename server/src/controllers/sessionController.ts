import type { Request, Response } from "express";
import { z } from "zod";
import {
  SessionServiceError,
  startSession,
} from "../services/sessionService.js";

const startSessionSchema = z.object({
  courseCode: z.string().min(1),
  ttlSeconds: z.number().int().positive().max(3600).optional(),
});

export async function startSessionHandler(req: Request, res: Response) {
  const parsed = startSessionSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "courseCode is required" });
    return;
  }

  try {
    const result = await startSession({
      courseCode: parsed.data.courseCode,
      userId: req.user!.id,
      role: req.user!.role,
      ttlSeconds: parsed.data.ttlSeconds,
    });
    res.status(201).json(result);
  } catch (error) {
    if (error instanceof SessionServiceError) {
      res.status(error.statusCode).json({ error: error.message });
      return;
    }
    console.error(error);
    res.status(500).json({ error: "Failed to start session" });
  }
}
