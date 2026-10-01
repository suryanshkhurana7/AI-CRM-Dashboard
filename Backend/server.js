import "dotenv/config";
import express from "express";
import cors from "cors";
import morgan from "morgan";

import { connectDB } from "./config/db.js";
import { notFound, errorHandler } from "./middleware/error.middleware.js";
import authRoutes from "./routes/auth.route.js";
import leadRoutes from "./routes/lead.route.js";
import contactRoutes from "./routes/contact.route.js";
import noteRoutes from "./routes/note.route.js";
import taskRoutes from "./routes/task.route.js";

const app = express();

/* __________________________ Middlewares ________________________ */
app.use(
  cors({
    origin: process.env.CLIENT_URL || "https://localhost:5173",
    credentials: true,
  }),
);
app.use(express.json({ limit: "1mb" }));
app.use(express.urlencoded({ extended: true }));
if (process.env.NODE_ENV !== "production") app.use(morgan("dev"));

/* __________________________ Routes __________________________ */
app.get("/api/health", (req, res) =>
  res.json({ success: true, status: "ok", service: "CRM API" }),
);

app.use("/api/auth", authRoutes);
app.use("/api/leads", leadRoutes);
app.use("/api/contacts", contactRoutes);
app.use("/api/notes", noteRoutes);
app.use("/api/tasks", taskRoutes);

/* __________________________ Error handling __________________________ */
app.use(notFound);
app.use(errorHandler);

/* __________________________ Boot __________________________ */
const PORT = process.env.PORT || 8000;

const start = async () => {
  try {
    await connectDB();
    app.listen(PORT, () => {
      console.log(`CRM API running on https://localhost:${PORT}`);
    });
  } catch (err) {
    console.log("Failed to start the server", err.message);
    process.exit(1);
  }
};

start();

export default app;
