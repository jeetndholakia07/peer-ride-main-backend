import Chat from "../../models/Chat.js";
import Message from "../../models/Message.js";

const getChatMessages = async (req, res) => {
    try {
        const { roomId } = req.query;
        const userId = req.user.id;

        if (!userId) {
            return res.status(400).json({ message: "User id not found" });
        };

        const chat = await Chat.findOne({ roomId });
        if (!chat) return res.status(404).json({ message: "Chat not found" });

        if (!chat.sender.equals(userId) && !chat.receiver.equals(userId)) {
            return res.status(403).json({ message: "Not authorized" });
        }

        if (!chat) return res.status(404).json({ message: "Chat not found" });

        const messages = await Message.findOne({ chat: chat._id });
        const sortedMessages = messages ? messages.messages.sort((a, b) => a.createdAt - b.createdAt) : [];
        res.status(200).json({ messages: sortedMessages });
    } catch (err) {
        console.error("Error fetching chat messages:", err);
        res.status(500).json({ message: "Server error" });
    }
};

export default getChatMessages;