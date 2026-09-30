const db = require("../config/db");

const getMyParticipation = async (req, res) => {
    try {
        const [summaryRows] = await db.query(
            `SELECT COUNT(DISTINCT r.id) AS total_registered,
                    COUNT(DISTINCT CASE WHEN a.status = 'PRESENT' THEN r.id END) AS total_attended
             FROM event_registrations r LEFT JOIN attendance a ON a.event_id = r.event_id AND a.student_id = r.student_id
             WHERE r.student_id = ? AND r.status <> 'CANCELLED'`, [req.user.id]
        );
        const [report] = await db.query(
            `SELECT r.event_id, r.status AS registration_status, a.status AS attendance_status,
                    e.title, e.event_date, e.event_time, e.venue, c.name AS club_name
             FROM event_registrations r JOIN events e ON e.id = r.event_id JOIN clubs c ON c.id = e.club_id
             LEFT JOIN attendance a ON a.event_id = r.event_id AND a.student_id = r.student_id
             WHERE r.student_id = ? AND r.status <> 'CANCELLED' ORDER BY e.event_date DESC`, [req.user.id]
        );
        res.json({ success: true, summary: summaryRows[0], report });
    } catch (error) {
        console.error("Participation report error:", error);
        res.status(500).json({ success: false, message: "Server error while building participation report" });
    }
};

module.exports = { getMyParticipation };
