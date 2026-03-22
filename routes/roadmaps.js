const express = require("express");

const authMiddleware = require("../middleware/auth");
const { createRoadmap, getRoadmapById } = require("../controllers/roadmapController");

const router = express.Router();

router.get("/:id", authMiddleware, getRoadmapById);
router.post("/", authMiddleware, createRoadmap);

module.exports = router;