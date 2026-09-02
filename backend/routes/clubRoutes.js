const express = require("express");

const {
    getAllClubs,
    getClubById,
    createClub,
    joinClub,
    getMyClubs,
    getClubMembers
} = require("../controllers/clubController");

const {
    protect,
    authorize
} = require("../middleware/authMiddleware");

const router = express.Router();

router.get("/", getAllClubs);
router.get(
    "/my-clubs",
    protect,
    authorize("STUDENT"),
    getMyClubs
);

router.get(
    "/:id/members",
    protect,
    authorize("CLUB_ADMIN"),
    getClubMembers
);

router.get("/:id", getClubById);

router.post(
    "/",
    protect,
    authorize("CLUB_ADMIN"),
    createClub
);
router.post(
    "/:id/join",
    protect,
    authorize("STUDENT"),
    joinClub
);



module.exports = router;