import Chat from "../../models/Chat.js";
import UserProfile from "../../models/UserProfile.js";
import getProfileImg from "../../crud/getProfileImg.js";
import Message from "../../models/Message.js";

const getUserChats = async (req, res) => {
    try {
        const userId = req.user.id;
        if (!userId) {
            return res.status(400).json({ message: "User id not found" });
        }

        const chats = await Chat.find({
            $or: [{ sender: userId }, { receiver: userId }],
        })
            .populate("sender receiver", "username role")
            .select("roomId sender receiver updatedAt")
            .sort({ updatedAt: -1 });

        const response = await Promise.all(
            chats.map(async (chat) => {
                const isSender = chat.sender._id.toString() === userId;
                const otherUser = isSender ? chat.receiver : chat.sender;
                const currentUser = isSender ? chat.sender : chat.receiver;
                const otherProfile = await UserProfile.findOne({ user: otherUser._id });

                const otherProfileImg = await getProfileImg(
                    otherProfile.profileImg.publicId,
                    otherProfile.profileImg.format,
                    otherProfile.profileImg.isUpdated
                );

                const messageDoc = await Message.findOne({ chat: chat._id });

                const latestMessage = messageDoc
                    ? [...messageDoc.messages]
                        .sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt))
                        .pop() // Latest message
                    : null;

                // Count unread messages for current user
                const unreadCount = messageDoc
                    ? messageDoc.messages.filter(
                        (msg) => !msg.isRead && msg.senderId.toString() !== userId
                    ).length
                    : 0;

                return {
                    roomId: chat.roomId,
                    user: {
                        id: currentUser._id,
                        username: currentUser.username,
                        role: currentUser.role
                    },
                    otherUser: {
                        id: otherUser._id,
                        username: otherUser.username,
                        role: otherUser.role,
                        profileImg: otherProfileImg,
                    },
                    latestMessage: latestMessage,
                    unreadCount: unreadCount
                };
            })
        );

        res.status(200).json(response);
    } catch (err) {
        console.error("Error fetching user chats:", err);
        res.status(500).json({ message: "Server error" });
    }
};

export default getUserChats;
