const db = require("../config/db");

const checkAdminEvent = async (eventId, userId) => {
    const [rows] = await db.query("SELECT e.id FROM events e JOIN clubs c ON c.id = e.club_id WHERE e.id = ? AND c.admin_id = ?", [eventId, userId]);
    return rows.length > 0;
};

const listAttendance = async (req, res) => {
    try {
        if (!(await checkAdminEvent(req.params.id, req.user.id))) return res.status(403).json({ success: false, message: "You do not administer this event" });
        const [attendance] = await db.query("SELECT student_id, status, marked_at FROM attendance WHERE event_id = ? ORDER BY marked_at DESC", [req.params.id]);
        res.json({ success: true, attendance });
    } catch (error) {
        console.error("List attendance error:", error);
        res.status(500).json({ success: false, message: "Server error while fetching attendance" });
    }
};

const markAttendance = async (req, res) => {
    try {
        const { student_id, status } = req.body;
        if (!student_id || !["PRESENT", "ABSENT"].includes(status)) return res.status(400).json({ success: false, message: "Student and valid attendance status are required" });
        if (!(await checkAdminEvent(req.params.id, req.user.id))) return res.status(403).json({ success: false, message: "You do not administer this event" });
        const [registered] = await db.query("SELECT id FROM event_registrations WHERE event_id = ? AND student_id = ? AND status = 'REGISTERED'", [req.params.id, student_id]);
        if (!registered.length) return res.status(400).json({ success: false, message: "Student is not registered for this event" });
        await db.query(
            `INSERT INTO attendance (event_id, student_id, status) VALUES (?, ?, ?)
             ON DUPLICATE KEY UPDATE status = VALUES(status), marked_at = CURRENT_TIMESTAMP`,
            [req.params.id, student_id, status]
        );
        res.json({ success: true, message: "Attendance saved" });
    } catch (error) {
        console.error("Mark attendance error:", error);
        res.status(500).json({ success: false, message: "Server error while saving attendance" });
    }
};

module.exports = { listAttendance, markAttendance };
