import { Router } from "express";
import { requireAuth } from "../middleware/auth.js";
import { listCoursesHandler } from "../controllers/courseController.js";

export const courseRouter = Router();
courseRouter.get("/", requireAuth, listCoursesHandler);
