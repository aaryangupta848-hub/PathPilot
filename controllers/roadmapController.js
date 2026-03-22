const Roadmap = require("../models/Roadmap");
const Goal = require("../models/Goal");
const { formatRoadmap } = require("./dashboardController");

const createRoadmap = async (req, res) => {
  try {
    const { goal_id, steps } = req.body;

    if (!goal_id || !Array.isArray(steps) || !steps.length) {
      return res.status(400).json({ error: "goal_id and roadmap steps are required." });
    }

    const goal = await Goal.findOne({ _id: goal_id, user_id: req.user.id });
    if (!goal) {
      return res.status(404).json({ error: "Goal not found." });
    }

    const roadmap = await Roadmap.create({ goal_id, steps });
    const populatedRoadmap = await Roadmap.findById(roadmap._id).populate("goal_id");

    return res.status(201).json({
      roadmap: formatRoadmap(populatedRoadmap)
    });
  } catch (error) {
    return res.status(500).json({ error: "Unable to save roadmap." });
  }
};

const getRoadmapById = async (req, res) => {
  try {
    const roadmap = await Roadmap.findById(req.params.id).populate("goal_id");

    if (!roadmap || !roadmap.goal_id || roadmap.goal_id.user_id.toString() !== req.user.id) {
      return res.status(404).json({ error: "Roadmap not found." });
    }

    return res.json({
      roadmap: formatRoadmap(roadmap)
    });
  } catch (error) {
    return res.status(500).json({ error: "Unable to load roadmap." });
  }
};

module.exports = {
  createRoadmap,
  getRoadmapById
};
