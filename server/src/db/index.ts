import { PGlite } from "@electric-sql/pglite";
import { drizzle } from "drizzle-orm/pglite";
import { migrate } from "drizzle-orm/pglite/migrator";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import * as schema from "./schema.js";
import { seedDb } from "./seed.js";

const pgliteDataDir = process.env.PGLITE_DATA_DIR || "./.pglite_data";
export const client = new PGlite(pgliteDataDir);
export const db = drizzle({ client, schema });

export async function initDb() {
  let migrationsFolder = path.join(process.cwd(), "drizzle");
  if (!fs.existsSync(migrationsFolder)) {
    migrationsFolder = fileURLToPath(new URL("../../drizzle", import.meta.url));
  }
  await migrate(db, { migrationsFolder });
  const existingUsers = await db.query.users.findFirst();
  if (!existingUsers) {
    console.log("Database initialized. Seeding demo data...");
    await seedDb();
  }
}

