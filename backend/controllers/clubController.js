const db = require("../config/db");
const { createNotification } = require("./notificationController");

const getAllClubs = async (req, res) => {
    try {
        const [clubs] = await db.query(
            `SELECT 
                id,
                name,
                description,
                category,
                created_at
             FROM clubs
             ORDER BY created_at DESC`
        );

        res.json({
            success: true,
            count: clubs.length,
            clubs
        });

    } catch (error) {
        console.error("Get clubs error:", error);

        res.status(500).json({
            success: false,
            message: "Server error while fetching clubs"
        });
    }
};

const getClubById = async (req, res) => {
    try {
        const { id } = req.params;

        const [clubs] = await db.query(
            `SELECT 
                id,
                name,
                description,
                category,
                admin_id,
                faculty_coordinator_id,
                status,
                created_at
             FROM clubs
             WHERE id = ?`,
            [id]
        );

        if (clubs.length === 0) {
            return res.status(404).json({
                success: false,
                message: "Club not found"
            });
        }

        res.json({
            success: true,
            club: clubs[0]
        });

    } catch (error) {
        console.error("Get club error:", error);

        res.status(500).json({
            success: false,
            message: "Server error while fetching club"
        });
    }
};

const createClub = async (req, res) => {
    try {
        const {
            name,
            description,
            category,
            faculty_coordinator_id
        } = req.body;

        // Validate required fields
        if (!name || !category || !faculty_coordinator_id) {
            return res.status(400).json({
                success: false,
                message: "Name, category and faculty coordinator are required"
            });
        }

        const [coordinators] = await db.query(
            `SELECT id
             FROM users
             WHERE id = ? AND role = 'FACULTY_COORDINATOR'`,
            [faculty_coordinator_id]
        );

        if (coordinators.length === 0) {
            return res.status(400).json({
                success: false,
                message: "A valid faculty coordinator is required"
            });
        }

        // Create club
        const [result] = await db.query(
            `INSERT INTO clubs
            (name, description, category, admin_id, faculty_coordinator_id, status)
            VALUES (?, ?, ?, ?, ?, ?)`,
            [
                name,
                description || null,
                category,
                req.user.id,
                faculty_coordinator_id,
                "PENDING"
            ]
        );

        res.status(201).json({
            success: true,
            message: "Club created successfully",
            club: {
                id: result.insertId,
                name,
                description: description || null,
                category,
                admin_id: req.user.id,
                faculty_coordinator_id,
                status: "PENDING"
            }
        });

    } catch (error) {
        console.error("Create club error:", error);

        res.status(500).json({
            success: false,
            message: "Server error while creating club"
        });
    }
};

const joinClub = async (req, res) => {
    try {
        const { id } = req.params;
        const studentId = req.user.id;

        // Check if club exists
        const [clubs] = await db.query(
            "SELECT id, name, admin_id FROM clubs WHERE id = ?",
            [id]
        );

        if (clubs.length === 0) {
            return res.status(404).json({
                success: false,
                message: "Club not found"
            });
        }

        // Check if student already joined
        const [existingMembership] = await db.query(
            `SELECT id
             FROM club_memberships
             WHERE club_id = ? AND student_id = ?`,
            [id, studentId]
        );

        if (existingMembership.length > 0) {
            return res.status(409).json({
                success: false,
                message: "You have already joined this club"
            });
        }

        // Add student to club
        await db.query(
            `INSERT INTO club_memberships
             (club_id, student_id, status)
             VALUES (?, ?, ?)`,
            [id, studentId, "PENDING"]
        );
        const [students] = await db.query("SELECT name FROM users WHERE id = ?", [studentId]);
        await createNotification(db, {
            userId: studentId,
            type: "MEMBERSHIP_SUBMITTED",
            title: `Membership request sent to ${clubs[0].name}`,
            message: "Your request is waiting for the club administrator to review it.",
            link: `/app/clubs/${id}`
        });
        await createNotification(db, {
            userId: clubs[0].admin_id,
            type: "MEMBERSHIP_REQUEST",
            title: `${students[0]?.name || "A student"} asked to join ${clubs[0].name}`,
            message: "A membership request is waiting for review.",
            link: `/club-admin/clubs/${id}/members`
        });

        res.status(201).json({
            success: true,
            message: "Successfully joined the club"
        });

    } catch (error) {
        console.error("Join club error:", error);

        res.status(500).json({
            success: false,
            message: "Server error while joining club"
        });
    }
};

