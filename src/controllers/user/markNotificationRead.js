import Notification from "../../models/Notification.js";

const markNotificationRead = async (req, res) => {
    try {
        const userId = req.user.id;
        if (!userId) {
            return res.status(400).json({ message: "User id not found" });
        }

        const { id } = req.body;
        if (!id) {
            return res.status(400).json({ message: "Notification id not found" });
        }

        const result = await Notification.updateOne(
            { _id: id, user: userId },
            { $set: { isRead: true } }
        );

        if (result.modifiedCount === 0) {
            return res.status(404).json({ message: "Notification not found or already marked as read" });
        }

        res.status(200).send();
    }
    catch (err) {
        console.error("Error marking notification read:", err);
        res.status(500).send();
    }
}

export default markNotificationRead;