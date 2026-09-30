const express = require("express");
const { protect, authorize } = require("../middleware/authMiddleware");
const { registerForEvent, listMyRegistrations, cancelRegistration, listEventRegistrations } = require("../controllers/registrationController");

const router = express.Router();
router.post("/events/:id/register", protect, authorize("STUDENT"), registerForEvent);
router.get("/my-registrations", protect, authorize("STUDENT"), listMyRegistrations);
router.patch("/registrations/:registrationId/cancel", protect, authorize("STUDENT"), cancelRegistration);
router.get("/events/:id/registrations", protect, authorize("CLUB_ADMIN"), listEventRegistrations);
module.exports = router;
