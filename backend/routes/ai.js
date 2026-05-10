const express = require("express");
const router = express.Router();

const ctrl = require("../controllers/aiController");
const protect = require("../middleware/auth");
const { aiLimiter } = require("../middleware/rateLimiter");

router.use(protect);

router.post("/chat/:projectId", aiLimiter, ctrl.chat);
router.get("/history/:projectId", ctrl.getHistory);
router.delete("/history/:projectId", ctrl.clearHistory);
router.post("/complete", aiLimiter, ctrl.complete);

module.exports = router;