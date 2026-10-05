const express = require("express");

const {
    protect,
    authorize
} = require("../middleware/authMiddleware");

const {
    listUsers,
    listCoordinators,
    createUser,
    resetUserPassword
} = require("../controllers/userController");

const router = express.Router();

router.get(
    "/coordinators",
    protect,
    authorize("CLUB_ADMIN"),
    listCoordinators
);

router.get(
    "/",
    protect,
    authorize("SYSTEM_ADMIN"),
    listUsers
);

router.post(
    "/",
    protect,
    authorize("SYSTEM_ADMIN"),
    createUser
);

router.patch(
    "/:id/password",
    protect,
    authorize("SYSTEM_ADMIN"),
    resetUserPassword
);

module.exports = router;