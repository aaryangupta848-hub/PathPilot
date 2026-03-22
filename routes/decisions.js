const express = require("express");

const authMiddleware = require("../middleware/auth");
const { createDecision, getDecisionById } = require("../controllers/decisionController");

const router = express.Router();

router.get("/:id", authMiddleware, getDecisionById);
router.post("/", authMiddleware, createDecision);

module.exports = router;