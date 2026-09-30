import "dotenv/config";
import { z } from "zod";

const envSchema = z.object({
  PORT: z.coerce.number().default(4000),
  DATABASE_URL: z.string().default("pglite://local"),
  JWT_SECRET: z.string().min(16),
  QR_SECRET: z.string().min(16),
  QR_TTL_SECONDS: z.coerce.number().int().positive().default(300),
});

export const env = envSchema.parse(process.env);
