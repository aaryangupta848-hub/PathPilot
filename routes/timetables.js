const express = require("express");

const authMiddleware = require("../middleware/auth");
const { createTimetable, getUserTimetables } = require("../controllers/timetableController");

const router = express.Router();

router.get("/", authMiddleware, getUserTimetables);
router.post("/", authMiddleware, createTimetable);

module.exports = router;