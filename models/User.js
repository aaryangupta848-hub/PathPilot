const mongoose = require("mongoose");

const UserSchema = new mongoose.Schema({
  name: {
    type: String,
    trim: true,
    default: "PathPilot User"
  },
  email: {
    type: String,
    unique: true,
    required: true,
    lowercase: true,
    trim: true
  },
  password: {
    type: String,
    required: true
  },
  // NEW
  emailVerified: {
    type: Boolean,
    default: false
  },
  // NEW
  verificationToken: {
    type: String,
    default: null
  },
  verificationTokenExpires: {
    type: Date,
    default: null
  },
  verificationOtpSentAt: {
    type: Date,
    default: null
  },
  // NEW
  resetPasswordToken: {
    type: String,
    default: null
  },
  // NEW
  resetPasswordExpires: {
    type: Date,
    default: null
  },
  resetOtpSentAt: {
    type: Date,
    default: null
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model("User", UserSchema);
