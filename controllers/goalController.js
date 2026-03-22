const Goal = require("../models/Goal");

const createGoal = async (req, res) => {
  try {
    const { title, goal_type } = req.body;
    if (!title) {
      return res.status(400).json({ error: "Goal title is required." });
    }

    const goal = await Goal.create({
      user_id: req.user.id,
      title,
      goal_type: goal_type || "General"
    });

    return res.status(201).json({
      goal: {
        id: goal._id.toString(),
        user_id: goal.user_id.toString(),
        title: goal.title,
        goal_type: goal.goal_type,
        created_at: goal.createdAt.toISOString()
      }
    });
  } catch (error) {
    return res.status(500).json({ error: "Unable to save goal." });
  }
};

module.exports = {
  createGoal
};
