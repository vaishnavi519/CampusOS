const db = require("../config/db");

// Mark attendance for a student
const markAttendance = async (req, res) => {
    try {
        const markedBy = req.user.id;
        const eventId = req.params.id;
        const { student_id, status } = req.body;

        if (!student_id || !status) {
            return res.status(400).json({
                success: false,
                message: "student_id and status are required"
            });
        }

        if (!["PRESENT", "ABSENT"].includes(status)) {
            return res.status(400).json({
                success: false,
                message: "Status must be PRESENT or ABSENT"
            });
        }

        const [events] = await db.query(
            `SELECT e.id, e.title
             FROM events e
             JOIN clubs c ON e.club_id = c.id
             WHERE e.id = ?
             AND c.admin_id = ?`,
            [eventId, markedBy]
        );

        if (events.length === 0) {
            return res.status(404).json({
                success: false,
                message: "Event not found or you do not own this event"
            });
        }

        const [registrations] = await db.query(
            `SELECT id
             FROM event_registrations
             WHERE event_id = ?
             AND student_id = ?
             AND status = 'REGISTERED'`,
            [eventId, student_id]
        );

        if (registrations.length === 0) {
            return res.status(400).json({
                success: false,
                message: "Student is not registered for this event"
            });
        }

        const [existingAttendance] = await db.query(
            `SELECT id
             FROM attendance
             WHERE event_id = ?
             AND student_id = ?`,
            [eventId, student_id]
        );

        if (existingAttendance.length > 0) {
            await db.query(
                `UPDATE attendance
                 SET status = ?,
                     marked_by = ?,
                     marked_at = CURRENT_TIMESTAMP
                 WHERE id = ?`,
                [status, markedBy, existingAttendance[0].id]
            );

            return res.json({
                success: true,
                message: "Attendance updated successfully"
            });
        }

        const [result] = await db.query(
            `INSERT INTO attendance
             (event_id, student_id, status, marked_by)
             VALUES (?, ?, ?, ?)`,
            [eventId, student_id, status, markedBy]
        );

        res.status(201).json({
            success: true,
            message: "Attendance marked successfully",
            attendance: {
                id: result.insertId,
                event_id: eventId,
                student_id,
                status,
                marked_by: markedBy
            }
        });

    } catch (error) {
        console.error("Mark attendance error:", error);

        res.status(500).json({
            success: false,
            message: "Server error while marking attendance"
        });
    }
};


// Get attendance for an event
const getEventAttendance = async (req, res) => {
    try {
        const adminId = req.user.id;
        const eventId = req.params.id;

        const [events] = await db.query(
            `SELECT e.id, e.title
             FROM events e
             JOIN clubs c ON e.club_id = c.id
             WHERE e.id = ?
             AND c.admin_id = ?`,
            [eventId, adminId]
        );

        if (events.length === 0) {
            return res.status(404).json({
                success: false,
                message: "Event not found or you do not own this event"
            });
        }

        const [attendance] = await db.query(
            `SELECT
                a.id,
                a.student_id,
                u.name AS student_name,
                u.email AS student_email,
                a.status,
                a.marked_by,
                a.marked_at
             FROM attendance a
             JOIN users u ON a.student_id = u.id
             WHERE a.event_id = ?
             ORDER BY u.name ASC`,
            [eventId]
        );

        res.json({
            success: true,
            event: events[0],
            attendance
        });

    } catch (error) {
        console.error("Get attendance error:", error);

        res.status(500).json({
            success: false,
            message: "Server error while fetching attendance"
        });
    }
};


module.exports = {
    markAttendance,
    getEventAttendance
};