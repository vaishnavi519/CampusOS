const express = require("express");

const {
    register,
    login,
    getProfile
} = require("../controllers/authController");

const {
    protect,
    authorize
} = require("../middleware/authMiddleware");

const router = express.Router();

router.post("/register", register);

router.post("/login", login);

router.get("/profile", protect, getProfile);

router.get(
    "/student-test",
    protect,
    authorize("STUDENT"),
    (req, res) => {
        res.json({
            success: true,
            message: "Welcome Student!",
            user: req.user
        });
    }
);

module.exports = router;