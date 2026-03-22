const mongoose = require("mongoose");

const TimetableSchema = new mongoose.Schema(
  {
    user_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true
    },
    plan_name: {
      type: String,
      required: true,
      trim: true
    },
    exam_slug: {
      type: String,
      required: true,
      trim: true,
      index: true
    },
    input: {
      type: mongoose.Schema.Types.Mixed,
      required: true
    },
    generated_plan: {
      type: mongoose.Schema.Types.Mixed,
      required: true
    }
  },
  {
    timestamps: { createdAt: true, updatedAt: false }
  }
);

module.exports = mongoose.model("Timetable", TimetableSchema);
