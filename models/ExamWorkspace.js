const mongoose = require("mongoose");

const MockHistorySchema = new mongoose.Schema(
  {
    id: { type: String, required: true },
    taken_at: { type: Date, required: true },
    scores: { type: mongoose.Schema.Types.Mixed, default: {} },
    overall: { type: Number, required: true }
  },
  { _id: false }
);

const AssistantHistorySchema = new mongoose.Schema(
  {
    question: { type: String, required: true, trim: true },
    answer: { type: String, required: true, trim: true },
    suggestedNextSteps: { type: [String], default: [] },
    relatedTopics: { type: [String], default: [] },
    created_at: { type: Date, default: Date.now }
  },
  { _id: false }
);

const ExamWorkspaceSchema = new mongoose.Schema(
  {
    user_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true
    },
    exam_slug: {
      type: String,
      required: true,
      trim: true,
      index: true
    },
    syllabus: {
      type: mongoose.Schema.Types.Mixed,
      default: {}
    },
    revision: {
      type: mongoose.Schema.Types.Mixed,
      default: {}
    },
    mock_history: {
      type: [MockHistorySchema],
      default: []
    },
    notes: {
      type: String,
      default: ""
    },
    assistant_history: {
      type: [AssistantHistorySchema],
      default: []
    }
  },
  {
    timestamps: { createdAt: true, updatedAt: true }
  }
);

ExamWorkspaceSchema.index({ user_id: 1, exam_slug: 1 }, { unique: true });

module.exports = mongoose.model("ExamWorkspace", ExamWorkspaceSchema);