const db = require("../config/db");

const getRecommendations = async (req, res) => {
    try {
        const studentId = req.user.id;

        const [recommendations] = await db.query(
            `SELECT DISTINCT
                e.id AS event_id,
                e.title,
                e.description,
                e.event_date,
                e.event_time,
                e.venue,
                c.id AS club_id,
                c.name AS club_name
             FROM events e
             JOIN clubs c
                ON e.club_id = c.id
             JOIN club_memberships cm
                ON c.id = cm.club_id
             WHERE cm.student_id = ?
             AND e.status = 'PUBLISHED'
             ORDER BY e.event_date ASC`,
            [studentId]
        );

        res.json({
            success: true,
            recommendations
        });

    } catch (error) {
        console.error("Recommendation error:", error);

        res.status(500).json({
            success: false,
            message: "Server error while generating recommendations"
        });
    }
};

module.exports = {
    getRecommendations
};