const express = require("express");

const authMiddleware = require("../middleware/auth");
const { createFocusSession } = require("../controllers/focusController");

const router = express.Router();

router.post("/", authMiddleware, createFocusSession);

module.exports = router;
