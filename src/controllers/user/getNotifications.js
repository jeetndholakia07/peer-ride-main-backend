import Notification from "../../models/Notification.js";

const getNotifications = async (req, res) => {
    try {
        const { page = 1, limit = 5, isRead } = req.query;
        const skip = (page - 1) * limit;
        const userId = req.user.id;
        let query = { user: userId };
        if (!userId) {
            return res.status(404).json({ message: "User id not found" });
        }
        if (typeof isRead !== "undefined") {
            if (isRead === "true") {
                query.isRead = true;
            } else if (isRead === "false") {
                query.isRead = false;
            }
        }
        const totalNotifications = await Notification.countDocuments(query);
        const userNotifications = await Notification.find(query)
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit);

        const totalPages = Math.ceil(totalNotifications / limit);

        const response = {
            page,
            limit,
            totalItems: totalNotifications,
            totalPages,
            data: userNotifications
        };

        res.status(200).json(response);
    }
    catch (err) {
        console.error("Error getting user notifications:", err);
        res.status(500).send();
    }
}
export default getNotifications;