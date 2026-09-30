const db = require("../config/db");
const { createNotification } = require("./notificationController");

const registerForEvent = async (req, res) => {
    const connection = await db.getConnection();
    try {
        await connection.beginTransaction();
        const [events] = await connection.query(
            `SELECT e.id, e.title, e.capacity, e.club_id, c.admin_id
             FROM events e JOIN clubs c ON c.id = e.club_id
             WHERE e.id = ? AND e.status = 'PUBLISHED' FOR UPDATE`,
            [req.params.id]
        );
        if (events.length === 0) return res.status(404).json({ success: false, message: "Published event not found" });
        const event = events[0];
        const [existing] = await connection.query(
            "SELECT id, status FROM event_registrations WHERE event_id = ? AND student_id = ? FOR UPDATE",
            [event.id, req.user.id]
        );
        if (existing.length && existing[0].status !== "CANCELLED") {
            await connection.rollback();
            return res.status(409).json({ success: false, message: "You are already registered for this event" });
        }
        const [countRows] = await connection.query(
            "SELECT COUNT(*) AS count FROM event_registrations WHERE event_id = ? AND status = 'REGISTERED'",
            [event.id]
        );
        const status = Number(countRows[0].count) < Number(event.capacity) ? "REGISTERED" : "WAITLISTED";
        let result;
        if (existing.length) {
            [result] = await connection.query(
                `UPDATE event_registrations SET status = ?, registered_at = CURRENT_TIMESTAMP, cancelled_at = NULL
                 WHERE id = ?`, [status, existing[0].id]
            );
        } else {
            [result] = await connection.query(
                `INSERT INTO event_registrations (event_id, student_id, status) VALUES (?, ?, ?)`,
                [event.id, req.user.id, status]
            );
        }
        await createNotification(connection, {
            userId: req.user.id,
            type: "EVENT_REGISTRATION",
            title: status === "REGISTERED" ? "Event registration confirmed" : "Added to event waitlist",
            message: `${status === "REGISTERED" ? "You are registered for" : "You are waitlisted for"} ${event.title}.`,
            link: `/app/events/${event.id}`
        });
        await connection.commit();
        res.status(201).json({ success: true, registration: { id: existing[0]?.id ?? result.insertId, event_id: event.id, student_id: req.user.id, status } });
    } catch (error) {
        await connection.rollback();
        console.error("Register event error:", error);
        res.status(500).json({ success: false, message: "Server error while registering for event" });
    } finally { connection.release(); }
};

const listMyRegistrations = async (req, res) => {
    try {
        const [registrations] = await db.query(
            `SELECT r.id, r.event_id, r.student_id, r.status, r.registered_at, r.cancelled_at,
                    e.title, e.event_date, e.event_time, e.venue, e.capacity, e.club_id, c.name AS club_name,
                    a.status AS attendance_status
             FROM event_registrations r JOIN events e ON e.id = r.event_id JOIN clubs c ON c.id = e.club_id
             LEFT JOIN attendance a ON a.event_id = r.event_id AND a.student_id = r.student_id
             WHERE r.student_id = ? ORDER BY e.event_date ASC, e.event_time ASC`,
            [req.user.id]
        );
        res.json({ success: true, registrations });
    } catch (error) {
        console.error("List registrations error:", error);
        res.status(500).json({ success: false, message: "Server error while fetching registrations" });
    }
};

const cancelRegistration = async (req, res) => {
    const connection = await db.getConnection();
    try {
        await connection.beginTransaction();
        const [rows] = await connection.query(
            `SELECT r.id, r.event_id, r.status, e.title FROM event_registrations r JOIN events e ON e.id = r.event_id
             WHERE r.id = ? AND r.student_id = ? FOR UPDATE`, [req.params.registrationId, req.user.id]
        );
        if (!rows.length) return res.status(404).json({ success: false, message: "Registration not found" });
        if (rows[0].status === "CANCELLED") return res.status(400).json({ success: false, message: "Registration is already cancelled" });
        await connection.query("UPDATE event_registrations SET status = 'CANCELLED', cancelled_at = CURRENT_TIMESTAMP WHERE id = ?", [rows[0].id]);
        const [waitlisted] = await connection.query(
            `SELECT id, student_id FROM event_registrations WHERE event_id = ? AND status = 'WAITLISTED'
             ORDER BY registered_at ASC LIMIT 1 FOR UPDATE`, [rows[0].event_id]
        );
        if (waitlisted.length) {
            await connection.query("UPDATE event_registrations SET status = 'REGISTERED' WHERE id = ?", [waitlisted[0].id]);
            await createNotification(connection, { userId: waitlisted[0].student_id, type: "EVENT_REGISTRATION", title: "Event seat available", message: `A seat is now available for ${rows[0].title}.`, link: `/app/events/${rows[0].event_id}` });
        }
        await connection.commit();
        res.json({ success: true, message: "Registration cancelled" });
    } catch (error) {
        await connection.rollback();
        console.error("Cancel registration error:", error);
        res.status(500).json({ success: false, message: "Server error while cancelling registration" });
    } finally { connection.release(); }
};

const listEventRegistrations = async (req, res) => {
    try {
        const [events] = await db.query("SELECT e.id, e.title, e.capacity, e.club_id FROM events e JOIN clubs c ON c.id = e.club_id WHERE e.id = ? AND c.admin_id = ?", [req.params.id, req.user.id]);
        if (!events.length) return res.status(404).json({ success: false, message: "Event not found or not administered by you" });
        const [registrations] = await db.query(
            `SELECT r.id AS registration_id, r.student_id, u.name AS student_name, u.email AS student_email, r.status, r.registered_at
             FROM event_registrations r JOIN users u ON u.id = r.student_id WHERE r.event_id = ? ORDER BY r.registered_at ASC`, [req.params.id]
        );
        res.json({ success: true, event: events[0], registrations });
    } catch (error) {
        console.error("List event registrations error:", error);
        res.status(500).json({ success: false, message: "Server error while fetching event registrations" });
    }
};

module.exports = { registerForEvent, listMyRegistrations, cancelRegistration, listEventRegistrations };
