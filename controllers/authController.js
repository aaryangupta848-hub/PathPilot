const bcrypt = require("bcryptjs");
const crypto = require("crypto");
const jwt = require("jsonwebtoken");

const User = require("../models/User");
const { sendEmail } = require("../utils/sendEmail");

// UPDATED
const buildUserResponse = (user) => ({
  id: user._id.toString(),
  name: user.name,
  email: user.email,
  emailVerified: Boolean(user.emailVerified),
  createdAt: user.createdAt
});

const generateToken = (userId) =>
  jwt.sign({ userId }, process.env.JWT_SECRET, {
    expiresIn: "7d"
  });

const generateOtp = () => String(crypto.randomInt(100000, 1000000));

const hashToken = (token) => crypto.createHash("sha256").update(token).digest("hex");
const otpCooldownMs = 60 * 1000;

const getCooldownRemainingSeconds = (sentAt) => {
  if (!sentAt) {
    return 0;
  }

  const elapsed = Date.now() - new Date(sentAt).getTime();
  if (elapsed >= otpCooldownMs) {
    return 0;
  }

  return Math.ceil((otpCooldownMs - elapsed) / 1000);
};

const sendVerificationEmail = async (user) => {
  const retryAfterSeconds = getCooldownRemainingSeconds(user.verificationOtpSentAt);
  if (retryAfterSeconds > 0) {
    const error = new Error(`Please wait ${retryAfterSeconds}s before requesting another verification OTP.`);
    error.status = 429;
    error.retryAfterSeconds = retryAfterSeconds;
    throw error;
  }

  const verificationOtp = generateOtp();
  user.verificationToken = hashToken(verificationOtp);
  user.verificationTokenExpires = new Date(Date.now() + 10 * 60 * 1000);
  user.verificationOtpSentAt = new Date();
  await user.save();

  await sendEmail({
    to: user.email,
    subject: "Your PathPilot verification OTP",
    text: `Your PathPilot verification OTP is ${verificationOtp}. It will expire in 10 minutes.`,
    html: `<p>Your PathPilot verification OTP is <strong>${verificationOtp}</strong>.</p><p>This OTP will expire in 10 minutes.</p>`
  });
};

const sendResetPasswordOtp = async (user) => {
  const retryAfterSeconds = getCooldownRemainingSeconds(user.resetOtpSentAt);
  if (retryAfterSeconds > 0) {
    const error = new Error(`Please wait ${retryAfterSeconds}s before requesting another reset OTP.`);
    error.status = 429;
    error.retryAfterSeconds = retryAfterSeconds;
    throw error;
  }

  const resetOtp = generateOtp();
  user.resetPasswordToken = hashToken(resetOtp);
  user.resetPasswordExpires = new Date(Date.now() + 10 * 60 * 1000);
  user.resetOtpSentAt = new Date();
  await user.save();

  await sendEmail({
    to: user.email,
    subject: "Your PathPilot password reset OTP",
    text: `Your PathPilot password reset OTP is ${resetOtp}. It will expire in 10 minutes.`,
    html: `<p>Your PathPilot password reset OTP is <strong>${resetOtp}</strong>.</p><p>This OTP will expire in 10 minutes.</p>`
  });
};

const register = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: "Email and password are required." });
    }

    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      return res.status(400).json({ error: "A user with this email already exists." });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await User.create({
      name: name || email.split("@")[0],
      email: email.toLowerCase(),
      password: hashedPassword,
      emailVerified: false,
      verificationToken: null,
      verificationTokenExpires: null,
      verificationOtpSentAt: null
    });

    await sendVerificationEmail(user);
    return res.status(201).json({
      user: buildUserResponse(user),
      message: "Registration successful. Please verify your email."
    });
  } catch (error) {
    return res.status(error.status || 500).json({ error: error.message || "Unable to register user." });
  }
};

const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: "Email and password are required." });
    }

    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      return res.status(401).json({ error: "Invalid credentials." });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ error: "Invalid credentials." });
    }

    if (!user.emailVerified) {
      await sendVerificationEmail(user);
      return res.status(403).json({ error: "Please verify your email before logging in. A new OTP has been sent." });
    }

    const token = generateToken(user._id.toString());
    return res.json({ token, user: buildUserResponse(user) });
  } catch (error) {
    return res.status(error.status || 500).json({ error: error.message || "Unable to login." });
  }
};

const me = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ error: "User not found." });
    }

    return res.json({ user: buildUserResponse(user) });
  } catch (error) {
    return res.status(500).json({ error: "Unable to load user." });
  }
};

// NEW
const verifyEmail = async (req, res) => {
  try {
    const { email, otp } = req.body;
    if (!email || !otp) {
      return res.status(400).json({ error: "Email and OTP are required." });
    }

    const hashedToken = hashToken(String(otp).trim());
    const user = await User.findOne({
      email: email.toLowerCase(),
      verificationToken: hashedToken,
      verificationTokenExpires: { $gt: new Date() }
    });

    if (!user) {
      return res.status(400).json({ error: "Invalid or expired OTP." });
    }

    user.emailVerified = true;
    user.verificationToken = null;
    user.verificationTokenExpires = null;
    await user.save();

    const token = generateToken(user._id.toString());
    return res.json({ message: "Email verified successfully.", token, user: buildUserResponse(user) });
  } catch (error) {
    return res.status(500).json({ error: "Unable to verify email." });
  }
};

const resendVerificationOtp = async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) {
      return res.status(400).json({ error: "Email is required." });
    }

    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      return res.json({ message: "If the email exists, OTP has been sent." });
    }

    if (user.emailVerified) {
      return res.status(400).json({ error: "Email is already verified." });
    }

    await sendVerificationEmail(user);
    return res.json({ message: "Verification OTP sent." });
  } catch (error) {
    return res.status(error.status || 500).json({ error: error.message || "Unable to resend verification OTP." });
  }
};

// NEW
const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) {
      return res.status(400).json({ error: "Email is required." });
    }

    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      return res.json({ message: "If the email exists, a reset OTP has been sent." });
    }

    await sendResetPasswordOtp(user);

    return res.json({ message: "If the email exists, a reset OTP has been sent." });
  } catch (error) {
    return res.status(error.status || 500).json({ error: error.message || "Unable to process forgot password request." });
  }
};

// NEW
const resetPassword = async (req, res) => {
  try {
    const { email, otp, password } = req.body;

    if (!email || !otp || !password) {
      return res.status(400).json({ error: "Email, OTP, and password are required." });
    }

    const hashedToken = hashToken(String(otp).trim());
    const user = await User.findOne({
      email: email.toLowerCase(),
      resetPasswordToken: hashedToken,
      resetPasswordExpires: { $gt: new Date() }
    });

    if (!user) {
      return res.status(400).json({ error: "Invalid or expired reset token." });
    }

    user.password = await bcrypt.hash(password, 10);
    user.resetPasswordToken = null;
    user.resetPasswordExpires = null;
    await user.save();

    return res.json({ message: "Password reset successful." });
  } catch (error) {
    return res.status(500).json({ error: "Unable to reset password." });
  }
};

module.exports = {
  register,
  login,
  me,
  verifyEmail,
  resendVerificationOtp,
  forgotPassword,
  resetPassword
};
