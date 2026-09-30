const db = require("../config/db");

const listRecommendations = async (req, res) => {
    try {
        const [recommendations] = await db.query(
            `SELECT e.id AS event_id, e.title, e.club_id, c.name AS club_name,
                    e.event_date, e.event_time, e.venue,
                    CASE WHEN m.club_id IS NOT NULL THEN 'From a club you joined' ELSE 'Popular upcoming event' END AS reason
             FROM events e JOIN clubs c ON c.id = e.club_id
             LEFT JOIN club_memberships m ON m.club_id = e.club_id AND m.student_id = ? AND m.status = 'APPROVED'
             WHERE e.status = 'PUBLISHED' AND e.event_date >= CURRENT_DATE
               AND NOT EXISTS (SELECT 1 FROM event_registrations r WHERE r.event_id = e.id AND r.student_id = ? AND r.status <> 'CANCELLED')
             ORDER BY (m.club_id IS NOT NULL) DESC, e.event_date ASC, e.event_time ASC LIMIT 20`, [req.user.id, req.user.id]
        );
        res.json({ success: true, recommendations });
    } catch (error) {
        console.error("Recommendations error:", error);
        res.status(500).json({ success: false, message: "Server error while fetching recommendations" });
    }
};

module.exports = { listRecommendations };
