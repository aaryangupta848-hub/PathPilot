const express = require("express");

const authMiddleware = require("../middleware/auth");
const { analyzeDecision, examAssistant, generateCustomExamGuide, generateRoadmap } = require("../controllers/aiController");

const router = express.Router();

router.post("/analyze-decision", analyzeDecision);
router.post("/generate-roadmap", generateRoadmap);
router.post("/exam-assistant", authMiddleware, examAssistant);
router.post("/generate-custom-exam-guide", generateCustomExamGuide);

module.exports = router;
