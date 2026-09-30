import type { Request, Response } from "express";
import { eq } from "drizzle-orm";
import { db } from "../db/index.js";
import { users } from "../db/schema.js";

export async function meHandler(req: Request, res: Response) {
  const user = await db.query.users.findFirst({
    where: eq(users.id, req.user!.id),
  });

  if (!user) {
    res.status(401).json({ error: "User not found" });
    return;
  }

  res.json({
    id: user.id,
    email: user.email,
    name: user.name,
    role: user.role,
  });
}
