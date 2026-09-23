const express = require("express");
const {
    createEvent,
    getAllEvents,
    submitEventForApproval,
    getPendingEvents,
    approveEvent,
    rejectEvent,
    publishEvent
} = require("../controllers/eventController");

const {
    protect,
    authorize
} = require("../middleware/authMiddleware");

const router = express.Router();

// Students can view published events
router.get("/", getAllEvents);

router.post(
    "/",
    protect,
    authorize("CLUB_ADMIN"),
    createEvent
);

router.get(
    "/pending",
    protect,
    authorize("FACULTY_COORDINATOR"),
    getPendingEvents
);

router.patch(
    "/:id/approve",
    protect,
    authorize("FACULTY_COORDINATOR"),
    approveEvent
);

router.patch(
    "/:id/reject",
    protect,
    authorize("FACULTY_COORDINATOR"),
    rejectEvent
);

router.patch(
    "/:id/publish",
    protect,
    authorize("SYSTEM_ADMIN"),
    publishEvent
);

router.patch(
    "/:id/submit",
    protect,
    authorize("CLUB_ADMIN"),
    submitEventForApproval
);

module.exports = router;