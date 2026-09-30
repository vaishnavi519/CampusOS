const express = require("express");
const { protect, authorize } = require("../middleware/authMiddleware");
const { listRecommendations } = require("../controllers/recommendationController");

const router = express.Router();
router.get("/", protect, authorize("STUDENT"), listRecommendations);
module.exports = router;
