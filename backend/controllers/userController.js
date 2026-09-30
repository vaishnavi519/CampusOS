const db = require("../config/db");

const listUsers = async (req, res) => {
    try {
        const [users] = await db.query(
            `SELECT u.id, u.name, u.email, u.role, u.created_at,
                    (SELECT COUNT(*) FROM clubs c WHERE c.admin_id = u.id) AS clubs_administered,
                    (SELECT COUNT(*) FROM club_memberships m WHERE m.student_id = u.id) AS memberships,
                    (SELECT COUNT(*) FROM event_registrations r WHERE r.student_id = u.id) AS registrations
             FROM users u ORDER BY u.name ASC`
        );
        res.json({ success: true, users });
    } catch (error) {
        console.error("List users error:", error);
        res.status(500).json({ success: false, message: "Server error while fetching users" });
    }
};

const listCoordinators = async (req, res) => {
    try {
        const [coordinators] = await db.query("SELECT id, name FROM users WHERE role = 'FACULTY_COORDINATOR' ORDER BY name ASC");
        res.json({ success: true, coordinators });
    } catch (error) {
        console.error("List coordinators error:", error);
        res.status(500).json({ success: false, message: "Server error while fetching coordinators" });
    }
};

module.exports = { listUsers, listCoordinators };
