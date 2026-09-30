import { Router } from "express";
import { loginHandler, registerHandler } from "../controllers/authController.js";
import { meHandler } from "../controllers/meController.js";
import { requireAuth } from "../middleware/auth.js";

export const authRouter = Router();
authRouter.post("/login", loginHandler);
authRouter.post("/register", registerHandler);
authRouter.get("/me", requireAuth, meHandler);
