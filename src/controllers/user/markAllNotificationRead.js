import Notification from "../../models/Notification.js";

const markAllNotificationsAsRead = async (req, res) => {
    try {
        const userId = req.user.id;
        if (!userId) {
            return res.status(400).json({ message: "User id not found" });
        }
        await Notification.updateMany(
            { user: userId, isRead: false }, // Filter notifications for a user that are unread
            { $set: { isRead: true } }       // Set isRead to true
        );
        res.status(200).send();
    } catch (err) {
        console.error("Error marking notifications as read:", err);
        res.status(500).send();
    }
};

export default markAllNotificationsAsRead;