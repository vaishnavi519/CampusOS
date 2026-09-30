const express = require("express");
const { protect, authorize } = require("../middleware/authMiddleware");
const { listAttendance, markAttendance } = require("../controllers/attendanceController");

const router = express.Router();
router.get("/events/:id/attendance", protect, authorize("CLUB_ADMIN"), listAttendance);
router.post("/events/:id/attendance", protect, authorize("CLUB_ADMIN"), markAttendance);
module.exports = router;
