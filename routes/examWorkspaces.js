const express = require("express");

const authMiddleware = require("../middleware/auth");
const { getExamWorkspace, saveExamWorkspace } = require("../controllers/examWorkspaceController");

const router = express.Router();

router.get("/:slug", authMiddleware, getExamWorkspace);
router.put("/:slug", authMiddleware, saveExamWorkspace);

module.exports = router;