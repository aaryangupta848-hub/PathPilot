const mongoose = require("mongoose");

const FocusSessionSchema = new mongoose.Schema(
  {
    user_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    },
    task: {
      type: String,
      required: true,
      trim: true
    },
    duration: {
      type: Number,
      required: true
    }
  },
  {
    timestamps: { createdAt: true, updatedAt: false }
  }
);

module.exports = mongoose.model("FocusSession", FocusSessionSchema);
