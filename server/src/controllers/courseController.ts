import type { Request, Response } from "express";
import { listCoursesForUser } from "../services/courseService.js";

export async function listCoursesHandler(req: Request, res: Response) {
  try {
    const result = await listCoursesForUser(req.user!);
    res.json(result);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to load courses" });
  }
}
