const express = require("express");

const authMiddleware = require("../middleware/auth");
const { createGoal } = require("../controllers/goalController");

const router = express.Router();

router.post("/", authMiddleware, createGoal);

module.exports = router;
