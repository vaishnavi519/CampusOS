const express = require("express");
const { protect, authorize } = require("../middleware/authMiddleware");
const { listUsers, listCoordinators } = require("../controllers/userController");

const router = express.Router();
router.get("/coordinators", protect, authorize("CLUB_ADMIN"), listCoordinators);
router.get("/", protect, authorize("SYSTEM_ADMIN"), listUsers);
module.exports = router;
