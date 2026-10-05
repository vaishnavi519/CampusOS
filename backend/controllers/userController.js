const bcrypt = require("bcrypt");
const db = require("../config/db");

const listUsers = async (req, res) => {
    try {
        const [users] = await db.query(
            `SELECT
                u.id,
                u.name,
                u.email,
                u.role,
                u.created_at,
                (SELECT COUNT(*)
                 FROM clubs c
                 WHERE c.admin_id = u.id) AS clubs_administered,
                (SELECT COUNT(*)
                 FROM club_memberships m
                 WHERE m.student_id = u.id) AS memberships,
                (SELECT COUNT(*)
                 FROM event_registrations r
                 WHERE r.student_id = u.id) AS registrations
             FROM users u
             ORDER BY u.name ASC`
        );

        res.json({
            success: true,
            users
        });
    } catch (error) {
        console.error("List users error:", error);

        res.status(500).json({
            success: false,
            message: "Server error while fetching users"
        });
    }
};

const listCoordinators = async (req, res) => {
    try {
        const [coordinators] = await db.query(
            `SELECT id, name
             FROM users
             WHERE role = 'FACULTY_COORDINATOR'
             ORDER BY name ASC`
        );

        res.json({
            success: true,
            coordinators
        });
    } catch (error) {
        console.error("List coordinators error:", error);

        res.status(500).json({
            success: false,
            message: "Server error while fetching coordinators"
        });
    }
};

const createUser = async (req, res) => {
    try {
        const {
            name,
            email,
            password,
            role
        } = req.body;

        const cleanName = String(name || "").trim();
        const normalizedEmail = String(email || "")
            .trim()
            .toLowerCase();

        const allowedRoles = [
            "STUDENT",
            "CLUB_ADMIN",
            "FACULTY_COORDINATOR",
            "SYSTEM_ADMIN"
        ];

        if (
            !cleanName ||
            !normalizedEmail ||
            !password ||
            !role
        ) {
            return res.status(400).json({
                success: false,
                message: "Name, email, password and role are required"
            });
        }

        if (!allowedRoles.includes(role)) {
            return res.status(400).json({
                success: false,
                message: "Invalid account role"
            });
        }

        if (password.length < 8) {
            return res.status(400).json({
                success: false,
                message: "Password must be at least 8 characters"
            });
        }

        const [existingUsers] = await db.query(
            "SELECT id FROM users WHERE email = ?",
            [normalizedEmail]
        );

        if (existingUsers.length > 0) {
            return res.status(409).json({
                success: false,
                message: "An account with this email already exists"
            });
        }

        const hashedPassword = await bcrypt.hash(
            password,
            10
        );

        const [result] = await db.query(
            `INSERT INTO users
                (name, email, password, role)
             VALUES
                (?, ?, ?, ?)`,
            [
                cleanName,
                normalizedEmail,
                hashedPassword,
                role
            ]
        );

        res.status(201).json({
            success: true,
            message: "Account created successfully",
            user: {
                id: result.insertId,
                name: cleanName,
                email: normalizedEmail,
                role
            }
        });
    } catch (error) {
        console.error("Create user error:", error);

        res.status(500).json({
            success: false,
            message: "Server error while creating account"
        });
    }
};

/*
 * System Admin password reset
 *
 * Only another System Admin can use this endpoint.
 * The password is always bcrypt-hashed before being stored.
 */
const resetUserPassword = async (req, res) => {
    try {
        const targetUserId = Number(req.params.id);
        const { password } = req.body;

        if (!Number.isInteger(targetUserId) || targetUserId <= 0) {
            return res.status(400).json({
                success: false,
                message: "Invalid user ID"
            });
        }

        if (!password) {
            return res.status(400).json({
                success: false,
                message: "New password is required"
            });
        }

        if (password.length < 8) {
            return res.status(400).json({
                success: false,
                message: "Password must be at least 8 characters"
            });
        }

        /*
         * This feature is specifically for resetting
         * OTHER accounts.
         */
        if (Number(req.user.id) === targetUserId) {
            return res.status(400).json({
                success: false,
                message: "You cannot reset your own password here"
            });
        }

        const [users] = await db.query(
            `SELECT id, name, email, role
             FROM users
             WHERE id = ?`,
            [targetUserId]
        );

        if (users.length === 0) {
            return res.status(404).json({
                success: false,
                message: "User account not found"
            });
        }

        const hashedPassword = await bcrypt.hash(
            password,
            10
        );

        await db.query(
            `UPDATE users
             SET password = ?
             WHERE id = ?`,
            [
                hashedPassword,
                targetUserId
            ]
        );

        res.json({
            success: true,
            message: `Password reset successfully for ${users[0].name}`,
            user: {
                id: users[0].id,
                name: users[0].name,
                email: users[0].email,
                role: users[0].role
            }
        });
    } catch (error) {
        console.error("Reset user password error:", error);

        res.status(500).json({
            success: false,
            message: "Server error while resetting password"
        });
    }
};

module.exports = {
    listUsers,
    listCoordinators,
    createUser,
    resetUserPassword
};