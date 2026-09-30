const db = require("../config/db");

const createNotification = async (connection, { userId, type, title, message, link = null }) => {
    await connection.query(
        `INSERT INTO notifications (user_id, type, title, message, link)
         VALUES (?, ?, ?, ?, ?)`,
        [userId, type, title, message, link]
    );
};

const listNotifications = async (req, res) => {
    try {
        const [notifications] = await db.query(
            `SELECT id, user_id, type, title, message, link, is_read, created_at
             FROM notifications WHERE user_id = ? ORDER BY created_at DESC`,
            [req.user.id]
        );
        res.json({ success: true, notifications });
    } catch (error) {
        console.error("List notifications error:", error);
        res.status(500).json({ success: false, message: "Server error while fetching notifications" });
    }
};

const markNotificationRead = async (req, res) => {
    try {
        const [result] = await db.query(
            "UPDATE notifications SET is_read = TRUE WHERE id = ? AND user_id = ?",
            [req.params.id, req.user.id]
        );
        if (result.affectedRows === 0) return res.status(404).json({ success: false, message: "Notification not found" });
        res.json({ success: true, message: "Notification marked as read" });
    } catch (error) {
        console.error("Mark notification error:", error);
        res.status(500).json({ success: false, message: "Server error while updating notification" });
    }
};

module.exports = { createNotification, listNotifications, markNotificationRead };
