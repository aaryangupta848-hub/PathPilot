const mongoose = require("mongoose");

const DecisionSchema = new mongoose.Schema(
  {
    user_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    },
    option_a: {
      type: String,
      required: true,
      trim: true
    },
    option_b: {
      type: String,
      required: true,
      trim: true
    },
    analysis: {
      type: mongoose.Schema.Types.Mixed,
      required: true
    }
  },
  {
    timestamps: { createdAt: true, updatedAt: false }
  }
);

module.exports = mongoose.model("Decision", DecisionSchema);
