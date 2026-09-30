const express = require("express");

const {
    getAllClubs,
    getClubById,
    createClub,
    joinClub,
    getMyClubs,
    getClubMembers,
    listAdministeredClubs,
    reviewMembership
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
    "/administered",
    protect,
    authorize("CLUB_ADMIN"),
    listAdministeredClubs
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

router.patch(
    "/memberships/:membershipId",
    protect,
    authorize("CLUB_ADMIN"),
    reviewMembership
);

module.exports = router;