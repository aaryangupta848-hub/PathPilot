const mongoose = require("mongoose");

const Goal = require("../models/Goal");
const Roadmap = require("../models/Roadmap");
const Decision = require("../models/Decision");
const FocusSession = require("../models/FocusSession");

const formatGoal = (goal) => ({
  id: goal._id.toString(),
  user_id: goal.user_id.toString(),
  title: goal.title,
  goal_type: goal.goal_type,
  created_at: goal.createdAt.toISOString()
});

const getGoalFromRoadmap = (roadmap) => {
  if (roadmap.goal_id && typeof roadmap.goal_id === "object" && roadmap.goal_id._id) {
    return roadmap.goal_id;
  }

  return null;
};

const formatRoadmap = (roadmap) => {
  const goal = getGoalFromRoadmap(roadmap);

  return {
    id: roadmap._id.toString(),
    goal_id: goal ? goal._id.toString() : roadmap.goal_id.toString(),
    goal_title: goal ? goal.title : null,
    goal_type: goal ? goal.goal_type : null,
    steps: roadmap.steps,
    created_at: roadmap.createdAt.toISOString()
  };
};

const formatDecision = (decision) => ({
  id: decision._id.toString(),
  user_id: decision.user_id.toString(),
  option_a: decision.option_a,
  option_b: decision.option_b,
  analysis: decision.analysis,
  created_at: decision.createdAt.toISOString()
});

const formatFocusSession = (session) => ({
  id: session._id.toString(),
  user_id: session.user_id.toString(),
  task: session.task,
  duration: session.duration,
  created_at: session.createdAt.toISOString()
});

const getDashboard = async (req, res) => {
  try {
    const goals = await Goal.find({ user_id: req.user.id }).sort({ createdAt: -1 });
    const goalIds = goals.map((goal) => goal._id);

    const [roadmaps, decisions, focusSessions, roadmapCount, decisionCount, focusSummary] = await Promise.all([
      Roadmap.find({ goal_id: { $in: goalIds } }).populate("goal_id").sort({ createdAt: -1 }).limit(5),
      Decision.find({ user_id: req.user.id }).sort({ createdAt: -1 }).limit(5),
      FocusSession.find({ user_id: req.user.id }).sort({ createdAt: -1 }).limit(5),
      Roadmap.countDocuments({ goal_id: { $in: goalIds } }),
      Decision.countDocuments({ user_id: req.user.id }),
      FocusSession.aggregate([
        { $match: { user_id: new mongoose.Types.ObjectId(req.user.id) } },
        {
          $group: {
            _id: null,
            totalMinutes: { $sum: "$duration" },
            totalSessions: { $sum: 1 }
          }
        }
      ])
    ]);

    const totals = focusSummary[0] || { totalMinutes: 0, totalSessions: 0 };

    return res.json({
      goals: goals.map(formatGoal),
      roadmaps: roadmaps.map(formatRoadmap),
      decisions: decisions.map(formatDecision),
      focusSessions: focusSessions.map(formatFocusSession),
      stats: {
        goals: goals.length,
        roadmaps: roadmapCount,
        decisions: decisionCount,
        focusSessions: totals.totalSessions,
        focusMinutes: totals.totalMinutes
      }
    });
  } catch (error) {
    return res.status(500).json({ error: "Unable to load dashboard." });
  }
};

module.exports = {
  formatRoadmap,
  formatDecision,
  getDashboard
};
