const db = require("../config/db");

const getPlatformStats = async (req, res) => {
    try {
        const [[users]] = await db.query("SELECT COUNT(*) AS total_users FROM users");
        const [[clubs]] = await db.query("SELECT COUNT(*) AS total_clubs FROM clubs");
        const [[events]] = await db.query("SELECT COUNT(*) AS total_events FROM events");
        const [[registrations]] = await db.query("SELECT COUNT(*) AS total_registrations FROM event_registrations WHERE status <> 'CANCELLED'");
        const [[attendance]] = await db.query("SELECT COUNT(*) AS total_attendance FROM attendance WHERE status = 'PRESENT'");
        res.json({ success: true, statistics: { total_users: users.total_users, total_clubs: clubs.total_clubs, total_events: events.total_events, total_registrations: registrations.total_registrations, total_attendance: attendance.total_attendance } });
    } catch (error) {
        console.error("Platform statistics error:", error);
        res.status(500).json({ success: false, message: "Server error while fetching platform statistics" });
    }
};

module.exports = { getPlatformStats };
