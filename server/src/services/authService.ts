import { eq } from "drizzle-orm";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { db } from "../db/index.js";
import { students, users } from "../db/schema.js";
import { env } from "../config/env.js";

export class AuthServiceError extends Error {
  constructor(
    message: string,
    public statusCode: number,
  ) {
    super(message);
    this.name = "AuthServiceError";
  }
}

export async function login(email: string, password: string) {
  const user = await db.query.users.findFirst({
    where: eq(users.email, email.toLowerCase()),
  });

  if (!user || !(await bcrypt.compare(password, user.passwordHash))) {
    throw new AuthServiceError("Invalid email or password", 401);
  }

  const token = jwt.sign(
    { id: user.id, role: user.role },
    env.JWT_SECRET,
    { expiresIn: "12h" },
  );

  return {
    token,
    user: {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
    },
  };
}

export async function registerStudent(params: {
  email: string;
  name: string;
  studentId: string;
  programme: string;
  password: string;
}) {
  const existing = await db.query.users.findFirst({
    where: eq(users.email, params.email.toLowerCase()),
  });

  if (existing) {
    throw new AuthServiceError("An account with this email already exists", 400);
  }

  const passwordHash = await bcrypt.hash(params.password, 10);
  const [createdUser] = await db
    .insert(users)
    .values({
      email: params.email.toLowerCase(),
      name: params.name,
      passwordHash,
      role: "student",
    })
    .returning();

  await db.insert(students).values({
    userId: createdUser.id,
    studentId: params.studentId,
    programme: params.programme,
  });

  return login(params.email, params.password);
}
