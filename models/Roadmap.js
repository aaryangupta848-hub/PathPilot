const mongoose = require("mongoose");

const RoadmapStepSchema = new mongoose.Schema(
  {
    title: String,
    description: String,
    estimated_time: String,
    skills: [String]
  },
  { _id: false }
);

const RoadmapSchema = new mongoose.Schema(
  {
    goal_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Goal",
      required: true
    },
    steps: [RoadmapStepSchema]
  },
  {
    timestamps: { createdAt: true, updatedAt: false }
  }
);

module.exports = mongoose.model("Roadmap", RoadmapSchema);
