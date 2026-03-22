const Decision = require("../models/Decision");
const { formatDecision } = require("./dashboardController");

const createDecision = async (req, res) => {
  try {
    const { option_a, option_b, analysis } = req.body;

    if (!option_a || !option_b || !analysis) {
      return res.status(400).json({ error: "Decision payload is incomplete." });
    }

    const decision = await Decision.create({
      user_id: req.user.id,
      option_a,
      option_b,
      analysis
    });

    return res.status(201).json({
      decision: formatDecision(decision)
    });
  } catch (error) {
    return res.status(500).json({ error: "Unable to save decision." });
  }
};

const getDecisionById = async (req, res) => {
  try {
    const decision = await Decision.findOne({ _id: req.params.id, user_id: req.user.id });

    if (!decision) {
      return res.status(404).json({ error: "Decision not found." });
    }

    return res.json({
      decision: formatDecision(decision)
    });
  } catch (error) {
    return res.status(500).json({ error: "Unable to load decision." });
  }
};

module.exports = {
  createDecision,
  getDecisionById
};
