const express = require("express");
const { protect, authorize } = require("../middleware/authMiddleware");
const { getPlatformStats } = require("../controllers/statsController");

const router = express.Router();
router.get("/platform", protect, authorize("SYSTEM_ADMIN"), getPlatformStats);
module.exports = router;