const getMyClubs = async (req, res) => {
    try {
        const studentId = req.user.id;

        const [clubs] = await db.query(
            `SELECT
                cm.id AS membership_id,
                c.id AS club_id,
                c.name,
                c.description,
                c.category,
                cm.status,
                cm.applied_at,
                cm.reviewed_at
             FROM club_memberships cm
             JOIN clubs c ON cm.club_id = c.id
             WHERE cm.student_id = ?
             ORDER BY cm.applied_at DESC`,
            [studentId]
        );

        res.json({
            success: true,
            clubs
        });

    } catch (error) {
        console.error("Get my clubs error:", error);

        res.status(500).json({
            success: false,
            message: "Server error while fetching your clubs"
        });
    }
};

const getClubMembers = async (req, res) => {
    try {
        const { id } = req.params;
        const adminId = req.user.id;

        // Check that this club belongs to the logged-in admin
        const [clubs] = await db.query(
            `SELECT id, name
             FROM clubs
             WHERE id = ? AND admin_id = ?`,
            [id, adminId]
        );

        if (clubs.length === 0) {
            return res.status(404).json({
                success: false,
                message: "Club not found or you are not the club admin"
            });
        }

        // Get members / join requests
        const [members] = await db.query(
            `SELECT
                cm.id AS membership_id,
                u.id AS student_id,
                u.name AS student_name,
                u.email AS student_email,
                cm.status,
                cm.applied_at,
                cm.reviewed_at
             FROM club_memberships cm
             JOIN users u ON cm.student_id = u.id
             WHERE cm.club_id = ?
             ORDER BY cm.applied_at DESC`,
            [id]
        );

        res.json({
            success: true,
            club: clubs[0],
            members
        });

    } catch (error) {
        console.error("Get club members error:", error);

        res.status(500).json({
            success: false,
            message: "Server error while fetching club members"
        });
    }
};

const listAdministeredClubs = async (req, res) => {
    try {
        const [clubs] = await db.query(
            `SELECT c.id, c.name, c.description, c.category, c.faculty_coordinator_id, c.status,
                    c.created_at,
                    SUM(CASE WHEN cm.status = 'APPROVED' THEN 1 ELSE 0 END) AS member_count,
                    SUM(CASE WHEN cm.status = 'PENDING' THEN 1 ELSE 0 END) AS pending_count
             FROM clubs c LEFT JOIN club_memberships cm ON cm.club_id = c.id
             WHERE c.admin_id = ? GROUP BY c.id ORDER BY c.created_at DESC`, [req.user.id]
        );
        res.json({ success: true, clubs });
    } catch (error) {
        console.error("List administered clubs error:", error);
        res.status(500).json({ success: false, message: "Server error while fetching administered clubs" });
    }
};

const reviewMembership = async (req, res) => {
    try {
        const status = String(req.body.status || "").toUpperCase();
        if (!["APPROVED", "REJECTED"].includes(status)) return res.status(400).json({ success: false, message: "Status must be APPROVED or REJECTED" });
        const [rows] = await db.query(
            `SELECT cm.id, cm.student_id, cm.status, c.name AS club_name
             FROM club_memberships cm JOIN clubs c ON c.id = cm.club_id
             WHERE cm.id = ? AND c.admin_id = ?`, [req.params.membershipId, req.user.id]
        );
        if (!rows.length) return res.status(404).json({ success: false, message: "Membership request not found" });
        if (rows[0].status !== "PENDING") return res.status(400).json({ success: false, message: "Only pending requests can be reviewed" });
        await db.query("UPDATE club_memberships SET status = ?, reviewed_at = CURRENT_TIMESTAMP WHERE id = ?", [status, rows[0].id]);
        await createNotification(db, {
            userId: rows[0].student_id,
            type: "MEMBERSHIP_REVIEWED",
            title: `${rows[0].club_name} membership ${status.toLowerCase()}`,
            message: status === "APPROVED" ? "Your membership request was approved." : "Your membership request was rejected.",
            link: "/app/my-clubs"
        });
        res.json({ success: true, message: `Membership ${status.toLowerCase()}` });
    } catch (error) {
        console.error("Review membership error:", error);
        res.status(500).json({ success: false, message: "Server error while reviewing membership" });
    }
};

module.exports = {
    getAllClubs,
    getClubById,
    createClub,
    joinClub,
    getMyClubs,
    getClubMembers,
    listAdministeredClubs,
    reviewMembership
};