const express = require("express");
const { protect, authorize } = require("../middleware/authMiddleware");
const { getMyParticipation } = require("../controllers/reportController");

const router = express.Router();
router.get("/my-participation", protect, authorize("STUDENT"), getMyParticipation);
module.exports = router;
