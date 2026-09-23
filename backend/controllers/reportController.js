const db = require("../config/db");

// Get participation report for the logged-in student
const getMyParticipationReport = async (req, res) => {
    try {
        const studentId = req.user.id;

        const [report] = await db.query(
            `SELECT
                e.id AS event_id,
                e.title AS event_title,
                e.event_date,
                e.event_time,
                e.venue,
                c.name AS club_name,
                er.status AS registration_status,
                a.status AS attendance_status
             FROM event_registrations er
             JOIN events e
                ON er.event_id = e.id
             JOIN clubs c
                ON e.club_id = c.id
             LEFT JOIN attendance a
                ON er.event_id = a.event_id
                AND er.student_id = a.student_id
             WHERE er.student_id = ?
             ORDER BY e.event_date DESC`,
            [studentId]
        );

        const totalRegistered = report.length;

        const totalAttended = report.filter(
            item => item.attendance_status === "PRESENT"
        ).length;

        res.json({
            success: true,
            summary: {
                total_registered: totalRegistered,
                total_attended: totalAttended
            },
            report
        });

    } catch (error) {
        console.error("Participation report error:", error);

        res.status(500).json({
            success: false,
            message: "Server error while generating participation report"
        });
    }
};

module.exports = {
    getMyParticipationReport
};