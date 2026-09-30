import type { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { env } from "../config/env.js";

export type AuthUser = {
  id: string;
  role: "admin" | "lecturer" | "student";
};

declare global {
  namespace Express {
    interface Request {
      user?: AuthUser;
    }
  }
}

export function requireAuth(req: Request, res: Response, next: NextFunction) {
  const header = req.headers.authorization;
  if (!header?.startsWith("Bearer ")) {
    res.status(401).json({ error: "Missing authorization token" });
    return;
  }

  try {
    const decoded = jwt.verify(header.slice(7), env.JWT_SECRET) as AuthUser;
    if (!decoded.id || !decoded.role) {
      res.status(401).json({ error: "Invalid authorization token" });
      return;
    }
    req.user = { id: decoded.id, role: decoded.role };
    next();
  } catch {
    res.status(401).json({ error: "Invalid authorization token" });
  }
}

export function requireRole(...roles: AuthUser["role"][]) {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user || !roles.includes(req.user.role)) {
      res.status(403).json({ error: "Insufficient permissions" });
      return;
    }
    next();
  };
}
