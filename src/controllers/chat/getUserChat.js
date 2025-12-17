import Chat from "../../models/Chat.js";
import UserProfile from "../../models/UserProfile.js";
import getProfileImg from "../../crud/getProfileImg.js";

const getUserChat = async (req, res) => {
    try {
        const userId = req.user.id;
        if (!userId) {
            return res.status(400).json({ message: "User id not found" });
        };
        const { roomId } = req.query;
        if (!roomId) {
            return res.status(400).json({ message: "Room id not found" });
        }
        const chat = await Chat.findOne({ roomId: roomId })
            .populate("sender receiver", "username role")
            .select("roomId sender receiver updatedAt");
        if (!chat) {
            return res.status(404).json({ message: "Chat doesn't exist" });
        }
        const isSender = chat.sender._id.toString() === userId;
        const otherUser = isSender ? chat.receiver : chat.sender;
        const currentUser = isSender ? chat.sender : chat.receiver;
        const otherProfile = await UserProfile.findOne({ user: otherUser._id });
        const otherProfileImg = await getProfileImg(
            otherProfile.profileImg.publicId,
            otherProfile.profileImg.format,
            otherProfile.profileImg.isUpdated
        );
        const response = {
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
            }
        };

        res.status(200).json(response);
    } catch (err) {
        console.error("Error fetching user chats:", err);
        res.status(500).json({ message: "Server error" });
    }
};

export default getUserChat;