const express = require("express");

const authMiddleware = require("../middleware/auth");
const { createCustomExam, getCustomExams } = require("../controllers/customExamController");

const router = express.Router();

router.get("/", authMiddleware, getCustomExams);
router.post("/", authMiddleware, createCustomExam);

module.exports = router;
