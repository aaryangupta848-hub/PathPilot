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
  turbopack: false,
});

const handle = nextApp.getRequestHandler();

// Routes
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
  try {
    // Connect DB
    await connectDB();

    // Prepare Next.js
    await nextApp.prepare();

    const server = express();

    // Middleware
    server.use(express.json());

    // API Routes
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

    // Handle all other routes (Next.js)
    server.all(/.*/, (req, res) => handle(req, res));

    // PORT (IMPORTANT)
    const port = process.env.PORT || 3000;

    // START SERVER (Render + Local both)
    server.listen(port, "0.0.0.0", () => {
      console.log(`🚀 PathPilot running on http://localhost:${port}`);
    });

  } catch (error) {
    console.error("❌ Server failed to start:", error);
    process.exit(1);
  }
};

// Start server
startServer();
