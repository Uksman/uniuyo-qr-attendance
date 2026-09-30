import { PGlite } from "@electric-sql/pglite";
import { drizzle } from "drizzle-orm/pglite";
import { migrate } from "drizzle-orm/pglite/migrator";
import path from "node:path";
import * as schema from "./schema.js";

import { seedDb } from "../../scripts/seed.js";

const pgliteDataDir = process.env.PGLITE_DATA_DIR || "./.pglite_data";
export const client = new PGlite(pgliteDataDir);
export const db = drizzle({ client, schema });

export async function initDb() {
  const migrationsFolder = path.join(process.cwd(), "drizzle");
  await migrate(db, { migrationsFolder });
  const existingUsers = await db.query.users.findFirst();
  if (!existingUsers) {
    console.log("Database initialized. Seeding demo data...");
    await seedDb();
  }
}

