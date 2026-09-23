const express = require("express");

const {
    markAttendance,
    getEventAttendance
} = require("../controllers/attendanceController");

const {
    protect,
    authorize
} = require("../middleware/authMiddleware");

const router = express.Router();

router.post(
    "/events/:id/attendance",
    protect,
    authorize("CLUB_ADMIN"),
    markAttendance
);

router.get(
    "/events/:id/attendance",
    protect,
    authorize("CLUB_ADMIN"),
    getEventAttendance
);

module.exports = router;