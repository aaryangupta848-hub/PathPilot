const Timetable = require("../models/Timetable");
const { generateTimetable } = require("../utils/timetableGenerator");

const formatTimetable = (record) => ({
  id: record._id.toString(),
  user_id: record.user_id.toString(),
  created_at: new Date(record.createdAt).toISOString(),
  input: record.input,
  generated_plan: record.generated_plan
});

const createTimetable = async (req, res) => {
  try {
    const { input, generated_plan } = generateTimetable(req.body || {});

    const timetable = await Timetable.create({
      user_id: req.user.id,
      plan_name: input.plan_name,
      exam_slug: input.exam_slug,
      input,
      generated_plan
    });

    return res.status(201).json({
      timetable: formatTimetable(timetable)
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unable to create timetable.";
    const status = message.startsWith("Add at least") ? 400 : 500;

    return res.status(status).json({ error: message });
  }
};

const getUserTimetables = async (req, res) => {
  try {
    const timetables = await Timetable.find({ user_id: req.user.id }).sort({ createdAt: -1 }).limit(10);

    return res.json({
      timetables: timetables.map(formatTimetable)
    });
  } catch (error) {
    return res.status(500).json({ error: "Unable to load timetables." });
  }
};

module.exports = {
  createTimetable,
  formatTimetable,
  getUserTimetables
};
