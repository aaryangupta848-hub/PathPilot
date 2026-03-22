const FocusSession = require("../models/FocusSession");

const createFocusSession = async (req, res) => {
  try {
    const { task, duration } = req.body;

    if (!task || !duration) {
      return res.status(400).json({ error: "Task and duration are required." });
    }

    const session = await FocusSession.create({
      user_id: req.user.id,
      task,
      duration
    });

    return res.status(201).json({
      focusSession: {
        id: session._id.toString(),
        user_id: session.user_id.toString(),
        task: session.task,
        duration: session.duration,
        created_at: session.createdAt.toISOString()
      }
    });
  } catch (error) {
    return res.status(500).json({ error: "Unable to save focus session." });
  }
};

module.exports = {
  createFocusSession
};
