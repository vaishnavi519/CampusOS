const express = require("express");

const {
    getPlatformStats
} = require("../controllers/statsController");

const {
    protect,
    authorize
} = require("../middleware/authMiddleware");

const router = express.Router();

router.get(
    "/stats/platform",
    protect,
    authorize("SYSTEM_ADMIN"),
    getPlatformStats
);

module.exports = router;