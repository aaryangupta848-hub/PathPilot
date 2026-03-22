const express = require("express");
const next = require("next");
const dotenv = require("dotenv");

const connectDB = require("./config/db");

dotenv.config();

const dev = process.env.NODE_ENV !== "production";
const nextApp = next({
  dev,
  dir: __dirname,
  webpack: true,
  turbopack: false
});
const handle = nextApp.getRequestHandler();

const authRoutes = require("./routes/auth");
const goalRoutes = require("./routes/goals");
const roadmapRoutes = require("./routes/roadmaps");
const decisionRoutes = require("./routes/decisions");
const focusSessionRoutes = require("./routes/focusSessions");
const dashboardRoutes = require("./routes/dashboard");
const examWorkspaceRoutes = require("./routes/examWorkspaces");
const customExamRoutes = require("./routes/customExams");
const timetableRoutes = require("./routes/timetables");
const aiRoutes = require("./routes/ai");

const startServer = async () => {
  await connectDB();
  await nextApp.prepare();

  const server = express();
  server.use(express.json());

  server.use("/api/auth", authRoutes);
  server.use("/api/goals", goalRoutes);
  server.use("/api/roadmaps", roadmapRoutes);
  server.use("/api/decisions", decisionRoutes);
  server.use("/api/focus-sessions", focusSessionRoutes);
  server.use("/api/dashboard", dashboardRoutes);
  server.use("/api/exam-workspaces", examWorkspaceRoutes);
  server.use("/api/custom-exams", customExamRoutes);
  server.use("/api/timetables", timetableRoutes);
  server.use("/api", aiRoutes);

  server.all(/.*/, (req, res) => handle(req, res));

const port = process.env.PORT || 3000;

server.listen(port, "0.0.0.0", () => {
  console.log(`PathPilot running on http://localhost:${port}`);
});
  
startServer().catch((error) => {
  console.error(error);
  process.exit(1);
});
