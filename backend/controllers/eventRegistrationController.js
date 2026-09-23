const db = require("../config/db");

// Register a student for an event
const registerForEvent = async (req, res) => {
    try {
        const studentId = req.user.id;
        const eventId = req.params.id;

        // Check whether event exists and is published
        const [events] = await db.query(
            `SELECT id, title, capacity, status
             FROM events
             WHERE id = ?`,
            [eventId]
        );

        if (events.length === 0) {
            return res.status(404).json({
                success: false,
                message: "Event not found"
            });
        }

        const event = events[0];

        if (event.status !== "PUBLISHED") {
            return res.status(400).json({
                success: false,
                message: "Only published events can be registered for"
            });
        }

        // Check existing registration
        const [existingRegistrations] = await db.query(
            `SELECT id, status
             FROM event_registrations
             WHERE event_id = ? AND student_id = ?`,
            [eventId, studentId]
        );

        if (
            existingRegistrations.length > 0 &&
            existingRegistrations[0].status === "REGISTERED"
        ) {
            return res.status(409).json({
                success: false,
                message: "You are already registered for this event"
            });
        }

        // Check current registration count
        const [registrationCount] = await db.query(
            `SELECT COUNT(*) AS registered_count
             FROM event_registrations
             WHERE event_id = ?
             AND status = 'REGISTERED'`,
            [eventId]
        );

        if (registrationCount[0].registered_count >= event.capacity) {
            return res.status(400).json({
                success: false,
                message: "Event capacity is full"
            });
        }

        // If a previous registration was cancelled, reactivate it
        if (
            existingRegistrations.length > 0 &&
            existingRegistrations[0].status === "CANCELLED"
        ) {
            await db.query(
                `UPDATE event_registrations
                 SET status = 'REGISTERED',
                     registered_at = CURRENT_TIMESTAMP,
                     cancelled_at = NULL
                 WHERE id = ?`,
                [existingRegistrations[0].id]
            );

            return res.status(200).json({
                success: true,
                message: "Event registration restored successfully"
            });
        }

        // Create new registration
        const [result] = await db.query(
            `INSERT INTO event_registrations
             (event_id, student_id, status)
             VALUES (?, ?, 'REGISTERED')`,
            [eventId, studentId]
        );

        res.status(201).json({
            success: true,
            message: "Event registration successful",
            registration: {
                id: result.insertId,
                event_id: eventId,
                student_id: studentId,
                status: "REGISTERED"
            }
        });

    } catch (error) {
        console.error("Event registration error:", error);

        res.status(500).json({
            success: false,
            message: "Server error during event registration"
        });
    }
};


// Get student's registrations
const getMyRegistrations = async (req, res) => {
    try {
        const studentId = req.user.id;

        const [registrations] = await db.query(
            `SELECT
                er.id,
                er.event_id,
                er.status,
                er.registered_at,
                er.cancelled_at,
                e.title,
                e.description,
                e.event_date,
                e.event_time,
                e.venue,
                e.capacity,
                c.name AS club_name
             FROM event_registrations er
             JOIN events e ON er.event_id = e.id
             JOIN clubs c ON e.club_id = c.id
             WHERE er.student_id = ?
             ORDER BY e.event_date ASC, e.event_time ASC`,
            [studentId]
        );

        res.json({
            success: true,
            registrations
        });

    } catch (error) {
        console.error("Get registrations error:", error);

        res.status(500).json({
            success: false,
            message: "Server error while fetching registrations"
        });
    }
};


// Cancel event registration
const cancelRegistration = async (req, res) => {
    try {
        const studentId = req.user.id;
        const registrationId = req.params.registrationId;

        const [registrations] = await db.query(
            `SELECT id
             FROM event_registrations
             WHERE id = ?
             AND student_id = ?
             AND status = 'REGISTERED'`,
            [registrationId, studentId]
        );

        if (registrations.length === 0) {
            return res.status(404).json({
                success: false,
                message: "Active registration not found"
            });
        }

        await db.query(
            `UPDATE event_registrations
             SET status = 'CANCELLED',
                 cancelled_at = CURRENT_TIMESTAMP
             WHERE id = ?`,
            [registrationId]
        );

        res.json({
            success: true,
            message: "Event registration cancelled successfully"
        });

    } catch (error) {
        console.error("Cancel registration error:", error);

        res.status(500).json({
            success: false,
            message: "Server error while cancelling registration"
        });
    }
};


// Get registrations for a club admin's event
const getEventRegistrations = async (req, res) => {
    try {
        const adminId = req.user.id;
        const eventId = req.params.id;

        // Verify event belongs to a club owned by this admin
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

        const [registrations] = await db.query(
            `SELECT
                er.id,
                er.student_id,
                u.name AS student_name,
                u.email AS student_email,
                er.status,
                er.registered_at,
                er.cancelled_at
             FROM event_registrations er
             JOIN users u ON er.student_id = u.id
             WHERE er.event_id = ?
             ORDER BY er.registered_at ASC`,
            [eventId]
        );

        res.json({
            success: true,
            event: events[0],
            registrations
        });

    } catch (error) {
        console.error("Get event registrations error:", error);

        res.status(500).json({
            success: false,
            message: "Server error while fetching event registrations"
        });
    }
};


module.exports = {
    registerForEvent,
    getMyRegistrations,
    cancelRegistration,
    getEventRegistrations
};