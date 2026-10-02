import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import postgres from "postgres";
import { drizzle } from "drizzle-orm/postgres-js";
import { migrate } from "drizzle-orm/postgres-js/migrator";
import { env } from "../config/env.js";
import * as schema from "./schema.js";
import { seedDb } from "./seed.js";

const client = postgres(env.DATABASE_URL, { max: 10 });
export const db = drizzle(client, { schema });

export async function initDb() {
  let migrationsFolder = path.join(process.cwd(), "drizzle");
  if (!fs.existsSync(migrationsFolder)) {
    migrationsFolder = fileURLToPath(new URL("../../drizzle", import.meta.url));
  }
  const migrationClient = postgres(env.DATABASE_URL, { max: 1 });
  const migrationDb = drizzle(migrationClient);
  await migrate(migrationDb, { migrationsFolder });
  await migrationClient.end();

  const existingUsers = await db.query.users.findFirst();
  if (!existingUsers) {
    console.log("Database initialized. Seeding demo data...");
    await seedDb();
  }
}
