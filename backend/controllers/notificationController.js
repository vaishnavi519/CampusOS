const db = require("../config/db");

// Get notifications for the logged-in user
const getMyNotifications = async (req, res) => {
    try {
        const userId = req.user.id;

        const [notifications] = await db.query(
            `SELECT
                id,
                title,
                message,
                type,
                is_read,
                created_at
             FROM notifications
             WHERE user_id = ?
             ORDER BY created_at DESC`,
            [userId]
        );

        res.json({
            success: true,
            notifications
        });

    } catch (error) {
        console.error("Get notifications error:", error);

        res.status(500).json({
            success: false,
            message: "Server error while fetching notifications"
        });
    }
};


// Mark a notification as read
const markNotificationAsRead = async (req, res) => {
    try {
        const userId = req.user.id;
        const notificationId = req.params.id;

        const [result] = await db.query(
            `UPDATE notifications
             SET is_read = 1
             WHERE id = ?
             AND user_id = ?`,
            [notificationId, userId]
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({
                success: false,
                message: "Notification not found"
            });
        }

        res.json({
            success: true,
            message: "Notification marked as read"
        });

    } catch (error) {
        console.error("Mark notification error:", error);

        res.status(500).json({
            success: false,
            message: "Server error while updating notification"
        });
    }
};


module.exports = {
    getMyNotifications,
    markNotificationAsRead
};