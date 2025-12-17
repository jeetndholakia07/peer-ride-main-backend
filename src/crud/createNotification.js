import Notification from "../models/Notification.js";
import { notificationTemplates } from "../utils/notificationTemplate.js";

const createNotification = async (type, userId, data) => {
    try {
        const { heading, message, linkId } = notificationTemplates[type](data);
        await Notification.create({
            user: userId,
            heading: heading,
            message: message,
            linkId: linkId || null
        });
    }
    catch (err) {
        console.error("Error creating notification:", err);
    }
}
export default createNotification;