import Chat from "../../models/Chat.js";
import Message from "../../models/Message.js";

const getTotalUnreadCount = async (req, res) => {
    try {
        const userId = req.user.id;

        if (!userId) {
            return res.status(400).json({ message: "User id not found" });
        }

        // Find all chat IDs where user is sender or receiver
        const userChats = await Chat.find({
            $or: [{ sender: userId }, { receiver: userId }],
        }).select("_id");

        if (!userChats.length) {
            return res.status(200).json({ totalUnread: 0 });
        }

        const chatIds = userChats.map((chat) => chat._id);

        // Aggregate unread messages across all those chats
        const unreadAggregation = await Message.aggregate([
            { $match: { chat: { $in: chatIds } } },
            { $unwind: "$messages" },
            {
                $match: {
                    "messages.isRead": false,
                    "messages.senderId": { $ne: userId },
                },
            },
            {
                $count: "totalUnread",
            },
        ]);

        const totalUnreadCount = unreadAggregation.length > 0 ? unreadAggregation[0].totalUnread : 0;

        res.status(200).json({ totalUnreadCount: totalUnreadCount });
    } catch (err) {
        console.error("Error fetching total unread count:", err);
        res.status(500).json({ message: "Server error" });
    }
};

export default getTotalUnreadCount;