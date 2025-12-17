import Notification from "../../models/Notification.js";

const getNotificationCount = async (req, res) => {
    try {
        const userId = req.user.id;
        if (!userId) {
            return res.status(400).json({ message: "User id not found" });
        }
        const notificationCount = await Notification.countDocuments({ user: userId, isRead: false });
        res.status(200).json({ notificationCount });
    }
    catch (err) {
        console.error("Error getting notification count:", err);
        res.status(500).send();
    }
}
export default getNotificationCount;