const db = require("../config/db");

// Create Event
const createEvent = async (req, res) => {
    try {
        const {
            club_id,
            title,
            description,
            event_date,
            event_time,
            venue,
            capacity,
            eligibility
        } = req.body;

        // Validate required fields
        if (
            !club_id ||
            !title ||
            !event_date ||
            !event_time ||
            !venue ||
            !capacity
        ) {
            return res.status(400).json({
                success: false,
                message: "Club, title, date, time, venue and capacity are required"
            });
        }

        // Check if club exists and belongs to logged-in admin
        const [clubs] = await db.query(
            `SELECT id, name
             FROM clubs
             WHERE id = ? AND admin_id = ?`,
            [club_id, req.user.id]
        );

        if (clubs.length === 0) {
            return res.status(403).json({
                success: false,
                message: "You are not authorized to create an event for this club"
            });
        }

        // Create event
        const [result] = await db.query(
            `INSERT INTO events
            (
                club_id,
                title,
                description,
                event_date,
                event_time,
                venue,
                capacity,
                eligibility,
                status,
                created_by
            )
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [
                club_id,
                title,
                description || null,
                event_date,
                event_time,
                venue,
                capacity,
                eligibility || null,
                "DRAFT",
                req.user.id
            ]
        );

        res.status(201).json({
            success: true,
            message: "Event created successfully",
            event: {
                id: result.insertId,
                club_id,
                title,
                description: description || null,
                event_date,
                event_time,
                venue,
                capacity,
                eligibility: eligibility || null,
                status: "DRAFT",
                created_by: req.user.id
            }
        });

    } catch (error) {
        console.error("Create event error:", error);

        res.status(500).json({
            success: false,
            message: "Server error while creating event"
        });
    }
};


// Get All Published Events
const getAllEvents = async (req, res) => {
    try {
        const [events] = await db.query(
            `SELECT
                e.id,
                e.club_id,
                c.name AS club_name,
                e.title,
                e.description,
                e.event_date,
                e.event_time,
                e.venue,
                e.capacity,
                e.eligibility,
                e.status,
                e.created_by,
                e.created_at
             FROM events e
             JOIN clubs c ON e.club_id = c.id
             WHERE e.status = 'PUBLISHED'
             ORDER BY e.event_date ASC, e.event_time ASC`
        );

        res.json({
            success: true,
            events
        });

    } catch (error) {
        console.error("Get events error:", error);

        res.status(500).json({
            success: false,
            message: "Server error while fetching events"
        });
    }
};

const submitEventForApproval = async (req, res) => {
    try {
        const eventId = req.params.id;

        const [events] = await db.query(
            `SELECT e.id, e.status
             FROM events e
             JOIN clubs c ON e.club_id = c.id
             WHERE e.id = ? AND c.admin_id = ?`,
            [eventId, req.user.id]
        );

        if (events.length === 0) {
            return res.status(404).json({
                success: false,
                message: "Event not found or you are not the club admin"
            });
        }

        if (events[0].status !== "DRAFT") {
            return res.status(400).json({
                success: false,
                message: "Only draft events can be submitted for approval"
            });
        }

        await db.query(
            `UPDATE events
             SET status = 'PENDING_APPROVAL'
             WHERE id = ?`,
            [eventId]
        );

        res.json({
            success: true,
            message: "Event submitted for faculty approval"
        });

    } catch (error) {
        console.error("Submit event error:", error);

        res.status(500).json({
            success: false,
            message: "Server error while submitting event"
        });
    }
};

const getPendingEvents = async (req, res) => {
    try {
        const [events] = await db.query(
            `SELECT
                e.id,
                e.club_id,
                c.name AS club_name,
                e.title,
                e.description,
                e.event_date,
                e.event_time,
                e.venue,
                e.capacity,
                e.eligibility,
                e.status,
                e.created_by,
                e.created_at
             FROM events e
             JOIN clubs c ON e.club_id = c.id
             WHERE e.status = 'PENDING_APPROVAL'
             ORDER BY e.event_date ASC, e.event_time ASC`
        );

        res.json({
            success: true,
            events
        });

    } catch (error) {
        console.error("Get pending events error:", error);

        res.status(500).json({
            success: false,
            message: "Server error while fetching pending events"
        });
    }
};

const approveEvent = async (req, res) => {
    try {
        const eventId = req.params.id;

        const [events] = await db.query(
            `SELECT id, status
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

        if (events[0].status !== "PENDING_APPROVAL") {
            return res.status(400).json({
                success: false,
                message: "Only pending events can be approved"
            });
        }

        await db.query(
            `UPDATE events
             SET status = 'APPROVED',
                 approved_by = ?,
                 approved_at = CURRENT_TIMESTAMP
             WHERE id = ?`,
            [req.user.id, eventId]
        );

        res.json({
            success: true,
            message: "Event approved successfully"
        });

    } catch (error) {
        console.error("Approve event error:", error);

        res.status(500).json({
            success: false,
            message: "Server error while approving event"
        });
    }
};

const publishEvent = async (req, res) => {
    try {
        const eventId = req.params.id;

        const [events] = await db.query(
            `SELECT id, status
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

        if (events[0].status !== "APPROVED") {
            return res.status(400).json({
                success: false,
                message: "Only approved events can be published"
            });
        }

        await db.query(
            `UPDATE events
             SET status = 'PUBLISHED'
             WHERE id = ?`,
            [eventId]
        );

        res.json({
            success: true,
            message: "Event published successfully"
        });

    } catch (error) {
        console.error("Publish event error:", error);

        res.status(500).json({
            success: false,
            message: "Server error while publishing event"
        });
    }
};

module.exports = {
    createEvent,
    getAllEvents,
    submitEventForApproval,
    getPendingEvents,
    approveEvent,
    publishEvent
};