const mongoose = require("mongoose");

const CustomExamSyllabusSchema = new mongoose.Schema(
  {
    id: { type: String, required: true, trim: true },
    title: { type: String, required: true, trim: true },
    category: { type: String, required: true, trim: true },
    weight: { type: Number, required: true },
    description: { type: String, required: true, trim: true }
  },
  { _id: false }
);

const CustomExamMockSectionSchema = new mongoose.Schema(
  {
    id: { type: String, required: true, trim: true },
    title: { type: String, required: true, trim: true },
    target_score: { type: Number, required: true },
    max_score: { type: Number, required: true }
  },
  { _id: false }
);

const CustomExamRevisionSchema = new mongoose.Schema(
  {
    id: { type: String, required: true, trim: true },
    title: { type: String, required: true, trim: true },
    duration: { type: String, required: true, trim: true },
    focus: { type: String, required: true, trim: true },
    outcome: { type: String, required: true, trim: true }
  },
  { _id: false }
);

const CustomExamSchema = new mongoose.Schema(
  {
    user_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true
    },
    slug: {
      type: String,
      required: true,
      trim: true,
      index: true
    },
    name: {
      type: String,
      required: true,
      trim: true
    },
    difficulty: {
      type: String,
      required: true,
      trim: true
    },
    overview: {
      type: String,
      required: true,
      trim: true
    },
    roadmap: {
      type: [String],
      default: []
    },
    resources: {
      type: [String],
      default: []
    },
    syllabus: {
      type: [CustomExamSyllabusSchema],
      default: []
    },
    mock_sections: {
      type: [CustomExamMockSectionSchema],
      default: []
    },
    revision_plan: {
      type: [CustomExamRevisionSchema],
      default: []
    }
  },
  {
    timestamps: { createdAt: true, updatedAt: true }
  }
);

CustomExamSchema.index({ user_id: 1, slug: 1 }, { unique: true });

module.exports = mongoose.model("CustomExam", CustomExamSchema);
