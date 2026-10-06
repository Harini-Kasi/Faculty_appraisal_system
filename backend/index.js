import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { getDbPool, initDb } from "./config/db.js";

import authRoutes from "./routes/authRoutes.js";
import facultyRoutes from "./routes/facultyRoutes.js";
import questionRoutes from "./routes/questionRoutes.js";
import hodRoutes from "./routes/hodRoutes.js";
import appraisalRoutes from "./routes/appraisalRoutes.js";
import adminRoutes from "./routes/adminRoutes.js";

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json({ limit: "10mb" }));

const PORT = process.env.PORT || 4001;

let db = null;
initDb()
  .then(async () => {
    db = await getDbPool();
    console.log("MySQL Database initialized and connected.");
  })
  .catch((err) => {
    console.error("Failed to initialize database:", err);
  });

app.use(async (req, res, next) => {
  if (!db) {
    db = await getDbPool();
  }
  next();
});

// Register MVC Routes under /api
app.use("/api", authRoutes);
app.use("/api", facultyRoutes);
app.use("/api", questionRoutes);
app.use("/api", hodRoutes);
app.use("/api", appraisalRoutes);
app.use("/api", adminRoutes);

app.listen(PORT, "0.0.0.0", () => {
  console.log(`FPA API server listening on http://0.0.0.0:${PORT}`);
});
