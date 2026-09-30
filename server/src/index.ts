import express from "express";
import cors from "cors";
import { env } from "./config/env.js";
import { authRouter } from "./routes/auth.js";
import { attendanceRouter, sessionRouter } from "./routes/attendance.js";
import { courseRouter } from "./routes/courses.js";
import { reportRouter } from "./routes/reports.js";

import { initDb } from "./db/index.js";

const app = express();
app.use(cors());
app.use(express.json({ limit: "32kb" }));

app.get("/health", (_req, res) => {
  res.json({ ok: true });
});

app.use("/api/auth", authRouter);
app.use("/api/courses", courseRouter);
app.use("/api/sessions", sessionRouter);
app.use("/api/attendance", attendanceRouter);
app.use("/api/reports", reportRouter);

async function startServer() {
  await initDb();
  app.listen(env.PORT, () => {
    console.log(`QR attendance API listening on port ${env.PORT}`);
  });
}

startServer().catch((err) => {
  console.error("Failed to start backend server:", err);
  process.exit(1);
});
