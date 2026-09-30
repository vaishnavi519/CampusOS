const express = require("express");
const { protect } = require("../middleware/authMiddleware");
const { listNotifications, markNotificationRead } = require("../controllers/notificationController");

const router = express.Router();
router.get("/", protect, listNotifications);
router.patch("/:id/read", protect, markNotificationRead);
module.exports = router;
