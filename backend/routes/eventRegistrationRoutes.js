const express = require("express");

const {
    registerForEvent,
    getMyRegistrations,
    cancelRegistration,
    getEventRegistrations
} = require("../controllers/eventRegistrationController");

const {
    protect,
    authorize
} = require("../middleware/authMiddleware");

const router = express.Router();


// Student registers for an event
router.post(
    "/events/:id/register",
    protect,
    authorize("STUDENT"),
    registerForEvent
);


// Student views their registrations
router.get(
    "/my-registrations",
    protect,
    authorize("STUDENT"),
    getMyRegistrations
);


// Student cancels their registration
router.patch(
    "/registrations/:registrationId/cancel",
    protect,
    authorize("STUDENT"),
    cancelRegistration
);


// Club Admin views registrations for their event
router.get(
    "/events/:id/registrations",
    protect,
    authorize("CLUB_ADMIN"),
    getEventRegistrations
);


module.exports = router;