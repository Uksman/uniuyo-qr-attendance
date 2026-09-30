import type { Request, Response } from "express";
import { z } from "zod";
import { AuthServiceError, login, registerStudent } from "../services/authService.js";

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

const registerSchema = z.object({
  email: z.string().email(),
  name: z.string().min(2),
  studentId: z.string().min(2),
  programme: z.string().min(2),
  password: z.string().min(6),
});

export async function loginHandler(req: Request, res: Response) {
  const parsed = loginSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "Valid email and password are required" });
    return;
  }

  try {
    const result = await login(parsed.data.email, parsed.data.password);
    res.json(result);
  } catch (error) {
    if (error instanceof AuthServiceError) {
      res.status(error.statusCode).json({ error: error.message });
      return;
    }
    console.error(error);
    res.status(500).json({ error: "Login failed" });
  }
}

export async function registerHandler(req: Request, res: Response) {
  const parsed = registerSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "Name, valid email, student ID, programme, and password (min 6 chars) are required" });
    return;
  }

  try {
    const result = await registerStudent(parsed.data);
    res.status(201).json(result);
  } catch (error) {
    if (error instanceof AuthServiceError) {
      res.status(error.statusCode).json({ error: error.message });
      return;
    }
    console.error(error);
    res.status(500).json({ error: "Registration failed" });
  }
}
