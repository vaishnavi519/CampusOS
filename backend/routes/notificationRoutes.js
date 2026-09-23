const express = require("express");

const {
    getMyNotifications,
    markNotificationAsRead
} = require("../controllers/notificationController");

const {
    protect
} = require("../middleware/authMiddleware");

const router = express.Router();


// Logged-in user views their notifications
router.get(
    "/notifications",
    protect,
    getMyNotifications
);


// Logged-in user marks a notification as read
router.patch(
    "/notifications/:id/read",
    protect,
    markNotificationAsRead
);


module.exports = router;