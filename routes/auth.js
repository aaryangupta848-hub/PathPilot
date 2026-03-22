const express = require("express");

const authMiddleware = require("../middleware/auth");
const { forgotPassword, login, me, register, resendVerificationOtp, resetPassword, verifyEmail } = require("../controllers/authController");

const router = express.Router();

router.post("/register", register);
router.post("/login", login);
router.get("/me", authMiddleware, me);
router.post("/verify-email", verifyEmail);
router.post("/resend-verification-otp", resendVerificationOtp);
router.post("/forgot-password", forgotPassword);
router.post("/reset-password", resetPassword);

module.exports = router;
