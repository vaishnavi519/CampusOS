const express = require("express");

const {
    getMyParticipationReport
} = require("../controllers/reportController");

const {
    protect,
    authorize
} = require("../middleware/authMiddleware");

const router = express.Router();


// Student participation report
router.get(
    "/reports/my-participation",
    protect,
    authorize("STUDENT"),
    getMyParticipationReport
);


module.exports = router;